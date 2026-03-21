import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildWallAABBs, resolveCollisions } from '@/lib/geometry/collision'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { EYE_HEIGHT, WALK_SPEED, MOUSE_SENSITIVITY, COLLISION_RADIUS } from '@/lib/constants'

interface Props {
  isLocked: boolean
  startPosition?: [number, number, number]
}

export default function WalkthroughCamera({ isLocked, startPosition }: Props) {
  const { camera } = useThree()
  const floorPlan = useFloorPlanStore(s => s.floorPlan)

  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const keys = useRef<Record<string, boolean>>({})
  const aabbs = useRef(buildWallAABBs(floorPlan))

  // Set initial position
  useEffect(() => {
    if (startPosition) {
      camera.position.set(...startPosition)
      camera.position.y = EYE_HEIGHT
    } else {
      // Default: center of the scene
      camera.position.set(0, EYE_HEIGHT, 5)
    }
    camera.rotation.order = 'YXZ'
  }, [camera, startPosition])

  // Update AABBs when floor plan changes
  useEffect(() => {
    aabbs.current = buildWallAABBs(floorPlan)
  }, [floorPlan])

  // Mouse look
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked) return
      euler.current.y -= e.movementX * MOUSE_SENSITIVITY
      euler.current.x -= e.movementY * MOUSE_SENSITIVITY
      euler.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, euler.current.x))
    }
    document.addEventListener('mousemove', onMouseMove)
    return () => document.removeEventListener('mousemove', onMouseMove)
  }, [isLocked])

  // Key state
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { keys.current[e.code] = true }
    const onUp = (e: KeyboardEvent) => { keys.current[e.code] = false }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (!isLocked) return

    const k = keys.current
    const dir = new THREE.Vector3()

    if (k['KeyW'] || k['ArrowUp'])    dir.z -= 1
    if (k['KeyS'] || k['ArrowDown'])  dir.z += 1
    if (k['KeyA'] || k['ArrowLeft'])  dir.x -= 1
    if (k['KeyD'] || k['ArrowRight']) dir.x += 1

    if (dir.length() > 0) {
      dir.normalize()
      // Rotate movement direction by camera yaw only (stay horizontal)
      dir.applyEuler(new THREE.Euler(0, euler.current.y, 0))
      dir.y = 0

      // Direct frame-rate-independent movement (no velocity accumulation)
      const step = WALK_SPEED * delta
      const nextX = camera.position.x + dir.x * step
      const nextZ = camera.position.z + dir.z * step

      const resolved = resolveCollisions({ x: nextX, z: nextZ }, aabbs.current, COLLISION_RADIUS)
      camera.position.x = resolved.x
      camera.position.z = resolved.z
    }

    camera.position.y = EYE_HEIGHT
    camera.quaternion.setFromEuler(euler.current)
  })

  return null
}
