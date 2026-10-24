import { useEffect, useRef, useState } from 'react'

/**
 * useInView — Reports when an element first enters the viewport.
 *
 * Used for one-time reveal transitions. The result latches to true, so content
 * stays visible once revealed. Under reduced motion it starts visible.
 *
 * @param threshold Fraction of the element that must be visible (0–1).
 */
export default function useInView<T extends Element>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [isInView, setIsInView] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (isInView) return
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [isInView, threshold])

  return [ref, isInView] as const
}
