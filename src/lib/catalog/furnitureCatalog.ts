import type { FurnitureCatalogItem } from '@/types'

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  // Seating
  { id: 'sofa-3seat', name: '3-Seat Sofa', category: 'seating', thumbnail: '🛋️', color: '#6B7280', dimensions: { width: 2.2, depth: 0.9, height: 0.85 }, tags: ['sofa', 'couch', 'living'] },
  { id: 'sofa-2seat', name: '2-Seat Sofa', category: 'seating', thumbnail: '🛋️', color: '#8B7355', dimensions: { width: 1.6, depth: 0.85, height: 0.85 }, tags: ['sofa', 'loveseat'] },
  { id: 'armchair', name: 'Armchair', category: 'seating', thumbnail: '💺', color: '#7C6B52', dimensions: { width: 0.85, depth: 0.85, height: 0.95 }, tags: ['chair', 'armchair'] },
  { id: 'dining-chair', name: 'Dining Chair', category: 'seating', thumbnail: '🪑', color: '#8B6914', dimensions: { width: 0.45, depth: 0.45, height: 0.9 }, tags: ['chair', 'dining'] },
  { id: 'office-chair', name: 'Office Chair', category: 'seating', thumbnail: '🪑', color: '#1F2937', dimensions: { width: 0.6, depth: 0.6, height: 1.1 }, tags: ['chair', 'office'] },
  { id: 'stool', name: 'Bar Stool', category: 'seating', thumbnail: '🪑', color: '#C8A96E', dimensions: { width: 0.4, depth: 0.4, height: 0.75 }, tags: ['stool', 'kitchen', 'bar'] },

  // Tables
  { id: 'coffee-table', name: 'Coffee Table', category: 'tables', thumbnail: '🪵', color: '#8B6914', dimensions: { width: 1.2, depth: 0.6, height: 0.45 }, tags: ['table', 'coffee', 'living'] },
  { id: 'dining-table-4', name: 'Dining Table (4)', category: 'tables', thumbnail: '🪵', color: '#8B6914', dimensions: { width: 1.4, depth: 0.8, height: 0.75 }, tags: ['table', 'dining'] },
  { id: 'dining-table-6', name: 'Dining Table (6)', category: 'tables', thumbnail: '🪵', color: '#6B4226', dimensions: { width: 1.8, depth: 0.9, height: 0.75 }, tags: ['table', 'dining'] },
  { id: 'desk', name: 'Work Desk', category: 'tables', thumbnail: '🖥️', color: '#E5E7EB', dimensions: { width: 1.4, depth: 0.7, height: 0.75 }, tags: ['desk', 'office', 'work'] },
  { id: 'side-table', name: 'Side Table', category: 'tables', thumbnail: '🪵', color: '#C8A96E', dimensions: { width: 0.5, depth: 0.5, height: 0.55 }, tags: ['table', 'side', 'nightstand'] },
  { id: 'kitchen-island', name: 'Kitchen Island', category: 'tables', thumbnail: '🍳', color: '#F3F4F6', dimensions: { width: 1.6, depth: 0.8, height: 0.9 }, tags: ['kitchen', 'island'] },

  // Beds
  { id: 'bed-king', name: 'King Bed', category: 'beds', thumbnail: '🛏️', color: '#F3F4F6', dimensions: { width: 1.9, depth: 2.1, height: 0.6 }, tags: ['bed', 'king', 'bedroom'] },
  { id: 'bed-queen', name: 'Queen Bed', category: 'beds', thumbnail: '🛏️', color: '#F3F4F6', dimensions: { width: 1.6, depth: 2.0, height: 0.55 }, tags: ['bed', 'queen', 'bedroom'] },
  { id: 'bed-single', name: 'Single Bed', category: 'beds', thumbnail: '🛏️', color: '#E5E7EB', dimensions: { width: 0.9, depth: 2.0, height: 0.5 }, tags: ['bed', 'single', 'twin'] },
  { id: 'bunk-bed', name: 'Bunk Bed', category: 'beds', thumbnail: '🛏️', color: '#E5E7EB', dimensions: { width: 0.9, depth: 2.0, height: 1.7 }, tags: ['bed', 'bunk', 'kids'] },

  // Storage
  { id: 'wardrobe', name: 'Wardrobe', category: 'storage', thumbnail: '🚪', color: '#E5E7EB', dimensions: { width: 1.6, depth: 0.6, height: 2.2 }, tags: ['wardrobe', 'closet', 'bedroom'] },
  { id: 'bookshelf', name: 'Bookshelf', category: 'storage', thumbnail: '📚', color: '#8B6914', dimensions: { width: 0.8, depth: 0.3, height: 1.8 }, tags: ['shelf', 'books', 'storage'] },
  { id: 'tv-unit', name: 'TV Unit', category: 'storage', thumbnail: '📺', color: '#1F2937', dimensions: { width: 1.6, depth: 0.45, height: 0.5 }, tags: ['tv', 'media', 'living'] },
  { id: 'dresser', name: 'Dresser', category: 'storage', thumbnail: '🪞', color: '#E5E7EB', dimensions: { width: 1.0, depth: 0.45, height: 1.0 }, tags: ['dresser', 'bedroom', 'storage'] },
  { id: 'kitchen-cabinet', name: 'Kitchen Cabinet', category: 'storage', thumbnail: '🗄️', color: '#F3F4F6', dimensions: { width: 0.6, depth: 0.6, height: 0.9 }, tags: ['cabinet', 'kitchen'] },

  // Lighting
  { id: 'floor-lamp', name: 'Floor Lamp', category: 'lighting', thumbnail: '💡', color: '#F59E0B', dimensions: { width: 0.3, depth: 0.3, height: 1.6 }, tags: ['lamp', 'light', 'floor'] },
  { id: 'table-lamp', name: 'Table Lamp', category: 'lighting', thumbnail: '🕯️', color: '#FCD34D', dimensions: { width: 0.25, depth: 0.25, height: 0.45 }, tags: ['lamp', 'light', 'table'] },

  // Appliances
  { id: 'refrigerator', name: 'Refrigerator', category: 'appliances', thumbnail: '🧊', color: '#E5E7EB', dimensions: { width: 0.7, depth: 0.7, height: 1.8 }, tags: ['fridge', 'kitchen', 'appliance'] },
  { id: 'washing-machine', name: 'Washing Machine', category: 'appliances', thumbnail: '🫧', color: '#F3F4F6', dimensions: { width: 0.6, depth: 0.6, height: 0.85 }, tags: ['washing', 'laundry', 'appliance'] },
  { id: 'dishwasher', name: 'Dishwasher', category: 'appliances', thumbnail: '🍽️', color: '#E5E7EB', dimensions: { width: 0.6, depth: 0.58, height: 0.85 }, tags: ['dishwasher', 'kitchen', 'appliance'] },
  { id: 'tv', name: 'TV (55")', category: 'appliances', thumbnail: '📺', color: '#111827', dimensions: { width: 1.25, depth: 0.08, height: 0.75 }, tags: ['tv', 'television', 'living'] },

  // Bathroom
  { id: 'bathtub', name: 'Bathtub', category: 'bathroom', thumbnail: '🛁', color: '#F9FAFB', dimensions: { width: 0.75, depth: 1.6, height: 0.55 }, tags: ['bath', 'tub', 'bathroom'] },
  { id: 'toilet', name: 'Toilet', category: 'bathroom', thumbnail: '🚽', color: '#F9FAFB', dimensions: { width: 0.38, depth: 0.7, height: 0.75 }, tags: ['toilet', 'bathroom', 'wc'] },
  { id: 'sink-vanity', name: 'Sink Vanity', category: 'bathroom', thumbnail: '🚰', color: '#F9FAFB', dimensions: { width: 0.6, depth: 0.45, height: 0.85 }, tags: ['sink', 'vanity', 'bathroom'] },

  // Decor
  { id: 'plant-large', name: 'Large Plant', category: 'decor', thumbnail: '🌿', color: '#16A34A', dimensions: { width: 0.5, depth: 0.5, height: 1.5 }, tags: ['plant', 'decor', 'green'] },
  { id: 'plant-small', name: 'Small Plant', category: 'decor', thumbnail: '🪴', color: '#22C55E', dimensions: { width: 0.3, depth: 0.3, height: 0.5 }, tags: ['plant', 'decor'] },
  { id: 'rug-large', name: 'Large Rug', category: 'decor', thumbnail: '🟫', color: '#92400E', dimensions: { width: 2.0, depth: 1.4, height: 0.02 }, tags: ['rug', 'carpet', 'decor'] },
]

export const FURNITURE_BY_ID: Record<string, FurnitureCatalogItem> = Object.fromEntries(
  FURNITURE_CATALOG.map(f => [f.id, f])
)

export const FURNITURE_CATEGORIES = [
  'seating', 'tables', 'beds', 'storage', 'lighting', 'appliances', 'bathroom', 'decor'
] as const
