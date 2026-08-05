import type { CourtyardLandscapeId, CourtyardLevel } from './types'

export interface CourtyardLandscapeDef {
  id: CourtyardLandscapeId
  name: string
  blurb: string
  cost: number
  stage: 0 | 1 | 2 | 3
  minCourtyardLevel: CourtyardLevel
  asset: string | null
}

export interface CourtyardLandscapePlacement {
  x: number
  y: number
  width: number
}

export const COURTYARD_LANDSCAPE_DEFS: readonly CourtyardLandscapeDef[] = [
  {
    id: 'open',
    name: '开阔院',
    blurb: '保留宽敞的院心',
    cost: 0,
    stage: 0,
    minCourtyardLevel: 1,
    asset: null,
  },
  {
    id: 'old_tree',
    name: '老树院',
    blurb: '树荫、石凳和落叶',
    cost: 90,
    stage: 1,
    minCourtyardLevel: 2,
    asset: 'courtyard-old-tree-v1.webp',
  },
  {
    id: 'kitchen_garden',
    name: '菜园院',
    blurb: '菜畦、水沟和竹架',
    cost: 75,
    stage: 1,
    minCourtyardLevel: 2,
    asset: 'courtyard-kitchen-garden-v1.webp',
  },
  {
    id: 'pond',
    name: '池塘院',
    blurb: '不规则池岸与短石桥',
    cost: 150,
    stage: 2,
    minCourtyardLevel: 3,
    asset: 'courtyard-pond-v1.webp',
  },
] as const

const PLACEMENTS: Record<Exclude<CourtyardLandscapeId, 'open'>, Partial<Record<CourtyardLevel, CourtyardLandscapePlacement>>> = {
  old_tree: {
    2: { x: 40, y: 59, width: 31 },
    3: { x: 40, y: 60, width: 33 },
    4: { x: 40, y: 61, width: 34 },
  },
  kitchen_garden: {
    2: { x: 50, y: 62, width: 38 },
    3: { x: 50, y: 62, width: 40 },
    4: { x: 50, y: 63, width: 42 },
  },
  pond: {
    3: { x: 50, y: 61, width: 39 },
    4: { x: 50, y: 62, width: 41 },
  },
}

export function courtyardLandscapeDef(id: CourtyardLandscapeId): CourtyardLandscapeDef {
  return COURTYARD_LANDSCAPE_DEFS.find((item) => item.id === id) ?? COURTYARD_LANDSCAPE_DEFS[0]
}

export function courtyardLandscapePlacement(
  id: CourtyardLandscapeId,
  level: CourtyardLevel,
): CourtyardLandscapePlacement | null {
  if (id === 'open') return null
  return PLACEMENTS[id][level] ?? null
}

export function availableLandscape(
  id: CourtyardLandscapeId,
  level: CourtyardLevel,
): boolean {
  return level >= courtyardLandscapeDef(id).minCourtyardLevel
}
