import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { betaDataExport } from '../core/beta'

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function BetaFeedback() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState('4')
  const [category, setCategory] = useState('体验感受')
  const [message, setMessage] = useState('')
  const [understanding, setUnderstanding] = useState('yes')
  const [memorableCharacter, setMemorableCharacter] = useState('shendu')
  const [moreAppealing, setMoreAppealing] = useState('yes')
  const [saveLoss, setSaveLoss] = useState('no')
  const [exported, setExported] = useState(false)
  const dialogRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const app = document.querySelector<HTMLElement>('.app')
    const trigger = triggerRef.current
    if (app) app.inert = true
    dialogRef.current?.focus()
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(
          'button, select, textarea, input, [href], [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => !element.hasAttribute('disabled'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', close)
    return () => {
      window.removeEventListener('keydown', close)
      if (app) app.inert = false
      trigger?.focus()
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        className="feedback-entry"
        onClick={() => setOpen(true)}
      >
        测试反馈
      </button>
      {open && createPortal(
        <div className="sheet" onClick={() => setOpen(false)}>
          <section
            ref={dialogRef}
            className="sheet-card feedback-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <span className="beta-kicker">封闭测试反馈</span>
            <img
              className="feedback-art"
              src={`${import.meta.env.BASE_URL}art/beta/feedback-v1.webp`}
              alt=""
              draggable={false}
            />
            <h2 id="feedback-title">这次回来，山谷感觉如何？</h2>
            <p className="hint">
              当前版本不上传任何内容。提交会下载一个 JSON
              文件，你可以检查后再发给测试邀请人。
            </p>
            <label>
              整体感受
              <select value={rating} onChange={(event) => setRating(event.target.value)}>
                <option value="5">5 · 很想继续回来</option>
                <option value="4">4 · 愿意继续使用</option>
                <option value="3">3 · 还需要打磨</option>
                <option value="2">2 · 有明显阻碍</option>
                <option value="1">1 · 暂时不想继续</option>
              </select>
            </label>
            <label>
              反馈类型
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option>体验感受</option>
                <option>看不懂规则</option>
                <option>角色与故事</option>
                <option>界面或无障碍</option>
                <option>错误或存档问题</option>
              </select>
            </label>
            <fieldset className="beta-survey">
              <legend>四道测试问题</legend>
              <label>
                你能说清金币、精力、房间与入住的大致关系吗？
                <select
                  value={understanding}
                  onChange={(event) => setUnderstanding(event.target.value)}
                >
                  <option value="yes">能</option>
                  <option value="partly">只能说清一部分</option>
                  <option value="no">还不能</option>
                </select>
              </label>
              <label>
                现在最记得住哪位角色？
                <select
                  value={memorableCharacter}
                  onChange={(event) => setMemorableCharacter(event.target.value)}
                >
                  <option value="shendu">沈渡</option>
                  <option value="guwan">顾晚</option>
                  <option value="taotao">桃桃</option>
                  <option value="other">其他角色</option>
                  <option value="none">暂时没有</option>
                </select>
              </label>
              <label>
                相比普通待办应用，角色和山谷会让你更想回来吗？
                <select
                  value={moreAppealing}
                  onChange={(event) => setMoreAppealing(event.target.value)}
                >
                  <option value="yes">会</option>
                  <option value="same">差不多</option>
                  <option value="no">不会</option>
                </select>
              </label>
              <label>
                本次是否发生过无法恢复的存档丢失？
                <select
                  value={saveLoss}
                  onChange={(event) => setSaveLoss(event.target.value)}
                >
                  <option value="no">没有</option>
                  <option value="yes">有</option>
                </select>
              </label>
            </fieldset>
            <label>
              想告诉我们的事
              <textarea
                value={message}
                maxLength={1200}
                rows={6}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="哪些地方让你想继续？哪里让你停住了？"
              />
            </label>
            <small className="field-count">{message.length}/1200</small>
            {exported && (
              <p className="feedback-success" role="status">
                反馈文件已下载；内容仍由你决定是否分享。
              </p>
            )}
            <div className="actions">
              <button
                className="btn"
                onClick={() => {
                  downloadJson(
                    `productivity-valley-feedback-${new Date()
                      .toISOString()
                      .slice(0, 10)}.json`,
                    {
                      format: 'productivity-valley-feedback-v1',
                      createdAt: new Date().toISOString(),
                      rating: Number(rating),
                      category,
                      understanding,
                      memorableCharacter,
                      moreAppealing,
                      seriousSaveLoss: saveLoss === 'yes',
                      message,
                      anonymousProductData: betaDataExport(),
                    },
                  )
                  setExported(true)
                }}
              >
                下载反馈文件
              </button>
              <button className="btn secondary" onClick={() => setOpen(false)}>
                关闭
              </button>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  )
}
