import { useEffect, useState, type CSSProperties } from 'react'
import {
  canInvite,
  stageLabels,
  useGameStore,
} from '../core/gameStore'
import {
  DECORATION_DEFS,
  FRIENDSHIP_LABELS,
  FRIENDSHIP_THRESHOLDS,
  GIFT_DEFS,
  INTERACTIONS_PER_NPC_PER_DAY,
  ROMANCE_LABELS,
  ROMANCE_THRESHOLDS,
} from '../core/constants'
import { NPC_DEFS, type NpcDef } from '../core/npcs'
import { roomName } from '../core/economy'
import {
  valleyStage,
} from '../core/growth'
import {
  interactionBlockReason,
  inviteRequirements,
  romanceBlockReason,
} from '../core/progression'
import { eventsForNpc } from '../core/events'
import { npcIsKnown } from '../core/npcProgress'
import {
  portraitForNpc,
  spriteForNpc,
  type CharacterSpriteState,
} from '../core/visualAssets'
import { GameIcon } from '../assets/icons/GameIcon'
import { RelationshipSymbol } from './RelationshipMotif'
import { scenePopulationLimit, scheduledActivity } from '../core/sceneSchedule'
import { courtyardLayout } from '../core/courtyard'
import { ROOM_EXTERIOR_ASSETS, roomExteriorAsset } from '../core/roomAssets'
import { isBuiltInRoom, isCourtyardBedroom, roomResidentCount } from '../core/roomRules'
import type { CourtyardLevel, RoomInstance } from '../core/types'
import { courtyardAccents, decorationSpot } from '../core/decorationLayout'
import {
  courtyardLandscapeDef,
  courtyardLandscapePlacement,
} from '../core/courtyardLandscapes'

const PLACEHOLDER_SPRITE =
  'art/characters/placeholders/traveler-placeholder-v1.webp'

const COURTYARD_BACKGROUNDS = {
  1: 'art/environment/courtyard-small-v1.webp',
  2: 'art/environment/courtyard-three-sided-v1.webp',
  3: 'art/environment/courtyard-four-sided-v1.webp',
  4: 'art/environment/courtyard-two-entry-v1.webp',
} as const

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

const FACILITY_POSITIONS: Record<CourtyardLevel, Record<'study' | 'storage', { left: number; bottom: number; width: number }>> = {
  1: { study: { left: 38, bottom: 51, width: 13 }, storage: { left: 62, bottom: 51, width: 13 } },
  2: { study: { left: 37, bottom: 53, width: 12 }, storage: { left: 63, bottom: 53, width: 12 } },
  3: { study: { left: 37, bottom: 57, width: 11 }, storage: { left: 63, bottom: 57, width: 11 } },
  4: { study: { left: 39, bottom: 45, width: 10 }, storage: { left: 61, bottom: 45, width: 10 } },
}

function FacilityBuilding({
  room,
  kind,
  courtyardLevel,
  label,
  actionLabel,
  onOpen,
}: {
  room: RoomInstance
  kind: 'study' | 'storage'
  courtyardLevel: CourtyardLevel
  label: string
  actionLabel?: string
  onOpen: () => void
}) {
  const position = FACILITY_POSITIONS[courtyardLevel][kind]
  const level = room.level ?? 1
  return (
    <div
      className={`facility-building facility-${kind} level-${level}`}
      style={{ left: `${position.left}%`, bottom: `${position.bottom}%`, width: `${position.width}%` }}
    >
      <button className="facility-main-action" onClick={onOpen} aria-label={actionLabel ?? `进入${label}`}>
        <img src={publicAsset(roomExteriorAsset(kind, level))} alt="" draggable={false} />
        <span>{label}</span>
      </button>
    </div>
  )
}

