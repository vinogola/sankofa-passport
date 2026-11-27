import { CHECKS, NOT_ADVICE, NO_FEE_NOTE, SOURCES, tickedChecks } from '../lib/readiness'
import type { Passport } from '../lib/types'

function Src({ id }: { id: keyof typeof SOURCES }) {
  const s = SOURCES[id]
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-gold-300 underline underline-offset-2 hover:text-gold-400">
      {s.label}
    </a>
  )
}

/** Bridging next steps for the candidate: what is still open on the checklist, plus skills to build. Collapsed by default so an employer's view stays clean. */
export default function NextSteps({ data }: { data: Passport }) {
  const ticked = tickedChecks(data.readiness)
  const open = CHECKS.filter((c) => !ticked.includes(c.id))
  const weak = data.results.filter((r) => r.level === 'bridging')

  return (
    <details className="mx-auto max-w-3xl rounded-2xl border border-ivory/15 bg-ivory/[0.05] p-5 text-sm text-ivory/85 sm:p-6">
      <summary className="cursor-pointer font-display text-xl text-ivory">For the candidate: next steps</summary>
      <div className="mt-4 space-y-5">
        {open.length > 0 ? (
          <div>
            <p className="font-medium text-ivory">Still to do on your work-readiness list</p>
            <ul className="mt-2 space-y-3">
              {open.map((c) => (
                <li key={c.id} className="border-l-2 border-gold-400/60 pl-3">
                  <p className="text-ivory">{c.title}</p>
                  <p className="mt-0.5">
                    {c.todo} <Src id={c.source} />
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>You ticked every item on the work-readiness list. Keep the originals where you can find them.</p>
        )}

        {weak.length > 0 && (
          <div>
            <p className="font-medium text-ivory">Skills to build</p>
            <p className="mt-1">
              {weak.map((r) => r.skill).join(', ')} scored under 60%. UNHCR lists free training programmes (language, digital skills, vocational
              training) and says it and its partners often offer them. <Src id="unhcr" />
            </p>
          </div>
        )}

        <div>
          <p className="font-medium text-ivory">Before you apply</p>
          <p className="mt-1">
            {NO_FEE_NOTE} <Src id="ilo" />
          </p>
        </div>

        <p className="text-xs text-ivory/70">{NOT_ADVICE}</p>
      </div>
    </details>
  )
}
