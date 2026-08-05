import type { CourtyardLandscapeId, CourtyardLevel } from './types'

export type DecorationZone =
  | 'wall'
  | 'house'
  | 'path'
  | 'corner'
  | 'waterside'
  | 'foreground'

export interface DecorationSpot {
  x: number
  y: number
  width: number
  layer: number
  rotation?: number
  zone: DecorationZone
}

export interface CourtyardAccent {
  id: string
  asset: string
  x: number
  y: number
  width: number
  layer: number
}

const DECORATION_IDS = [
  'clay_flowerpot',
  'bamboo_lantern',
  'wooden_stool',
  'reed_basket',
  'stone_basin',
  'firewood_bundle',
  'water_jar',
  'wooden_signpost',
  'potted_bamboo',
  'tea_table',
  'paper_lantern',
  'wildflower_patch',
] as const

type DecorationId = typeof DECORATION_IDS[number]

const ZONES: Record<DecorationId, DecorationZone> = {
  clay_flowerpot: 'wall',
  bamboo_lantern: 'path',
  wooden_stool: 'corner',
  reed_basket: 'house',
  stone_basin: 'corner',
  firewood_bundle: 'house',
  water_jar: 'house',
  wooden_signpost: 'path',
  potted_bamboo: 'wall',
  tea_table: 'corner',
  paper_lantern: 'path',
  wildflower_patch: 'wall',
}

const LEVEL_OFFSET: Record<CourtyardLevel, { y: number; spread: number }> = {
  1: { y: 3, spread: -2 },
  2: { y: 1, spread: -1 },
  3: { y: 0, spread: 0 },
  4: { y: -1, spread: 1 },
}

const BASE_SPOTS: Record<DecorationId, Omit<DecorationSpot, 'zone'>> = {
  clay_flowerpot: { x: 36, y: 58, width: 5.5, layer: 4, rotation: -3 },
  bamboo_lantern: { x: 53, y: 69, width: 4.8, layer: 5, rotation: 2 },
  wooden_stool: { x: 42, y: 66, width: 6.5, layer: 4, rotation: -2 },
  reed_basket: { x: 61, y: 59, width: 5.8, layer: 4, rotation: 4 },
  stone_basin: { x: 67, y: 63, width: 7.2, layer: 4, rotation: -2 },
  firewood_bundle: { x: 57, y: 60, width: 7.5, layer: 3, rotation: 2 },
  water_jar: { x: 64, y: 59, width: 6.3, layer: 4, rotation: -1 },
  wooden_signpost: { x: 47, y: 70, width: 5.5, layer: 5, rotation: -4 },
  potted_bamboo: { x: 69, y: 55, width: 7.5, layer: 3, rotation: 1 },
  tea_table: { x: 59, y: 66, width: 9.5, layer: 4, rotation: 1 },
  paper_lantern: { x: 56, y: 69, width: 5.2, layer: 5, rotation: -1 },
  wildflower_patch: { x: 32, y: 60, width: 12.5, layer: 2, rotation: -2 },
}

const LANDSCAPE_OVERRIDES: Partial<
  Record<CourtyardLandscapeId, Partial<Record<DecorationId, Partial<DecorationSpot>>>>
> = {
  pond: {
    wooden_stool: { x: 32, y: 65, zone: 'waterside' },
    stone_basin: { x: 72, y: 61, zone: 'waterside' },
    tea_table: { x: 68, y: 66, zone: 'waterside' },
    paper_lantern: { x: 62, y: 70, zone: 'waterside' },
    wildflower_patch: { x: 28, y: 61, zone: 'waterside' },
  },
  old_tree: {
    clay_flowerpot: { x: 27, y: 61 },
    wooden_stool: { x: 65, y: 66 },
    tea_table: { x: 59, y: 68 },
    paper_lantern: { x: 55, y: 70 },
    wildflower_patch: { x: 28, y: 61 },
  },
  kitchen_garden: {
    clay_flowerpot: { x: 31, y: 63 },
    wooden_stool: { x: 69, y: 65 },
    stone_basin: { x: 68, y: 60 },
    water_jar: { x: 66, y: 57 },
    wildflower_patch: { x: 29, y: 59 },
  },
}

export function decorationSpot(
  level: CourtyardLevel,
  decorationId: string,
  landscape: CourtyardLandscapeId = 'open',
): DecorationSpot | null {
  if (!DECORATION_IDS.includes(decorationId as DecorationId)) return null
  const id = decorationId as DecorationId
  const base = BASE_SPOTS[id]
  const offset = LEVEL_OFFSET[level]
  const override = LANDSCAPE_OVERRIDES[landscape]?.[id]
  const centerDirection = base.x < 50 ? -1 : base.x > 50 ? 1 : 0
  return {
    ...base,
    x: base.x + centerDirection * offset.spread,
    y: base.y + offset.y,
    zone: ZONES[id],
    ...override,
  }
}

export function decorationSpots(
  level: CourtyardLevel,
  landscape: CourtyardLandscapeId = 'open',
): DecorationSpot[] {
  return DECORATION_IDS.map((id) => decorationSpot(level, id, landscape)).filter(
    (spot): spot is DecorationSpot => Boolean(spot),
  )
}

function hasAny(placed: readonly string[], ids: readonly string[]): boolean {
  return ids.some((id) => placed.includes(id))
}

export function courtyardAccents(
  level: CourtyardLevel,
  placed: readonly string[],
  landscape: CourtyardLandscapeId = 'open',
): CourtyardAccent[] {
  const offset = LEVEL_OFFSET[level]
  const accents: CourtyardAccent[] = []
  if (hasAny(placed, ['firewood_bundle', 'reed_basket'])) {
    accents.push({ id: 'kitchen-earth', asset: 'kitchen-earth-v1.webp', x: 59 + offset.spread, y: 61 + offset.y, width: 18, layer: 1 })
  }
  if (hasAny(placed, ['water_jar', 'stone_basin'])) {
    accents.push({ id: 'damp-stones', asset: 'damp-stones-v1.webp', x: 67 + offset.spread, y: 63 + offset.y, width: 17, layer: 1 })
  }
  if (hasAny(placed, ['bamboo_lantern', 'paper_lantern', 'wooden_signpost'])) {
    accents.push({ id: 'pathside-stones', asset: 'pathside-stones-v1.webp', x: 51, y: 70 + offset.y, width: 20, layer: 1 })
  }
  if (hasAny(placed, ['potted_bamboo'])) {
    accents.push({ id: 'mossy-wall', asset: 'mossy-wall-v1.webp', x: 69 + offset.spread, y: 57 + offset.y, width: 18, layer: 1 })
  }
  if (hasAny(placed, ['wildflower_patch', 'clay_flowerpot'])) {
    accents.push({ id: 'wildflower-ribbon', asset: 'wildflower-ribbon-v1.webp', x: 32 - offset.spread, y: 61 + offset.y, width: 21, layer: 1 })
  }
  if (hasAny(placed, ['wooden_stool', 'tea_table'])) {
    const x = landscape === 'old_tree' ? 61 : landscape === 'pond' ? 66 : 57
    accents.push({ id: 'leaf-litter', asset: 'leaf-litter-v1.webp', x, y: 67 + offset.y, width: 20, layer: 1 })
  }
  return accents
}
