import type { FurnitureCatalogItem } from '@/types'

interface FurMeshProps {
  item: FurnitureCatalogItem
  ghost?: boolean
  selected?: boolean
}

interface MatProps {
  color: string
  ghost?: boolean
  selected?: boolean
  roughness?: number
  metalness?: number
}

function Mat({ color, ghost, selected, roughness = 0.7, metalness = 0.1 }: MatProps) {
  return (
    <meshStandardMaterial
      color={selected ? '#0ea5e9' : ghost ? '#22c55e' : color}
      roughness={roughness}
      metalness={metalness}
      transparent={ghost}
      opacity={ghost ? 0.45 : 1}
      emissive={selected ? '#0369a1' : '#000000'}
      emissiveIntensity={selected ? 0.3 : 0}
      wireframe={ghost}
      depthWrite={!ghost}
    />
  )
}

type ShapeProps = { w: number; d: number; h: number; color: string; ghost?: boolean; selected?: boolean }

// ---------- Sofa ----------
function SofaShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const legH = 0.09
  const seatH = h * 0.44
  const backH = h - seatH - legH
  const armW = Math.min(0.14, w * 0.08)
  const backD = Math.min(0.2, d * 0.24)
  const legPositions: [number, number][] = [
    [-w / 2 + 0.1, -d / 2 + 0.1],
    [w / 2 - 0.1, -d / 2 + 0.1],
    [-w / 2 + 0.1, d / 2 - 0.1],
    [w / 2 - 0.1, d / 2 - 0.1],
  ]
  return (
    <group>
      {legPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, legH / 2, z]}>
          <boxGeometry args={[0.07, legH, 0.07]} />
          <Mat color="#4A3728" ghost={ghost} selected={selected} roughness={0.9} metalness={0} />
        </mesh>
      ))}
      {/* Seat */}
      <mesh position={[0, legH + seatH / 2, 0]}>
        <boxGeometry args={[w, seatH, d]} />
        <Mat color={color} ghost={ghost} selected={selected} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, legH + seatH + backH / 2, -(d / 2 - backD / 2)]}>
        <boxGeometry args={[w, backH, backD]} />
        <Mat color={color} ghost={ghost} selected={selected} />
      </mesh>
      {/* Left armrest */}
      <mesh position={[-w / 2 + armW / 2, legH + seatH + (backH * 0.55) / 2, 0]}>
        <boxGeometry args={[armW, backH * 0.55, d]} />
        <Mat color={color} ghost={ghost} selected={selected} />
      </mesh>
      {/* Right armrest */}
      <mesh position={[w / 2 - armW / 2, legH + seatH + (backH * 0.55) / 2, 0]}>
        <boxGeometry args={[armW, backH * 0.55, d]} />
        <Mat color={color} ghost={ghost} selected={selected} />
      </mesh>
    </group>
  )
}

// ---------- Dining / Armchair ----------
function ChairShape({ w, d, h, color, ghost, selected, hasArmrests = false }: ShapeProps & { hasArmrests?: boolean }) {
  const legH = h * 0.46
  const seatH = 0.05
  const backH = h - legH - seatH
  const lt = 0.04 // leg thickness
  const legColor = '#4A3728'
  const legPositions: [number, number][] = [
    [-w / 2 + lt / 2, -d / 2 + lt / 2],
    [w / 2 - lt / 2, -d / 2 + lt / 2],
    [-w / 2 + lt / 2, d / 2 - lt / 2],
    [w / 2 - lt / 2, d / 2 - lt / 2],
  ]
  return (
    <group>
      {legPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, legH / 2, z]}>
          <boxGeometry args={[lt, legH, lt]} />
          <Mat color={legColor} ghost={ghost} selected={selected} roughness={0.9} metalness={0} />
        </mesh>
      ))}
      {/* Seat */}
      <mesh position={[0, legH + seatH / 2, 0]}>
        <boxGeometry args={[w, seatH, d]} />
        <Mat color={color} ghost={ghost} selected={selected} />
      </mesh>
      {/* Backrest panel */}
      <mesh position={[0, legH + seatH + backH / 2, -(d / 2 - 0.03)]}>
        <boxGeometry args={[w * 0.85, backH, 0.04]} />
        <Mat color={color} ghost={ghost} selected={selected} />
      </mesh>
      {hasArmrests && (
        <>
          <mesh position={[-w / 2 + 0.05, legH + seatH + backH * 0.3, 0]}>
            <boxGeometry args={[0.06, backH * 0.6, d * 0.9]} />
            <Mat color={color} ghost={ghost} selected={selected} />
          </mesh>
          <mesh position={[w / 2 - 0.05, legH + seatH + backH * 0.3, 0]}>
            <boxGeometry args={[0.06, backH * 0.6, d * 0.9]} />
            <Mat color={color} ghost={ghost} selected={selected} />
          </mesh>
        </>
      )}
    </group>
  )
}

