import { useState } from 'react'
import { CHECKS } from '../lib/readiness'
import { professionLabel } from '../lib/types'
import type { ProfileInput, RoleInput } from '../lib/types'

const field =
  'mt-2 w-full rounded-xl border border-ivory/25 bg-navy-900 px-4 py-3 text-ivory outline-none placeholder:text-ivory/55 focus:border-gold-400'
const label = 'block text-sm font-medium text-ivory'
const hint = 'mt-1 text-xs text-navy-300'

const DOCS: { value: ProfileInput['document_status']; title: string; text: string }[] = [
  { value: 'full', title: 'Full documents', text: 'I have my certificates and transcripts.' },
  { value: 'partial', title: 'Some documents', text: 'I have part of my records.' },
  { value: 'none', title: 'No documents', text: 'I could not bring or recover them.' },
]

interface Props {
  value: ProfileInput
  professions: string[]
  onChange: (p: ProfileInput) => void
  onNext: () => void
}

export default function ProfileForm({ value, professions, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = <K extends keyof ProfileInput>(k: K, v: ProfileInput[K]) => onChange({ ...value, [k]: v })
  const setRole = (i: number, patch: Partial<RoleInput>) =>
    set('roles', value.roles.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!value.display_name.trim()) next.display_name = 'Enter a name to show on the passport.'
    if (value.display_name.trim().length > 60) next.display_name = 'Use 60 characters or fewer.'
    if (!value.profession) next.profession = 'Choose what you are being assessed in.'
    if (!value.document_status) next.document_status = 'Choose the option that fits best.'
    value.roles.forEach((r, i) => {
      if (r.years && (!/^\d{1,2}$/.test(r.years.trim()) || Number(r.years) > 60)) next[`years${i}`] = 'Whole years from 0 to 60, for example 3.'
    })
    setErrors(next)
    if (Object.keys(next).length === 0) onNext()
    else document.getElementById(`err-${Object.keys(next)[0]}`)?.scrollIntoView({ block: 'center' })
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`err-${k}`} className="mt-1 text-sm text-[#f3b1b1]" role="alert">
        {errors[k]}
      </p>
    ) : null

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <p className="rounded-2xl border border-gold-400/30 bg-gold-400/10 p-4 text-sm text-ivory/85">
        This is a prototype. Please use a made-up name and details. Nothing you enter about yourself is checked. It
        appears on the passport marked as self-declared, apart from the assessment result.
      </p>

      <fieldset className="space-y-5 rounded-2xl border border-ivory/15 bg-ivory/[0.05] p-6">
        <legend className="px-2 font-display text-2xl">About you</legend>
        <div>
          <label htmlFor="name" className={label}>
            Name on the passport
          </label>
          <input
            id="name"
            className={field}
            value={value.display_name}
            onChange={(e) => set('display_name', e.target.value)}
            autoComplete="off"
            maxLength={60}
            aria-invalid={Boolean(errors.display_name)}
            aria-describedby={errors.display_name ? 'err-display_name' : undefined}
          />
          {err('display_name')}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="country" className={label}>
              Country of origin <span className="font-normal text-navy-300">(optional)</span>
            </label>
            <input id="country" className={field} value={value.origin_country} onChange={(e) => set('origin_country', e.target.value)} autoComplete="off" maxLength={60} />
          </div>
          <div>
            <label htmlFor="langs" className={label}>
              Languages <span className="font-normal text-navy-300">(optional)</span>
            </label>
            <input id="langs" className={field} value={value.languages} onChange={(e) => set('languages', e.target.value)} placeholder="Arabic, English" autoComplete="off" />
            <p className={hint}>Separate with commas.</p>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5 rounded-2xl border border-ivory/15 bg-ivory/[0.05] p-6">
        <legend className="px-2 font-display text-2xl">Your qualification</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="qual" className={label}>
              Qualification <span className="font-normal text-navy-300">(optional)</span>
            </label>
            <input id="qual" className={field} value={value.qualification_title} onChange={(e) => set('qualification_title', e.target.value)} placeholder="BSc Computer Science" autoComplete="off" />
          </div>
          <div>
            <label htmlFor="inst" className={label}>
              Institution <span className="font-normal text-navy-300">(optional)</span>
            </label>
            <input id="inst" className={field} value={value.qualification_institution} onChange={(e) => set('qualification_institution', e.target.value)} autoComplete="off" />
          </div>
        </div>
        <div role="radiogroup" aria-labelledby="docs-label" aria-describedby={errors.document_status ? 'err-document_status' : undefined}>
          <p id="docs-label" className={label}>
            Can you show documents for it?
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {DOCS.map((d) => (
              <label
                key={d.value}
                className={`cursor-pointer rounded-xl border p-4 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-300 ${
                  value.document_status === d.value ? 'border-gold-400 bg-gold-400/10' : 'border-ivory/20 hover:border-ivory/40'
                }`}
              >
                <input type="radio" name="docs" className="sr-only" checked={value.document_status === d.value} onChange={() => set('document_status', d.value)} />
                <span className="block font-medium">{d.title}</span>
                <span className="mt-1 block text-sm text-ivory/75">{d.text}</span>
              </label>
            ))}
          </div>
          {err('document_status')}
        </div>
      </fieldset>

      <fieldset className="space-y-5 rounded-2xl border border-ivory/15 bg-ivory/[0.05] p-6">
        <legend className="px-2 font-display text-2xl">Past roles</legend>
        <p className="text-sm text-ivory/75">Up to three. These show on the passport as self-declared, not verified.</p>
        {value.roles.map((r, i) => (
          <div key={i} className="grid gap-4 border-t border-ivory/10 pt-5 first:border-0 first:pt-0 sm:grid-cols-[2fr_1fr_2fr]">
            <div>
              <label htmlFor={`rt${i}`} className={label}>
                Role {i + 1}
              </label>
              <input id={`rt${i}`} className={field} value={r.title} onChange={(e) => setRole(i, { title: e.target.value })} placeholder="Front-end developer" autoComplete="off" />
            </div>
            <div>
              <label htmlFor={`ry${i}`} className={label}>
                Years
              </label>
              <input id={`ry${i}`} className={field} inputMode="numeric" value={r.years} onChange={(e) => setRole(i, { years: e.target.value })} aria-invalid={Boolean(errors[`years${i}`])} aria-describedby={errors[`years${i}`] ? `err-years${i}` : undefined} autoComplete="off" />
              {err(`years${i}`)}
            </div>
            <div>
              <label htmlFor={`rr${i}`} className={label}>
                Referee <span className="font-normal text-navy-300">(optional)</span>
              </label>
              <input id={`rr${i}`} className={field} value={r.referee} onChange={(e) => setRole(i, { referee: e.target.value })} autoComplete="off" />
            </div>
          </div>
        ))}
        {value.roles.length < 3 && (
          <button
            type="button"
            onClick={() => set('roles', [...value.roles, { title: '', years: '', referee: '' }])}
            className="rounded-full border border-ivory/30 px-5 py-2 text-sm hover:border-gold-400 hover:text-gold-300"
          >
            Add another role
          </button>
        )}
      </fieldset>

      <fieldset className="rounded-2xl border border-ivory/15 bg-ivory/[0.05] p-6">
        <legend className="px-2 font-display text-2xl">Ready for work?</legend>
        <p className="text-sm text-ivory/75">
          Optional. Tick what is true today. It shows on the passport as self-declared, and your passport page lists next steps for the rest.
        </p>
        <div className="mt-3 space-y-2">
          {CHECKS.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-ivory/15 p-3 has-[:checked]:border-gold-400 has-[:checked]:bg-gold-400/10 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-300">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-gold-400"
                checked={value.checks.includes(c.id)}
                onChange={(e) => set('checks', e.target.checked ? [...value.checks, c.id] : value.checks.filter((x) => x !== c.id))}
              />
              <span className="text-sm">{c.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-ivory/15 bg-ivory/[0.05] p-6">
        <legend className="px-2 font-display text-2xl">What to assess</legend>
        <label htmlFor="prof" className={label}>
          Profession
        </label>
        <select
          id="prof"
          className={field}
          value={value.profession}
          onChange={(e) => set('profession', e.target.value)}
          aria-invalid={Boolean(errors.profession)}
          aria-describedby={errors.profession ? 'err-profession' : undefined}
        >
          <option value="">Choose…</option>
          {professions.map((p) => (
            <option key={p} value={p}>
              {professionLabel(p)}
            </option>
          ))}
        </select>
        {err('profession')}
        <p className={hint}>
          You will answer questions on this profession, then a short workplace-readiness set that everyone takes. Fifteen questions in all.
        </p>
      </fieldset>

      <p className="max-w-2xl text-sm text-ivory/75">
        This is a prototype: use made-up details. Your record is stored in a database, anyone who has your passport code, and the people running this prototype, can read it, and there is no way to delete a record yet.
      </p>
      <button type="submit" className="rounded-full bg-gold-400 px-8 py-3.5 font-semibold text-navy-950 hover:bg-gold-300">
        Start the assessment
      </button>
    </form>
  )
}
