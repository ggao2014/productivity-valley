import { useEffect, useState } from 'react'
import {
  TIMETABLE_HOURS,
  TIMETABLE_TITLE_MAX,
  TIMETABLE_TONES,
  TIMETABLE_TONE_LABELS,
  TIMETABLE_WEEKDAYS,
  TIMETABLE_WEEKDAY_LABELS,
  cellsForWeekday,
  formatTimetableHour,
  hourFromDate,
  markedTimetableCount,
  timetableCellKey,
  timetableCellLabel,
  weekdayFromDate,
} from '../core/timetable'
import { useGameStore } from '../core/gameStore'
import type { TimetableHour, TimetableTone, TimetableWeekday } from '../core/types'

type TimetableView = 'week' | 'day'

export function PreviewTimetable() {
  const timetable = useGameStore((s) => s.timetable)
  const setTimetableCell = useGameStore((s) => s.setTimetableCell)
  const clearTimetableMark = useGameStore((s) => s.clearTimetableMark)

  const [view, setView] = useState<TimetableView>('week')
  const [weekday, setWeekday] = useState<TimetableWeekday>(weekdayFromDate())
  const [hour, setHour] = useState<TimetableHour>(hourFromDate())
  const selected = timetable[timetableCellKey(weekday, hour)]
  const [title, setTitle] = useState(selected?.title ?? '')
  const [tone, setTone] = useState<TimetableTone | null>(selected?.tone ?? null)

  useEffect(() => {
    const current = timetable[timetableCellKey(weekday, hour)]
    setTitle(current?.title ?? '')
    setTone(current?.tone ?? null)
  }, [timetable, weekday, hour])

  const marked = markedTimetableCount(timetable)

  function selectCell(nextWeekday: TimetableWeekday, nextHour: TimetableHour) {
    setWeekday(nextWeekday)
    setHour(nextHour)
  }

  function saveCell() {
    setTimetableCell(weekday, hour, title, tone)
  }

  function clearSelected() {
    setTitle('')
    setTone(null)
    clearTimetableMark(weekday, hour)
  }

  return (
    <section className="preview-timetable" aria-label="预览时间表">
      <header className="preview-timetable-head">
        <div>
          <h2>时间表</h2>
          <p>按钟点排日和周，不必挂到待办，也不用管具体日期。</p>
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
        <div className="timetable-week-scroll">
          <div className="timetable-week" role="grid" aria-label="一周时间表">
            <div className="timetable-week-head" role="row">
              <span className="timetable-corner" />
              {TIMETABLE_WEEKDAYS.map((day) => (
                <span key={day} role="columnheader">
                  {TIMETABLE_WEEKDAY_LABELS[day]}
                </span>
              ))}
            </div>
            {TIMETABLE_HOURS.map((rowHour) => (
              <div key={rowHour} className="timetable-week-row" role="row">
                <span className="timetable-slot-label" role="rowheader">
                  {formatTimetableHour(rowHour)}
                </span>
                {TIMETABLE_WEEKDAYS.map((day) => {
                  const key = timetableCellKey(day, rowHour)
                  const cell = timetable[key]
                  const active = weekday === day && hour === rowHour
                  return (
                    <button
                      key={key}
                      type="button"
                      role="gridcell"
                      className={`timetable-cell${active ? ' is-selected' : ''}${cell ? ' has-mark' : ''}`}
                      data-cell={key}
                      data-tone={cell?.tone}
                      aria-label={`${timetableCellLabel(day, rowHour)}${cell?.title ? `，${cell.title}` : ''}`}
                      aria-pressed={active}
                      onClick={() => selectCell(day, rowHour)}
                    >
                      {cell?.title ? <b>{cell.title}</b> : null}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
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
          <div
            className="timetable-day-slots"
            aria-label={`周${TIMETABLE_WEEKDAY_LABELS[weekday]}`}
          >
            {cellsForWeekday(timetable, weekday).map(({ hour: rowHour, cell }) => {
              const active = hour === rowHour
              return (
                <button
                  key={rowHour}
                  type="button"
                  className={`timetable-day-slot${active ? ' is-selected' : ''}${cell ? ' has-mark' : ''}`}
                  data-cell={timetableCellKey(weekday, rowHour)}
                  data-tone={cell?.tone}
                  aria-pressed={active}
                  onClick={() => setHour(rowHour)}
                >
                  <span>{formatTimetableHour(rowHour)}</span>
                  <strong>{cell?.title || '空着'}</strong>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="preview-day-editor">
        <div className="preview-day-editor-head">
          <strong>{timetableCellLabel(weekday, hour)}</strong>
          <span>预览用</span>
        </div>
        <label className="preview-note-field">
          这一小时想怎样
          <input
            value={title}
            maxLength={TIMETABLE_TITLE_MAX}
            placeholder="比如：写材料 / 开会 / 散步"
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
