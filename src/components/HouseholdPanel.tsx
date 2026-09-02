import { useMemo, useState } from 'react'
import { useGameStore } from '../core/gameStore'
import { choreIsDue, configuredHomeRooms, FREQUENCY_LABELS, roomMaintenance, type ChoreDefinition, type HomeFloor } from '../core/household'
import type { ChoreFrequency, ChorePreference } from '../core/types'

export function HouseholdPanel() {
  const completions = useGameStore((state) => state.choreCompletions)
  const preferences = useGameStore((state) => state.chorePreferences)
  const customChores = useGameStore((state) => state.customChores)
  const toggleChore = useGameStore((state) => state.toggleChore)
  const [floor, setFloor] = useState<HomeFloor>('first')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const configuredRooms = useMemo(() => configuredHomeRooms(preferences, customChores), [preferences, customChores])
  const rooms = configuredRooms.filter((room) => room.floor === floor)
  const selected = configuredRooms.find((room) => room.id === roomId)
  const allMaintenance = Math.round(configuredRooms.reduce((sum, room) => sum + roomMaintenance(room, completions), 0) / configuredRooms.length)
  const roomGlyphs: Record<string, string> = { 'living-dining': '⌂', kitchen: '♨', 'powder-room': '◇', study: '✎', laundry: '≈', 'guest-bath': '◇', 'guest-bedroom': '☆', 'primary-bedroom': '☾', 'primary-bathroom': '◇' }

  return <div className="household-panel">
    <header className="household-heading"><div><span className="broom-mark">⌁</span><strong>家园清扫</strong></div><div className="household-heading-actions"><button className={settingsOpen ? 'is-active' : ''} onClick={() => { setSettingsOpen((value) => !value); setRoomId(null) }} aria-label="家务设置">⚙</button><div className="home-glow"><span style={{ '--home-progress': `${allMaintenance}%` } as React.CSSProperties}>{allMaintenance}</span><small>全屋维护</small></div></div></header>
    {settingsOpen ? <ChoreSettings rooms={configuredRooms} customIds={new Set(customChores.map((item) => item.id))} /> : <>
    <nav className="floor-tabs" aria-label="楼层">
      <button className={floor === 'first' ? 'active' : ''} onClick={() => { setFloor('first'); setRoomId(null) }}>一楼</button>
      <button className={floor === 'second' ? 'active' : ''} onClick={() => { setFloor('second'); setRoomId(null) }}>二楼</button>
    </nav>
    <div className="home-map-frame">
    <div className="map-caption"><span>{floor === 'first' ? '一楼' : '二楼'}</span><small><i />清爽 <i />待照料</small></div>
    <div className={`home-map home-map-${floor}`} aria-label={`${floor === 'first' ? '一' : '二'}楼家园地图`}>
      <span className="map-compass" aria-hidden="true">N</span>
      {floor === 'first' ? <>
        <span className="map-ghost map-garage">车库</span>
        <span className="map-ghost map-patio">庭院</span>
        <span className="map-ghost map-pantry">储藏</span>
        <span className="map-ghost map-deck">露台</span>
        <span className="map-ghost map-porch">门廊</span>
        <span className="map-stairs">楼梯</span>
      </> : <>
        <span className="map-ghost map-wic-top">衣帽</span>
        <span className="map-ghost map-hall">走廊</span>
        <span className="map-ghost map-wic-bottom">衣帽</span>
        <span className="map-stairs">楼梯</span>
      </>}
      {rooms.map((room) => {
        const maintenance = roomMaintenance(room, completions)
        const due = room.chores.filter((item) => choreIsDue(item.frequency, completions[item.id]?.completedAt)).length
        const compact = ['powder-room', 'laundry', 'guest-bath', 'primary-bathroom'].includes(room.mapClass)
        return <button key={room.id} aria-label={`${room.name}，维护度 ${maintenance}%${due > 0 ? `，${due} 项待照料` : ''}`} className={`map-room map-room-${room.mapClass}${compact ? ' is-compact' : ''}${maintenance === 100 ? ' is-clean' : ''}${selected?.id === room.id ? ' is-selected' : ''}`} onClick={() => setRoomId(room.id)}>
          {!compact && <b className="room-glyph" aria-hidden="true">{roomGlyphs[room.id]}</b>}
          {due > 0 && (
            <svg className="room-due" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
              <circle cx="10" cy="10" r="10" fill="#6b8a5a" />
              <text
                x="10"
                y="13.25"
                textAnchor="middle"
                fill="#fff"
                fontSize="9"
                fontWeight="700"
                fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
              >
                {due}
              </text>
            </svg>
          )}
          <span className="room-copy">
            <strong>{room.mapName ?? room.name}</strong>
            <span className="room-state">{maintenance}%</span>
          </span>
        </button>
      })}
    </div>
    </div>
    {selected && <section className="room-chore-sheet" aria-label={`${selected.name}清扫清单`}>
      <header><div><strong>{selected.name}</strong><small>维护度 {roomMaintenance(selected, completions)}%</small></div><button aria-label="关闭房间清单" onClick={() => setRoomId(null)}>×</button></header>
      <div className="chore-list">{selected.chores.map((item) => {
        const done = !choreIsDue(item.frequency, completions[item.id]?.completedAt)
        return <details key={item.id} className={done ? 'is-done' : ''}>
          <summary><button className="chore-check" aria-label={`${done ? '恢复' : '完成'}${item.title}`} onClick={(event) => { event.preventDefault(); toggleChore(item.id) }}>{done ? '✓' : ''}</button><span><strong>{item.title}</strong><small>{FREQUENCY_LABELS[item.frequency]} · {item.details.length} 个细项</small></span></summary>
          <ul>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        </details>
      })}</div>
    </section>}
    </>}
  </div>
}

