import Mark from './Mark'

/** Hero background: navy night with faint stars and a large engraved seal (rosette) carrying the bird and the tagline. Decorative. */
const STARS = Array.from({ length: 60 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1
  return { x: r(1) * 100, y: r(2) * 100, s: 1 + r(3) * 1.5, o: 0.25 + r(4) * 0.5 }
})

export default function SealScene() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-navy-950" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(44rem_36rem_at_80%_55%,rgba(29,58,96,0.7),transparent_70%)]" />
      {STARS.map((s, i) => (
        <span key={i} className="absolute rounded-full bg-ivory" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, opacity: s.o }} />
      ))}
      <div className="absolute right-[-11rem] top-[78%] h-[28rem] w-[28rem] -translate-y-1/2 text-gold-400 opacity-40 sm:right-[-6rem] sm:top-1/2 sm:h-[40rem] sm:w-[40rem] sm:opacity-100 lg:right-[-2rem] xl:right-[3%]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 400">
          <defs>
            <path id="ring-text" d="M200 200 m -150 0 a 150 150 0 1 1 300 0 a 150 150 0 1 1 -300 0" />
          </defs>
          {[190, 178, 128, 118].map((r) => (
            <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeOpacity={r > 150 ? 0.35 : 0.2} strokeWidth="1" />
          ))}
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i * 5 * Math.PI) / 180
            return <line key={i} x1={200 + Math.cos(a) * 178} y1={200 + Math.sin(a) * 178} x2={200 + Math.cos(a) * 190} y2={200 + Math.sin(a) * 190} stroke="currentColor" strokeOpacity="0.3" />
          })}
          <text fill="currentColor" fillOpacity="0.55" fontSize="13" letterSpacing="6" fontFamily="IBM Plex Mono, monospace">
            <textPath href="#ring-text">RECOGNISING EXPERIENCE · UNLOCKING OPPORTUNITY · SANKOFA PASSPORT ·</textPath>
          </text>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <Mark className="h-[34%] w-[34%] opacity-80" />
        </div>
      </div>
    </div>
  )
}
