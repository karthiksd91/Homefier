import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Upload, Grid3X3, Sofa, Play } from 'lucide-react'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'

const STEPS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/upload', label: 'Upload', icon: Upload },
  { path: '/floorplan', label: 'Floor Plan', icon: Grid3X3 },
  { path: '/design', label: 'Design', icon: Sofa },
  { path: '/walkthrough', label: 'Walkthrough', icon: Play },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const floorPlan = useFloorPlanStore(s => s.floorPlan)

  const hasRooms = Object.keys(floorPlan.rooms).length > 0
  const hasSketch = !!floorPlan.sketchImageUrl
  const hasScale = floorPlan.scale > 0

  function isEnabled(path: string) {
    if (path === '/' || path === '/upload') return true
    if (path === '/floorplan') return hasSketch || Object.keys(floorPlan.walls).length > 0
    if (path === '/design') return hasRooms && hasScale
    if (path === '/walkthrough') return hasRooms
    return false
  }

  return (
    <nav className="h-14 glass-dark flex items-center px-4 gap-1 shrink-0 z-50 border-b border-white/10">
      <div className="flex items-center gap-2 mr-6">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-lg">
          H
        </div>
        <span className="font-semibold text-white text-sm tracking-wide">Homefier</span>
      </div>

      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const active = location.pathname === step.path
          const enabled = isEnabled(step.path)

          return (
            <button
              key={step.path}
              onClick={() => enabled && navigate(step.path)}
              disabled={!enabled}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${active
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-900/50'
                  : enabled
                    ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed'
                }
              `}
            >
              {i > 0 && i < STEPS.length && (
                <span className={`w-1 h-1 rounded-full mr-1 ${enabled ? 'bg-current opacity-40' : 'bg-slate-700'}`} />
              )}
              <Icon size={13} />
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
