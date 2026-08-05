import type { CourtyardLevel } from './types'

export type CourtyardTier = 'small' | 'three-sided' | 'four-sided' | 'two-entry'

export interface CourtyardSlot {
  id: string
  x: number
  bottom: number
  width: number
  layer: number
  role: 'ear' | 'side' | 'front' | 'inner'
  transform?: string
}

export interface CompoundBedroomSlot {
  x: number
  bottom: number
  width: number
  layer: number
}

const SMALL: CourtyardSlot[] = [
  { id: 's1', x: 29, bottom: 43, width: 14, layer: 2, role: 'ear' },
  { id: 's2', x: 68, bottom: 43, width: 14, layer: 2, role: 'ear' },
]

const THREE_SIDED: CourtyardSlot[] = [
  { id: 's1', x: 33.5, bottom: 45, width: 14, layer: 2, role: 'ear' },
  { id: 's2', x: 64.5, bottom: 45, width: 14, layer: 2, role: 'ear' },
  { id: 's3', x: 22, bottom: 32, width: 15, layer: 4, role: 'side', transform: 'scaleX(.94)' },
  { id: 's4', x: 78, bottom: 32, width: 15, layer: 4, role: 'side', transform: 'scaleX(.94)' },
]

const FOUR_SIDED: CourtyardSlot[] = [
  { id: 's1', x: 30, bottom: 57, width: 13, layer: 2, role: 'ear' },
  { id: 's2', x: 70, bottom: 57, width: 13, layer: 2, role: 'ear' },
  { id: 's3', x: 23.5, bottom: 46, width: 14, layer: 3, role: 'side' },
  { id: 's4', x: 76.5, bottom: 46, width: 14, layer: 3, role: 'side' },
  { id: 's5', x: 20, bottom: 35, width: 14, layer: 4, role: 'side' },
  { id: 's6', x: 80, bottom: 35, width: 14, layer: 4, role: 'side' },
  { id: 's7', x: 29, bottom: 19, width: 14, layer: 5, role: 'front' },
  { id: 's8', x: 71, bottom: 19, width: 14, layer: 5, role: 'front' },
]

const TWO_ENTRY_REPLACEABLE: CourtyardSlot[] = [
  { id: 'c1', x: 43, bottom: 60, width: 10, layer: 1, role: 'inner' },
  { id: 'c2', x: 50, bottom: 60, width: 10, layer: 1, role: 'inner' },
  { id: 'c3', x: 57, bottom: 60, width: 10, layer: 1, role: 'inner' },
]

const TWO_ENTRY_STANDARD: CourtyardSlot[] = [
  { id: 's1', x: 36, bottom: 66, width: 9, layer: 2, role: 'inner' },
  { id: 's2', x: 64.5, bottom: 66, width: 9, layer: 2, role: 'inner' },
  { id: 's3', x: 32.5, bottom: 58, width: 10, layer: 3, role: 'inner' },
  { id: 's4', x: 66, bottom: 58, width: 10, layer: 3, role: 'inner' },
  { id: 's5', x: 27, bottom: 48, width: 11, layer: 4, role: 'side' },
  { id: 's6', x: 73, bottom: 48, width: 11, layer: 4, role: 'side' },
  { id: 's7', x: 23, bottom: 36, width: 11, layer: 5, role: 'side' },
  { id: 's8', x: 75, bottom: 36, width: 11, layer: 5, role: 'side' },
  { id: 's9', x: 21, bottom: 25, width: 11, layer: 6, role: 'front' },
  { id: 's10', x: 76, bottom: 25, width: 11, layer: 6, role: 'front' },
]

const TIER_BY_LEVEL: Record<CourtyardLevel, CourtyardTier> = {
  1: 'small',
  2: 'three-sided',
  3: 'four-sided',
  4: 'two-entry',
}

export function courtyardLayout(
  level: CourtyardLevel,
  hasCompoundBedroom = false,
) {
  const slots = level === 1
    ? SMALL
    : level === 2
      ? THREE_SIDED
      : level === 3
        ? FOUR_SIDED
        : hasCompoundBedroom
          ? TWO_ENTRY_STANDARD
          : [...TWO_ENTRY_REPLACEABLE, ...TWO_ENTRY_STANDARD]

  return {
    tier: TIER_BY_LEVEL[level],
    slots,
    compoundSlot: level === 4 && hasCompoundBedroom
      ? { x: 50, bottom: 60, width: 34, layer: 1 } satisfies CompoundBedroomSlot
      : null,
  }
}
