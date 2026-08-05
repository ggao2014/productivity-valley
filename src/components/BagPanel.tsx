import { useRef, useState } from 'react'
import {
  DECORATION_DEFS,
  COURTYARD_LEVELS,
  GIFT_DEFS,
  ROOM_DEFS,
  ROOM_UPGRADE_COSTS,
} from '../core/constants'
import {
  partnerIds,
  totalDailyMaintenance,
  useGameStore,
} from '../core/gameStore'
import { NPC_DEFS } from '../core/npcs'
import { dailyCostPerPerson } from '../core/economy'
import { giftCapacity, inventoryCount } from '../core/growth'
import { VALLEY_STAGES, valleyGrowthPoints, valleyStage } from '../core/growth'
import { serializeState } from '../core/storage'
import {
  COURTYARD_LANDSCAPE_DEFS,
} from '../core/courtyardLandscapes'
import { GiftIcon, type GiftIconName } from '../assets/icons/GiftIcon'
import { BetaPrivacyPanel } from './BetaPrivacyPanel'
import { PwaInstallGuide } from './PwaStatus'
import { DebugPanel } from './DebugPanel'
import {
  canAddRoom,
  canUpgradeBedroomToCourtyard,
  courtyardCapacityUsed,
  isCourtyardBedroom,
  maxRoomLevel,
  roomResidentCount,
  roomTypeLimitReached,
} from '../core/roomRules'
import type { RoomInstance } from '../core/types'

type BagMode = 'home' | 'storehouse' | 'settings'

