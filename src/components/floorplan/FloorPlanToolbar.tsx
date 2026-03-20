import type { ComponentType } from 'react'
import { Pencil, MousePointer2, DoorOpen, Square, Trash2, Undo2, Redo2, Grid3X3, Ruler, Image } from 'lucide-react'
import { useUIStore, type ActiveTool } from '@/store/useUIStore'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'

const TOOLS: { id: ActiveTool; icon: ComponentType<{ size?: number }>; label: string; shortcut: string }[] = [
  { id: 'wall', icon: Pencil, label: 'Draw Wall', shortcut: 'W' },
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'S' },
  { id: 'door', icon: DoorOpen, label: 'Add Door', shortcut: 'D' },
  { id: 'window', icon: Square, label: 'Add Window', shortcut: 'X' },
  { id: 'eraser', icon: Trash2, label: 'Delete', shortcut: 'E' },
]

export default function FloorPlanToolbar() {
  const { activeTool, setActiveTool, showGrid, setShowGrid, showMeasurements, setShowMeasurements, showSketch, setShowSketch } = useUIStore()
  const { undo, redo, floorPlan } = useFloorPlanStore()

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 glass-dark rounded-2xl p-1.5 shadow-xl border border-white/10">
      {/* Drawing tools */}
      <div className="flex items-center gap-1 pr-2 border-r border-white/10">
        {TOOLS.map(tool => {
          const Icon = tool.icon
          const active = activeTool === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className={`
                relative w-9 h-9 rounded-xl flex items-center justify-center transition-all text-sm font-medium
                ${active
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <Icon size={16} />
              <span className="absolute -bottom-0.5 -right-0.5 text-[9px] text-slate-500 font-mono leading-none">{tool.shortcut}</span>
            </button>
          )
        })}
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 px-2 border-r border-white/10">
        <button onClick={undo} title="Undo (Ctrl+Z)" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Undo2 size={16} />
        </button>
        <button onClick={redo} title="Redo (Ctrl+Shift+Z)" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Redo2 size={16} />
        </button>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-1 pl-2">
        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showGrid ? 'text-primary-400 bg-primary-500/15' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
        >
          <Grid3X3 size={16} />
        </button>
        <button
          onClick={() => setShowMeasurements(!showMeasurements)}
          title="Toggle Measurements"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showMeasurements ? 'text-primary-400 bg-primary-500/15' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
        >
          <Ruler size={16} />
        </button>
        {floorPlan.sketchImageUrl && (
          <button
            onClick={() => setShowSketch(!showSketch)}
            title="Toggle Sketch"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showSketch ? 'text-amber-400 bg-amber-500/15' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
          >
            <Image size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
