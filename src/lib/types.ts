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

const PROFESSIONS: Record<string, string> = {
  'web-dev': 'Web developer',
  'it-support': 'IT support',
  'office-data': 'Office & data skills',
}
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

export interface Question {
  id: string
  bank: string
  skill: string
  prompt: string
  options: string[]
  sort: number
}

export interface RoleInput {
  title: string
  years: string
  referee: string
}

/** Raw form state for the profile step. Converted to the RPC payload by buildProfile. */
export interface ProfileInput {
  display_name: string
  origin_country: string
  languages: string
  profession: string
  qualification_title: string
  qualification_institution: string
  document_status: '' | 'full' | 'partial' | 'none'
  roles: RoleInput[]
  /** Ticked work-readiness ids (see lib/readiness.ts). Self-declared. */
  checks: string[]
}

export const EMPTY_PROFILE: ProfileInput = {
  display_name: '',
  origin_country: '',
  languages: '',
  profession: '',
  qualification_title: '',
  qualification_institution: '',
  document_status: '',
  roles: [{ title: '', years: '', referee: '' }],
  checks: [],
}

/** Trim and shape the form for submit_assessment. The server re-checks everything and sets all scores. */
export function buildProfile(p: ProfileInput) {
  const qualification: Record<string, string> = {}
  if (p.qualification_title.trim()) qualification.title = p.qualification_title.trim()
  if (p.qualification_institution.trim()) qualification.institution = p.qualification_institution.trim()
  const experience = p.roles
    .filter((r) => r.title.trim())
    .slice(0, 3)
    .map((r) => {
      const years = Number.parseInt(r.years, 10)
      const out: Experience = { title: r.title.trim() }
      if (Number.isFinite(years) && years >= 0 && years <= 60) out.years = years
      if (r.referee.trim()) out.referee = r.referee.trim()
      return out
    })
  return {
    display_name: p.display_name.trim(),
    origin_country: p.origin_country.trim(),
    languages: p.languages.split(',').map((l) => l.trim()).filter(Boolean).slice(0, 8),
    profession: p.profession,
    qualification,
    document_status: p.document_status,
    experience,
    readiness: { checks: p.checks },
  }
}

/** Stored records are validated on the server, but the page must still never crash on odd data. */
export const txt = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)

export function qualificationTitle(q: unknown): string {
  return txt((q as { title?: unknown } | null)?.title) || 'Not given'
}

export function experienceLine(list: unknown): string {
  if (!Array.isArray(list) || list.length === 0) return 'None listed'
  const parts = list
    .filter((e): e is Record<string, unknown> => typeof e === 'object' && e !== null)
    .map((e) => `${txt(e.title, 'Role')}${typeof e.years === 'number' && e.years > 0 ? `, ${e.years} yrs` : ''}`)
  return parts.length ? parts.join('; ') : 'None listed'
}
