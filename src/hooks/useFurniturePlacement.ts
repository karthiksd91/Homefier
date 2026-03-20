import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useUIStore } from '@/store/useUIStore'
import { useFurnitureStore } from '@/store/useFurnitureStore'

const SNAP = 0.25 // meters

function snapVal(v: number) {
  return Math.round(v / SNAP) * SNAP
}

export function useFurniturePlacement() {
  const [ghostPosition, setGhostPosition] = useState<[number, number, number] | null>(null)
  const { pendingFurnitureId, setPendingFurniture, setSelectedFurniture } = useUIStore()
  const addFurniture = useFurnitureStore(s => s.addFurniture)

  function handleFloorMove(e: ThreeEvent<PointerEvent>) {
    if (!pendingFurnitureId) return
    e.stopPropagation()
    const { x, z } = e.point
    setGhostPosition([snapVal(x), 0, snapVal(z)])
  }

  function handleFloorClick(e: ThreeEvent<MouseEvent>) {
    if (!pendingFurnitureId || !ghostPosition) return
    e.stopPropagation()
    const id = addFurniture({
      catalogItemId: pendingFurnitureId,
      roomId: '',
      position: ghostPosition,
      rotation: 0,
      scale: 1,
    })
    setSelectedFurniture(id)
    setPendingFurniture(null)
    setGhostPosition(null)
  }

  return { ghostPosition, handleFloorMove, handleFloorClick }
}
