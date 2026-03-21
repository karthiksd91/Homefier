import { useUIStore } from '@/store/useUIStore'
import WallsSidebarPanel from './sidebar/WallsSidebarPanel'
import OpeningsSidebarPanel from './sidebar/OpeningsSidebarPanel'
import MaterialsSidebarPanel from './sidebar/MaterialsSidebarPanel'
import FurnitureSidebarPanel from './sidebar/FurnitureSidebarPanel'
import SidebarFooter from './sidebar/SidebarFooter'

interface Props {
  onSetScale: () => void
  onSave: () => void
  onProceed: () => void
  saveFlash: boolean
  saving: boolean
}

export default function EditorSidebar({ onSetScale, onSave, onProceed, saveFlash, saving }: Props) {
  const { editorMode } = useUIStore()

  return (
    <div className="w-72 h-full glass-dark border-l border-white/10 flex flex-col shrink-0">
      {/* Mode-specific content */}
      <div className="flex-1 overflow-hidden">
        {editorMode === 'walls' && <WallsSidebarPanel />}
        {editorMode === 'openings' && <OpeningsSidebarPanel />}
        {editorMode === 'materials' && <MaterialsSidebarPanel />}
        {editorMode === 'furniture' && <FurnitureSidebarPanel />}
      </div>

      {/* Footer */}
      <SidebarFooter
        onSetScale={onSetScale}
        onSave={onSave}
        onProceed={onProceed}
        saveFlash={saveFlash}
        saving={saving}
      />
    </div>
  )
}