// ---------- Office Chair ----------
function OfficeChairShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const seatY = h * 0.42
  const seatH = h * 0.08
  const backH = h * 0.42
  const poleH = seatY
  const armLength = Math.max(w, d) * 0.52
  const angles = [0, 72, 144, 216, 288]
  return (
    <group>
      {/* Central pole */}
      <mesh position={[0, poleH / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.035, poleH, 8]} />
        <Mat color="#888888" ghost={ghost} selected={selected} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* 5 radiating arms + wheels */}
      {angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <group key={i}>
            <mesh
              position={[Math.sin(rad) * armLength / 2, 0.03, Math.cos(rad) * armLength / 2]}
              rotation={[0, -rad, 0]}
            >
              <boxGeometry args={[armLength, 0.03, 0.04]} />
              <Mat color="#333333" ghost={ghost} selected={selected} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[Math.sin(rad) * armLength, 0.05, Math.cos(rad) * armLength]}>
              <sphereGeometry args={[0.04, 8, 6]} />
              <Mat color="#222222" ghost={ghost} selected={selected} roughness={0.8} metalness={0} />
            </mesh>
          </group>
        )
      })}
      {/* Seat cushion */}
      <mesh position={[0, seatY + seatH / 2, 0]}>
        <boxGeometry args={[w, seatH, d]} />
        <Mat color={color} ghost={ghost} selected={selected} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, seatY + seatH + backH / 2, -(d / 2 - 0.06)]}>
        <boxGeometry args={[w * 0.88, backH, 0.08]} />
        <Mat color={color} ghost={ghost} selected={selected} />
      </mesh>
      {/* Armrests */}
      {[-1, 1].map(side => (
        <mesh key={side} position={[side * (w / 2 + 0.02), seatY + seatH + 0.06, 0]}>
          <boxGeometry args={[0.05, 0.04, d * 0.5]} />
          <Mat color="#444444" ghost={ghost} selected={selected} roughness={0.5} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- Bar Stool ----------
function BarStoolShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const seatH = 0.05
  const seatY = h - seatH
  return (
    <group>
      {/* Base disk */}
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[w * 0.42, w * 0.48, 0.03, 14]} />
        <Mat color="#888888" ghost={ghost} selected={selected} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.03 + seatY / 2, 0]}>
        <cylinderGeometry args={[0.022, 0.022, seatY, 8]} />
        <Mat color="#888888" ghost={ghost} selected={selected} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Round seat */}
      <mesh position={[0, seatY + seatH / 2, 0]}>
        <cylinderGeometry args={[w * 0.46, w * 0.46, seatH, 14]} />
        <Mat color={color} ghost={ghost} selected={selected} />
      </mesh>
    </group>
  )
}

