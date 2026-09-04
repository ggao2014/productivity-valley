import { useEffect, useRef, useState, type InputHTMLAttributes } from 'react'
import { clampInt, parseOptionalInt } from '../core/numberInput'

type NumberFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> & {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
}

/**
 * Number input that allows clearing/replacing digits while typing.
 * Bounds are applied on blur (and callers should re-clamp on submit).
 */
export function NumberField({
  value,
  onValueChange,
  min,
  max,
  onFocus,
  onBlur,
  ...rest
}: NumberFieldProps) {
  const [draft, setDraft] = useState(String(value))
  const focusedRef = useRef(false)

  useEffect(() => {
    if (!focusedRef.current) setDraft(String(value))
  }, [value])

  function commit(raw: string) {
    const parsed = parseOptionalInt(raw)
    const next = clampInt(parsed ?? min ?? 0, min, max)
    setDraft(String(next))
    onValueChange(next)
  }

  return (
    <input
      {...rest}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={draft}
      onFocus={(event) => {
        focusedRef.current = true
        onFocus?.(event)
      }}
      onChange={(event) => {
        const raw = event.target.value
        setDraft(raw)
        const parsed = parseOptionalInt(raw)
        if (parsed == null) return
        onValueChange(parsed)
      }}
      onBlur={(event) => {
        focusedRef.current = false
        commit(draft)
        onBlur?.(event)
      }}
    />
  )
}
