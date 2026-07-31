import { useRef } from 'react'
import { DECORATION_DEFS, GIFT_DEFS, ROOM_DEFS } from '../core/constants'
import {
  partnerIds,
  totalDailyMaintenance,
  useGameStore,
} from '../core/gameStore'
import { NPC_DEFS } from '../core/npcs'
import { dailyCostPerPerson } from '../core/economy'
import { giftCapacity, inventoryCount } from '../core/growth'
import { valleyStage } from '../core/growth'
import { serializeState } from '../core/storage'
import { GiftIcon, type GiftIconName } from '../assets/icons/GiftIcon'
import { BetaPrivacyPanel } from './BetaPrivacyPanel'
import { PwaInstallGuide } from './PwaStatus'

export function BagPanel() {
  const coins = useGameStore((s) => s.coins)
  const bond = useGameStore((s) => s.bond)
  const rooms = useGameStore((s) => s.rooms)
  const inventory = useGameStore((s) => s.inventory)
  const buyRoom = useGameStore((s) => s.buyRoom)
  const buyGift = useGameStore((s) => s.buyGift)
  const buyDecoration = useGameStore((s) => s.buyDecoration)
  const toggleDecoration = useGameStore((s) => s.toggleDecoration)
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

  return (
    <div className="panel">
      <h2 className="section-title">口袋</h2>
      <p className="hint">
        金币 {coins} · 精力 {bond}/10 · 明天花 {maintenance}
        {partners.length > 0 ? `（${partners.length}人 ×${per}）` : ''}
      </p>

      {partners.length > 0 && (
        <p className="muted">
          同住：
          {partners
            .map((id) => NPC_DEFS.find((n) => n.id === id)?.name)
            .join('、')}
        </p>
      )}

      <h2 className="section-title" style={{ marginTop: 18 }}>
        房间
      </h2>
      <div className="shop-grid">
        {ROOM_DEFS.filter((r) => r.type !== 'living').map((r) => {
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
              {shortage > 0 && (
                <small className="shop-lock">还差 {shortage} 金币</small>
              )}
            </button>
          )
        })}
      </div>

      <h2 className="section-title" style={{ marginTop: 22 }}>
        山谷装饰
      </h2>
      <p className="hint">
        已收藏 {state.decorations.length}/{DECORATION_DEFS.length} · 已摆放{' '}
        {state.placedDecorations.length}/6
      </p>
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
                <small className="shop-lock">
                  山谷第 {decoration.stage + 1} 阶段解锁
                </small>
              )}
            </button>
          )
        })}
      </div>

      <h2 className="section-title" style={{ marginTop: 22 }}>
        礼物
      </h2>
      <p className="hint">
        礼物袋 {giftCount}/{capacity}
        {rooms.some((room) => room.type === 'storage')
          ? ' · 储藏室让礼物有了更多位置'
          : ' · 扩建储藏室可增加 8 格'}
      </p>
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
              {shortage > 0 && (
                <small className="shop-lock">还差 {shortage} 金币</small>
              )}
              {shortage === 0 && giftCount >= capacity && (
                <small className="shop-lock">礼物袋已满</small>
              )}
            </button>
          )
        })}
      </div>

      <h2 className="section-title" style={{ marginTop: 24 }}>
        存档
      </h2>
      <p className="hint">自动保存在本机；也可以备份成 JSON 文件。</p>
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
    </div>
  )
}
