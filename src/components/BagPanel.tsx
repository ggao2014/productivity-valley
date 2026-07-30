import { GIFT_DEFS, ROOM_DEFS } from '../core/constants'
import {
  partnerIds,
  totalDailyMaintenance,
  useGameStore,
} from '../core/gameStore'
import { NPC_DEFS } from '../core/npcs'
import { dailyCostPerPerson } from '../core/economy'

export function BagPanel() {
  const coins = useGameStore((s) => s.coins)
  const bond = useGameStore((s) => s.bond)
  const rooms = useGameStore((s) => s.rooms)
  const inventory = useGameStore((s) => s.inventory)
  const buyRoom = useGameStore((s) => s.buyRoom)
  const buyGift = useGameStore((s) => s.buyGift)
  const resetGame = useGameStore((s) => s.resetGame)
  const partners = useGameStore((s) => partnerIds(s))
  const maintenance = useGameStore((s) => totalDailyMaintenance(s))
  const per = dailyCostPerPerson(rooms)

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
          return (
            <button
              key={r.type}
              className="shop-card"
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
            </button>
          )
        })}
      </div>

      <h2 className="section-title" style={{ marginTop: 22 }}>
        礼物
      </h2>
      <div className="shop-grid">
        {GIFT_DEFS.map((g) => {
          const qty = inventory.find((i) => i.id === g.id)?.qty ?? 0
          return (
            <button
              key={g.id}
              className="shop-card"
              onClick={() => buyGift(g.id)}
              disabled={coins < g.cost}
            >
              <strong>{g.name}</strong>
              <span className="muted">{g.blurb}</span>
              <span>
                {g.cost} 金币{qty ? ` · 有${qty}` : ''}
              </span>
            </button>
          )
        })}
      </div>

      <div className="actions" style={{ marginTop: 24 }}>
        <button
          className="btn danger"
          onClick={() => {
            if (confirm('清空进度，重新开始？')) resetGame()
          }}
        >
          重置
        </button>
      </div>
    </div>
  )
}
