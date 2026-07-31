import { useEffect, type CSSProperties } from 'react'
import {
  canInvite,
  emptyBeds,
  stageLabels,
  totalDailyMaintenance,
  useGameStore,
} from '../core/gameStore'
import {
  DECORATION_DEFS,
  FRIENDSHIP_LABELS,
  GIFT_DEFS,
  ROMANCE_LABELS,
} from '../core/constants'
import { NPC_DEFS, type NpcDef } from '../core/npcs'
import { roomName } from '../core/economy'
import {
  MILESTONES,
  gentleWeeklySummary,
  nextValleyGoal,
  VALLEY_STAGES,
  valleyGrowthPoints,
  valleyStage,
  weeklyProgress,
} from '../core/growth'
import {
  interactionBlockReason,
  inviteRequirements,
  relationshipNextStep,
  romanceBlockReason,
} from '../core/progression'
import type { RoomType } from '../core/types'
import { EmptyState } from './EmptyState'
import { eventsForNpc } from '../core/events'
import {
  portraitForNpc,
  spriteForNpc,
  type CharacterSpriteState,
} from '../core/visualAssets'
import { GameIcon, type GameIconName } from '../assets/icons/GameIcon'
import {
  RelationshipMotif,
  RelationshipSymbol,
} from './RelationshipMotif'

/** Yard / path spots — away from the house. Percent of scene. */
const YARD_SPOTS: Array<{ left: string; top: string }> = [
  { left: '14%', top: '68%' },
  { left: '30%', top: '78%' },
  { left: '48%', top: '72%' },
  { left: '68%', top: '78%' },
  { left: '86%', top: '68%' },
  { left: '22%', top: '58%' },
  { left: '78%', top: '58%' },
  { left: '10%', top: '48%' },
  { left: '90%', top: '50%' },
  { left: '38%', top: '65%' },
  { left: '62%', top: '64%' },
  { left: '54%', top: '80%' },
]

const PLACEHOLDER_SPRITE =
  'art/characters/placeholders/traveler-placeholder-v1.webp'

const CORE_PROP_ICONS: Partial<Record<string, GameIconName>> = {
  shendu: 'bamboo',
  guwan: 'umbrella',
  taotao: 'ladle',
}

const ROOM_MODULES: Partial<Record<RoomType, string>> = {
  bedroom: 'art/house/modules/bedroom-module-v1.webp',
  guest: 'art/house/modules/guest-module-v1.webp',
  kitchen: 'art/house/modules/kitchen-module-v1.webp',
  study: 'art/house/modules/study-module-v1.webp',
  storage: 'art/house/modules/storage-module-v1.webp',
}

const EXPANSION_SLOTS = [
  { x: '33%', bottom: '41%', width: '23%', layer: 2 },
  { x: '67%', bottom: '41%', width: '23%', layer: 2 },
  { x: '42%', bottom: '58%', width: '17%', layer: 1 },
  { x: '58%', bottom: '58%', width: '17%', layer: 1 },
  { x: '24%', bottom: '45%', width: '17%', layer: 1 },
  { x: '76%', bottom: '45%', width: '17%', layer: 1 },
] as const

const DECORATION_SPOTS = [
  { left: '35%', top: '51%', width: '7%' },
  { left: '29%', top: '47%', width: '6%' },
  { left: '62%', top: '53%', width: '7%' },
  { left: '73%', top: '57%', width: '7%' },
  { left: '13%', top: '74%', width: '9%' },
  { left: '84%', top: '57%', width: '8%' },
  { left: '25%', top: '65%', width: '7%' },
  { left: '88%', top: '69%', width: '7%' },
  { left: '8%', top: '53%', width: '8%' },
  { left: '55%', top: '62%', width: '9%' },
  { left: '69%', top: '48%', width: '6%' },
  { left: '78%', top: '80%', width: '10%' },
] as const

