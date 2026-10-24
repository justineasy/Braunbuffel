import { useMemo, useRef, type MutableRefObject } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { stageFollowSeconds } from '../motion'
import { stageProgress } from './storyTimeline'

/**
 * SceneCamera — Smoothly dollies the camera along a restrained studio spline
 * while keeping the 3D bag anchored in the right-hand showcase stage.
 */

/* Cinematic dolly: wide hero → push-in on the details → orbit out to a three-quarter pull-back. */
const CAMERA_PATH = [
  new THREE.Vector3(0.0, 0.25, 7.6),
  new THREE.Vector3(0.7, 0.42, 7.0),
  new THREE.Vector3(0.2, 0.62, 6.3),
  new THREE.Vector3(-0.7, 0.36, 6.9),
  new THREE.Vector3(0.0, 0.26, 7.45),
]

const LOOK_PATH = [
  new THREE.Vector3(0.0, 0.08, 0),
  new THREE.Vector3(0.1, 0.1, 0),
  new THREE.Vector3(0.0, 0.16, -0.1),
  new THREE.Vector3(-0.08, 0.09, 0),
  new THREE.Vector3(0.0, 0.06, 0),
]

interface SceneCameraProps {
  progress: MutableRefObject<number>
  pointer: MutableRefObject<{ x: number; y: number }>
}

export default function SceneCamera({ progress, pointer }: SceneCameraProps) {
  const { camera, invalidate } = useThree()

  const positionCurve = useMemo(
    () => new THREE.CatmullRomCurve3(CAMERA_PATH, false, 'centripetal'),
    []
  )
  const lookCurve = useMemo(
    () => new THREE.CatmullRomCurve3(LOOK_PATH, false, 'centripetal'),
    []
  )

  /* Follow time constant from the one motion system: a fraction of the page's
     trail, so a finger tightens the camera by the same weight as the copy. */
  const follow = useMemo(() => stageFollowSeconds(), [])

  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3(0.0, 0.08, 0))

  useFrame((state, delta) => {
    const t = stageProgress(progress.current)
    positionCurve.getPointAt(t, targetPosition.current)
    lookCurve.getPointAt(t, targetLookAt.current)

    // Restrained pointer parallax for a composed luxury showroom feel.
    // Keep the interpolated target immutable: the spline is evaluated each frame.
    const px = pointer.current.x * 0.16
    const py = pointer.current.y * 0.1
    targetPosition.current.x += px
    targetPosition.current.y += py

    // A faint idle breath keeps the stage alive; the glide stays frame-rate independent.
    targetPosition.current.y += Math.sin(state.clock.elapsedTime * 0.6) * 0.035

    // Frame-rate independent, and never slower than the page's own trail.
    const damping = 1 - Math.exp(-Math.min(delta, 0.1) / follow)
    camera.position.lerp(targetPosition.current, damping)
    currentLookAt.current.lerp(targetLookAt.current, damping)
    camera.lookAt(currentLookAt.current)
    if (damping > 0.001) invalidate()
  })

  return null
}
