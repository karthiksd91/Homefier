import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ActiveTool = 'wall' | 'select' | 'door' | 'window' | 'eraser' | 'none'
export type EditorMode = 'walls' | 'openings' | 'materials' | 'furniture'
export type MaterialTarget = 'floor' | 'wall' | 'ceiling'
export type AppMode = 'landing' | 'upload' | 'floorplan' | 'design' | 'walkthrough'
export type DesignSidebarTab = 'rooms' | 'furniture' | 'materials'

interface UIStore {
  appMode: AppMode
  activeTool: ActiveTool
  editorMode: EditorMode
  selectedOpeningCatalogId: string | null
  selectedMaterialId: string | null
  materialTarget: MaterialTarget
  selectedWallId: string | null
  selectedRoomId: string | null
  selectedOpeningId: string | null
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
  setEditorMode: (mode: EditorMode) => void
  setSelectedOpeningCatalog: (id: string | null) => void
  setSelectedMaterial: (id: string | null) => void
  setMaterialTarget: (target: MaterialTarget) => void
  setSelectedWall: (id: string | null) => void
  setSelectedRoom: (id: string | null) => void
  setSelectedOpening: (id: string | null) => void
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
    editorMode: 'walls',
    selectedOpeningCatalogId: null,
    selectedMaterialId: null,
    materialTarget: 'floor',
    selectedWallId: null,
    selectedRoomId: null,
    selectedOpeningId: null,
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
    setEditorMode: (mode) => set(s => {
      s.editorMode = mode
      s.selectedWallId = null
      s.selectedRoomId = null
      s.selectedOpeningId = null
      // Set default tool per mode
      if (mode === 'walls') s.activeTool = 'wall'
      else s.activeTool = 'select'
    }),
    setSelectedOpeningCatalog: (id) => set(s => { s.selectedOpeningCatalogId = id }),
    setSelectedMaterial: (id) => set(s => { s.selectedMaterialId = id }),
    setMaterialTarget: (target) => set(s => { s.materialTarget = target }),
    setSelectedWall: (id) => set(s => { s.selectedWallId = id }),
    setSelectedRoom: (id) => set(s => { s.selectedRoomId = id }),
    setSelectedOpening: (id) => set(s => { s.selectedOpeningId = id }),
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
