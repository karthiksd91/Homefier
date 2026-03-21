import { useNavigate, useBlocker } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Info, Ruler, AlertTriangle, Save, Check } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import FloorPlanCanvas from '@/components/floorplan/FloorPlanCanvas'
import FloorPlanToolbar from '@/components/floorplan/FloorPlanToolbar'
import RoomPropertiesPanel from '@/components/floorplan/RoomPropertiesPanel'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { useFurnitureStore } from '@/store/useFurnitureStore'
import { useSavedPlansStore } from '@/store/useSavedPlansStore'
import { useUIStore } from '@/store/useUIStore'
import { useState, useEffect, useCallback } from 'react'

export default function FloorPlanEditorPage() {
  const navigate = useNavigate()
  const { floorPlan, setScale, isDirty, markClean, currentSaveId, setCurrentSaveId } = useFloorPlanStore()
  const furnitureItems = useFurnitureStore(s => s.items)
  const { savePlan, updatePlan } = useSavedPlansStore()
  const { selectedRoomId } = useUIStore()

  const [showScaleDialog, setShowScaleDialog] = useState(false)
  const [scaleInput, setScaleInput] = useState('')
  const [scalePxInput, setScalePxInput] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveFlash, setSaveFlash] = useState(false)
  const [saving, setSaving] = useState(false)

  const roomCount = Object.keys(floorPlan.rooms).length
  const wallCount = Object.keys(floorPlan.walls).length
  const isScaleSet = floorPlan.scale > 0
  const canProceed = roomCount > 0 && isScaleSet
  const hasContent = wallCount > 0

  // --- Beforeunload: warn on refresh / close tab ---
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty && hasContent) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, hasContent])

  // --- React Router navigation blocker ---
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && hasContent && currentLocation.pathname !== nextLocation.pathname
  )

  // --- Save logic ---
  const handleSave = useCallback(async () => {
    if (!hasContent) return
    setSaving(true)
    try {
      if (currentSaveId) {
        await updatePlan(currentSaveId, floorPlan, furnitureItems)
      } else {
        setShowSaveDialog(true)
        setSaveName(floorPlan.name || 'My Home')
        setSaving(false)
        return
      }
      markClean()
      setSaveFlash(true)
      setTimeout(() => setSaveFlash(false), 2000)
    } finally {
      setSaving(false)
    }
  }, [hasContent, currentSaveId, updatePlan, floorPlan, furnitureItems, markClean])

  async function handleSaveNew() {
    if (!saveName.trim()) return
    setSaving(true)
    try {
      const id = await savePlan(saveName.trim(), floorPlan, furnitureItems)
      setCurrentSaveId(id)
      markClean()
      setShowSaveDialog(false)
      setSaveFlash(true)
      setTimeout(() => setSaveFlash(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function handleBlockerSave() {
    if (!hasContent) {
      blocker.proceed?.()
      return
    }
    setSaving(true)
    try {
      if (currentSaveId) {
        await updatePlan(currentSaveId, floorPlan, furnitureItems)
      } else {
        const name = floorPlan.name || 'My Home'
        const id = await savePlan(name, floorPlan, furnitureItems)
        setCurrentSaveId(id)
      }
      markClean()
    } finally {
      setSaving(false)
    }
    blocker.proceed?.()
  }

  function applyScale() {
    const realMeters = parseFloat(scaleInput)
    const pixels = parseFloat(scalePxInput)
    if (realMeters > 0 && pixels > 0) {
      setScale(pixels / realMeters)
      setShowScaleDialog(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <Navbar />

      <div className="flex-1 relative overflow-hidden">
        <FloorPlanCanvas />
        <FloorPlanToolbar />

        {/* Selected room properties */}
        {selectedRoomId && <RoomPropertiesPanel />}

        {/* Save button — top right */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !hasContent}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border
              ${saveFlash
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                : isDirty && hasContent
                  ? 'glass-dark border-amber-500/30 text-amber-300 hover:border-amber-500/50 hover:text-amber-200'
                  : 'glass-dark border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }
              ${(!hasContent || saving) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {saveFlash ? <Check size={13} /> : <Save size={13} />}
            {saveFlash ? 'Saved' : saving ? 'Saving...' : 'Save'}
            {isDirty && hasContent && !saveFlash && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />
            )}
          </button>
        </div>

        {/* Status bar */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3 z-20">
          <div className="glass-dark rounded-xl px-4 py-2 flex items-center gap-3 text-xs border border-white/10">
            <span className="text-slate-400">
              Walls: <span className="text-white font-medium">{wallCount}</span>
            </span>
            <span className="w-px h-3 bg-slate-700" />
            <span className="text-slate-400">
              Rooms: <span className="text-white font-medium">{roomCount}</span>
            </span>
            <span className="w-px h-3 bg-slate-700" />
            <span className="text-slate-400">
              Scale: <span className={isScaleSet ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                {isScaleSet ? `${floorPlan.scale.toFixed(0)} px/m` : 'Not set'}
              </span>
            </span>
          </div>

          <button
            onClick={() => setShowScaleDialog(true)}
            className="flex items-center gap-1.5 px-3 py-2 glass-dark rounded-xl text-xs text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            <Ruler size={12} />
            Set Scale
          </button>
        </div>

        {/* Instructions */}
        {wallCount === 0 && (
          <div className="absolute bottom-4 right-4 max-w-xs glass-dark rounded-xl p-4 text-xs text-slate-400 border border-white/10 z-20">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-primary-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">How to draw</p>
                <ul className="space-y-0.5">
                  <li>• Click to place wall endpoints</li>
                  <li>• Click existing nodes to connect walls</li>
                  <li>• Double-click or press Esc to stop drawing</li>
                  <li>• Close a polygon to create a room</li>
                  <li>• Scroll to zoom, drag (Select mode) to pan</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Proceed button */}
        <div className="absolute bottom-4 right-4 z-20">
          {canProceed ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate('/design')}
              className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              Proceed to 3D Design
              <ArrowRight size={16} />
            </motion.button>
          ) : roomCount > 0 && !isScaleSet ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-sm">
              <AlertTriangle size={14} />
              Set scale to proceed
            </div>
          ) : null}
        </div>
      </div>

      {/* Scale calibration dialog */}
      {showScaleDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-2xl p-6 w-80 border border-white/10 shadow-2xl"
          >
            <h3 className="text-white font-semibold text-lg mb-2">Set Scale</h3>
            <p className="text-slate-400 text-sm mb-6">
              Enter a known wall length (in pixels on canvas) and its real-world measurement to calibrate the scale.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Wall length in pixels</label>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={scalePxInput}
                  onChange={e => setScalePxInput(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Real-world length (meters)</label>
                <input
                  type="number"
                  placeholder="e.g. 4.0"
                  value={scaleInput}
                  onChange={e => setScaleInput(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400">
                <p className="font-medium text-slate-300 mb-1">Quick presets (pixels per meter):</p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {[50, 100, 150, 200].map(px => (
                    <button
                      key={px}
                      onClick={() => setScale(px)}
                      className="px-2 py-1 rounded bg-slate-700 hover:bg-primary-600 text-white transition-colors"
                    >
                      {px} px/m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowScaleDialog(false)}
                className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyScale}
                className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Save name dialog (for new saves) */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-2xl p-6 w-80 border border-white/10 shadow-2xl"
          >
            <h3 className="text-white font-semibold text-lg mb-2">Save Plan</h3>
            <p className="text-slate-400 text-sm mb-4">
              Give your floor plan a name so you can find it later.
            </p>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Plan name</label>
              <input
                type="text"
                placeholder="e.g. My Dream Home"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveNew()}
                autoFocus
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNew}
                disabled={!saveName.trim() || saving}
                className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Unsaved changes dialog (navigation blocker) */}
      {blocker.state === 'blocked' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-2xl p-6 w-96 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <h3 className="text-white font-semibold text-lg">Unsaved Changes</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              You have unsaved changes to your floor plan. Would you like to save before leaving?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => blocker.reset?.()}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition-colors"
              >
                Stay
              </button>
              <button
                onClick={() => blocker.proceed?.()}
                className="flex-1 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
              >
                Don't Save
              </button>
              <button
                onClick={handleBlockerSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save & Leave'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
