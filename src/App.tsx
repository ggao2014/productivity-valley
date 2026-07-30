import { useEffect } from 'react'
import { BagPanel } from './components/BagPanel'
import { TasksPanel } from './components/TasksPanel'
import { Toast } from './components/Toast'
import { NpcSheet, ValleyPanel } from './components/ValleyPanel'
import { useGameStore } from './core/gameStore'

export default function App() {
  const tab = useGameStore((s) => s.tab)
  const setTab = useGameStore((s) => s.setTab)
  const coins = useGameStore((s) => s.coins)
  const bond = useGameStore((s) => s.bond)
  const hydrate = useGameStore((s) => s.hydrate)
  const runDailyIfNeeded = useGameStore((s) => s.runDailyIfNeeded)

  useEffect(() => {
    hydrate()
    const id = window.setInterval(runDailyIfNeeded, 60_000)
    return () => window.clearInterval(id)
  }, [hydrate, runDailyIfNeeded])

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="brand">山谷</h1>
        <div className="meters">
          <span>金币 {coins}</span>
          <span>心意 {bond}</span>
        </div>
      </header>

      {tab === 'valley' && <ValleyPanel />}
      {tab === 'tasks' && <TasksPanel />}
      {tab === 'bag' && <BagPanel />}

      <nav className="tabbar" aria-label="主导航">
        <button
          className={tab === 'valley' ? 'active' : ''}
          onClick={() => setTab('valley')}
        >
          山谷
        </button>
        <button
          className={tab === 'tasks' ? 'active' : ''}
          onClick={() => setTab('tasks')}
        >
          待办
        </button>
        <button
          className={tab === 'bag' ? 'active' : ''}
          onClick={() => setTab('bag')}
        >
          口袋
        </button>
      </nav>

      <Toast />
      <NpcSheet />
    </div>
  )
}
