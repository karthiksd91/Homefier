import { useMemo } from 'react'
import { extrudeFloorPlan } from '@/lib/geometry/wallExtruder'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { useUIStore } from '@/store/useUIStore'
import WallMesh from './WallMesh'
import FloorMesh from './FloorMesh'

export default function HomeModel() {
  const floorPlan = useFloorPlanStore(s => s.floorPlan)
  const { selectedWallId, selectedRoomId, setSelectedWall, setSelectedRoom } = useUIStore()

  const scene = useMemo(() => {
    if (Object.keys(floorPlan.walls).length === 0) return null
    return extrudeFloorPlan(floorPlan)
  }, [floorPlan])

  if (!scene) return null

  return (
    <group>
      {/* Walls */}
      {scene.walls.map(w => (
        <WallMesh
          key={w.id}
          data={w}
          selected={selectedWallId === w.id}
          onClick={() => {
            setSelectedWall(selectedWallId === w.id ? null : w.id)
            setSelectedRoom(null)
          }}
        />
      ))}

      {/* Floors */}
      {scene.floors.map(f => {
        const isSelected = selectedRoomId === f.roomId
        return (
          <FloorMesh
            key={f.id}
            data={f}
            isCeiling={false}
            selected={isSelected}
            onClick={() => {
              setSelectedRoom(isSelected ? null : f.roomId)
              setSelectedWall(null)
            }}
          />
        )
      })}

      {/* Ceilings */}
      {scene.ceilings.map(c => (
        <FloorMesh
          key={c.id}
          data={c}
          isCeiling={true}
        />
      ))}

      {/* Shadow catcher */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
