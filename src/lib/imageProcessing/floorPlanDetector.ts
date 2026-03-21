import { nanoid } from 'nanoid'
import type { WallNode, WallSegment } from '@/types'
import { DEFAULT_WALL_HEIGHT, DEFAULT_WALL_THICKNESS } from '@/lib/constants'

// ── Constants ──────────────────────────────────────────────

const GRID_SIZE = 50 // must match FloorPlanCanvas GRID_SIZE
const CONTENT_PADDING = GRID_SIZE * 2 // padding around content on canvas

// ── Types ──────────────────────────────────────────────────

interface Run {
  start: number
  end: number
  pos: number
}

interface LineSegment {
  orientation: 'h' | 'v'
  start: number
  end: number
  center: number
  thickness: number
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface NodeInfo {
  id: string
  x: number
  y: number
}

export interface DetectionResult {
  nodes: Record<string, WallNode>
  walls: Record<string, WallSegment>
  processedImageUrl: string
  estimatedScale: number
}

// ── Public API ─────────────────────────────────────────────

export async function detectFloorPlanFromImage(
  imageUrl: string,
  canvasWidth: number,
  canvasHeight: number,
  onProgress?: (stage: string, pct: number) => void,
): Promise<DetectionResult> {
  onProgress?.('Loading image...', 0)
  const img = await loadImage(imageUrl)

  // Step 1: Find the content bounding box (strip whitespace / margins)
  onProgress?.('Analyzing content...', 10)
  const contentBounds = findContentBounds(img)

  // Step 2: Create an aligned canvas — content centered and snapped to grid
  onProgress?.('Aligning to grid...', 20)
  const { canvas: alignedCanvas, contentOnCanvas } = createAlignedCanvas(
    img, contentBounds, canvasWidth, canvasHeight,
  )

  // Step 3: Grayscale + threshold on the aligned canvas
  onProgress?.('Detecting features...', 30)
  const { gray, w, h } = canvasToGrayscale(alignedCanvas)
  const threshold = otsuThreshold(gray)
  const binary = binarize(gray, w, h, threshold)

  // Step 4: Morphological cleanup
  onProgress?.('Cleaning noise...', 45)
  morphClose(binary, w, h, 3)
  morphOpen(binary, w, h, 2)

  // Step 5: Detect line runs
  onProgress?.('Finding walls...', 55)
  const minRunLen = Math.max(15, Math.round(Math.min(w, h) * 0.03))
  const hRuns = findHorizontalRuns(binary, w, h, minRunLen)
  const vRuns = findVerticalRuns(binary, w, h, minRunLen)

  // Step 6: Cluster into line segments
  onProgress?.('Processing structure...', 70)
  const maxThk = Math.max(8, Math.round(Math.min(w, h) * 0.03))
  const hLines = clusterRuns(hRuns, maxThk)
  const vLines = clusterRuns(vRuns, maxThk)
  for (const l of vLines) l.orientation = 'v'

  const minSegLen = Math.max(20, Math.round(Math.min(w, h) * 0.04))
  const filteredH = hLines.filter(l => (l.end - l.start) >= minSegLen)
  const filteredV = vLines.filter(l => (l.end - l.start) >= minSegLen)

  // Step 7: Build nodes and walls
  onProgress?.('Building floor plan...', 82)
  const snapR = Math.max(8, Math.round(Math.min(w, h) * 0.015))
  const { nodes, walls } = buildFloorPlanFromLines(filteredH, filteredV, snapR)

  // Step 8: Snap all nodes to the grid
  onProgress?.('Snapping to grid...', 90)
  snapNodesToGrid(nodes, GRID_SIZE)

  // Step 9: Estimate scale from content dimensions
  const estimatedScale = estimateScale(nodes, contentOnCanvas)

  // Step 10: Create the processed (aligned) image as a blob URL
  onProgress?.('Finalizing...', 95)
  const processedImageUrl = await canvasToBlobUrl(alignedCanvas)

  onProgress?.('Done!', 100)
  return { nodes, walls, processedImageUrl, estimatedScale }
}

// ── Image loading ──────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// ── Content bounds detection ───────────────────────────────

function findContentBounds(img: HTMLImageElement): Rect {
  // Draw image to a work canvas for analysis (smaller for speed)
  const maxDim = 600
  const aspect = img.width / img.height
  const workW = aspect >= 1 ? maxDim : Math.round(maxDim * aspect)
  const workH = aspect >= 1 ? Math.round(maxDim / aspect) : maxDim

  const canvas = document.createElement('canvas')
  canvas.width = workW
  canvas.height = workH
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, workW, workH)
  ctx.drawImage(img, 0, 0, workW, workH)

