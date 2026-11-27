import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageBand from '../components/PageBand'
import ProfileForm from '../components/ProfileForm'
import Quiz from '../components/Quiz'
import { supabase, supabaseReady } from '../lib/supabase'
import { EMPTY_PROFILE, buildProfile } from '../lib/types'
import type { ProfileInput, Question } from '../lib/types'

const DRAFT_KEY = 'sankofa-draft'

interface Draft {
  profile: ProfileInput
  step: 'profile' | 'quiz'
  index: number
  answers: Record<string, number>
}

/** Unfinished form from this browser tab, so a refresh does not lose it. Never sent anywhere. */
function loadDraft(): Draft | null {
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null') as Partial<Draft> | null
    if (!d || typeof d !== 'object' || !d.profile || !Array.isArray(d.profile.roles) || !d.profile.roles.length) return null
    return {
      profile: { ...EMPTY_PROFILE, ...d.profile },
      step: d.step === 'quiz' && d.profile.profession ? 'quiz' : 'profile',
      index: Number.isInteger(d.index) ? (d.index as number) : 0,
      answers: d.answers && typeof d.answers === 'object' ? d.answers : {},
    }
  } catch {
    return null
  }
}

export default function Start() {
  const navigate = useNavigate()
  const [draft] = useState(loadDraft)
  const [all, setAll] = useState<Question[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(
    supabaseReady ? null : 'The assessment is not configured on this deployment.',
  )
  const [profile, setProfile] = useState<ProfileInput>(draft?.profile ?? EMPTY_PROFILE)
  const [step, setStep] = useState<'profile' | 'quiz'>(draft?.step ?? 'profile')
  const [index, setIndex] = useState(draft?.index ?? 0)
  const [answers, setAnswers] = useState<Record<string, number>>(draft?.answers ?? {})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabaseReady) return
    let live = true
    supabase
      .from('questions')
      .select('id, bank, skill, prompt, options, sort')
      .order('sort')
      .then(({ data, error }) => {
        if (!live) return
        if (error || !data?.length) setLoadError('We could not load the questions right now. Please try again.')
        else setAll(data as Question[])
      })
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ profile, step, index, answers }))
    } catch {
      /* storage blocked: the form still works, it just will not survive a refresh */
    }
  }, [profile, step, index, answers])

  const professions = all ? [...new Set(all.map((q) => q.bank).filter((b) => b !== 'workplace'))] : []
  // Profession questions first, then the workplace set everyone takes.
  const questions = all
    ? [...all.filter((q) => q.bank === profile.profession), ...all.filter((q) => q.bank === 'workplace')]
    : []

  const inQuiz = step === 'quiz' && professions.includes(profile.profession) && questions.length > 0

  async function submit() {
    setSubmitting(true)
    setSubmitError(null)
    const { data, error } = await supabase.rpc('submit_assessment', {
      payload: { profile: buildProfile(profile), answers },
    })
    if (error || !data?.public_code) {
      setSubmitting(false)
      setSubmitError('We could not issue your passport. Your answers are still here: please try again.')
      return
    }
    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch {
      /* ignore */
    }
    navigate(`/verify/${data.public_code}`, { state: { issued: true } })
  }

  function begin() {
    setAnswers({})
    setIndex(0)
    setStep('quiz')
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <PageBand>
        <p className="reveal text-sm font-medium uppercase tracking-widest text-bronze-400">
          Step {inQuiz ? 2 : 1} of 2 · {inQuiz ? 'Assessment' : 'Your details'}
        </p>
        <h1 className="reveal mt-3 text-5xl font-medium tracking-tight sm:text-6xl" style={{ '--d': 1 } as React.CSSProperties}>
          {inQuiz ? 'Show what you can do' : 'Build your passport'}
        </h1>
        <p className="reveal mt-3 max-w-xl text-ivory/80" style={{ '--d': 2 } as React.CSSProperties}>
          {!inQuiz
            ? 'Tell us a little about you, then answer a short set of questions. Your result becomes a passport an employer can check with one link.'
            : 'One question at a time. Your answers are scored on the server, and nobody can change the score afterwards.'}
        </p>
      </PageBand>
      <section className="mx-auto max-w-3xl px-4 pb-24 pt-2 sm:px-6">
        {loadError && (
          <p className="rounded-2xl border border-[#e08a8a]/60 bg-navy-900 p-4 text-[#f3b1b1]" role="alert">
            {loadError}
          </p>
        )}
        {!loadError && !all && <p className="text-navy-300">Loading…</p>}
        {all && !inQuiz && <ProfileForm value={profile} professions={professions} onChange={setProfile} onNext={begin} />}
        {inQuiz && (
          <Quiz
            questions={questions}
            index={Math.min(index, questions.length - 1)}
            answers={answers}
            submitting={submitting}
            error={submitError}
            onAnswer={(id, o) => setAnswers((a) => ({ ...a, [id]: o }))}
            onIndex={setIndex}
            onSubmit={submit}
          />
        )}
      </section>
    </>
  )
}
