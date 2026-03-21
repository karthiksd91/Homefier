import { Search } from 'lucide-react'
import { FURNITURE_CATALOG, FURNITURE_CATEGORIES } from '@/lib/catalog/furnitureCatalog'
import { useUIStore } from '@/store/useUIStore'

const CATEGORY_LABELS: Record<string, string> = {
  seating: 'Seating', tables: 'Tables', beds: 'Beds', storage: 'Storage',
  lighting: 'Lighting', appliances: 'Appliances', bathroom: 'Bath', decor: 'Decor'
}

export default function FurnitureSidebarPanel() {
  const { furnitureSearch, furnitureCategory, setFurnitureSearch, setFurnitureCategory, setPendingFurniture, pendingFurnitureId } = useUIStore()

  const filtered = FURNITURE_CATALOG.filter(item => {
    const matchCat = furnitureCategory === 'all' || item.category === furnitureCategory
    const matchSearch = !furnitureSearch || item.name.toLowerCase().includes(furnitureSearch.toLowerCase()) || item.tags.some(t => t.includes(furnitureSearch.toLowerCase()))
    return matchCat && matchSearch
  })

  return (
    <div className="flex flex-col h-full p-4">
      {/* Search */}
      <div className="relative mb-3">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={furnitureSearch}
          onChange={e => setFurnitureSearch(e.target.value)}
          placeholder="Search furniture..."
          className="w-full bg-slate-800 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-xs focus:outline-none focus:border-primary-500 placeholder-slate-500"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap mb-3">
        <button
          onClick={() => setFurnitureCategory('all')}
          className={`px-2 py-1 rounded-md text-[10px] transition-all ${furnitureCategory === 'all' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        >
          All
        </button>
        {FURNITURE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFurnitureCategory(cat)}
            className={`px-2 py-1 rounded-md text-[10px] transition-all ${furnitureCategory === cat ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map(item => {
            const isSelected = pendingFurnitureId === item.id
            return (
              <button
                key={item.id}
                onClick={() => setPendingFurniture(isSelected ? null : item.id)}
                className={`p-2.5 rounded-xl border text-left transition-all group ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500/15'
                    : 'border-white/10 hover:border-white/25 bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="text-xl mb-1 group-hover:scale-110 transition-transform">{item.thumbnail}</div>
                <div className="text-white text-[11px] font-medium leading-tight">{item.name}</div>
                <div className="text-slate-500 text-[10px] mt-0.5">
                  {item.dimensions.width.toFixed(1)}x{item.dimensions.depth.toFixed(1)}m
                </div>
              </button>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center text-slate-500 text-xs py-8">No items found</div>
        )}
      </div>

      {pendingFurnitureId && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center shrink-0">
          Proceed to 3D Design to place furniture
        </div>
      )}
    </div>
  )
}
