import * as THREE from 'three'
import type { FloorPlan, WallSegment, WallNode, Room, WallOpening } from '@/types'

export interface WallMeshData {
  id: string
  position: [number, number, number]
  rotation: number
  width: number
  height: number
  thickness: number
  materialId: string
  openings: WallOpening[]
}

export interface FloorMeshData {
  id: string
  roomId: string
  vertices: [number, number][]  // XZ pairs in world space
  materialId: string
  y: number
}

export interface ExtrudedScene {
  walls: WallMeshData[]
  floors: FloorMeshData[]
  ceilings: FloorMeshData[]
}

function getNode(floorPlan: FloorPlan, id: string): WallNode {
  return floorPlan.nodes[id]
}

function canvasToWorld(px: number, py: number, scale: number): [number, number] {
  return [px / scale, -py / scale]
}

function wallLength(wall: WallSegment, floorPlan: FloorPlan): number {
  const start = getNode(floorPlan, wall.startNodeId)
  const end = getNode(floorPlan, wall.endNodeId)
  const [sx, sz] = canvasToWorld(start.position.x, start.position.y, floorPlan.scale)
  const [ex, ez] = canvasToWorld(end.position.x, end.position.y, floorPlan.scale)
  return Math.sqrt((ex - sx) ** 2 + (ez - sz) ** 2)
}

export function extrudeFloorPlan(floorPlan: FloorPlan): ExtrudedScene {
  const scale = floorPlan.scale || 100

  // Compute centroid of all nodes to center the model at origin
  const allNodes = Object.values(floorPlan.nodes)
  let centroidX = 0
  let centroidZ = 0
  if (allNodes.length > 0) {
    for (const node of allNodes) {
      const [wx, wz] = canvasToWorld(node.position.x, node.position.y, scale)
      centroidX += wx
      centroidZ += wz
    }
    centroidX /= allNodes.length
    centroidZ /= allNodes.length
  }

  const walls: WallMeshData[] = Object.values(floorPlan.walls).map(wall => {
    const start = getNode(floorPlan, wall.startNodeId)
    const end = getNode(floorPlan, wall.endNodeId)

    const [sx, sz] = canvasToWorld(start.position.x, start.position.y, scale)
    const [ex, ez] = canvasToWorld(end.position.x, end.position.y, scale)

    const dx = ex - sx
    const dz = ez - sz
    const length = Math.sqrt(dx * dx + dz * dz)
    const angle = Math.atan2(dz, dx)

    const cx = (sx + ex) / 2 - centroidX
    const cy = wall.height / 2
    const cz = (sz + ez) / 2 - centroidZ

    return {
      id: wall.id,
      position: [cx, cy, cz] as [number, number, number],
      rotation: -angle,
      width: length,
      height: wall.height,
      thickness: wall.thickness,
      materialId: wall.materialId,
      openings: wall.openings,
    }
  })

  // Generate floor & ceiling from rooms
  const floors: FloorMeshData[] = []
  const ceilings: FloorMeshData[] = []

  Object.values(floorPlan.rooms).forEach(room => {
    // Use [wx, -wz] so that after ShapeGeometry rotation of -PI/2 around X,
    // the vertices land at the correct (wx, 0, wz) world positions
    const verts: [number, number][] = room.nodeIds.map(nodeId => {
      const node = getNode(floorPlan, nodeId)
      const [wx, wz] = canvasToWorld(node.position.x, node.position.y, scale)
      return [wx - centroidX, -(wz - centroidZ)]
    })

    // Ensure CCW winding (THREE.Shape expects CCW for front face)
    const area = signedArea(verts)
    const ordered = area < 0 ? [...verts].reverse() : verts

    floors.push({ id: `floor-${room.id}`, roomId: room.id, vertices: ordered, materialId: room.floorMaterialId, y: 0 })
    ceilings.push({ id: `ceiling-${room.id}`, roomId: room.id, vertices: ordered, materialId: room.ceilingMaterialId, y: room.ceilingHeight })
  })

  return { walls, floors, ceilings }
}

function signedArea(points: [number, number][]): number {
  let area = 0
  const n = points.length
  for (let i = 0; i < n; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[(i + 1) % n]
    area += (x1 * y2 - x2 * y1)
  }
  return area / 2
}

export function buildRoomShape(vertices: [number, number][]): THREE.Shape {
  const shape = new THREE.Shape()
  if (vertices.length === 0) return shape
  shape.moveTo(vertices[0][0], vertices[0][1])
  for (let i = 1; i < vertices.length; i++) {
    shape.lineTo(vertices[i][0], vertices[i][1])
  }
  shape.closePath()
  return shape
}

export function wallLengthFromPlan(wall: WallSegment, floorPlan: FloorPlan): number {
  return wallLength(wall, floorPlan)
}
