import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Info } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Scene3D from '@/components/scene3d/Scene3D'
import DesignSidebar from '@/components/design/DesignSidebar'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { useUIStore } from '@/store/useUIStore'

export default function DesignPage() {
  const navigate = useNavigate()
  const floorPlan = useFloorPlanStore(s => s.floorPlan)
  const { pendingFurnitureId, setPendingFurniture } = useUIStore()

  const hasRooms = Object.keys(floorPlan.rooms).length > 0

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* 3D Viewport */}
        <div className="flex-1 relative">
          {hasRooms ? (
            <Scene3D mode="design" />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-white text-xl font-semibold mb-2">No Floor Plan Yet</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Go back to the Floor Plan Editor and draw rooms first
                </p>
                <button
                  onClick={() => navigate('/floorplan')}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Open Floor Plan Editor
                </button>
              </div>
            </div>
          )}

          {/* Pending furniture indicator */}
          {pendingFurnitureId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-sm backdrop-blur-sm z-10"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Click in the scene to place furniture
              <button onClick={() => setPendingFurniture(null)} className="ml-2 text-emerald-500 hover:text-white">✕</button>
            </motion.div>
          )}

          {/* Camera hint */}
          {hasRooms && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 glass-dark rounded-xl px-3 py-2 text-xs text-slate-400 border border-white/10">
              <Info size={12} className="text-slate-500" />
              Orbit: drag · Zoom: scroll · Pan: right-drag
            </div>
          )}

          {/* Walkthrough button */}
          {hasRooms && (
            <button
              onClick={() => navigate('/walkthrough')}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg transition-all text-sm"
            >
              <Play size={15} />
              Start Walkthrough
            </button>
          )}
        </div>

        {/* Sidebar */}
        <DesignSidebar />
      </div>
    </div>
  )
}
