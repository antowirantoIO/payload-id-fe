'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface PasswordInputProps extends React.ComponentProps<'input'> {
  /** Show toggle button inside the input */
  showToggle?: boolean
}

/**
 * Password input with built-in visibility toggle.
 * Renders a standard Input but adds an eye/eye-off button inside the field.
 */
export function PasswordInput({ showToggle = true, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  if (!showToggle) {
    return <Input type="password" className={className} {...props} />
  }

  return (
    <div className="relative w-full min-w-0">
      <Input
        type={visible ? 'text' : 'password'}
        className={className}
        autoComplete={props.autoComplete ?? 'current-password'}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        tabIndex={-1}
        aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
