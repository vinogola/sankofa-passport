import { Link } from 'react-router-dom'
import Mark from '../components/Mark'

/** Original design C (purple/orange dusk), kept for comparison. After Codos. */
function Scene() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1830" />
          <stop offset="0.45" stopColor="#3a3150" />
          <stop offset="0.72" stopColor="#c56a3c" />
          <stop offset="1" stopColor="#f1b56b" />
        </linearGradient>
        <linearGradient id="road-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6c98a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#e7a15d" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#sky-c)" />
      <circle cx="1060" cy="600" r="90" fill="#ffd9a0" opacity="0.85" />
      <path d="M0 640 Q 300 560 620 610 T 1180 590 T 1600 600 V1000 H0Z" fill="#7a3f2a" opacity="0.75" />
      <path d="M0 700 Q 380 630 760 690 T 1600 660 V1000 H0Z" fill="#4a2a24" />
      <path d="M0 800 Q 420 720 900 790 T 1600 760 V1000 H0Z" fill="#2a1a1d" />
      <path d="M1052 668 C 1040 740 900 790 880 860 C 860 920 900 970 960 1000 L 760 1000 C 700 960 690 900 740 840 C 800 770 1030 730 1046 668Z" fill="url(#road-c)" />
      <path d="M0 900 Q 500 840 1000 900 T 1600 880 V1000 H0Z" fill="#140d12" />
    </svg>
  )
}

export default function HeroPath() {
  return (
    <section className="relative min-h-screen overflow-hidden font-['Instrument_Sans'] text-white">
      <Scene />
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" aria-hidden="true" />

      <header className="relative flex items-center justify-between px-6 py-6 sm:px-10">
        <Link to="/" className="grid h-14 w-14 place-items-center rounded-full border-2 border-white/80" aria-label="Sankofa Passport home">
          <Mark className="h-8 w-8" />
        </Link>
        <Link to="/verify" className="rounded-full bg-white/15 px-6 py-3 text-sm font-medium backdrop-blur">
          Verify a passport
        </Link>
      </header>

      <div className="relative px-6 pb-24 pt-[18vh] sm:px-10">
        <h1 className="reveal text-[17vw] font-medium leading-[0.9] tracking-tight sm:text-[12vw] lg:text-[9.5rem]">
          Every skill
          <br />
          counts.
        </h1>
        <p className="reveal mt-6 max-w-md text-xl font-light text-white/90" style={{ '--d': 1 } as React.CSSProperties}>
          Sankofa Passport recognises what you already know, wherever you learned it, and shows it to employers who
          need it.
        </p>
        <a href="#how" aria-label="Scroll down" className="reveal mt-10 grid h-16 w-16 place-items-center rounded-full bg-white text-black" style={{ '--d': 2 } as React.CSSProperties}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      <div className="pointer-events-none absolute right-[14%] top-[34%] hidden items-start gap-3 lg:flex" aria-hidden="true">
        <div className="flex flex-col items-center">
          <div className="grid h-20 w-20 place-items-center rounded-full border border-dashed border-white/70">
            <Mark className="h-9 w-9" />
          </div>
          <span className="h-24 border-l border-dashed border-white/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
        </div>
        <div className="mt-2 text-sm leading-snug text-white/85">
          Web developer
          <br />
          Proficient · sealed
          <br />
          <span className="font-mono text-xs text-white/60">SP-SAMP-LE00</span>
        </div>
      </div>

      <Link
        to="/start"
        className="absolute bottom-10 right-6 flex items-center gap-4 rounded-full bg-gradient-to-r from-[#f1b56b] to-[#e07b45] py-2 pl-2 pr-8 font-semibold text-black sm:right-10"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-black text-white">→</span>
        Get my passport
      </Link>
    </section>
  )
}
