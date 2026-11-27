import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, supabaseReady } from '../lib/supabase'

type Result = Record<string, unknown> & { found: boolean; status?: string; hash_ok?: boolean }

export default function Verify() {
  const { code = '' } = useParams()
  const [data, setData] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(
    supabaseReady ? null : 'Supabase is not configured (missing env vars).',
  )

  useEffect(() => {
    if (!supabaseReady) return
    supabase.rpc('verify_passport', { code }).then(({ data, error }) => {
      if (error) setError(error.message)
      else setData(data as Result)
    })
  }, [code])

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold text-gold-400">Verify a passport</h1>
      <p className="mt-1 text-sm opacity-70">Code: {code}</p>
      {error && <p className="mt-4 text-red-300">{error}</p>}
      {!data && !error && <p className="mt-4">Checking…</p>}
      {data && (
        <pre className="mt-4 overflow-auto rounded bg-navy-900 p-4 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  )
}
