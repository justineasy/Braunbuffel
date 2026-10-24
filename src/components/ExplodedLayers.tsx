import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { explodeAmount, explodedVisibility } from './storyTimeline'

/**
 * ExplodedLayers — Clean scroll-driven exploded architectural view.
 *
 * Separates the REISE perspectives into a stepped, depth-separated 3D stack
 * in the right-hand showcase stage without any synthetic rings or circles.
 */

interface ExplodedFrame {
  image: string
  label: string
}

interface ExplodedLayersProps {
  frames: readonly ExplodedFrame[]
  progress: MutableRefObject<number>
  pointer: MutableRefObject<{ x: number; y: number }>
}

const LAYER_SPACING = 1.25
const DEPTH_STEP = 0.62

export default function ExplodedLayers({
  frames,
  progress,
  pointer,
}: ExplodedLayersProps) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const viewport = useThree((state) => state.viewport)

  const textures = useTexture(frames.map((frame) => frame.image))

  const materials = useMemo(() => {
    const list = Array.isArray(textures) ? textures : [textures]
    return list.map((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 8
      return new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        opacity: 0,
      })
    })
  }, [textures])

  const isMobile = viewport.width < 5.2
  const stageX = isMobile ? 0 : viewport.width * 0.21
  const stageY = isMobile ? 0.14 : 0.06
  const baseSize = THREE.MathUtils.clamp(
    viewport.width * (isMobile ? 0.58 : 0.36),
    1.85,
    3.2
  )

  useFrame((state) => {
    const explode = explodeAmount(progress.current)
    const visibility = explodedVisibility(progress.current)
    const time = state.clock.elapsedTime
    const center = (frames.length - 1) / 2
    const px = pointer.current.x
    const py = pointer.current.y

    meshRefs.current.forEach((mesh, index) => {
      if (!mesh) return
      const material = materials[index]

      const slot = index - center
      const isLead = index === 0

      mesh.visible = visibility > 0.01
      mesh.position.set(
        stageX + slot * 0.22 * explode + px * 0.08 * (index + 1) * 0.25,
        stageY +
          slot * LAYER_SPACING * explode +
          Math.sin(time * 0.7 + index) * 0.025 * explode +
          py * 0.06,
        -index * DEPTH_STEP * explode
      )
      mesh.rotation.y = slot * 0.26 * explode + px * 0.12
      mesh.rotation.x = -py * 0.06 + explode * 0.04
      mesh.scale.setScalar(
        THREE.MathUtils.lerp(baseSize, baseSize * 0.68, explode)
      )
      mesh.renderOrder = frames.length - index

      const layerOpacity =
        THREE.MathUtils.lerp(isLead ? 1 : 0, 0.94, explode) * visibility
      material.opacity = layerOpacity
    })
  })

  return (
    <group>
      {frames.map((frame, index) => (
        <mesh
          key={frame.image}
          ref={(element) => {
            meshRefs.current[index] = element
          }}
          material={materials[index]}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  )
}
