import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { useUIStore } from '@/store/useUIStore'
import { FLOOR_MATERIALS, WALL_MATERIALS, CEILING_MATERIALS } from '@/lib/catalog/materialCatalog'

export default function MaterialPicker() {
  const { selectedRoomId } = useUIStore()
  const { floorPlan, updateRoom } = useFloorPlanStore()

  const rooms = Object.values(floorPlan.rooms)

  if (rooms.length === 0) {
    return (
      <div className="text-slate-500 text-sm text-center py-8">
        No rooms detected yet. Draw a closed floor plan first.
      </div>
    )
  }

  const activeRoomId = selectedRoomId ?? rooms[0]?.id
  const room = floorPlan.rooms[activeRoomId]

  if (!room) return null

  return (
    <div className="space-y-5">
      {/* Room selector */}
      {rooms.length > 1 && (
        <div>
          <label className="text-xs text-slate-400 font-medium mb-2 block">Select Room</label>
          <div className="flex flex-wrap gap-2">
            {rooms.map(r => (
              <button
                key={r.id}
                onClick={() => useUIStore.getState().setSelectedRoom(r.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all border ${r.id === activeRoomId ? 'border-primary-500 bg-primary-500/15 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current room */}
      <div className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
          {room.name}
        </div>
      </div>

      {/* Floor */}
      <MaterialSection
        label="Floor"
        materials={FLOOR_MATERIALS}
        selected={room.floorMaterialId}
        onSelect={id => updateRoom(room.id, { floorMaterialId: id })}
      />

      {/* Walls */}
      <MaterialSection
        label="Walls"
        materials={WALL_MATERIALS}
        selected={room.wallMaterialId}
        onSelect={id => updateRoom(room.id, { wallMaterialId: id })}
      />

      {/* Ceiling */}
      <MaterialSection
        label="Ceiling"
        materials={CEILING_MATERIALS}
        selected={room.ceilingMaterialId}
        onSelect={id => updateRoom(room.id, { ceilingMaterialId: id })}
      />
    </div>
  )
}

function MaterialSection({ label, materials, selected, onSelect }: {
  label: string
  materials: { id: string; name: string; color: string }[]
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <label className="text-xs text-slate-400 font-medium mb-2 block">{label} Material</label>
      <div className="grid grid-cols-4 gap-1.5">
        {materials.map(mat => (
          <button
            key={mat.id}
            onClick={() => onSelect(mat.id)}
            title={mat.name}
            className={`
              h-9 rounded-lg border-2 transition-all relative group
              ${selected === mat.id ? 'border-primary-400 scale-105' : 'border-transparent hover:border-white/30'}
            `}
            style={{ backgroundColor: mat.color }}
          >
            {selected === mat.id && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white shadow" />
              </span>
            )}
            <span className="absolute -bottom-5 left-0 right-0 text-center text-[9px] text-slate-500 hidden group-hover:block truncate px-1">
              {mat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
