import { useMemo } from 'react'
import * as THREE from 'three'
import type { FloorMeshData } from '@/lib/geometry/wallExtruder'
import { buildRoomShape } from '@/lib/geometry/wallExtruder'
import { MATERIALS_BY_ID } from '@/lib/catalog/materialCatalog'

interface Props {
  data: FloorMeshData
  isCeiling?: boolean
  selected?: boolean
  onClick?: () => void
}

export default function FloorMesh({ data, isCeiling = false, selected, onClick }: Props) {
  const mat = MATERIALS_BY_ID[data.materialId]
  const color = mat?.color ?? (isCeiling ? '#f8fafc' : '#8B6914')

  const geometry = useMemo(() => {
    if (data.vertices.length < 3) return new THREE.BufferGeometry()
    const shape = buildRoomShape(data.vertices)
    const geo = new THREE.ShapeGeometry(shape)
    return geo
  }, [data.vertices])

  return (
    <mesh
      geometry={geometry}
      position={[0, data.y, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow={!isCeiling}
      castShadow={false}
      onClick={e => { e.stopPropagation(); onClick?.() }}
    >
      <meshStandardMaterial
        color={selected ? '#1e40af' : color}
        roughness={mat?.roughness ?? 0.8}
        metalness={mat?.metalness ?? 0}
        side={isCeiling ? THREE.BackSide : THREE.FrontSide}
      />
    </mesh>
  )
}