// ---------- Generic Table (coffee / dining / side) ----------
function TableShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const topH = Math.min(0.05, h * 0.07)
  const legH = h - topH
  const lt = Math.min(0.06, Math.max(0.03, w * 0.04))
  const legPositions: [number, number][] = [
    [-w / 2 + lt / 2, -d / 2 + lt / 2],
    [w / 2 - lt / 2, -d / 2 + lt / 2],
    [-w / 2 + lt / 2, d / 2 - lt / 2],
    [w / 2 - lt / 2, d / 2 - lt / 2],
  ]
  return (
    <group>
      {legPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, legH / 2, z]}>
          <boxGeometry args={[lt, legH, lt]} />
          <Mat color={color} ghost={ghost} selected={selected} roughness={0.8} />
        </mesh>
      ))}
      {/* Tabletop */}
      <mesh position={[0, legH + topH / 2, 0]}>
        <boxGeometry args={[w, topH, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ---------- Work Desk ----------
function DeskShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const topH = 0.04
  const legH = h - topH
  const lt = 0.04
  const legPositions: [number, number][] = [
    [-w / 2 + lt / 2, -d / 2 + lt / 2],
    [w / 2 - lt / 2, -d / 2 + lt / 2],
    [-w / 2 + lt / 2, d / 2 - lt / 2],
    [w / 2 - lt / 2, d / 2 - lt / 2],
  ]
  return (
    <group>
      {legPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, legH / 2, z]}>
          <boxGeometry args={[lt, legH, lt]} />
          <Mat color={color} ghost={ghost} selected={selected} roughness={0.8} />
        </mesh>
      ))}
      {/* Desktop surface */}
      <mesh position={[0, legH + topH / 2, 0]}>
        <boxGeometry args={[w, topH, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Right-side drawer unit */}
      <mesh position={[w / 2 - 0.15, legH * 0.38, 0]}>
        <boxGeometry args={[0.28, legH * 0.76, d * 0.7]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.5} />
      </mesh>
      {/* Drawer handles on unit */}
      {[0.25, 0.5, 0.75].map((t, i) => (
        <mesh key={i} position={[w / 2 - 0.15, legH * t * 0.76, d * 0.35 + 0.01]}>
          <boxGeometry args={[0.06, 0.012, 0.012]} />
          <Mat color="#AAAAAA" ghost={ghost} selected={selected} roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- Kitchen Island / Cabinet ----------
function KitchenIslandShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const counterH = 0.04
  return (
    <group>
      <mesh position={[0, (h - counterH) / 2, 0]}>
        <boxGeometry args={[w, h - counterH, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.5} />
      </mesh>
      {/* Countertop */}
      <mesh position={[0, h - counterH / 2, 0]}>
        <boxGeometry args={[w + 0.02, counterH, d + 0.02]} />
        <Mat color="#DEDEDC" ghost={ghost} selected={selected} roughness={0.25} metalness={0.1} />
      </mesh>
      {/* Door panel hint */}
      <mesh position={[0, (h - counterH) / 2, d / 2 + 0.005]}>
        <boxGeometry args={[w * 0.88, (h - counterH) * 0.82, 0.008]} />
        <Mat color="#EEEEEE" ghost={ghost} selected={selected} roughness={0.4} />
      </mesh>
    </group>
  )
}

// ---------- Beds ----------
function BedShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const legH = 0.08
  const frameH = Math.min(0.15, h * 0.35)
  const mattressH = h - legH - frameH
  const headH = 0.55
  const footH = 0.22
  const legPositions: [number, number][] = [
    [-w / 2 + 0.08, -d / 2 + 0.08],
    [w / 2 - 0.08, -d / 2 + 0.08],
    [-w / 2 + 0.08, d / 2 - 0.08],
    [w / 2 - 0.08, d / 2 - 0.08],
  ]
  return (
    <group>
      {legPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, legH / 2, z]}>
          <boxGeometry args={[0.07, legH, 0.07]} />
          <Mat color="#4A3728" ghost={ghost} selected={selected} roughness={0.9} metalness={0} />
        </mesh>
      ))}
      {/* Bed frame */}
      <mesh position={[0, legH + frameH / 2, 0]}>
        <boxGeometry args={[w, frameH, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.8} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, legH + frameH + mattressH / 2, 0]}>
        <boxGeometry args={[w * 0.96, mattressH, d * 0.94]} />
        <Mat color="#F0EDE8" ghost={ghost} selected={selected} roughness={0.9} metalness={0} />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, legH + frameH + mattressH + 0.04, -d / 2 + 0.28]}>
        <boxGeometry args={[w * 0.68, 0.09, 0.24]} />
        <Mat color="#FFFFFF" ghost={ghost} selected={selected} roughness={1} metalness={0} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, legH + headH / 2, -d / 2 - 0.05]}>
        <boxGeometry args={[w, headH, 0.08]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.7} />
      </mesh>
      {/* Footboard */}
      <mesh position={[0, legH + footH / 2, d / 2 + 0.04]}>
        <boxGeometry args={[w, footH, 0.06]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.7} />
      </mesh>
    </group>
  )
}

