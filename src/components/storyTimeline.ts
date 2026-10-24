/**
 * REISE scroll story, mapped to whole-page progress (0–1) but kept inside the
 * opening product chapters: silhouette → details → deconstruction → journey.
 *
 * Local math helpers keep this module free of three.js so it can be imported by
 * the main bundle (App.tsx) without pulling the 3D engine into the first load.
 */
const STORY_START = 0.015
const CAROUSEL_END = 0.31
const CROSSFADE_START = 0.295
const CROSSFADE_END = 0.325
const DECONSTRUCTION_END = 0.395
/** The stage begins dissolving here, as the REISE story hands over to shopping. */
const STAGE_FADE_START = 0.445
/** The atmosphere settles as the story ends; the stage itself is removed by the
    epilogue's exit (`--stage-exit`), which owns the handover to the shop. */
const STAGE_FADE_END = 0.505
/* The camera lands its composed finale pose just before the dissolve, so the
   last thing on screen is a held pose rather than a camera still gliding out
   with the scroll. */
const STAGE_SETTLE = STAGE_FADE_START - 0.01

const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value

/** Matches THREE.MathUtils.smoothstep: 0 at min, 1 at max, smooth in between. */
const smoothstep = (value: number, min: number, max: number) => {
  const t = clamp((value - min) / (max - min), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Maps the opening product-story scroll to the carousel's 0–1 range. */
export const storyProgress = (progress: number) =>
  clamp((progress - STORY_START) / (CAROUSEL_END - STORY_START), 0, 1)

/** Camera path progress. Reaches 1 at STAGE_SETTLE and stays there: the pose
    holds through the dissolve instead of following the scroll off the stage. */
export const stageProgress = (progress: number) =>
  clamp((progress - STORY_START) / (STAGE_SETTLE - STORY_START), 0, 1)

/** Carousel gives way to the construction chapter with a short, soft crossfade. */
export const carouselVisibility = (progress: number) =>
  1 - smoothstep(progress, CROSSFADE_START, CROSSFADE_END)

/** Exploded views crossfade in; the reassembled bag then stays on stage so the
    epilogue can hold it as the composed frame. */
export const explodedVisibility = (progress: number) =>
  smoothstep(progress, CROSSFADE_START, CROSSFADE_END)

/** Explode gently, hold the detail, then reassemble into the full silhouette. */
export const explodeAmount = (progress: number) =>
  smoothstep(progress, 0.325, 0.355) *
  (1 - smoothstep(progress, 0.375, DECONSTRUCTION_END))

/** Release the fixed stage as the REISE story hands over to shopping. */
export const stageVisibility = (progress: number) =>
  1 - smoothstep(progress, STAGE_FADE_START, STAGE_FADE_END)