  const imageData = ctx.getImageData(0, 0, workW, workH)
  const data = imageData.data

  // Convert to grayscale
  const gray = new Uint8Array(workW * workH)
  for (let i = 0; i < gray.length; i++) {
    const off = i * 4
    gray[i] = Math.round(data[off] * 0.299 + data[off + 1] * 0.587 + data[off + 2] * 0.114)
  }

  // Binary threshold
  const thresh = otsuThreshold(gray)
  const binary = new Uint8Array(gray.length)
  for (let i = 0; i < gray.length; i++) {
    binary[i] = gray[i] < thresh ? 1 : 0
  }

  // Auto-invert if most pixels are foreground (blueprint)
  let fgCount = 0
  for (let i = 0; i < binary.length; i++) fgCount += binary[i]
  if (fgCount > binary.length * 0.5) {
    for (let i = 0; i < binary.length; i++) binary[i] = 1 - binary[i]
  }

  // Row and column projections (count foreground pixels per row/col)
  const rowSums = new Uint32Array(workH)
  const colSums = new Uint32Array(workW)
  for (let y = 0; y < workH; y++) {
    for (let x = 0; x < workW; x++) {
      if (binary[y * workW + x]) {
        rowSums[y]++
        colSums[x]++
      }
    }
  }

  // Find content extent: rows/cols with significant pixel density
  const rowThresh = Math.max(3, workW * 0.005)
  const colThresh = Math.max(3, workH * 0.005)

  let top = 0, bottom = workH - 1, left = 0, right = workW - 1
  while (top < workH && rowSums[top] < rowThresh) top++
  while (bottom > top && rowSums[bottom] < rowThresh) bottom--
  while (left < workW && colSums[left] < colThresh) left++
  while (right > left && colSums[right] < colThresh) right--

  // Add a small margin (3% of dimension)
  const marginX = Math.round(workW * 0.03)
  const marginY = Math.round(workH * 0.03)
  top = Math.max(0, top - marginY)
  bottom = Math.min(workH - 1, bottom + marginY)
  left = Math.max(0, left - marginX)
  right = Math.min(workW - 1, right + marginX)

  // Scale back to original image coordinates
  const scaleX = img.width / workW
  const scaleY = img.height / workH

  return {
    x: Math.round(left * scaleX),
    y: Math.round(top * scaleY),
    width: Math.round((right - left + 1) * scaleX),
    height: Math.round((bottom - top + 1) * scaleY),
  }
}

// ── Aligned canvas creation ────────────────────────────────

function createAlignedCanvas(
  img: HTMLImageElement,
  contentBounds: Rect,
  canvasW: number,
  canvasH: number,
): { canvas: HTMLCanvasElement; contentOnCanvas: Rect } {
  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  // Fill background white
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Available area for content (with padding)
  const availW = canvasW - CONTENT_PADDING * 2
  const availH = canvasH - CONTENT_PADDING * 2

  // Scale to fit content within available area, maintaining aspect ratio
  const contentAspect = contentBounds.width / contentBounds.height
  const availAspect = availW / availH

  let drawW: number, drawH: number
  if (contentAspect > availAspect) {
    drawW = availW
    drawH = availW / contentAspect
  } else {
    drawH = availH
    drawW = availH * contentAspect
  }

  // Center within available area
  let drawX = CONTENT_PADDING + (availW - drawW) / 2
  let drawY = CONTENT_PADDING + (availH - drawH) / 2

  // Snap to nearest grid line
  drawX = Math.round(drawX / GRID_SIZE) * GRID_SIZE
  drawY = Math.round(drawY / GRID_SIZE) * GRID_SIZE

  // Also snap the width/height to grid so the bottom-right corner aligns too
  drawW = Math.round(drawW / GRID_SIZE) * GRID_SIZE
  drawH = Math.round(drawH / GRID_SIZE) * GRID_SIZE

  // Ensure we don't exceed canvas
  if (drawX + drawW > canvasW) drawW = canvasW - drawX
  if (drawY + drawH > canvasH) drawH = canvasH - drawY

  // Draw the content region of the image, mapped to the aligned area
  ctx.drawImage(
    img,
    contentBounds.x, contentBounds.y, contentBounds.width, contentBounds.height,
    drawX, drawY, drawW, drawH,
  )

  return {
    canvas,
    contentOnCanvas: { x: drawX, y: drawY, width: drawW, height: drawH },
  }
}

