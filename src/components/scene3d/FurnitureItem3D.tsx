import { useRef } from 'react'
import type { Mesh } from 'three'
import { FURNITURE_BY_ID } from '@/lib/catalog/furnitureCatalog'
import type { PlacedFurniture } from '@/types'

interface Props {
  furniture: PlacedFurniture
  selected?: boolean
  ghost?: boolean
  onClick?: () => void
}

export default function FurnitureItem3D({ furniture, selected, ghost, onClick }: Props) {
  const ref = useRef<Mesh>(null)
  const catalogItem = FURNITURE_BY_ID[furniture.catalogItemId]
  if (!catalogItem) return null

  const { width, depth, height } = catalogItem.dimensions
  const scale = furniture.scale

  return (
    <group
      position={furniture.position}
      rotation={[0, furniture.rotation, 0]}
    >
      <mesh
        ref={ref}
        castShadow
        receiveShadow
        onClick={e => { e.stopPropagation(); onClick?.() }}
        scale={[scale, scale, scale]}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={selected ? '#0ea5e9' : ghost ? '#22c55e' : catalogItem.color}
          roughness={0.7}
          metalness={0.1}
          transparent={ghost}
          opacity={ghost ? 0.5 : 1}
          emissive={selected ? '#0369a1' : '#000'}
          emissiveIntensity={selected ? 0.3 : 0}
          wireframe={ghost}
        />
      </mesh>

      {/* Label above furniture */}
      {selected && (
        <group position={[0, height * scale + 0.2, 0]}>
          <mesh>
            <planeGeometry args={[0.8, 0.25]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
          </mesh>
        </group>
      )}

      {/* Selection ring */}
      {selected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(width, depth) * scale * 0.6, Math.max(width, depth) * scale * 0.65, 32]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}
