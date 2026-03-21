import { useRef, useState, useEffect, useCallback } from 'react'
import { Stage, Layer, Line, Circle, Text, Arc, Group, Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { useUIStore } from '@/store/useUIStore'
import { detectRooms, computeRoomArea } from '@/lib/geometry/roomDetector'
import { OPENINGS_BY_ID } from '@/lib/catalog/openingsCatalog'
import { DEFAULT_WALL_THICKNESS, DEFAULT_WALL_HEIGHT, SNAP_THRESHOLD } from '@/lib/constants'
import type { Point2D, WallOpening } from '@/types'

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
  const [openingStart, setOpeningStart] = useState<{ nodeId: string; pos: Point2D } | null>(null)
  const [cursorPos, setCursorPos] = useState<Point2D | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null)

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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return

      // Mode switching: 1-4
      if (e.key === '1') ui.setEditorMode('walls')
      if (e.key === '2') ui.setEditorMode('openings')
      if (e.key === '3') ui.setEditorMode('materials')
      if (e.key === '4') ui.setEditorMode('furniture')

      // Wall-mode sub-tools
      if (ui.editorMode === 'walls') {
        if (e.key === 'w' || e.key === 'W') ui.setActiveTool('wall')
        if (e.key === 's' || e.key === 'S') ui.setActiveTool('select')
        if (e.key === 'e' || e.key === 'E') ui.setActiveTool('eraser')
      }

      if (e.key === 'Escape') {
        setDrawStart(null)
        setOpeningStart(null)
        ui.setSelectedWall(null)
        ui.setSelectedRoom(null)
        ui.setSelectedOpening(null)
        if (ui.editorMode === 'walls') ui.setActiveTool('select')
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) store.redo(); else store.undo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [ui, store])

  // Clear opening placement when mode changes
  useEffect(() => {
    setOpeningStart(null)
  }, [ui.editorMode])

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
    const x = (pt.x - stagePos.x) / scale
    const y = (pt.y - stagePos.y) / scale
    return { x, y }
  }, [scale, stagePos])

  function snapPoint(pos: Point2D, excludeId?: string): { pos: Point2D; nodeId: string | null } {
    const snappedNodeId = store.snapToExistingNode(pos, SNAP_THRESHOLD / scale, excludeId)
    if (snappedNodeId) {
      return { pos: store.floorPlan.nodes[snappedNodeId].position, nodeId: snappedNodeId }
    }
    return {
      pos: { x: snapToGrid(pos.x, GRID_SIZE), y: snapToGrid(pos.y, GRID_SIZE) },
      nodeId: null,
    }
  }

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const raw = getPointerPos(e)
    const { pos } = snapPoint(raw)
    setCursorPos(pos)
    const nearNodeId = store.snapToExistingNode(raw, SNAP_THRESHOLD / scale)
    setHoveredNodeId(nearNodeId)
  }, [getPointerPos, scale, store])

  // --- Mode-aware click handler ---
  const handleClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const raw = getPointerPos(e)

    if (ui.editorMode === 'walls') {
      if (ui.activeTool === 'wall') {
        const { pos, nodeId } = snapPoint(raw)
        if (!drawStart) {
          const id = nodeId ?? store.addNode(pos)
          store.saveHistory()
          setDrawStart({ nodeId: id, pos })
        } else {
          if (nodeId === drawStart.nodeId) {
            setDrawStart(null)
            return
          }
          const endId = nodeId ?? store.addNode(pos)
          store.addWall(drawStart.nodeId, endId)
          store.saveHistory()
          setDrawStart({ nodeId: endId, pos: nodeId ? floorPlan.nodes[endId].position : pos })
        }
      } else if (ui.activeTool === 'select') {
        ui.setSelectedRoom(null)
        ui.setSelectedWall(null)
      } else if (ui.activeTool === 'eraser') {
        setDrawStart(null)
      }
    } else if (ui.editorMode === 'openings') {
      // Node-to-node opening placement (click empty space to create new nodes)
      if (ui.selectedOpeningCatalogId) {
        const { pos, nodeId } = snapPoint(raw)
        if (!openingStart) {
          const id = nodeId ?? store.addNode(pos)
          store.saveHistory()
          setOpeningStart({ nodeId: id, pos: nodeId ? floorPlan.nodes[id].position : pos })
        } else {
          if (nodeId === openingStart.nodeId) {
            setOpeningStart(null)
            return
          }
          const endId = nodeId ?? store.addNode(pos)
          const catalogItem = OPENINGS_BY_ID[ui.selectedOpeningCatalogId]
          if (catalogItem) {
            const wallId = store.addWall(openingStart.nodeId, endId)
            store.addOpening(wallId, {
              type: catalogItem.type,
              offsetAlongWall: 0.5,
              width: catalogItem.width,
              height: catalogItem.height,
              bottomOffset: catalogItem.bottomOffset,
            })
            store.saveHistory()
          }
          setOpeningStart(null)
        }
      }
    } else if (ui.editorMode === 'materials') {
      // Click on empty area deselects
      ui.setSelectedRoom(null)
    }
  }, [ui, drawStart, openingStart, getPointerPos, scale, store, floorPlan.nodes])

  const handleDblClick = useCallback(() => {
    if (ui.editorMode === 'walls' && ui.activeTool === 'wall') {
      setDrawStart(null)
    }
  }, [ui.editorMode, ui.activeTool])

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

  // --- Wall click handler ---
  function handleWallClick(wallId: string) {
    if (ui.editorMode === 'walls') {
      if (ui.activeTool === 'select') {
        ui.setSelectedWall(wallId)
        ui.setSelectedRoom(null)
      } else if (ui.activeTool === 'eraser') {
        store.deleteWall(wallId)
        store.saveHistory()
      }
    } else if (ui.editorMode === 'openings') {
      // Add the selected opening type to this wall
      const catalogId = ui.selectedOpeningCatalogId
      if (catalogId) {
        const catalogItem = OPENINGS_BY_ID[catalogId]
        if (catalogItem) {
          store.addOpening(wallId, {
            type: catalogItem.type,
            offsetAlongWall: 0.5,
            width: catalogItem.width,
            height: catalogItem.height,
            bottomOffset: catalogItem.bottomOffset,
          })
          store.saveHistory()
        }
      }
    }
  }

  // --- Room click handler ---
  function handleRoomClick(roomId: string) {
    if (ui.editorMode === 'walls') {
      ui.setSelectedRoom(roomId)
      ui.setSelectedWall(null)
    } else if (ui.editorMode === 'materials') {
      // Apply selected material to this room
      const matId = ui.selectedMaterialId
      if (matId) {
        const target = ui.materialTarget
        if (target === 'floor') store.updateRoom(roomId, { floorMaterialId: matId })
        else if (target === 'wall') store.updateRoom(roomId, { wallMaterialId: matId })
        else store.updateRoom(roomId, { ceilingMaterialId: matId })
      }
      ui.setSelectedRoom(roomId)
    } else if (ui.editorMode === 'openings') {
      // No room interaction in openings mode
    }
  }

  // --- Opening click handler ---
  function handleOpeningClick(wallId: string, openingId: string) {
    if (ui.editorMode === 'openings') {
      ui.setSelectedWall(wallId)
      ui.setSelectedOpening(openingId)
    } else if (ui.editorMode === 'walls' && ui.activeTool === 'eraser') {
      store.removeOpening(wallId, openingId)
      store.saveHistory()
    }
  }

  const walls = Object.values(floorPlan.walls)
  const nodes = Object.values(floorPlan.nodes)
  const rooms = Object.values(floorPlan.rooms)

  const isDraggable = ui.editorMode === 'walls' && ui.activeTool === 'select'
  const cursorStyle = (ui.editorMode === 'walls' && ui.activeTool === 'wall')
    ? 'crosshair'
    : (ui.editorMode === 'walls' && ui.activeTool === 'eraser')
      ? 'pointer'
      : (ui.editorMode === 'openings' && ui.selectedOpeningCatalogId)
        ? 'crosshair'
        : 'default'

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ cursor: cursorStyle }}>
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={scale}
        scaleY={scale}
        draggable={isDraggable}
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

        {/* Room fills — clickable in walls & materials modes */}
        <Layer listening={ui.editorMode === 'walls' || ui.editorMode === 'materials'}>
          {rooms.map(room => {
            const pts = room.nodeIds.flatMap(id => {
              const n = floorPlan.nodes[id]
              return n ? [n.position.x, n.position.y] : []
            })
            if (pts.length < 6) return null

            const isSelected = ui.selectedRoomId === room.id
            const isHovered = hoveredRoomId === room.id
            const baseOpacity = isSelected ? 0.3 : isHovered ? 0.25 : 0.18

            // Centroid for label
            const xs = room.nodeIds.map(id => floorPlan.nodes[id]?.position.x ?? 0)
            const ys = room.nodeIds.map(id => floorPlan.nodes[id]?.position.y ?? 0)
            const cx = xs.reduce((a, b) => a + b, 0) / xs.length
            const cy = ys.reduce((a, b) => a + b, 0) / ys.length

            const area = computeRoomArea(room, floorPlan.nodes, floorPlan.scale)

            return (
              <Group key={room.id}>
                <Line
                  points={pts}
                  closed
                  fill={room.color}
                  opacity={baseOpacity}
                  strokeWidth={0}
                  onClick={e => { e.cancelBubble = true; handleRoomClick(room.id) }}
                  onMouseEnter={() => setHoveredRoomId(room.id)}
                  onMouseLeave={() => setHoveredRoomId(null)}
                />
                {/* Room outline */}
                <Line
                  points={pts}
                  closed
                  fill="transparent"
                  stroke={isSelected ? room.color : room.color}
                  strokeWidth={(isSelected ? 2 : 1.5) / scale}
                  dash={isSelected ? undefined : [6 / scale, 3 / scale]}
                  opacity={isSelected ? 0.8 : 0.5}
                  listening={false}
                />
                {/* Room label with area */}
                <Text
                  x={cx - 50}
                  y={cy - 14 / scale}
                  text={`${room.name}${area > 0 ? `\n${area.toFixed(1)} m\u00B2` : ''}`}
                  width={100}
                  align="center"
                  fontSize={12 / scale}
                  lineHeight={1.4}
                  fill={room.color}
                  fontStyle="bold"
                  listening={false}
                />
              </Group>
            )
          })}
        </Layer>

        {/* Walls layer */}
        <Layer listening={ui.editorMode === 'walls' || ui.editorMode === 'openings'}>
          {walls.map(wall => {
            const sn = floorPlan.nodes[wall.startNodeId]
            const en = floorPlan.nodes[wall.endNodeId]
            if (!sn || !en) return null
            const selected = ui.selectedWallId === wall.id

            // Compute wall rectangle as filled polygon
            const dx = en.position.x - sn.position.x
            const dy = en.position.y - sn.position.y
            const len = Math.sqrt(dx * dx + dy * dy)
            if (len === 0) return null

            const thicknessPx = wall.thickness * floorPlan.scale
            const halfT = thicknessPx / 2
            const nx = (-dy / len) * halfT
            const ny = (dx / len) * halfT

            // 4 corners of wall rectangle
            const wallPts = [
              sn.position.x + nx, sn.position.y + ny,
              en.position.x + nx, en.position.y + ny,
              en.position.x - nx, en.position.y - ny,
              sn.position.x - nx, sn.position.y - ny,
            ]

            return (
              <Group key={wall.id}>
                {/* Thick wall body (filled polygon) */}
                <Line
                  points={wallPts}
                  closed
                  fill={selected ? '#0c4a6e' : '#334155'}
                  stroke={selected ? '#0ea5e9' : '#475569'}
                  strokeWidth={1 / scale}
                  onClick={e => { e.cancelBubble = true; handleWallClick(wall.id) }}
                />

                {/* Door/window symbols */}
                {wall.openings.map(opening => {
                  const ox = sn.position.x + dx * opening.offsetAlongWall
                  const oy = sn.position.y + dy * opening.offsetAlongWall
                  const wallAngle = Math.atan2(dy, dx) * 180 / Math.PI
                  const isSelectedOpening = ui.selectedOpeningId === opening.id

                  if (opening.type === 'door') {
                    // Door: gap in wall + swing arc
                    const doorWidthPx = opening.width * floorPlan.scale
                    return (
                      <Group key={opening.id}
                        onClick={e => { e.cancelBubble = true; handleOpeningClick(wall.id, opening.id) }}
                      >
                        {/* Door gap (white rectangle over wall) */}
                        <Line
                          points={[
                            ox - (dx / len) * doorWidthPx / 2 + nx, oy - (dy / len) * doorWidthPx / 2 + ny,
                            ox + (dx / len) * doorWidthPx / 2 + nx, oy + (dy / len) * doorWidthPx / 2 + ny,
                            ox + (dx / len) * doorWidthPx / 2 - nx, oy + (dy / len) * doorWidthPx / 2 - ny,
                            ox - (dx / len) * doorWidthPx / 2 - nx, oy - (dy / len) * doorWidthPx / 2 - ny,
                          ]}
                          closed
                          fill="#1e293b"
                          strokeWidth={0}
                          listening={false}
                        />
                        {/* Door swing arc */}
                        <Arc
                          x={ox - (dx / len) * doorWidthPx / 2}
                          y={oy - (dy / len) * doorWidthPx / 2}
                          innerRadius={0}
                          outerRadius={doorWidthPx}
                          angle={90}
                          rotation={wallAngle}
                          fill="transparent"
                          stroke={isSelectedOpening ? '#f59e0b' : '#f59e0b'}
                          strokeWidth={1 / scale}
                          opacity={isSelectedOpening ? 1 : 0.6}
                          dash={[4 / scale, 2 / scale]}
                          listening={false}
                        />
                        {/* Door panel line */}
                        <Line
                          points={[
                            ox - (dx / len) * doorWidthPx / 2,
                            oy - (dy / len) * doorWidthPx / 2,
                            ox + (dx / len) * doorWidthPx / 2,
                            oy + (dy / len) * doorWidthPx / 2,
                          ]}
                          stroke={isSelectedOpening ? '#fbbf24' : '#f59e0b'}
                          strokeWidth={2 / scale}
                          listening={false}
                        />
                        {/* Selection ring */}
                        {isSelectedOpening && (
                          <Circle
                            x={ox} y={oy}
                            radius={10 / scale}
                            stroke="#f59e0b"
                            strokeWidth={2 / scale}
                            fill="transparent"
                            listening={false}
                          />
                        )}
                      </Group>
                    )
                  } else if (opening.type === 'window') {
                    // Window: parallel lines perpendicular to wall
                    const winWidthPx = opening.width * floorPlan.scale
                    const offset = halfT * 0.6
                    return (
                      <Group key={opening.id}
                        onClick={e => { e.cancelBubble = true; handleOpeningClick(wall.id, opening.id) }}
                      >
                        {/* Window gap */}
                        <Line
                          points={[
                            ox - (dx / len) * winWidthPx / 2 + nx, oy - (dy / len) * winWidthPx / 2 + ny,
                            ox + (dx / len) * winWidthPx / 2 + nx, oy + (dy / len) * winWidthPx / 2 + ny,
                            ox + (dx / len) * winWidthPx / 2 - nx, oy + (dy / len) * winWidthPx / 2 - ny,
                            ox - (dx / len) * winWidthPx / 2 - nx, oy - (dy / len) * winWidthPx / 2 - ny,
                          ]}
                          closed
                          fill="#1e293b"
                          strokeWidth={0}
                          listening={false}
                        />
                        {/* Window parallel lines */}
                        <Line
                          points={[
                            ox - (dx / len) * winWidthPx / 2 + nx * 0.6, oy - (dy / len) * winWidthPx / 2 + ny * 0.6,
                            ox + (dx / len) * winWidthPx / 2 + nx * 0.6, oy + (dy / len) * winWidthPx / 2 + ny * 0.6,
                          ]}
                          stroke={isSelectedOpening ? '#22d3ee' : '#06b6d4'}
                          strokeWidth={2 / scale}
                          listening={false}
                        />
                        <Line
                          points={[
                            ox - (dx / len) * winWidthPx / 2 - nx * 0.6, oy - (dy / len) * winWidthPx / 2 - ny * 0.6,
                            ox + (dx / len) * winWidthPx / 2 - nx * 0.6, oy + (dy / len) * winWidthPx / 2 - ny * 0.6,
                          ]}
                          stroke={isSelectedOpening ? '#22d3ee' : '#06b6d4'}
                          strokeWidth={2 / scale}
                          listening={false}
                        />
                        {isSelectedOpening && (
                          <Circle
                            x={ox} y={oy}
                            radius={10 / scale}
                            stroke="#06b6d4"
                            strokeWidth={2 / scale}
                            fill="transparent"
                            listening={false}
                          />
                        )}
                      </Group>
                    )
                  } else {
                    // Archway: dashed gap
                    const archWidthPx = opening.width * floorPlan.scale
                    return (
                      <Group key={opening.id}
                        onClick={e => { e.cancelBubble = true; handleOpeningClick(wall.id, opening.id) }}
                      >
                        <Line
                          points={[
                            ox - (dx / len) * archWidthPx / 2 + nx, oy - (dy / len) * archWidthPx / 2 + ny,
                            ox + (dx / len) * archWidthPx / 2 + nx, oy + (dy / len) * archWidthPx / 2 + ny,
                            ox + (dx / len) * archWidthPx / 2 - nx, oy + (dy / len) * archWidthPx / 2 - ny,
                            ox - (dx / len) * archWidthPx / 2 - nx, oy - (dy / len) * archWidthPx / 2 - ny,
                          ]}
                          closed
                          fill="#1e293b"
                          strokeWidth={0}
                          listening={false}
                        />
                        <Line
                          points={[
                            ox - (dx / len) * archWidthPx / 2, oy - (dy / len) * archWidthPx / 2,
                            ox + (dx / len) * archWidthPx / 2, oy + (dy / len) * archWidthPx / 2,
                          ]}
                          stroke={isSelectedOpening ? '#a78bfa' : '#8b5cf6'}
                          strokeWidth={2 / scale}
                          dash={[4 / scale, 4 / scale]}
                          listening={false}
                        />
                        {isSelectedOpening && (
                          <Circle
                            x={ox} y={oy}
                            radius={10 / scale}
                            stroke="#8b5cf6"
                            strokeWidth={2 / scale}
                            fill="transparent"
                            listening={false}
                          />
                        )}
                      </Group>
                    )
                  }
                })}

                {/* Wall length label */}
                {ui.showMeasurements && (() => {
                  const wallLen = len / floorPlan.scale
                  const mx = (sn.position.x + en.position.x) / 2
                  const my = (sn.position.y + en.position.y) / 2
                  const angle = Math.atan2(dy, dx) * 180 / Math.PI
                  // Offset label perpendicular to wall
                  const labelOffset = halfT + 10 / scale
                  const lx = mx + (-dy / len) * labelOffset
                  const ly = my + (dx / len) * labelOffset
                  return (
                    <Text
                      x={lx - 25}
                      y={ly - 6 / scale}
                      text={`${wallLen.toFixed(2)}m`}
                      fontSize={10 / scale}
                      fill="#94a3b8"
                      rotation={angle > 90 || angle < -90 ? angle + 180 : angle}
                      listening={false}
                    />
                  )
                })()}
              </Group>
            )
          })}

          {/* Preview opening being placed (node-to-node) */}
          {openingStart && cursorPos && ui.editorMode === 'openings' && ui.selectedOpeningCatalogId && (() => {
            const dx = cursorPos.x - openingStart.pos.x
            const dy = cursorPos.y - openingStart.pos.y
            const len = Math.sqrt(dx * dx + dy * dy)
            if (len === 0) return null

            const catalogItem = OPENINGS_BY_ID[ui.selectedOpeningCatalogId]
            const color = catalogItem?.type === 'window' ? '#06b6d4' : '#f59e0b'

            return (
              <Group listening={false}>
                {/* Dashed preview line */}
                <Line
                  points={[openingStart.pos.x, openingStart.pos.y, cursorPos.x, cursorPos.y]}
                  stroke={color}
                  strokeWidth={3 / scale}
                  opacity={0.7}
                  dash={[8 / scale, 4 / scale]}
                />
                {/* Start node indicator */}
                <Circle
                  x={openingStart.pos.x} y={openingStart.pos.y}
                  radius={6 / scale}
                  fill={color}
                  opacity={0.8}
                />
                {/* Label */}
                <Text
                  x={(openingStart.pos.x + cursorPos.x) / 2 - 30}
                  y={(openingStart.pos.y + cursorPos.y) / 2 - 16 / scale}
                  text={catalogItem?.name ?? 'Opening'}
                  fontSize={10 / scale}
                  fill={color}
                  fontStyle="bold"
                />
              </Group>
            )
          })()}

          {/* Preview wall being drawn */}
          {drawStart && cursorPos && ui.editorMode === 'walls' && ui.activeTool === 'wall' && (() => {
            const dx = cursorPos.x - drawStart.pos.x
            const dy = cursorPos.y - drawStart.pos.y
            const len = Math.sqrt(dx * dx + dy * dy)
            if (len === 0) return null

            const thicknessPx = DEFAULT_WALL_THICKNESS * floorPlan.scale
            const halfT = thicknessPx / 2
            const nx = (-dy / len) * halfT
            const ny = (dx / len) * halfT

            const previewPts = [
              drawStart.pos.x + nx, drawStart.pos.y + ny,
              cursorPos.x + nx, cursorPos.y + ny,
              cursorPos.x - nx, cursorPos.y - ny,
              drawStart.pos.x - nx, drawStart.pos.y - ny,
            ]

            const wallLen = len / floorPlan.scale
            const mx = (drawStart.pos.x + cursorPos.x) / 2
            const my = (drawStart.pos.y + cursorPos.y) / 2
            const labelOffset = halfT + 12 / scale
            const lx = mx + (-dy / len) * labelOffset
            const ly = my + (dx / len) * labelOffset
            const angle = Math.atan2(dy, dx) * 180 / Math.PI

            return (
              <Group listening={false}>
                <Line
                  points={previewPts}
                  closed
                  fill="#0c4a6e"
                  stroke="#0ea5e9"
                  strokeWidth={1 / scale}
                  opacity={0.7}
                  dash={[6 / scale, 3 / scale]}
                />
                {/* Real-time measurement */}
                <Text
                  x={lx - 25}
                  y={ly - 6 / scale}
                  text={`${wallLen.toFixed(2)}m`}
                  fontSize={11 / scale}
                  fill="#38bdf8"
                  fontStyle="bold"
                  rotation={angle > 90 || angle < -90 ? angle + 180 : angle}
                />
              </Group>
            )
          })()}
        </Layer>

        {/* Nodes layer */}
        <Layer listening={ui.editorMode === 'walls' || ui.editorMode === 'openings'}>
          {nodes.map(node => {
            const hovered = hoveredNodeId === node.id
            return (
              <Circle
                key={node.id}
                x={node.position.x}
                y={node.position.y}
                radius={(hovered ? 6 : 4) / scale}
                fill={hovered ? '#0ea5e9' : '#475569'}
                stroke={hovered ? '#38bdf8' : '#64748b'}
                strokeWidth={1.5 / scale}
                draggable={isDraggable}
                onDragMove={e => {
                  const raw = { x: e.target.x(), y: e.target.y() }
                  const snapped = { x: snapToGrid(raw.x, GRID_SIZE), y: snapToGrid(raw.y, GRID_SIZE) }
                  e.target.position(snapped)
                  store.updateNode(node.id, snapped)
                }}
                onDragEnd={() => store.saveHistory()}
                onClick={e => {
                  e.cancelBubble = true
                  if (ui.editorMode === 'walls') {
                    if (ui.activeTool === 'eraser') {
                      store.deleteNode(node.id)
                      store.saveHistory()
                    } else if (ui.activeTool === 'wall' && drawStart) {
                      if (node.id !== drawStart.nodeId) {
                        store.addWall(drawStart.nodeId, node.id)
                        store.saveHistory()
                        setDrawStart({ nodeId: node.id, pos: node.position })
                      }
                    }
                  } else if (ui.editorMode === 'openings' && ui.selectedOpeningCatalogId) {
                    if (!openingStart) {
                      setOpeningStart({ nodeId: node.id, pos: node.position })
                    } else if (node.id !== openingStart.nodeId) {
                      const catalogItem = OPENINGS_BY_ID[ui.selectedOpeningCatalogId]
                      if (catalogItem) {
                        const wallId = store.addWall(openingStart.nodeId, node.id)
                        store.addOpening(wallId, {
                          type: catalogItem.type,
                          offsetAlongWall: 0.5,
                          width: catalogItem.width,
                          height: catalogItem.height,
                          bottomOffset: catalogItem.bottomOffset,
                        })
                        store.saveHistory()
                      }
                      setOpeningStart(null)
                    } else {
                      setOpeningStart(null)
                    }
                  }
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              />
            )
          })}

          {/* Cursor snap indicator */}
          {cursorPos && ui.editorMode === 'walls' && ui.activeTool === 'wall' && (
            <Circle
              x={cursorPos.x} y={cursorPos.y}
              radius={4 / scale}
              fill={hoveredNodeId ? '#0ea5e9' : '#64748b'}
              listening={false}
            />
          )}
          {cursorPos && ui.editorMode === 'openings' && ui.selectedOpeningCatalogId && (
            <Circle
              x={cursorPos.x} y={cursorPos.y}
              radius={4 / scale}
              fill={hoveredNodeId ? '#f59e0b' : '#64748b'}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
}
