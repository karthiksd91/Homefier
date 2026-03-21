import { nanoid } from 'nanoid'
import type { FloorPlan, Room, WallSegment, Point2D } from '@/types'
import { DEFAULT_CEILING_HEIGHT, ROOM_COLORS } from '@/lib/constants'

interface Graph {
  [nodeId: string]: string[]  // nodeId -> connected nodeIds
}

function buildGraph(floorPlan: FloorPlan): { graph: Graph; wallByEdge: Record<string, WallSegment> } {
  const graph: Graph = {}
  const wallByEdge: Record<string, WallSegment> = {}

  Object.values(floorPlan.nodes).forEach(node => {
    graph[node.id] = []
  })

  Object.values(floorPlan.walls).forEach(wall => {
    const { startNodeId: s, endNodeId: e } = wall
    if (!graph[s]) graph[s] = []
    if (!graph[e]) graph[e] = []
    if (!graph[s].includes(e)) graph[s].push(e)
    if (!graph[e].includes(s)) graph[e].push(s)
    wallByEdge[`${s}__${e}`] = wall
    wallByEdge[`${e}__${s}`] = wall
  })

  return { graph, wallByEdge }
}

function angle(from: Point2D, to: Point2D): number {
  return Math.atan2(to.y - from.y, to.x - from.x)
}

function angleDiff(a: number, b: number): number {
  let d = b - a
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  return d
}

function signedPolygonArea(points: Point2D[]): number {
  let area = 0
  const n = points.length
  for (let i = 0; i < n; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    area += (p1.x * p2.y - p2.x * p1.y)
  }
  return area / 2
}

function polygonKey(nodeIds: string[]): string {
  const sorted = [...nodeIds].sort()
  return sorted.join(',')
}

export function computeRoomArea(room: Room, nodes: Record<string, import('@/types').WallNode>, scale: number): number {
  if (room.nodeIds.length < 3 || scale <= 0) return 0
  const pts = room.nodeIds
    .map(id => nodes[id]?.position)
    .filter((p): p is Point2D => !!p)
  if (pts.length < 3) return 0
  const areaPx = Math.abs(signedPolygonArea(pts))
  return areaPx / (scale * scale)
}

export function detectRooms(floorPlan: FloorPlan): Room[] {
  const { graph } = buildGraph(floorPlan)
  const nodeIds = Object.keys(graph)
  if (nodeIds.length < 3) return []

  const foundCycles: string[][] = []
  const cycleKeys = new Set<string>()

  // Use smallest-left-turn traversal to find minimal faces
  for (const startId of nodeIds) {
    const neighbors = graph[startId]
    for (const nextId of neighbors) {
      const path = [startId, nextId]
      let attempts = 0
      let prev = startId
      let curr = nextId

      while (attempts < 50) {
        attempts++
        const prevPos = floorPlan.nodes[prev].position
        const currPos = floorPlan.nodes[curr].position
        const incomingAngle = angle(prevPos, currPos)

        const currNeighbors = graph[curr].filter(n => n !== prev)
        if (currNeighbors.length === 0) break

        // Turn most right (clockwise) = smallest left turn = shortest cycle
        let bestNeighbor: string | null = null
        let bestAngle = Infinity

        for (const n of currNeighbors) {
          const nPos = floorPlan.nodes[n].position
          const outAngle = angle(currPos, nPos)
          const turn = angleDiff(incomingAngle, outAngle)
          // We want the most clockwise turn (most negative / smallest angleDiff)
          if (turn < bestAngle) {
            bestAngle = turn
            bestNeighbor = n
          }
        }

        if (!bestNeighbor) break

        if (bestNeighbor === startId) {
          // Found a cycle
          const key = polygonKey(path)
          if (!cycleKeys.has(key) && path.length >= 3) {
            cycleKeys.add(key)
            foundCycles.push([...path])
          }
          break
        }

        if (path.includes(bestNeighbor)) break

        path.push(bestNeighbor)
        prev = curr
        curr = bestNeighbor
      }
    }
  }

  // Filter out the outer (largest) face
  let largestArea = 0
  let largestIdx = -1

  const cycleAreas = foundCycles.map((cycle, i) => {
    const pts = cycle.map(id => floorPlan.nodes[id].position)
    const area = Math.abs(signedPolygonArea(pts))
    if (area > largestArea) {
      largestArea = area
      largestIdx = i
    }
    return area
  })

  const ROOM_TYPE_NAMES = ['living_room', 'bedroom', 'kitchen', 'bathroom', 'dining_room', 'hallway', 'other']

  return foundCycles
    .filter((_, i) => i !== largestIdx && cycleAreas[i] > 100)  // filter outer face + tiny polygons
    .map((cycle, i) => {
      const type = ROOM_TYPE_NAMES[i % ROOM_TYPE_NAMES.length] as Room['type']
      return {
        id: nanoid(),
        name: `Room ${i + 1}`,
        type,
        nodeIds: cycle,
        wallIds: [],
        floorMaterialId: 'floor-hardwood',
        wallMaterialId: 'wall-white',
        ceilingMaterialId: 'ceiling-white',
        ceilingHeight: DEFAULT_CEILING_HEIGHT,
        color: ROOM_COLORS[type] ?? '#6b7280',
      }
    })
}
