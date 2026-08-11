import { useEffect, useMemo, useRef, useState } from 'react'
import { GameIcon } from '../assets/icons/GameIcon'
import { GiftIcon, type GiftIconName } from '../assets/icons/GiftIcon'
import {
  COURTYARD_LEVELS,
  DECORATION_DEFS,
  FRIENDSHIP_LABELS,
  GIFT_DEFS,
  ROMANCE_LABELS,
  ROOM_LEVEL_LABELS,
} from '../core/constants'
import { friendshipStage, romanceStage, roomName } from '../core/economy'
import { RELATIONSHIP_EVENTS } from '../core/events'
import {
  MILESTONES,
  VALLEY_STAGES,
  valleyGrowthPoints,
  valleyStage,
  weeklyProgress,
} from '../core/growth'
import { useGameStore } from '../core/gameStore'
import { NPC_DEFS } from '../core/npcs'
import {
  courtyardCapacityUsed,
  emptyBedCount,
} from '../core/roomRules'
import { spriteForNpc } from '../core/visualAssets'
import { BagPanel } from './BagPanel'

type HandbookPage = 'townsfolk' | 'home' | 'collection' | 'records'

const PAGE_STORAGE_KEY = 'productivity-valley:handbook-page'
const PLACEHOLDER_SPRITE = 'art/characters/placeholders/traveler-placeholder-v1.webp'

const PAGES: Array<{
  id: HandbookPage
  label: string
  icon: 'chat' | 'home' | 'basket' | 'book'
}> = [
  { id: 'townsfolk', label: '镇民', icon: 'chat' },
  { id: 'home', label: '院宅', icon: 'home' },
  { id: 'collection', label: '收藏', icon: 'basket' },
  { id: 'records', label: '记录', icon: 'book' },
]

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

function initialPage(): HandbookPage {
  const saved = window.localStorage.getItem(PAGE_STORAGE_KEY)
  return PAGES.some((page) => page.id === saved) ? saved as HandbookPage : 'townsfolk'
}

