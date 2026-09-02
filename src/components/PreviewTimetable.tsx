import { useEffect, useState } from 'react'
import { GameIcon } from '../assets/icons/GameIcon'
import { TASK_CATEGORIES } from '../core/taskCategories'
import {
  TIMETABLE_HOURS,
  TIMETABLE_TITLE_MAX,
  TIMETABLE_WEEKDAYS,
  TIMETABLE_WEEKDAY_LABELS,
  formatTimetableHour,
  hourFromDate,
  timetableCellKey,
  timetableCellLabel,
  weekdayFromDate,
} from '../core/timetable'
import { useGameStore } from '../core/gameStore'
import type { TaskCategory, TimetableHour, TimetableWeekday } from '../core/types'

export function PreviewTimetable() {
  const timetable = useGameStore((s) => s.timetable)
  const setTimetableCell = useGameStore((s) => s.setTimetableCell)
  const clearTimetableMark = useGameStore((s) => s.clearTimetableMark)

  const [weekday, setWeekday] = useState<TimetableWeekday>(weekdayFromDate())
  const [hour, setHour] = useState<TimetableHour>(hourFromDate())
  const selected = timetable[timetableCellKey(weekday, hour)]
  const [title, setTitle] = useState(selected?.title ?? '')
  const [category, setCategory] = useState<TaskCategory>(
    selected?.category ?? 'errand',
  )

  useEffect(() => {
    const current = timetable[timetableCellKey(weekday, hour)]
    setTitle(current?.title ?? '')
    setCategory(current?.category ?? 'errand')
  }, [timetable, weekday, hour])

  function selectCell(nextWeekday: TimetableWeekday, nextHour: TimetableHour) {
    setWeekday(nextWeekday)
    setHour(nextHour)
  }

  function saveCell() {
    setTimetableCell(weekday, hour, title, category)
  }

  function clearSelected() {
    setTitle('')
    setCategory('errand')
    clearTimetableMark(weekday, hour)
  }

  return (
    <section className="preview-timetable" aria-label="预览时间表">
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
                    data-category={cell?.category}
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

      <div className="preview-day-editor">
        <div className="preview-day-editor-head">
          <strong>{timetableCellLabel(weekday, hour)}</strong>
        </div>
        <input
          className="preview-note-input"
          value={title}
          maxLength={TIMETABLE_TITLE_MAX}
          placeholder="写点什么"
          aria-label="时间表备注"
          onChange={(event) => setTitle(event.target.value)}
        />
        <div className="category-picker compact" role="group" aria-label="分类">
          {TASK_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={category === item.id ? 'active' : ''}
              data-category={item.id}
              title={item.label}
              aria-label={item.label}
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              <GameIcon name={item.icon} />
              <span className="category-tooltip" role="tooltip">
                {item.label}
              </span>
            </button>
          ))}
        </div>
        <div className="preview-day-actions">
          <button type="button" className="btn" onClick={saveCell}>
            记下
          </button>
          {(selected || title) && (
            <button type="button" className="quiet-remove" onClick={clearSelected}>
              清空这格
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
