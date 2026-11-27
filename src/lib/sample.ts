import type { Passport } from './types'

/** Code of a real synthetic record in the database, used for "Try a sample". Issued against the real question banks. */
export const SAMPLE_CODE = 'SP-K3XV-9M2N'

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
    { bank: 'web-dev', skill: 'Git & debugging', correct: 3, total: 3, score: 1, level: 'proficient', evidence: 'assessed' },
    { bank: 'web-dev', skill: 'HTML & CSS', correct: 2, total: 3, score: 0.67, level: 'developing', evidence: 'assessed' },
    { bank: 'web-dev', skill: 'JavaScript', correct: 3, total: 3, score: 1, level: 'proficient', evidence: 'assessed' },
    { bank: 'workplace', skill: 'Digital safety', correct: 2, total: 3, score: 0.67, level: 'developing', evidence: 'assessed' },
    { bank: 'workplace', skill: 'Remote collaboration', correct: 3, total: 3, score: 1, level: 'proficient', evidence: 'assessed' },
  ],
  overall_level: 'proficient',
  readiness: {},
  issued_at: '2026-11-27T10:40:47.595+00:00',
  expires_at: '2027-11-27T10:40:47.595+00:00',
  record_hash: '9bbba2f85282bd18c8178c525b97075b1917dd19e58db1f6eac6de35672f8814',
  hash_ok: true,
}