export function Handbook({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [page, setPage] = useState<HandbookPage>(initialPage)
  const closeButton = useRef<HTMLButtonElement>(null)
  const state = useGameStore()
  const selectNpc = useGameStore((store) => store.selectNpc)
  const selectRoom = useGameStore((store) => store.selectRoom)
  const selectEvent = useGameStore((store) => store.selectEvent)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const choosePage = (next: HandbookPage) => {
    setPage(next)
    window.localStorage.setItem(PAGE_STORAGE_KEY, next)
  }

  const openNpc = (id: string) => {
    onClose()
    selectNpc(id)
  }

  const openRoom = (id: string) => {
    onClose()
    selectRoom(id)
  }

  const openEvent = (id: string) => {
    onClose()
    selectEvent(id)
  }

  if (!open) return null

  const pageIndex = PAGES.findIndex((item) => item.id === page)
  return (
    <div className="handbook-overlay" onClick={onClose}>
      <section
        className={`handbook handbook-page-${page}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="handbook-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="handbook-header">
          <div>
            <GameIcon name="book" />
            <h2 id="handbook-title">手册</h2>
          </div>
          <span>{pageIndex + 1}/4</span>
          <button ref={closeButton} className="handbook-close" onClick={onClose} aria-label="关闭手册">×</button>
        </header>

        <nav className="handbook-tabs" aria-label="手册页面">
          {PAGES.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? 'active' : ''}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={() => choosePage(item.id)}
            >
              <GameIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="handbook-spread">
          {page === 'townsfolk' && <TownsfolkPages state={state} onOpen={openNpc} />}
          {page === 'home' && <HomePages state={state} onOpen={openRoom} />}
          {page === 'collection' && <CollectionPages state={state} />}
          {page === 'records' && <RecordPages state={state} onOpenEvent={openEvent} />}
        </div>
      </section>
    </div>
  )
}

function TownsfolkPages({
  state,
  onOpen,
}: {
  state: ReturnType<typeof useGameStore.getState>
  onOpen: (id: string) => void
}) {
  const knownCount = NPC_DEFS.filter((npc) => state.npc[npc.id]?.interacted).length

  return (
    <article className="handbook-leaf townsfolk-leaf">
      <div className="handbook-leaf-heading">
        <h3>镇民</h3>
        <span>{knownCount}/{NPC_DEFS.length}</span>
      </div>
      <div className="townsfolk-index">
        {NPC_DEFS.map((npc) => {
          const progress = state.npc[npc.id]
          const met = Boolean(progress?.met)
          const interacted = Boolean(progress?.interacted)
          const friendship = interacted
            ? friendshipStage(progress.friendshipPoints)
            : 0
          const romance = interacted
            ? romanceStage(progress.romancePoints, progress.romanceUnlocked, progress.livingAtHome)
            : 0
          return (
            <button
              key={npc.id}
              className={`townsfolk-entry${interacted ? '' : ' is-mystery'}`}
              disabled={!interacted}
              onClick={() => onOpen(npc.id)}
              aria-label={
                interacted
                  ? `查看${npc.name}`
                  : met
                    ? '陌生的镇民，去山谷打个招呼'
                    : '未遇见的镇民'
              }
              title={
                interacted
                  ? undefined
                  : met
                    ? '去山谷打个招呼'
                    : undefined
              }
            >
              <span className="townsfolk-portrait">
                <img
                  src={publicAsset(spriteForNpc(npc.id) ?? PLACEHOLDER_SPRITE)}
                  alt=""
                  draggable={false}
                />
              </span>
              <span className="townsfolk-entry-copy">
                {interacted ? (
                  <>
                    <strong>{npc.name}</strong>
                    <small>
                      <span title={`友情：${FRIENDSHIP_LABELS[friendship]}`}><GameIcon name="chat" />{friendship}</span>
                      {progress.romanceUnlocked && <span title={`喜欢：${ROMANCE_LABELS[romance]}`}><GameIcon name="heart" />{romance}</span>}
                      {progress.livingAtHome && <span title="同住"><GameIcon name="home" /></span>}
                    </small>
                  </>
                ) : (
                  <strong className="townsfolk-unknown" aria-hidden="true"> </strong>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </article>
  )
}

function HomePages({
  state,
  onOpen,
}: {
  state: ReturnType<typeof useGameStore.getState>
  onOpen: (id: string) => void
}) {
  const used = courtyardCapacityUsed(state.rooms)
  const courtyard = COURTYARD_LEVELS[state.courtyardLevel]
  const facilities = state.rooms.filter((room) => ['living', 'study', 'storage'].includes(room.type))
  const residentCount = Object.values(state.npc).filter((progress) => progress.livingAtHome).length
  const openBeds = emptyBedCount(state.rooms)
  const expansionTypes = (['bedroom', 'guest', 'kitchen'] as const)
    .map((type) => ({ type, rooms: state.rooms.filter((room) => room.type === type) }))
    .filter((entry) => entry.rooms.length > 0)

  return (
    <>
      <article className="handbook-leaf">
        <div className="home-ledger-heading">
          <div><span>院落</span><h3>{courtyard.name}</h3></div>
          <strong>{used}/{courtyard.capacity}</strong>
          <i><b style={{ width: `${Math.min(100, used / courtyard.capacity * 100)}%` }} /></i>
        </div>
        <div className="home-ledger-stats" aria-label="居住概况">
          <span><b>{residentCount}</b><small>住户</small></span>
          <span><b>{openBeds}</b><small>空位</small></span>
        </div>
        <h4 className="home-ledger-section-title">基础房间</h4>
        <div className="home-room-list facility-ledger">
          {facilities.map((room) => (
            <button key={room.id} className="home-room-entry" onClick={() => onOpen(room.id)}>
              <span className="home-room-icon"><GameIcon name={room.type === 'study' ? 'book' : room.type === 'storage' ? 'basket' : 'home'} /></span>
              <span>
                <strong>{roomName(room.type)}</strong>
                <small>{ROOM_LEVEL_LABELS[room.level ?? 1]} · {room.level ?? 1}/3</small>
              </span>
            </button>
          ))}
        </div>
        {expansionTypes.length > 0 && <>
          <h4 className="home-ledger-section-title">其他房间</h4>
          <div className="home-room-list room-type-ledger">
            {expansionTypes.map(({ type, rooms }) => (
              <button key={type} className="home-room-entry" onClick={() => onOpen(rooms[0].id)}>
                <span className="home-room-icon"><GameIcon name={type === 'kitchen' ? 'ladle' : 'home'} /></span>
                <span><strong>{roomName(type)}</strong><small>×{rooms.length}</small></span>
              </button>
            ))}
          </div>
        </>}
      </article>
      <article className="handbook-leaf home-management-leaf">
        <div className="handbook-leaf-heading"><h3>建设与升级</h3></div>
        <BagPanel mode="home" embedded />
      </article>
    </>
  )
}

function CollectionPages({ state }: { state: ReturnType<typeof useGameStore.getState> }) {
  const knownGiftIds = new Set([
    ...state.inventory.filter((item) => item.qty > 0).map((item) => item.id),
    ...Object.values(state.npc).flatMap((progress) => Object.keys(progress.giftDiscoveries)),
  ])
  return (
    <>
      <article className="handbook-leaf">
        <div className="handbook-leaf-heading">
          <h3>礼物</h3>
          <span>{knownGiftIds.size}/{GIFT_DEFS.length}</span>
        </div>
        <div className="collection-index gift-index">
          {GIFT_DEFS.map((gift) => {
            const qty = state.inventory.find((item) => item.id === gift.id)?.qty ?? 0
            const known = knownGiftIds.has(gift.id)
            return (
              <div key={gift.id} className={`collection-entry${known ? '' : ' is-undiscovered'}`}>
                <GiftIcon name={gift.id as GiftIconName} />
                <strong>{known ? gift.name : '？'}</strong>
                <span>{known ? `×${qty}` : '未获得'}</span>
              </div>
            )
          })}
        </div>
      </article>
      <article className="handbook-leaf">
        <div className="handbook-leaf-heading">
          <h3>装饰</h3>
          <span>{state.decorations.length}/{DECORATION_DEFS.length}</span>
        </div>
        <div className="collection-index decoration-index">
          {DECORATION_DEFS.map((decoration) => {
            const owned = state.decorations.includes(decoration.id)
            const placed = state.placedDecorations.includes(decoration.id)
            return (
              <div key={decoration.id} className={`collection-entry${owned ? '' : ' is-undiscovered'}`}>
                <img src={publicAsset(`art/decorations/${decoration.asset}`)} alt="" draggable={false} />
                <strong>{owned ? decoration.name : '？'}</strong>
                <span>{owned ? placed ? '已摆放' : '已收藏' : '未获得'}</span>
              </div>
            )
          })}
        </div>
      </article>
    </>
  )
}

function RecordPages({
  state,
  onOpenEvent,
}: {
  state: ReturnType<typeof useGameStore.getState>
  onOpenEvent: (id: string) => void
}) {
  const growthStage = valleyStage(state)
  const growthPoints = valleyGrowthPoints(state)
  const growth = VALLEY_STAGES[growthStage]
  const next = growthStage < 3 ? VALLEY_STAGES[growthStage + 1].threshold : growthPoints
  const week = weeklyProgress(state.tasks)
  const completedTasks = state.tasks.filter((task) => task.done).length
  const habitDays = state.habits.reduce(
    (sum, habit) => sum + habit.entries.filter((entry) => entry.count >= habit.targetCount).length,
    0,
  )
  const projectBlocks = state.projects.reduce(
    (sum, project) => sum + project.blocks.filter((block) => block.done).length,
    0,
  )
  const unlockedEvents = useMemo(
    () => RELATIONSHIP_EVENTS.filter((event) => state.npc[event.npcId]?.unlockedEventIds.includes(event.id)),
    [state.npc],
  )

  return (
    <>
      <article className="handbook-leaf">
        <div className="handbook-leaf-heading">
          <h3>进度</h3>
          <span>阶段 {growthStage + 1}</span>
        </div>
        <div className="record-growth">
          <strong>{growth.name}</strong>
          <span>{Math.min(growthPoints, next)}/{next}</span>
          <i><b style={{ width: `${growthStage === 3 ? 100 : Math.min(100, growthPoints / next * 100)}%` }} /></i>
        </div>
        <div className="record-numbers">
          <span><b>{completedTasks}</b><small>待办</small></span>
          <span><b>{habitDays}</b><small>习惯</small></span>
          <span><b>{projectBlocks}</b><small>小任务</small></span>
          <span><b>{week.activeDays}</b><small>本周活跃</small></span>
        </div>
        <div className="milestone-index">
          {MILESTONES.map((milestone) => {
            const earned = state.milestones.includes(milestone.id)
            return (
              <div key={milestone.id} className={earned ? '' : 'is-locked'} title={earned ? milestone.detail : '未获得'}>
                <img src={publicAsset(`art/milestones/${milestone.asset}`)} alt="" draggable={false} />
                <span>{earned ? milestone.name : '？'}</span>
              </div>
            )
          })}
        </div>
      </article>
      <article className="handbook-leaf">
        <div className="handbook-leaf-heading">
          <h3>故事</h3>
          <span>{unlockedEvents.length}/{RELATIONSHIP_EVENTS.length}</span>
        </div>
        {unlockedEvents.length ? (
          <div className="record-event-list">
            {unlockedEvents.map((event) => (
              <button key={event.id} onClick={() => onOpenEvent(event.id)}>
                <span><GameIcon name={event.track === 'romance' ? 'heart' : 'chat'} /></span>
                <span>
                  <strong>{event.title}</strong>
                  <small>{NPC_DEFS.find((npc) => npc.id === event.npcId)?.name}</small>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="handbook-empty-line">暂无故事</p>
        )}
      </article>
    </>
  )
}
