'use client'

import { XIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TagsInputProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  maxTags?: number
  className?: string
  /** Input id passthrough utk pasang ke <label htmlFor>. */
  id?: string
}

/**
 * Chip-style tag input. Type → Enter / Comma → tambah chip. Backspace di empty
 * input → hapus chip terakhir. Dedupe + trim otomatis.
 */
export function TagsInput({
  value,
  onChange,
  placeholder = 'Add tag…',
  maxTags = 20,
  className,
  id: idProp,
}: TagsInputProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const [draft, setDraft] = useState('')

  function commit() {
    const next = draft.trim()
    if (!next) return
    if (value.includes(next)) {
      setDraft('')
      return
    }
    if (value.length >= maxTags) return
    onChange([...value, next])
    setDraft('')
  }

  return (
    <div
      className={cn(
        'border-input bg-background focus-within:border-ring focus-within:ring-ring/30 hover:border-border flex flex-wrap items-center gap-1 rounded-lg border px-1.5 py-1 text-sm shadow-xs transition-[border-color,box-shadow] focus-within:ring-3',
        className,
      )}
    >
      {value.map((tag, idx) => (
        <span
          key={tag}
          className="border-border/60 bg-muted/60 hover:bg-muted inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium transition-colors"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== idx))}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive -mr-0.5 inline-flex size-3.5 items-center justify-center rounded-sm transition-colors"
            aria-label={`Remove ${tag}`}
          >
            <XIcon className="size-2.5" />
          </button>
        </span>
      ))}
      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            commit()
          }
          if (e.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ''}
        className="h-7 flex-1 min-w-[100px] border-0 bg-transparent p-0 px-1 text-xs shadow-none focus-visible:ring-0"
      />
    </div>
  )
}
