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
  | 'briefcase'
  | 'book'
  | 'home'
  | 'heart'
  | 'basket'
  | 'chat'
  | 'spark'
  | 'settings'
  | 'grid'
  | 'grip'

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
      {name === 'settings' && (
        <>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12.3 2.8h-.6a2 2 0 0 0-2 2v.3c0 .7-.4 1.4-1 1.7l-.5.3a2 2 0 0 1-2 0L6 7a2 2 0 0 0-2.7.7l-.3.5a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.8v.5a2 2 0 0 1-1 1.7l-.2.2A2 2 0 0 0 3 17.9l.3.4A2 2 0 0 0 6 19l.2-.1a2 2 0 0 1 2 0l.5.3a2 2 0 0 1 1 1.7v.3a2 2 0 0 0 2 2h.6a2 2 0 0 0 2-2v-.3a2 2 0 0 1 1-1.7l.5-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.3-.4a2 2 0 0 0-.7-2.7l-.2-.2a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.8l.2-.1a2 2 0 0 0 .7-2.7l-.3-.5A2 2 0 0 0 18 7l-.2.1a2 2 0 0 1-2 0l-.5-.3a2 2 0 0 1-1-1.7v-.3a2 2 0 0 0-2-2Z" />
        </>
      )}
      {name === 'grid' && (
        <>
          <rect x="3.5" y="3.5" width="17" height="17" rx="2.2" />
          <path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17" />
        </>
      )}
      {name === 'grip' && (
        <>
          <circle cx="9" cy="7" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="7" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="9" cy="17" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="17" r="1.2" fill="currentColor" stroke="none" />
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
      {name === 'briefcase' && (
        <><rect x="3.5" y="7.5" width="17" height="11" rx="2" /><path d="M8.5 7.5V5.7h7v1.8M3.5 12h17M10 12v1.5h4V12" /></>
      )}
      {name === 'book' && (
        <><path d="M4 5.2c3.1-.7 5.8 0 8 2.1v12c-2.2-2.1-4.9-2.8-8-2.1v-12Z" /><path d="M20 5.2c-3.1-.7-5.8 0-8 2.1v12c2.2-2.1 4.9-2.8 8-2.1v-12Z" /></>
      )}
      {name === 'home' && (
        <><path d="m3.5 11 8.5-7 8.5 7" /><path d="M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" /></>
      )}
      {name === 'heart' && <path d="M12 20S4 15.3 4 9.5C4 5.2 9.2 3.7 12 7c2.8-3.3 8-1.8 8 2.5C20 15.3 12 20 12 20Z" />}
      {name === 'basket' && (
        <><path d="M4 10h16l-1.6 9H5.6L4 10Z" /><path d="m8 10 4-6 4 6M8.5 13v3M12 13v3M15.5 13v3" /></>
      )}
      {name === 'chat' && (
        <><path d="M4 5.5h16v10H9l-4.5 3v-3H4v-10Z" /><path d="M8 9h8M8 12h5" /></>
      )}
      {name === 'spark' && (
        <><path d="M12 3c.7 4.4 2.6 6.3 7 7-4.4.7-6.3 2.6-7 7-.7-4.4-2.6-6.3-7-7 4.4-.7 6.3-2.6 7-7Z" /><path d="M18.5 15.5c.3 2 1.2 2.9 3.2 3.2-2 .3-2.9 1.2-3.2 3.2-.3-2-1.2-2.9-3.2-3.2 2-.3 2.9-1.2 3.2-3.2Z" /></>
      )}
    </svg>
  )
}
