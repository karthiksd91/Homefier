import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, Image, ArrowRight, Pencil, CheckCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'

export default function UploadPage() {
  const navigate = useNavigate()
  const { setSketchImage, floorPlan } = useFloorPlanStore()

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
  })

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
              Upload a sketch, blueprint, or hand-drawn floor plan to trace over it
            </p>
          </motion.div>

          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200
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

          {/* Divider */}
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
            onClick={() => navigate('/floorplan')}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 glass hover:bg-white/10 text-slate-300 hover:text-white font-medium rounded-xl transition-all"
          >
            <Pencil size={18} />
            Start drawing from scratch (no image)
          </motion.button>

          {/* Continue button */}
          {floorPlan.sketchImageUrl && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => navigate('/floorplan')}
              className="w-full mt-4 flex items-center justify-center gap-3 px-6 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-900/40"
            >
              Continue to Floor Plan Editor
              <ArrowRight size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
