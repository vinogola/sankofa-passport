import { Link, Route, Routes } from 'react-router-dom'
import Verify from './pages/Verify'

function Home() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-semibold text-gold-400">Sankofa Passport</h1>
      <p className="mt-2">Recognising experience. Unlocking opportunity.</p>
      <p className="mt-6 text-sm opacity-70">
        Stage B scaffold. Try <Link className="underline" to="/verify/SP-TEST-CODE">a verify link</Link>.
      </p>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/verify/:code" element={<Verify />} />
    </Routes>
  )
}
