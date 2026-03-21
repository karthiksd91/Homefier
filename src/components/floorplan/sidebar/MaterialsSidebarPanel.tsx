import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { useUIStore, type MaterialTarget } from '@/store/useUIStore'
import { FLOOR_MATERIALS, WALL_MATERIALS, CEILING_MATERIALS } from '@/lib/catalog/materialCatalog'

const TARGETS: { id: MaterialTarget; label: string }[] = [
  { id: 'floor', label: 'Floor' },
  { id: 'wall', label: 'Walls' },
  { id: 'ceiling', label: 'Ceiling' },
]

function getMaterialsForTarget(target: MaterialTarget) {
  if (target === 'floor') return FLOOR_MATERIALS
  if (target === 'wall') return WALL_MATERIALS
  return CEILING_MATERIALS
}

function getMaterialKey(target: MaterialTarget): 'floorMaterialId' | 'wallMaterialId' | 'ceilingMaterialId' {
  if (target === 'floor') return 'floorMaterialId'
  if (target === 'wall') return 'wallMaterialId'
  return 'ceilingMaterialId'
}

export default function MaterialsSidebarPanel() {
  const { materialTarget, setMaterialTarget, selectedMaterialId, setSelectedMaterial, selectedRoomId, setSelectedRoom } = useUIStore()
  const { floorPlan, updateRoom } = useFloorPlanStore()

  const rooms = Object.values(floorPlan.rooms)
  const materials = getMaterialsForTarget(materialTarget)
  const materialKey = getMaterialKey(materialTarget)

  function applyToRoom(roomId: string) {
    if (!selectedMaterialId) return
    updateRoom(roomId, { [materialKey]: selectedMaterialId })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Surface target toggle */}
      <div className="p-4 border-b border-white/10">
        <h4 className="text-white text-xs font-semibold uppercase tracking-wide mb-3">Surface</h4>
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
          {TARGETS.map(t => (
            <button
              key={t.id}
              onClick={() => setMaterialTarget(t.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                materialTarget === t.id
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Material grid */}
      <div className="p-4 border-b border-white/10">
        <h4 className="text-white text-xs font-semibold uppercase tracking-wide mb-3">Materials</h4>
        <div className="grid grid-cols-4 gap-2">
          {materials.map(mat => {
            const isSelected = selectedMaterialId === mat.id
            return (
              <button
                key={mat.id}
                onClick={() => setSelectedMaterial(isSelected ? null : mat.id)}
                title={mat.name}
                className={`h-10 rounded-lg border-2 transition-all relative group ${
                  isSelected ? 'border-primary-400 scale-105 ring-1 ring-primary-400/50' : 'border-transparent hover:border-white/30'
                }`}
                style={{ backgroundColor: mat.color }}
              >
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white shadow" />
                  </span>
                )}
                <span className="absolute -bottom-5 left-0 right-0 text-center text-[9px] text-slate-500 hidden group-hover:block truncate px-0.5">
                  {mat.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Apply to rooms */}
      <div className="p-4">
        {selectedMaterialId ? (
          <>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wide mb-3">Apply to Room</h4>
            {rooms.length === 0 ? (
              <p className="text-slate-500 text-xs">No rooms detected yet.</p>
            ) : (
              <div className="space-y-1">
                {rooms.map(room => {
                  const currentMat = room[materialKey]
                  const isApplied = currentMat === selectedMaterialId
                  return (
                    <button
                      key={room.id}
                      onClick={() => applyToRoom(room.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                        isApplied
                          ? 'bg-emerald-500/15 border border-emerald-500/30'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: room.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{room.name}</div>
                      </div>
                      {isApplied && <span className="text-emerald-400 text-[10px]">Applied</span>}
                    </button>
                  )
                })}
              </div>
            )}
            <p className="text-slate-500 text-[10px] mt-3">
              Or click directly on a room in the canvas to apply.
            </p>
          </>
        ) : (
          <p className="text-slate-500 text-xs">Select a material above, then click a room to apply it.</p>
        )}
      </div>
    </div>
  )
}
