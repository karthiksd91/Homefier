import { Trash2, X } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { OPENINGS_CATALOG } from '@/lib/catalog/openingsCatalog'

export default function OpeningsSidebarPanel() {
  const { selectedOpeningCatalogId, setSelectedOpeningCatalog, selectedWallId, selectedOpeningId, setSelectedOpening } = useUIStore()
  const { floorPlan, removeOpening, updateWall } = useFloorPlanStore()

  // Find the selected opening details
  const selectedWall = selectedWallId ? floorPlan.walls[selectedWallId] : null
  const selectedOpening = selectedOpeningId && selectedWall
    ? selectedWall.openings.find(o => o.id === selectedOpeningId)
    : null

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Opening type selector */}
      <div className="p-4 border-b border-white/10">
        <h4 className="text-white text-xs font-semibold uppercase tracking-wide mb-3">Opening Types</h4>
        <div className="grid grid-cols-2 gap-2">
          {OPENINGS_CATALOG.map(item => {
            const isSelected = selectedOpeningCatalogId === item.id
            return (
              <button
                key={item.id}
                onClick={() => setSelectedOpeningCatalog(isSelected ? null : item.id)}
                className={`p-3 rounded-xl border text-left transition-all group ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500/15'
                    : 'border-white/10 hover:border-white/25 bg-slate-800/50 hover:bg-slate-800'
                }`}
              >
                <div className="text-xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</div>
                <div className="text-white text-xs font-medium leading-tight">{item.name}</div>
                <div className="text-slate-500 text-[10px] mt-0.5">
                  {item.width.toFixed(1)}×{item.height.toFixed(1)}m
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Instructions */}
      {selectedOpeningCatalogId && !selectedOpening && (
        <div className="mx-4 mt-3 px-3 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
          <p className="font-medium text-center">Place opening:</p>
          <ul className="text-[11px] text-emerald-400/80 space-y-0.5 pl-2">
            <li>• Click a <span className="text-emerald-300">wall</span> to add to it</li>
            <li>• Click two <span className="text-emerald-300">nodes</span> to span between them</li>
          </ul>
        </div>
      )}

      {/* Selected opening properties */}
      {selectedOpening && selectedWall && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wide">Opening Properties</h4>
            <button onClick={() => setSelectedOpening(null)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Type</label>
              <div className="px-2.5 py-1.5 bg-slate-800 rounded-lg text-white text-xs capitalize">
                {selectedOpening.type}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">
                Width: <span className="text-slate-300">{selectedOpening.width.toFixed(2)}m</span>
              </label>
              <input
                type="range" min="0.4" max="3.0" step="0.1"
                value={selectedOpening.width}
                onChange={e => {
                  const newOpenings = selectedWall.openings.map(o =>
                    o.id === selectedOpening.id ? { ...o, width: parseFloat(e.target.value) } : o
                  )
                  updateWall(selectedWall.id, { openings: newOpenings })
                }}
                className="w-full accent-primary-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">
                Height: <span className="text-slate-300">{selectedOpening.height.toFixed(2)}m</span>
              </label>
              <input
                type="range" min="0.5" max="3.0" step="0.1"
                value={selectedOpening.height}
                onChange={e => {
                  const newOpenings = selectedWall.openings.map(o =>
                    o.id === selectedOpening.id ? { ...o, height: parseFloat(e.target.value) } : o
                  )
                  updateWall(selectedWall.id, { openings: newOpenings })
                }}
                className="w-full accent-primary-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">
                Position: <span className="text-slate-300">{(selectedOpening.offsetAlongWall * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range" min="0.1" max="0.9" step="0.01"
                value={selectedOpening.offsetAlongWall}
                onChange={e => {
                  const newOpenings = selectedWall.openings.map(o =>
                    o.id === selectedOpening.id ? { ...o, offsetAlongWall: parseFloat(e.target.value) } : o
                  )
                  updateWall(selectedWall.id, { openings: newOpenings })
                }}
                className="w-full accent-primary-500"
              />
            </div>

            <button
              onClick={() => {
                removeOpening(selectedWall.id, selectedOpening.id)
                setSelectedOpening(null)
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs transition-colors"
            >
              <Trash2 size={12} />
              Delete Opening
            </button>
          </div>
        </div>
      )}

      {/* List all openings */}
      {!selectedOpening && (
        <div className="p-4">
          <h4 className="text-white text-xs font-semibold uppercase tracking-wide mb-3">All Openings</h4>
          {(() => {
            const allOpenings = Object.values(floorPlan.walls).flatMap(w =>
              w.openings.map(o => ({ ...o, wallId: w.id }))
            )
            if (allOpenings.length === 0) {
              return <p className="text-slate-500 text-xs">No openings placed yet. Select a type above and click on a wall.</p>
            }
            return (
              <div className="space-y-1">
                {allOpenings.map(op => (
                  <button
                    key={op.id}
                    onClick={() => {
                      useUIStore.getState().setSelectedWall(op.wallId)
                      setSelectedOpening(op.id)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-xs transition-all"
                  >
                    <span className="text-white capitalize">{op.type}</span>
                    <span className="text-slate-500">{op.width.toFixed(1)}×{op.height.toFixed(1)}m</span>
                  </button>
                ))}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
