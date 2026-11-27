/** Original Sankofa-inspired mark: a bird with its feet forward and its head turned back to fetch an egg. */
export default function Mark({ className = 'h-10 w-10', title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M18 40c0-10 10-15 20-13s14 10 11 17c-3 7-13 9-21 6-7-2-10-5-10-10Z" />
      <path d="M18 40c-8 0-12-7-10-15 1-4 4-6 7-5" />
      <path d="M46 31c6-9 2-19-8-20-7-1-13 3-13 9" />
      <circle cx="24.5" cy="22" r="3.4" />
      <circle cx="25.4" cy="21.4" r="0.9" fill="currentColor" stroke="none" />
      <path d="M21.4 23.6 15.5 27l5.6.6" />
      <ellipse cx="13" cy="31.5" rx="2.6" ry="3.4" />
      <path d="M30 51v8h6M41 50v9h6" />
    </svg>
  )
}
