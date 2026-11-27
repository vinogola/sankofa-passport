import { Link } from 'react-router-dom'
import PageBand from '../components/PageBand'

export default function NotFound() {
  return (
    <PageBand>
      <h1 className="text-5xl font-medium tracking-tight sm:text-6xl">Page not found</h1>
      <p className="mt-4 text-lg font-light text-ivory/80">There is nothing at this address. Passport codes look like SP-XXXX-XXXX.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="rounded-full bg-gold-400 px-7 py-3 font-semibold text-navy-950 hover:bg-gold-300">
          Home
        </Link>
        <Link to="/verify" className="rounded-full border border-ivory/30 px-7 py-3 hover:border-gold-400">
          Verify a passport
        </Link>
      </div>
    </PageBand>
  )
}
