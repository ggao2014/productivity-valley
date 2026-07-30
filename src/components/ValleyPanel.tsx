import {
  canInvite,
  emptyBeds,
  stageLabels,
  totalDailyMaintenance,
  useGameStore,
} from '../core/gameStore'
import { FRIENDSHIP_LABELS, ROMANCE_LABELS } from '../core/constants'
import { NPC_DEFS, type NpcDef } from '../core/npcs'
import { roomName } from '../core/economy'

/** Yard / path spots — away from the house. Percent of scene. */
const YARD_SPOTS: Array<{ left: string; top: string }> = [
  { left: '14%', top: '72%' },
  { left: '30%', top: '84%' },
  { left: '48%', top: '78%' },
  { left: '68%', top: '86%' },
  { left: '86%', top: '70%' },
  { left: '22%', top: '58%' },
  { left: '78%', top: '58%' },
  { left: '10%', top: '48%' },
  { left: '90%', top: '50%' },
  { left: '38%', top: '66%' },
  { left: '62%', top: '64%' },
  { left: '54%', top: '90%' },
]

function spotFor(id: string, index: number) {
  const n = [...id].reduce((a, c) => a + c.charCodeAt(0), 0)
  return YARD_SPOTS[(n + index * 3) % YARD_SPOTS.length]
}

export function ValleyPanel() {
  const rooms = useGameStore((s) => s.rooms)
  const npc = useGameStore((s) => s.npc)
  const selectNpc = useGameStore((s) => s.selectNpc)
  const maintenance = useGameStore((s) => totalDailyMaintenance(s))
  const beds = useGameStore((s) => emptyBeds(s.rooms))

  const visible = NPC_DEFS.filter((n) => npc[n.id]?.met)
  const atHome = visible.filter((n) => npc[n.id].livingAtHome)
  const outside = visible.filter((n) => !npc[n.id].livingAtHome)
  const windowGuests = atHome.slice(0, 2)
  const porchGuests = atHome.slice(2)

  return (
    <div className="panel">
      <div className="valley-scene" aria-label="山谷绘本场景">
        <div className="valley-sky" />
        <div className="valley-path" />
        <span className="valley-label home">自家小屋</span>
        <span className="valley-label yard">山谷小路</span>

        <div className="house" aria-label="小屋，初始无人入住">
          <div className="house-roof" />
          <div className={`house-body${atHome.length ? ' has-company' : ''}`}>
            <WindowSlot
              side="left"
              guest={windowGuests[0]}
              onSelect={selectNpc}
            />
            <WindowSlot
              side="right"
              guest={windowGuests[1]}
              onSelect={selectNpc}
            />
            <div className="house-door" />
          </div>
        </div>

        {porchGuests.length > 0 && (
          <div className="porch-row" aria-label="更多同住伴侣">
            {porchGuests.map((n) => (
              <NpcButton key={n.id} n={n} onSelect={selectNpc} compact />
            ))}
          </div>
        )}

        {outside.map((n, i) => {
          const spot = spotFor(n.id, i)
          return (
            <button
              key={n.id}
              className="npc-spot"
              style={{ left: spot.left, top: spot.top }}
              onClick={() => selectNpc(n.id)}
              aria-label={`山谷里的${n.name}`}
            >
              <span
                className="npc-avatar"
                style={{ background: `${n.color}33`, borderColor: n.color }}
              >
                {n.name.slice(0, 1)}
              </span>
              <small>{n.name}</small>
            </button>
          )
        })}
      </div>

      <p className="hint">
        开局小屋是空的；人在<strong>山谷小路</strong>上。处到眷恋且有空房，才能请进窗边同住。
        空床位 {beds} · 今日维护约 {maintenance} 金币。
      </p>

      <h2 className="section-title">小屋房间</h2>
      <div className="rooms-strip">
        {rooms.map((r) => (
          <div key={r.id} className="room-pill">
            {roomName(r.type)}
            {r.occupantId
              ? ` · ${NPC_DEFS.find((n) => n.id === r.occupantId)?.name}`
              : ROOM_CAPACITY_HINT(r.type)}
          </div>
        ))}
      </div>
    </div>
  )
}

function WindowSlot({
  side,
  guest,
  onSelect,
}: {
  side: 'left' | 'right'
  guest?: NpcDef
  onSelect: (id: string) => void
}) {
  if (!guest) {
    return (
      <div
        className={`house-window ${side}`}
        aria-label={`${side === 'left' ? '左' : '右'}窗空着`}
      />
    )
  }
  return (
    <button
      className={`house-window ${side} lit`}
      onClick={() => onSelect(guest.id)}
      aria-label={`窗边的${guest.name}`}
      title={guest.name}
    >
      <span
        className="window-face"
        style={{ background: `${guest.color}55` }}
      >
        {guest.name.slice(0, 1)}
      </span>
    </button>
  )
}

