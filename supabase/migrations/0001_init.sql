-- Sankofa Passport: schema, row-level security and RPCs (migration 0001).
-- Answer keys are never in the repo: see supabase/private (gitignored).

create extension if not exists pgcrypto with schema extensions;

-- ---------- tables ----------
create table public.questions (
  id      text primary key,
  bank    text not null,                      -- profession slug, or 'workplace'
  skill   text not null,
  prompt  text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  version int  not null default 1,
  sort    int  not null default 0
);

create table public.answer_keys (
  question_id text primary key references public.questions(id) on delete cascade,
  correct     int  not null check (correct >= 0),
  explanation text
);

create table public.passports (
  id             uuid primary key default gen_random_uuid(),
  public_code    text not null unique,
  display_name   text not null,
  origin_country text,
  languages      text[] not null default '{}',
  profession     text not null,
  qualification  jsonb not null default '{}'::jsonb,
  document_status text not null check (document_status in ('full','partial','none')),
  experience     jsonb not null default '[]'::jsonb,
  results        jsonb not null,
  overall_level  text not null check (overall_level in ('proficient','developing','bridging')),
  readiness      jsonb not null default '{}'::jsonb,
  issued_at      timestamptz not null default now(),
  expires_at     timestamptz not null,
  status         text not null default 'valid' check (status in ('valid','revoked')),
  record_hash    text not null
);

-- ---------- row-level security ----------
alter table public.questions   enable row level security;
alter table public.answer_keys enable row level security;
alter table public.passports   enable row level security;

revoke all on public.questions, public.answer_keys, public.passports from anon, authenticated;

-- Only the questions are readable directly. answer_keys and passports have
-- RLS on, no policies and no grants: reachable only through the RPCs below.
grant select on public.questions to anon, authenticated;
create policy "questions are public" on public.questions
  for select to anon, authenticated using (true);

