import { useEffect, useMemo, useState } from 'react'
import {
  DAY_PREVIEW_NOTE_MAX,
  DAY_PREVIEW_TONES,
  DAY_PREVIEW_TONE_LABELS,
  WEEKDAY_LABELS,
  buildMonthGrid,
  dayPreviewLabel,
  monthTitle,
  shiftMonth,
} from '../core/dayPreview'
import { localDayKey } from '../core/economy'
import { useGameStore } from '../core/gameStore'
import type { DayPreviewTone } from '../core/types'

export function PreviewCalendar() {
  const todayKey = localDayKey()
  const today = new Date(`${todayKey}T12:00:00`)
  const dayPreviews = useGameStore((s) => s.dayPreviews)
  const setDayPreview = useGameStore((s) => s.setDayPreview)
  const clearDayPreviewMark = useGameStore((s) => s.clearDayPreviewMark)

  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  })
  const [selectedKey, setSelectedKey] = useState(todayKey)
  const selected = dayPreviews[selectedKey]
  const [note, setNote] = useState(selected?.note ?? '')
  const [tone, setTone] = useState<DayPreviewTone | null>(selected?.tone ?? null)

  useEffect(() => {
    const current = dayPreviews[selectedKey]
    setNote(current?.note ?? '')
    setTone(current?.tone ?? null)
  }, [dayPreviews, selectedKey])

  const cells = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month, todayKey),
    [cursor.month, cursor.year, todayKey],
  )

  const markedCount = Object.keys(dayPreviews).length

  function jumpToToday() {
    setCursor({ year: today.getFullYear(), month: today.getMonth() + 1 })
    setSelectedKey(todayKey)
  }

  function savePreview() {
    setDayPreview(selectedKey, note, tone)
  }

  function clearSelected() {
    setNote('')
    setTone(null)
    clearDayPreviewMark(selectedKey)
  }

  return (
    <section className="preview-calendar" aria-label="预览小日历">
      <header className="preview-calendar-head">
        <div>
          <h2>小日历</h2>
          <p>随手标一标这周长什么样，不必挂到待办上。</p>
        </div>
        <span>{markedCount ? `已标 ${markedCount} 天` : '还没记号'}</span>
      </header>

      <div className="preview-calendar-nav">
        <button
          type="button"
          className="icon-button"
          aria-label="上个月"
          onClick={() => setCursor((value) => shiftMonth(value.year, value.month, -1))}
        >
          ‹
        </button>
        <strong>{monthTitle(cursor.year, cursor.month)}</strong>
        <button
          type="button"
          className="icon-button"
          aria-label="下个月"
          onClick={() => setCursor((value) => shiftMonth(value.year, value.month, 1))}
        >
          ›
        </button>
        <button type="button" className="quiet-today" onClick={jumpToToday}>
          今天
        </button>
      </div>

      <div className="preview-calendar-weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="preview-calendar-grid" role="grid" aria-label={monthTitle(cursor.year, cursor.month)}>
        {cells.map((cell) => {
          if (cell.kind === 'pad') {
            return <span key={cell.key} className="preview-day is-pad" />
          }
          const mark = dayPreviews[cell.dayKey]
          const selected = cell.dayKey === selectedKey
          return (
            <button
              key={cell.key}
              type="button"
              role="gridcell"
              className={`preview-day${cell.isToday ? ' is-today' : ''}${selected ? ' is-selected' : ''}${mark ? ' has-mark' : ''}`}
              data-day={cell.dayKey}
              data-tone={mark?.tone}
              aria-label={`${cell.dayKey}${mark?.note ? `，${mark.note}` : ''}`}
              aria-pressed={selected}
              onClick={() => setSelectedKey(cell.dayKey)}
            >
              <b>{cell.day}</b>
              {mark?.tone ? <i data-tone={mark.tone} /> : mark ? <i /> : null}
            </button>
          )
        })}
      </div>

      <div className="preview-day-editor">
        <div className="preview-day-editor-head">
          <strong>{dayPreviewLabel(selectedKey)}</strong>
          <span>{selectedKey}</span>
        </div>
        <label className="preview-note-field">
          这一天想怎样
          <input
            value={note}
            maxLength={DAY_PREVIEW_NOTE_MAX}
            placeholder="比如：写材料 / 出门 / 轻一点"
            aria-label="日预览备注"
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <div className="preview-tone-row" role="group" aria-label="日子气氛">
          {DAY_PREVIEW_TONES.map((value) => (
            <button
              key={value}
              type="button"
              className={tone === value ? 'active' : ''}
              data-tone={value}
              aria-pressed={tone === value}
              onClick={() => setTone((current) => (current === value ? null : value))}
            >
              {DAY_PREVIEW_TONE_LABELS[value]}
            </button>
          ))}
        </div>
        <div className="preview-day-actions">
          <button type="button" className="btn" onClick={savePreview}>
            记下
          </button>
          {(selected || note || tone) && (
            <button type="button" className="quiet-remove" onClick={clearSelected}>
              清空这天
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
