import type { NpcProgress } from './types'

/** True once the player has actually greeted / interacted with this NPC. */
export function inferInteracted(progress: NpcProgress): boolean {
  if (progress.interacted) return true
  if (progress.friendshipPoints > 0 || progress.romancePoints > 0) return true
  if (progress.romanceUnlocked || progress.livingAtHome) return true
  if (Object.keys(progress.giftDiscoveries ?? {}).length > 0) return true
  if ((progress.seenDialogueIds ?? []).length > 0) return true
  if ((progress.unlockedEventIds ?? []).length > 0) return true
  return false
}

export function npcIsKnown(progress: NpcProgress | null | undefined): boolean {
  if (!progress) return false
  return inferInteracted(progress)
}

export function withNormalizedInteraction(progress: NpcProgress): NpcProgress {
  return {
    ...progress,
    interacted: inferInteracted(progress),
  }
}