// ── Canvas to grayscale ────────────────────────────────────

function canvasToGrayscale(
  canvas: HTMLCanvasElement,
): { gray: Uint8Array; w: number; h: number } {
  const w = canvas.width
  const h = canvas.height
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  const len = w * h
  const gray = new Uint8Array(len)

  for (let i = 0; i < len; i++) {
    const off = i * 4
    gray[i] = Math.round(data[off] * 0.299 + data[off + 1] * 0.587 + data[off + 2] * 0.114)
  }
  return { gray, w, h }
}

// ── Canvas to blob URL ─────────────────────────────────────

function canvasToBlobUrl(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(URL.createObjectURL(blob))
        else reject(new Error('Failed to create blob from canvas'))
      },
      'image/png',
    )
  })
}

// ── Thresholding ───────────────────────────────────────────

function otsuThreshold(gray: Uint8Array): number {
  const hist = new Uint32Array(256)
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++

  const total = gray.length
  let sumAll = 0
  for (let i = 0; i < 256; i++) sumAll += i * hist[i]

  let sumBg = 0
  let wBg = 0
  let best = 0
  let bestThresh = 0

  for (let t = 0; t < 256; t++) {
    wBg += hist[t]
    if (wBg === 0) continue
    const wFg = total - wBg
    if (wFg === 0) break
    sumBg += t * hist[t]
    const meanBg = sumBg / wBg
    const meanFg = (sumAll - sumBg) / wFg
    const variance = wBg * wFg * (meanBg - meanFg) ** 2
    if (variance > best) {
      best = variance
      bestThresh = t
    }
  }
  return bestThresh
}

function binarize(gray: Uint8Array, w: number, h: number, threshold: number): Uint8Array {
  const binary = new Uint8Array(w * h)
  for (let i = 0; i < gray.length; i++) {
    binary[i] = gray[i] < threshold ? 1 : 0
  }

  // If more than 50% is "wall" pixels, image is likely inverted (blueprint)
  let wallCount = 0
  for (let i = 0; i < binary.length; i++) wallCount += binary[i]
  if (wallCount > binary.length * 0.5) {
    for (let i = 0; i < binary.length; i++) binary[i] = 1 - binary[i]
  }

  return binary
}

// ── Morphological operations ───────────────────────────────

function morphClose(binary: Uint8Array, w: number, h: number, kernelSize: number) {
  const temp = new Uint8Array(binary.length)
  dilate(binary, temp, w, h, kernelSize)
  erode(temp, binary, w, h, kernelSize)
}

function morphOpen(binary: Uint8Array, w: number, h: number, kernelSize: number) {
  const temp = new Uint8Array(binary.length)
  erode(binary, temp, w, h, kernelSize)
  dilate(temp, binary, w, h, kernelSize)
}

function dilate(src: Uint8Array, dst: Uint8Array, w: number, h: number, k: number) {
  const r = Math.floor(k / 2)
  dst.fill(0)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let found = false
      for (let dy = -r; dy <= r && !found; dy++) {
        for (let dx = -r; dx <= r && !found; dx++) {
          const ny = y + dy, nx = x + dx
          if (ny >= 0 && ny < h && nx >= 0 && nx < w && src[ny * w + nx]) found = true
        }
      }
      if (found) dst[y * w + x] = 1
    }
  }
}

function erode(src: Uint8Array, dst: Uint8Array, w: number, h: number, k: number) {
  const r = Math.floor(k / 2)
  dst.fill(0)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let allSet = true
      for (let dy = -r; dy <= r && allSet; dy++) {
        for (let dx = -r; dx <= r && allSet; dx++) {
          const ny = y + dy, nx = x + dx
          if (ny < 0 || ny >= h || nx < 0 || nx >= w || !src[ny * w + nx]) allSet = false
        }
      }
      if (allSet) dst[y * w + x] = 1
    }
  }
}

// ── Run detection ──────────────────────────────────────────

