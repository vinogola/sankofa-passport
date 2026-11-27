# Sankofa Passport

*Recognising experience. Unlocking opportunity.*

A skills passport for skilled refugees whose qualifications are missing or unrecognised. A candidate takes a short assessment, gets a shareable passport with a public code, and an employer verifies it at `/verify/<code>` with no login.

Built for the ILO Mini-Hackathon (theme: "Unlocking Displaced Talent: Pathways for Skilled Refugees"), track 1: credential recognition and skills validation. **Work in progress.** The design record is in [spec.md](spec.md).

## How verification works

- Scoring happens in Postgres, not in the browser. The browser never sees the answer key and never sets the score.
- Passports and answer keys can't be read directly. The public site can only call two functions: `submit_assessment` and `verify_passport`.
- Each passport stores a SHA-256 hash of its record. The verifier page recomputes it, so a record edited after issue shows as failing.
- Test data is synthetic. Answer keys are not in this repository.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

The database schema is in `supabase/migrations/0001_init.sql`. Run it in the SQL editor of a Supabase project, then load your own questions and answer keys.

## AI use

The hackathon allows AI tools in the build phase. The scaffold, SQL and app code here are written with Claude Code. A fuller account of what the author wrote and checked will be added to this README at submission.
