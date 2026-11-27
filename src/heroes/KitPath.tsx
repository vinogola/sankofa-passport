import Mark from '../components/Mark'
import { P, STEPS, fmt, levelLabel, profession } from './kitData'

function Passport() {
  return (
    <article className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/10 text-white shadow-2xl backdrop-blur-xl">
      <div className="relative h-28 bg-gradient-to-br from-[#f1b56b] via-[#e07b45] to-[#3a3150] px-6 py-5">
        <div className="flex items-center justify-between">
          <Mark className="h-9 w-9" />
          <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-medium">● Valid</span>
        </div>
        <p className="absolute bottom-4 left-6 text-xs uppercase tracking-[0.25em] text-white/85">Sankofa Passport</p>
      </div>
      <div className="px-6 py-6">
        <p className="text-3xl font-medium tracking-tight">{P.display_name}</p>
        <p className="mt-1 text-white/70">{profession} · {P.origin_country}</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {P.results.map((r) => (
            <div key={r.skill} className="rounded-2xl bg-white/10 p-3 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: `conic-gradient(#f1b56b ${r.score * 360}deg, rgba(255,255,255,0.15) 0)` }}>
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#2a1f2d] text-sm font-semibold">{Math.round(r.score * 100)}</div>
              </div>
              <p className="mt-2 text-xs leading-tight">{r.skill}</p>
              <p className="text-[0.65rem] text-white/60">{levelLabel[r.level]}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between text-xs text-white/70">
          <span className="font-mono">{P.public_code}</span>
          <span>✓ Sealed · {fmt(P.expires_at)}</span>
        </div>
      </div>
    </article>
  )
}

export default function KitPath() {
  return (
    <section id="how" className="bg-gradient-to-b from-[#140d12] to-[#2a1f2d] px-6 pb-28 pt-20 font-['Instrument_Sans'] text-white sm:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm text-white/60">⟡ How it works</p>
        <h2 className="mt-2 text-6xl font-medium tracking-tight">The journey, in three steps</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-7 backdrop-blur transition hover:bg-white/10">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#f1b56b] to-[#e07b45] text-sm font-semibold text-black">{s.n}</span>
              <p className="mt-5 text-2xl font-medium">{s.t}</p>
              <p className="mt-2 text-white/65">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-5xl font-medium tracking-tight">Check a passport</h2>
            <p className="mt-4 max-w-md text-lg font-light text-white/75">Enter a code. See what was assessed, and whether the record is intact.</p>
            <div className="mt-6 flex max-w-md items-center gap-2 rounded-full bg-white/10 p-2 backdrop-blur">
              <input className="min-w-0 flex-1 bg-transparent px-4 font-mono uppercase outline-none placeholder:text-white/40" placeholder="SP-XXXX-XXXX" aria-label="Passport code" />
              <button className="grid h-11 w-11 place-items-center rounded-full bg-white text-black" aria-label="Check">→</button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f1b56b] to-[#e07b45] py-1.5 pl-1.5 pr-6 font-semibold text-black">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white">→</span>Primary
              </button>
              <button className="rounded-full bg-white/15 px-6 py-3 backdrop-blur">Secondary</button>
              <button className="rounded-full border border-white/40 px-6 py-3">Outline</button>
            </div>
          </div>
          <div className="flex justify-center"><Passport /></div>
        </div>
      </div>
    </section>
  )
}
