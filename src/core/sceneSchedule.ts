import type { CourtyardLandscapeId } from './types'

export interface SceneActivity {
  label: string
  left: string
  top: string
}

interface ActivitySet {
  chance: number
  spots: readonly SceneActivity[]
}

const COURTYARD_ACTIVITY: ActivitySet = {
  chance: 0.72,
  spots: [
    { label: '院心', left: '47%', top: '64%' },
    { label: '廊下', left: '53%', top: '73%' },
  ],
}

const LANDSCAPE_COURTYARD_ACTIVITY: Record<CourtyardLandscapeId, ActivitySet> = {
  open: COURTYARD_ACTIVITY,
  pond: {
    chance: 0.72,
    spots: [
      { label: '池边', left: '35%', top: '67%' },
      { label: '桥边', left: '64%', top: '68%' },
    ],
  },
  old_tree: {
    chance: 0.72,
    spots: [
      { label: '树下', left: '43%', top: '66%' },
      { label: '石凳边', left: '50%', top: '72%' },
    ],
  },
  kitchen_garden: {
    chance: 0.72,
    spots: [
      { label: '菜畦边', left: '38%', top: '68%' },
      { label: '竹架旁', left: '64%', top: '66%' },
    ],
  },
}

const DEFAULT_ACTIVITY: ActivitySet = {
  chance: 0.22,
  spots: [
    { label: '小路', left: '48%', top: '86%' },
    { label: '路口', left: '89%', top: '72%' },
  ],
}

const NPC_ACTIVITIES: Record<string, ActivitySet> = {
  shendu: {
    chance: 0.28,
    spots: [
      { label: '河边', left: '89%', top: '70%' },
      { label: '渡口', left: '92%', top: '78%' },
    ],
  },
  qinghe: {
    chance: 0.24,
    spots: [
      { label: '菜地', left: '10%', top: '62%' },
      { label: '田埂', left: '12%', top: '72%' },
    ],
  },
  guwan: {
    chance: 0.2,
    spots: [
      { label: '竹林边', left: '8%', top: '54%' },
      { label: '山路', left: '11%', top: '68%' },
    ],
  },
  jiangxiaoman: {
    chance: 0.22,
    spots: [
      { label: '菜地', left: '11%', top: '70%' },
      { label: '小路', left: '48%', top: '86%' },
    ],
  },
  chenshi: {
    chance: 0.2,
    spots: [
      { label: '路口', left: '89%', top: '68%' },
      { label: '河边', left: '91%', top: '77%' },
    ],
  },
  taotao: {
    chance: 0.24,
    spots: [
      { label: '小路', left: '50%', top: '86%' },
      { label: '路口', left: '87%', top: '80%' },
    ],
  },
  linchu: {
    chance: 0.2,
    spots: [
      { label: '柴堆', left: '13%', top: '78%' },
      { label: '山路', left: '10%', top: '65%' },
    ],
  },
  baizhi: {
    chance: 0.2,
    spots: [
      { label: '药圃', left: '10%', top: '70%' },
      { label: '山脚', left: '8%', top: '55%' },
    ],
  },
  suweiming: {
    chance: 0.18,
    spots: [
      { label: '树下', left: '89%', top: '58%' },
      { label: '路边', left: '90%', top: '72%' },
    ],
  },
  yueqingshan: {
    chance: 0.18,
    spots: [
      { label: '山坡', left: '90%', top: '50%' },
      { label: '路口', left: '87%', top: '72%' },
    ],
  },
  wenjiu: {
    chance: 0.18,
    spots: [
      { label: '院墙外', left: '14%', top: '75%' },
      { label: '路边', left: '88%', top: '73%' },
    ],
  },
  hedeng: {
    chance: 0.22,
    spots: [
      { label: '溪边', left: '90%', top: '78%' },
      { label: '石桥', left: '86%', top: '83%' },
    ],
  },
}

function hash(input: string): number {
  let value = 2166136261
  for (const char of input) {
    value ^= char.charCodeAt(0)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

function dayKey(now: Date): string {
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

export function scenePopulationLimit(now = new Date()): 0 | 1 | 2 {
  return (hash(`${dayKey(now)}:population`) % 3) as 0 | 1 | 2
}

export interface ScheduledActivity extends SceneActivity {
  appears: boolean
  order: number
  zone: 'courtyard' | 'outside'
}

export function scheduledActivity(
  npcId: string,
  livingAtHome: boolean,
  now = new Date(),
  landscape: CourtyardLandscapeId = 'open',
): ScheduledActivity {
  const set = livingAtHome
    ? LANDSCAPE_COURTYARD_ACTIVITY[landscape]
    : (NPC_ACTIVITIES[npcId] ?? DEFAULT_ACTIVITY)
  const seed = `${dayKey(now)}:${npcId}`
  const roll = hash(`${seed}:presence`) / 0xffffffff
  const spot = set.spots[hash(`${seed}:spot`) % set.spots.length]
  return {
    ...spot,
    appears: roll < set.chance,
    order: hash(`${seed}:order`),
    zone: livingAtHome ? 'courtyard' : 'outside',
  }
}
