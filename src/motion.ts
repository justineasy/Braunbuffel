/**
 * The page's scroll rhythm — one system behind the glide, the pins and the
 * framed windows.
 *
 * Everything is measured in *beats*: one beat is one screen of scrolling. A
 * window (the hero photograph, the campaign photograph) opens over exactly one
 * beat, and a pinned interlude holds for exactly one beat, so the page keeps the
 * same pulse at every scale instead of each section inventing its own.
 *
 * Phones get a shorter beat. A phone screen is tall and the thumb travels less
 * per gesture, so a full screen of scroll for every reveal reads as slow; three
 * quarters of a screen keeps the same choreography at a quicker pace.
 *
 * The springs are weighed by the input that drives them, because the two inputs
 * already carry different momentum:
 *  - A wheel is inert, so Lenis supplies the weight: `glideSeconds` eases the
 *    document toward the gesture, and content trails it by `scrubSeconds`.
 *  - A finger has the OS behind it. Native momentum is already the glide, so
 *    content trails touch less (`touchScrubSeconds`) — adding a second, equal
 *    spring on top is what makes phones feel floaty and slower than desktop.
 *  - A fling reaches far higher speeds than a wheel tick, so touch measures
 *    velocity against a higher reference and the window breath stays
 *    proportional instead of pinned at full depth on every swipe.
 *
 * The 3D stage reads the same trail. Its camera and cards follow at fixed
 * fractions of `scrubSeconds` rather than with springs of their own, so when
 * touch tightens the content it tightens the bag by the same amount — the stage
 * can never lag a flick more than the copy it sits behind.
 */

export const MOTION = {
  /** A beat on a full-size viewport, as a fraction of the screen. */
  beat: 1,
  /** A beat on a phone: the same reveal in three quarters of the travel. */
  compactBeat: 0.75,
  /** A framed window opens across this many beats. */
  windowBeats: 1,
  /** A pinned chapter holds for this many beats. */
  holdBeats: 1,
  /** Seconds Lenis takes to settle a wheel gesture — the page's weight. */
  glideSeconds: 1.02,
  /** Seconds a scroll-linked tween trails the wheel. */
  scrubSeconds: 0.55,
  /** Seconds a scroll-linked tween trails a finger — the OS already glides. */
  touchScrubSeconds: 0.38,
  /** The 3D camera follows at this fraction of the trail: slightly tighter
      than the copy, so the stage reads as composed rather than slack. */
  stageTrailRatio: 0.44,
  /** The carousel's card-to-card focus is this fraction again, tighter still. */
  stageFocusRatio: 0.6,
  /** px/s at which a wheel gesture counts as a full-speed scroll. */
  velocityReference: 2600,
  /** px/s at which a finger fling counts as a full-speed scroll. */
  touchVelocityReference: 4200,
  /** How far a window opens ahead of its position on a fast flick, 0–1. */
  breath: 0.22,
} as const

/** The same breakpoint the stylesheet switches layout at. */
const COMPACT_QUERY = '(max-width: 768px)'

/** A coarse primary pointer is a finger, not a mouse or trackpad. */
const TOUCH_QUERY = '(pointer: coarse)'

export const isCompactViewport = () => window.matchMedia(COMPACT_QUERY).matches

export const isTouchPrimary = () => window.matchMedia(TOUCH_QUERY).matches

/** How many viewport heights one beat is: 1 on desktop, 0.75 on a phone. */
export const beatFraction = () =>
  isCompactViewport() ? MOTION.compactBeat : MOTION.beat

/** One beat in pixels. Pins are measured in screens, never in stray percentages. */
export const beatPx = () => window.innerHeight * beatFraction()

/** Pixels of scrolling a framed window takes to open. */
export const windowPx = () => beatPx() * MOTION.windowBeats

/** End value for a pinned chapter: it starts at the top and holds for its beat. */
export const pinEnd = () => `+=${Math.round(beatPx() * MOTION.holdBeats)}`

/** The trailing spring for the input in use. Every scroll-linked tween shares it. */
export const scrubSeconds = () =>
  isTouchPrimary() ? MOTION.touchScrubSeconds : MOTION.scrubSeconds

/** Time constant for the 3D camera's follow, in seconds. */
export const stageFollowSeconds = () => scrubSeconds() * MOTION.stageTrailRatio

/** Time constant for the carousel's card focus, in seconds. */
export const stageFocusSeconds = () =>
  stageFollowSeconds() * MOTION.stageFocusRatio

/** Speed that reads as a full-speed gesture for the input in use. */
export const velocityReferencePx = () =>
  isTouchPrimary() ? MOTION.touchVelocityReference : MOTION.velocityReference