-- ---------- integrity hash ----------
create or replace function public.passport_hash(p public.passports)
returns text
language sql stable
set search_path = public, extensions
as $$
  select encode(digest(
    jsonb_build_object(
      'code',          p.public_code,
      'name',          p.display_name,
      'country',       p.origin_country,
      'languages',     to_jsonb(p.languages),
      'profession',    p.profession,
      'qualification', p.qualification,
      'documents',     p.document_status,
      'experience',    p.experience,
      'results',       p.results,
      'overall',       p.overall_level,
      'readiness',     p.readiness,
      'issued',        to_char(p.issued_at  at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'expires',       to_char(p.expires_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
    )::text, 'sha256'), 'hex')
$$;

-- ---------- verify (public, read-only) ----------
create or replace function public.verify_passport(code text)
returns jsonb
language plpgsql stable security definer
set search_path = public, extensions
as $$
declare
  p public.passports;
  v_status text;
begin
  if code is null or length(btrim(code)) > 20 then
    return jsonb_build_object('found', false);
  end if;
  select * into p from public.passports where public_code = upper(btrim(code));
  if not found then
    return jsonb_build_object('found', false);
  end if;
  v_status := case
    when p.status = 'revoked' then 'revoked'
    when p.expires_at < now() then 'expired'
    else 'valid' end;
  return jsonb_build_object(
    'found', true,
    'status', v_status,
    'public_code', p.public_code,
    'display_name', p.display_name,
    'origin_country', p.origin_country,
    'languages', to_jsonb(p.languages),
    'profession', p.profession,
    'qualification', p.qualification,
    'document_status', p.document_status,
    'experience', p.experience,
    'results', p.results,
    'overall_level', p.overall_level,
    'readiness', p.readiness,
    'issued_at', p.issued_at,
    'expires_at', p.expires_at,
    'record_hash', p.record_hash,
    'hash_ok', p.record_hash = public.passport_hash(p)
  );
end;
$$;

-- ---------- submit (scores on the server, issues the passport) ----------
create or replace function public.submit_assessment(payload jsonb)
returns jsonb
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  prof         jsonb;
  answers      jsonb;
  v_profession text;
  v_name       text;
  v_docs       text;
  v_langs      text[] := '{}';
  v_qual       jsonb  := '{}'::jsonb;
  v_exp        jsonb  := '[]'::jsonb;
  v_ready      jsonb  := '{}'::jsonb;
  v_results    jsonb;
  v_total      int;
  v_correct    int;
  v_overall    text;
  v_code       text;
  v_alphabet   constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes      bytea;
  i            int;
  r            public.passports;
begin
  if payload is null or length(payload::text) > 20000 then
    raise exception 'invalid payload';
  end if;
  prof    := payload -> 'profile';
  answers := coalesce(payload -> 'answers', '{}'::jsonb);
  if prof is null or jsonb_typeof(prof) <> 'object' or jsonb_typeof(answers) <> 'object' then
    raise exception 'invalid payload';
  end if;

  v_name       := btrim(coalesce(prof ->> 'display_name', ''));
  v_profession := lower(btrim(coalesce(prof ->> 'profession', '')));
  v_docs       := prof ->> 'document_status';

  if length(v_name) < 1 or length(v_name) > 60 then
    raise exception 'display name is required (max 60 characters)';
  end if;
  if v_docs is null or v_docs not in ('full','partial','none') then
    raise exception 'invalid document status';
  end if;
  if v_profession = 'workplace'
     or not exists (select 1 from public.questions where bank = v_profession) then
    raise exception 'unknown profession';
  end if;

  if jsonb_typeof(prof -> 'languages') = 'array' then
    select coalesce(array_agg(l order by ord), '{}') into v_langs
    from (select btrim(x.l) as l, x.ord
          from jsonb_array_elements_text(prof -> 'languages') with ordinality as x(l, ord)
          where btrim(x.l) <> '' limit 8) s;
  end if;
  if jsonb_typeof(prof -> 'qualification') = 'object' then
    v_qual := prof -> 'qualification';
  end if;
  if jsonb_typeof(prof -> 'experience') = 'array' then
    select coalesce(jsonb_agg(e), '[]'::jsonb) into v_exp
    from (select e from jsonb_array_elements(prof -> 'experience') e limit 3) s;
  end if;
  if jsonb_typeof(prof -> 'readiness') = 'object' then
    v_ready := prof -> 'readiness';
  end if;

  -- Score: unanswered or non-numeric answers count as wrong.
  with qs as (
    select q.bank, q.skill, k.correct, answers ->> q.id as sel
    from public.questions q
    join public.answer_keys k on k.question_id = q.id
    where q.bank in (v_profession, 'workplace')
  ), per_skill as (
    select bank, skill,
           count(*)::int as total,
           count(*) filter (
             where case when sel ~ '^[0-9]{1,3}$' then sel::int = correct else false end
           )::int as correct
    from qs group by bank, skill
  )
  select jsonb_agg(jsonb_build_object(
           'bank', bank, 'skill', skill, 'correct', correct, 'total', total,
           'score', round(correct::numeric / total, 2),
           'level', case when correct::numeric / total >= 0.8 then 'proficient'
                         when correct::numeric / total >= 0.6 then 'developing'
                         else 'bridging' end,
           'evidence', 'assessed')
         order by (bank = 'workplace'), skill),
         sum(total)::int, sum(correct)::int
  into v_results, v_total, v_correct
  from per_skill;

  if v_total is null or v_total = 0 then
    raise exception 'no scored questions for this profession';
  end if;

  v_overall := case when v_correct::numeric / v_total >= 0.8 then 'proficient'
                    when v_correct::numeric / v_total >= 0.6 then 'developing'
                    else 'bridging' end;

  -- Unique public code, e.g. SP-7K3M-QX4T
  loop
    v_bytes := gen_random_bytes(8);
    v_code := 'SP-';
    for i in 0..3 loop
      v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % 31) + 1, 1);
    end loop;
    v_code := v_code || '-';
    for i in 4..7 loop
      v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % 31) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.passports where public_code = v_code);
  end loop;

  r.id             := gen_random_uuid();
  r.public_code    := v_code;
  r.display_name   := v_name;
  r.origin_country := nullif(left(btrim(coalesce(prof ->> 'origin_country', '')), 60), '');
  r.languages      := v_langs;
  r.profession     := v_profession;
  r.qualification  := v_qual;
  r.document_status := v_docs;
  r.experience     := v_exp;
  r.results        := v_results;
  r.overall_level  := v_overall;
  r.readiness      := v_ready;
  r.issued_at      := date_trunc('milliseconds', now());
  r.expires_at     := date_trunc('milliseconds', now() + interval '12 months');
  r.status         := 'valid';
  r.record_hash    := public.passport_hash(r);

  insert into public.passports
    (id, public_code, display_name, origin_country, languages, profession, qualification,
     document_status, experience, results, overall_level, readiness, issued_at, expires_at,
     status, record_hash)
  values
    (r.id, r.public_code, r.display_name, r.origin_country, r.languages, r.profession,
     r.qualification, r.document_status, r.experience, r.results, r.overall_level,
     r.readiness, r.issued_at, r.expires_at, r.status, r.record_hash);

  return public.verify_passport(v_code);
end;
$$;

-- ---------- function privileges ----------
revoke all on function public.passport_hash(public.passports) from public, anon, authenticated;
revoke all on function public.verify_passport(text)  from public;
revoke all on function public.submit_assessment(jsonb) from public;
grant execute on function public.verify_passport(text)    to anon, authenticated;
grant execute on function public.submit_assessment(jsonb) to anon, authenticated;
