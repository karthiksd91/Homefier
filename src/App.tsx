import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage from '@/routes/LandingPage'
import UploadPage from '@/routes/UploadPage'
import FloorPlanEditorPage from '@/routes/FloorPlanEditorPage'
import DesignPage from '@/routes/DesignPage'
import WalkthroughPage from '@/routes/WalkthroughPage'

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/floorplan" element={<FloorPlanEditorPage />} />
          <Route path="/design" element={<DesignPage />} />
          <Route path="/walkthrough" element={<WalkthroughPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App
