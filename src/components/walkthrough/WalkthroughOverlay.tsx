import { Keyboard } from 'lucide-react'

interface Props {
  roomName?: string
  onExit: () => void
}

export default function WalkthroughOverlay({ roomName, onExit }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <line x1="12" y1="4" x2="12" y2="20" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <line x1="4" y1="12" x2="20" y2="12" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.9)" />
        </svg>
      </div>

      {/* Room name (bottom center) */}
      {roomName && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 glass-dark rounded-full text-sm text-slate-300 border border-white/10">
          {roomName}
        </div>
      )}

      {/* Controls legend (bottom left) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-slate-500 glass-dark px-3 py-2 rounded-xl border border-white/10">
        <Keyboard size={12} />
        <span>WASD move · Mouse look</span>
      </div>

      {/* Exit button (top right) - needs pointer-events */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <button
          onClick={onExit}
          className="px-3 py-1.5 glass-dark rounded-lg text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
        >
          Esc — Exit
        </button>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  )
}
