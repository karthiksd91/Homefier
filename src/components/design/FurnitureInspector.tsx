import { Trash2, RotateCw } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { useFurnitureStore } from '@/store/useFurnitureStore'
import { FURNITURE_BY_ID } from '@/lib/catalog/furnitureCatalog'

export default function FurnitureInspector() {
  const { selectedFurnitureId, setSelectedFurniture } = useUIStore()
  const { items, updateFurniture, removeFurniture } = useFurnitureStore()

  if (!selectedFurnitureId) {
    return (
      <div className="text-slate-500 text-sm text-center py-8">
        Click on a furniture item in the 3D view to edit it
      </div>
    )
  }

  const item = items[selectedFurnitureId]
  if (!item) return null

  const catalog = FURNITURE_BY_ID[item.catalogItemId]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-medium text-sm">{catalog?.name ?? 'Furniture'}</div>
          <div className="text-slate-500 text-xs mt-0.5">{catalog?.category}</div>
        </div>
        <button
          onClick={() => {
            removeFurniture(selectedFurnitureId)
            setSelectedFurniture(null)
          }}
          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Position */}
      <div>
        <label className="text-xs text-slate-400 font-medium mb-2 block">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 mb-1 block">X (m)</label>
            <input
              type="number" step="0.1"
              value={item.position[0].toFixed(2)}
              onChange={e => updateFurniture(selectedFurnitureId, {
                position: [parseFloat(e.target.value), item.position[1], item.position[2]]
              })}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 mb-1 block">Z (m)</label>
            <input
              type="number" step="0.1"
              value={item.position[2].toFixed(2)}
              onChange={e => updateFurniture(selectedFurnitureId, {
                position: [item.position[0], item.position[1], parseFloat(e.target.value)]
              })}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label className="text-xs text-slate-400 font-medium mb-2 block">
          Rotation: <span className="text-white">{Math.round(item.rotation * 180 / Math.PI)}°</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range" min="0" max="360" step="5"
            value={Math.round(item.rotation * 180 / Math.PI)}
            onChange={e => updateFurniture(selectedFurnitureId, {
              rotation: parseFloat(e.target.value) * Math.PI / 180
            })}
            className="flex-1 accent-primary-500"
          />
          <button
            onClick={() => updateFurniture(selectedFurnitureId, {
              rotation: item.rotation + Math.PI / 2
            })}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            title="Rotate 90°"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* Scale */}
      <div>
        <label className="text-xs text-slate-400 font-medium mb-2 block">
          Scale: <span className="text-white">{item.scale.toFixed(2)}×</span>
        </label>
        <input
          type="range" min="0.5" max="2.0" step="0.05"
          value={item.scale}
          onChange={e => updateFurniture(selectedFurnitureId, { scale: parseFloat(e.target.value) })}
          className="w-full accent-primary-500"
        />
      </div>
    </div>
  )
}
