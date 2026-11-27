# Sankofa Passport — Spec (Stage A)

> Progress is tracked in build-plan.md. This file is the design record.

## One line
A skilled refugee with missing or unrecognised papers proves what they can do through a short assessment, gets a shareable skills passport, and an employer checks it with one link, no login.

## Users and flow
1. **Candidate** (no account): enters a display name, country of origin, languages, the qualification they hold and its document status (full papers / partial / none), and up to 3 past roles (title, years, optional referee name). Takes the assessment for one profession plus the shared workplace module.
2. **Server scores it** and issues a passport with a short public code (e.g. `SP-7K3M-QX4T`) and a QR link.
3. **Employer or verifier** opens `/verify/<code>`: sees valid / expired / revoked / not found, assessed skills and levels, how each was assessed, issue and expiry dates, and an integrity hash for printed copies. Optional: pick a sample role and see which requirements the passport meets.
4. **Bridging** (stage G): skills below "proficient" get a named next step (a free course or recognised certification), and a short work-readiness checklist the candidate self-declares (shown to employers as self-declared).

## Evidence levels (shown on the passport)
- **Self-declared:** typed by the candidate, not checked (qualification, past roles, checklist items). Past roles make the "Recognising experience" tagline true, and are always labelled self-declared.
- **Assessed:** scored by Sankofa Passport's server-side test.
- **Assessor-attested:** a partner assessor confirms (pitch only, not built).

The verifier page states plainly what an online test does and doesn't prove (stage D3 added the panel): the record is unchanged since issue; skill levels come from an unproctored, retakeable test; identity and declared details are not checked; the seal is an unkeyed hash, not a signature.

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
Per skill: share of correct answers, 3 questions per skill. Stored levels proficient >= 80%, developing 60-79%, bridging < 60%; shown as Strong, Working, Needs training. Passport valid 12 months (this prototype's setting).

## Question banks (decided at A, 2026-11-27)
- **Web developer** (profession bank): 9 questions in 3 skills (HTML & CSS, JavaScript, Git & debugging). The author wrote 6 of the rubric lines and reads all of them.
- **Workplace readiness** (shared module, every passport): 6 questions in 2 skills (remote collaboration, digital safety). Taken by all candidates whatever the profession.
- **IT support** and **Office & data skills** (added in stage D2): 9 questions each, in 3 skills, chosen because the author can check every answer. A new bank is rows in `questions` plus one display-label line in `types.ts`.
- The engine is sector-neutral: a bank is rows in `questions` (profession + skill) and nothing else. Other sectors (health, teaching, accounting) need a partner expert to write and validate the bank and attest results. The pitch says this plainly: these banks are entry screens, not certification, and it claims no coverage beyond web dev, IT support, office skills and workplace readiness.

## Brand (decided at A, 2026-11-27)
- **Name:** Sankofa Passport. Rejected: ProofPath (forgettable), TalentBridge (existing refugee-hiring products), Ujuzi (existing certificate verifier), Mizizi/Cheti (usable, not liked), "Sankofa Bridge" (an existing nonprofit uses it, and "bridge" is overused).
- **Tagline:** "Recognising experience. Unlocking opportunity." Sub-line: "Your experience has value."
- **Meaning:** Akan (Ghana and Côte d'Ivoire) proverb, "go back and get it"; symbol is a bird with feet forward and head turned back. Credit the origin on an About line. Do not present it as native to East African refugee communities.
- **Visual:** navy, bronze, gold. A simple original SVG bird mark, drawn for this project, not copied artwork. Check bronze-on-navy text contrast (WCAG AA) in the design stage.
- **Honesty rule:** the tagline claims recognition of experience, so the passport must show experience, labelled self-declared.

## Design brief (stage C, 2026-11-27)
- **Hero:** navy night with faint stars and a large engraved seal (rosette) carrying the bird mark and the tagline on a ring. Headline "Your skills travel with you." in Fraunces with a hand-drawn gold underline under "skills". Description: two short lines behind a thin gold rule ("Prove what you can do, wherever you learned it." / "Employers check your passport with one link."). Call-to-action pill bottom-right. The seal moves lower and dims on phones so text stays readable.
- **Page:** layout after design C (Codos-inspired): glass step cards, a code check with a "Try a sample" link, a "Why Sankofa" credit.
- **Verify view:** a landscape certificate (chosen from four passport designs: certificate card, landscape certificate, wallet ID card, skills-first badge). Framed parchment, "Assessed Skills Record", holder's name centred in the serif, assessed skills with level and %, the level key, a "Self-declared · not verified" block, a seal stamp that turns red when the hash check fails, an issuer line with dates, a QR code to the verify page, and the full SHA-256 hash.
- **Home preview card:** a quiet record card. Parchment with a 7% engraved texture, navy header with a flat status chip, serif holder name with an initials monogram (no photos: synthetic data), results as transcript rows (skill, level, %, thin bar coloured by level) with a one-line level key, a "Self-declared · not verified" section, and one footer with code, dates, seal status and a QR code to the verify page.
- **Verify page:** opens with a verdict banner (gold "Record unchanged since issue, and still valid", or red "Do not rely on this record").
- **Colour and type:** navy, bronze, gold, ivory, parchment; solid UI fills, one radial glow behind the seal. Fraunces (hero), Gloock (card name and header), Instrument Sans (UI), IBM Plex Mono (codes).
- **Checks:** WCAG AA text contrast (card text on texture lines 4.8:1 or better), smallest card text 11.2px, 1280px and 375px with no horizontal scroll, reduced motion respected.
- **Review:** an AI reviewer briefed as a senior UI/UX designer scored the site; its fixes were applied except restoring the warm sky gradient. Later rounds were driven by Vincent's feedback (too many gradients, card too noisy, people first).

## Known limits (stated in the README and pitch)
- The seal is an unkeyed SHA-256 computed inside the database: whoever runs the database can edit a record and re-seal it. Signing with a key held outside the database is the production fix.
- Answer keys cannot be read directly, but each submission reveals per-skill results, so a determined attacker with many network addresses could learn them. The throttle (about 20 per hour and 60 per day per client, 2000 per day overall; a client that can fake its address header may still evade it) raises the cost; question pools and proctoring are the production fix.
- `status` is outside the hash, so a revocation needs a separate append-only log in production.
- No candidate accounts, so no way to delete a passport except by the operator.

## Out of scope
Candidate accounts, document uploads, live LLM, real assessor workflow, payments, real personal data.