function NpcButton({
  n,
  onSelect,
  compact,
}: {
  n: NpcDef
  onSelect: (id: string) => void
  compact?: boolean
}) {
  return (
    <button
      className="npc-chip"
      onClick={() => onSelect(n.id)}
      aria-label={n.name}
      style={compact ? { width: 48 } : undefined}
    >
      <span
        className="npc-avatar"
        style={{
          background: `${n.color}33`,
          borderColor: n.color,
          width: compact ? 40 : 48,
          height: compact ? 40 : 48,
        }}
      >
        {n.name.slice(0, 1)}
      </span>
      <small>{n.name}</small>
    </button>
  )
}

function ROOM_CAPACITY_HINT(type: string) {
  if (type === 'bedroom' || type === 'guest') return ' · 空'
  return ''
}

export function NpcSheet() {
  const id = useGameStore((s) => s.selectedNpcId)
  const npcState = useGameStore((s) => (id ? s.npc[id] : null))
  const inventory = useGameStore((s) => s.inventory)
  const selectNpc = useGameStore((s) => s.selectNpc)
  const chat = useGameStore((s) => s.chat)
  const heartTalk = useGameStore((s) => s.heartTalk)
  const unlockRomance = useGameStore((s) => s.unlockRomance)
  const giveGift = useGameStore((s) => s.giveGift)
  const teaWith = useGameStore((s) => s.teaWith)
  const invitePartner = useGameStore((s) => s.invitePartner)
  const separatePartner = useGameStore((s) => s.separatePartner)
  const state = useGameStore()

  if (!id || !npcState) return null
  const def = NPC_DEFS.find((n) => n.id === id)
  if (!def) return null
  const { f, r } = stageLabels(npcState)
  const inviteOk = canInvite(state, id)

  return (
    <div className="sheet" onClick={() => selectNpc(null)}>
      <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
        <h2>{def.name}</h2>
        <p className="muted">{def.blurb}</p>
        <p className="muted">
          {def.prop} · {def.voice}
          {npcState.livingAtHome ? ' · 现住在你家' : ' · 还在山谷里'}
        </p>
        <div className="stage">
          <em>友情 · {FRIENDSHIP_LABELS[f]}</em>
          <em>爱情 · {ROMANCE_LABELS[r]}</em>
          <em>今日互动 {npcState.interactionsToday}/3</em>
        </div>

        <div className="actions">
          {!npcState.livingAtHome && (
            <>
              <button className="btn" onClick={() => chat(id)}>
                闲聊
              </button>
              <button className="btn secondary" onClick={() => heartTalk(id)}>
                说心事
              </button>
              {!npcState.romanceUnlocked && (
                <button className="btn secondary" onClick={() => unlockRomance(id)}>
                  说出心意
                </button>
              )}
              <button
                className="btn"
                disabled={!inviteOk}
                onClick={() => invitePartner(id)}
              >
                邀请留下
              </button>
            </>
          )}
          {npcState.livingAtHome && (
            <>
              <button className="btn" onClick={() => teaWith(id)}>
                一起喝茶
              </button>
              <button className="btn danger" onClick={() => separatePartner(id)}>
                先分开住
              </button>
            </>
          )}
        </div>

        {inventory.length > 0 && (
          <>
            <h3 className="section-title" style={{ marginTop: 18 }}>
              送礼
            </h3>
            <div className="actions">
              {inventory.map((g) => (
                <button
                  key={g.id}
                  className="btn secondary"
                  onClick={() => giveGift(id, g.id)}
                >
                  {giftName(g.id)} ×{g.qty}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="actions">
          <button className="btn secondary" onClick={() => selectNpc(null)}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

function giftName(id: string) {
  const map: Record<string, string> = {
    ginger_soup: '热姜汤',
    wheat_cake: '麦香饼',
    chestnuts: '糖炒栗子',
    wood_scrap: '好木料角',
    osmanthus: '桂花糖',
    orange_peel: '蜜渍橘皮',
    trinket: '古怪小玩意',
    cinnabar: '朱砂印泥',
    bean_bag: '暖豆袋',
    maltose: '麦芽糖块',
    tea_cake: '陈年茶饼',
    lotus_paper: '莲纸',
  }
  return map[id] ?? id
}
