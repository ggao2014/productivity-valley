import { useState } from 'react'
import { TASK_REWARDS } from '../core/constants'
import {
  activeDayStreak,
  taskCompletedOn,
  todayTaskProgress,
} from '../core/economy'
import { useGameStore } from '../core/gameStore'
import type { Difficulty } from '../core/types'
import { GameIcon } from '../assets/icons/GameIcon'
import { EmptyState } from './EmptyState'

export function TasksPanel() {
  const tasks = useGameStore((s) => s.tasks)
  const addTask = useGameStore((s) => s.addTask)
  const editTask = useGameStore((s) => s.editTask)
  const completeTask = useGameStore((s) => s.completeTask)
  const undoCompleteTask = useGameStore((s) => s.undoCompleteTask)
  const deleteTask = useGameStore((s) => s.deleteTask)
  const onboardingStep = useGameStore((s) => s.onboardingStep)
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('small')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>('small')

  const open = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done).slice(0, 8)
  const today = todayTaskProgress(tasks)
  const streak = activeDayStreak(tasks)

  function beginEdit(task: (typeof tasks)[number]) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDifficulty(task.difficulty)
  }

  function finishEdit() {
    if (!editingId || !editTitle.trim()) return
    editTask(editingId, editTitle, editDifficulty)
    setEditingId(null)
  }

  return (
    <div className="panel">
      <section className="today-progress" aria-labelledby="today-progress-title">
        <div className="today-progress-heading">
          <div>
            <span>今天的脚印</span>
            <h2 id="today-progress-title">
              {today.completed > 0 ? '山谷记得你的努力' : '从一件小事开始'}
            </h2>
          </div>
          <strong aria-label={`连续活跃 ${streak} 天`}>{streak} 天连续</strong>
        </div>
        <div className="today-progress-meters">
          <div>
            <span><GameIcon name="check" />完成</span>
            <b>{today.completed}</b>
            <small>件</small>
          </div>
          <div>
            <span><GameIcon name="coin" />金币</span>
            <b>+{today.coins}</b>
          </div>
          <div>
            <span><GameIcon name="energy" />精力</span>
            <b>+{today.bond}</b>
          </div>
        </div>
      </section>

      <h2 className="section-title">待办</h2>
      <p className="hint task-hint">做完可得金币和精力</p>

      <div className="list">
        {open.length === 0 && (
          <EmptyState
            image="art/empty-states/tasks-empty-v1.webp"
            title="纸页还空着"
            detail="写下一件想完成的小事，山谷会从这里开始回应。"
          />
        )}
        {open.map((t) => (
          <div
            key={t.id}
            className={`row task-row${onboardingStep === 2 ? ' guide-target' : ''}`}
          >
            {editingId === t.id ? (
              <form
                className="task-edit-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  finishEdit()
                }}
              >
                <input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  aria-label="编辑待办标题"
                  autoFocus
                />
                <select
                  value={editDifficulty}
                  onChange={(event) =>
                    setEditDifficulty(event.target.value as Difficulty)
                  }
                  aria-label="编辑难度"
                >
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
                <button className="btn" type="submit">
                  保存
                </button>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => setEditingId(null)}
                >
                  取消
                </button>
              </form>
            ) : (
              <>
                <div className="row-main">
                  <strong>{t.title}</strong>
                  <span className="muted">
                    {TASK_REWARDS[t.difficulty].label} · +
                    {TASK_REWARDS[t.difficulty].coins} 金币 · +
                    {TASK_REWARDS[t.difficulty].bond} 精力
                  </span>
                </div>
                <div className="task-actions">
                  <button className="btn" onClick={() => completeTask(t.id)}>
                    <GameIcon name="check" />完成
                  </button>
                  <button className="btn secondary" onClick={() => beginEdit(t)}>
                    <GameIcon name="edit" />编辑
                  </button>
                  <button className="btn danger" onClick={() => deleteTask(t.id)}>
                    <GameIcon name="trash" />删除
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <form
        className={`composer${onboardingStep === 1 ? ' guide-target' : ''}`}
        onSubmit={(e) => {
          e.preventDefault()
          addTask(title, difficulty)
          setTitle('')
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="写点什么…"
          aria-label="待办标题"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          aria-label="难度"
        >
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
        </select>
        <button className="btn" type="submit">
          <GameIcon name="plus" />添加
        </button>
      </form>

      {done.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: 22 }}>
            已完成
          </h2>
          <div className="list">
            {done.map((t) => (
              <div key={t.id} className="row done task-row">
                <div className="row-main">
                  <strong>{t.title}</strong>
                  <span className="muted">
                    {taskCompletedOn(t) ? '今天完成' : '已经完成'}
                    {t.awardedCoins !== undefined && ` · +${t.awardedCoins} 金币`}
                    {t.awardedBond !== undefined && ` · +${t.awardedBond} 精力`}
                  </span>
                </div>
                {taskCompletedOn(t) && (
                  <button
                    className="btn secondary"
                    onClick={() => undoCompleteTask(t.id)}
                  >
                    <GameIcon name="undo" />撤销
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
