import { Link } from 'react-router-dom'
import HeroPath from '../heroes/HeroPath'
import KitPath from '../heroes/KitPath'

/** Original design C (purple/orange), kept at Vincent's request to compare with the recoloured home page. */
export default function Heroes() {
  return (
    <>
      <HeroPath />
      <KitPath />
      <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-full bg-black/80 p-1 text-sm text-white shadow-lg backdrop-blur" aria-label="Compare designs">
        <span className="rounded-full bg-white px-4 py-2 text-black">C · original colours</span>
        <Link to="/" className="rounded-full px-4 py-2 hover:bg-white/15">C · navy and gold (home)</Link>
      </nav>
    </>
  )
}
