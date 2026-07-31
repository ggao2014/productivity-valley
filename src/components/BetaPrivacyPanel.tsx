import { useState } from 'react'
import {
  betaDataExport,
  loadBetaEvents,
  loadBetaPreferences,
  setAnalyticsEnabled,
} from '../core/beta'

function downloadAnonymousData() {
  const blob = new Blob([JSON.stringify(betaDataExport(), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'productivity-valley-anonymous-data.json'
  link.click()
  URL.revokeObjectURL(url)
}

export function BetaPrivacyPanel() {
  const [enabled, setEnabled] = useState(
    () => loadBetaPreferences().analyticsEnabled,
  )
  const [eventCount, setEventCount] = useState(() => loadBetaEvents().length)

  return (
    <section className="beta-privacy" aria-labelledby="privacy-title">
      <h2 className="section-title" id="privacy-title">
        测试与隐私
      </h2>
      <label className="privacy-toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => {
            const next = event.target.checked
            setAnalyticsEnabled(next)
            setEnabled(next)
            setEventCount(loadBetaEvents().length)
          }}
        />
        <span>
          <strong>记录匿名产品事件</strong>
          <small>默认关闭；数据只留在此设备，关闭时立即清空。</small>
        </span>
      </label>
      <p className="hint">
        只记录首次完成、核心循环、关系阶段、购房和第 1/7
        日返回。绝不记录待办标题、对话内容、姓名、邮箱、设备标识或网络地址。
      </p>
      <p className="muted">当前本机记录：{eventCount} 条</p>
      <div className="actions">
        <button
          className="btn secondary"
          disabled={!enabled || eventCount === 0}
          onClick={downloadAnonymousData}
        >
          检查并导出匿名数据
        </button>
      </div>
    </section>
  )
}
