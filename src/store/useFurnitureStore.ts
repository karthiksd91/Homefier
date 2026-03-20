import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { PlacedFurniture } from '@/types'

interface FurnitureStore {
  items: Record<string, PlacedFurniture>
  addFurniture: (item: Omit<PlacedFurniture, 'id'>) => string
  updateFurniture: (id: string, patch: Partial<PlacedFurniture>) => void
  removeFurniture: (id: string) => void
  clearAll: () => void
}

export const useFurnitureStore = create<FurnitureStore>()(
  immer((set) => ({
    items: {},

    addFurniture: (item) => {
      const id = nanoid()
      set(state => {
        state.items[id] = { ...item, id }
      })
      return id
    },

    updateFurniture: (id, patch) => set(state => {
      if (state.items[id]) Object.assign(state.items[id], patch)
    }),

    removeFurniture: (id) => set(state => {
      delete state.items[id]
    }),

    clearAll: () => set(state => {
      state.items = {}
    }),
  }))
)
