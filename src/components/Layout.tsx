import { Link, Outlet, useLocation } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary'
import Mark from './Mark'

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-gold-400 focus:px-3 focus:py-2 focus:text-navy-950">
        Skip to content
      </a>
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
          <Link to="/" className="grid h-14 w-14 place-items-center rounded-full border-2 border-ivory/80 text-ivory" aria-label="Sankofa Passport home">
            <Mark className="h-8 w-8" />
          </Link>
          <nav aria-label="Main">
            <Link to="/verify" className="rounded-full bg-ivory/15 px-6 py-3 text-sm font-medium text-ivory backdrop-blur transition hover:bg-ivory/25">
              Verify a passport
            </Link>
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1">
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="border-t border-gold-400/15 bg-navy-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-navy-300 sm:px-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-ivory">
            <Mark className="h-6 w-6 text-gold-300" />
            <span>Sankofa Passport · Recognising experience. Unlocking opportunity.</span>
          </div>
          <p className="max-w-xl">
            Hackathon prototype. All people and records shown are synthetic. A passport records what an online assessment
            showed. It is not legal, immigration or employment advice.
          </p>
        </div>
      </footer>
    </div>
  )
}
