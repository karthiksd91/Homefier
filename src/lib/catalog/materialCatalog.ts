import type { MaterialPreset } from '@/types'

export const MATERIALS: MaterialPreset[] = [
  // Floors
  { id: 'floor-hardwood', name: 'Hardwood', category: 'floor', color: '#8B6914', roughness: 0.7, metalness: 0 },
  { id: 'floor-oak', name: 'Light Oak', category: 'floor', color: '#C8A96E', roughness: 0.6, metalness: 0 },
  { id: 'floor-tile-white', name: 'White Tile', category: 'floor', color: '#F5F5F0', roughness: 0.3, metalness: 0 },
  { id: 'floor-tile-dark', name: 'Dark Tile', category: 'floor', color: '#3D3D3D', roughness: 0.4, metalness: 0 },
  { id: 'floor-concrete', name: 'Concrete', category: 'floor', color: '#9CA3AF', roughness: 0.9, metalness: 0 },
  { id: 'floor-carpet-beige', name: 'Beige Carpet', category: 'floor', color: '#D4C5A9', roughness: 1.0, metalness: 0 },
  { id: 'floor-carpet-grey', name: 'Grey Carpet', category: 'floor', color: '#9CA3AF', roughness: 1.0, metalness: 0 },
  { id: 'floor-marble', name: 'Marble', category: 'floor', color: '#E8E8E8', roughness: 0.1, metalness: 0.1 },

  // Walls
  { id: 'wall-white', name: 'White Paint', category: 'wall', color: '#FAFAFA', roughness: 0.85, metalness: 0 },
  { id: 'wall-cream', name: 'Cream', category: 'wall', color: '#FFF8E7', roughness: 0.85, metalness: 0 },
  { id: 'wall-grey', name: 'Cool Grey', category: 'wall', color: '#94A3B8', roughness: 0.85, metalness: 0 },
  { id: 'wall-navy', name: 'Navy Blue', category: 'wall', color: '#1E3A5F', roughness: 0.85, metalness: 0 },
  { id: 'wall-sage', name: 'Sage Green', category: 'wall', color: '#7D9B76', roughness: 0.85, metalness: 0 },
  { id: 'wall-terracotta', name: 'Terracotta', category: 'wall', color: '#C1784A', roughness: 0.85, metalness: 0 },
  { id: 'wall-brick', name: 'Exposed Brick', category: 'wall', color: '#A0522D', roughness: 0.95, metalness: 0 },
  { id: 'wall-charcoal', name: 'Charcoal', category: 'wall', color: '#374151', roughness: 0.85, metalness: 0 },

  // Ceilings
  { id: 'ceiling-white', name: 'White', category: 'ceiling', color: '#FFFFFF', roughness: 0.9, metalness: 0 },
  { id: 'ceiling-cream', name: 'Cream', category: 'ceiling', color: '#FFFBF0', roughness: 0.9, metalness: 0 },
  { id: 'ceiling-grey', name: 'Light Grey', category: 'ceiling', color: '#E5E7EB', roughness: 0.9, metalness: 0 },
  { id: 'ceiling-dark', name: 'Dark', category: 'ceiling', color: '#1F2937', roughness: 0.9, metalness: 0 },
]

export const MATERIALS_BY_ID: Record<string, MaterialPreset> = Object.fromEntries(
  MATERIALS.map(m => [m.id, m])
)

export const FLOOR_MATERIALS = MATERIALS.filter(m => m.category === 'floor')
export const WALL_MATERIALS = MATERIALS.filter(m => m.category === 'wall')
export const CEILING_MATERIALS = MATERIALS.filter(m => m.category === 'ceiling')
