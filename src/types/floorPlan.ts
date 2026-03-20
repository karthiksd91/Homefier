export interface Point2D {
  x: number
  y: number
}

export interface WallNode {
  id: string
  position: Point2D
}

export type WallOpeningType = 'door' | 'window' | 'archway'

export interface WallOpening {
  id: string
  type: WallOpeningType
  offsetAlongWall: number // 0..1 normalized
  width: number           // meters
  height: number          // meters
  bottomOffset: number    // meters from floor (0 for doors, ~0.9 for windows)
}

export interface WallSegment {
  id: string
  startNodeId: string
  endNodeId: string
  thickness: number    // meters, default 0.2
  height: number       // meters, default 2.8
  materialId: string
  openings: WallOpening[]
}

export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'dining_room'
  | 'hallway'
  | 'garage'
  | 'other'

export interface Room {
  id: string
  name: string
  type: RoomType
  nodeIds: string[]         // ordered, forms closed polygon
  wallIds: string[]
  floorMaterialId: string
  wallMaterialId: string
  ceilingMaterialId: string
  ceilingHeight: number     // meters
  color: string             // accent color for 2D display
}

export interface FloorPlan {
  id: string
  name: string
  sketchImageUrl: string | null
  sketchOpacity: number
  nodes: Record<string, WallNode>
  walls: Record<string, WallSegment>
  rooms: Record<string, Room>
  scale: number             // pixels per meter (0 = not calibrated)
  canvasWidth: number
  canvasHeight: number
}