const VALLEY_STAGE_ASSETS = [
  'art/environment/valley-stage-0-v1.webp',
  'art/environment/valley-stage-1-v1.webp',
  'art/environment/valley-stage-2-v1.webp',
  'art/environment/valley-stage-3-v1.webp',
] as const

const VALLEY_STAGE_SMALL_ASSETS = VALLEY_STAGE_ASSETS.map((asset) =>
  asset.replace('.webp', '-768.webp'),
)

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

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
  const onboardingStep = useGameStore((s) => s.onboardingStep)
  const valleyRewardReady = useGameStore((s) => s.valleyRewardReady)
  const clearValleyReward = useGameStore((s) => s.clearValleyReward)
  const lastBuiltRoomId = useGameStore((s) => s.lastBuiltRoomId)
  const dialogue = useGameStore((s) => s.dialogue)
  const clearLastBuiltRoom = useGameStore((s) => s.clearLastBuiltRoom)
  const selectRoom = useGameStore((s) => s.selectRoom)
  const toggleDecoration = useGameStore((s) => s.toggleDecoration)
  const state = useGameStore()

  useEffect(() => {
    if (!valleyRewardReady) return
    const id = window.setTimeout(clearValleyReward, 2600)
    return () => window.clearTimeout(id)
  }, [clearValleyReward, valleyRewardReady])

  useEffect(() => {
    if (!lastBuiltRoomId) return
    const id = window.setTimeout(clearLastBuiltRoom, 1900)
    return () => window.clearTimeout(id)
  }, [clearLastBuiltRoom, lastBuiltRoomId])

  const visible = NPC_DEFS.filter((n) => npc[n.id]?.met)
  const atHome = visible.filter((n) => npc[n.id].livingAtHome)
  const outside = visible.filter((n) => !npc[n.id].livingAtHome)
  const movingInNpcId = dialogue?.kind === 'invite' ? dialogue.npcId : null
  const expansions = rooms.filter((room) => room.type !== 'living').slice(0, 6)
  const growthStage = valleyStage(state)
  const growthPoints = valleyGrowthPoints(state)
  const growthInfo = VALLEY_STAGES[growthStage]
  const nextThreshold =
    growthStage < 3 ? VALLEY_STAGES[growthStage + 1].threshold : growthPoints
  const previousThreshold = growthInfo.threshold
  const growthPercent =
    growthStage === 3
      ? 100
      : Math.min(
          100,
          ((growthPoints - previousThreshold) /
            (nextThreshold - previousThreshold)) *
            100,
        )
  const week = weeklyProgress(state.tasks)

  return (
    <div className="panel">
      <div
        className={`valley-scene valley-stage-${growthStage}${atHome.length ? ' has-company' : ''}${
          valleyRewardReady ? ' is-awake' : ''
        }`}
        aria-label="山谷"
        style={{
          '--valley-bg': `url("${publicAsset(VALLEY_STAGE_ASSETS[growthStage])}")`,
          '--valley-bg-small': `url("${publicAsset(VALLEY_STAGE_SMALL_ASSETS[growthStage])}")`,
        } as CSSProperties}
      >
        {valleyRewardReady && (
          <div className="valley-response" role="status">
            山谷亮了一点
          </div>
        )}
        {movingInNpcId && (
          <div className="move-in-home-state" aria-hidden="true">
            <span className="move-in-door" />
            <span className="move-in-window-silhouette" />
          </div>
        )}
        <div className="house-expansions" aria-label="已扩建房间">
          {expansions.map((room, index) => {
            const image = ROOM_MODULES[room.type]
            const slot = EXPANSION_SLOTS[index]
            if (!image || !slot) return null
            return (
              <button
                key={room.id}
                className={`room-module${
                  room.id === lastBuiltRoomId ? ' is-new' : ''
                }`}
                style={{
                  left: slot.x,
                  bottom: slot.bottom,
                  width: slot.width,
                  zIndex: slot.layer,
                }}
                onClick={() => selectRoom(room.id)}
                aria-label={`${roomName(room.type)}，点击查看`}
              >
                <img src={publicAsset(image)} alt="" draggable={false} />
                <span>{roomName(room.type)}</span>
              </button>
            )
          })}
        </div>
        <div className="valley-decorations" aria-label="山谷装饰">
          {DECORATION_DEFS.map((decoration, index) => {
            if (!state.placedDecorations.includes(decoration.id)) return null
            const spot = DECORATION_SPOTS[index]
            return (
              <button
                key={decoration.id}
                className="valley-decoration"
                style={spot}
                onClick={() => toggleDecoration(decoration.id)}
                aria-label={`${decoration.name}，点击收起`}
                title={`${decoration.name} · 点击收起`}
              >
                <img
                  src={publicAsset(`art/decorations/${decoration.asset}`)}
                  alt=""
                  draggable={false}
                />
              </button>
            )
          })}
        </div>
        {atHome.length > 0 && (
          <div className="porch-row" aria-label="同住">
            {atHome.map((n) => (
              <NpcButton
                key={n.id}
                n={n}
                onSelect={selectNpc}
                compact
                spriteState={n.id === movingInNpcId ? 'moveIn' : 'idle'}
              />
            ))}
          </div>
        )}

        {outside.map((n, i) => {
          const spot = spotFor(n.id, i)
          return (
            <button
              key={n.id}
              className={`npc-spot${onboardingStep === 3 ? ' guide-target' : ''}`}
              style={{ left: spot.left, top: spot.top }}
              onClick={() => selectNpc(n.id)}
              aria-label={n.name}
            >
              <CharacterVisual n={n} spriteState="walkAway" animateWalking />
              <small>{n.name}</small>
            </button>
          )
        })}
      </div>

      <section className="growth-card" aria-labelledby="growth-title">
        <div className="growth-heading">
          <div>
            <span>山谷成长 · 第 {growthStage + 1} 阶段</span>
            <h2 id="growth-title">{growthInfo.name}</h2>
          </div>
          <strong>{growthPoints} 点</strong>
        </div>
        <p>{growthInfo.description}</p>
        <div
          className="growth-track"
          role="progressbar"
          aria-label="距离山谷下一阶段"
          aria-valuemin={previousThreshold}
          aria-valuemax={nextThreshold}
          aria-valuenow={Math.min(growthPoints, nextThreshold)}
        >
          <i style={{ width: `${growthPercent}%` }} />
        </div>
        <p className="growth-next">{nextValleyGoal(state)}</p>
        <div className="weekly-gentle">
          <span>本周轻目标</span>
          <strong>待办 {week.completed}/{week.taskGoal}</strong>
          <strong>活跃 {week.activeDays}/{week.dayGoal} 天</strong>
          <small>没有连续登录惩罚，回来就从今天继续。</small>
        </div>
        <details className="weekly-summary">
          <summary>上周小结</summary>
          <p>{gentleWeeklySummary(state.tasks)}</p>
        </details>
        {state.milestones.length > 0 && (
          <div className="milestone-row" aria-label="已获得里程碑">
            {MILESTONES.filter((item) =>
              state.milestones.includes(item.id),
            ).map((item) => (
              <span key={item.id} title={item.detail}>
                <img
                  src={publicAsset(`art/milestones/${item.asset}`)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                <b>{item.name}</b>
                <small>{item.detail}</small>
              </span>
            ))}
          </div>
        )}
      </section>

      {visible.length === 0 && (
        <EmptyState
          compact
          image="art/empty-states/characters-empty-v1.webp"
          title="小路暂时很安静"
          detail="继续完成待办和扩建房间，会有人沿着这条路来到山谷。"
        />
      )}

      <p className="hint">
        人在小路上。超喜欢 + 有空房，就能请进来住。空床 {beds} · 今天维护 {maintenance}
      </p>

      {visible.length > 0 && (
        <>
          <h2 className="section-title valley-people-title">遇见的人</h2>
          <div className="visitor-strip" aria-label="已遇见角色">
            {visible.map((npcDef) => (
              <NpcButton
                key={npcDef.id}
                n={npcDef}
                onSelect={selectNpc}
                compact
              />
            ))}
          </div>
        </>
      )}

      <h2 className="section-title">房间</h2>
      <div className="rooms-strip">
        {rooms.map((r) => {
          const label = (
            <>
              {roomName(r.type)}
              {r.occupantId
                ? ` · ${NPC_DEFS.find((n) => n.id === r.occupantId)?.name}`
                : ROOM_CAPACITY_HINT(r.type)}
            </>
          )
          return r.type === 'living' ? (
            <div key={r.id} className="room-pill">
              {label}
            </div>
          ) : (
            <button
              key={r.id}
              className="room-pill is-interactive"
              onClick={() => selectRoom(r.id)}
              aria-label={`查看${roomName(r.type)}室内`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CharacterVisual({
  n,
  compact,
  spriteState = 'idle',
  animateWalking = false,
}: {
  n: NpcDef
  compact?: boolean
  spriteState?: CharacterSpriteState
  animateWalking?: boolean
}) {
  const sprite = spriteForNpc(n.id, spriteState)
  const idleSprite = animateWalking ? spriteForNpc(n.id) : undefined
  if (animateWalking && sprite && idleSprite && sprite !== idleSprite) {
    return (
      <span className="npc-sprite-stack" aria-hidden="true">
        <img
          className="npc-sprite sprite-idle"
          src={publicAsset(idleSprite)}
          alt=""
          draggable={false}
        />
        <img
          className="npc-sprite sprite-walk-away"
          src={publicAsset(sprite)}
          alt=""
          draggable={false}
        />
      </span>
    )
  }
  return (
    <img
      className={`npc-sprite${compact ? ' compact' : ''}${
        spriteState === 'moveIn' ? ' move-in' : ''
      }${sprite ? '' : ' placeholder'
      }`}
      src={publicAsset(sprite ?? PLACEHOLDER_SPRITE)}
      alt=""
      draggable={false}
    />
  )
}

function NpcButton({
  n,
  onSelect,
  compact,
  spriteState = 'idle',
}: {
  n: NpcDef
  onSelect: (id: string) => void
  compact?: boolean
  spriteState?: CharacterSpriteState
}) {
  return (
    <button
      className="npc-chip"
      onClick={() => onSelect(n.id)}
      aria-label={n.name}
      style={compact ? { width: 48 } : undefined}
    >
      <CharacterVisual n={n} compact={compact} spriteState={spriteState} />
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
  const dialogue = useGameStore((s) => s.dialogue)
  const selectNpc = useGameStore((s) => s.selectNpc)
  const clearDialogue = useGameStore((s) => s.clearDialogue)
  const chat = useGameStore((s) => s.chat)
  const heartTalk = useGameStore((s) => s.heartTalk)
  const unlockRomance = useGameStore((s) => s.unlockRomance)
  const giveGift = useGameStore((s) => s.giveGift)
  const teaWith = useGameStore((s) => s.teaWith)
  const invitePartner = useGameStore((s) => s.invitePartner)
  const separatePartner = useGameStore((s) => s.separatePartner)
  const selectEvent = useGameStore((s) => s.selectEvent)
  const state = useGameStore()

  if (!id || !npcState) return null
  const def = NPC_DEFS.find((n) => n.id === id)
  if (!def) return null
  const { f, r } = stageLabels(npcState)
  const inviteOk = canInvite(state, id)
  const chatReason = interactionBlockReason(state, id, 1)
  const heartReason = interactionBlockReason(state, id, 2, true)
  const romanceReason = romanceBlockReason(state, id)
  const inviteChecks = inviteRequirements(state, id)
  const activeDialogue = dialogue?.npcId === id ? dialogue : null
  const portrait = portraitForNpc(id, activeDialogue?.tone)
  const giftKnowledge = GIFT_DEFS.flatMap((gift) => {
    const reaction = npcState.giftDiscoveries[gift.id]
    return reaction ? [{ ...gift, reaction }] : []
  })
  const relationshipEvents = eventsForNpc(id)
  const unlockedEvents = new Set(npcState.unlockedEventIds)

  return (
    <div className="sheet" onClick={() => selectNpc(null)}>
      <div
        className="sheet-card character-profile-paper"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="paper-stitch paper-stitch-top" aria-hidden="true" />
        <span className="paper-stitch paper-stitch-bottom" aria-hidden="true" />
        <div
          className={`npc-sheet-intro${portrait ? ' has-portrait' : ''}${
            activeDialogue ? ` tone-${activeDialogue.tone}` : ''
          }`}
        >
          {portrait && (
            <div className="npc-portrait-wrap" aria-hidden="true">
              <img
                key={portrait}
                className={`npc-portrait${activeDialogue ? ' is-expression' : ''}`}
                src={publicAsset(portrait)}
                alt=""
                draggable={false}
              />
            </div>
          )}
          <div className="npc-sheet-copy">
            <h2>{def.name}</h2>
            <p className="muted">{def.blurb}</p>
            <p className="muted">
              {CORE_PROP_ICONS[id] && (
                <GameIcon
                  name={CORE_PROP_ICONS[id]}
                  className="npc-prop-icon"
                />
              )}
              {def.prop} · {def.voice}
              {npcState.livingAtHome ? ' · 住在你家' : ' · 在外面'}
            </p>
            <div className="stage">
              <em>友情 {FRIENDSHIP_LABELS[f]}</em>
              <em>喜欢 {ROMANCE_LABELS[r]}</em>
              <em>今日 {npcState.interactionsToday}/3</em>
            </div>
            {!npcState.livingAtHome && (
              <p className="relationship-next">{relationshipNextStep(state, id)}</p>
            )}
          </div>
        </div>

        <RelationshipMotif
          friendship={f}
          romance={r}
          friendshipLabel={FRIENDSHIP_LABELS[f]}
          romanceLabel={ROMANCE_LABELS[r]}
        />

        {activeDialogue ? (
          <div className={`dialogue-box tone-${activeDialogue.tone}`} role="status">
            <span className="dialogue-name">{def.name}</span>
            <p>“{activeDialogue.text}”</p>
            <button className="dialogue-continue" onClick={clearDialogue}>
              继续
            </button>
          </div>
        ) : (
          <>
            <div className="actions">
              {!npcState.livingAtHome && (
                <>
                  <button
                    className="btn"
                    disabled={Boolean(chatReason)}
                    title={chatReason ?? undefined}
                    onClick={() => chat(id)}
                  >
                    聊聊
                  </button>
                  <button
                    className="btn secondary"
                    disabled={Boolean(heartReason)}
                    title={heartReason ?? undefined}
                    onClick={() => heartTalk(id)}
                  >
                    深聊
                  </button>
                  {!npcState.romanceUnlocked && (
                    <button
                      className="btn secondary"
                      disabled={Boolean(romanceReason)}
                      title={romanceReason ?? undefined}
                      onClick={() => unlockRomance(id)}
                    >
                      表白
                    </button>
                  )}
                  <button
                    className="btn"
                    disabled={!inviteOk}
                    title={
                      inviteOk
                        ? undefined
                        : inviteChecks
                            .filter((item) => !item.met)
                            .map((item) => item.detail)
                            .join('；')
                    }
                    onClick={() => invitePartner(id)}
                  >
                    请进来住
                  </button>
                </>
              )}
              {npcState.livingAtHome && (
                <>
                  <button className="btn" onClick={() => teaWith(id)}>
                    喝茶
                  </button>
                  <button className="btn danger" onClick={() => separatePartner(id)}>
                    搬出去
                  </button>
                </>
              )}
            </div>

            {!npcState.livingAtHome && (
              <>
                {chatReason && (
                  <p className="action-lock-note" role="status">
                    互动暂缓：{chatReason}
                  </p>
                )}
                <div className="invite-checks" aria-label="邀请入住条件">
                  {inviteChecks.map((requirement) => (
                    <div
                      key={requirement.label}
                      className={requirement.met ? 'is-met' : ''}
                    >
                      <span aria-hidden="true">{requirement.met ? '✓' : '○'}</span>
                      <p>
                        <strong>{requirement.label}</strong>
                        <small>{requirement.detail}</small>
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <section className="preference-journal" aria-labelledby="preference-title">
              <div className="preference-heading">
                <h3 id="preference-title">喜好手记</h3>
                <span>{giftKnowledge.length}/12 已发现</span>
              </div>
              {giftKnowledge.length === 0 ? (
                <p>送过礼物以后，反应会记在这里。</p>
              ) : (
                <div className="preference-tags">
                  {giftKnowledge.map((gift) => (
                    <span
                      key={gift.id}
                      className={`is-${gift.reaction}`}
                      title={
                        gift.reaction === 'liked'
                          ? '喜欢'
                          : gift.reaction === 'disliked'
                            ? '不喜欢'
                            : '普通'
                      }
                    >
                      <i aria-hidden="true">
                        {gift.reaction === 'liked'
                          ? '♥'
                          : gift.reaction === 'disliked'
                            ? '×'
                            : '·'}
                      </i>
                      {gift.name}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {relationshipEvents.length > 0 && (
              <section className="memory-album" aria-labelledby="memory-title">
                <div className="memory-heading">
                  <h3 id="memory-title">回忆册</h3>
                  <span>
                    {
                      relationshipEvents.filter((event) =>
                        unlockedEvents.has(event.id),
                      ).length
                    }
                    /{relationshipEvents.length} 已解锁
                  </span>
                </div>
                <div className="memory-grid">
                  {relationshipEvents.map((event) => {
                    const unlocked = unlockedEvents.has(event.id)
                    return (
                      <button
                        key={event.id}
                        className={unlocked ? 'is-unlocked' : ''}
                        disabled={!unlocked}
                        onClick={() => selectEvent(event.id)}
                      >
                        <span className="memory-track">
                          <RelationshipSymbol
                            kind={event.track}
                            stage={event.track === 'friendship' ? f : r}
                            compact
                          />
                          {event.track === 'friendship' ? '两杯茶' : '一盏灯'}
                        </span>
                        <strong>{unlocked ? event.title : '尚未发生'}</strong>
                        <small>
                          {unlocked
                            ? event.summary
                            : event.track === 'friendship'
                              ? '继续积累友情'
                              : '继续靠近彼此'}
                        </small>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {inventory.length > 0 && (
            <>
              <h3 className="section-title" style={{ marginTop: 18 }}>
                送礼
              </h3>
              <div className="actions">
                {inventory.map((g) => {
                  const known = npcState.giftDiscoveries[g.id]
                  return (
                    <button
                      key={g.id}
                      className="btn secondary"
                      onClick={() => giveGift(id, g.id)}
                    >
                      {giftName(g.id)} ×{g.qty}
                      {known === 'liked'
                        ? ' · 喜欢'
                        : known === 'disliked'
                          ? ' · 不喜欢'
                          : known === 'neutral'
                            ? ' · 普通'
                            : ''}
                    </button>
                  )
                })}
              </div>
            </>
            )}
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
    wood_scrap: '小木块',
    osmanthus: '桂花糖',
    orange_peel: '蜜橘皮',
    trinket: '小玩意',
    cinnabar: '印泥',
    bean_bag: '暖手豆袋',
    maltose: '麦芽糖',
    tea_cake: '茶饼',
    lotus_paper: '莲纸',
  }
  return map[id] ?? id
}