// ---------- Bunk Bed ----------
function BunkBedShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const pt = 0.08 // post thickness
  const mattH = 0.12
  const frameH = 0.08
  const lowerBedY = h * 0.38
  const upperBedY = h * 0.78
  const postPositions: [number, number][] = [
    [-w / 2 + pt / 2, -d / 2 + pt / 2],
    [w / 2 - pt / 2, -d / 2 + pt / 2],
    [-w / 2 + pt / 2, d / 2 - pt / 2],
    [w / 2 - pt / 2, d / 2 - pt / 2],
  ]
  return (
    <group>
      {/* 4 full-height corner posts */}
      {postPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2, z]}>
          <boxGeometry args={[pt, h, pt]} />
          <Mat color={color} ghost={ghost} selected={selected} roughness={0.8} />
        </mesh>
      ))}
      {/* Lower frame */}
      <mesh position={[0, lowerBedY - frameH / 2, 0]}>
        <boxGeometry args={[w - pt * 2, frameH, d - pt * 2]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.8} />
      </mesh>
      {/* Lower mattress */}
      <mesh position={[0, lowerBedY + mattH / 2, 0]}>
        <boxGeometry args={[(w - pt * 2) * 0.95, mattH, (d - pt * 2) * 0.95]} />
        <Mat color="#F0EDE8" ghost={ghost} selected={selected} roughness={0.9} metalness={0} />
      </mesh>
      {/* Upper frame */}
      <mesh position={[0, upperBedY - frameH / 2, 0]}>
        <boxGeometry args={[w - pt * 2, frameH, d - pt * 2]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.8} />
      </mesh>
      {/* Upper mattress */}
      <mesh position={[0, upperBedY + mattH / 2, 0]}>
        <boxGeometry args={[(w - pt * 2) * 0.95, mattH, (d - pt * 2) * 0.95]} />
        <Mat color="#F0EDE8" ghost={ghost} selected={selected} roughness={0.9} metalness={0} />
      </mesh>
      {/* Ladder rungs */}
      {[0.3, 0.52, 0.74].map((t, i) => (
        <mesh key={i} position={[w / 2 - pt / 2, h * t, d / 2 - 0.04]}>
          <boxGeometry args={[pt, 0.025, 0.25]} />
          <Mat color={color} ghost={ghost} selected={selected} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- Wardrobe ----------
function WardrobeShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.5} />
      </mesh>
      {/* Door center divider */}
      <mesh position={[0, h / 2, d / 2 + 0.004]}>
        <boxGeometry args={[0.012, h * 0.94, 0.008]} />
        <Mat color="#888888" ghost={ghost} selected={selected} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Left door panel */}
      <mesh position={[-w / 4, h / 2, d / 2 + 0.003]}>
        <boxGeometry args={[w / 2 - 0.02, h * 0.92, 0.006]} />
        <Mat color="#F0F0F0" ghost={ghost} selected={selected} roughness={0.4} metalness={0} />
      </mesh>
      {/* Right door panel */}
      <mesh position={[w / 4, h / 2, d / 2 + 0.003]}>
        <boxGeometry args={[w / 2 - 0.02, h * 0.92, 0.006]} />
        <Mat color="#F0F0F0" ghost={ghost} selected={selected} roughness={0.4} metalness={0} />
      </mesh>
      {/* Left handle */}
      <mesh position={[-0.1, h * 0.5, d / 2 + 0.02]}>
        <boxGeometry args={[0.012, 0.12, 0.022]} />
        <Mat color="#AAAAAA" ghost={ghost} selected={selected} roughness={0.2} metalness={0.7} />
      </mesh>
      {/* Right handle */}
      <mesh position={[0.1, h * 0.5, d / 2 + 0.02]}>
        <boxGeometry args={[0.012, 0.12, 0.022]} />
        <Mat color="#AAAAAA" ghost={ghost} selected={selected} roughness={0.2} metalness={0.7} />
      </mesh>
    </group>
  )
}

