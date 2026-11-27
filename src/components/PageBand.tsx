/** Short plain band at the top of inner pages; the header sits on it. */
export default function PageBand({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-b from-navy-900 to-navy-950">
      <div className="mx-auto max-w-3xl px-6 pb-10 pt-36">{children}</div>
    </div>
  )
}
