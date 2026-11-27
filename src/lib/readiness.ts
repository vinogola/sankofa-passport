/**
 * Work-readiness checklist and bridging next steps (stage G).
 * Every statement here paraphrases one of the three SOURCES below, read on 27 Nov 2026.
 * The checklist is self-declared by the candidate and stored as short ids in passports.readiness.
 */

export const SOURCES = {
  unhcr: {
    label: 'UNHCR Help: Work and income',
    url: 'https://help.unhcr.org/global/work-and-income/',
  },
  unesco: {
    label: 'UNESCO Qualifications Passport',
    url: 'https://www.unesco.org/en/articles/what-you-need-know-about-unesco-qualifications-passport-refugees-and-vulnerable-migrants',
  },
  ilo: {
    label: "ILO: General Principles and Operational Guidelines for Fair Recruitment",
    url: 'https://www.ilo.org/resource/ilos-2016-general-principles-and-operational-guidelines-fair-recruitment',
  },
} as const

export interface Check {
  id: string
  /** Short heading for the next-steps list. */
  title: string
  /** What the candidate ticks. */
  label: string
  /** Shown as a next step while it is not ticked. */
  todo: string
  source: keyof typeof SOURCES
}

export const CHECKS: Check[] = [
  {
    id: 'id-doc',
    title: 'A valid ID or refugee or asylum document',
    label: 'I have a valid ID or refugee or asylum document.',
    todo: 'Employers may ask for a valid ID or refugee or asylum documentation. If you are unsure what you need, ask a trusted organisation for help.',
    source: 'unhcr',
  },
  {
    id: 'cv',
    title: 'A CV or résumé',
    label: 'I have a CV or résumé.',
    todo: 'Get help writing your CV and cover letter. UNHCR says it and its partners often offer this for free.',
    source: 'unhcr',
  },
  {
    id: 'proof',
    title: 'Proof of your qualifications or experience, if you have it',
    label: 'I have some proof of my qualifications or work experience.',
    todo: 'The UNESCO Qualifications Passport is for refugees and vulnerable migrants who have completed, or partly completed, studies at upper secondary level or above, even if their documents are insufficient or missing. It summarises your education, work experience and language skills after an assessment and structured interview. It is not a licence to practise a profession or a guarantee of a job. Check with UNESCO whether it is available to you.',
    source: 'unesco',
  },
  {
    id: 'work-rules',
    title: 'Check whether you can legally work where you live',
    label: 'I have checked whether I can legally work where I live.',
    todo: 'The rules depend on the country and your status, and you may need a work permit. Check the UNHCR Help page for your country, a legal aid organisation or the local government.',
    source: 'unhcr',
  },
  {
    id: 'pay',
    title: 'A safe way to be paid',
    label: 'I have a safe way to be paid, such as a bank account or mobile money.',
    todo: 'Mobile money, digital wallets and prepaid cards from NGOs are options. Ask local organisations or UNHCR partners about services near you.',
    source: 'unhcr',
  },
]

export const CHECK_IDS = CHECKS.map((c) => c.id)

/** Ids ticked on a stored record. Anything unknown or malformed is ignored, so odd data never crashes the page. */
export function tickedChecks(readiness: unknown): string[] {
  const list = (readiness as { checks?: unknown } | null)?.checks
  if (!Array.isArray(list)) return []
  return CHECK_IDS.filter((id) => list.includes(id))
}

export const NO_FEE_NOTE =
  'Do not pay to get a job. UNHCR says legitimate employers and recruitment agencies should not charge you to find a job, and the ILO fair recruitment guidelines say no recruitment fees or related costs should be charged to workers or jobseekers.'

export const NOT_ADVICE =
  'Not legal advice. Rules differ by country and by status. Sankofa Passport is not part of UNHCR, UNESCO or the ILO; these links go to their own pages.'