function findHorizontalRuns(binary: Uint8Array, w: number, h: number, minLen: number): Run[] {
  const runs: Run[] = []
  for (let y = 0; y < h; y++) {
    let runStart = -1
    for (let x = 0; x <= w; x++) {
      const isWall = x < w && binary[y * w + x] === 1
      if (isWall && runStart === -1) {
        runStart = x
      } else if (!isWall && runStart !== -1) {
        if (x - runStart >= minLen) {
          runs.push({ start: runStart, end: x, pos: y })
        }
        runStart = -1
      }
    }
  }
  return runs
}

function findVerticalRuns(binary: Uint8Array, w: number, h: number, minLen: number): Run[] {
  const runs: Run[] = []
  for (let x = 0; x < w; x++) {
    let runStart = -1
    for (let y = 0; y <= h; y++) {
      const isWall = y < h && binary[y * w + x] === 1
      if (isWall && runStart === -1) {
        runStart = y
      } else if (!isWall && runStart !== -1) {
        if (y - runStart >= minLen) {
          runs.push({ start: runStart, end: y, pos: x })
        }
        runStart = -1
      }
    }
  }
  return runs
}

// ── Clustering runs into line segments ─────────────────────

function clusterRuns(runs: Run[], maxThickness: number): LineSegment[] {
  if (runs.length === 0) return []

  const sorted = [...runs].sort((a, b) => a.pos - b.pos || a.start - b.start)
  const used = new Set<number>()
  const lines: LineSegment[] = []

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue

    const cluster = [sorted[i]]
    used.add(i)

    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue
      const run = sorted[j]

      const lastInCluster = cluster[cluster.length - 1]
      if (run.pos - lastInCluster.pos > maxThickness) break

      const minPos = cluster[0].pos
      if (run.pos - minPos > maxThickness) continue

      const clusterStart = Math.min(...cluster.map(r => r.start))
      const clusterEnd = Math.max(...cluster.map(r => r.end))
      const overlapStart = Math.max(run.start, clusterStart)
      const overlapEnd = Math.min(run.end, clusterEnd)
      if (overlapEnd - overlapStart > (run.end - run.start) * 0.3) {
        cluster.push(run)
        used.add(j)
      }
    }

    const positions = cluster.map(r => r.pos)
    const center = Math.round((Math.min(...positions) + Math.max(...positions)) / 2)
    const start = Math.min(...cluster.map(r => r.start))
    const end = Math.max(...cluster.map(r => r.end))
    const thickness = Math.max(...positions) - Math.min(...positions) + 1

    lines.push({ orientation: 'h', start, end, center, thickness })
  }

  return lines
}

// ── Build nodes and walls from classified H/V lines ────────

