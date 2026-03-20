import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ActiveTool = 'wall' | 'select' | 'door' | 'window' | 'eraser' | 'none'
export type AppMode = 'landing' | 'upload' | 'floorplan' | 'design' | 'walkthrough'
export type DesignSidebarTab = 'rooms' | 'furniture' | 'materials'

interface UIStore {
  appMode: AppMode
  activeTool: ActiveTool
  selectedWallId: string | null
  selectedRoomId: string | null
  selectedFurnitureId: string | null
  pendingFurnitureId: string | null    // catalog item being placed
  showGrid: boolean
  showMeasurements: boolean
  showSketch: boolean
  sidebarTab: DesignSidebarTab
  furnitureSearch: string
  furnitureCategory: string

  setAppMode: (mode: AppMode) => void
  setActiveTool: (tool: ActiveTool) => void
  setSelectedWall: (id: string | null) => void
  setSelectedRoom: (id: string | null) => void
  setSelectedFurniture: (id: string | null) => void
  setPendingFurniture: (id: string | null) => void
  setShowGrid: (v: boolean) => void
  setShowMeasurements: (v: boolean) => void
  setShowSketch: (v: boolean) => void
  setSidebarTab: (tab: DesignSidebarTab) => void
  setFurnitureSearch: (s: string) => void
  setFurnitureCategory: (c: string) => void
}

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    appMode: 'landing',
    activeTool: 'wall',
    selectedWallId: null,
    selectedRoomId: null,
    selectedFurnitureId: null,
    pendingFurnitureId: null,
    showGrid: true,
    showMeasurements: true,
    showSketch: true,
    sidebarTab: 'furniture',
    furnitureSearch: '',
    furnitureCategory: 'all',

    setAppMode: (mode) => set(s => { s.appMode = mode }),
    setActiveTool: (tool) => set(s => { s.activeTool = tool }),
    setSelectedWall: (id) => set(s => { s.selectedWallId = id }),
    setSelectedRoom: (id) => set(s => { s.selectedRoomId = id }),
    setSelectedFurniture: (id) => set(s => { s.selectedFurnitureId = id }),
    setPendingFurniture: (id) => set(s => { s.pendingFurnitureId = id }),
    setShowGrid: (v) => set(s => { s.showGrid = v }),
    setShowMeasurements: (v) => set(s => { s.showMeasurements = v }),
    setShowSketch: (v) => set(s => { s.showSketch = v }),
    setSidebarTab: (tab) => set(s => { s.sidebarTab = tab }),
    setFurnitureSearch: (q) => set(s => { s.furnitureSearch = q }),
    setFurnitureCategory: (c) => set(s => { s.furnitureCategory = c }),
  }))
)
