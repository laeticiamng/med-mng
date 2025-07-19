import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import Index from './pages/Index'
import EdnComplete from './pages/EdnComplete'
import EdnIndex from './pages/EdnIndex'
import EdnItemImmersive from './pages/EdnItemImmersive'
import Generator from './pages/Generator'
import MedMngCreate from './pages/MedMngCreate'
import MedMngLogin from './pages/MedMngLogin'
import MedMngProfile from './pages/MedMngProfile'
import MedMngPlayer from './pages/MedMngPlayer'
import EcosScenario from './pages/EcosScenario'
import AdminAudit from './pages/AdminAudit'
import './index.css'

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/edn-complete" element={<EdnComplete />} />
          <Route path="/edn-complete/:slug" element={<EdnItemImmersive />} />
          <Route path="/edn" element={<EdnIndex />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/med-mng" element={<MedMngCreate />} />
          <Route path="/med-mng/login" element={<MedMngLogin />} />
          <Route path="/med-mng/profile" element={<MedMngProfile />} />
          <Route path="/med-mng/player" element={<MedMngPlayer />} />
          <Route path="/ecos-scenario" element={<EcosScenario />} />
          <Route path="/admin/audit" element={<AdminAudit />} />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App