import { X } from 'lucide-react'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { useUIStore } from '@/store/useUIStore'
import type { RoomType } from '@/types'
import { FLOOR_MATERIALS, WALL_MATERIALS, CEILING_MATERIALS } from '@/lib/catalog/materialCatalog'
import { ROOM_COLORS } from '@/lib/constants'

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'living_room', label: 'Living Room' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'dining_room', label: 'Dining Room' },
  { value: 'hallway', label: 'Hallway' },
  { value: 'garage', label: 'Garage' },
  { value: 'other', label: 'Other' },
]

export default function RoomPropertiesPanel() {
  const { selectedRoomId, setSelectedRoom } = useUIStore()
  const { floorPlan, updateRoom } = useFloorPlanStore()

  if (!selectedRoomId) return null
  const room = floorPlan.rooms[selectedRoomId]
  if (!room) return null

  return (
    <div className="absolute top-4 right-4 w-72 glass-dark rounded-2xl shadow-xl border border-white/10 z-20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
          <h3 className="text-white font-semibold text-sm">Room Properties</h3>
        </div>
        <button onClick={() => setSelectedRoom(null)} className="text-slate-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
        {/* Name */}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Room Name</label>
          <input
            value={room.name}
            onChange={e => updateRoom(room.id, { name: e.target.value })}
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Room Type</label>
          <select
            value={room.type}
            onChange={e => {
              const type = e.target.value as RoomType
              updateRoom(room.id, { type, color: ROOM_COLORS[type] ?? '#6b7280' })
            }}
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
          >
            {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Ceiling height */}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">
            Ceiling Height: <span className="text-white">{room.ceilingHeight.toFixed(1)}m</span>
          </label>
          <input
            type="range" min="2.2" max="4.5" step="0.1"
            value={room.ceilingHeight}
            onChange={e => updateRoom(room.id, { ceilingHeight: parseFloat(e.target.value) })}
            className="w-full accent-primary-500"
          />
        </div>

        {/* Floor material */}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Floor Material</label>
          <div className="grid grid-cols-4 gap-1.5">
            {FLOOR_MATERIALS.map(mat => (
              <button
                key={mat.id}
                onClick={() => updateRoom(room.id, { floorMaterialId: mat.id })}
                title={mat.name}
                className={`h-8 rounded-lg border-2 transition-all ${room.floorMaterialId === mat.id ? 'border-primary-400 scale-105' : 'border-transparent hover:border-white/30'}`}
                style={{ backgroundColor: mat.color }}
              />
            ))}
          </div>
        </div>

        {/* Wall material */}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Wall Material</label>
          <div className="grid grid-cols-4 gap-1.5">
            {WALL_MATERIALS.map(mat => (
              <button
                key={mat.id}
                onClick={() => updateRoom(room.id, { wallMaterialId: mat.id })}
                title={mat.name}
                className={`h-8 rounded-lg border-2 transition-all ${room.wallMaterialId === mat.id ? 'border-primary-400 scale-105' : 'border-transparent hover:border-white/30'}`}
                style={{ backgroundColor: mat.color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
