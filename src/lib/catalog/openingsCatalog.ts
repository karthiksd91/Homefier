import type { WallOpeningType } from '@/types'

export interface OpeningCatalogItem {
  id: string
  type: WallOpeningType
  name: string
  width: number
  height: number
  bottomOffset: number
  icon: string
}

export const OPENINGS_CATALOG: OpeningCatalogItem[] = [
  { id: 'standard-door', type: 'door', name: 'Standard Door', width: 0.9, height: 2.1, bottomOffset: 0, icon: '🚪' },
  { id: 'double-door', type: 'door', name: 'Double Door', width: 1.6, height: 2.1, bottomOffset: 0, icon: '🚪' },
  { id: 'sliding-door', type: 'door', name: 'Sliding Door', width: 1.8, height: 2.1, bottomOffset: 0, icon: '🚪' },
  { id: 'standard-window', type: 'window', name: 'Window', width: 1.0, height: 1.2, bottomOffset: 0.9, icon: '🪟' },
  { id: 'large-window', type: 'window', name: 'Large Window', width: 1.8, height: 1.5, bottomOffset: 0.8, icon: '🪟' },
  { id: 'archway', type: 'archway', name: 'Archway', width: 1.0, height: 2.4, bottomOffset: 0, icon: '🏛️' },
]

export const OPENINGS_BY_ID: Record<string, OpeningCatalogItem> = Object.fromEntries(
  OPENINGS_CATALOG.map(o => [o.id, o])
)
