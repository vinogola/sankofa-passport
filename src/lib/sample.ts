import type { Passport } from './types'

/** Code of a real synthetic record in the database, used for "Try a sample". Re-issue after the real question banks load (stage D). */
export const SAMPLE_CODE = 'SP-U6BN-Y6MG'

/** Landing-page preview. Mirrors the synthetic record SAMPLE_CODE; not a real person. */
export const SAMPLE_PASSPORT: Passport = {
  found: true,
  status: 'valid',
  public_code: SAMPLE_CODE,
  display_name: 'Amani Tesfaye',
  origin_country: 'Eritrea',
  languages: ['Tigrinya', 'Arabic', 'English'],
  profession: 'web-dev',
  qualification: { title: 'BSc Computer Science' },
  document_status: 'none',
  experience: [{ title: 'Front-end developer', years: 4 }],
  results: [
    { bank: 'web-dev', skill: 'HTML & CSS', correct: 1, total: 1, score: 1, level: 'proficient', evidence: 'assessed' },
    { bank: 'web-dev', skill: 'JavaScript', correct: 1, total: 1, score: 1, level: 'proficient', evidence: 'assessed' },
    { bank: 'workplace', skill: 'Communication', correct: 1, total: 1, score: 1, level: 'proficient', evidence: 'assessed' },
  ],
  overall_level: 'proficient',
  readiness: {},
  issued_at: '2026-11-27T09:00:58.572+00:00',
  expires_at: '2027-11-27T09:00:58.572+00:00',
  record_hash: 'e8b7e45e1866505ba00b7fee91b17ee54a06766f2854a7a0a43c55eeb1f68be0',
  hash_ok: true,
}
