import type { ComponentType } from 'react'
import {
  Pencil, MousePointer2, Trash2, Undo2, Redo2,
  Grid3X3, Ruler, Image, DoorOpen, Palette, Sofa
} from 'lucide-react'
import { useUIStore, type EditorMode, type ActiveTool } from '@/store/useUIStore'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'

const MODES: { id: EditorMode; icon: ComponentType<{ size?: number }>; label: string; shortcut: string }[] = [
  { id: 'walls', icon: Pencil, label: 'Walls', shortcut: '1' },
  { id: 'openings', icon: DoorOpen, label: 'Openings', shortcut: '2' },
  { id: 'materials', icon: Palette, label: 'Materials', shortcut: '3' },
  { id: 'furniture', icon: Sofa, label: 'Furniture', shortcut: '4' },
]

const WALL_TOOLS: { id: ActiveTool; icon: ComponentType<{ size?: number }>; label: string; shortcut: string }[] = [
  { id: 'wall', icon: Pencil, label: 'Draw Wall', shortcut: 'W' },
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'S' },
  { id: 'eraser', icon: Trash2, label: 'Delete', shortcut: 'E' },
]

export default function FloorPlanToolbar() {
  const { editorMode, setEditorMode, activeTool, setActiveTool, showGrid, setShowGrid, showMeasurements, setShowMeasurements, showSketch, setShowSketch } = useUIStore()
  const { undo, redo, floorPlan } = useFloorPlanStore()

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 glass-dark rounded-2xl p-1.5 shadow-xl border border-white/10">
      {/* Mode tabs */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-white/10">
        {MODES.map(mode => {
          const Icon = mode.icon
          const active = editorMode === mode.id
          return (
            <button
              key={mode.id}
              onClick={() => setEditorMode(mode.id)}
              title={`${mode.label} (${mode.shortcut})`}
              className={`
                relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all text-xs font-medium
                ${active
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{mode.label}</span>
              <span className="absolute -top-1 -right-0.5 text-[8px] text-slate-500 font-mono leading-none">{mode.shortcut}</span>
            </button>
          )
        })}
      </div>

      {/* Sub-tools (walls mode only) */}
      {editorMode === 'walls' && (
        <div className="flex items-center gap-0.5 px-2 border-r border-white/10">
          {WALL_TOOLS.map(tool => {
            const Icon = tool.icon
            const active = activeTool === tool.id
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={`${tool.label} (${tool.shortcut})`}
                className={`
                  relative w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm
                  ${active
                    ? 'bg-white/15 text-white'
                    : 'text-slate-500 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Icon size={14} />
                <span className="absolute -bottom-0.5 -right-0.5 text-[8px] text-slate-600 font-mono leading-none">{tool.shortcut}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5 px-2 border-r border-white/10">
        <button onClick={undo} title="Undo (Ctrl+Z)" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Undo2 size={14} />
        </button>
        <button onClick={redo} title="Redo (Ctrl+Shift+Z)" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Redo2 size={14} />
        </button>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-0.5 pl-2">
        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showGrid ? 'text-primary-400 bg-primary-500/15' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
        >
          <Grid3X3 size={14} />
        </button>
        <button
          onClick={() => setShowMeasurements(!showMeasurements)}
          title="Toggle Measurements"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showMeasurements ? 'text-primary-400 bg-primary-500/15' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
        >
          <Ruler size={14} />
        </button>
        {floorPlan.sketchImageUrl && (
          <button
            onClick={() => setShowSketch(!showSketch)}
            title="Toggle Sketch"
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showSketch ? 'text-amber-400 bg-amber-500/15' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
          >
            <Image size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
