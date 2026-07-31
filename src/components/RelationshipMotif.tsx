import type { FriendshipStage, RomanceStage } from '../core/types'

type RelationshipKind = 'friendship' | 'romance'

export function RelationshipSymbol({
  kind,
  stage,
  compact = false,
}: {
  kind: RelationshipKind
  stage: number
  compact?: boolean
}) {
  if (kind === 'friendship') {
    return (
      <svg
        className={`relationship-symbol tea-symbol stage-${stage}${
          compact ? ' is-compact' : ''
        }`}
        viewBox="0 0 96 58"
        role="img"
        aria-label={`友情阶段 ${stage}/3`}
      >
        <path className="motif-saucer" d="M8 47c8 5 28 5 36 0M52 47c8 5 28 5 36 0" />
        <path className="motif-cup cup-a" d="M12 22h28v17c-7 7-21 7-28 0V22Z" />
        <path className="motif-handle cup-a" d="M40 26c12-1 12 12 1 12" />
        <path className="motif-tea tea-a" d="M15 27c7 2 15 2 22 0" />
        <path className="motif-cup cup-b" d="M56 22h28v17c-7 7-21 7-28 0V22Z" />
        <path className="motif-handle cup-b" d="M84 26c10-1 10 12 1 12" />
        <path className="motif-tea tea-b" d="M59 27c7 2 15 2 22 0" />
        <path className="motif-steam steam-a" d="M22 17c-4-5 4-7 0-12M31 17c-4-5 4-7 0-12" />
        <path className="motif-steam steam-b" d="M66 17c-4-5 4-7 0-12M75 17c-4-5 4-7 0-12" />
        <path className="motif-clink" d="m46 18 2-5 2 5M48 8V4" />
      </svg>
    )
  }

  return (
    <svg
      className={`relationship-symbol lamp-symbol stage-${stage}${
        compact ? ' is-compact' : ''
      }`}
      viewBox="0 0 76 64"
      role="img"
      aria-label={`喜欢阶段 ${stage}/4`}
    >
      <circle className="lamp-glow glow-far" cx="38" cy="29" r="25" />
      <circle className="lamp-glow glow-near" cx="38" cy="29" r="17" />
      <path className="lamp-loop" d="M27 17c1-10 21-10 22 0" />
      <path className="lamp-frame" d="M24 19h28l-3 27H27l-3-27Z" />
      <path className="lamp-pane" d="M31 24h14l-1.5 15h-11L31 24Z" />
      <path className="lamp-flame" d="M38 36c-7-5 0-12 1-17 7 8 8 14-1 17Z" />
      <path className="lamp-base" d="M25 47h26M29 52h18" />
      <path className="lamp-home" d="m55 48 8-7 8 7v9H55v-9ZM60 57v-6h6v6" />
    </svg>
  )
}

export function RelationshipMotif({
  friendship,
  romance,
  friendshipLabel,
  romanceLabel,
}: {
  friendship: FriendshipStage
  romance: RomanceStage
  friendshipLabel: string
  romanceLabel: string
}) {
  return (
    <section className="relationship-motifs" aria-label="关系阶段">
      <div className="relationship-motif friendship-motif">
        <RelationshipSymbol kind="friendship" stage={friendship} />
        <div>
          <span>两杯茶 · 友情</span>
          <strong>{friendshipLabel}</strong>
        </div>
      </div>
      <div className="relationship-motif romance-motif">
        <RelationshipSymbol kind="romance" stage={romance} />
        <div>
          <span>一盏灯 · 喜欢</span>
          <strong>{romanceLabel}</strong>
        </div>
      </div>
    </section>
  )
}