export function BagPanel({ mode = 'storehouse', embedded = false }: { mode?: BagMode; embedded?: boolean }) {
  const coins = useGameStore((s) => s.coins)
  const bond = useGameStore((s) => s.bond)
  const rooms = useGameStore((s) => s.rooms)
  const inventory = useGameStore((s) => s.inventory)
  const buyRoom = useGameStore((s) => s.buyRoom)
  const upgradeCourtyard = useGameStore((s) => s.upgradeCourtyard)
  const upgradeRoom = useGameStore((s) => s.upgradeRoom)
  const buyGift = useGameStore((s) => s.buyGift)
  const buyDecoration = useGameStore((s) => s.buyDecoration)
  const toggleDecoration = useGameStore((s) => s.toggleDecoration)
  const buyCourtyardLandscape = useGameStore((s) => s.buyCourtyardLandscape)
  const selectCourtyardLandscape = useGameStore((s) => s.selectCourtyardLandscape)
  const resetGame = useGameStore((s) => s.resetGame)
  const importSave = useGameStore((s) => s.importSave)
  const state = useGameStore()
  const fileInput = useRef<HTMLInputElement>(null)
  const partners = partnerIds(state)
  const maintenance = useGameStore((s) => totalDailyMaintenance(s))
  const per = dailyCostPerPerson(rooms)
  const giftCount = inventoryCount(state)
  const capacity = giftCapacity(state)
  const growthStage = valleyStage(state)
  const growthPoints = valleyGrowthPoints(state)
  const [view, setView] = useState<'rooms' | 'decorations' | 'gifts' | 'settings'>(
    mode === 'home' ? 'rooms' : mode === 'settings' ? 'settings' : 'gifts',
  )
  const [homeView, setHomeView] = useState<'build' | 'upgrade'>('build')
  const usedPlots = courtyardCapacityUsed(rooms)
  const courtyard = COURTYARD_LEVELS[state.courtyardLevel]
  const courtyardFull = usedPlots >= courtyard.capacity
  const buildOptions = ROOM_DEFS.filter(
    (room) =>
      !['living', 'study', 'storage'].includes(room.type) &&
      canAddRoom(rooms, state.courtyardLevel, room.type) &&
      !roomTypeLimitReached(rooms, room.type),
  )
  const upgradableRooms = rooms.filter((room) => (room.level ?? 1) < maxRoomLevel(room.type))
  const maxedRooms = rooms.filter((room) => (room.level ?? 1) >= maxRoomLevel(room.type))
  const upgradeGroups: Array<{ title: string; rooms: RoomInstance[] }> = [
    { title: '基础房间', rooms: upgradableRooms.filter((room) => ['living', 'study', 'storage'].includes(room.type)) },
    { title: '居住房间', rooms: upgradableRooms.filter((room) => ['bedroom', 'guest'].includes(room.type)) },
    { title: '功能房间', rooms: upgradableRooms.filter((room) => room.type === 'kitchen') },
  ]

  function roomTitle(room: RoomInstance) {
    const definition = ROOM_DEFS.find((item) => item.type === room.type)
    const occupant = NPC_DEFS.find((npc) => npc.id === room.occupantId)
    if (isCourtyardBedroom(room)) return `院居 · ${roomResidentCount(room)}/3`
    if (occupant) return `${occupant.name}的房间`
    return room.type === 'bedroom' ? '空房间' : definition?.name ?? room.type
  }

  function upgradeRow(room: RoomInstance) {
    const level = room.level ?? 1
    const upgradeCost = ROOM_UPGRADE_COSTS[room.type][level as 1 | 2 | 3]
    const courtyardUpgradeAvailable = room.type !== 'bedroom' || level !== 3 ||
      canUpgradeBedroomToCourtyard(rooms, state.courtyardLevel, room.id)
    const block = room.type === 'bedroom' && level === 3 && !courtyardUpgradeAvailable
      ? state.courtyardLevel < 4
        ? '需二进院'
        : rooms.some((item) => item.id !== room.id && isCourtyardBedroom(item))
          ? '已有院居'
          : '需空出两格'
      : null
    return (
      <div className="owned-room-row compact-upgrade-row" key={room.id}>
        <span>
          <strong>{roomTitle(room)}</strong>
          <small>{level} → {level + 1}</small>
        </span>
        {block ? (
          <span className="room-upgrade-note">{block}</span>
        ) : (
          <button
            type="button"
            className="room-upgrade-mini"
            disabled={upgradeCost === undefined || coins < upgradeCost || !courtyardUpgradeAvailable}
            title={upgradeCost !== undefined && coins < upgradeCost ? `还差 ${upgradeCost - coins} 金币` : undefined}
            onClick={() => upgradeRoom(room.id)}
          >
            {upgradeCost} 金币
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={embedded ? 'facility-panel is-embedded' : 'panel facility-panel'}>
      {!embedded && <h2 className="section-title">{mode === 'home' ? '院宅' : mode === 'settings' ? '设置' : '库房'}</h2>}
      {mode === 'home' && !embedded && (
      <div className="wallet-summary" aria-label="资源概览">
        <span><b>{coins}</b><small>金币</small></span>
        <span><b>{bond}/10</b><small>精力</small></span>
        <span><b>{maintenance}</b><small>明日维护</small></span>
        {partners.length > 0 && <span><b>{partners.length} × {per}</b><small>同住人数 × 单人</small></span>}
      </div>
      )}

      {mode === 'home' && !embedded && partners.length > 0 && (
        <p className="muted">
          同住：
          {partners
            .map((id) => NPC_DEFS.find((n) => n.id === id)?.name)
            .join('、')}
        </p>
      )}

      {mode === 'storehouse' && <nav className="bag-tabs" aria-label="库房分类">
        <button className={view === 'decorations' ? 'active' : ''} aria-current={view === 'decorations' ? 'page' : undefined} onClick={() => setView('decorations')}>装饰</button>
        <button className={view === 'gifts' ? 'active' : ''} aria-current={view === 'gifts' ? 'page' : undefined} onClick={() => setView('gifts')}>礼物</button>
      </nav>}

      {mode === 'home' && embedded && <nav className="bag-tabs home-manage-tabs" aria-label="院宅管理">
        <button className={homeView === 'build' ? 'active' : ''} aria-current={homeView === 'build' ? 'page' : undefined} onClick={() => setHomeView('build')}>建设</button>
        <button className={homeView === 'upgrade' ? 'active' : ''} aria-current={homeView === 'upgrade' ? 'page' : undefined} onClick={() => setHomeView('upgrade')}>升级</button>
      </nav>}

      {view === 'rooms' && <div className="bag-tab-content">
        {homeView === 'build' && <>
        <div className="home-build-summary"><span>可用宅地</span><strong>{Math.max(0, courtyard.capacity - usedPlots)}</strong></div>
        {courtyardFull && state.courtyardLevel < 4 && (
        <section className="courtyard-upgrade-card" aria-label="院落等级">
          <span>
            <strong>{COURTYARD_LEVELS[state.courtyardLevel].name}</strong>
            <small>{usedPlots}/{courtyard.capacity}</small>
          </span>
          {state.courtyardLevel < 4 && (
            <button
              type="button"
              className="room-upgrade-mini"
              disabled={
                !courtyardFull ||
                coins < (COURTYARD_LEVELS[state.courtyardLevel].upgradeCost ?? 0)
              }
              title={
                !courtyardFull
                  ? `${usedPlots}/${courtyard.capacity}`
                  : undefined
              }
              onClick={upgradeCourtyard}
            >
              扩院 · {COURTYARD_LEVELS[state.courtyardLevel].upgradeCost}
            </button>
          )}
        </section>
        )}
        <div className="shop-grid room-shop-grid">
        {buildOptions.map((r) => {
          const owned = rooms.filter((x) => x.type === r.type).length
          const shortage = Math.max(0, r.cost - coins)
          return (
            <button
              key={r.type}
              className="shop-card gift-shop-card"
              onClick={() => buyRoom(r.type)}
              disabled={coins < r.cost}
            >
              <strong>{r.name}</strong>
              <span className="muted">{r.blurb}</span>
              <span>
                {r.cost} 金币
                {owned ? ` · 已有${owned}` : ''}
                {r.capacity ? ' · 可住' : ''}
              </span>
              {shortage > 0 && <ShopMeter value={coins} target={r.cost} label="金币" />}
            </button>
          )
        })}
        </div>
        {buildOptions.length === 0 && (
          <p className="home-action-empty">{courtyardFull && state.courtyardLevel < 4 ? '宅地已满，可以扩院' : '当前没有可建设的房间'}</p>
        )}
        </>}

        {homeView === 'upgrade' && <div className="upgrade-groups">
          {upgradeGroups.filter((group) => group.rooms.length > 0).map((group) => (
            <section className="upgrade-group" key={group.title}>
              <h4>{group.title}</h4>
              <div className="owned-room-list">{group.rooms.map(upgradeRow)}</div>
            </section>
          ))}
          {upgradableRooms.length === 0 && <p className="home-action-empty">所有房间均已升满</p>}
          {maxedRooms.length > 0 && (
            <details className="maxed-room-list">
              <summary>已升满 {maxedRooms.length}</summary>
              {maxedRooms.map((room) => <div key={room.id}><span>{roomTitle(room)}</span><small>{room.level ?? 1}/{maxRoomLevel(room.type)}</small></div>)}
            </details>
          )}
        </div>}
      </div>}

      {view === 'decorations' && <div className="bag-tab-content">
      <section className="landscape-picker" aria-labelledby="landscape-picker-title">
        <div className="landscape-picker-heading">
          <span>
            <strong id="landscape-picker-title">庭院主景</strong>
            <small>选择一套</small>
          </span>
        </div>
        <div className="landscape-card-grid">
          {COURTYARD_LANDSCAPE_DEFS.map((landscape) => {
            const owned = state.ownedLandscapes.includes(landscape.id)
            const selected = state.courtyardLandscape === landscape.id
            const levelLocked = state.courtyardLevel < landscape.minCourtyardLevel
            const stageLocked = growthStage < landscape.stage
            const locked = levelLocked || stageLocked
            return (
              <button
                key={landscape.id}
                type="button"
                className={`landscape-card${selected ? ' is-selected' : ''}`}
                onClick={() => owned
                  ? selectCourtyardLandscape(landscape.id)
                  : buyCourtyardLandscape(landscape.id)}
                disabled={!owned && (locked || coins < landscape.cost)}
                aria-pressed={selected}
              >
                <span className={`landscape-preview landscape-preview-${landscape.id}`}>
                  {landscape.asset && (
                    <img
                      src={`${import.meta.env.BASE_URL}art/landscapes/${landscape.asset}`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  )}
                </span>
                <span className="landscape-card-copy">
                  <strong>{landscape.name}</strong>
                  <small>{landscape.blurb}</small>
                </span>
                <span className="landscape-card-state">
                  {selected
                    ? '使用中'
                    : owned
                      ? '使用'
                      : locked
                        ? levelLocked
                          ? `需${landscape.minCourtyardLevel}级院落`
                          : `阶段 ${landscape.stage}`
                        : `${landscape.cost} 金币`}
                </span>
              </button>
            )
          })}
        </div>
      </section>
      <div className="collection-meters">
        <ShopMeter value={state.decorations.length} target={DECORATION_DEFS.length} label="收藏" />
        <ShopMeter value={state.placedDecorations.length} target={6} label="摆放" />
      </div>
      <div className="shop-grid decoration-shop-grid">
        {DECORATION_DEFS.map((decoration) => {
          const owned = state.decorations.includes(decoration.id)
          const placed = state.placedDecorations.includes(decoration.id)
          const stageLocked = growthStage < decoration.stage
          return (
            <button
              key={decoration.id}
              className={`shop-card decoration-shop-card${placed ? ' is-placed' : ''}`}
              onClick={() =>
                owned
                  ? toggleDecoration(decoration.id)
                  : buyDecoration(decoration.id)
              }
              disabled={
                (!owned && (stageLocked || coins < decoration.cost)) ||
                (owned && !placed && state.placedDecorations.length >= 6)
              }
            >
              <img
                src={`${import.meta.env.BASE_URL}art/decorations/${decoration.asset}`}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <strong>{decoration.name}</strong>
              <span className="muted">{decoration.blurb}</span>
              <span>
                {owned
                  ? placed
                    ? '已摆放 · 点击收起'
                    : '已收藏 · 点击摆放'
                  : `${decoration.cost} 金币`}
              </span>
              {!owned && stageLocked && (
                decoration.stage === 3 && growthPoints >= VALLEY_STAGES[3].threshold && partners.length === 0
                  ? <small className="shop-lock">需有同住者</small>
                  : <ShopMeter value={growthPoints} target={VALLEY_STAGES[decoration.stage].threshold} label="成长" />
              )}
            </button>
          )
        })}
      </div>
      </div>}

      {view === 'gifts' && <div className="bag-tab-content">
      <div className="collection-meters">
        <ShopMeter value={giftCount} target={capacity} label="礼物袋" />
      </div>
      <div className="shop-grid">
        {GIFT_DEFS.map((g) => {
          const qty = inventory.find((i) => i.id === g.id)?.qty ?? 0
          const shortage = Math.max(0, g.cost - coins)
          return (
            <button
              key={g.id}
              className="shop-card"
              onClick={() => buyGift(g.id)}
              disabled={coins < g.cost || giftCount >= capacity}
            >
              <div className="gift-card-head">
                <GiftIcon name={g.id as GiftIconName} />
                <strong>{g.name}</strong>
                {qty > 0 && <em>×{qty}</em>}
              </div>
              <span className="muted">{g.blurb}</span>
              <span>
                {g.cost} 金币
              </span>
              {shortage > 0 && <ShopMeter value={coins} target={g.cost} label="金币" />}
              {shortage === 0 && giftCount >= capacity && (
                <small className="shop-lock">礼物袋已满</small>
              )}
            </button>
          )
        })}
      </div>
      </div>}

      {view === 'settings' && <div className="bag-tab-content bag-settings">
      <div className="actions">
        <button
          className="btn secondary"
          onClick={() => {
            const blob = new Blob([serializeState(state)], {
              type: 'application/json',
            })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `productivity-valley-${new Date()
              .toISOString()
              .slice(0, 10)}.json`
            link.click()
            URL.revokeObjectURL(url)
          }}
        >
          导出存档
        </button>
        <button
          className="btn secondary"
          onClick={() => fileInput.current?.click()}
        >
          导入存档
        </button>
        <input
          ref={fileInput}
          className="visually-hidden"
          type="file"
          accept="application/json,.json"
          aria-label="选择存档文件"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (file && file.size > 5_000_000) {
              alert('存档文件过大，未导入')
            } else if (file && confirm('导入会替换当前进度，继续吗？')) {
              importSave(await file.text())
            }
            event.target.value = ''
          }}
        />
        <button
          className="btn danger"
          onClick={() => {
            if (confirm('清空进度，重新开始？')) resetGame()
          }}
        >
          重置
        </button>
      </div>
      <BetaPrivacyPanel />
      <PwaInstallGuide />
      <DebugPanel />
      </div>}
    </div>
  )
}

function ShopMeter({ value, target, label }: { value: number; target: number; label: string }) {
  const current = Math.min(value, target)
  return (
    <span className="shop-meter">
      <small>{label} {current}/{target}</small>
      <i role="progressbar" aria-label={`${label}进度`} aria-valuemin={0} aria-valuemax={target} aria-valuenow={current}>
        <b style={{ width: `${target > 0 ? current / target * 100 : 0}%` }} />
      </i>
    </span>
  )
}
