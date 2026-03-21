import { useMemo } from 'react'
import * as THREE from 'three'
import type { WallMeshData } from '@/lib/geometry/wallExtruder'
import { MATERIALS_BY_ID } from '@/lib/catalog/materialCatalog'

interface Props {
  data: WallMeshData
  selected?: boolean
  onClick?: () => void
}

export default function WallMesh({ data, selected, onClick }: Props) {
  const mat = MATERIALS_BY_ID[data.materialId]
  const color = mat?.color ?? '#94a3b8'

  const geometry = useMemo(() => {
    if (data.openings.length === 0) {
      return new THREE.BoxGeometry(data.width, data.height, data.thickness)
    }

    // Build wall face as a Shape with holes for doors/windows
    const hw = data.width / 2
    const hh = data.height / 2

    // Wall rectangle in local XY: x from -hw to +hw, y from -hh to +hh
    const wallShape = new THREE.Shape()
    wallShape.moveTo(-hw, -hh)
    wallShape.lineTo(hw, -hh)
    wallShape.lineTo(hw, hh)
    wallShape.lineTo(-hw, hh)
    wallShape.closePath()

    for (const opening of data.openings) {
      // Opening center along wall (in local X coords)
      const centerX = -hw + opening.offsetAlongWall * data.width
      // Opening bottom in local Y coords (wall bottom is at -hh, so offset from there)
      const bottomY = -hh + opening.bottomOffset

      const oHalfW = opening.width / 2
      const oH = opening.height

      // Clamp to wall boundaries
      const left = Math.max(-hw + 0.01, centerX - oHalfW)
      const right = Math.min(hw - 0.01, centerX + oHalfW)
      const bottom = Math.max(-hh + 0.01, bottomY)
      const top = Math.min(hh - 0.01, bottom + oH)

      if (right <= left || top <= bottom) continue

      const hole = new THREE.Path()
      hole.moveTo(left, bottom)
      hole.lineTo(right, bottom)
      hole.lineTo(right, top)
      hole.lineTo(left, top)
      hole.closePath()
      wallShape.holes.push(hole)
    }

    const geo = new THREE.ExtrudeGeometry(wallShape, {
      depth: data.thickness,
      bevelEnabled: false,
    })
    // Center along Z (extrude goes from 0 to depth)
    geo.translate(0, 0, -data.thickness / 2)
    return geo
  }, [data.width, data.height, data.thickness, data.openings])

  return (
    <mesh
      position={data.position}
      rotation={[0, data.rotation, 0]}
      geometry={geometry}
      castShadow
      receiveShadow
      onClick={e => { e.stopPropagation(); onClick?.() }}
    >
      <meshStandardMaterial
        color={selected ? '#0ea5e9' : color}
        roughness={mat?.roughness ?? 0.8}
        metalness={mat?.metalness ?? 0}
        emissive={selected ? '#0369a1' : '#000000'}
        emissiveIntensity={selected ? 0.3 : 0}
      />
    </mesh>
  )
}