// ---------- Bookshelf ----------
function BookshelfShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const shelfCount = Math.max(3, Math.round(h / 0.36))
  const sideThick = 0.03
  const shelfThick = 0.025
  const shelfPositions = Array.from({ length: shelfCount + 1 }, (_, i) => (i / shelfCount) * h)
  return (
    <group>
      {/* Back panel */}
      <mesh position={[0, h / 2, -(d / 2 - 0.015)]}>
        <boxGeometry args={[w, h, 0.015]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.7} />
      </mesh>
      {/* Left side */}
      <mesh position={[-w / 2 + sideThick / 2, h / 2, 0]}>
        <boxGeometry args={[sideThick, h, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.7} />
      </mesh>
      {/* Right side */}
      <mesh position={[w / 2 - sideThick / 2, h / 2, 0]}>
        <boxGeometry args={[sideThick, h, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.7} />
      </mesh>
      {/* Shelves */}
      {shelfPositions.map((y, i) => (
        <mesh key={i} position={[0, y + shelfThick / 2, 0]}>
          <boxGeometry args={[w - sideThick * 2, shelfThick, d]} />
          <Mat color={color} ghost={ghost} selected={selected} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- TV Unit ----------
function TvUnitShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const legH = 0.06
  const bodyH = h - legH
  return (
    <group>
      {/* Slim legs */}
      {[[-w / 2 + 0.1, -d / 2 + 0.06], [w / 2 - 0.1, -d / 2 + 0.06], [-w / 2 + 0.1, d / 2 - 0.06], [w / 2 - 0.1, d / 2 - 0.06]].map(([x, z], i) => (
        <mesh key={i} position={[x, legH / 2, z]}>
          <boxGeometry args={[0.04, legH, 0.04]} />
          <Mat color="#333333" ghost={ghost} selected={selected} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {/* Body */}
      <mesh position={[0, legH + bodyH / 2, 0]}>
        <boxGeometry args={[w, bodyH, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.5} />
      </mesh>
      {/* Front dark panel */}
      <mesh position={[0, legH + bodyH / 2, d / 2 + 0.005]}>
        <boxGeometry args={[w * 0.9, bodyH * 0.85, 0.008]} />
        <Mat color="#1A1A1A" ghost={ghost} selected={selected} roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  )
}

// ---------- Dresser ----------
function DresserShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const numDrawers = 4
  const drawerH = (h * 0.85) / numDrawers
  return (
    <group>
      {/* Body */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.5} />
      </mesh>
      {/* Drawer faces */}
      {Array.from({ length: numDrawers }).map((_, i) => (
        <mesh key={i} position={[0, h * 0.08 + drawerH * (i + 0.5), d / 2 + 0.003]}>
          <boxGeometry args={[w * 0.86, drawerH * 0.84, 0.006]} />
          <Mat color="#F0F0F0" ghost={ghost} selected={selected} roughness={0.4} metalness={0} />
        </mesh>
      ))}
      {/* Drawer handles */}
      {Array.from({ length: numDrawers }).map((_, i) => (
        <mesh key={i} position={[0, h * 0.08 + drawerH * (i + 0.5), d / 2 + 0.014]}>
          <boxGeometry args={[0.08, 0.013, 0.013]} />
          <Mat color="#AAAAAA" ghost={ghost} selected={selected} roughness={0.25} metalness={0.65} />
        </mesh>
      ))}
    </group>
  )
}

// ---------- Floor Lamp ----------
function FloorLampShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const baseR = w * 0.58
  const poleR = 0.02
  const shadeR = w * 0.78
  const shadeH = h * 0.13
  const poleH = h - shadeH - 0.03
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[baseR, baseR * 1.1, 0.03, 16]} />
        <Mat color="#666666" ghost={ghost} selected={selected} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.03 + poleH / 2, 0]}>
        <cylinderGeometry args={[poleR, poleR, poleH, 8]} />
        <Mat color="#888888" ghost={ghost} selected={selected} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Shade (wide-bottom cone) */}
      <mesh position={[0, 0.03 + poleH + shadeH / 2, 0]}>
        <cylinderGeometry args={[shadeR, shadeR * 0.38, shadeH, 16]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.8} metalness={0} />
      </mesh>
    </group>
  )
}

// ---------- Table Lamp ----------
function TableLampShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const baseH = h * 0.24
  const poleH = h * 0.36
  const shadeH = h * 0.38
  const baseR = w * 0.44
  const shadeR = w * 0.52
  return (
    <group>
      {/* Base */}
      <mesh position={[0, baseH / 2, 0]}>
        <cylinderGeometry args={[baseR * 0.55, baseR, baseH, 12]} />
        <Mat color="#888888" ghost={ghost} selected={selected} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, baseH + poleH / 2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, poleH, 8]} />
        <Mat color="#999999" ghost={ghost} selected={selected} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Shade */}
      <mesh position={[0, baseH + poleH + shadeH / 2, 0]}>
        <cylinderGeometry args={[shadeR, shadeR * 0.32, shadeH, 16]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.8} metalness={0} />
      </mesh>
    </group>
  )
}

