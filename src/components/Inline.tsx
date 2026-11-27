/** Renders `backtick` spans as inline code. Question text uses them for code. */
export default function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, i) =>
        i % 2 ? (
          <code key={i} className="rounded bg-ivory/10 px-1.5 py-0.5 font-mono text-[0.9em] text-gold-300">
            {part}
          </code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}
