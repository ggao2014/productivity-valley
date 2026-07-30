import { useEffect } from 'react'
import { useGameStore } from '../core/gameStore'

export function Toast() {
  const toast = useGameStore((s) => s.toast)
  const clearToast = useGameStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(clearToast, 2800)
    return () => window.clearTimeout(t)
  }, [toast, clearToast])

  if (!toast) return null
  return (
    <div className="toast" role="status">
      {toast}
    </div>
  )
}
