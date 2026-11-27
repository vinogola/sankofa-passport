-- Tamper demo for the pitch. Run once in the Supabase SQL editor, after 0002.
--
-- Creates SP-DEMO-TAMP: a copy of the sample SP-CGP4-GY39 under a clearly
-- labelled name. It is sealed first, then one score is edited directly in the
-- table without re-sealing. The verifier then recomputes the seal, sees it no
-- longer matches, and shows the red "Do not rely on this record" state.
--
-- Synthetic data only. Safe to re-run: it removes the demo row first.

begin;

delete from public.passports where public_code = 'SP-DEMO-TAMP';

-- 1. A normal, correctly sealed copy of the sample, under a demo name.
insert into public.passports
  (public_code, display_name, origin_country, languages, profession, qualification,
   document_status, experience, results, overall_level, readiness,
   issued_at, expires_at, status, record_hash)
select
  'SP-DEMO-TAMP', 'Demo: tampered record', origin_country, languages, profession, qualification,
  document_status, experience, results, overall_level, readiness,
  issued_at, expires_at, 'valid', 'pending'
from public.passports
where public_code = 'SP-CGP4-GY39';

update public.passports p
   set record_hash = public.passport_hash(p)
 where public_code = 'SP-DEMO-TAMP';

-- 2. The tampering: first skill edited to 100% / proficient, seal left as it was.
update public.passports
   set results = jsonb_set(
                   jsonb_set(results, '{0,score}', '1'),
                   '{0,level}', '"proficient"')
 where public_code = 'SP-DEMO-TAMP';

commit;

-- Check (expect hash_ok = false for the demo, true for the real sample):
select public_code,
       public.verify_passport(public_code)->>'hash_ok' as hash_ok
  from public.passports
 where public_code in ('SP-DEMO-TAMP', 'SP-CGP4-GY39');
