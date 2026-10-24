import { useRef, useMemo, useEffect, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { stageVisibility } from './storyTimeline'

/**
 * FloatingParticles — Subtle champagne dust/light particles that add atmosphere.
 * Uses a deterministic pseudo-random generator so React hook purity passes cleanly.
 */

interface FloatingParticlesProps {
  count?: number
  progress: MutableRefObject<number>
}

function createParticlePositions(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  let seed = 1887 // Braun Büffel founding year
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  for (let i = 0; i < count; i++) {
    arr[i * 3] = (nextRand() - 0.5) * 10
    arr[i * 3 + 1] = nextRand() * 6 - 1
    arr[i * 3 + 2] = (nextRand() - 0.5) * 9
  }
  return arr
}

export default function FloatingParticles({ count = 42, progress }: FloatingParticlesProps) {
  const meshRef = useRef<THREE.Points>(null)
  const geometryRef = useRef<THREE.BufferGeometry>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)

  const positions = useMemo(() => createParticlePositions(count), [count])

  useEffect(() => {
    if (!geometryRef.current) return
    geometryRef.current.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )
  }, [positions])

  useFrame((_, delta) => {
    if (!meshRef.current || !geometryRef.current) return
    const posAttr = geometryRef.current.attributes.position as THREE.BufferAttribute
    if (!posAttr) return
    const posArr = posAttr.array as Float32Array
    const dt = Math.min(delta, 0.1)

    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += dt * 0.055
      if (posArr[i * 3 + 1] > 5.5) {
        posArr[i * 3 + 1] = -1.2
      }
    }
    posAttr.needsUpdate = true

    meshRef.current.rotation.y = progress.current * Math.PI * 0.45
    if (materialRef.current) {
      materialRef.current.opacity = 0.28 * stageVisibility(progress.current)
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial
        ref={materialRef}
        size={0.018}
        color="#C9B99A"
        transparent
        opacity={0.28}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
