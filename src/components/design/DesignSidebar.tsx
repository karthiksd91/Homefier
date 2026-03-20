import type { ComponentType } from 'react'
import { Sofa, Palette, Home } from 'lucide-react'
import { useUIStore, type DesignSidebarTab } from '@/store/useUIStore'
import FurnitureCatalog from './FurnitureCatalog'
import MaterialPicker from './MaterialPicker'
import FurnitureInspector from './FurnitureInspector'

const TABS: { id: DesignSidebarTab; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { id: 'furniture', label: 'Furniture', icon: Sofa },
  { id: 'materials', label: 'Materials', icon: Palette },
  { id: 'rooms', label: 'Inspector', icon: Home },
]

export default function DesignSidebar() {
  const { sidebarTab, setSidebarTab } = useUIStore()

  return (
    <div className="w-72 h-full glass-dark border-l border-white/10 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-white/10 shrink-0">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = sidebarTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all border-b-2 ${active ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {sidebarTab === 'furniture' && <FurnitureCatalog />}
        {sidebarTab === 'materials' && <MaterialPicker />}
        {sidebarTab === 'rooms' && <FurnitureInspector />}
      </div>
    </div>
  )
}
