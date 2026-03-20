import { useState, useEffect, useCallback } from 'react'

export function usePointerLock(element?: HTMLElement | null) {
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    const onLockChange = () => {
      setIsLocked(document.pointerLockElement != null)
    }
    document.addEventListener('pointerlockchange', onLockChange)
    return () => document.removeEventListener('pointerlockchange', onLockChange)
  }, [])

  const requestLock = useCallback(() => {
    const target = element ?? document.body
    target.requestPointerLock()
  }, [element])

  const exitLock = useCallback(() => {
    document.exitPointerLock()
  }, [])

  return { isLocked, requestLock, exitLock }
}
