import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Layers, Palette, Eye, ChevronRight } from 'lucide-react'

const FEATURES = [
  {
    icon: Layers,
    title: '2D to 3D Conversion',
    description: 'Upload your hand-drawn sketch or floor plan. Trace walls over it and watch it automatically transform into a full 3D model.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Palette,
    title: 'Interior Design Studio',
    description: 'Furnish each room from a rich catalog. Choose materials, colors, and textures for floors, walls, and ceilings.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: Eye,
    title: 'Virtual Walkthrough',
    description: 'Experience your home in first-person before it\'s built. Walk through every room with realistic lighting and materials.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-y-auto scrollbar-thin">
      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden min-h-screen">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            AI-Powered Home Design Platform
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Design Your Dream
            <span className="block bg-gradient-to-r from-primary-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Home in 3D
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your hand-drawn sketches into immersive 3D home designs.
            Furnish rooms, pick materials, and walk through your future home — all before breaking ground.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={() => navigate('/upload')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl shadow-lg shadow-primary-900/50 transition-all"
            >
              Start Designing
              <ArrowRight size={18} />
            </motion.button>

            <motion.button
              onClick={() => navigate('/floorplan')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-8 py-4 glass text-slate-300 hover:text-white font-medium rounded-xl transition-all"
            >
              Open Editor
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </motion.div>

        {/* 3D House Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 mt-20 w-full max-w-3xl mx-auto"
        >
          <div className="aspect-video glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
            <HouseSVGPreview />
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="px-6 py-20 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Everything you need</h2>
          <p className="text-slate-400 text-lg">A complete home design pipeline from sketch to walkthrough</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl ${f.bg} border ${f.border} hover:border-opacity-50 transition-all group`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* CTA bottom */}
      <div className="px-6 py-16 text-center border-t border-white/5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to build your dream home?</h2>
          <p className="text-slate-400 mb-8">Upload your sketch and start designing in minutes.</p>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-colors"
          >
            Get Started Free <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  )
}

function HouseSVGPreview() {
  return (
    <svg viewBox="0 0 600 340" className="w-full h-full opacity-80">
      <defs>
        <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* Floor */}
      <ellipse cx="300" cy="280" rx="260" ry="40" fill="#0ea5e9" fillOpacity="0.1" />

      {/* Back walls */}
      <polygon points="100,240 300,160 500,240 500,300 100,300" fill="url(#floorGrad)" />

      {/* Left wall */}
      <polygon points="100,240 300,160 300,200 100,280" fill="#334155" />
      <polygon points="100,240 300,160 300,200 100,280" fill="#0ea5e9" fillOpacity="0.05" />

      {/* Right wall */}
      <polygon points="300,160 500,240 500,280 300,200" fill="#1e293b" />

      {/* Roof outline */}
      <polygon points="80,240 300,130 520,240" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeOpacity="0.6" />

      {/* Windows */}
      <rect x="140" y="210" width="50" height="40" rx="2" fill="#0ea5e9" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="1" />
      <line x1="165" y1="210" x2="165" y2="250" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="140" y1="230" x2="190" y2="230" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.5" />

      <rect x="410" y="210" width="50" height="40" rx="2" fill="#0ea5e9" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="1" />
      <line x1="435" y1="210" x2="435" y2="250" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="410" y1="230" x2="460" y2="230" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.5" />

      {/* Door */}
      <rect x="265" y="250" width="40" height="50" rx="2" fill="#0ea5e9" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="1" />
      <circle cx="300" cy="278" r="3" fill="#38bdf8" />

      {/* Grid lines (floor plan feel) */}
      {[160, 200, 240, 280, 320, 360, 400, 440].map(x => (
        <line key={x} x1={x} y1="135" x2={x} y2="300" stroke="#0ea5e9" strokeWidth="0.3" strokeOpacity="0.2" />
      ))}
      {[160, 200, 240].map(y => (
        <line key={y} x1="80" y1={y} x2="520" y2={y} stroke="#0ea5e9" strokeWidth="0.3" strokeOpacity="0.2" />
      ))}

      {/* Labels */}
      <text x="170" y="290" fill="#94a3b8" fontSize="10" textAnchor="middle">Living Room</text>
      <text x="430" y="290" fill="#94a3b8" fontSize="10" textAnchor="middle">Bedroom</text>
    </svg>
  )
}
