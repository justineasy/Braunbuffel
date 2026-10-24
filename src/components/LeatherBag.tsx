import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * LeatherBag — A handcrafted 3D saddle bag with layered leather, stitched panels,
 * rolled handles and solid brass hardware, staged for close-up product viewing.
 * 
 * Scroll-driven behavior:
 * 0.0–0.15: Gentle idle rotation (hero)
 * 0.15–0.4: Tilt forward, slow rotation for detail view (craftsmanship)
 * 0.4–0.6:  Orbit + slight elevation for product reveal
 * 0.6–0.8:  Return to center, gentle bob (journey)
 * 0.8–1.0:  Final hero pose
 */

interface LeatherBagProps {
  scrollProgress: number
}

function createLeatherTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')

  if (context) {
    context.fillStyle = '#b78351'
    context.fillRect(0, 0, canvas.width, canvas.height)
    const sheen = context.createRadialGradient(184, 135, 12, 256, 256, 370)
    sheen.addColorStop(0, 'rgba(241, 206, 157, 0.26)')
    sheen.addColorStop(0.55, 'rgba(164, 111, 67, 0.05)')
    sheen.addColorStop(1, 'rgba(46, 23, 12, 0.28)')
    context.fillStyle = sheen
    context.fillRect(0, 0, canvas.width, canvas.height)

    let seed = 37
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }

    for (let i = 0; i < 6500; i++) {
      const x = random() * canvas.width
      const y = random() * canvas.height
      const light = random() > 0.53
      context.strokeStyle = light ? 'rgba(247, 220, 177, 0.16)' : 'rgba(62, 34, 19, 0.15)'
      context.lineWidth = 0.35 + random() * 0.8
      context.beginPath()
      context.moveTo(x, y)
      context.quadraticCurveTo(x + random() * 2.5, y + random() * 3, x + 0.5 + random() * 4, y + 1 + random() * 5)
      context.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1.4, 1.25)
  texture.anisotropy = 8
  return texture
}

const BAG_AXIS_X = new THREE.Vector3(1, 0, 0)
const BAG_AXIS_Y = new THREE.Vector3(0, 1, 0)

