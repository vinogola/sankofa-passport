# Sankofa Passport — Spec (Stage A)

> Progress is tracked in build-plan.md. This file is the design record.

## One line
A skilled refugee with missing or unrecognised papers proves what they can do through a short assessment, gets a shareable skills passport, and an employer checks it with one link, no login.

## Users and flow
1. **Candidate** (no account): enters a display name, country of origin, languages, the qualification they hold and its document status (full papers / partial / none), and up to 3 past roles (title, years, optional referee name). Takes the assessment for one profession plus the shared workplace module.
2. **Server scores it** and issues a passport with a short public code (e.g. `SP-7K3M-QX`) and a QR link.
3. **Employer or verifier** opens `/verify/<code>`: sees valid / expired / revoked / not found, verified skills and levels, how each was verified, issue and expiry dates, and an integrity hash for printed copies. Optional: pick a sample role and see which requirements the passport meets.
4. **Bridging** (stage G): skills below "proficient" get a named next step (a free course or recognised certification), and a short work-readiness checklist the candidate self-declares (shown to employers as self-declared).

## Evidence levels (shown on the passport)
- **Self-declared:** typed by the candidate, not checked (qualification, past roles, checklist items). Past roles make the "Recognising experience" tagline true, and are always labelled self-declared.
- **Assessed:** scored by Sankofa Passport's server-side test.
- **Assessor-attested:** a partner assessor confirms (pitch only, not built).

The verifier page states plainly what an online test does and doesn't prove.

## Integrity rules (the 30% criterion)
- The browser never sees the answer key and never sets the score. An RPC `submit_assessment` (security definer) scores answers in Postgres and writes the passport.
- Tables have RLS on with no direct anon reads of passports or answer keys. Verification goes through RPC `verify_passport(code)`, which returns only public fields.
- `record_hash` = SHA-256 of the canonical passport record, computed in Postgres at issue time.
- Synthetic data only.

## Data model (stage B)
- `questions` (id, bank, skill, prompt, options jsonb, version): bank is a profession slug or `workplace`. Anon may read.
- `answer_keys` (question_id, correct_option, explanation): no grants.
- `passports` (id, public_code, display_name, origin_country, languages, profession, qualification jsonb, document_status, experience jsonb, results jsonb, overall_level, readiness jsonb, issued_at, expires_at, status, record_hash): no direct grants; RPCs only.

## Scoring
Per skill: share of correct answers. Proficient >= 80%, Developing 60-79%, Bridging needed < 60%. Passport valid 12 months.

## Question banks (decided at A, 2026-11-27)
- **Web developer** (profession bank): about 8 questions across 3-4 skills (HTML/CSS, JavaScript, Git and tooling, debugging). The author writes 6 rubrics and checks the rest.
- **Workplace readiness** (shared module, every passport): about 5 questions on remote-work tools, professional communication, digital safety. Taken by all candidates whatever the profession.
- **IT support:** cut candidate. Added only if time allows, as proof that a new bank needs no code change.
- The engine is sector-neutral: a bank is rows in `questions` (profession + skill) and nothing else. Other sectors (health, teaching, accounting) need a partner expert to write and validate the bank and attest results. The pitch says this plainly and claims no coverage beyond web dev and workplace readiness.

## Brand (decided at A, 2026-11-27)
- **Name:** Sankofa Passport. Rejected: ProofPath (forgettable), TalentBridge (existing refugee-hiring products), Ujuzi (existing certificate verifier), Mizizi/Cheti (usable, not liked), "Sankofa Bridge" (an existing nonprofit uses it, and "bridge" is overused).
- **Tagline:** "Recognising experience. Unlocking opportunity." Sub-line: "Your experience has value."
- **Meaning:** Akan (Ghana and Côte d'Ivoire) proverb, "go back and get it"; symbol is a bird with feet forward and head turned back. Credit the origin on an About line. Do not present it as native to East African refugee communities.
- **Visual:** navy, bronze, gold. A simple original SVG bird mark, drawn for this project, not copied artwork. Check bronze-on-navy text contrast (WCAG AA) in the design stage.
- **Honesty rule:** the tagline claims recognition of experience, so the passport must show experience, labelled self-declared.

## Out of scope
Candidate accounts, document uploads, live LLM, real assessor workflow, payments, real personal data.
