import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderOpen, Trash2, Clock, Grid3X3, Plus, ArrowRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { useSavedPlansStore, type SavedPlan } from '@/store/useSavedPlansStore'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { useFurnitureStore } from '@/store/useFurnitureStore'
import { useState } from 'react'

export default function SavedPlansPage() {
  const navigate = useNavigate()
  const { plans, deletePlan } = useSavedPlansStore()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  function handleLoad(plan: SavedPlan) {
    useFloorPlanStore.setState({
      floorPlan: JSON.parse(JSON.stringify(plan.floorPlan)),
      isDirty: false,
      currentSaveId: plan.id,
      history: [],
      historyIndex: -1,
    })
    useFurnitureStore.setState({
      items: JSON.parse(JSON.stringify(plan.furnitureItems)),
    })
    navigate('/floorplan')
  }

  function handleNewPlan() {
    useFloorPlanStore.getState().reset()
    useFurnitureStore.getState().clearAll()
    navigate('/floorplan')
  }

  function handleDelete(id: string) {
    deletePlan(id)
    setDeleteConfirm(null)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <Navbar />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Saved Plans</h1>
              <p className="text-slate-400 text-sm mt-1">
                Continue working on your saved floor plans
              </p>
            </div>
            <button
              onClick={handleNewPlan}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus size={16} />
              New Plan
            </button>
          </div>

          {/* Empty state */}
          {plans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <FolderOpen size={48} className="mx-auto text-slate-600 mb-4" />
              <h2 className="text-lg font-medium text-slate-400 mb-2">
                No saved plans yet
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Start designing and save your progress anytime
              </p>
              <button
                onClick={handleNewPlan}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Start Designing
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ) : (
            /* Plans grid */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, i) => {
                const wallCount = Object.keys(plan.floorPlan.walls).length
                const roomCount = Object.keys(plan.floorPlan.rooms).length
                const furnitureCount = Object.keys(plan.furnitureItems).length

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-dark rounded-xl border border-white/10 hover:border-primary-500/30 transition-all group"
                  >
                    <button
                      onClick={() => handleLoad(plan)}
                      className="w-full text-left p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                          <Grid3X3 size={18} className="text-primary-400" />
                        </div>
                      </div>

                      <h3 className="text-white font-medium text-sm mb-1 group-hover:text-primary-300 transition-colors">
                        {plan.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                        <Clock size={11} />
                        {formatDate(plan.savedAt)}
                      </div>

                      <div className="flex gap-3 text-xs text-slate-400">
                        <span>{wallCount} walls</span>
                        <span>{roomCount} rooms</span>
                        {furnitureCount > 0 && (
                          <span>{furnitureCount} items</span>
                        )}
                      </div>
                    </button>

                    <div className="border-t border-white/5 px-4 py-2 flex justify-end">
                      {deleteConfirm === plan.id ? (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">Delete?</span>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-slate-400 hover:text-white transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(plan.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
