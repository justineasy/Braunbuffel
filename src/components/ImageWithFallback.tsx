import type { ComponentProps, SyntheticEvent } from 'react'

const DEFAULT_FALLBACK = '/images/shop/photo-pending.svg'

type ImageWithFallbackProps = ComponentProps<'img'> & {
  fallbackSrc?: string
}

export default function ImageWithFallback({
  fallbackSrc = DEFAULT_FALLBACK,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    onError?.(event)
    const image = event.currentTarget
    if (image.dataset.fallbackApplied !== 'true') {
      image.dataset.fallbackApplied = 'true'
      ;(image as HTMLImageElement).src = fallbackSrc
    }
  }

  // Errors are handled gracefully by switching to the fallback image.

  return <img {...props} onError={handleError} />
}
