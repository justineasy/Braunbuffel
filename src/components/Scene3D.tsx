import { Suspense, lazy, useEffect, useState, type MutableRefObject } from 'react'
import type { StoryFrame } from './Scene3DCanvas'

/**
 * Scene3D — Clean luxury 3D product showcase.
 *
 * This module stays lightweight: it decides how rich the stage can be, and only
 * then lazily pulls in `Scene3DCanvas`, which carries three.js and the
 * @react-three ecosystem. That keeps the initial JS payload free of WebGL code,
 * and gives phones a compact variant (fewer cards, lower pixel ratio, no
 * exploded stack) instead of skipping the stage entirely.
 */

// React.lazy keeps the WebGL chunk out of the main bundle. The `import type`
// above is erased at compile time, so Scene3DCanvas stays truly async.
const Scene3DCanvas = lazy(() => import('./Scene3DCanvas'))

interface Scene3DProps {
  progress: MutableRefObject<number>
  frames: readonly StoryFrame[]
}

const COMPACT_QUERY = '(max-width: 767px)'

/** Devices that cannot render WebGL keep the static product photography. */
function supportsWebGL() {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl')
    )
  } catch {
    return false
  }
}

export default function Scene3D({ progress, frames }: Scene3DProps) {
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(COMPACT_QUERY).matches
  )
  // One capability probe per mount; no need to re-check on every render.
  const [enabled] = useState(supportsWebGL)

  useEffect(() => {
    const query = window.matchMedia(COMPACT_QUERY)
    const updateViewport = () => setCompact(query.matches)
    query.addEventListener('change', updateViewport)
    return () => query.removeEventListener('change', updateViewport)
  }, [])

  /* Without WebGL the photographic stage must stay; mark it so CSS can keep the
     static product cutout visible through the story chapters. */
  useEffect(() => {
    const stage = document.querySelector('.photo-scene')
    if (!stage) return
    stage.classList.toggle('photo-scene--no-3d', !enabled)
    return () => stage.classList.remove('photo-scene--no-3d')
  }, [enabled])

  if (!enabled) return null

  return (
    <Suspense fallback={null}>
      <Scene3DCanvas progress={progress} frames={frames} compact={compact} />
    </Suspense>
  )
}
