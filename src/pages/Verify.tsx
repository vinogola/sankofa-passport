import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import CodeForm from '../components/CodeForm'
import PageBand from '../components/PageBand'
import Certificate from '../components/Certificate'
import ShareBox from '../components/ShareBox'
import { supabase, supabaseReady } from '../lib/supabase'
import { fmtDate } from '../lib/types'
import type { VerifyResult } from '../lib/types'

export default function Verify() {
  const { code = '' } = useParams()
  const issued = Boolean((useLocation().state as { issued?: boolean } | null)?.issued)
  const [data, setData] = useState<VerifyResult | null>(null)
  const [error, setError] = useState<string | null>(
    supabaseReady ? null : 'Verification is not configured on this deployment.',
  )

  useEffect(() => {
    if (!supabaseReady || !code) return
    let live = true
    supabase.rpc('verify_passport', { code }).then(({ data, error }) => {
      if (!live) return
      if (error) setError('We could not check this code right now. Please try again.')
      else setData(data as VerifyResult)
    })
    return () => {
      live = false
    }
  }, [code])

  const loading = Boolean(code) && !data && !error

  return (
    <>
    <PageBand>
      <h1 className="reveal text-5xl font-medium tracking-tight sm:text-6xl">Verify a passport</h1>
      <p className="reveal mt-3 max-w-xl text-ivory/80" style={{ '--d': 1 } as React.CSSProperties}>
        Enter a passport code to see what was assessed and whether the record is intact.
      </p>
      <div className="reveal mt-6" style={{ '--d': 2 } as React.CSSProperties}>
        <CodeForm key={code} initial={code} />
      </div>
    </PageBand>
    <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">

      <div className="mt-4" aria-live="polite">
        {loading && <p className="text-navy-300">Checking {code}…</p>}
        {error && <p className="rounded-2xl border border-[#e08a8a]/60 bg-navy-900 p-4 text-[#f3b1b1]">{error}</p>}
        {data && !data.found && (
          <div className="rounded-2xl border border-ivory/15 bg-ivory/[0.05] p-6">
            <p className="text-2xl font-medium text-gold-300">No passport found</p>
            <p className="mt-2 text-ivory/80">
              There is no passport with the code <span className="font-mono">{code}</span>. Check the code with the
              candidate and try again. Codes look like SP-XXXX-XXXX.
            </p>
          </div>
        )}
        {data && data.found && (
          <div className="space-y-5">
            {issued && <ShareBox code={data.public_code} />}
            {data.hash_ok && data.status === 'valid' ? (
              <div className="flex items-start gap-4 rounded-2xl border border-gold-400/40 bg-gold-400/10 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-400 font-bold text-navy-950" aria-hidden="true">✓</span>
                <div>
                  <p className="text-lg font-semibold">Verified: record intact and valid</p>
                  <p className="text-sm text-ivory/75">
                    Issued {fmtDate(data.issued_at)} · valid until {fmtDate(data.expires_at)} · SHA-256 seal matches
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 rounded-2xl border border-[#e08a8a]/60 bg-[#9b2c2c]/20 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#9b2c2c] font-bold text-ivory" aria-hidden="true">!</span>
                <div>
                  <p className="text-lg font-semibold">Do not rely on this record</p>
                  <p className="text-sm text-ivory/80">
                    {!data.hash_ok
                      ? 'The record no longer matches the seal it was issued with. It was changed after issue.'
                      : `This passport is ${data.status}. Treat the details below as history only.`}
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-center">
              <Certificate data={data} />
            </div>
          </div>
        )}
      </div>
    </section>
    </>
  )
}
