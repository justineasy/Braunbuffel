import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { stageFollowSeconds } from '../motion'

/** Soft studio light with a single slow highlight pass during the detail chapter. */
export default function SceneLighting({
  progress,
}: {
  progress: MutableRefObject<number>
}) {
  const keyLight = useRef<THREE.DirectionalLight>(null)

  /* The highlight rides the same follow as the camera instead of the raw scroll,
     so it cannot wash over the bag before the bag has arrived. */
  const followRate = useMemo(() => 1 / stageFollowSeconds(), [])
  const followedProgress = useRef(progress.current)

  useFrame((_, delta) => {
    const light = keyLight.current
    if (!light) return

    followedProgress.current = THREE.MathUtils.damp(
      followedProgress.current,
      progress.current,
      followRate,
      Math.min(delta, 0.1)
    )

    const sweep =
      THREE.MathUtils.smoothstep(followedProgress.current, 0.085, 0.15) *
      (1 - THREE.MathUtils.smoothstep(followedProgress.current, 0.2, 0.265))
    light.position.x = THREE.MathUtils.lerp(3.5, -3.5, sweep)
    light.position.z = 4 + Math.sin(sweep * Math.PI) * 1.2
    light.intensity = 1.45 + Math.sin(sweep * Math.PI) * 0.35
  })

  return (
    <>
      <ambientLight intensity={0.6} color="#DCE1E4" />
      <directionalLight ref={keyLight} position={[3.5, 5.5, 4]} intensity={1.45} color="#E8EDF0" />
      <directionalLight position={[-4, 2.5, 3]} intensity={0.7} color="#F4E8D8" />
      <pointLight position={[0, -0.45, 2.4]} intensity={0.25} color="#8c969b" distance={8} />
    </>
  )
}
