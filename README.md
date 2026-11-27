# Sankofa Passport

*Recognising experience. Unlocking opportunity.*

A skills passport for skilled refugees whose qualifications are missing or unrecognised. A candidate takes a short assessment, gets a shareable passport with a public code, and an employer verifies it at `/verify/<code>` with no login.

Built for the PLP Africa ILO Mini-Hackathon, as a prototype with no ILO endorsement (theme: "Unlocking Displaced Talent: Pathways for Skilled Refugees"), track 1: credential recognition and skills validation. **Work in progress.** The design record is in [spec.md](spec.md).

## How verification works

- Scoring happens in Postgres, not in the browser. The browser never sees the answer key and never sets the score.
- Passports and answer keys can't be read directly. The public site calls two functions: `submit_assessment` and `verify_passport`.
- Each passport stores a SHA-256 hash of its record. The database recomputes it on every check, so a record edited without re-sealing it shows as changed.
- Inputs are validated and capped on the server, and each client is limited to about 20 passports an hour (60 a day), by a hashed network address.
- Test data is synthetic. Answer keys are not in this repository.

### What it does not prove

- The seal is an unkeyed hash, not a signature. Whoever runs the database could change a record and re-seal it.
- The test is unproctored and can be retaken, and each result shows per-skill scores. A determined person with many network addresses could work out the answer keys. The throttle raises the cost, it does not remove the weakness.
- Identity is not checked. Name, origin, qualification and experience are typed by the candidate and labelled as declared.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

The database schema is in `supabase/migrations/0001_init.sql` and `0002_hardening.sql`. Run both in order in the SQL editor of a Supabase project, then load `supabase/seed/questions.sql` and your own answer keys into `answer_keys (question_id, correct, explanation)`, where `correct` is the zero-based index of the right option.

## AI use

I used AI tools throughout this build. I chose the idea, the scope, the design directions and the question banks, wrote six of the rubric lines, and read and approved all 33 questions and their answer keys. Claude Code wrote most of the code and SQL and drafted the questions and the wording. Separate AI review passes checked the work for bugs, security and overclaims, and I decided which of their findings to act on.
