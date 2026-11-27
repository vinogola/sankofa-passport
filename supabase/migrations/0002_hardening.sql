-- Sankofa Passport: hardening after the first review round (migration 0002).
-- Run after 0001. Safe to run again (create or replace). Changes: per-client throttle (about 20 an hour and 60 a day; check and insert are not atomic), strict input validation and caps,
-- refusal to score a bank that has a question without an answer key, trimmed codes.
-- Known limits (stated in the README): the hash is unkeyed, and a determined attacker
-- with many network addresses can still learn the answer keys one submission at a time.

-- ---------- throttle log (hashed client address, never the address itself) ----------
create table if not exists public.submission_log (
  id  bigserial primary key,
  who text not null,
  at  timestamptz not null default now()
);
create index if not exists submission_log_who_at on public.submission_log (who, at);
alter table public.submission_log enable row level security;
revoke all on public.submission_log from anon, authenticated;

-- ---------- text helpers (not callable by the public) ----------
-- Removes control, zero-width and bidi-override characters, trims, caps length, empty -> null.
create or replace function public.clean_text(t text, max_len int)
returns text
language sql immutable
set search_path = public
as $$
  select nullif(left(btrim(regexp_replace(coalesce(t, ''),
    '[\u0001-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u2064\u2066-\u2069\u2028\u2029\u061c\u180e\u034f\ufeff]', '', 'g')), max_len), '')
$$;

-- Text value of a key, only when the JSON value really is a string.
create or replace function public.jstr(j jsonb, k text, max_len int)
returns text
language sql immutable
set search_path = public
as $$
  select case when jsonb_typeof(j -> k) = 'string' then public.clean_text(j ->> k, max_len) end
$$;

revoke all on function public.clean_text(text, int) from public, anon, authenticated;
revoke all on function public.jstr(jsonb, text, int) from public, anon, authenticated;

-- ---------- verify (public, read-only): ignore whitespace anywhere in the code ----------
create or replace function public.verify_passport(code text)
returns jsonb
language plpgsql stable security definer
set search_path = public, extensions
as $$
declare
  p public.passports;
  v_code text;
  v_status text;
