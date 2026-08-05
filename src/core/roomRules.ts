import { COURTYARD_LEVELS, ROOM_DEFS, ROOM_TYPE_LIMITS } from './constants'
import type {
  BedroomSection,
  CourtyardLevel,
  RoomInstance,
  RoomLevel,
  RoomType,
} from './types'

export const BEDROOM_SECTIONS: Array<{ id: BedroomSection; label: string }> = [
  { id: 'main', label: '主间' },
  { id: 'leftWing', label: '左厢' },
  { id: 'rightWing', label: '右厢' },
]

export const BUILT_IN_ROOM_TYPES: RoomType[] = ['living', 'study', 'storage']

export function isBuiltInRoom(room: RoomInstance | RoomType): boolean {
  const type = typeof room === 'string' ? room : room.type
  return BUILT_IN_ROOM_TYPES.includes(type)
}

export function maxRoomLevel(type: RoomType): RoomLevel {
  return type === 'bedroom' ? 4 : 3
}

export function isCourtyardBedroom(room: RoomInstance): boolean {
  return room.type === 'bedroom' && room.level === 4
}

export function roomCapacity(room: RoomInstance): number {
  if (isCourtyardBedroom(room)) return 3
  return ROOM_DEFS.find((item) => item.type === room.type)?.capacity ?? 0
}

export function roomResidentIds(room: RoomInstance): Array<string | null> {
  if (!isCourtyardBedroom(room)) return roomCapacity(room) ? [room.occupantId] : []
  return [room.occupantId, ...(room.wingOccupantIds ?? [null, null])]
}

export function roomResidentCount(room: RoomInstance): number {
  return roomResidentIds(room).filter(Boolean).length
}

export function emptyBedCount(rooms: RoomInstance[]): number {
  return rooms.reduce(
    (total, room) => total + roomResidentIds(room).filter((id) => !id).length,
    0,
  )
}

export function assignResident(
  room: RoomInstance,
  npcId: string,
): RoomInstance | null {
  if (roomCapacity(room) === 0) return null
  if (!room.occupantId) return { ...room, occupantId: npcId }
  if (!isCourtyardBedroom(room)) return null
  const wings = room.wingOccupantIds ?? [null, null]
  const openIndex = wings.findIndex((id) => !id)
  if (openIndex < 0) return null
  const nextWings: [string | null, string | null] = [...wings]
  nextWings[openIndex] = npcId
  return { ...room, wingOccupantIds: nextWings }
}

export function removeResident(room: RoomInstance, npcId: string): RoomInstance {
  const wings: [string | null, string | null] = [
    room.wingOccupantIds?.[0] === npcId ? null : room.wingOccupantIds?.[0] ?? null,
    room.wingOccupantIds?.[1] === npcId ? null : room.wingOccupantIds?.[1] ?? null,
  ]
  return {
    ...room,
    occupantId: room.occupantId === npcId ? null : room.occupantId,
    ...(isCourtyardBedroom(room) ? { wingOccupantIds: wings } : {}),
  }
}

export function courtyardCapacityUsed(rooms: RoomInstance[]): number {
  return rooms
    .filter((room) => !isBuiltInRoom(room))
    .reduce((total, room) => total + (isCourtyardBedroom(room) ? 3 : 1), 0)
}

export function minimumCourtyardLevel(rooms: RoomInstance[]): CourtyardLevel {
  const used = courtyardCapacityUsed(rooms)
  if (rooms.some(isCourtyardBedroom) || used > 8) return 4
  if (used > 4) return 3
  if (used > 2) return 2
  return 1
}

export function roomTypeLimitReached(rooms: RoomInstance[], type: RoomType): boolean {
  const limit = ROOM_TYPE_LIMITS[type]
  return limit !== undefined && rooms.filter((room) => room.type === type).length >= limit
}

export function canAddRoom(
  rooms: RoomInstance[],
  courtyardLevel: CourtyardLevel,
  type: RoomType,
): boolean {
  if (isBuiltInRoom(type) || roomTypeLimitReached(rooms, type)) return false
  return courtyardCapacityUsed(rooms) < COURTYARD_LEVELS[courtyardLevel].capacity
}

export function canUpgradeBedroomToCourtyard(
  rooms: RoomInstance[],
  courtyardLevel: CourtyardLevel,
  roomId: string,
): boolean {
  const room = rooms.find((item) => item.id === roomId)
  if (!room || room.type !== 'bedroom' || room.level !== 3) return false
  if (courtyardLevel < 4 || rooms.some(isCourtyardBedroom)) return false
  return courtyardCapacityUsed(rooms) + 2 <= COURTYARD_LEVELS[4].capacity
}

export function bedroomSectionResident(
  room: RoomInstance,
  section: BedroomSection,
): string | null {
  if (section === 'main') return room.occupantId
  return room.wingOccupantIds?.[section === 'leftWing' ? 0 : 1] ?? null
}
