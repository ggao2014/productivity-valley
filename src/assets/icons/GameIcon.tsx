export type GameIconName =
  | 'coin'
  | 'energy'
  | 'check'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'undo'
  | 'bamboo'
  | 'umbrella'
  | 'ladle'

interface GameIconProps {
  name: GameIconName
  className?: string
}

export function GameIcon({ name, className = '' }: GameIconProps) {
  return (
    <svg
      className={`game-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {name === 'coin' && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9 8.8h6v6.4H9zM6.8 6.8l1.4 1.4M17.2 6.8l-1.4 1.4M6.8 17.2l1.4-1.4M17.2 17.2l-1.4-1.4" />
        </>
      )}
      {name === 'energy' && (
        <>
          <path d="M18.6 4.2C12.5 4.7 7.2 7.4 6 12.1c-.9 3.6 1.6 6.7 5 6.7 5.2 0 7.8-6.4 7.6-14.6Z" />
          <path d="M5.4 20c1.9-4.7 5.1-8.2 9.5-10.8M9.1 14.3c1.1.1 2.3.5 3.2 1.2M11.8 11.1c-.1-1-.3-1.9-.7-2.7" />
        </>
      )}
      {name === 'check' && <path d="m5.2 12.4 4.2 4.2 9.4-9.4" />}
      {name === 'plus' && <path d="M12 5v14M5 12h14" />}
      {name === 'edit' && (
        <>
          <path d="m14.8 5.2 4 4L9.2 18.8l-4.8.8.8-4.8 9.6-9.6Z" />
          <path d="m12.8 7.2 4 4" />
        </>
      )}
      {name === 'trash' && (
        <>
          <path d="M5 7h14M9 7V4.8h6V7M7.2 7l.7 12h8.2l.7-12M10 10.5v5M14 10.5v5" />
        </>
      )}
      {name === 'undo' && (
        <>
          <path d="m8.5 7-4 4 4 4" />
          <path d="M5 11h7.4c3.7 0 6.1 2.1 6.1 5.5" />
        </>
      )}
      {name === 'bamboo' && (
        <>
          <path d="M10.2 21 13.8 3M10.9 17.4l3.6.7M11.7 13.2l3.6.7M12.5 9l3.6.7M13.3 4.8l3.6.7" />
          <path d="M12.3 10.2c-2.3-1.6-4-1.7-5.2-.5 2.2.3 3.7 1.2 4.6 2.7M13.1 6.1c1.9-1.4 3.5-1.5 4.8-.4-1.9.2-3.3 1-4.2 2.2" />
        </>
      )}
      {name === 'umbrella' && (
        <>
          <path d="M4 11.2C5.1 6.7 8 4.3 12 4.3s6.9 2.4 8 6.9H4Z" />
          <path d="M4 11.2c1.3-1.2 2.7-1.2 4 0 1.3-1.2 2.7-1.2 4 0 1.3-1.2 2.7-1.2 4 0 1.3-1.2 2.7-1.2 4 0M12 4.3v13.4c0 2.4 3.2 2.7 3.4.2" />
        </>
      )}
      {name === 'ladle' && (
        <>
          <circle cx="8.2" cy="7.4" r="4.1" />
          <path d="m11.1 10.3 7.4 7.4c1.3 1.3-.7 3.3-2 2L9.2 12.3M6.4 6.1c1.1-.7 2.5-.5 3.3.4" />
        </>
      )}
    </svg>
  )
}
