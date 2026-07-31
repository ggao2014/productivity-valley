interface EmptyStateProps {
  image: string
  title: string
  detail: string
  compact?: boolean
}

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path}`
}

export function EmptyState({
  image,
  title,
  detail,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`empty-state${compact ? ' is-compact' : ''}`}>
      <img src={publicAsset(image)} alt="" draggable={false} />
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </div>
  )
}