// ---------- Refrigerator ----------
function RefrigeratorShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.25} metalness={0.2} />
      </mesh>
      {/* Freezer / fridge dividing line */}
      <mesh position={[0, h * 0.35, d / 2 + 0.003]}>
        <boxGeometry args={[w * 0.9, 0.008, 0.006]} />
        <Mat color="#888888" ghost={ghost} selected={selected} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Freezer handle */}
      <mesh position={[w * 0.28, h * 0.75, d / 2 + 0.04]}>
        <boxGeometry args={[0.022, 0.18, 0.022]} />
        <Mat color="#CCCCCC" ghost={ghost} selected={selected} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Fridge handle */}
      <mesh position={[w * 0.28, h * 0.18, d / 2 + 0.04]}>
        <boxGeometry args={[0.022, 0.28, 0.022]} />
        <Mat color="#CCCCCC" ghost={ghost} selected={selected} roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  )
}

// ---------- Washing Machine / Dishwasher ----------
function WashingMachineShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Door ring */}
      <mesh position={[0, h * 0.45, d / 2 + 0.006]}>
        <cylinderGeometry args={[w * 0.32, w * 0.32, 0.012, 24]} />
        <Mat color="#333333" ghost={ghost} selected={selected} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Inner drum */}
      <mesh position={[0, h * 0.45, d / 2 + 0.014]}>
        <cylinderGeometry args={[w * 0.26, w * 0.26, 0.006, 24]} />
        <Mat color="#888888" ghost={ghost} selected={selected} roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Control panel */}
      <mesh position={[0, h * 0.87, d / 2 + 0.004]}>
        <boxGeometry args={[w * 0.78, h * 0.11, 0.008]} />
        <Mat color="#E8E8E8" ghost={ghost} selected={selected} roughness={0.4} metalness={0} />
      </mesh>
    </group>
  )
}

// ---------- TV (flat panel) ----------
function TvShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const standH = h * 0.12
  const screenH = h - standH
  return (
    <group>
      {/* Screen panel */}
      <mesh position={[0, standH + screenH / 2, 0]}>
        <boxGeometry args={[w, screenH, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.3} metalness={0.3} />
      </mesh>
      {/* Screen face */}
      <mesh position={[0, standH + screenH / 2, d / 2 + 0.002]}>
        <boxGeometry args={[w * 0.94, screenH * 0.92, 0.004]} />
        <Mat color="#060610" ghost={ghost} selected={selected} roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Stand neck */}
      <mesh position={[0, standH * 0.65, 0]}>
        <boxGeometry args={[0.06, standH * 0.65, d * 0.7]} />
        <Mat color="#222222" ghost={ghost} selected={selected} roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Stand base */}
      <mesh position={[0, standH * 0.1, 0]}>
        <boxGeometry args={[w * 0.26, standH * 0.2, d * 1.15]} />
        <Mat color="#222222" ghost={ghost} selected={selected} roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  )
}

