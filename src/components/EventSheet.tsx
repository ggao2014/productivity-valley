import { eventById, illustrationForEvent } from '../core/events'
import { useGameStore } from '../core/gameStore'
import { NPC_DEFS } from '../core/npcs'
import { portraitForNpc } from '../core/visualAssets'

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

export function EventSheet() {
  const id = useGameStore((state) => state.selectedEventId)
  const selectEvent = useGameStore((state) => state.selectEvent)
  const event = id ? eventById(id) : undefined
  if (!event) return null
  const npc = NPC_DEFS.find((item) => item.id === event.npcId)
  const portrait = portraitForNpc(event.npcId)
  const illustration = illustrationForEvent(event)
  if (!npc) return null

  return (
    <div className="sheet event-sheet" onClick={() => selectEvent(null)}>
      <article
        className={`sheet-card event-sheet-card tone-${event.tone}`}
        aria-labelledby="event-sheet-title"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        {illustration && (
          <figure className="event-illustration">
            <img
              src={publicAsset(illustration)}
              alt={`${npc.name}的${event.track === 'friendship' ? '友情' : '爱情'}回忆：${event.title}`}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </figure>
        )}
        <header className="event-sheet-header">
          {portrait && (
            <img
              src={publicAsset(portrait)}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          )}
          <div>
            <span>
              {npc.name} · {event.track === 'friendship' ? '友情回忆' : '爱情回忆'}
            </span>
            <h2 id="event-sheet-title">{event.title}</h2>
            <p>{event.summary}</p>
          </div>
        </header>
        <div className="event-story">
          {event.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <button className="btn secondary" onClick={() => selectEvent(null)}>
          收好这页
        </button>
      </article>
    </div>
  )
}
