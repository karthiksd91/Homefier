import { Suspense, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import EnvironmentSetup from '@/components/scene3d/EnvironmentSetup'
import HomeModel from '@/components/scene3d/HomeModel'
import FurnitureItem3D from '@/components/scene3d/FurnitureItem3D'
import WalkthroughCamera from '@/components/scene3d/WalkthroughCamera'
import PointerLockPrompt from '@/components/walkthrough/PointerLockPrompt'
import WalkthroughOverlay from '@/components/walkthrough/WalkthroughOverlay'
import { usePointerLock } from '@/hooks/usePointerLock'
import { useFurnitureStore } from '@/store/useFurnitureStore'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { computeSceneCentroid } from '@/lib/geometry/wallExtruder'

export default function WalkthroughPage() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLDivElement>(null)
  const { isLocked, requestLock, exitLock } = usePointerLock()
  const items = useFurnitureStore(s => s.items)
  const floorPlan = useFloorPlanStore(s => s.floorPlan)

  const hasRooms = Object.keys(floorPlan.rooms).length > 0

  // Compute start position: center of first room, in the same centered world space as the 3D model
  const startPosition = useMemo((): [number, number, number] => {
    const rooms = Object.values(floorPlan.rooms)
    if (rooms.length === 0) return [0, 0, 5]
    const room = rooms[0]
    const scale = floorPlan.scale || 100
    const { cx: centroidX, cz: centroidZ } = computeSceneCentroid(floorPlan)
    const xs = room.nodeIds.map(id => floorPlan.nodes[id]?.position.x ?? 0)
    const ys = room.nodeIds.map(id => floorPlan.nodes[id]?.position.y ?? 0)
    const cx = xs.reduce((a, b) => a + b, 0) / xs.length / scale - centroidX
    const cz = -(ys.reduce((a, b) => a + b, 0) / ys.length) / scale - centroidZ
    return [cx, 0, cz]
  }, [floorPlan])

  function handleExit() {
    exitLock()
    navigate('/design')
  }

  if (!hasRooms) {
    return (
      <div className="h-full flex flex-col bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚶</div>
            <h3 className="text-white text-xl font-semibold mb-2">No Home to Walk Through</h3>
            <p className="text-slate-400 text-sm mb-6">Draw a floor plan and design the interior first</p>
            <button onClick={() => navigate('/floorplan')} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors">
              Create Floor Plan
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 relative overflow-hidden" ref={canvasRef}>
        <Canvas
          shadows
          gl={{ antialias: true }}
          style={{ background: '#0f172a' }}
        >
          <EnvironmentSetup />
          <WalkthroughCamera isLocked={isLocked} startPosition={startPosition} />

          <Suspense fallback={null}>
            <HomeModel />
            {Object.values(items).map(item => (
              <FurnitureItem3D key={item.id} furniture={item} />
            ))}
          </Suspense>
        </Canvas>

        {/* Pointer lock prompt */}
        <AnimatePresence>
          {!isLocked && (
            <PointerLockPrompt onStart={() => requestLock()} />
          )}
        </AnimatePresence>

        {/* In-game HUD */}
        {isLocked && (
          <WalkthroughOverlay onExit={handleExit} />
        )}
      </div>
    </div>
  )
}
