import { useEffect, useState } from 'react'
import {
  TIMETABLE_SLOTS,
  TIMETABLE_SLOT_LABELS,
  TIMETABLE_TITLE_MAX,
  TIMETABLE_TONES,
  TIMETABLE_TONE_LABELS,
  TIMETABLE_WEEKDAYS,
  TIMETABLE_WEEKDAY_LABELS,
  cellsForWeekday,
  markedTimetableCount,
  timetableCellKey,
  timetableCellLabel,
  weekdayFromDate,
} from '../core/timetable'
import { useGameStore } from '../core/gameStore'
import type { TimetableSlot, TimetableTone, TimetableWeekday } from '../core/types'

type TimetableView = 'week' | 'day'

export function PreviewTimetable() {
  const timetable = useGameStore((s) => s.timetable)
  const setTimetableCell = useGameStore((s) => s.setTimetableCell)
  const clearTimetableMark = useGameStore((s) => s.clearTimetableMark)

  const [view, setView] = useState<TimetableView>('week')
  const [weekday, setWeekday] = useState<TimetableWeekday>(weekdayFromDate())
  const [slot, setSlot] = useState<TimetableSlot>('morning')
  const selected = timetable[timetableCellKey(weekday, slot)]
  const [title, setTitle] = useState(selected?.title ?? '')
  const [tone, setTone] = useState<TimetableTone | null>(selected?.tone ?? null)

  useEffect(() => {
    const current = timetable[timetableCellKey(weekday, slot)]
    setTitle(current?.title ?? '')
    setTone(current?.tone ?? null)
  }, [timetable, weekday, slot])

  const marked = markedTimetableCount(timetable)

  function selectCell(nextWeekday: TimetableWeekday, nextSlot: TimetableSlot) {
    setWeekday(nextWeekday)
    setSlot(nextSlot)
  }

  function saveCell() {
    setTimetableCell(weekday, slot, title, tone)
  }

  function clearSelected() {
    setTitle('')
    setTone(null)
    clearTimetableMark(weekday, slot)
  }

  return (
    <section className="preview-timetable" aria-label="预览时间表">
      <header className="preview-timetable-head">
        <div>
          <h2>时间表</h2>
          <p>排一排日和周长什么样，不必挂到待办，也不用管具体日期。</p>
        </div>
        <span>{marked ? `已填 ${marked} 格` : '还没排'}</span>
      </header>

      <div className="preview-timetable-modes" role="tablist" aria-label="时间表视图">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'week'}
          className={view === 'week' ? 'active' : ''}
          onClick={() => setView('week')}
        >
          周
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'day'}
          className={view === 'day' ? 'active' : ''}
          onClick={() => setView('day')}
        >
          日
        </button>
      </div>

      {view === 'week' ? (
        <div className="timetable-week" role="grid" aria-label="一周时间表">
          <div className="timetable-week-head" role="row">
            <span className="timetable-corner" />
            {TIMETABLE_WEEKDAYS.map((day) => (
              <span key={day} role="columnheader">
                {TIMETABLE_WEEKDAY_LABELS[day]}
              </span>
            ))}
          </div>
          {TIMETABLE_SLOTS.map((rowSlot) => (
            <div key={rowSlot} className="timetable-week-row" role="row">
              <span className="timetable-slot-label" role="rowheader">
                {TIMETABLE_SLOT_LABELS[rowSlot]}
              </span>
              {TIMETABLE_WEEKDAYS.map((day) => {
                const key = timetableCellKey(day, rowSlot)
                const cell = timetable[key]
                const active = weekday === day && slot === rowSlot
                return (
                  <button
                    key={key}
                    type="button"
                    role="gridcell"
                    className={`timetable-cell${active ? ' is-selected' : ''}${cell ? ' has-mark' : ''}`}
                    data-cell={key}
                    data-tone={cell?.tone}
                    aria-label={`${timetableCellLabel(day, rowSlot)}${cell?.title ? `，${cell.title}` : ''}`}
                    aria-pressed={active}
                    onClick={() => selectCell(day, rowSlot)}
                  >
                    {cell?.title ? <b>{cell.title}</b> : <span>+</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="timetable-day">
          <div className="timetable-day-picker" role="group" aria-label="选择星期">
            {TIMETABLE_WEEKDAYS.map((day) => (
              <button
                key={day}
                type="button"
                className={weekday === day ? 'active' : ''}
                aria-pressed={weekday === day}
                onClick={() => setWeekday(day)}
              >
                {TIMETABLE_WEEKDAY_LABELS[day]}
              </button>
            ))}
          </div>
          <div className="timetable-day-slots" aria-label={`周${TIMETABLE_WEEKDAY_LABELS[weekday]}`}>
            {cellsForWeekday(timetable, weekday).map(({ slot: rowSlot, cell }) => {
              const active = slot === rowSlot
              return (
                <button
                  key={rowSlot}
                  type="button"
                  className={`timetable-day-slot${active ? ' is-selected' : ''}${cell ? ' has-mark' : ''}`}
                  data-cell={timetableCellKey(weekday, rowSlot)}
                  data-tone={cell?.tone}
                  aria-pressed={active}
                  onClick={() => setSlot(rowSlot)}
                >
                  <span>{TIMETABLE_SLOT_LABELS[rowSlot]}</span>
                  <strong>{cell?.title || '空着'}</strong>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="preview-day-editor">
        <div className="preview-day-editor-head">
          <strong>{timetableCellLabel(weekday, slot)}</strong>
          <span>预览用</span>
        </div>
        <label className="preview-note-field">
          这一段想怎样
          <input
            value={title}
            maxLength={TIMETABLE_TITLE_MAX}
            placeholder="比如：写材料 / 出门 / 轻一点"
            aria-label="时间表备注"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <div className="preview-tone-row" role="group" aria-label="时段气氛">
          {TIMETABLE_TONES.map((value) => (
            <button
              key={value}
              type="button"
              className={tone === value ? 'active' : ''}
              data-tone={value}
              aria-pressed={tone === value}
              onClick={() => setTone((current) => (current === value ? null : value))}
            >
              {TIMETABLE_TONE_LABELS[value]}
            </button>
          ))}
        </div>
        <div className="preview-day-actions">
          <button type="button" className="btn" onClick={saveCell}>
            记下
          </button>
          {(selected || title || tone) && (
            <button type="button" className="quiet-remove" onClick={clearSelected}>
              清空这格
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
