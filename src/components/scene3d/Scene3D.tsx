import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import EnvironmentSetup from './EnvironmentSetup'
import DesignCamera from './DesignCamera'
import HomeModel from './HomeModel'
import FurnitureItem3D from './FurnitureItem3D'
import { useFurnitureStore } from '@/store/useFurnitureStore'
import { useUIStore } from '@/store/useUIStore'
import { useFurniturePlacement } from '@/hooks/useFurniturePlacement'
import type { ThreeEvent } from '@react-three/fiber'

interface Props {
  mode?: 'design' | 'walkthrough'
}

export default function Scene3D({ mode = 'design' }: Props) {
  const items = useFurnitureStore(s => s.items)
  const { selectedFurnitureId, setSelectedFurniture, pendingFurnitureId } = useUIStore()
  const { ghostPosition, handleFloorMove, handleFloorClick } = useFurniturePlacement()

  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [8, 8, 8], fov: 60 }}
      style={{ background: '#0f172a' }}
      onPointerMissed={() => setSelectedFurniture(null)}
    >
      <EnvironmentSetup />

      {mode === 'design' && <DesignCamera />}

      <Suspense fallback={null}>
        <HomeModel />

        {/* Placed furniture */}
        {Object.values(items).map(item => (
          <FurnitureItem3D
            key={item.id}
            furniture={item}
            selected={selectedFurnitureId === item.id}
            onClick={() => setSelectedFurniture(selectedFurnitureId === item.id ? null : item.id)}
          />
        ))}

        {/* Ghost furniture during placement */}
        {pendingFurnitureId && ghostPosition && (
          <FurnitureItem3D
            furniture={{
              id: 'ghost',
              catalogItemId: pendingFurnitureId,
              roomId: '',
              position: ghostPosition,
              rotation: 0,
              scale: 1,
            }}
            ghost
          />
        )}

        {/* Invisible floor plane for furniture placement */}
        {pendingFurnitureId && (
          <mesh
            position={[0, 0.001, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={false}
            onPointerMove={handleFloorMove}
            onClick={handleFloorClick}
          >
            <planeGeometry args={[200, 200]} />
            <meshBasicMaterial />
          </mesh>
        )}
      </Suspense>
    </Canvas>
  )
}
