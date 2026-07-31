import type { DialogueTone } from './types'

export type CharacterSpriteState = 'idle' | 'walkAway' | 'moveIn'

export const CORE_SPRITES: Partial<Record<string, string>> = {
  shendu: 'art/characters/sprites/shendu-sprite-v1.webp',
  guwan: 'art/characters/sprites/guwan-sprite-v1.webp',
  taotao: 'art/characters/sprites/taotao-sprite-v1.webp',
}

export const CORE_STATE_SPRITES: Partial<
  Record<string, Record<Exclude<CharacterSpriteState, 'idle'>, string>>
> = {
  shendu: {
    walkAway: 'art/characters/states/shendu-walk-away-v1.webp',
    moveIn: 'art/characters/states/shendu-move-in-v1.webp',
  },
  guwan: {
    walkAway: 'art/characters/states/guwan-walk-away-v1.webp',
    moveIn: 'art/characters/states/guwan-move-in-v1.webp',
  },
  taotao: {
    walkAway: 'art/characters/states/taotao-walk-away-v1.webp',
    moveIn: 'art/characters/states/taotao-move-in-v1.webp',
  },
}

export const CORE_PORTRAITS: Partial<Record<string, string>> = {
  shendu: 'art/characters/portraits/shendu-portrait-v1.webp',
  guwan: 'art/characters/portraits/guwan-portrait-v1.webp',
  taotao: 'art/characters/portraits/taotao-portrait-v1.webp',
}

export const CORE_EXPRESSION_PORTRAITS: Partial<
  Record<string, Record<DialogueTone, string>>
> = {
  shendu: {
    neutral: 'art/characters/expressions/shendu-neutral-v1.webp',
    warm: 'art/characters/expressions/shendu-warm-v1.webp',
    worried: 'art/characters/expressions/shendu-worried-v1.webp',
    annoyed: 'art/characters/expressions/shendu-annoyed-v1.webp',
    shy: 'art/characters/expressions/shendu-shy-v1.webp',
  },
  guwan: {
    neutral: 'art/characters/expressions/guwan-neutral-v1.webp',
    warm: 'art/characters/expressions/guwan-warm-v1.webp',
    worried: 'art/characters/expressions/guwan-worried-v1.webp',
    annoyed: 'art/characters/expressions/guwan-annoyed-v1.webp',
    shy: 'art/characters/expressions/guwan-shy-v1.webp',
  },
  taotao: {
    neutral: 'art/characters/expressions/taotao-neutral-v1.webp',
    warm: 'art/characters/expressions/taotao-warm-v1.webp',
    worried: 'art/characters/expressions/taotao-worried-v1.webp',
    annoyed: 'art/characters/expressions/taotao-annoyed-v1.webp',
    shy: 'art/characters/expressions/taotao-shy-v1.webp',
  },
}

export function portraitForNpc(
  npcId: string,
  tone?: DialogueTone,
): string | undefined {
  return (
    (tone && CORE_EXPRESSION_PORTRAITS[npcId]?.[tone]) ??
    CORE_PORTRAITS[npcId]
  )
}

export function spriteForNpc(
  npcId: string,
  state: CharacterSpriteState = 'idle',
): string | undefined {
  if (state === 'idle') return CORE_SPRITES[npcId]
  return CORE_STATE_SPRITES[npcId]?.[state] ?? CORE_SPRITES[npcId]
}
