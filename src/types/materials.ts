export type MaterialCategory = 'floor' | 'wall' | 'ceiling' | 'furniture'

export interface MaterialPreset {
  id: string
  name: string
  category: MaterialCategory
  color: string           // hex color
  roughness: number       // 0..1
  metalness: number       // 0..1
  textureUrl?: string     // optional texture overlay path
  repeatX?: number
  repeatY?: number
}
