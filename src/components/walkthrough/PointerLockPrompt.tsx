import { motion } from 'framer-motion'
import { MousePointer2, Keyboard } from 'lucide-react'

interface Props {
  onStart: () => void
}

export default function PointerLockPrompt({ onStart }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-30"
      onClick={onStart}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center max-w-sm px-8"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
          <MousePointer2 size={36} className="text-emerald-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">Virtual Walkthrough</h2>
        <p className="text-slate-400 text-sm mb-8">
          Click anywhere to lock your cursor and start exploring your home in first-person.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/40 transition-all"
        >
          Start Walking
        </motion.button>

        <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-slate-500">
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5">
            <Keyboard size={16} className="text-slate-400" />
            <span>WASD / Arrow keys</span>
            <span className="text-slate-600">Move</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5">
            <MousePointer2 size={16} className="text-slate-400" />
            <span>Mouse</span>
            <span className="text-slate-600">Look around</span>
          </div>
        </div>

        <p className="text-slate-600 text-xs mt-4">Press Esc to exit walkthrough mode</p>
      </motion.div>
    </motion.div>
  )
}
