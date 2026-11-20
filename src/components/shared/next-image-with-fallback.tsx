'use client'

/**
 * NextImageWithFallback — next/image wrapper with error fallback.
 *
 * next/image does not support onError natively, so we need a client component
 * with useState to detect load failures and render a placeholder instead.
 * Also handles null/undefined src by showing the fallback immediately.
 *
 * The fallback renders a gradient background with initials or an icon,
 * matching the visual weight of a real image.
 *
 * Usage:
 *   <NextImageWithFallback src={url} alt="Logo" fallback="AC" fill className="object-cover" />
 */

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NextImageWithFallbackProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string | null | undefined
  /** Text shown in the fallback placeholder (usually initials or short label). */
  fallback?: string
  /** Optional icon rendered instead of text when image fails. */
  icon?: React.ReactNode
}

export function NextImageWithFallback({
  src,
  fallback = '',
  icon,
  className,
  alt,
  fill,
  ...props
}: NextImageWithFallbackProps) {
  const normalizedSrc = normalizeNextImageSource(src)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = normalizedSrc !== null && failedSrc === normalizedSrc

  if (!normalizedSrc || failed) {
    return (
      <div
        role="img"
        aria-label={alt || 'Image unavailable'}
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden',
          'bg-gradient-to-br from-muted to-muted/60',
          'text-muted-foreground/80 select-none',
          fill && 'absolute inset-0 size-full',
          className,
        )}
      >
        {icon ? (
          <span className="opacity-50">{icon}</span>
        ) : (
          <span className="font-semibold uppercase tracking-tight">{fallback.slice(0, 2)}</span>
        )}
      </div>
    )
  }

  return (
    <Image
      {...props}
      fill={fill}
      src={normalizedSrc}
      alt={alt}
      className={cn('object-cover', className)}
      onError={() => setFailedSrc(normalizedSrc)}
    />
  )
}

function normalizeNextImageSource(src: string | null | undefined) {
  const value = src?.trim()
  if (!value) return null
  if (value.startsWith('/') && !value.startsWith('//')) return value

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return null

    const allowedHost =
      (url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/storage/v1/object/')) ||
      url.hostname === 'images.unsplash.com' ||
      url.hostname === 'plus.unsplash.com' ||
      url.hostname === 'picsum.photos' ||
      url.hostname === 'fastly.picsum.photos'

    return allowedHost ? value : null
  } catch {
    return null
  }
}
