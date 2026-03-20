export type FurnitureCategory =
  | 'seating'
  | 'tables'
  | 'beds'
  | 'storage'
  | 'lighting'
  | 'decor'
  | 'appliances'
  | 'bathroom'

export interface FurnitureCatalogItem {
  id: string
  name: string
  category: FurnitureCategory
  thumbnail: string       // emoji or image URL
  color: string           // fallback color for 3D box
  dimensions: {
    width: number         // meters
    depth: number
    height: number
  }
  tags: string[]
}

export interface PlacedFurniture {
  id: string
  catalogItemId: string
  roomId: string
  position: [number, number, number]  // Three.js world coords
  rotation: number                     // Y-axis radians
  scale: number                        // uniform multiplier
}
