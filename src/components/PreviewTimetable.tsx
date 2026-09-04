import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { GameIcon } from '../assets/icons/GameIcon'
import { TASK_CATEGORIES } from '../core/taskCategories'
import {
  TIMETABLE_HOUR_END,
  TIMETABLE_HOUR_START,
  TIMETABLE_HOURS,
  TIMETABLE_TITLE_MAX,
  TIMETABLE_WEEKDAYS,
  TIMETABLE_WEEKDAY_LABELS,
  formatTimetableHour,
  hourFromDate,
  hoursInRange,
  isHourInRange,
  normalizeHourRange,
  parseTimetableCellKey,
  timetableCellKey,
  timetableRangeLabel,
  weekdayFromDate,
} from '../core/timetable'
import { useGameStore } from '../core/gameStore'
import type { TaskCategory, TimetableCell, TimetableHour, TimetableWeekday } from '../core/types'

type DragState = {
  pointerId: number
  weekday: TimetableWeekday
  anchorHour: TimetableHour
}

function sameMark(a?: TimetableCell, b?: TimetableCell) {
  return Boolean(a && b && a.title === b.title && a.category === b.category)
}

export function PreviewTimetable() {
  const timetable = useGameStore((s) => s.timetable)
  const setTimetableRange = useGameStore((s) => s.setTimetableRange)
  const clearTimetableRangeMarks = useGameStore((s) => s.clearTimetableRangeMarks)

  const [weekday, setWeekday] = useState<TimetableWeekday>(weekdayFromDate())
  const [startHour, setStartHour] = useState<TimetableHour>(hourFromDate())
  const [endHour, setEndHour] = useState<TimetableHour>(hourFromDate())
  const selectedHours = hoursInRange(startHour, endHour)
  const selectedMark = selectedHours
    .map((hour) => timetable[timetableCellKey(weekday, hour)])
    .find(Boolean)
  const [title, setTitle] = useState(selectedMark?.title ?? '')
  const [category, setCategory] = useState<TaskCategory>(
    selectedMark?.category ?? 'errand',
  )
  const gridRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const dragMovedRef = useRef(false)

  useEffect(() => {
    const current = hoursInRange(startHour, endHour)
      .map((hour) => timetable[timetableCellKey(weekday, hour)])
      .find(Boolean)
    setTitle(current?.title ?? '')
    setCategory(current?.category ?? 'errand')
  }, [timetable, weekday, startHour, endHour])

  function applySelection(
    nextWeekday: TimetableWeekday,
    nextStart: TimetableHour,
    nextEnd: TimetableHour,
  ) {
    const range = normalizeHourRange(nextStart, nextEnd)
    setWeekday(nextWeekday)
    setStartHour(range.startHour)
    setEndHour(range.endHour)
  }

  function cellFromPoint(clientX: number, clientY: number) {
    const el = document.elementFromPoint(clientX, clientY)
    const target = el?.closest?.('[data-cell]')
    if (!(target instanceof HTMLElement)) return null
    return parseTimetableCellKey(target.dataset.cell ?? '')
  }

  function handleGridPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const cell = cellFromPoint(event.clientX, event.clientY)
    if (!cell) return
    event.preventDefault()
    dragMovedRef.current = false
    gridRef.current?.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      weekday: cell.weekday,
      anchorHour: cell.hour,
    }
    applySelection(cell.weekday, cell.hour, cell.hour)
  }

  function handleGridPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const cell = cellFromPoint(event.clientX, event.clientY)
    if (!cell || cell.weekday !== drag.weekday) return
    if (cell.hour !== drag.anchorHour) dragMovedRef.current = true
    applySelection(drag.weekday, drag.anchorHour, cell.hour)
  }

  function handleGridPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    if (gridRef.current?.hasPointerCapture(event.pointerId)) {
      gridRef.current.releasePointerCapture(event.pointerId)
    }
  }

  function saveRange() {
    setTimetableRange(weekday, startHour, endHour, title, category)
  }

  function clearSelected() {
    setTitle('')
    setCategory('errand')
    clearTimetableRangeMarks(weekday, startHour, endHour)
  }

  const multiHour = startHour !== endHour
  const rangeHasMark = selectedHours.some(
    (hour) => timetable[timetableCellKey(weekday, hour)],
  )

  return (
    <section className="preview-timetable" aria-label="预览时间表">
      <div className="timetable-week-scroll">
        <div
          ref={gridRef}
          className="timetable-week"
          role="grid"
          aria-label="一周时间表"
          onPointerDown={handleGridPointerDown}
          onPointerMove={handleGridPointerMove}
          onPointerUp={handleGridPointerEnd}
          onPointerCancel={handleGridPointerEnd}
        >
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
                const active =
                  weekday === day && isHourInRange(rowHour, startHour, endHour)
                const prev =
                  rowHour > TIMETABLE_HOUR_START
                    ? timetable[timetableCellKey(day, rowHour - 1)]
                    : undefined
                const next =
                  rowHour < TIMETABLE_HOUR_END
                    ? timetable[timetableCellKey(day, rowHour + 1)]
                    : undefined
                const blockContinue = sameMark(cell, prev)
                const blockStart = Boolean(cell) && !blockContinue
                const blockEnd = Boolean(cell) && !sameMark(cell, next)
                return (
                  <button
                    key={key}
                    type="button"
                    role="gridcell"
                    className={`timetable-cell${active ? ' is-selected' : ''}${cell ? ' has-mark' : ''}${blockContinue ? ' is-block-continue' : ''}${blockStart ? ' is-block-start' : ''}${blockEnd ? ' is-block-end' : ''}`}
                    data-cell={key}
                    data-category={cell?.category}
                    aria-label={`${timetableRangeLabel(day, rowHour, rowHour)}${cell?.title ? `，${cell.title}` : ''}`}
                    aria-pressed={active}
                    onClick={(event) => {
                      if (dragMovedRef.current) {
                        dragMovedRef.current = false
                        event.preventDefault()
                        return
                      }
                      applySelection(day, rowHour, rowHour)
                    }}
                  >
                    {cell?.title && !blockContinue ? <b>{cell.title}</b> : null}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="preview-day-editor">
        <div className="preview-day-editor-head">
          <strong>{timetableRangeLabel(weekday, startHour, endHour)}</strong>
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
          <button type="button" className="btn" onClick={saveRange}>
            记下
          </button>
          {(rangeHasMark || title) && (
            <button type="button" className="quiet-remove" onClick={clearSelected}>
              {multiHour ? '清空所选' : '清空这格'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
