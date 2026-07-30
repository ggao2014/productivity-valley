import { useState } from 'react'
import { TASK_REWARDS } from '../core/constants'
import { useGameStore } from '../core/gameStore'
import type { Difficulty } from '../core/types'

export function TasksPanel() {
  const tasks = useGameStore((s) => s.tasks)
  const addTask = useGameStore((s) => s.addTask)
  const completeTask = useGameStore((s) => s.completeTask)
  const deleteTask = useGameStore((s) => s.deleteTask)
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('small')

  const open = tasks.filter((t) => !t.done)
  const done = tasks.filter((t) => t.done).slice(0, 8)

  return (
    <div className="panel">
      <h2 className="section-title">待办</h2>
      <p className="hint">做完可得金币和精力</p>

      <div className="list">
        {open.length === 0 && (
          <div className="row">
            <div className="row-main">
              <strong>还没有待办</strong>
              <span className="muted">写一件吧</span>
            </div>
          </div>
        )}
        {open.map((t) => (
          <div key={t.id} className="row">
            <div className="row-main">
              <strong>{t.title}</strong>
              <span className="muted">
                {TASK_REWARDS[t.difficulty].label} · +
                {TASK_REWARDS[t.difficulty].coins} 金币 · +
                {TASK_REWARDS[t.difficulty].bond} 精力
              </span>
            </div>
            <button className="btn" onClick={() => completeTask(t.id)}>
              完成
            </button>
            <button className="btn danger" onClick={() => deleteTask(t.id)}>
              删
            </button>
          </div>
        ))}
      </div>

      <form
        className="composer"
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
          添加
        </button>
      </form>

      {done.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: 22 }}>
            已完成
          </h2>
          <div className="list">
            {done.map((t) => (
              <div key={t.id} className="row done">
                <div className="row-main">
                  <strong>{t.title}</strong>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