export function ValleyPanel({
  onOpenHandbook,
  onOpenStorehouse,
  onOpenDesk,
}: {
  onOpenHandbook: () => void
  onOpenStorehouse: () => void
  onOpenDesk: () => void
}) {
  const rooms = useGameStore((s) => s.rooms)
  const npc = useGameStore((s) => s.npc)
  const selectNpc = useGameStore((s) => s.selectNpc)
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
  const scheduled = visible
    .map((n) => ({
      npc: n,
      activity: scheduledActivity(
        n.id,
        npc[n.id].livingAtHome,
        undefined,
        state.courtyardLandscape,
      ),
    }))
    .sort((a, b) => a.activity.order - b.activity.order)
  const naturallyPresent = scheduled.filter((item) => item.activity.appears)
  const movingInNpcId = dialogue?.kind === 'invite' ? dialogue.npcId : null
  const populationLimit = scenePopulationLimit()
  const movingIn = movingInNpcId
    ? scheduled.find((item) => item.npc.id === movingInNpcId)
    : undefined
  const scenePeople = [
    ...(movingIn ? [movingIn] : []),
    ...naturallyPresent.filter((item) => item.npc.id !== movingInNpcId),
  ].slice(0, movingIn ? Math.max(1, populationLimit) : populationLimit)
  const expansions = rooms.filter((room) => !isBuiltInRoom(room))
  const compoundBedroom = expansions.find(isCourtyardBedroom)
  const standardRooms = expansions.filter((room) => !isCourtyardBedroom(room))
  const livingRoom = rooms.find((room) => room.type === 'living')
  const studyRoom = rooms.find((room) => room.type === 'study')
  const storageRoom = rooms.find((room) => room.type === 'storage')
  const courtyard = courtyardLayout(state.courtyardLevel, Boolean(compoundBedroom))
  const courtyardBackground = COURTYARD_BACKGROUNDS[state.courtyardLevel]
  const growthStage = valleyStage(state)
  const landscape = courtyardLandscapeDef(state.courtyardLandscape)
  const landscapePlacement = courtyardLandscapePlacement(
    state.courtyardLandscape,
    state.courtyardLevel,
  )
  const accents = courtyardAccents(
    state.courtyardLevel,
    state.placedDecorations,
    state.courtyardLandscape,
  )

  return (
    <div className="panel">
      <div
        className={`valley-scene valley-stage-${growthStage} courtyard-${courtyard.tier} landscape-${state.courtyardLandscape} has-compound${atHome.length ? ' has-company' : ''}${
          valleyRewardReady ? ' is-awake' : ''
        }`}
        aria-label="山谷"
        style={{
          '--valley-bg': `url("${publicAsset(courtyardBackground)}")`,
          '--valley-bg-small': `url("${publicAsset(courtyardBackground.replace('.webp', '-768.webp'))}")`,
        } as CSSProperties}
      >
        {valleyRewardReady && (
          <div className="valley-response" role="status">
            完成奖励已计入
          </div>
        )}
        {movingInNpcId && (
          <div className="move-in-home-state" aria-hidden="true">
            <span className="move-in-door" />
            <span className="move-in-window-silhouette" />
          </div>
        )}
        <div className="courtyard-ground-layer" aria-hidden="true">
          {landscape.asset && landscapePlacement && (
            <div
              className={`courtyard-landscape courtyard-landscape-${landscape.id}`}
              style={{
                left: `${landscapePlacement.x}%`,
                top: `${landscapePlacement.y}%`,
                width: `${landscapePlacement.width}%`,
              }}
            >
              <img
                src={publicAsset(`art/landscapes/${landscape.asset}`)}
                alt=""
                draggable={false}
              />
            </div>
          )}
          <div className="courtyard-accents">
            {accents.map((accent) => (
              <img
                key={accent.id}
                className="courtyard-accent"
                src={publicAsset(`art/landscapes/${accent.asset}`)}
                alt=""
                draggable={false}
                style={{
                  left: `${accent.x}%`,
                  top: `${accent.y}%`,
                  width: `${accent.width}%`,
                  zIndex: accent.layer,
                }}
              />
            ))}
          </div>
        </div>
        <div className="house-expansions" aria-label="已扩建房间">
          {compoundBedroom && courtyard.compoundSlot && (
            <button
              className={`room-module compound-bedroom level-4${
                compoundBedroom.id === lastBuiltRoomId ? ' is-new' : ''
              }`}
              style={{
                left: `${courtyard.compoundSlot.x}%`,
                bottom: `${courtyard.compoundSlot.bottom}%`,
                width: `${courtyard.compoundSlot.width}%`,
                zIndex: courtyard.compoundSlot.layer,
                ['--room-transform' as string]: 'scale(1)',
              } as CSSProperties}
              onClick={() => selectRoom(compoundBedroom.id)}
              aria-label={`院居，${roomResidentCount(compoundBedroom)}/3 人，点击查看`}
            >
              <img src={publicAsset(ROOM_EXTERIOR_ASSETS.bedroom[4])} alt="" draggable={false} />
              <span>院居 · {roomResidentCount(compoundBedroom)}/3</span>
            </button>
          )}
          {livingRoom && (
            <div className={`facility-building facility-living level-${livingRoom.level ?? 1}`}>
            <button className="facility-main-action" onClick={onOpenDesk} aria-label="进入正房案头">
              <img
                src={publicAsset(roomExteriorAsset('living', livingRoom.level ?? 1))}
                alt=""
                draggable={false}
              />
              <span>正房</span>
            </button>
            </div>
          )}
          {studyRoom && (
            <FacilityBuilding room={studyRoom} kind="study" courtyardLevel={state.courtyardLevel} label="书房" actionLabel="打开书房手册" onOpen={onOpenHandbook} />
          )}
          {storageRoom && (
            <FacilityBuilding room={storageRoom} kind="storage" courtyardLevel={state.courtyardLevel} label="库房" onOpen={onOpenStorehouse} />
          )}
          {standardRooms.slice(0, courtyard.slots.length).map((room, index) => {
            const level = room.level ?? 1
            const image = roomExteriorAsset(room.type, level)
            const slot = courtyard.slots[index]
            const occupantName = room.occupantId
              ? NPC_DEFS.find((npc) => npc.id === room.occupantId)?.name
              : null
            const displayName = occupantName
              ? `${occupantName}的房间`
              : room.type === 'bedroom'
                ? '空房间'
                : roomName(room.type)
            if (!image || !slot) return null
            return (
              <button
                key={room.id}
                className={`room-module role-${slot.role} level-${level}${
                  room.id === lastBuiltRoomId ? ' is-new' : ''
                }`}
                style={{
                  left: `${slot.x}%`,
                  bottom: `${slot.bottom}%`,
                  width: `${slot.width}%`,
                  zIndex: slot.layer,
                  ['--room-transform' as string]: slot.transform ?? 'scale(1)',
                } as CSSProperties}
                onClick={() => selectRoom(room.id)}
                aria-label={`${displayName}，点击查看`}
              >
                <img src={publicAsset(image)} alt="" draggable={false} />
                <span>{displayName}</span>
              </button>
            )
          })}
          {standardRooms.length > courtyard.slots.length && (
            <button className="courtyard-overflow" onClick={() => selectRoom(standardRooms[courtyard.slots.length]?.id ?? null)}>
              另院 +{standardRooms.length - courtyard.slots.length}
            </button>
          )}
        </div>
        <div className="valley-decorations" aria-label="山谷装饰">
          {DECORATION_DEFS.map((decoration) => {
            if (!state.placedDecorations.includes(decoration.id)) return null
            const spot = decorationSpot(
              state.courtyardLevel,
              decoration.id,
              state.courtyardLandscape,
            )
            if (!spot) return null
            return (
              <button
                key={decoration.id}
                className="valley-decoration"
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  width: `${spot.width}%`,
                  zIndex: spot.layer,
                  ['--decor-rotation' as string]: `${spot.rotation ?? 0}deg`,
                } as CSSProperties}
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
        {scenePeople.map(({ npc: n, activity }) => {
          const known = npcIsKnown(npc[n.id])
          return (
            <button
              key={n.id}
              className={`npc-spot activity-${n.id}${activity.zone === 'courtyard' ? ' is-courtyard-person' : ''}${known ? '' : ' is-silhouette'}${onboardingStep === 3 ? ' guide-target' : ''}`}
              style={{ left: activity.left, top: activity.top }}
              onClick={() => selectNpc(n.id)}
              aria-label={known ? `${n.name} · ${activity.label}` : '陌生的镇民'}
              title={known ? `${n.name} · ${activity.label}` : '陌生的镇民'}
            >
              <CharacterVisual
                n={n}
                spriteState={n.id === movingInNpcId ? 'moveIn' : 'walkAway'}
                animateWalking
              />
              {known && <small>{n.name}</small>}
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
  const [showInvite, setShowInvite] = useState(false)
  const [showGifts, setShowGifts] = useState(false)
  const [profilePage, setProfilePage] = useState<0 | 1>(0)

  useEffect(() => {
    setShowInvite(false)
    setShowGifts(false)
    setProfilePage(0)
  }, [id])

  if (!id || !npcState) return null
  const def = NPC_DEFS.find((n) => n.id === id)
  if (!def) return null
  const { f, r } = stageLabels(npcState)
  const inviteOk = canInvite(state, id)
  const chatReason = interactionBlockReason(state, id, 1)
  const heartReason = interactionBlockReason(state, id, 2, true)
  const romanceReason = romanceBlockReason(state, id)
  const inviteChecks = inviteRequirements(state, id)
  const giftBlockReason =
    inventory.length === 0
      ? '没有礼物'
      : npcState.interactionsToday >= INTERACTIONS_PER_NPC_PER_DAY
        ? `今日互动 ${INTERACTIONS_PER_NPC_PER_DAY}/${INTERACTIONS_PER_NPC_PER_DAY}`
        : null
  const friendshipTarget =
    Object.values(FRIENDSHIP_THRESHOLDS).find(
      (threshold) => threshold > npcState.friendshipPoints,
    ) ?? FRIENDSHIP_THRESHOLDS[3]
  const romanceTarget =
    Object.values(ROMANCE_THRESHOLDS).find(
      (threshold) => threshold > npcState.romancePoints,
    ) ?? ROMANCE_THRESHOLDS[4]
  const activeDialogue = dialogue?.npcId === id ? dialogue : null
  const known = npcIsKnown(npcState)
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
        {profilePage === 0 && <div
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
            <h2>{known || activeDialogue ? def.name : '？'}</h2>
            <p className="muted">
              {known
                ? def.blurb
                : activeDialogue
                  ? '刚打过招呼'
                  : '还没聊过，先打个招呼吧'}
            </p>
            {npcState.livingAtHome && (
              <span className="npc-home-mark" title="已入住" aria-label="已入住">
                <GameIcon name="home" />
              </span>
            )}
            {known ? (
            <div className="relationship-bars" aria-label="关系进度">
              <div>
                <span title={`友情：${FRIENDSHIP_LABELS[f]}`} aria-label={`友情：${FRIENDSHIP_LABELS[f]}`}><GameIcon name="chat" />友情</span>
                <strong>{Math.min(npcState.friendshipPoints, friendshipTarget)}/{friendshipTarget}</strong>
                <i role="progressbar" aria-label="友情进度" aria-valuemin={0} aria-valuemax={friendshipTarget} aria-valuenow={Math.min(npcState.friendshipPoints, friendshipTarget)}>
                  <b style={{ width: `${Math.min(100, npcState.friendshipPoints / friendshipTarget * 100)}%` }} />
                </i>
              </div>
              {npcState.romanceUnlocked && (
                <div className="is-romance">
                  <span title={`喜欢：${ROMANCE_LABELS[r]}`} aria-label={`喜欢：${ROMANCE_LABELS[r]}`}><GameIcon name="heart" />喜欢</span>
                  <strong>{Math.min(npcState.romancePoints, romanceTarget)}/{romanceTarget}</strong>
                  <i role="progressbar" aria-label="喜欢进度" aria-valuemin={0} aria-valuemax={romanceTarget} aria-valuenow={Math.min(npcState.romancePoints, romanceTarget)}>
                    <b style={{ width: `${Math.min(100, npcState.romancePoints / romanceTarget * 100)}%` }} />
                  </i>
                </div>
              )}
              <em title="今日互动" aria-label={`今日互动 ${npcState.interactionsToday}/3`}><GameIcon name="spark" />今日 {npcState.interactionsToday}/3</em>
            </div>
            ) : (
              <p className="muted npc-sheet-locked-hint">互动后才能查看详情</p>
            )}
          </div>
        </div>}

        {profilePage === 1 && known ? (
          <div className="journal-story-page">
            <section className="preference-journal journal-page-preferences" aria-labelledby="preference-title">
              <div className="preference-heading">
                <h3 id="preference-title"><GameIcon name="basket" />喜好</h3>
                <span>{giftKnowledge.length}/12</span>
              </div>
              {giftKnowledge.length > 0 && (
                <div className="preference-tags">
                  {giftKnowledge.map((gift) => (
                    <span
                      key={gift.id}
                      className={`is-${gift.reaction}`}
                      title={gift.reaction === 'liked' ? '喜欢' : gift.reaction === 'disliked' ? '不喜欢' : '普通'}
                    >
                      <i aria-hidden="true">{gift.reaction === 'liked' ? '♥' : gift.reaction === 'disliked' ? '×' : '·'}</i>
                      {gift.name}
                    </span>
                  ))}
                </div>
              )}
            </section>
            <section className="memory-album" aria-labelledby="memory-title">
            <div className="memory-heading journal-page-heading">
              <h3 id="memory-title"><GameIcon name="book" />故事</h3>
              <span>
                {relationshipEvents.filter((event) => unlockedEvents.has(event.id)).length}/{relationshipEvents.length}
              </span>
            </div>
            <p className="journal-person-name">{def.name}</p>
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
                      <RelationshipSymbol kind={event.track} stage={event.track === 'friendship' ? f : r} compact />
                    </span>
                    <strong>{unlocked ? event.title : '？'}</strong>
                  </button>
                )
              })}
            </div>
            </section>
          </div>
        ) : activeDialogue ? (
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
                    title={chatReason ?? '聊聊'}
                    onClick={() => chat(id)}
                  >
                    <GameIcon name="chat" /><span>聊聊</span>
                  </button>
                  <button
                    className="btn secondary"
                    disabled={Boolean(heartReason)}
                    title={heartReason ?? '深聊'}
                    onClick={() => heartTalk(id)}
                  >
                    <GameIcon name="spark" /><span>深聊</span>
                  </button>
                  {!npcState.romanceUnlocked && (
                    <button
                      className="btn secondary"
                      disabled={Boolean(romanceReason)}
                      title={romanceReason ?? '表白'}
                      onClick={() => unlockRomance(id)}
                    >
                      <GameIcon name="heart" /><span>表白</span>
                    </button>
                  )}
                  <button
                    className="btn secondary"
                    disabled={Boolean(giftBlockReason)}
                    title={giftBlockReason ?? '送礼'}
                    aria-expanded={showGifts || undefined}
                    aria-controls="gift-quick-picker"
                    onClick={() => setShowGifts((value) => !value)}
                  >
                    <GameIcon name="basket" /><span>送礼</span>
                  </button>
                  <button
                    className={`btn${inviteOk ? '' : ' is-unavailable'}`}
                    aria-expanded={showInvite || undefined}
                    aria-controls="invite-requirements"
                    title={
                      inviteOk ? '邀请同住' : '查看同住条件'
                    }
                    onClick={() => inviteOk ? invitePartner(id) : setShowInvite((value) => !value)}
                  >
                    <GameIcon name="home" /><span>邀请同住</span>
                  </button>
                </>
              )}
              {npcState.livingAtHome && (
                <>
                  <button className="btn" title="喝茶" onClick={() => teaWith(id)}>
                    <GameIcon name="ladle" /><span>喝茶</span>
                  </button>
                  <button
                    className="btn secondary"
                    disabled={Boolean(giftBlockReason)}
                    title={giftBlockReason ?? '送礼'}
                    aria-expanded={showGifts || undefined}
                    aria-controls="gift-quick-picker"
                    onClick={() => setShowGifts((value) => !value)}
                  >
                    <GameIcon name="basket" /><span>送礼</span>
                  </button>
                  <button className="btn danger" title="搬出去" onClick={() => separatePartner(id)}>
                    <GameIcon name="home" /><span>搬出</span>
                  </button>
                </>
              )}
            </div>

            {showGifts && !giftBlockReason && (
              <div id="gift-quick-picker" className="gift-quick-picker" aria-label="选择礼物">
                {inventory.map((gift) => {
                  const known = npcState.giftDiscoveries[gift.id]
                  return (
                    <button
                      key={gift.id}
                      className="btn secondary"
                      onClick={() => {
                        giveGift(id, gift.id)
                        setShowGifts(false)
                      }}
                    >
                      {giftName(gift.id)} ×{gift.qty}
                      {known === 'liked' ? ' ♥' : known === 'disliked' ? ' ×' : ''}
                    </button>
                  )
                })}
              </div>
            )}

            {!npcState.livingAtHome && showInvite && (
                <div id="invite-requirements" className="invite-checks" aria-label="邀请入住条件">
                  {inviteChecks.map((requirement, index) => (
                    <div
                      key={requirement.label}
                      className={requirement.met ? 'is-met' : ''}
                    >
                      <span aria-hidden="true"><GameIcon name={index === 0 ? 'heart' : index === 1 ? 'home' : 'coin'} />{index === 0 ? '关系' : index === 1 ? '空房' : '金币'}</span>
                      <p>
                        <strong>{requirement.value}/{requirement.target}</strong>
                        <i
                          className="requirement-track"
                          role="progressbar"
                          aria-label={`${requirement.label}进度`}
                          aria-valuemin={0}
                          aria-valuemax={requirement.target}
                          aria-valuenow={requirement.value}
                        >
                          <b style={{ width: `${requirement.value / requirement.target * 100}%` }} />
                        </i>
                      </p>
                    </div>
                  ))}
                </div>
            )}

          </>
        )}

        {known && relationshipEvents.length > 0 && !activeDialogue && (
          <nav className="journal-page-nav" aria-label="人物手记分页">
            {profilePage === 1 && (
              <button
                className="previous"
                type="button"
                onClick={() => setProfilePage(0)}
                aria-label="上一页：互动"
              >
                ← 互动
              </button>
            )}
            <span>{profilePage + 1}/2</span>
            {profilePage === 0 && (
              <button
                className="next"
                type="button"
                onClick={() => setProfilePage(1)}
                aria-label="下一页：详情"
              >
                详情 →
              </button>
            )}
          </nav>
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
