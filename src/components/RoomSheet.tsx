import { useEffect, useState } from 'react'
import { ROOM_DEFS, ROOM_LEVEL_LABELS, ROOM_UPGRADE_COSTS } from '../core/constants'
import { NPC_DEFS } from '../core/npcs'
import { useGameStore } from '../core/gameStore'
import {
  BEDROOM_SECTION_INTERIOR_ASSETS,
  roomInteriorAsset,
} from '../core/roomAssets'
import {
  BEDROOM_SECTIONS,
  bedroomSectionResident,
  canUpgradeBedroomToCourtyard,
  isCourtyardBedroom,
  maxRoomLevel,
} from '../core/roomRules'
import type { BedroomSection } from '../core/types'

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

export function RoomSheet() {
  const id = useGameStore((state) => state.selectedRoomId)
  const room = useGameStore((state) =>
    id ? state.rooms.find((item) => item.id === id) : undefined,
  )
  const selectRoom = useGameStore((state) => state.selectRoom)
  const upgradeRoom = useGameStore((state) => state.upgradeRoom)
  const coins = useGameStore((state) => state.coins)
  const rooms = useGameStore((state) => state.rooms)
  const courtyardLevel = useGameStore((state) => state.courtyardLevel)
  const [section, setSection] = useState<BedroomSection>('main')

  useEffect(() => {
    if (!id) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') selectRoom(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [id, selectRoom])

  useEffect(() => setSection('main'), [id])

  if (!room) return null
  const def = ROOM_DEFS.find((item) => item.type === room.type)
  const level = room.level ?? 1
  if (!def) return null
  const compound = isCourtyardBedroom(room)
  const selectedResidentId = compound
    ? bedroomSectionResident(room, section)
    : room.occupantId
  const occupant = selectedResidentId
    ? NPC_DEFS.find((npc) => npc.id === selectedResidentId)
    : null
  const interior = compound
    ? BEDROOM_SECTION_INTERIOR_ASSETS[section]
    : roomInteriorAsset(room.type, level)
  const displayName = occupant
    ? `${occupant.name}的房间`
    : room.type === 'bedroom' || room.type === 'guest'
      ? '空房间'
      : def.name
  const maxLevel = maxRoomLevel(room.type)
  const upgradeCost = level < maxLevel
    ? ROOM_UPGRADE_COSTS[room.type][level as 1 | 2 | 3]
    : undefined
  const courtyardUpgradeAvailable = room.type !== 'bedroom' || level !== 3 ||
    canUpgradeBedroomToCourtyard(rooms, courtyardLevel, room.id)
  const upgradeDisabled = upgradeCost !== undefined &&
    (coins < upgradeCost || !courtyardUpgradeAvailable)
  const upgradeHint = !courtyardUpgradeAvailable
    ? courtyardLevel < 4
      ? '需要二进院宅地'
      : '需要空出两个宅地'
    : upgradeCost !== undefined && coins < upgradeCost
      ? `还差 ${upgradeCost - coins} 金币`
      : undefined

  return (
    <div className="sheet room-sheet" onClick={() => selectRoom(null)}>
      <article
        className={`sheet-card room-sheet-card room-level-${level}`}
        aria-labelledby="room-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="room-interior-hero">
          <img
            src={publicAsset(interior)}
            alt={`${displayName}室内`}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <div className="room-interior-title">
            <span>{ROOM_LEVEL_LABELS[level]} · {level}/{maxLevel}</span>
            <h2 id="room-sheet-title">{displayName}</h2>
          </div>
        </div>
        <div className="room-sheet-body">
          {compound && (
            <nav className="bedroom-section-tabs" aria-label="院居房间">
              {BEDROOM_SECTIONS.map((item) => {
                const residentId = bedroomSectionResident(room, item.id)
                const resident = residentId
                  ? NPC_DEFS.find((npc) => npc.id === residentId)
                  : null
                return (
                  <button
                    type="button"
                    className={section === item.id ? 'active' : ''}
                    aria-current={section === item.id ? 'page' : undefined}
                    onClick={() => setSection(item.id)}
                    key={item.id}
                  >
                    <strong>{item.label}</strong>
                    <small>{resident?.name ?? '空'}</small>
                  </button>
                )
              })}
            </nav>
          )}
          {def.capacity === 0 && room.type !== 'living' && (
            <p className="room-atmosphere">{def.blurb}</p>
          )}
          {upgradeCost !== undefined && (
            <section className="room-upgrade-panel" aria-label="房间升级">
              <div className="room-level-dots" aria-label={`房间等级 ${level}/${maxLevel}`}>
                {Array.from({ length: maxLevel }, (_, index) => index + 1).map((value) => (
                  <i className={value <= level ? 'active' : ''} key={value} />
                ))}
              </div>
              <button
                className="btn"
                disabled={upgradeDisabled}
                title={upgradeHint}
                onClick={() => upgradeRoom(room.id)}
              >
                升级 · {upgradeCost} 金币
              </button>
            </section>
          )}
          <button className="btn secondary room-close" onClick={() => selectRoom(null)}>
            回到山谷
          </button>
        </div>
      </article>
    </div>
  )
}