export function TodayChores() {
  const completions = useGameStore((state) => state.choreCompletions)
  const plan = useGameStore((state) => state.chorePlan)
  const preferences = useGameStore((state) => state.chorePreferences)
  const customChores = useGameStore((state) => state.customChores)
  const toggleChore = useGameStore((state) => state.toggleChore)
  const [expanded, setExpanded] = useState(false)
  const allChores = useMemo(() => configuredHomeRooms(preferences, customChores).flatMap((room) => room.chores.map((item) => ({ ...item, roomName: room.name }))), [preferences, customChores])
  const scheduled = allChores.filter((item) => item.enabled !== false && ((item.frequency === 'daily' && item.includeInToday !== false) || plan.choreIds.includes(item.id)))
  const due = scheduled.filter((item) => choreIsDue(item.frequency, completions[item.id]?.completedAt))
  const visible = expanded ? due : due.slice(0, 3)
  return <section className={`today-chores${due.length === 0 ? ' is-complete' : ''}`}>
    <button className="today-chores-heading" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
      <span><b>今日家务</b><small>{due.length ? `${due.length} 处等你照料` : '家中清爽'}</small></span><strong>{scheduled.length - due.length}/{scheduled.length}</strong>
    </button>
    {visible.length > 0 && <div className="today-chore-list">{visible.map((item) => <button key={item.id} onClick={() => toggleChore(item.id)}><i /><span><strong>{item.title}</strong><small>{item.roomName} · {FREQUENCY_LABELS[item.frequency]}</small></span></button>)}</div>}
    {!expanded && due.length > 3 && <button className="today-chores-more" onClick={() => setExpanded(true)}>再看 {due.length - 3} 项</button>}
  </section>
}

const FREQUENCIES = Object.keys(FREQUENCY_LABELS) as ChoreFrequency[]