// ---------- Bathtub ----------
function BathtubShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const wt = 0.06 // wall thickness
  return (
    <group>
      {/* Bottom */}
      <mesh position={[0, wt / 2, 0]}>
        <boxGeometry args={[w, wt, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.2} metalness={0} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, h / 2, d / 2 - wt / 2]}>
        <boxGeometry args={[w, h, wt]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.2} metalness={0} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, h / 2, -(d / 2 - wt / 2)]}>
        <boxGeometry args={[w, h, wt]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.2} metalness={0} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-(w / 2 - wt / 2), h / 2, 0]}>
        <boxGeometry args={[wt, h, d - wt * 2]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.2} metalness={0} />
      </mesh>
      {/* Right wall */}
      <mesh position={[w / 2 - wt / 2, h / 2, 0]}>
        <boxGeometry args={[wt, h, d - wt * 2]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.2} metalness={0} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, h + 0.015, 0]}>
        <boxGeometry args={[w, 0.03, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.15} metalness={0.05} />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, h + 0.09, -d / 2 + wt + 0.06]}>
        <cylinderGeometry args={[0.018, 0.018, 0.1, 8]} />
        <Mat color="#BBBBBB" ghost={ghost} selected={selected} roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  )
}

// ---------- Toilet ----------
function ToiletShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const tankH = h * 0.45
  const tankD = d * 0.28
  const bowlH = h * 0.52
  const bowlD = d * 0.68
  return (
    <group>
      {/* Tank */}
      <mesh position={[0, tankH / 2, -(d / 2 - tankD / 2)]}>
        <boxGeometry args={[w * 0.78, tankH, tankD]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.2} metalness={0} />
      </mesh>
      {/* Tank lid */}
      <mesh position={[0, tankH + 0.015, -(d / 2 - tankD / 2)]}>
        <boxGeometry args={[w * 0.8, 0.03, tankD + 0.02]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.2} metalness={0} />
      </mesh>
      {/* Bowl base */}
      <mesh position={[0, bowlH * 0.38, d / 2 - bowlD / 2]}>
        <boxGeometry args={[w, bowlH * 0.76, bowlD]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.2} metalness={0} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, bowlH * 0.78, d / 2 - bowlD / 2]}>
        <boxGeometry args={[w * 0.85, 0.03, bowlD * 0.82]} />
        <Mat color="#F0F0F0" ghost={ghost} selected={selected} roughness={0.3} metalness={0} />
      </mesh>
    </group>
  )
}

// ---------- Sink Vanity ----------
function SinkVanityShape({ w, d, h, color, ghost, selected }: ShapeProps) {
  const basinH = h * 0.14
  const cabinetH = h - basinH
  return (
    <group>
      {/* Cabinet */}
      <mesh position={[0, cabinetH / 2, 0]}>
        <boxGeometry args={[w, cabinetH, d]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.5} metalness={0} />
      </mesh>
      {/* Countertop */}
      <mesh position={[0, cabinetH + 0.015, 0]}>
        <boxGeometry args={[w + 0.02, 0.03, d + 0.02]} />
        <Mat color="#D0D0CE" ghost={ghost} selected={selected} roughness={0.25} metalness={0.1} />
      </mesh>
      {/* Basin */}
      <mesh position={[0, cabinetH + 0.03 + basinH / 2, 0]}>
        <boxGeometry args={[w * 0.68, basinH, d * 0.65]} />
        <Mat color="#F8F8F8" ghost={ghost} selected={selected} roughness={0.2} metalness={0.05} />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, cabinetH + 0.03 + basinH + 0.07, -d * 0.12]}>
        <cylinderGeometry args={[0.014, 0.014, 0.1, 8]} />
        <Mat color="#BBBBBB" ghost={ghost} selected={selected} roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  )
}

