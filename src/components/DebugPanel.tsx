import { useState } from 'react'
import { NPC_DEFS } from '../core/npcs'
import { useGameStore } from '../core/gameStore'

export function DebugPanel() {
  const state = useGameStore()
  const debugSetValues = useGameStore((s) => s.debugSetValues)
  const [open, setOpen] = useState(false)
  const [npcId, setNpcId] = useState('shendu')
  const [coins, setCoins] = useState(state.coins)
  const [bond, setBond] = useState(state.bond)
  const selected = state.npc[npcId]
  const [friendship, setFriendship] = useState(selected?.friendshipPoints ?? 0)
  const [romance, setRomance] = useState(selected?.romancePoints ?? 0)

  if (!import.meta.env.DEV) return null

  function selectNpc(id: string) {
    setNpcId(id)
    setFriendship(state.npc[id]?.friendshipPoints ?? 0)
    setRomance(state.npc[id]?.romancePoints ?? 0)
  }

  return (
    <>
      <button
        className="debug-entry"
        onClick={() => {
          setCoins(state.coins)
          setBond(state.bond)
          setFriendship(state.npc[npcId]?.friendshipPoints ?? 0)
          setRomance(state.npc[npcId]?.romancePoints ?? 0)
          setOpen(true)
        }}
      >
        测试数值
      </button>
      {open && (
        <div className="sheet debug-sheet" onClick={() => setOpen(false)}>
          <form
            className="sheet-card debug-card"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault()
              debugSetValues({ coins, bond, npcId, friendship, romance })
              setOpen(false)
            }}
          >
            <div className="debug-heading">
              <h2>测试数值</h2>
              <span>仅本地开发</span>
            </div>
            <div className="debug-grid">
              <label>金币<input type="number" min="0" value={coins} onChange={(event) => setCoins(Number(event.target.value))} /></label>
              <label>精力<input type="number" min="0" max="10" value={bond} onChange={(event) => setBond(Number(event.target.value))} /></label>
              <label className="debug-wide">镇民<select value={npcId} onChange={(event) => selectNpc(event.target.value)}>{NPC_DEFS.map((npc) => <option key={npc.id} value={npc.id}>{npc.name}</option>)}</select></label>
              <label>友情<input type="number" min="0" value={friendship} onChange={(event) => setFriendship(Number(event.target.value))} /></label>
              <label>爱情<input type="number" min="0" value={romance} onChange={(event) => setRomance(Number(event.target.value))} /></label>
            </div>
            <div className="actions">
              <button className="btn" type="submit">应用</button>
              <button className="btn secondary" type="button" onClick={() => setOpen(false)}>取消</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
