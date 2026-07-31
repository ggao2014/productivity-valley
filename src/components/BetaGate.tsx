import { useEffect, useState, type ReactNode } from 'react'
import {
  grantBetaAccess,
  hasExistingProgress,
  loadBetaPreferences,
} from '../core/beta'

export function BetaGate({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(
    () => hasExistingProgress() || loadBetaPreferences().accessGranted,
  )
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const invite = new URLSearchParams(window.location.search).get('invite')
    if (invite && grantBetaAccess(invite)) {
      setAllowed(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  if (allowed) return children

  return (
    <main className="beta-gate">
      <div className="beta-gate-card">
        <img
          className="beta-cover"
          src={`${import.meta.env.BASE_URL}art/beta/beta-cover-v1.webp`}
          alt="溪流、山谷小屋、待办本与两杯茶"
        />
        <div className="beta-gate-copy">
        <span className="beta-kicker">v0.9 · 封闭测试</span>
        <h1>山谷正在邀请少量旅人</h1>
        <p>
          这是一份仍在生长的单机测试版。你的待办、关系和存档只保存在当前设备。
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (grantBetaAccess(code)) {
              setAllowed(true)
              setError('')
            } else {
              setError('邀请码不对，请检查大小写或向邀请人确认。')
            }
          }}
        >
          <label htmlFor="invite-code">测试邀请码</label>
          <div>
            <input
              id="invite-code"
              value={code}
              autoComplete="one-time-code"
              onChange={(event) => setCode(event.target.value)}
              placeholder="例如 SHANGU-09"
            />
            <button className="btn" type="submit">
              进入山谷
            </button>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
        <small>
          邀请制只是控制测试范围，不是安全验证，也不会创建云端账号。
        </small>
        </div>
      </div>
    </main>
  )
}
