import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { FloorPlan, WallNode, WallSegment, WallOpening, Room, Point2D } from '@/types'
import {
  DEFAULT_WALL_HEIGHT, DEFAULT_WALL_THICKNESS, DEFAULT_SCALE,
  DEFAULT_CEILING_HEIGHT, ROOM_COLORS
} from '@/lib/constants'

const DEFAULT_FLOOR_PLAN: FloorPlan = {
  id: nanoid(),
  name: 'My Home',
  sketchImageUrl: null,
  sketchOpacity: 0.4,
  nodes: {},
  walls: {},
  rooms: {},
  scale: DEFAULT_SCALE,
  canvasWidth: 1200,
  canvasHeight: 800,
}

interface FloorPlanStore {
  floorPlan: FloorPlan
  history: FloorPlan[]
  historyIndex: number
  isDirty: boolean
  currentSaveId: string | null

  // Sketch
  setSketchImage: (url: string) => void
  setSketchOpacity: (opacity: number) => void

  // Scale
  setScale: (scale: number) => void

  // Nodes
  addNode: (position: Point2D) => string
  updateNode: (id: string, position: Point2D) => void
  deleteNode: (id: string) => void
  snapToExistingNode: (pos: Point2D, radius: number, excludeId?: string) => string | null

  // Walls
  addWall: (startNodeId: string, endNodeId: string) => string
  updateWall: (id: string, patch: Partial<WallSegment>) => void
  deleteWall: (id: string) => void
  addOpening: (wallId: string, opening: Omit<WallOpening, 'id'>) => void
  removeOpening: (wallId: string, openingId: string) => void

  // Rooms
  setRooms: (rooms: Room[]) => void
  updateRoom: (id: string, patch: Partial<Room>) => void

  // History
  saveHistory: () => void
  undo: () => void
  redo: () => void

  // Save state
  markClean: () => void
  setCurrentSaveId: (id: string | null) => void

  // Reset
  reset: () => void
}

export const useFloorPlanStore = create<FloorPlanStore>()(
  immer((set, get) => ({
    floorPlan: DEFAULT_FLOOR_PLAN,
    history: [],
    historyIndex: -1,
    isDirty: false,
    currentSaveId: null,

    setSketchImage: (url) => set(state => { state.floorPlan.sketchImageUrl = url; state.isDirty = true }),
    setSketchOpacity: (opacity) => set(state => { state.floorPlan.sketchOpacity = opacity; state.isDirty = true }),
    setScale: (scale) => set(state => { state.floorPlan.scale = scale; state.isDirty = true }),

    addNode: (position) => {
      const id = nanoid()
      set(state => {
        state.floorPlan.nodes[id] = { id, position }
        state.isDirty = true
      })
      return id
    },

    updateNode: (id, position) => set(state => {
      if (state.floorPlan.nodes[id]) {
        state.floorPlan.nodes[id].position = position
        state.isDirty = true
      }
    }),

    deleteNode: (id) => set(state => {
      delete state.floorPlan.nodes[id]
      Object.keys(state.floorPlan.walls).forEach(wId => {
        const w = state.floorPlan.walls[wId]
        if (w.startNodeId === id || w.endNodeId === id) {
          delete state.floorPlan.walls[wId]
        }
      })
      state.isDirty = true
    }),

    snapToExistingNode: (pos, radius, excludeId) => {
      const { nodes } = get().floorPlan
      let best: string | null = null
      let bestDist = radius
      Object.values(nodes).forEach(node => {
        if (node.id === excludeId) return
        const d = Math.hypot(node.position.x - pos.x, node.position.y - pos.y)
        if (d < bestDist) {
          bestDist = d
          best = node.id
        }
      })
      return best
    },

    addWall: (startNodeId, endNodeId) => {
      const id = nanoid()
      set(state => {
        state.floorPlan.walls[id] = {
          id,
          startNodeId,
          endNodeId,
          thickness: DEFAULT_WALL_THICKNESS,
          height: DEFAULT_WALL_HEIGHT,
          materialId: 'wall-white',
          openings: [],
        }
        state.isDirty = true
      })
      return id
    },

    updateWall: (id, patch) => set(state => {
      if (state.floorPlan.walls[id]) {
        Object.assign(state.floorPlan.walls[id], patch)
        state.isDirty = true
      }
    }),

    deleteWall: (id) => set(state => {
      delete state.floorPlan.walls[id]
      state.isDirty = true
    }),

    addOpening: (wallId, opening) => set(state => {
      if (state.floorPlan.walls[wallId]) {
        state.floorPlan.walls[wallId].openings.push({ ...opening, id: nanoid() })
        state.isDirty = true
      }
    }),

    removeOpening: (wallId, openingId) => set(state => {
      if (state.floorPlan.walls[wallId]) {
        state.floorPlan.walls[wallId].openings = state.floorPlan.walls[wallId].openings.filter(
          o => o.id !== openingId
        )
        state.isDirty = true
      }
    }),

    setRooms: (rooms) => set(state => {
      state.floorPlan.rooms = Object.fromEntries(rooms.map(r => [r.id, r]))
      state.isDirty = true
    }),

    updateRoom: (id, patch) => set(state => {
      if (state.floorPlan.rooms[id]) {
        Object.assign(state.floorPlan.rooms[id], patch)
        state.isDirty = true
      }
    }),

    saveHistory: () => set(state => {
      const snapshot = JSON.parse(JSON.stringify(state.floorPlan)) as FloorPlan
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(snapshot)
      state.history = newHistory.slice(-30) // keep last 30
      state.historyIndex = state.history.length - 1
    }),

    undo: () => set(state => {
      if (state.historyIndex > 0) {
        state.historyIndex--
        state.floorPlan = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
        state.isDirty = true
      }
    }),

    redo: () => set(state => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++
        state.floorPlan = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
        state.isDirty = true
      }
    }),

    markClean: () => set(state => { state.isDirty = false }),
    setCurrentSaveId: (id) => set(state => { state.currentSaveId = id }),

    reset: () => set(state => {
      state.floorPlan = { ...DEFAULT_FLOOR_PLAN, id: nanoid() }
      state.history = []
      state.historyIndex = -1
      state.isDirty = false
      state.currentSaveId = null
    }),
  }))
)
