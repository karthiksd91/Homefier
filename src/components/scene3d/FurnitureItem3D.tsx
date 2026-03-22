import { useRef } from 'react'
import type { Mesh } from 'three'
import { FURNITURE_BY_ID } from '@/lib/catalog/furnitureCatalog'
import type { PlacedFurniture } from '@/types'
import FurnitureMesh from './FurnitureMesh'

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
      scale={[scale, scale, scale]}
    >
      {/* Ghost: simple wireframe bounding box overlay, no click interaction */}
      {ghost ? (
        <mesh position={[0, height / 2, 0]} raycast={() => {}}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color="#22c55e"
            wireframe
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      ) : (
        /* Invisible hitbox for click detection on placed furniture */
        <mesh
          ref={ref}
          position={[0, height / 2, 0]}
          onClick={e => { e.stopPropagation(); onClick?.() }}
        >
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* Realistic furniture shape — only rendered for placed (non-ghost) items */}
      {!ghost && <FurnitureMesh item={catalogItem} selected={selected} />}

      {/* Selection ring at floor level */}
      {selected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[
            Math.max(width, depth) * 0.6,
            Math.max(width, depth) * 0.65,
            32,
          ]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Label plane above selected furniture */}
      {selected && (
        <group position={[0, height + 0.2, 0]}>
          <mesh>
            <planeGeometry args={[0.8, 0.25]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
          </mesh>
        </group>
      )}
    </group>
  )
}
