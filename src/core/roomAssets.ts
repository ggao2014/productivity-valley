import type { BedroomSection, RoomLevel, RoomType } from './types'

type StandardRoomLevel = Exclude<RoomLevel, 4>
type RoomAssetSet = {
  living: Record<StandardRoomLevel, string>
  bedroom: Record<RoomLevel, string>
  guest: Record<StandardRoomLevel, string>
  kitchen: Record<StandardRoomLevel, string>
  study: Record<StandardRoomLevel, string>
  storage: Record<StandardRoomLevel, string>
}

export const ROOM_EXTERIOR_ASSETS: RoomAssetSet = {
  living: {
    1: 'art/house/modules/living-module-l1-v1.webp',
    2: 'art/house/modules/living-module-l2-v1.webp',
    3: 'art/house/modules/living-module-l3-v1.webp',
  },
  bedroom: {
    1: 'art/house/modules/bedroom-module-l1-v1.webp',
    2: 'art/house/modules/bedroom-module-l2-v1.webp',
    3: 'art/house/modules/bedroom-module-l3-v1.webp',
    4: 'art/house/modules/bedroom-module-l4-v1.webp',
  },
  guest: {
    1: 'art/house/modules/guest-module-l1-v1.webp',
    2: 'art/house/modules/guest-module-l2-v1.webp',
    3: 'art/house/modules/guest-module-l3-v1.webp',
  },
  kitchen: {
    1: 'art/house/modules/kitchen-module-l1-v1.webp',
    2: 'art/house/modules/kitchen-module-l2-v1.webp',
    3: 'art/house/modules/kitchen-module-l3-v1.webp',
  },
  study: {
    1: 'art/house/modules/study-module-l1-v1.webp',
    2: 'art/house/modules/study-module-l2-v1.webp',
    3: 'art/house/modules/study-module-l3-v1.webp',
  },
  storage: {
    1: 'art/house/modules/storage-module-l1-v1.webp',
    2: 'art/house/modules/storage-module-l2-v1.webp',
    3: 'art/house/modules/storage-module-l3-v1.webp',
  },
}

export const ROOM_INTERIOR_ASSETS: RoomAssetSet = {
  living: {
    1: 'art/rooms/interiors/living-interior-l1-v1.webp',
    2: 'art/rooms/interiors/living-interior-l2-v1.webp',
    3: 'art/rooms/interiors/living-interior-l3-v1.webp',
  },
  bedroom: {
    1: 'art/rooms/interiors/bedroom-interior-l1-v1.webp',
    2: 'art/rooms/interiors/bedroom-interior-l2-v1.webp',
    3: 'art/rooms/interiors/bedroom-interior-l3-v1.webp',
    4: 'art/rooms/interiors/bedroom-interior-l4-main-v1.webp',
  },
  guest: {
    1: 'art/rooms/interiors/guest-interior-l1-v1.webp',
    2: 'art/rooms/interiors/guest-interior-l2-v1.webp',
    3: 'art/rooms/interiors/guest-interior-l3-v1.webp',
  },
  kitchen: {
    1: 'art/rooms/interiors/kitchen-interior-l1-v1.webp',
    2: 'art/rooms/interiors/kitchen-interior-l2-v1.webp',
    3: 'art/rooms/interiors/kitchen-interior-l3-v1.webp',
  },
  study: {
    1: 'art/rooms/interiors/study-interior-l1-v1.webp',
    2: 'art/rooms/interiors/study-interior-l2-v1.webp',
    3: 'art/rooms/interiors/study-interior-l3-v1.webp',
  },
  storage: {
    1: 'art/rooms/interiors/storage-interior-l1-v1.webp',
    2: 'art/rooms/interiors/storage-interior-l2-v1.webp',
    3: 'art/rooms/interiors/storage-interior-l3-v1.webp',
  },
}

export const BEDROOM_SECTION_INTERIOR_ASSETS: Record<BedroomSection, string> = {
  main: 'art/rooms/interiors/bedroom-interior-l4-main-v1.webp',
  leftWing: 'art/rooms/interiors/bedroom-interior-l4-left-v1.webp',
  rightWing: 'art/rooms/interiors/bedroom-interior-l4-right-v1.webp',
}

export function roomExteriorAsset(type: RoomType, level: RoomLevel): string {
  if (type === 'bedroom') return ROOM_EXTERIOR_ASSETS.bedroom[level]
  return ROOM_EXTERIOR_ASSETS[type][Math.min(level, 3) as StandardRoomLevel]
}

export function roomInteriorAsset(type: RoomType, level: RoomLevel): string {
  if (type === 'bedroom') return ROOM_INTERIOR_ASSETS.bedroom[level]
  return ROOM_INTERIOR_ASSETS[type][Math.min(level, 3) as StandardRoomLevel]
}