// ---------- Plant ----------
function PlantShape({ w, d, h, color, ghost, selected, large = false }: ShapeProps & { large?: boolean }) {
  const potH = h * 0.26
  const potR = w * 0.44
  const stemH = large ? h * 0.28 : 0
  const foliageR = large ? w * 0.52 : w * 0.48
  const foliageY = potH + stemH + foliageR * 0.8
  return (
    <group>
      {/* Pot */}
      <mesh position={[0, potH / 2, 0]}>
        <cylinderGeometry args={[potR * 0.92, potR * 0.72, potH, 12]} />
        <Mat color="#A0522D" ghost={ghost} selected={selected} roughness={0.9} metalness={0} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, potH, 0]}>
        <cylinderGeometry args={[potR * 0.88, potR * 0.88, 0.02, 12]} />
        <Mat color="#4A3728" ghost={ghost} selected={selected} roughness={1} metalness={0} />
      </mesh>
      {/* Stem for large plant */}
      {large && stemH > 0 && (
        <mesh position={[0, potH + stemH / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.025, stemH, 6]} />
          <Mat color="#5D4037" ghost={ghost} selected={selected} roughness={0.9} metalness={0} />
        </mesh>
      )}
      {/* Main foliage */}
      <mesh position={[0, foliageY, 0]}>
        <sphereGeometry args={[foliageR, 10, 8]} />
        <Mat color={color} ghost={ghost} selected={selected} roughness={0.9} metalness={0} />
      </mesh>
      {/* Extra spheres for large bushy plant */}
      {large && (
        <>
          <mesh position={[-foliageR * 0.52, foliageY * 0.82, 0]}>
            <sphereGeometry args={[foliageR * 0.62, 8, 6]} />
            <Mat color={color} ghost={ghost} selected={selected} roughness={0.9} metalness={0} />
          </mesh>
          <mesh position={[foliageR * 0.5, foliageY * 0.78, 0.05]}>
            <sphereGeometry args={[foliageR * 0.6, 8, 6]} />
            <Mat color={color} ghost={ghost} selected={selected} roughness={0.9} metalness={0} />
          </mesh>
        </>
      )}
    </group>
  )
}

// ---------- Main export ----------
export default function FurnitureMesh({ item, ghost, selected }: FurMeshProps) {
  const { id, dimensions, color } = item
  const { width: w, depth: d, height: h } = dimensions
  const p: ShapeProps = { w, d, h, color, ghost, selected }

  switch (id) {
    case 'sofa-3seat':
    case 'sofa-2seat':
      return <SofaShape {...p} />

    case 'armchair':
      return <ChairShape {...p} hasArmrests />

    case 'dining-chair':
      return <ChairShape {...p} />

    case 'office-chair':
      return <OfficeChairShape {...p} />

    case 'stool':
      return <BarStoolShape {...p} />

    case 'coffee-table':
    case 'dining-table-4':
    case 'dining-table-6':
    case 'side-table':
      return <TableShape {...p} />

    case 'desk':
      return <DeskShape {...p} />

    case 'kitchen-island':
    case 'kitchen-cabinet':
      return <KitchenIslandShape {...p} />

    case 'bed-king':
    case 'bed-queen':
    case 'bed-single':
      return <BedShape {...p} />

    case 'bunk-bed':
      return <BunkBedShape {...p} />

    case 'wardrobe':
      return <WardrobeShape {...p} />

    case 'bookshelf':
      return <BookshelfShape {...p} />

    case 'tv-unit':
      return <TvUnitShape {...p} />

    case 'dresser':
      return <DresserShape {...p} />

    case 'floor-lamp':
      return <FloorLampShape {...p} />

    case 'table-lamp':
      return <TableLampShape {...p} />

    case 'refrigerator':
      return <RefrigeratorShape {...p} />

    case 'washing-machine':
    case 'dishwasher':
      return <WashingMachineShape {...p} />

    case 'tv':
      return <TvShape {...p} />

    case 'bathtub':
      return <BathtubShape {...p} />

    case 'toilet':
      return <ToiletShape {...p} />

    case 'sink-vanity':
      return <SinkVanityShape {...p} />

    case 'plant-large':
      return <PlantShape {...p} large />

    case 'plant-small':
      return <PlantShape {...p} />

    default:
      // Fallback: simple box for rugs and anything unrecognised
      return (
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color={selected ? '#0ea5e9' : ghost ? '#22c55e' : color}
            roughness={0.7}
            metalness={0.1}
            transparent={ghost}
            opacity={ghost ? 0.45 : 1}
            emissive={selected ? '#0369a1' : '#000000'}
            emissiveIntensity={selected ? 0.3 : 0}
            wireframe={ghost}
            depthWrite={!ghost}
          />
        </mesh>
      )
  }
}
