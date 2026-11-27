import { useEffect, useRef } from 'react'
import Inline from './Inline'
import type { Question } from '../lib/types'

interface Props {
  questions: Question[]
  index: number
  answers: Record<string, number>
  submitting: boolean
  error: string | null
  onAnswer: (id: string, option: number) => void
  onIndex: (i: number) => void
  onSubmit: () => void
}

export default function Quiz({ questions, index, answers, submitting, error, onAnswer, onIndex, onSubmit }: Props) {
  const q = questions[index]
  const head = useRef<HTMLHeadingElement>(null)
  const answered = Object.keys(answers).length
  const last = index === questions.length - 1

  // Move focus to the new question so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (index > 0) head.current?.focus()
  }, [index])

  const btn = 'rounded-full px-7 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-ivory/80">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>{answered} answered</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ivory/15" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answered} aria-label="Questions answered">
          <div className="h-full rounded-full bg-gold-400 transition-all" style={{ width: `${(answered / questions.length) * 100}%` }} />
        </div>
      </div>

      <fieldset key={q.id} className="reveal rounded-2xl border border-ivory/15 bg-ivory/[0.05] p-6 sm:p-8">
        <legend className="sr-only">
          Question {index + 1} of {questions.length}, {q.skill}
        </legend>
        <p className="text-xs font-medium uppercase tracking-widest text-bronze-400">{q.skill}</p>
        <h2 ref={head} tabIndex={-1} className="mt-2 text-xl font-medium leading-snug outline-none sm:text-2xl">
          <Inline text={q.prompt} />
        </h2>
        <div className="mt-6 space-y-3">
          {q.options.map((opt, i) => {
            const on = answers[q.id] === i
            return (
              <label
                key={i}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-300 ${
                  on ? 'border-gold-400 bg-gold-400/10' : 'border-ivory/20 hover:border-ivory/40'
                }`}
              >
                <input type="radio" name={q.id} className="sr-only" checked={on} onChange={() => onAnswer(q.id, i)} />
                <span aria-hidden="true" className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold ${on ? 'border-gold-400 bg-gold-400 text-navy-950' : 'border-ivory/40 text-ivory/80'}`}>
                  {'ABCD'[i]}
                </span>
                <span className="break-words"><Inline text={opt} /></span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {error && (
        <p className="mt-5 rounded-2xl border border-[#e08a8a]/60 bg-navy-900 p-4 text-[#f3b1b1]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" disabled={index === 0 || submitting} onClick={() => onIndex(index - 1)} className={`${btn} border border-ivory/30 hover:border-gold-400`}>
          Back
        </button>
        {last ? (
          <button type="button" disabled={submitting || answered < questions.length} onClick={onSubmit} className={`${btn} bg-gold-400 text-navy-950 hover:bg-gold-300`}>
            {submitting ? 'Scoring…' : 'Submit and get my passport'}
          </button>
        ) : (
          <button type="button" disabled={answers[q.id] === undefined} onClick={() => onIndex(index + 1)} className={`${btn} bg-gold-400 text-navy-950 hover:bg-gold-300`}>
            Next
          </button>
        )}
      </div>
      {last && answered < questions.length && (
        <p className="mt-3 text-right text-sm text-navy-300">Answer every question to submit. Use Back to find the ones you skipped.</p>
      )}
    </div>
  )
}
