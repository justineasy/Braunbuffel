import { useEffect, useRef, type MutableRefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import SceneCamera from './SceneCamera'
import SceneLighting from './SceneLighting'
import FloatingParticles from './FloatingParticles'
import StoryCarousel from './StoryCarousel'
import ExplodedLayers from './ExplodedLayers'

/**
 * Scene3DCanvas — The WebGL half of the showcase stage.
 *
 * Deliberately kept in its own module: `Scene3D` imports it with React.lazy so
 * three.js, @react-three/fiber and @react-three/drei are code-split into an
 * async chunk that loads after first paint. Phones receive a compact variant
 * (two cards, lower pixel ratio, no exploded stack) rather than no stage.
 *
 * No synthetic pedestal or wireframe circles in the middle of the frame — only
 * the high-resolution product cutouts floating cleanly in 3D space with soft
 * studio lighting.
 */

export interface StoryFrame {
  image: string
  label: string
}

interface Scene3DCanvasProps {
  progress: MutableRefObject<number>
  frames: readonly StoryFrame[]
  /** Phones run a leaner stage: two cards, lower pixel ratio, no exploded stack. */
  compact?: boolean
}

export default function Scene3DCanvas({
  progress,
  frames,
  compact = false,
}: Scene3DCanvasProps) {
  const pointer = useRef({ x: 0, y: 0 })
  const stageFrames = compact ? frames.slice(0, 2) : frames

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const handlePointerMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      pointer.current.x = x
      pointer.current.y = y
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  return (
    <Canvas
      className="canvas-container"
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      performance={{ min: 0.55 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        outputColorSpace: 'srgb',
        toneMapping: 4, // ACESFilmic
        toneMappingExposure: 1.06,
      }}
      camera={{
        fov: 34,
        near: 0.1,
        far: 100,
        position: [0.0, 0.25, 7.6],
      }}
      style={{ background: 'transparent', pointerEvents: 'none' }}
    >
      <AdaptiveDpr pixelated />
      <SceneCamera progress={progress} pointer={pointer} />
      <SceneLighting progress={progress} />
      <StoryCarousel frames={stageFrames} progress={progress} pointer={pointer} />
      {!compact && (
        <ExplodedLayers frames={frames} progress={progress} pointer={pointer} />
      )}
      <FloatingParticles count={compact ? 8 : 18} progress={progress} />
    </Canvas>
  )
}
