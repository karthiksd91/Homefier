import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Disable StrictMode to avoid Konva double-mount issues
createRoot(document.getElementById('root')!).render(<App />)
