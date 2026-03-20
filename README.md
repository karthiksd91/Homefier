# Homefier — Interactive 3D Home Design

> Transform hand-drawn floor plan sketches into immersive 3D home designs. Furnish every room, pick materials, and walk through your future home — all before breaking ground.

---

## Features

### 1. 2D Floor Plan Editor
- Upload a hand-drawn sketch, blueprint, or CAD export as a background reference
- Click-to-draw walls with **grid snapping** and **vertex snapping**
- **Auto room detection** — close a polygon and the room is instantly detected and labelled
- Add **doors** and **windows** to wall segments
- Wall dimension annotations with real-world measurements
- **Scale calibration** tool (set pixels-per-meter from a known reference length)
- Undo / redo history (Ctrl+Z / Ctrl+Shift+Z)
- Keyboard shortcuts: `W` draw · `S` select · `D` door · `X` window · `E` erase · `Esc` cancel

### 2. 3D Interior Design
- Floor plan **automatically extruded to 3D** (walls, floors, ceilings)
- Orbit camera — drag to rotate, scroll to zoom, right-drag to pan
- **34-item furniture catalog** across 8 categories (seating, beds, tables, storage, lighting, appliances, bathroom, decor)
- Click a catalog item → click the scene floor to place it with 0.25 m snapping
- **Furniture inspector**: adjust X/Z position, rotation (0–360°), and scale
- **Material picker** per room: 8 floor, 8 wall, and 4 ceiling presets (hardwood, tile, marble, painted plaster, brick, carpet, and more)

### 3. Virtual Walkthrough
- First-person Pointer Lock camera
- **WASD / Arrow keys** to move, **mouse** to look around
- Wall collision detection (AABB) — you can't walk through walls
- HUD with crosshair and vignette
- Press `Esc` to exit walkthrough at any time

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript + Vite 8 |
| 3D Engine | Three.js via `@react-three/fiber` + `@react-three/drei` |
| 2D Canvas | Konva.js via `react-konva` |
| State | Zustand + Immer |
| Routing | React Router v7 |
| Animations | Framer Motion |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
├── routes/              # Page-level route components
│   ├── LandingPage.tsx
│   ├── UploadPage.tsx
│   ├── FloorPlanEditorPage.tsx
│   ├── DesignPage.tsx
│   └── WalkthroughPage.tsx
│
├── components/
│   ├── layout/          # Navbar, shell
│   ├── floorplan/       # 2D Konva editor (canvas, tools, panels)
│   ├── scene3d/         # Three.js components (walls, floors, furniture, cameras)
│   ├── design/          # Interior design sidebar (catalog, material picker, inspector)
│   └── walkthrough/     # FPS HUD and pointer-lock prompt
│
├── store/               # Zustand state (floor plan, furniture, UI)
├── lib/
│   ├── geometry/        # Wall extrusion, room detection, collision
│   └── catalog/         # Furniture and material presets
└── types/               # Shared TypeScript interfaces
```

---

## Workflow

```
Upload sketch → Trace floor plan → Detect rooms → Calibrate scale
      ↓
3D model auto-generated → Furnish rooms → Apply materials
      ↓
Virtual walkthrough (first-person)
```

---

## Key Algorithms

**2D → 3D Wall Extrusion**
Each wall segment becomes a `BoxGeometry` with its length, height, and thickness. Canvas Y maps to `−worldZ` (negated) to preserve correct orientation. Room polygons become `ShapeGeometry` meshes for floors and ceilings.

**Room Detection**
Walls form a planar graph. The smallest-left-turn (clockwise turn) traversal finds all minimal face cycles, which are the rooms. The largest-area face (the outer boundary) is discarded.

**First-Person Camera**
Uses `THREE.Euler` with order `'YXZ'` (yaw first, then pitch) to avoid gimbal lock. Per-frame WASD movement is applied in world XZ space after stripping the pitch component. AABB collision pushes the player out of wall volumes.
