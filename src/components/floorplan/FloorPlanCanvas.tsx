import { useRef, useState, useEffect, useCallback } from 'react'
import { Stage, Layer, Line, Circle, Text, Rect, Group, Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { useUIStore } from '@/store/useUIStore'
import { detectRooms } from '@/lib/geometry/roomDetector'
import { DEFAULT_WALL_THICKNESS, DEFAULT_WALL_HEIGHT, SNAP_THRESHOLD } from '@/lib/constants'
import type { Point2D } from '@/types'

const GRID_SIZE = 50 // canvas pixels per grid cell

function snapToGrid(val: number, gridPx: number): number {
  return Math.round(val / gridPx) * gridPx
}

export default function FloorPlanCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [scale, setScale] = useState(1)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })

  // Drawing state
  const [drawStart, setDrawStart] = useState<{ nodeId: string; pos: Point2D } | null>(null)
  const [cursorPos, setCursorPos] = useState<Point2D | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  const store = useFloorPlanStore()
  const ui = useUIStore()
  const { floorPlan } = store

  const [sketchImg] = useImage(floorPlan.sketchImageUrl ?? '')

  // Resize observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      setSize({ width: el.clientWidth, height: el.clientHeight })
    })
    obs.observe(el)
    setSize({ width: el.clientWidth, height: el.clientHeight })
    return () => obs.disconnect()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'w' || e.key === 'W') ui.setActiveTool('wall')
      if (e.key === 's' || e.key === 'S') ui.setActiveTool('select')
      if (e.key === 'd' || e.key === 'D') ui.setActiveTool('door')
      if (e.key === 'x' || e.key === 'X') ui.setActiveTool('window')
      if (e.key === 'e' || e.key === 'E') ui.setActiveTool('eraser')
      if (e.key === 'Escape') { setDrawStart(null); ui.setActiveTool('select') }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) store.redo(); else store.undo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [ui, store])

  // Re-detect rooms when walls change
  useEffect(() => {
    const wallCount = Object.keys(floorPlan.walls).length
    if (wallCount >= 3) {
      const rooms = detectRooms(floorPlan)
      if (rooms.length > 0) store.setRooms(rooms)
    }
  }, [floorPlan.walls, floorPlan.nodes])

  const getPointerPos = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>): Point2D => {
    const stage = stageRef.current
    if (!stage) return { x: 0, y: 0 }
    const pt = stage.getPointerPosition() ?? { x: 0, y: 0 }
    // Transform from stage coords to logical coords
    const x = (pt.x - stagePos.x) / scale
    const y = (pt.y - stagePos.y) / scale
    return { x, y }
  }, [scale, stagePos])

  function snapPoint(pos: Point2D, excludeId?: string): { pos: Point2D; nodeId: string | null } {
    // Try snap to existing node
    const snappedNodeId = store.snapToExistingNode(pos, SNAP_THRESHOLD / scale, excludeId)
    if (snappedNodeId) {
      return { pos: store.floorPlan.nodes[snappedNodeId].position, nodeId: snappedNodeId }
    }
    // Snap to grid
    return {
      pos: { x: snapToGrid(pos.x, GRID_SIZE), y: snapToGrid(pos.y, GRID_SIZE) },
      nodeId: null,
    }
  }

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const raw = getPointerPos(e)
    const { pos } = snapPoint(raw)
    setCursorPos(pos)

    // Check hover node
    const nearNodeId = store.snapToExistingNode(raw, SNAP_THRESHOLD / scale)
    setHoveredNodeId(nearNodeId)
  }, [getPointerPos, scale, store])

  const handleClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (e.target !== stageRef.current && ui.activeTool === 'wall') {
      // Clicked on a shape — only continue if it's a wall node being used as endpoint
    }
    const raw = getPointerPos(e)

    if (ui.activeTool === 'wall') {
      const { pos, nodeId } = snapPoint(raw)

      if (!drawStart) {
        // Start a new wall
        const id = nodeId ?? store.addNode(pos)
        store.saveHistory()
        setDrawStart({ nodeId: id, pos })
      } else {
        // End the wall
        if (nodeId === drawStart.nodeId) {
          // Clicked same node - cancel
          setDrawStart(null)
          return
        }
        const endId = nodeId ?? store.addNode(pos)
        store.addWall(drawStart.nodeId, endId)
        store.saveHistory()

        // Chain: start next wall from the endpoint
        setDrawStart({ nodeId: endId, pos: nodeId ? floorPlan.nodes[endId].position : pos })
      }
    } else if (ui.activeTool === 'select') {
      ui.setSelectedRoom(null)
      ui.setSelectedWall(null)
    } else if (ui.activeTool === 'eraser') {
      setDrawStart(null)
    }
  }, [ui, drawStart, getPointerPos, scale, store, floorPlan.nodes])

  const handleDblClick = useCallback(() => {
    if (ui.activeTool === 'wall') {
      setDrawStart(null)
    }
  }, [ui.activeTool])

  // Zoom on scroll
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const oldScale = scale
    const pointer = stage.getPointerPosition() ?? { x: 0, y: 0 }
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newScale = Math.max(0.2, Math.min(5, oldScale * (1 + direction * 0.1)))
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    }
    setScale(newScale)
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
  }, [scale, stagePos])

  const walls = Object.values(floorPlan.walls)
  const nodes = Object.values(floorPlan.nodes)
  const rooms = Object.values(floorPlan.rooms)

  return (
    <div ref={containerRef} className="absolute inset-0 cursor-crosshair">
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={scale}
        scaleY={scale}
        draggable={ui.activeTool === 'select'}
        onDragEnd={e => setStagePos({ x: e.target.x(), y: e.target.y() })}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onDblClick={handleDblClick}
        onWheel={handleWheel}
      >
        {/* Background sketch image */}
        {sketchImg && ui.showSketch && floorPlan.sketchImageUrl && (
          <Layer>
            <KonvaImage
              image={sketchImg}
              x={0} y={0}
              width={floorPlan.canvasWidth}
              height={floorPlan.canvasHeight}
              opacity={floorPlan.sketchOpacity}
            />
          </Layer>
        )}

        {/* Grid layer */}
        {ui.showGrid && (
          <Layer listening={false}>
            {Array.from({ length: Math.ceil(floorPlan.canvasWidth / GRID_SIZE) + 1 }, (_, i) => (
              <Line
                key={`vg${i}`}
                points={[i * GRID_SIZE, 0, i * GRID_SIZE, floorPlan.canvasHeight]}
                stroke="#334155"
                strokeWidth={0.5 / scale}
                opacity={0.5}
              />
            ))}
            {Array.from({ length: Math.ceil(floorPlan.canvasHeight / GRID_SIZE) + 1 }, (_, i) => (
              <Line
                key={`hg${i}`}
                points={[0, i * GRID_SIZE, floorPlan.canvasWidth, i * GRID_SIZE]}
                stroke="#334155"
                strokeWidth={0.5 / scale}
                opacity={0.5}
              />
            ))}
          </Layer>
        )}

        {/* Room fills */}
        <Layer listening={false}>
          {rooms.map(room => {
            const pts = room.nodeIds.flatMap(id => {
              const n = floorPlan.nodes[id]
              return n ? [n.position.x, n.position.y] : []
            })
            if (pts.length < 6) return null
            return (
              <Group key={room.id}>
                <Line
                  points={pts}
                  closed
                  fill={room.color}
                  opacity={0.18}
                  strokeWidth={0}
                />
                <Line
                  points={pts}
                  closed
                  fill="transparent"
                  stroke={room.color}
                  strokeWidth={1.5 / scale}
                  dash={[6 / scale, 3 / scale]}
                  opacity={0.5}
                />
                {/* Room label */}
                {(() => {
                  const xs = room.nodeIds.map(id => floorPlan.nodes[id]?.position.x ?? 0)
                  const ys = room.nodeIds.map(id => floorPlan.nodes[id]?.position.y ?? 0)
                  const cx = xs.reduce((a, b) => a + b, 0) / xs.length
                  const cy = ys.reduce((a, b) => a + b, 0) / ys.length
                  return (
                    <Text
                      x={cx - 40}
                      y={cy - 8}
                      text={room.name}
                      width={80}
                      align="center"
                      fontSize={12 / scale}
                      fill={room.color}
                      fontStyle="bold"
                      listening={false}
                    />
                  )
                })()}
              </Group>
            )
          })}
        </Layer>

        {/* Walls layer */}
        <Layer>
          {walls.map(wall => {
            const sn = floorPlan.nodes[wall.startNodeId]
            const en = floorPlan.nodes[wall.endNodeId]
            if (!sn || !en) return null
            const selected = ui.selectedWallId === wall.id
            const wallThicknessPx = (wall.thickness * floorPlan.scale)

            return (
              <Group key={wall.id}>
                {/* Thick wall body */}
                <Line
                  points={[sn.position.x, sn.position.y, en.position.x, en.position.y]}
                  stroke={selected ? '#0ea5e9' : '#64748b'}
                  strokeWidth={wallThicknessPx / scale}
                  lineCap="square"
                  onClick={() => {
                    if (ui.activeTool === 'select') {
                      ui.setSelectedWall(wall.id)
                      ui.setSelectedRoom(null)
                    } else if (ui.activeTool === 'eraser') {
                      store.deleteWall(wall.id)
                      store.saveHistory()
                    } else if (ui.activeTool === 'door') {
                      store.addOpening(wall.id, {
                        type: 'door', offsetAlongWall: 0.5,
                        width: 0.9, height: 2.1, bottomOffset: 0
                      })
                    } else if (ui.activeTool === 'window') {
                      store.addOpening(wall.id, {
                        type: 'window', offsetAlongWall: 0.5,
                        width: 1.0, height: 1.2, bottomOffset: 0.9
                      })
                    }
                  }}
                />
                {/* Wall center line */}
                <Line
                  points={[sn.position.x, sn.position.y, en.position.x, en.position.y]}
                  stroke={selected ? '#38bdf8' : '#94a3b8'}
                  strokeWidth={1 / scale}
                  listening={false}
                />

                {/* Door/window markers */}
                {wall.openings.map(opening => {
                  const ox = sn.position.x + (en.position.x - sn.position.x) * opening.offsetAlongWall
                  const oy = sn.position.y + (en.position.y - sn.position.y) * opening.offsetAlongWall
                  return (
                    <Circle
                      key={opening.id}
                      x={ox} y={oy}
                      radius={8 / scale}
                      fill={opening.type === 'door' ? '#f59e0b' : '#06b6d4'}
                      stroke="#fff"
                      strokeWidth={1 / scale}
                      listening={false}
                    />
                  )
                })}

                {/* Wall length label */}
                {ui.showMeasurements && (() => {
                  const dx = en.position.x - sn.position.x
                  const dy = en.position.y - sn.position.y
                  const len = Math.sqrt(dx * dx + dy * dy) / floorPlan.scale
                  const mx = (sn.position.x + en.position.x) / 2
                  const my = (sn.position.y + en.position.y) / 2
                  const angle = Math.atan2(dy, dx) * 180 / Math.PI
                  return (
                    <Text
                      x={mx - 25}
                      y={my - 16 / scale}
                      text={`${len.toFixed(1)}m`}
                      fontSize={11 / scale}
                      fill="#94a3b8"
                      rotation={angle > 90 || angle < -90 ? angle + 180 : angle}
                      offsetX={0}
                      listening={false}
                    />
                  )
                })()}
              </Group>
            )
          })}

          {/* Preview wall being drawn */}
          {drawStart && cursorPos && ui.activeTool === 'wall' && (
            <Line
              points={[drawStart.pos.x, drawStart.pos.y, cursorPos.x, cursorPos.y]}
              stroke="#0ea5e9"
              strokeWidth={DEFAULT_WALL_THICKNESS * floorPlan.scale / scale}
              dash={[10 / scale, 5 / scale]}
              lineCap="square"
              listening={false}
            />
          )}
        </Layer>

        {/* Nodes layer */}
        <Layer>
          {nodes.map(node => {
            const hovered = hoveredNodeId === node.id
            return (
              <Circle
                key={node.id}
                x={node.position.x}
                y={node.position.y}
                radius={(hovered ? 7 : 5) / scale}
                fill={hovered ? '#0ea5e9' : '#334155'}
                stroke={hovered ? '#38bdf8' : '#64748b'}
                strokeWidth={1.5 / scale}
                draggable={ui.activeTool === 'select'}
                onDragMove={e => {
                  const raw = { x: e.target.x(), y: e.target.y() }
                  const snapped = { x: snapToGrid(raw.x, GRID_SIZE), y: snapToGrid(raw.y, GRID_SIZE) }
                  e.target.position(snapped)
                  store.updateNode(node.id, snapped)
                }}
                onDragEnd={() => store.saveHistory()}
                onClick={() => {
                  if (ui.activeTool === 'eraser') {
                    store.deleteNode(node.id)
                    store.saveHistory()
                  } else if (ui.activeTool === 'wall' && drawStart) {
                    // Close wall to this existing node
                    if (node.id !== drawStart.nodeId) {
                      store.addWall(drawStart.nodeId, node.id)
                      store.saveHistory()
                      setDrawStart({ nodeId: node.id, pos: node.position })
                    }
                  }
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              />
            )
          })}

          {/* Cursor snap indicator */}
          {cursorPos && ui.activeTool === 'wall' && (
            <Circle
              x={cursorPos.x} y={cursorPos.y}
              radius={4 / scale}
              fill={hoveredNodeId ? '#0ea5e9' : '#64748b'}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
}