begin
  v_code := upper(regexp_replace(coalesce(code, ''), '\s', '', 'g'));
  if length(v_code) = 0 or length(v_code) > 20 then
    return jsonb_build_object('found', false);
  end if;
  select * into p from public.passports where public_code = v_code;
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
  v_checks     jsonb;
  v_results    jsonb;
  v_total      int;
  v_correct    int;
  v_overall    text;
  v_code       text;
  v_alphabet   constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes      bytea;
  v_hdrs       json;
  v_ip         text;
  v_who        text;
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

  -- Throttle per client (hashed forwarded address) and overall. Only successful issues are counted.
  begin
    v_hdrs := current_setting('request.headers', true)::json;
  exception when others then
    v_hdrs := null;
  end;
  -- Prefer the header set by the edge network (a caller cannot set it); otherwise the LAST
  -- forwarded address, which a trusted proxy appends. The first entry is caller-controlled.
  v_ip := nullif(btrim(coalesce(v_hdrs ->> 'cf-connecting-ip', '')), '');
  v_ip := coalesce(v_ip,
                   nullif(btrim((regexp_split_to_array(coalesce(v_hdrs ->> 'x-forwarded-for', ''), '\s*,\s*'))[
                     cardinality(regexp_split_to_array(coalesce(v_hdrs ->> 'x-forwarded-for', ''), '\s*,\s*'))]), ''),
                   nullif(btrim(coalesce(v_hdrs ->> 'x-real-ip', '')), ''),
                   'unknown');
  v_who := encode(digest('sankofa-throttle:' || v_ip, 'sha256'), 'hex');
  delete from public.submission_log where at < now() - interval '2 days';
  if (select count(*) from public.submission_log where who = v_who and at > now() - interval '1 hour') >= 20
     or (select count(*) from public.submission_log where who = v_who and at > now() - interval '1 day') >= 60 then
    raise exception 'too many attempts from this connection, please try again later';
  end if;
  if (select count(*) from public.submission_log where at > now() - interval '1 day') >= 2000 then
    raise exception 'the service is busy, please try again later';
  end if;

  v_name       := public.jstr(prof, 'display_name', 1000);
  v_profession := lower(btrim(coalesce(public.jstr(prof, 'profession', 40), '')));
  v_docs       := public.jstr(prof, 'document_status', 10);

  if v_name is null or char_length(v_name) > 60 then
    raise exception 'display name is required (max 60 characters)';
  end if;
  if v_name ~* '(sankofa|verified|issuer)' then
    raise exception 'that name cannot be used';
  end if;
  if v_docs is null or v_docs not in ('full','partial','none') then
    raise exception 'invalid document status';
  end if;
  if v_profession = 'workplace'
     or not exists (select 1 from public.questions where bank = v_profession) then
    raise exception 'unknown profession';
  end if;
  -- Never score a bank that has a question without a key: it would silently drop out of the score.
  if exists (
    select 1 from public.questions q
    left join public.answer_keys k on k.question_id = q.id
    where q.bank in (v_profession, 'workplace') and k.question_id is null
  ) then
    raise exception 'this assessment is not ready yet';
  end if;

  if jsonb_typeof(prof -> 'languages') = 'array' then
    select coalesce(array_agg(l order by ord), '{}') into v_langs
    from (select public.clean_text(x.l, 40) as l, x.ord
          from jsonb_array_elements_text(prof -> 'languages') with ordinality as x(l, ord)
          where public.clean_text(x.l, 40) is not null
          order by x.ord limit 8) s;
  end if;

  if jsonb_typeof(prof -> 'qualification') = 'object' then
    v_qual := jsonb_strip_nulls(jsonb_build_object(
      'title',       public.jstr(prof -> 'qualification', 'title', 80),
      'institution', public.jstr(prof -> 'qualification', 'institution', 80)));
  end if;

  if jsonb_typeof(prof -> 'experience') = 'array' then
    select coalesce(jsonb_agg(x order by ord), '[]'::jsonb) into v_exp
    from (
      select t.ord,
             jsonb_strip_nulls(jsonb_build_object(
               'title',   public.jstr(t.e, 'title', 80),
               'years',   case when jsonb_typeof(t.e -> 'years') in ('number', 'string')
                                and (t.e ->> 'years') ~ '^[0-9]{1,2}$'
                                and (t.e ->> 'years')::int <= 60
                               then (t.e ->> 'years')::int end,
               'referee', public.jstr(t.e, 'referee', 80))) as x
      from jsonb_array_elements(prof -> 'experience') with ordinality as t(e, ord)
      where jsonb_typeof(t.e) = 'object' and public.jstr(t.e, 'title', 80) is not null
      order by t.ord limit 3
    ) s;
  end if;

  -- readiness: only a short list of checklist ids, nothing else is stored
  if jsonb_typeof(prof -> 'readiness' -> 'checks') = 'array' then
    select coalesce(jsonb_agg(c order by ord), '[]'::jsonb) into v_checks
    from (select to_jsonb(public.clean_text(x.c, 40)) as c, x.ord
          from jsonb_array_elements_text(prof -> 'readiness' -> 'checks') with ordinality as x(c, ord)
          where public.clean_text(x.c, 40) is not null
          order by x.ord limit 8) s;
    if jsonb_array_length(v_checks) > 0 then
      v_ready := jsonb_build_object('checks', v_checks);
    end if;
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
  r.origin_country := public.jstr(prof, 'origin_country', 60);
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

  insert into public.submission_log (who) values (v_who);

  -- The candidate only needs the code; the full record is read through verify_passport.
  return jsonb_build_object('public_code', v_code);
end;
$$;

revoke all on function public.verify_passport(text)  from public;
revoke all on function public.submit_assessment(jsonb) from public;
grant execute on function public.verify_passport(text)    to anon, authenticated;
grant execute on function public.submit_assessment(jsonb) to anon, authenticated;
