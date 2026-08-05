import type { DialogueTone } from './types'

export type CharacterSpriteState = 'idle' | 'walkAway' | 'moveIn'

export const CORE_SPRITES: Partial<Record<string, string>> = {
  shendu: 'art/characters/sprites/shendu-sprite-v1.webp',
  guwan: 'art/characters/sprites/guwan-sprite-v1.webp',
  taotao: 'art/characters/sprites/taotao-sprite-v1.webp',
  qinghe: 'art/characters/sprites/qinghe-sprite-v1.webp',
  jiangxiaoman: 'art/characters/sprites/jiangxiaoman-sprite-v1.webp',
  chenshi: 'art/characters/sprites/chenshi-sprite-v1.webp',
  linchu: 'art/characters/sprites/linchu-sprite-v1.webp',
  baizhi: 'art/characters/sprites/baizhi-sprite-v1.webp',
  suweiming: 'art/characters/sprites/suweiming-sprite-v1.webp',
  yueqingshan: 'art/characters/sprites/yueqingshan-sprite-v1.webp',
  wenjiu: 'art/characters/sprites/wenjiu-sprite-v1.webp',
  hedeng: 'art/characters/sprites/hedeng-sprite-v1.webp',
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
  qinghe: {
    walkAway: 'art/characters/states/qinghe-walk-away-v1.webp',
    moveIn: 'art/characters/states/qinghe-move-in-v1.webp',
  },
  jiangxiaoman: {
    walkAway: 'art/characters/states/jiangxiaoman-walk-away-v1.webp',
    moveIn: 'art/characters/states/jiangxiaoman-move-in-v1.webp',
  },
  chenshi: {
    walkAway: 'art/characters/states/chenshi-walk-away-v1.webp',
    moveIn: 'art/characters/states/chenshi-move-in-v1.webp',
  },
  linchu: {
    walkAway: 'art/characters/states/linchu-walk-away-v1.webp',
    moveIn: 'art/characters/states/linchu-move-in-v1.webp',
  },
  baizhi: {
    walkAway: 'art/characters/states/baizhi-walk-away-v1.webp',
    moveIn: 'art/characters/states/baizhi-move-in-v1.webp',
  },
  suweiming: {
    walkAway: 'art/characters/states/suweiming-walk-away-v1.webp',
    moveIn: 'art/characters/states/suweiming-move-in-v1.webp',
  },
  yueqingshan: {
    walkAway: 'art/characters/states/yueqingshan-walk-away-v1.webp',
    moveIn: 'art/characters/states/yueqingshan-move-in-v1.webp',
  },
  wenjiu: {
    walkAway: 'art/characters/states/wenjiu-walk-away-v1.webp',
    moveIn: 'art/characters/states/wenjiu-move-in-v1.webp',
  },
  hedeng: {
    walkAway: 'art/characters/states/hedeng-walk-away-v1.webp',
    moveIn: 'art/characters/states/hedeng-move-in-v1.webp',
  },
}

export const CORE_PORTRAITS: Partial<Record<string, string>> = {
  shendu: 'art/characters/portraits/shendu-portrait-v1.webp',
  guwan: 'art/characters/portraits/guwan-portrait-v1.webp',
  taotao: 'art/characters/portraits/taotao-portrait-v1.webp',
  qinghe: 'art/characters/portraits/qinghe-portrait-v1.webp',
  jiangxiaoman: 'art/characters/portraits/jiangxiaoman-portrait-v1.webp',
  chenshi: 'art/characters/portraits/chenshi-portrait-v1.webp',
  linchu: 'art/characters/portraits/linchu-portrait-v1.webp',
  baizhi: 'art/characters/portraits/baizhi-portrait-v1.webp',
  suweiming: 'art/characters/portraits/suweiming-portrait-v1.webp',
  yueqingshan: 'art/characters/portraits/yueqingshan-portrait-v1.webp',
  wenjiu: 'art/characters/portraits/wenjiu-portrait-v1.webp',
  hedeng: 'art/characters/portraits/hedeng-portrait-v1.webp',
}

function expressionSet(npcId: string): Record<DialogueTone, string> {
  return {
    neutral: `art/characters/expressions/${npcId}-neutral-v1.webp`,
    warm: `art/characters/expressions/${npcId}-warm-v1.webp`,
    worried: `art/characters/expressions/${npcId}-worried-v1.webp`,
    annoyed: `art/characters/expressions/${npcId}-annoyed-v1.webp`,
    shy: `art/characters/expressions/${npcId}-shy-v1.webp`,
  }
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
  qinghe: expressionSet('qinghe'),
  jiangxiaoman: expressionSet('jiangxiaoman'),
  chenshi: expressionSet('chenshi'),
  linchu: expressionSet('linchu'),
  baizhi: expressionSet('baizhi'),
  suweiming: expressionSet('suweiming'),
  yueqingshan: expressionSet('yueqingshan'),
  wenjiu: expressionSet('wenjiu'),
  hedeng: expressionSet('hedeng'),
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
