import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Start from './pages/Start'
import Verify from './pages/Verify'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/start" element={<Start />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verify/:code" element={<Verify />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
