import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import LandingPage from '@/routes/LandingPage'
import UploadPage from '@/routes/UploadPage'
import SavedPlansPage from '@/routes/SavedPlansPage'
import FloorPlanEditorPage from '@/routes/FloorPlanEditorPage'
import DesignPage from '@/routes/DesignPage'
import WalkthroughPage from '@/routes/WalkthroughPage'

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/upload', element: <UploadPage /> },
  { path: '/saved', element: <SavedPlansPage /> },
  { path: '/floorplan', element: <FloorPlanEditorPage /> },
  { path: '/design', element: <DesignPage /> },
  { path: '/walkthrough', element: <WalkthroughPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
