import {
  FRIENDSHIP_THRESHOLDS,
  HOME_FEE,
  INTERACTIONS_PER_NPC_PER_DAY,
  ROMANCE_THRESHOLDS,
} from './constants'
import { emptyBeds, friendshipStage } from './economy'
import type { GameState } from './types'

export interface Requirement {
  label: string
  met: boolean
  detail: string
  value: number
  target: number
}

export function interactionBlockReason(
  state: GameState,
  npcId: string,
  energyCost: number,
  needsFriendship = false,
): string | null {
  const progress = state.npc[npcId]
  if (!progress?.met) return '还没有遇见'
  if (progress.interactionsToday >= INTERACTIONS_PER_NPC_PER_DAY) {
    return `今日互动 ${INTERACTIONS_PER_NPC_PER_DAY}/${INTERACTIONS_PER_NPC_PER_DAY}`
  }
  if (needsFriendship && friendshipStage(progress.friendshipPoints) < 2) {
    return `友情 ${progress.friendshipPoints}/${FRIENDSHIP_THRESHOLDS[2]}`
  }
  if (state.bond < energyCost) {
    return `精力 ${state.bond}/${energyCost}`
  }
  return null
}

export function romanceBlockReason(state: GameState, npcId: string): string | null {
  const progress = state.npc[npcId]
  if (!progress) return '还没有遇见'
  if (progress.romanceUnlocked) return null
  return interactionBlockReason(state, npcId, 2, true)
}

export function inviteRequirements(
  state: GameState,
  npcId: string,
): Requirement[] {
  const progress = state.npc[npcId]
  const romanceGap = Math.max(
    0,
    ROMANCE_THRESHOLDS[3] - (progress?.romancePoints ?? 0),
  )
  const relationshipMet = Boolean(
    progress?.romanceUnlocked && romanceGap === 0,
  )
  return [
    {
      label: '关系',
      met: relationshipMet,
      detail: !progress?.romanceUnlocked
        ? `友情 ${progress?.friendshipPoints ?? 0}/${FRIENDSHIP_THRESHOLDS[2]}`
        : `喜欢 ${Math.min(progress.romancePoints, ROMANCE_THRESHOLDS[3])}/${ROMANCE_THRESHOLDS[3]}`,
      value: !progress?.romanceUnlocked
        ? Math.min(progress?.friendshipPoints ?? 0, FRIENDSHIP_THRESHOLDS[2])
        : Math.min(progress.romancePoints, ROMANCE_THRESHOLDS[3]),
      target: !progress?.romanceUnlocked
        ? FRIENDSHIP_THRESHOLDS[2]
        : ROMANCE_THRESHOLDS[3],
    },
    {
      label: '空房',
      met: emptyBeds(state.rooms) > 0,
      detail: `空床 ${Math.min(emptyBeds(state.rooms), 1)}/1`,
      value: Math.min(emptyBeds(state.rooms), 1),
      target: 1,
    },
    {
      label: '安家费',
      met: state.coins >= HOME_FEE,
      detail: `金币 ${Math.min(state.coins, HOME_FEE)}/${HOME_FEE}`,
      value: Math.min(state.coins, HOME_FEE),
      target: HOME_FEE,
    },
  ]
}
