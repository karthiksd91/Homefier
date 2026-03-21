export const DEFAULT_WALL_HEIGHT = 2.8       // meters
export const DEFAULT_WALL_THICKNESS = 0.2    // meters
export const DEFAULT_CEILING_HEIGHT = 2.8    // meters
export const DEFAULT_SCALE = 100             // pixels per meter
export const SNAP_GRID = 0.1                 // meters
export const SNAP_THRESHOLD = 15             // pixels for vertex snapping
export const EYE_HEIGHT = 1.65               // meters (walkthrough camera)
export const WALK_SPEED = 5.0                // m/s
export const MOUSE_SENSITIVITY = 0.002
export const COLLISION_RADIUS = 0.15         // meters

export const ROOM_COLORS: Record<string, string> = {
  living_room: '#3b82f6',
  bedroom: '#8b5cf6',
  kitchen: '#f59e0b',
  bathroom: '#06b6d4',
  dining_room: '#10b981',
  hallway: '#6b7280',
  garage: '#f97316',
  other: '#ec4899',
}
