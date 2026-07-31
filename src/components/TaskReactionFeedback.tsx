import { useEffect } from 'react'
import { useGameStore } from '../core/gameStore'
import { NPC_DEFS } from '../core/npcs'

const CORE_SPRITES: Record<string, string> = {
  shendu: 'art/characters/sprites/shendu-sprite-v1.webp',
  guwan: 'art/characters/sprites/guwan-sprite-v1.webp',
  taotao: 'art/characters/sprites/taotao-sprite-v1.webp',
}

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

export function TaskReactionFeedback() {
  const reaction = useGameStore((state) => state.taskReaction)
  const clear = useGameStore((state) => state.clearTaskReaction)

  useEffect(() => {
    if (!reaction) return
    const timeout = window.setTimeout(clear, 4200)
    return () => window.clearTimeout(timeout)
  }, [clear, reaction])

  if (!reaction) return null
  const npc = NPC_DEFS.find((item) => item.id === reaction.npcId)
  const sprite = CORE_SPRITES[reaction.npcId]
  if (!npc || !sprite) return null

  return (
    <aside key={reaction.id} className="task-reaction" role="status">
      <img src={publicAsset(sprite)} alt="" draggable={false} />
      <div>
        <strong>{npc.name}</strong>
        <p>“{reaction.text}”</p>
      </div>
      <button onClick={clear} aria-label="关闭角色回应">
        ×
      </button>
    </aside>
  )
}
