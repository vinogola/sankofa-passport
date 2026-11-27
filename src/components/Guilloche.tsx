/** Fine engraved wave lines, the texture of security documents. Decorative only. */
export default function Guilloche({ className = '' }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" width="100%" height="100%">
      <defs>
        <pattern id="guilloche" width="72" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10Q18 -2 36 10T72 10" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <path d="M0 10Q18 22 36 10T72 10" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <path d="M0 10Q18 4 36 10T72 10" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <path d="M0 10Q18 16 36 10T72 10" fill="none" stroke="currentColor" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#guilloche)" />
    </svg>
  )
}
