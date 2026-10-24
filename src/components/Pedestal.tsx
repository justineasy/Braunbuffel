import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { explodeAmount, stageVisibility } from './storyTimeline'

/**
 * Pedestal — Architectural dark-stone and brushed champagne-gold kinetic rings
 * that anchor the 3D bag cutouts in space and expand during the exploded view.
 */

interface PedestalProps {
  progress: MutableRefObject<number>
}

export default function Pedestal({ progress }: PedestalProps) {
  const platformRef = useRef<THREE.Group>(null)
  const outerRingRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)
  const haloRingRef = useRef<THREE.Mesh>(null)
  const baseMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const goldMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const bronzeMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const haloMatRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((state, delta) => {
    if (!platformRef.current) return
    const t = progress.current
    const explode = explodeAmount(t)
    const vis = stageVisibility(t)
    const time = state.clock.elapsedTime

    platformRef.current.visible = vis > 0.01

    const targetRot = t * Math.PI * 1.2 + time * 0.08
    platformRef.current.rotation.y = THREE.MathUtils.lerp(
      platformRef.current.rotation.y,
      targetRot,
      1 - Math.exp(-Math.min(delta, 0.1) * 5)
    )

    // Lower the pedestal slightly when layers explode so the stack has breathing room
    const targetY = -1.25 - explode * 0.65
    platformRef.current.position.y = THREE.MathUtils.lerp(
      platformRef.current.position.y,
      targetY,
      1 - Math.exp(-Math.min(delta, 0.1) * 5)
    )

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = time * 0.14 + t * 1.5
      outerRingRef.current.scale.setScalar(1 + explode * 0.22)
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -time * 0.18 - t * 1.2
      innerRingRef.current.scale.setScalar(1 + explode * 0.12)
    }
    if (haloRingRef.current) {
      haloRingRef.current.position.y = 1.38 + Math.sin(time * 0.9) * 0.06
      haloRingRef.current.rotation.y = -time * 0.12 + t * Math.PI
      haloRingRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.08 + explode * 0.25
      haloRingRef.current.scale.setScalar(1 + explode * 0.35)
    }

    if (goldMatRef.current) goldMatRef.current.opacity = 0.55 * vis
    if (bronzeMatRef.current) bronzeMatRef.current.opacity = 0.38 * vis
    if (haloMatRef.current) haloMatRef.current.opacity = 0.38 * vis
    if (baseMatRef.current) baseMatRef.current.opacity = 0.68 * vis * (1 - explode * 0.5)
  })

  return (
    <group ref={platformRef} position={[0.58, -1.25, -0.15]}>
      {/* Dark architectural plinth */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[1.55, 1.72, 0.14, 96, 1]} />
        <meshStandardMaterial
          ref={baseMatRef}
          color="#13110e"
          roughness={0.55}
          metalness={0.15}
          transparent
          opacity={0.72}
        />
      </mesh>

      {/* Champagne gold precision rim */}
      <mesh ref={innerRingRef} position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.57, 0.009, 12, 128]} />
        <meshStandardMaterial
          ref={goldMatRef}
          color="#C9B99A"
          roughness={0.28}
          metalness={0.78}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Outer orbital measurement ring */}
      <mesh ref={outerRingRef} position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.92, 0.005, 10, 128]} />
        <meshStandardMaterial
          ref={bronzeMatRef}
          color="#8B6F47"
          roughness={0.36}
          metalness={0.65}
          transparent
          opacity={0.38}
        />
      </mesh>

      {/* Elevated ambient brass halo behind the product */}
      <mesh ref={haloRingRef} position={[0, 1.38, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.38, 0.004, 10, 128]} />
        <meshStandardMaterial
          ref={haloMatRef}
          color="#8B6F47"
          roughness={0.36}
          metalness={0.65}
          transparent
          opacity={0.38}
        />
      </mesh>
    </group>
  )
}
