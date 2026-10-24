import { useEffect, useRef, useMemo, useState, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { stageFocusSeconds } from '../motion'
import { carouselVisibility, storyProgress } from './storyTimeline'

/**
 * StoryCarousel — Clean product cutouts floating on a 3D arc in the right-hand
 * showcase stage, with no wireframe rings or distracting geometry.
 */

const ARC_STEP = 0.48 // radians between neighbouring cards
const RADIUS = 5.2 // distance of the arc from the camera's focal point

interface StoryFrame {
  image: string
  label: string
}

interface StoryCarouselProps {
  frames: readonly StoryFrame[]
  progress: MutableRefObject<number>
  pointer: MutableRefObject<{ x: number; y: number }>
}

export default function StoryCarousel({
  frames,
  progress,
  pointer,
}: StoryCarouselProps) {
  const groupRef = useRef<THREE.Group>(null)
  const cardRefs = useRef<(THREE.Mesh | null)[]>([])
  const sheenRef = useRef<THREE.Mesh>(null)
  const focusRef = useRef(0)
  const focusVelocityRef = useRef(0)
  const viewport = useThree((state) => state.viewport)

  /* Card focus follows the same weight as the rest of the page, a touch tighter
     than the camera so the arc leads the dolly slightly. */
  const focusRate = useMemo(() => 1 / stageFocusSeconds(), [])

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
      })
    })
  }, [textures])

  /* A soft horizontal glint that drifts across the focused card, like light over lacquered leather. */
  const [{ sheenTexture, sheenMaterial }] = useState(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 4
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 256, 0)
      gradient.addColorStop(0, 'rgba(255,244,214,0)')
      gradient.addColorStop(0.43, 'rgba(255,244,214,0)')
      gradient.addColorStop(0.5, 'rgba(255,244,214,0.55)')
      gradient.addColorStop(0.57, 'rgba(255,244,214,0)')
      gradient.addColorStop(1, 'rgba(255,244,214,0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 256, 4)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.colorSpace = THREE.SRGBColorSpace
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
      opacity: 0,
    })
    return { sheenTexture: texture, sheenMaterial: material }
  })

  useEffect(() => {
    return () => {
      sheenTexture.dispose()
      sheenMaterial.dispose()
    }
  }, [sheenTexture, sheenMaterial])

  const isMobile = viewport.width < 5.2
  // Anchor the 3D bag on the right-hand showcase stage on desktop so the centre stays clean
  const stageX = isMobile ? 0 : viewport.width * 0.21
  const stageY = isMobile ? 0.18 : 0.06
  const cardSize = THREE.MathUtils.clamp(
    viewport.width * (isMobile ? 0.62 : 0.38),
    2.1,
    3.45
  )

  useFrame((state, delta) => {
    const target = storyProgress(progress.current) * (frames.length - 1)
    const step = Math.min(delta, 0.1)
    const travel = target - focusRef.current
    // Damped focus keeps fast scrolls gliding card to card instead of snapping.
    focusRef.current = THREE.MathUtils.damp(focusRef.current, target, focusRate, step)
    // Velocity (cards per second) feeds a soft banking tilt, like holding a card
    // while turning to look at the next one.
    focusVelocityRef.current = THREE.MathUtils.damp(
      focusVelocityRef.current,
      step > 0 ? travel / step : 0,
      4,
      step
    )
    const banking = THREE.MathUtils.clamp(focusVelocityRef.current * 0.07, -0.16, 0.16)
    const focus = focusRef.current
    const time = state.clock.elapsedTime
    const reveal =
      THREE.MathUtils.smoothstep(progress.current, 0.015, 0.055) *
      carouselVisibility(progress.current)

    const px = pointer.current.x
    const py = pointer.current.y

    cardRefs.current.forEach((card, index) => {
      if (!card) return

      const offset = index - focus
      const magnitude = Math.min(Math.abs(offset), 1)
      const angle = offset * ARC_STEP

      card.position.x = stageX + Math.sin(angle) * RADIUS
      card.position.y = stageY + Math.sin(time * 0.8 + index * 1.6) * 0.025
      card.position.z = (Math.cos(angle) - 1) * RADIUS + (1 - magnitude) * 0.65

      const activeWeight = 1 - magnitude
      card.rotation.y = -angle * 0.8 + px * 0.1 * activeWeight
      card.rotation.x = -py * 0.06 * activeWeight
      card.rotation.z =
        Math.sin(time * 0.5 + index) * 0.008 + banking * activeWeight
      card.position.y += banking * 0.11 * activeWeight
      card.scale.setScalar(cardSize * (1 - magnitude * 0.14))

      const opacity =
        THREE.MathUtils.clamp(1 - Math.abs(offset) * 0.58, 0, 1) * reveal
      const material = materials[index]
      material.opacity = opacity

      card.visible = opacity > 0.01
      card.renderOrder = Math.round(100 - Math.abs(offset) * 10)
    })

    // Glint follows the card closest to focus and fades out as focus travels between cards.
    const sheen = sheenRef.current
    const active = THREE.MathUtils.clamp(Math.round(focus), 0, frames.length - 1)
    const activeCard = cardRefs.current[active]
    if (sheen && activeCard) {
      sheen.position.set(
        activeCard.position.x,
        activeCard.position.y,
        activeCard.position.z + 0.02
      )
      sheen.rotation.copy(activeCard.rotation)
      sheen.scale.copy(activeCard.scale)
      const glintMaterial = sheen.material as THREE.MeshBasicMaterial
      if (glintMaterial.map) glintMaterial.map.offset.x = time * 0.06 + px * 0.2
      glintMaterial.opacity =
        THREE.MathUtils.clamp(1 - Math.abs(focus - active) * 2, 0, 1) * reveal * 0.4
      sheen.visible = glintMaterial.opacity > 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {frames.map((frame, index) => (
        <mesh
          key={frame.image}
          ref={(element) => {
            cardRefs.current[index] = element
          }}
          material={materials[index]}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
      <mesh ref={sheenRef} material={sheenMaterial} renderOrder={150}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  )
}
