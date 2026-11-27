import { QRCodeSVG } from 'qrcode.react'
import Mark from './Mark'
import { DOCUMENTS_LABEL, LEVEL_KEY, LEVEL_LABEL, experienceLine, fmtDate, professionLabel, qualificationTitle } from '../lib/types'
import type { Passport, Status } from '../lib/types'

/** Landscape certificate: the full assessed record shown on /verify. */

const STATUS: Record<Status, { label: string; cls: string }> = {
  valid: { label: 'Valid', cls: 'border-[#1d6b4b] text-[#1d6b4b]' },
  expired: { label: 'Expired', cls: 'border-bronze-800 text-bronze-800' },
  revoked: { label: 'Revoked', cls: 'border-[#9b2c2c] text-[#9b2c2c]' },
}

export default function Certificate({ data }: { data: Passport }) {
  const status = STATUS[data.status]
  const verifyUrl = `${window.location.origin}/verify/${data.public_code}`
  const experience = experienceLine(data.experience)

  return (
    <article className="w-full max-w-3xl bg-parchment p-2 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] sm:p-3" aria-label={`Assessed skills record for ${data.display_name}`}>
      <div className="border-2 border-bronze-700/60 p-1">
        <div className="relative border border-bronze-700/40 px-5 py-8 text-center sm:px-12">
          <span className={`absolute right-4 top-4 rounded-sm border px-2 py-0.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.15em] sm:right-6 sm:top-6 ${status.cls}`}>
            {status.label}
          </span>
          <Mark className="mx-auto h-10 w-10 text-bronze-800" />
          <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-bronze-800">Sankofa Passport</p>
          <h2 className="mt-1 font-display text-2xl sm:text-4xl">Assessed Skills Record</h2>

          <p className="mt-6 text-sm text-ink/70">This records that</p>
          <p className="mt-1 break-words font-display text-4xl sm:text-5xl">{data.display_name}</p>
          <p className="mt-2 text-sm text-ink/75">
            {professionLabel(data.profession)} · {data.origin_country ?? 'Origin not given'}
          </p>
          <p className="mt-1 text-[0.7rem] text-ink/70">Name and origin are declared by the candidate and were not checked.</p>

          <p className="mt-6 text-sm text-ink/70">scored as follows in an online assessment</p>
          <ul className="mx-auto mt-3 grid max-w-xl grid-cols-1 gap-2 sm:grid-cols-3">
            {data.results.map((r) => (
              <li key={`${r.bank}-${r.skill}`} className="border-y border-ink/15 py-2">
                <p className="font-medium">{r.skill}</p>
                <p className="text-xs text-ink/70">
                  {LEVEL_LABEL[r.level]} · {Math.round(r.score * 100)}%
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.7rem] text-ink/70">{LEVEL_KEY}</p>
          <p className="mt-1 text-sm">
            Overall: <strong className="font-semibold">{LEVEL_LABEL[data.overall_level]}</strong>
          </p>

          <div className="mx-auto mt-7 max-w-xl text-left">
            <p className="text-center font-mono text-[0.7rem] uppercase tracking-[0.15em] text-bronze-800">Self-declared · not verified</p>
            <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 border-t border-ink/15 pt-3 text-sm sm:grid-cols-2">
              {[
                ['Qualification', qualificationTitle(data.qualification)],
                ['Documents', DOCUMENTS_LABEL[data.document_status]],
                ['Experience', experience],
                ['Languages', data.languages.join(', ') || 'Not given'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-ink/70">{k}</dt>
                  <dd className="min-w-0 break-words text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 grid grid-cols-[auto_1fr_auto] items-end gap-3 text-left text-xs sm:gap-4">
            <div
              className={`grid h-20 w-20 place-items-center rounded-full border-2 border-dashed text-center font-mono text-[0.6rem] uppercase leading-tight tracking-wider ${data.hash_ok ? 'border-[#1d6b4b]/70 text-[#1d6b4b]' : 'border-[#9b2c2c]/70 text-[#9b2c2c]'}`}
            >
              Seal
              <br />
              SHA-256
              <br />
              {data.hash_ok ? '✓ unchanged' : '✕ changed'}
            </div>
            <div className="text-center">
              <p className="font-display text-lg italic">Sankofa Passport</p>
              <p className="border-t border-ink/40 pt-1 uppercase tracking-wider text-ink/70">Issued by Sankofa Passport · not an accredited issuer</p>
              <p className="mt-1 text-ink/75">
                Issued {fmtDate(data.issued_at)} · valid until {fmtDate(data.expires_at)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <QRCodeSVG value={verifyUrl} size={64} bgColor="#f2e8d0" fgColor="#0d1c33" level="M" title={`Scan to verify ${data.public_code}`} />
              <p className="font-mono text-[0.7rem]">{data.public_code}</p>
            </div>
          </div>

          <p className="mt-6 break-all font-mono text-[0.7rem] leading-relaxed text-ink/70">SHA-256 {data.record_hash}</p>
          <p className="mt-2 text-[0.7rem] text-ink/70">Synthetic data for the prototype. Not legal, immigration or employment advice.</p>
        </div>
      </div>
    </article>
  )
}
