import type { FloorPlan } from '@/types'
import { computeSceneCentroid } from './wallExtruder'

interface AABB {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export function buildWallAABBs(floorPlan: FloorPlan): AABB[] {
  const scale = floorPlan.scale || 100
  const { cx: centroidX, cz: centroidZ } = computeSceneCentroid(floorPlan)

  return Object.values(floorPlan.walls).map(wall => {
    const s = floorPlan.nodes[wall.startNodeId].position
    const e = floorPlan.nodes[wall.endNodeId].position
    const sx = s.x / scale - centroidX
    const sz = -s.y / scale - centroidZ
    const ex = e.x / scale - centroidX
    const ez = -e.y / scale - centroidZ
    const t = wall.thickness / 2

    return {
      minX: Math.min(sx, ex) - t,
      maxX: Math.max(sx, ex) + t,
      minZ: Math.min(sz, ez) - t,
      maxZ: Math.max(sz, ez) + t,
    }
  })
}

export function resolveCollisions(
  pos: { x: number; z: number },
  aabbs: AABB[],
  radius: number
): { x: number; z: number } {
  let x = pos.x
  let z = pos.z

  for (const aabb of aabbs) {
    const expandedMinX = aabb.minX - radius
    const expandedMaxX = aabb.maxX + radius
    const expandedMinZ = aabb.minZ - radius
    const expandedMaxZ = aabb.maxZ + radius

    if (x > expandedMinX && x < expandedMaxX && z > expandedMinZ && z < expandedMaxZ) {
      // Compute overlap on each axis
      const overlapLeft = x - expandedMinX
      const overlapRight = expandedMaxX - x
      const overlapFront = z - expandedMinZ
      const overlapBack = expandedMaxZ - z

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapFront, overlapBack)

      if (minOverlap === overlapLeft) x = expandedMinX
      else if (minOverlap === overlapRight) x = expandedMaxX
      else if (minOverlap === overlapFront) z = expandedMinZ
      else z = expandedMaxZ
    }
  }

  return { x, z }
}
