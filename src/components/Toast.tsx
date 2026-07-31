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
  const recovered = toast.includes('自动备份恢复')
  return (
    <div className={`toast${recovered ? ' is-recovery' : ''}`} role="status">
      {recovered && (
        <img
          src={`${import.meta.env.BASE_URL}art/beta/save-recovery-v1.webp`}
          alt=""
          draggable={false}
        />
      )}
      {toast}
    </div>
  )
}
