'use client'

import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const THEMES = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="bg-muted/40 border-border/60 inline-flex items-center gap-0.5 rounded-lg border p-0.5"
      >
        {THEMES.map((t) => (
          <span key={t.value} className="size-7 rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="bg-muted/40 border-border/60 inline-flex items-center gap-0.5 rounded-lg border p-0.5"
    >
      {THEMES.map(({ value, label, icon: Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn(
              'inline-flex size-7 items-center justify-center rounded-md transition-[background-color,color,box-shadow] duration-150',
              active
                ? 'bg-card text-foreground shadow-xs ring-1 ring-border/40'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-3.5" />
          </button>
        )
      })}
    </div>
  )
}
