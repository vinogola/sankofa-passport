# Sankofa Passport

*Recognising experience. Unlocking opportunity.*

**Live app:** https://sankofa-passport-mplv.vercel.app · **Pitch deck:** https://canva.link/yfmqywo31ee7odj

A skilled refugee often has real experience but no papers to prove it. Sankofa Passport lets them take a short skills assessment and get a passport with a public code and link. An employer opens the link, with no login, and sees what was assessed and whether the record has changed since it was issued.

Built for the PLP Africa ILO Mini-Hackathon (theme: "Unlocking Displaced Talent: Pathways for Skilled Refugees"), track 1: credential recognition and skills validation. It's a prototype with made-up data only, and it isn't affiliated with or endorsed by the ILO.

## Try it

- A valid passport: [SP-K3XV-9M2N](https://sankofa-passport-mplv.vercel.app/verify/SP-K3XV-9M2N) (web developer) or [SP-CGP4-GY39](https://sankofa-passport-mplv.vercel.app/verify/SP-CGP4-GY39) (IT support).
- A tampered one: [SP-DEMO-TAMP](https://sankofa-passport-mplv.vercel.app/verify/SP-DEMO-TAMP). One score was edited after issue, and the page says not to rely on it.
- Your own: [/start](https://sankofa-passport-mplv.vercel.app/start). It's 15 questions. Use made-up details.

## What a passport shows

- **Assessed:** skill levels scored on the server from a 15-question test. There are banks for web development, IT support, and office and data skills, plus a workplace-readiness set everyone takes.
- **Self-declared, and labelled that way:** name, origin, qualification, past roles and a short work-readiness checklist.
- **Next steps for the candidate:** what is still open on the checklist, with links to UNHCR, UNESCO and ILO pages.

## How verification works

- Answers are scored in Postgres. The browser never sees the answer key and never sets the score.
- Each passport stores a SHA-256 hash of its record. The database recomputes it on every check, so a record edited after issue shows as changed.
- Passports and answer keys can't be read directly. The app reads and writes them through two functions: `submit_assessment` and `verify_passport`.

### What it doesn't prove

- The seal is a hash, not a signature. Someone with access to the database could change a record and re-seal it. Signing with a key held outside the database is the next step.
- The test is unproctored and can be retaken. A result shows what someone scored, not who sat the test, and identity isn't checked.
- It's an entry screen, not a certification, and it only covers four question banks.

## Run it

React, TypeScript, Tailwind, Supabase (Postgres) and Vercel.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

The schema is in `supabase/migrations/`. Run `0001_init.sql` and `0002_hardening.sql` in order in a Supabase project's SQL editor, then load `supabase/seed/questions.sql` and your own answer keys into `answer_keys (question_id, correct, explanation)`, where `correct` is the zero-based index of the right option. The answer keys aren't in this repository.

## AI use

I used AI tools throughout this build. I chose the idea, the scope, the design directions and the question banks, wrote six of the rubric lines, and read and approved all 33 questions and their answer keys. Claude Code wrote most of the code and SQL and drafted the questions and the wording. Separate AI review passes checked the work for bugs, security and overclaims, and I decided which of their findings to act on.

## Credits

Sankofa is an Akan proverb and Adinkra symbol from Ghana and Côte d'Ivoire, often translated as "go back and get it". The bird mark was drawn for this project. Fonts are Gloock, Fraunces, Instrument Sans and IBM Plex Mono from Google Fonts (SIL Open Font License). QR codes use qrcode.react (ISC).
