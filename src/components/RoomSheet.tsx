import { useEffect } from 'react'
import { ROOM_DEFS } from '../core/constants'
import { NPC_DEFS } from '../core/npcs'
import { useGameStore } from '../core/gameStore'
import type { RoomType } from '../core/types'

const INTERIORS: Partial<Record<RoomType, string>> = {
  bedroom: 'art/rooms/interiors/bedroom-interior-v1.webp',
  guest: 'art/rooms/interiors/guest-interior-v1.webp',
  kitchen: 'art/rooms/interiors/kitchen-interior-v1.webp',
  study: 'art/rooms/interiors/study-interior-v1.webp',
  storage: 'art/rooms/interiors/storage-interior-v1.webp',
}

const ATMOSPHERE: Partial<Record<RoomType, string>> = {
  bedroom: '伴侣可入住的房间。',
  guest: '访客可入住的房间。',
  kitchen: '降低每日食物维护费用。',
  study: '提高完成待办获得的精力。',
  storage: '增加礼物库存容量。',
}

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

export function RoomSheet() {
  const id = useGameStore((state) => state.selectedRoomId)
  const room = useGameStore((state) =>
    id ? state.rooms.find((item) => item.id === id) : undefined,
  )
  const selectRoom = useGameStore((state) => state.selectRoom)

  useEffect(() => {
    if (!id) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') selectRoom(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [id, selectRoom])

  if (!room) return null
  const def = ROOM_DEFS.find((item) => item.type === room.type)
  const interior = INTERIORS[room.type]
  if (!def || !interior) return null
  const occupant = room.occupantId
    ? NPC_DEFS.find((npc) => npc.id === room.occupantId)
    : null

  return (
    <div className="sheet room-sheet" onClick={() => selectRoom(null)}>
      <article
        className="sheet-card room-sheet-card"
        aria-labelledby="room-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="room-interior-hero">
          <img
            src={publicAsset(interior)}
            alt={`${def.name}室内`}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <div className="room-interior-title">
            <span>山谷小屋</span>
            <h2 id="room-sheet-title">{def.name}</h2>
          </div>
        </div>
        <div className="room-sheet-body">
          <p className="room-atmosphere">{ATMOSPHERE[room.type]}</p>
          <div className="room-facts">
            <div>
              <span>房间作用</span>
              <strong>{def.blurb}</strong>
            </div>
            {def.capacity > 0 && (
              <div>
                <span>现在住着</span>
                <strong>{occupant?.name ?? '还没有人'}</strong>
              </div>
            )}
          </div>
          <button className="btn secondary room-close" onClick={() => selectRoom(null)}>
            回到山谷
          </button>
        </div>
      </article>
    </div>
  )
}
