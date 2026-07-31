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
    return '今天已经互动 3 次，明天再来'
  }
  if (needsFriendship && friendshipStage(progress.friendshipPoints) < 2) {
    const gap = FRIENDSHIP_THRESHOLDS[2] - progress.friendshipPoints
    return `还差 ${gap} 友情成为好友`
  }
  if (state.bond < energyCost) {
    return `需要 ${energyCost} 精力，完成待办可以恢复`
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
        ? '先成为好友并表白'
        : romanceGap > 0
          ? `还差 ${romanceGap} 喜欢`
          : '已经超喜欢',
    },
    {
      label: '空房',
      met: emptyBeds(state.rooms) > 0,
      detail:
        emptyBeds(state.rooms) > 0
          ? `还有 ${emptyBeds(state.rooms)} 张空床`
          : '购买卧室或客房',
    },
    {
      label: '安家费',
      met: state.coins >= HOME_FEE,
      detail:
        state.coins >= HOME_FEE
          ? `${HOME_FEE} 金币已备好`
          : `还差 ${HOME_FEE - state.coins} 金币`,
    },
  ]
}

export function relationshipNextStep(state: GameState, npcId: string): string {
  const progress = state.npc[npcId]
  if (!progress) return '继续探索山谷，等待相遇。'
  if (progress.interactionsToday >= INTERACTIONS_PER_NPC_PER_DAY) {
    return '今天已经好好相处过了，明天会有新的话。'
  }
  if (friendshipStage(progress.friendshipPoints) < 2) {
    return `再积累 ${FRIENDSHIP_THRESHOLDS[2] - progress.friendshipPoints} 友情，就能深聊和表白。`
  }
  if (!progress.romanceUnlocked) {
    return '已经成为好友，可以表白开启喜欢线。'
  }
  const romanceGap = ROMANCE_THRESHOLDS[3] - progress.romancePoints
  if (romanceGap > 0) {
    return `再积累 ${romanceGap} 喜欢，就会达到“超喜欢”。`
  }
  const unmet = inviteRequirements(state, npcId).filter((item) => !item.met)
  if (unmet.length > 0) {
    return `邀请入住还需要：${unmet.map((item) => item.detail).join('；')}。`
  }
  return '条件齐了，现在可以邀请入住。'
}
