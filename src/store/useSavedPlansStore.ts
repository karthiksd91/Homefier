import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { FloorPlan, PlacedFurniture } from '@/types'

export interface SavedPlan {
  id: string
  name: string
  savedAt: string
  floorPlan: FloorPlan
  furnitureItems: Record<string, PlacedFurniture>
}

const STORAGE_KEY = 'homefier_saved_plans'

function loadFromStorage(): SavedPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistToStorage(plans: SavedPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}

async function convertBlobUrl(floorPlan: FloorPlan): Promise<FloorPlan> {
  const clone = JSON.parse(JSON.stringify(floorPlan)) as FloorPlan
  if (clone.sketchImageUrl && clone.sketchImageUrl.startsWith('blob:')) {
    try {
      const response = await fetch(clone.sketchImageUrl)
      const blob = await response.blob()
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      clone.sketchImageUrl = base64
    } catch {
      clone.sketchImageUrl = null
    }
  }
  return clone
}

interface SavedPlansStore {
  plans: SavedPlan[]
  savePlan: (name: string, floorPlan: FloorPlan, furnitureItems: Record<string, PlacedFurniture>) => Promise<string>
  updatePlan: (id: string, floorPlan: FloorPlan, furnitureItems: Record<string, PlacedFurniture>) => Promise<void>
  deletePlan: (id: string) => void
  renamePlan: (id: string, name: string) => void
  refresh: () => void
}

export const useSavedPlansStore = create<SavedPlansStore>()((set, get) => ({
  plans: loadFromStorage(),

  savePlan: async (name, floorPlan, furnitureItems) => {
    const id = nanoid()
    const convertedPlan = await convertBlobUrl(floorPlan)
    const plan: SavedPlan = {
      id,
      name,
      savedAt: new Date().toISOString(),
      floorPlan: convertedPlan,
      furnitureItems: JSON.parse(JSON.stringify(furnitureItems)),
    }
    const updated = [plan, ...get().plans]
    persistToStorage(updated)
    set({ plans: updated })
    return id
  },

  updatePlan: async (id, floorPlan, furnitureItems) => {
    const convertedPlan = await convertBlobUrl(floorPlan)
    const updated = get().plans.map(p =>
      p.id === id
        ? {
            ...p,
            floorPlan: convertedPlan,
            furnitureItems: JSON.parse(JSON.stringify(furnitureItems)),
            savedAt: new Date().toISOString(),
          }
        : p
    )
    persistToStorage(updated)
    set({ plans: updated })
  },

  deletePlan: (id) => {
    const updated = get().plans.filter(p => p.id !== id)
    persistToStorage(updated)
    set({ plans: updated })
  },

  renamePlan: (id, name) => {
    const updated = get().plans.map(p => p.id === id ? { ...p, name } : p)
    persistToStorage(updated)
    set({ plans: updated })
  },

  refresh: () => {
    set({ plans: loadFromStorage() })
  },
}))
