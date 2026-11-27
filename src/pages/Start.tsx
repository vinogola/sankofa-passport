import { Link } from 'react-router-dom'
import PageBand from '../components/PageBand'

export default function Start() {
  return (
    <PageBand>
      <h1 className="text-5xl font-medium tracking-tight sm:text-6xl">The assessment opens soon</h1>
      <p className="mt-4 text-lg font-light text-ivory/80">This prototype is still being built. You can already check how a finished passport looks.</p>
      <Link to="/verify" className="mt-8 inline-block rounded-full bg-gold-400 px-7 py-3 font-semibold text-navy-950 hover:bg-gold-300">
        Verify a passport
      </Link>
    </PageBand>
  )
}
