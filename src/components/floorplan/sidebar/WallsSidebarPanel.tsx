import { X, Trash2 } from 'lucide-react'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { useUIStore } from '@/store/useUIStore'
import { computeRoomArea } from '@/lib/geometry/roomDetector'
import type { RoomType } from '@/types'
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

export default function WallsSidebarPanel() {
  const { selectedRoomId, setSelectedRoom, selectedWallId, setSelectedWall } = useUIStore()
  const { floorPlan, updateRoom, updateWall, removeOpening } = useFloorPlanStore()

  const rooms = Object.values(floorPlan.rooms)
  const selectedRoom = selectedRoomId ? floorPlan.rooms[selectedRoomId] : null
  const selectedWall = selectedWallId ? floorPlan.walls[selectedWallId] : null

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Selected wall properties */}
      {selectedWall && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wide">Wall Properties</h4>
            <button onClick={() => setSelectedWall(null)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">
                Thickness: <span className="text-slate-300">{selectedWall.thickness.toFixed(2)}m</span>
              </label>
              <input
                type="range" min="0.1" max="0.4" step="0.02"
                value={selectedWall.thickness}
                onChange={e => updateWall(selectedWall.id, { thickness: parseFloat(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">
                Height: <span className="text-slate-300">{selectedWall.height.toFixed(1)}m</span>
              </label>
              <input
                type="range" min="2.2" max="4.5" step="0.1"
                value={selectedWall.height}
                onChange={e => updateWall(selectedWall.id, { height: parseFloat(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>

            {/* Openings on this wall */}
            {selectedWall.openings.length > 0 && (
              <div>
                <label className="text-[10px] text-slate-500 mb-1.5 block">Openings</label>
                <div className="space-y-1">
                  {selectedWall.openings.map(op => (
                    <div key={op.id} className="flex items-center justify-between px-2 py-1.5 bg-slate-800 rounded-lg text-xs">
                      <span className="text-slate-300 capitalize">{op.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{op.width.toFixed(1)}×{op.height.toFixed(1)}m</span>
                        <button
                          onClick={() => removeOpening(selectedWall.id, op.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected room properties */}
      {selectedRoom && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedRoom.color }} />
              <h4 className="text-white text-xs font-semibold uppercase tracking-wide">Room Properties</h4>
            </div>
            <button onClick={() => setSelectedRoom(null)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Name</label>
              <input
                value={selectedRoom.name}
                onChange={e => updateRoom(selectedRoom.id, { name: e.target.value })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Type</label>
              <select
                value={selectedRoom.type}
                onChange={e => {
                  const type = e.target.value as RoomType
                  updateRoom(selectedRoom.id, { type, color: ROOM_COLORS[type] ?? '#6b7280' })
                }}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-primary-500"
              >
                {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">
                Ceiling Height: <span className="text-slate-300">{selectedRoom.ceilingHeight.toFixed(1)}m</span>
              </label>
              <input
                type="range" min="2.2" max="4.5" step="0.1"
                value={selectedRoom.ceilingHeight}
                onChange={e => updateRoom(selectedRoom.id, { ceilingHeight: parseFloat(e.target.value) })}
                className="w-full accent-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Room list */}
      <div className="p-4">
        <h4 className="text-white text-xs font-semibold uppercase tracking-wide mb-3">
          Rooms {rooms.length > 0 && <span className="text-slate-500 font-normal">({rooms.length})</span>}
        </h4>

        {rooms.length === 0 ? (
          <p className="text-slate-500 text-xs">Draw walls to create rooms. Close a polygon by connecting back to the starting node.</p>
        ) : (
          <div className="space-y-1">
            {rooms.map(room => {
              const area = computeRoomArea(room, floorPlan.nodes, floorPlan.scale)
              const isSelected = selectedRoomId === room.id
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(isSelected ? null : room.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-primary-500/15 border border-primary-500/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: room.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">{room.name}</div>
                    <div className="text-slate-500 text-[10px]">
                      {area > 0 ? `${area.toFixed(1)} m²` : 'Area N/A'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