function buildFloorPlanFromLines(
  hLines: LineSegment[],
  vLines: LineSegment[],
  snapRadius: number,
): { nodes: Record<string, WallNode>; walls: Record<string, WallSegment> } {
  const nodeMap: NodeInfo[] = []

  function findOrCreateNode(x: number, y: number): number {
    for (let i = 0; i < nodeMap.length; i++) {
      if (Math.hypot(nodeMap[i].x - x, nodeMap[i].y - y) < snapRadius) return i
    }
    nodeMap.push({ id: nanoid(), x: Math.round(x), y: Math.round(y) })
    return nodeMap.length - 1
  }

  interface RawSeg { x1: number; y1: number; x2: number; y2: number }
  const rawSegments: RawSeg[] = []

  for (const l of hLines) {
    rawSegments.push({ x1: l.start, y1: l.center, x2: l.end, y2: l.center })
  }
  for (const l of vLines) {
    rawSegments.push({ x1: l.center, y1: l.start, x2: l.center, y2: l.end })
  }

  // Find intersections between H and V lines → split segments at crossings
  interface SplitPoint { seg: number; t: number; x: number; y: number }
  const splits: SplitPoint[] = []

  for (let hi = 0; hi < hLines.length; hi++) {
    const hl = hLines[hi]
    for (const vl of vLines) {
      const tolerance = snapRadius
      if (
        vl.center >= hl.start - tolerance && vl.center <= hl.end + tolerance &&
        hl.center >= vl.start - tolerance && hl.center <= vl.end + tolerance
      ) {
        const t = (vl.center - hl.start) / (hl.end - hl.start)
        splits.push({ seg: hi, t, x: vl.center, y: hl.center })
      }
    }
  }

  for (let vi = 0; vi < vLines.length; vi++) {
    const vl = vLines[vi]
    for (const hl of hLines) {
      const tolerance = snapRadius
      if (
        vl.center >= hl.start - tolerance && vl.center <= hl.end + tolerance &&
        hl.center >= vl.start - tolerance && hl.center <= vl.end + tolerance
      ) {
        const t = (hl.center - vl.start) / (vl.end - vl.start)
        splits.push({ seg: hLines.length + vi, t, x: vl.center, y: hl.center })
      }
    }
  }

  const segSplits = new Map<number, SplitPoint[]>()
  for (const sp of splits) {
    if (!segSplits.has(sp.seg)) segSplits.set(sp.seg, [])
    segSplits.get(sp.seg)!.push(sp)
  }

  const nodes: Record<string, WallNode> = {}
  const walls: Record<string, WallSegment> = {}

  for (let si = 0; si < rawSegments.length; si++) {
    const seg = rawSegments[si]
    const spl = segSplits.get(si) || []
    spl.sort((a, b) => a.t - b.t)

    const pts: { x: number; y: number }[] = [
      { x: seg.x1, y: seg.y1 },
      ...spl.map(s => ({ x: s.x, y: s.y })),
      { x: seg.x2, y: seg.y2 },
    ]

    const uniquePts: { x: number; y: number }[] = [pts[0]]
    for (let i = 1; i < pts.length; i++) {
      const prev = uniquePts[uniquePts.length - 1]
      if (Math.hypot(pts[i].x - prev.x, pts[i].y - prev.y) > snapRadius * 0.5) {
        uniquePts.push(pts[i])
      }
    }

    for (let i = 0; i < uniquePts.length - 1; i++) {
      const p1 = uniquePts[i]
      const p2 = uniquePts[i + 1]
      if (Math.hypot(p2.x - p1.x, p2.y - p1.y) < snapRadius) continue

      const ni1 = findOrCreateNode(p1.x, p1.y)
      const ni2 = findOrCreateNode(p2.x, p2.y)
      if (ni1 === ni2) continue

      const n1 = nodeMap[ni1]
      const n2 = nodeMap[ni2]

      const wallKey = [n1.id, n2.id].sort().join('__')
      if (walls[wallKey]) continue

      const wallId = nanoid()
      walls[wallId] = {
        id: wallId,
        startNodeId: n1.id,
        endNodeId: n2.id,
        thickness: DEFAULT_WALL_THICKNESS,
        height: DEFAULT_WALL_HEIGHT,
        materialId: 'wall-white',
        openings: [],
      }
    }
  }

  for (const n of nodeMap) {
    const isUsed = Object.values(walls).some(
      w => w.startNodeId === n.id || w.endNodeId === n.id,
    )
    if (isUsed) {
      nodes[n.id] = { id: n.id, position: { x: n.x, y: n.y } }
    }
  }

  return { nodes, walls }
}

// ── Grid snapping ──────────────────────────────────────────

function snapNodesToGrid(nodes: Record<string, WallNode>, gridSize: number) {
  for (const node of Object.values(nodes)) {
    node.position.x = Math.round(node.position.x / gridSize) * gridSize
    node.position.y = Math.round(node.position.y / gridSize) * gridSize
  }
}

// ── Scale estimation ───────────────────────────────────────

function estimateScale(
  nodes: Record<string, WallNode>,
  contentRect: Rect,
): number {
  const positions = Object.values(nodes).map(n => n.position)
  if (positions.length < 2) {
    // Fallback: assume content longest dimension = 10m
    return Math.max(contentRect.width, contentRect.height) / 10
  }

  // Bounding box of all detected wall nodes
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const p of positions) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }

  const bboxW = maxX - minX
  const bboxH = maxY - minY
  const longerPx = Math.max(bboxW, bboxH)

  if (longerPx < 50) {
    return Math.max(contentRect.width, contentRect.height) / 10
  }

  // Count unique wall node pairs as a proxy for floor plan complexity
  const nodeCount = positions.length

  // Heuristic: estimate the real-world longest dimension based on complexity
  //  Few nodes (simple plan):    ~6-8m
  //  Medium nodes:               ~10-12m
  //  Many nodes (complex plan):  ~14-18m
  let estimatedLongerM: number
  if (nodeCount <= 6) {
    estimatedLongerM = 7
  } else if (nodeCount <= 12) {
    estimatedLongerM = 10
  } else if (nodeCount <= 20) {
    estimatedLongerM = 13
  } else {
    estimatedLongerM = 16
  }

  return longerPx / estimatedLongerM
}
