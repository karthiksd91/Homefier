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

  return (
    <mesh
      position={data.position}
      rotation={[0, data.rotation, 0]}
      castShadow
      receiveShadow
      onClick={e => { e.stopPropagation(); onClick?.() }}
    >
      <boxGeometry args={[data.width, data.height, data.thickness]} />
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
