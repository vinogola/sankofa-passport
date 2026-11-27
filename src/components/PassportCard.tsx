import { QRCodeSVG } from 'qrcode.react'
import Guilloche from './Guilloche'
import Mark from './Mark'
import { DOCUMENTS_LABEL, LEVEL_KEY, LEVEL_LABEL, fmtDate, professionLabel } from '../lib/types'
import type { Level, Passport, Status } from '../lib/types'

/** Certificate-style passport, kept quiet: parchment, a faint engraved texture, one status mark, results as rows. */

const STATUS: Record<Status, { label: string; cls: string }> = {
  valid: { label: 'Valid', cls: 'border-[#1d6b4b] text-[#1d6b4b]' },
  expired: { label: 'Expired', cls: 'border-bronze-800 text-bronze-800' },
  revoked: { label: 'Revoked', cls: 'border-[#9b2c2c] text-[#9b2c2c]' },
}

/** Bar colour per level, on parchment. */
const LEVEL_BAR: Record<Level, string> = {
  proficient: 'bg-navy-900',
  developing: 'bg-bronze-700',
  bridging: 'bg-ink/35',
}

const label = 'font-mono text-[0.7rem] uppercase tracking-[0.12em] text-bronze-800'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-ink/70">{k}</dt>
      <dd className="font-medium sm:text-right">{v}</dd>
    </div>
  )
}

export default function PassportCard({ data, sample = false }: { data: Passport; sample?: boolean }) {
  const status = STATUS[data.status]
  return (
    <article
      className="relative w-full max-w-md overflow-hidden rounded-lg bg-parchment text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] ring-1 ring-gold-400/40"
      aria-label={`Skills passport for ${data.display_name}`}
    >
      <Guilloche className="pointer-events-none absolute inset-0 text-bronze-700/[0.07]" />

      <header className="relative flex items-center justify-between gap-4 bg-navy-900 px-6 py-4 text-gold-300">
        <div className="flex items-center gap-3">
          <Mark className="h-8 w-8" />
          <p className="whitespace-nowrap font-display text-lg leading-none">Sankofa Passport</p>
        </div>
        <span className={`rounded-sm border bg-parchment px-2 py-0.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.15em] ${status.cls}`}>
          {status.label}
        </span>
      </header>

      <div className="relative px-6 pb-6 pt-5">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink/25 font-display text-lg text-ink/80" aria-hidden="true">
            {initials(data.display_name)}
          </span>
          <div className="min-w-0">
            <p className="font-display text-2xl leading-tight">{data.display_name}</p>
            <p className="text-sm text-ink/75">
              {professionLabel(data.profession)} · {data.origin_country ?? 'Origin not given'}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between">
          <h3 className={label}>Assessed by Sankofa</h3>
          <p className="text-xs text-ink/75">
            Overall <strong className="font-semibold text-ink">{LEVEL_LABEL[data.overall_level]}</strong>
          </p>
        </div>
        <ul className="mt-2 divide-y divide-ink/10 border-y border-ink/15">
          {data.results.map((r) => {
            const pct = Math.round(r.score * 100)
            return (
              <li key={`${r.bank}-${r.skill}`} className="py-2.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">{r.skill}</span>
                  <span className="shrink-0 text-ink/75">
                    {LEVEL_LABEL[r.level]} · <span className="tabular-nums">{pct}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-ink/10" aria-hidden="true">
                  <div className={`h-full rounded-full ${LEVEL_BAR[r.level]}`} style={{ width: `${pct}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
        <p className="mt-2 text-[0.7rem] text-ink/70">{LEVEL_KEY}</p>

        {!sample && (
          <>
            <h3 className={`mt-5 ${label}`}>Self-declared · not verified</h3>
            <dl className="mt-2 space-y-2 border-t border-ink/15 pt-3 text-sm">
              <Row k="Qualification" v={data.qualification.title ?? 'Not given'} />
              <Row k="Documents" v={DOCUMENTS_LABEL[data.document_status]} />
              <Row
                k="Experience"
                v={
                  data.experience.length
                    ? data.experience.map((e) => `${e.title ?? 'Role'}${e.years ? `, ${e.years} yrs` : ''}`).join('; ')
                    : 'None listed'
                }
              />
              <Row k="Languages" v={data.languages.join(', ') || 'Not given'} />
            </dl>
          </>
        )}

        <footer className="mt-5 flex items-end justify-between gap-4 border-t border-ink/15 pt-4 text-xs">
          <div className="space-y-0.5">
            <p className="font-mono text-sm tracking-wider text-ink">{data.public_code}</p>
            <p className="text-ink/75">Issued {fmtDate(data.issued_at)} · valid until {fmtDate(data.expires_at)}</p>
            <p className={`font-medium ${data.hash_ok ? 'text-[#1d6b4b]' : 'text-[#9b2c2c]'}`}>
              {data.hash_ok ? '✓ Seal intact' : '✕ Seal broken: record changed after issue'}
            </p>
          </div>
          <QRCodeSVG
            value={`${window.location.origin}/verify/${data.public_code}`}
            size={64}
            bgColor="#f2e8d0"
            fgColor="#0d1c33"
            level="M"
            title={`Scan to verify ${data.public_code}`}
            className="shrink-0"
          />
        </footer>
        {!sample && <p className="mt-3 break-all font-mono text-[0.7rem] leading-relaxed text-ink/70">SHA-256 {data.record_hash}</p>}
        {sample && <p className="mt-4 text-center font-mono text-[0.7rem] uppercase tracking-[0.15em] text-ink/70">Sample · synthetic data</p>}
      </div>
    </article>
  )
}