export default function LeatherBag({ scrollProgress }: LeatherBagProps) {
  const groupRef = useRef<THREE.Group>(null)
  const innerGroupRef = useRef<THREE.Group>(null)

  const leatherTexture = useMemo(() => createLeatherTexture(), [])

  // Hand-grained hide uses the same fine color detail as a subtle micro-bump.
  const leatherMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#080a0b'),
    map: leatherTexture,
    bumpMap: leatherTexture,
    bumpScale: 0.008,
    roughness: 0.78,
    metalness: 0,
    clearcoat: 0.025,
    clearcoatRoughness: 0.82,
    envMapIntensity: 0.55,
  }), [leatherTexture])

  const edgeMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#101214'),
    roughness: 0.64,
    metalness: 0,
    clearcoat: 0.09,
    clearcoatRoughness: 0.6,
    envMapIntensity: 0.75,
  }), [])

  // Darker leather for contrast panels
  const leatherDarkMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#17191b'),
    map: leatherTexture,
    bumpMap: leatherTexture,
    bumpScale: 0.006,
    roughness: 0.48,
    metalness: 0,
    clearcoat: 0.16,
    clearcoatRoughness: 0.44,
    envMapIntensity: 0.9,
  }), [leatherTexture])

  // Metal hardware — champagne gold
  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#aeb6b8'),
    roughness: 0.38,
    metalness: 0.82,
    envMapIntensity: 1.35,
  }), [])

  // Stitching — lighter thread
  const stitchMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#343638'),
    roughness: 0.9,
    metalness: 0.0,
  }), [])

  // Interior lining glimpse
  const liningMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#191c1e'),
    roughness: 0.94,
    metalness: 0.0,
    side: THREE.DoubleSide,
  }), [])

  const bagBodyGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.68, -0.52)
    shape.quadraticCurveTo(-0.77, -0.52, -0.77, -0.4)
    shape.lineTo(-0.77, 0.32)
    shape.quadraticCurveTo(-0.77, 0.54, -0.56, 0.58)
    shape.quadraticCurveTo(0, 0.65, 0.56, 0.58)
    shape.quadraticCurveTo(0.77, 0.54, 0.77, 0.32)
    shape.lineTo(0.77, -0.4)
    shape.quadraticCurveTo(0.77, -0.52, 0.68, -0.52)
    shape.lineTo(-0.68, -0.52)
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.82,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.045,
      bevelThickness: 0.055,
      curveSegments: 16,
    })
  }, [])

  const pocketGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.52, -0.31)
    shape.lineTo(0.52, -0.31)
    shape.quadraticCurveTo(0.59, -0.31, 0.59, -0.24)
    shape.lineTo(0.59, 0.17)
    shape.quadraticCurveTo(0.59, 0.25, 0.5, 0.26)
    shape.quadraticCurveTo(0, 0.31, -0.5, 0.26)
    shape.quadraticCurveTo(-0.59, 0.25, -0.59, 0.17)
    shape.lineTo(-0.59, -0.24)
    shape.quadraticCurveTo(-0.59, -0.31, -0.52, -0.31)
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      curveSegments: 10,
    })
  }, [])

  const handleGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.35, 1.34, 0),
      new THREE.Vector3(-0.37, 1.55, 0),
      new THREE.Vector3(-0.32, 1.77, 0),
      new THREE.Vector3(0, 1.84, 0),
      new THREE.Vector3(0.32, 1.77, 0),
      new THREE.Vector3(0.37, 1.55, 0),
      new THREE.Vector3(0.35, 1.34, 0),
    ])
    return new THREE.TubeGeometry(curve, 52, 0.058, 12, false)
  }, [])

  const pocketStitchGeometry = useMemo(() => {
    const points = [
      [-0.55, -0.31], [0.55, -0.31], [0.62, -0.25], [0.62, 0.17],
      [0.53, 0.26], [0, 0.31], [-0.53, 0.26], [-0.62, 0.17],
      [-0.62, -0.25], [-0.55, -0.31],
    ].map(([x, y]) => new THREE.Vector3(x, y, 0))
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  const pocketStitch = useMemo(() => new THREE.Line(
    pocketStitchGeometry,
    new THREE.LineBasicMaterial({ color: '#dfbd89' })
  ), [pocketStitchGeometry])

  const targetRotY = useMemo(() => new THREE.Quaternion(), [])
  const targetRotX = useMemo(() => new THREE.Quaternion(), [])
  const rotY = useMemo(() => new THREE.Quaternion(), [])
  const rotX = useMemo(() => new THREE.Quaternion(), [])

  useFrame((state, delta) => {
    if (!groupRef.current || !innerGroupRef.current) return
    const t = scrollProgress
    const time = state.clock.elapsedTime

    // --- Scroll-driven rotation ---
    const sectionProgress = THREE.MathUtils.smoothstep(t, 0.17, 0.39)
    const orbitProgress = THREE.MathUtils.smoothstep(t, 0.39, 0.69)
    const returnProgress = THREE.MathUtils.smoothstep(t, 0.7, 0.92)
    const reveal = THREE.MathUtils.smoothstep(t, 0.035, 0.16)

    const targetY = time * 0.012 + sectionProgress * 0.24 + orbitProgress * 0.52 - returnProgress * 0.2
    const targetX = Math.sin(time * 0.16) * 0.012 - sectionProgress * 0.035 + orbitProgress * 0.055 - returnProgress * 0.02
    const targetZ = Math.sin(time * 0.3) * 0.012
    const targetPosY = -0.27 + reveal * 0.035 + Math.sin(time * 0.35) * 0.012
    const targetPosX = -0.2 - reveal * 0.08 + orbitProgress * 0.08 + returnProgress * 0.05
    const targetScale = 0.9 + reveal * 0.09 - orbitProgress * 0.025 + returnProgress * 0.01

    targetRotY.setFromAxisAngle(BAG_AXIS_Y, targetY)
    targetRotX.setFromAxisAngle(BAG_AXIS_X, targetX)
    rotY.slerp(targetRotY, 1 - Math.pow(0.0005, delta))
    rotX.slerp(targetRotX, 1 - Math.pow(0.0005, delta))
    innerGroupRef.current.quaternion.copy(rotY).multiply(rotX)
    innerGroupRef.current.position.z = targetZ
    innerGroupRef.current.scale.setScalar(targetScale)
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 1 - Math.pow(0.003, delta))
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 1 - Math.pow(0.003, delta))
  })

  return (
    <group ref={groupRef} position={[-0.2, -0.27, 0]}>
      <group ref={innerGroupRef} scale={0.9}>
        {/* Structured, softly rounded saddle-leather body */}
        <mesh material={leatherMaterial} geometry={bagBodyGeometry} position={[0, 0.6, -0.41]} castShadow receiveShadow />

        {/* Flexible gusset sides give the silhouette depth */}
        <mesh material={edgeMaterial} position={[-0.74, 0.62, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 1.02, 0.82, 4, 8, 10]} />
        </mesh>
        <mesh material={edgeMaterial} position={[0.74, 0.62, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 1.02, 0.82, 4, 8, 10]} />
        </mesh>

        {/* Piped seams follow both curved edges of the front leather panel */}
        {[-0.76, 0.76].map((x, i) => (
          <mesh key={`panel-piping-${i}`} material={edgeMaterial} position={[x, 0.6, 0.425]}>
            <capsuleGeometry args={[0.014, 0.9, 4, 8]} />
          </mesh>
        ))}

        {/* Interior lining glimpse — visible from top */}
        <mesh material={liningMaterial} position={[0, 1.13, 0]}>
          <boxGeometry args={[1.42, 0.1, 0.72]} />
        </mesh>

        {/* Bag top flap */}
        <mesh material={edgeMaterial} position={[0, 1.19, 0]} castShadow>
          <boxGeometry args={[1.62, 0.16, 0.9, 4, 2, 8]} />
        </mesh>
        <mesh material={leatherDarkMaterial} position={[0, 1.28, 0.14]} rotation={[-0.09, 0, 0]} castShadow>
          <boxGeometry args={[1.54, 0.11, 0.68, 4, 2, 8]} />
        </mesh>

        {/* Curved front pocket — defined by tonal saddle stitching */}
        <mesh material={leatherDarkMaterial} geometry={pocketGeometry} position={[0, 0.45, 0.415]} castShadow />

        {/* Metal clasp — center front */}
        <mesh material={metalMaterial} position={[0, 0.58, 0.468]} castShadow>
          <boxGeometry args={[0.2, 0.08, 0.04]} />
        </mesh>

        {/* Metal clasp plate */}
        <mesh material={metalMaterial} position={[0, 0.58, 0.498]} castShadow>
          <boxGeometry args={[0.12, 0.04, 0.02]} />
        </mesh>

        {/* Metal buckle detail — left */}
        <mesh material={metalMaterial} position={[-0.45, 0.58, 0.468]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 16]} />
        </mesh>

        {/* Metal buckle detail — right */}
        <mesh material={metalMaterial} position={[0.45, 0.58, 0.468]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 16]} />
        </mesh>

        {/* One continuous curved leather handle */}
        <mesh material={leatherMaterial} geometry={handleGeometry} castShadow />

        {/* Handle wrapping detail */}
        <mesh material={leatherDarkMaterial} position={[0, 1.99, 0]}>
          <boxGeometry args={[0.15, 0.055, 0.09]} />
        </mesh>

        {/* Handle — metal rings */}
        <mesh material={metalMaterial} position={[-0.42, 1.37, 0.02]} castShadow>
          <torusGeometry args={[0.05, 0.015, 12, 20]} />
        </mesh>
        <mesh material={metalMaterial} position={[0.42, 1.37, 0.02]} castShadow>
          <torusGeometry args={[0.05, 0.015, 12, 20]} />
        </mesh>

        {/* Shoulder strap anchors — metal D-rings on sides */}
        <mesh material={metalMaterial} position={[-0.78, 0.96, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.04, 0.01, 8, 16]} />
        </mesh>
        <mesh material={metalMaterial} position={[0.78, 0.96, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.04, 0.01, 8, 16]} />
        </mesh>

        {/* Tonal saddle stitch around the curved pocket */}
        <primitive object={pocketStitch} position={[0, 0.45, 0.468]} />
        <mesh material={stitchMaterial} position={[0, 1.06, 0.405]}>
          <boxGeometry args={[1.5, 0.008, 0.008]} />
        </mesh>

        {/* Bottom panel — base */}
        <mesh material={leatherDarkMaterial} position={[0, 0.03, 0]} receiveShadow>
          <boxGeometry args={[1.58, 0.06, 0.73]} />
        </mesh>

        {/* Metal feet — bottom corners */}
        {[
          [-0.65, -0.02, 0.28],
          [0.65, -0.02, 0.28],
          [-0.65, -0.02, -0.28],
          [0.65, -0.02, -0.28],
        ].map((pos, i) => (
          <mesh key={`foot-${i}`} material={metalMaterial} position={pos as [number, number, number]} castShadow>
            <sphereGeometry args={[0.03, 12, 12]} />
          </mesh>
        ))}

        {/* Side panels — gussets */}
        <mesh material={leatherMaterial} position={[-0.78, 0.6, 0]} castShadow>
          <boxGeometry args={[0.04, 1.1, 0.73]} />
        </mesh>
        <mesh material={leatherMaterial} position={[0.78, 0.6, 0]} castShadow>
          <boxGeometry args={[0.04, 1.1, 0.73]} />
        </mesh>

        {/* Side stitch details */}
        <mesh material={stitchMaterial} position={[-0.83, 0.6, 0]}>
          <boxGeometry args={[0.005, 0.9, 0.008]} />
        </mesh>
        <mesh material={stitchMaterial} position={[0.83, 0.6, 0]}>
          <boxGeometry args={[0.005, 0.9, 0.008]} />
        </mesh>

        {/* Zipper pull — top */}
        <mesh material={metalMaterial} position={[0.5, 1.16, 0.35]} castShadow>
          <boxGeometry args={[0.03, 0.06, 0.02]} />
        </mesh>
        <mesh material={metalMaterial} position={[0.5, 1.14, 0.52]}>
          <sphereGeometry args={[0.015, 8, 8]} />
        </mesh>

        {/* Brand emblem area — subtle rectangle on front */}
        <mesh material={metalMaterial} position={[0, 0.45, 0.466]}>
          <boxGeometry args={[0.18, 0.1, 0.005]} />
        </mesh>
      </group>
    </group>
  )
}
