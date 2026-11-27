import { SAMPLE_PASSPORT } from '../lib/sample'
import { LEVEL_LABEL, professionLabel } from '../lib/types'

export const P = SAMPLE_PASSPORT
export const profession = professionLabel(P.profession)
export const levelLabel = LEVEL_LABEL
export const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

export const STEPS = [
  { n: '01', t: 'Show what you can do', d: 'A short, fair assessment. No account or documents needed to start.' },
  { n: '02', t: 'Get your passport', d: 'Results become a sealed record with a public code and issue date.' },
  { n: '03', t: 'Share one link', d: 'Employers check the seal and see what was assessed and what was declared.' },
]
