import {
  canInvite,
  emptyBeds,
  stageLabels,
  totalDailyMaintenance,
  useGameStore,
} from '../core/gameStore'
import { FRIENDSHIP_LABELS, ROMANCE_LABELS } from '../core/constants'
import { NPC_DEFS } from '../core/npcs'
import { roomName } from '../core/economy'

export function ValleyPanel() {
  const rooms = useGameStore((s) => s.rooms)
  const npc = useGameStore((s) => s.npc)
  const selectNpc = useGameStore((s) => s.selectNpc)
  const maintenance = useGameStore((s) => totalDailyMaintenance(s))
  const beds = useGameStore((s) => emptyBeds(s.rooms))

  const visible = NPC_DEFS.filter((n) => npc[n.id]?.met)
  const atHome = visible.filter((n) => npc[n.id].livingAtHome)
  const outside = visible.filter((n) => !npc[n.id].livingAtHome)

  return (
    <div className="panel">
      <div className="valley-scene" aria-label="山谷绘本场景">
        <div className="valley-sky" />
        <div className="house">
          <div className="house-roof" />
          <div className="house-body">
            <div className="house-window left" />
            <div className="house-window right" />
            <div className="house-door" />
          </div>
        </div>
        <div className="npc-row">
          {[...atHome, ...outside].map((n) => (
            <button
              key={n.id}
              className="npc-chip"
              onClick={() => selectNpc(n.id)}
              aria-label={`查看${n.name}`}
            >
              <span
                className="npc-avatar"
                style={{ background: `${n.color}33`, borderColor: n.color }}
              >
                {n.name.slice(0, 1)}
              </span>
              <small>{n.name}</small>
            </button>
          ))}
        </div>
      </div>

      <p className="hint">
        空床位 {beds} · 今日维护约 {maintenance} 金币。点小人培养感情；眷恋且有空房可邀请留下。
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
