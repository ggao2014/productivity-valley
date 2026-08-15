import { useEffect, useState } from 'react'
import { BagPanel } from './components/BagPanel'
import { TasksPanel } from './components/TasksPanel'
import { Toast } from './components/Toast'
import { NpcSheet, ValleyPanel } from './components/ValleyPanel'
import { RoomSheet } from './components/RoomSheet'
import { OnboardingGuide } from './components/OnboardingGuide'
import { RewardFeedback } from './components/RewardFeedback'
import { TaskReactionFeedback } from './components/TaskReactionFeedback'
import { EventSheet } from './components/EventSheet'
import { useGameStore, bootstrapGameStore } from './core/gameStore'
import { GameIcon } from './assets/icons/GameIcon'
import { BetaFeedback } from './components/BetaFeedback'
import { recordOpenAndReturns } from './core/beta'
import { PwaStatus } from './components/PwaStatus'
import { Handbook } from './components/Handbook'

bootstrapGameStore()

export default function App() {
  const [facility, setFacility] = useState<'handbook' | 'storehouse' | 'settings' | null>(null)
  const tab = useGameStore((s) => s.tab)
  const setTab = useGameStore((s) => s.setTab)
  const coins = useGameStore((s) => s.coins)
  const bond = useGameStore((s) => s.bond)
  const runDailyIfNeeded = useGameStore((s) => s.runDailyIfNeeded)
  const rewardFeedback = useGameStore((s) => s.rewardFeedback)
  const selectNpc = useGameStore((s) => s.selectNpc)
  const selectRoom = useGameStore((s) => s.selectRoom)
  const selectEvent = useGameStore((s) => s.selectEvent)
  const clearDialogue = useGameStore((s) => s.clearDialogue)

  useEffect(() => {
    recordOpenAndReturns()
    const id = window.setInterval(runDailyIfNeeded, 60_000)
    return () => window.clearInterval(id)
  }, [runDailyIfNeeded])

  useEffect(() => {
    const closeOverlay = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      clearDialogue()
      selectEvent(null)
      selectRoom(null)
      selectNpc(null)
      setFacility(null)
    }
    window.addEventListener('keydown', closeOverlay)
    return () => window.removeEventListener('keydown', closeOverlay)
  }, [clearDialogue, selectEvent, selectNpc, selectRoom])

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <header className="topbar">
        <h1 className="brand">山谷</h1>
        <div className={`meters${rewardFeedback ? ' is-rewarded' : ''}`}>
          <span className="coin-meter">
            <GameIcon name="coin" />
            金币 {coins}
          </span>
          <span className="bond-meter">
            <GameIcon name="energy" />
            精力 {bond}
          </span>
        </div>
        <BetaFeedback />
      </header>

      <main id="main-content" className="app-main" tabIndex={-1}>
        {tab === 'valley' && (
          <ValleyPanel
            onOpenHandbook={() => setFacility('handbook')}
            onOpenStorehouse={() => setFacility('storehouse')}
            onOpenDesk={() => setTab('tasks')}
          />
        )}
        {tab === 'tasks' && <TasksPanel onOpenSettings={() => setFacility('settings')} />}
      </main>

      <OnboardingGuide />
      <RewardFeedback />
      <TaskReactionFeedback />

      <nav className="tabbar" aria-label="主导航">
        <button
          className={tab === 'valley' ? 'active' : ''}
          aria-current={tab === 'valley' ? 'page' : undefined}
          onClick={() => setTab('valley')}
        >
          山谷
        </button>
        <button
          className={tab === 'tasks' ? 'active' : ''}
          aria-current={tab === 'tasks' ? 'page' : undefined}
          onClick={() => setTab('tasks')}
        >
          待办
        </button>
      </nav>

      <Toast />
      <RoomSheet />
      <NpcSheet />
      <EventSheet />
      <PwaStatus />
      <Handbook open={facility === 'handbook'} onClose={() => setFacility(null)} />
      {(facility === 'storehouse' || facility === 'settings') && (
        <div className="facility-overlay" onClick={() => setFacility(null)}>
          <section className="facility-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="handbook-close" onClick={() => setFacility(null)} aria-label="关闭">×</button>
            <BagPanel mode={facility} />
          </section>
        </div>
      )}
    </div>
  )
}
