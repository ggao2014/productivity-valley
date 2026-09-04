/** Parse a number-input draft. Empty / invalid → null (keep editing). */
export function parseOptionalInt(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const value = Number(trimmed)
  if (!Number.isFinite(value)) return null
  return Math.trunc(value)
}

/** Clamp an integer to an inclusive [min, max] range when bounds are set. */
export function clampInt(value: number, min?: number, max?: number): number {
  let next = Math.trunc(value)
  if (!Number.isFinite(next)) next = min ?? 0
  if (min != null) next = Math.max(min, next)
  if (max != null) next = Math.min(max, next)
  return next
}
