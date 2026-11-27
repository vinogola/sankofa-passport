export type Level = 'proficient' | 'developing' | 'bridging'
export type Status = 'valid' | 'expired' | 'revoked'

export interface SkillResult {
  bank: string
  skill: string
  correct: number
  total: number
  score: number
  level: Level
  evidence: 'assessed'
}

export interface Experience {
  title?: string
  years?: number
  referee?: string
}

/** Shape returned by the verify_passport RPC when a code exists. */
export interface Passport {
  found: true
  status: Status
  public_code: string
  display_name: string
  origin_country: string | null
  languages: string[]
  profession: string
  qualification: { title?: string; institution?: string; year?: number | string }
  document_status: 'full' | 'partial' | 'none'
  experience: Experience[]
  results: SkillResult[]
  overall_level: Level
  readiness: Record<string, unknown>
  issued_at: string
  expires_at: string
  record_hash: string
  hash_ok: boolean
}

export type VerifyResult = Passport | { found: false }

const PROFESSIONS: Record<string, string> = { 'web-dev': 'Web developer' }
export const professionLabel = (slug: string) => PROFESSIONS[slug] ?? slug

/** Display names. DB values stay proficient/developing/bridging. */
export const LEVEL_LABEL: Record<Level, string> = {
  proficient: 'Strong',
  developing: 'Working',
  bridging: 'Needs training',
}

export const LEVEL_KEY = 'Level = share of questions answered correctly: Strong 80%+ · Working 60–79% · Needs training under 60%'

export const DOCUMENTS_LABEL: Record<Passport['document_status'], string> = {
  full: 'Full documents',
  partial: 'Partial documents',
  none: 'No documents available',
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