function ChoreSettings({ rooms, customIds }: { rooms: ReturnType<typeof configuredHomeRooms>; customIds: Set<string> }) {
  const setPreference = useGameStore((state) => state.setChorePreference)
  const addCustomChore = useGameStore((state) => state.addCustomChore)
  const deleteCustomChore = useGameStore((state) => state.deleteCustomChore)
  const resetSettings = useGameStore((state) => state.resetHouseholdSettings)
  const [editing, setEditing] = useState<{ id: string; draft: ChorePreference } | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newRoom, setNewRoom] = useState(rooms[0]?.id ?? '')
  const [newFrequency, setNewFrequency] = useState<ChoreFrequency>('weekly')

  function startEditing(item: ChoreDefinition) {
    setEditing({ id: item.id, draft: { title: item.title, frequency: item.frequency, details: item.details, enabled: item.enabled !== false, includeInToday: item.includeInToday !== false } })
  }

  return <section className="chore-settings" aria-label="家务设置面板">
    <div className="settings-intro"><strong>家务设置</strong><button onClick={() => { if (confirm('恢复默认家务设置？自定义家务会被移除。')) resetSettings() }}>恢复默认</button></div>
    <form className="add-chore-form" onSubmit={(event) => { event.preventDefault(); if (!newTitle.trim()) return; addCustomChore(newRoom, newTitle, newFrequency); setNewTitle('') }}>
      <input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="添加一项家务" aria-label="新家务名称" />
      <select value={newRoom} onChange={(event) => setNewRoom(event.target.value)} aria-label="选择房间">{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select>
      <select value={newFrequency} onChange={(event) => setNewFrequency(event.target.value as ChoreFrequency)} aria-label="选择周期">{FREQUENCIES.map((value) => <option key={value} value={value}>{FREQUENCY_LABELS[value]}</option>)}</select>
      <button type="submit">添加</button>
    </form>
    <div className="settings-room-list">{rooms.map((room) => <details key={room.id}>
      <summary><strong>{room.name}</strong><span>{room.chores.filter((item) => item.enabled !== false).length}/{room.chores.length}</span></summary>
      <div>{room.chores.map((item) => editing?.id === item.id ? <form className="chore-editor" key={item.id} onSubmit={(event) => { event.preventDefault(); setPreference(item.id, editing.draft); setEditing(null) }}>
        <input value={editing.draft.title ?? ''} onChange={(event) => setEditing({ ...editing, draft: { ...editing.draft, title: event.target.value } })} aria-label="家务名称" />
        <div><select value={editing.draft.frequency} onChange={(event) => setEditing({ ...editing, draft: { ...editing.draft, frequency: event.target.value as ChoreFrequency } })}>{FREQUENCIES.map((value) => <option key={value} value={value}>{FREQUENCY_LABELS[value]}</option>)}</select>
          <label><input type="checkbox" checked={editing.draft.enabled} onChange={(event) => setEditing({ ...editing, draft: { ...editing.draft, enabled: event.target.checked } })} />启用</label>
          <label title="到期时加入今日家务的备选"><input type="checkbox" checked={editing.draft.includeInToday} onChange={(event) => setEditing({ ...editing, draft: { ...editing.draft, includeInToday: event.target.checked } })} />提醒</label></div>
        <textarea value={(editing.draft.details ?? []).join('\n')} onChange={(event) => setEditing({ ...editing, draft: { ...editing.draft, details: event.target.value.split('\n').map((value) => value.trim()).filter(Boolean) } })} rows={4} aria-label="家务细项" />
        <div className="editor-actions"><button type="button" onClick={() => setEditing(null)}>取消</button>{customIds.has(item.id) && <button type="button" className="danger-link" onClick={() => { deleteCustomChore(item.id); setEditing(null) }}>删除</button>}<button type="submit">保存</button></div>
      </form> : <button className={`chore-setting-row${item.enabled === false ? ' is-disabled' : ''}`} key={item.id} onClick={() => startEditing(item)}><span><strong>{item.title}</strong><small>{FREQUENCY_LABELS[item.frequency]} · {item.details.length} 个细项{item.includeInToday !== false ? ' · 提醒' : ''}</small></span><i>编辑</i></button>)}</div>
    </details>)}</div>
  </section>
}
