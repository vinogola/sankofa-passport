import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CodeForm({ initial = '' }: { initial?: string }) {
  const [code, setCode] = useState(initial)
  const navigate = useNavigate()
  return (
    <form
      className="flex w-full max-w-md items-center gap-2 rounded-full border border-ivory/15 bg-ivory/10 p-2 backdrop-blur"
      onSubmit={(e) => {
        e.preventDefault()
        const c = code.trim().toUpperCase()
        if (c) navigate(`/verify/${encodeURIComponent(c)}`)
      }}
    >
      <label className="sr-only" htmlFor="code">
        Passport code
      </label>
      <input
        id="code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="SP-XXXX-XXXX"
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent px-4 py-2 font-mono uppercase tracking-wider text-ivory outline-none placeholder:text-ivory/55"
      />
      <button
        type="submit"
        aria-label="Check passport"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-400 text-navy-950 transition hover:bg-gold-300"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  )
}
