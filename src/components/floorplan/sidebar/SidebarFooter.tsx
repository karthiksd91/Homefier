import { ArrowRight, Ruler, AlertTriangle, Save, Check } from 'lucide-react'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'

interface Props {
  onSetScale: () => void
  onSave: () => void
  onProceed: () => void
  saveFlash: boolean
  saving: boolean
}

export default function SidebarFooter({ onSetScale, onSave, onProceed, saveFlash, saving }: Props) {
  const { floorPlan, isDirty } = useFloorPlanStore()

  const wallCount = Object.keys(floorPlan.walls).length
  const roomCount = Object.keys(floorPlan.rooms).length
  const isScaleSet = floorPlan.scale > 0
  const canProceed = roomCount > 0 && isScaleSet
  const hasContent = wallCount > 0

  return (
    <div className="shrink-0 border-t border-white/10 p-3 space-y-2.5">
      {/* Stats */}
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            Walls: <span className="text-slate-300 font-medium">{wallCount}</span>
          </span>
          <span className="text-slate-500">
            Rooms: <span className="text-slate-300 font-medium">{roomCount}</span>
          </span>
        </div>
        <span className="text-slate-500">
          Scale: <span className={isScaleSet ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
            {isScaleSet ? `${floorPlan.scale.toFixed(0)} px/m` : 'Not set'}
          </span>
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onSetScale}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
        >
          <Ruler size={11} />
          Scale
        </button>
        <button
          onClick={onSave}
          disabled={saving || !hasContent}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] transition-all border ${
            saveFlash
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              : isDirty && hasContent
                ? 'border-amber-500/30 text-amber-300 hover:border-amber-500/50'
                : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
          } ${(!hasContent || saving) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saveFlash ? <Check size={11} /> : <Save size={11} />}
          {saveFlash ? 'Saved' : saving ? '...' : 'Save'}
        </button>
      </div>

      {/* Proceed button */}
      {canProceed ? (
        <button
          onClick={onProceed}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-lg transition-all text-xs"
        >
          Proceed to 3D Design
          <ArrowRight size={14} />
        </button>
      ) : roomCount > 0 && !isScaleSet ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-[10px]">
          <AlertTriangle size={12} />
          Set scale to proceed
        </div>
      ) : null}
    </div>
  )
}
