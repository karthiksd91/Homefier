import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, Image, ArrowRight, Pencil, CheckCircle, Loader2, Wand2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { useFurnitureStore } from '@/store/useFurnitureStore'
import { detectFloorPlanFromImage } from '@/lib/imageProcessing/floorPlanDetector'
import { detectRooms } from '@/lib/geometry/roomDetector'

export default function UploadPage() {
  const navigate = useNavigate()
  const store = useFloorPlanStore()
  const { setSketchImage, floorPlan } = store

  const [processing, setProcessing] = useState(false)
  const [progressStage, setProgressStage] = useState('')
  const [progressPct, setProgressPct] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setSketchImage(url)
  }, [setSketchImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'] },
    maxFiles: 1,
    disabled: processing,
  })

  async function handleAutoDetect() {
    if (!floorPlan.sketchImageUrl) return
    setProcessing(true)
    try {
      const result = await detectFloorPlanFromImage(
        floorPlan.sketchImageUrl,
        floorPlan.canvasWidth,
        floorPlan.canvasHeight,
        (stage, pct) => {
          setProgressStage(stage)
          setProgressPct(pct)
        },
      )

      // Reset stores for fresh plan
      store.reset()
      useFurnitureStore.getState().clearAll()

      // Load detected nodes, walls, processed image, and estimated scale
      useFloorPlanStore.setState(state => ({
        floorPlan: {
          ...state.floorPlan,
          sketchImageUrl: result.processedImageUrl,
          scale: result.estimatedScale,
          nodes: result.nodes,
          walls: result.walls,
          rooms: {},
        },
        isDirty: true,
      }))

      // Run room detection on the new floor plan
      const updatedPlan = useFloorPlanStore.getState().floorPlan
      const rooms = detectRooms(updatedPlan)
      if (rooms.length > 0) {
        store.setRooms(rooms)
      }

      // Save initial history snapshot
      store.saveHistory()

      navigate('/floorplan')
    } catch (err) {
      console.error('Floor plan detection failed:', err)
      // Fall back to manual mode with sketch as background
      navigate('/floorplan')
    } finally {
      setProcessing(false)
    }
  }

  function handleManualTrace() {
    navigate('/floorplan')
  }

  function handleSkipUpload() {
    store.reset()
    useFurnitureStore.getState().clearAll()
    navigate('/floorplan')
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl font-bold text-white mb-3">Upload Your Floor Plan</h1>
            <p className="text-slate-400 text-lg">
              Upload a sketch, blueprint, or CAD export — we'll detect walls automatically
            </p>
          </motion.div>

          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200
              ${processing ? 'pointer-events-none' : ''}
              ${isDragActive
                ? 'border-primary-400 bg-primary-500/10'
                : floorPlan.sketchImageUrl
                  ? 'border-emerald-500/60 bg-emerald-500/5'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900'
              }
            `}
          >
            <input {...getInputProps()} />

            {floorPlan.sketchImageUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 font-semibold text-lg">Image uploaded!</p>
                  <p className="text-slate-400 text-sm mt-1">Drop a new file to replace it</p>
                </div>
                <div className="mt-2 rounded-xl overflow-hidden border border-white/10 max-h-48 max-w-sm mx-auto">
                  <img src={floorPlan.sketchImageUrl} alt="Uploaded sketch" className="w-full h-full object-contain" />
                </div>
              </div>
            ) : isDragActive ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center animate-bounce">
                  <Upload size={32} className="text-primary-400" />
                </div>
                <p className="text-primary-300 font-medium text-lg">Drop it here!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <Image size={32} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-lg">Drag & drop your floor plan</p>
                  <p className="text-slate-400 text-sm mt-1">or click to browse — PNG, JPG, SVG, WebP supported</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {['Blueprint', 'Hand sketch', 'CAD export', 'Napkin drawing'].map(label => (
                    <span key={label} className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons after upload */}
          {floorPlan.sketchImageUrl && !processing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-3"
            >
              {/* Auto-detect button */}
              <button
                onClick={handleAutoDetect}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-900/40"
              >
                <Wand2 size={18} />
                Auto-Detect Walls & Rooms
              </button>

              {/* Manual trace button */}
              <button
                onClick={handleManualTrace}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 glass hover:bg-white/10 text-slate-300 hover:text-white font-medium rounded-xl transition-all"
              >
                <Pencil size={18} />
                Trace Manually Over Image
              </button>
            </motion.div>
          )}

          {/* Processing state */}
          {processing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 glass rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <Loader2 size={20} className="text-primary-400 animate-spin" />
                <span className="text-white font-medium">{progressStage}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-slate-500 text-xs mt-3">
                Analyzing image structure, detecting walls and room boundaries...
              </p>
            </motion.div>
          )}

          {/* Divider */}
          {!processing && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-slate-500 text-sm">or</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Skip upload option */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={handleSkipUpload}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 glass hover:bg-white/10 text-slate-300 hover:text-white font-medium rounded-xl transition-all"
              >
                <Pencil size={18} />
                Start drawing from scratch (no image)
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
