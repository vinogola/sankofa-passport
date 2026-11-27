import { Link } from 'react-router-dom'
import CodeForm from '../components/CodeForm'
import Mark from '../components/Mark'
import PassportCard from '../components/PassportCard'
import SealScene from '../components/SealScene'
import { SAMPLE_CODE, SAMPLE_PASSPORT } from '../lib/sample'

const STEPS = [
  { n: '01', t: 'Show what you can do', d: 'A short assessment. No account or documents needed to start.' },
  { n: '02', t: 'Get your passport', d: 'Results become a sealed record with a public code and issue date.' },
  { n: '03', t: 'Share one link', d: 'Employers check the seal and see what was assessed and what was declared.' },
]

export default function Home() {
  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden" aria-labelledby="hero-title">
        <SealScene />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-950/30 to-transparent" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-[24vh] sm:px-10">
          <h1 id="hero-title" className="reveal font-['Fraunces'] text-[13vw] font-medium leading-[0.95] tracking-tight text-ivory sm:text-[10vw] lg:text-[8.5rem]">
            Your{' '}
            <span className="relative inline-block">
              skills
              <svg className="absolute -bottom-3 left-0 h-6 w-full text-gold-400" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 14 C 50 4, 120 4, 197 10" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
            <br />
            travel with you.
          </h1>
          <div className="reveal mt-10 max-w-md border-l-2 border-gold-400 pl-5" style={{ '--d': 1 } as React.CSSProperties}>
            <p className="text-lg leading-relaxed text-ivory/90">Let your skills speak for you.</p>
            <p className="text-lg leading-relaxed text-ivory/65">Prove what you can do, wherever you learned it.</p>
          </div>
        </div>


        <a href="#how" aria-label="Scroll to how it works" className="reveal absolute bottom-10 left-6 grid h-14 w-14 place-items-center rounded-full border border-ivory/40 text-ivory transition hover:bg-ivory/10 sm:left-10" style={{ '--d': 3 } as React.CSSProperties}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

        <Link to="/start" className="absolute bottom-10 right-6 flex items-center gap-4 rounded-full bg-gold-400 py-2 pl-2 pr-8 font-semibold text-navy-950 transition hover:bg-gold-300 sm:right-10">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-navy-950 text-gold-300">→</span>
          Get my passport
        </Link>
      </section>

      <section id="how" className="bg-navy-950 px-6 pb-28 pt-20 sm:px-10" aria-labelledby="how-title">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-ivory/60">⟡ How it works</p>
          <h2 id="how-title" className="mt-2 text-5xl font-medium tracking-tight sm:text-6xl">
            The journey, in three steps
          </h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-[1.75rem] border border-ivory/10 bg-ivory/[0.06] p-7 transition hover:bg-ivory/10">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-400 text-sm font-semibold text-navy-950">{s.n}</span>
                <h3 className="mt-5 text-2xl font-medium">{s.t}</h3>
                <p className="mt-2 text-ivory/65">{s.d}</p>
              </li>
            ))}
          </ol>

          <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-5xl font-medium tracking-tight">Check a passport</h2>
              <p className="mt-4 max-w-md text-lg font-light text-ivory/75">
                Enter a code. See what was assessed, and whether the record is intact.
              </p>
              <div className="mt-6">
                <CodeForm />
              </div>
              <p className="mt-4 text-sm text-ivory/75">
                Try a sample:{' '}
                <Link to={`/verify/${SAMPLE_CODE}`} className="font-mono text-gold-300 underline underline-offset-4">
                  {SAMPLE_CODE}
                </Link>
              </p>
            </div>
            <div className="flex justify-center">
              <PassportCard data={SAMPLE_PASSPORT} sample />
            </div>
          </div>

          <div className="mx-auto mt-28 max-w-2xl text-center">
            <Mark className="mx-auto h-12 w-12 text-gold-300" />
            <h2 className="mt-4 text-3xl font-medium">Why Sankofa</h2>
            <p className="mt-3 font-light leading-relaxed text-ivory/75">
              Sankofa is an Akan proverb and Adinkra symbol from Ghana and Côte d&apos;Ivoire, often translated as &ldquo;go
              back and get it&rdquo;: what you learned in the past is not lost. The bird mark is an original drawing inspired
              by it.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
