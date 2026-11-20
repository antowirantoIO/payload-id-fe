'use client'

/**
 * ImageWithFallback — native <img> wrapper that falls back to a styled
 * placeholder when the image fails to load (404, network error, etc.).
 *
 * The fallback renders a gradient circle/square with initials or an icon,
 * matching the visual weight of a real avatar/logo.
 *
 * Usage:
 *   <ImageWithFallback src={url} alt="Acme" fallback="AC" className="rounded-full" />
 *   <ImageWithFallback src={url} alt="" fallback="" icon={<PackageIcon />} className="size-12 rounded-md" />
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  /** Text shown in the fallback placeholder (usually initials). */
  fallback?: string
  className?: string
  /** Optional icon rendered instead of text when src is null/undefined. */
  icon?: React.ReactNode
}

export function ImageWithFallback({
  src,
  alt,
  fallback = '',
  className,
  icon,
}: ImageWithFallbackProps) {
  const normalizedSrc = normalizeImageSource(src)
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
    // biome-ignore lint/performance/noImgElement: arbitrary remote URLs may not match Next image hosts
    <img
      src={normalizedSrc}
      alt={alt}
      className={cn('shrink-0 object-cover', className)}
      onError={() => setFailedSrc(normalizedSrc)}
    />
  )
}

function normalizeImageSource(src: string | null | undefined) {
  const value = src?.trim()
  if (!value) return null

  if (value.startsWith('/') || value.startsWith('data:image/') || value.startsWith('blob:')) {
    return value
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? value : null
  } catch {
    return null
  }
}
