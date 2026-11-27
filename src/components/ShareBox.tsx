import { useState } from 'react'

/** Shown once, right after issue: the link to share and the warning that the code is the only way back. */
export default function ShareBox({ code }: { code: string }) {
  const url = `${window.location.origin}/verify/${code}`
  const [copied, setCopied] = useState<'yes' | 'no' | null>(null)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied('yes')
    } catch {
      setCopied('no')
    }
  }

  return (
    <div className="rounded-2xl border border-gold-400/40 bg-navy-900 p-5 sm:p-6">
      <p className="font-display text-2xl text-gold-300">Your passport is ready</p>
      <p className="mt-2 text-ivory/85">
        Share this link with an employer. They can open it with no login and check that the record is unchanged and still valid.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Passport link" className="min-w-0 flex-1 rounded-xl border border-ivory/25 bg-navy-950 px-4 py-3 font-mono text-sm text-ivory" />
        <button type="button" onClick={copy} className="rounded-full bg-gold-400 px-6 py-3 font-semibold text-navy-950 hover:bg-gold-300">
          Copy link
        </button>
      </div>
      <p className="mt-3 text-sm text-ivory/75" aria-live="polite">
        {copied === 'yes' && 'Link copied. '}
        {copied === 'no' && 'Could not copy automatically: select the link and copy it. '}
        There are no accounts in this prototype, so keep your code <span className="font-mono text-gold-300">{code}</span>. It is the only way back to your passport.
      </p>
    </div>
  )
}
