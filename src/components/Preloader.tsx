import { useEffect, useMemo, useRef, useState } from 'react'
import './Preloader.css'

/* The Braun Büffel bull silhouette, traced from the brand mark (viewBox 0 0 44 26). */
const BULL_PATH =
  'M40.5 4.2 L40.2 3.9 L39.8 3.6 L39.1 3.7 L38.0 4.6 L37.6 6.5 L36.9 7.0 L35.8 7.1 L34.2 6.7 L32.2 5.2 L31.5 4.8 L30.6 4.0 L29.2 3.4 L28.7 3.4 L27.6 3.9 L23.5 5.1 L22.2 5.8 L21.1 5.9 L19.9 6.7 L18.0 7.1 L16.7 7.9 L15.5 7.9 L14.5 8.7 L13.6 8.9 L12.4 9.0 L10.9 9.7 L9.4 10.1 L8.2 10.7 L7.4 10.9 L6.4 10.7 L5.9 10.2 L5.7 9.5 L5.7 8.7 L6.6 7.6 L7.7 7.3 L11.8 7.4 L13.4 7.4 L14.2 7.1 L15.5 7.2 L16.4 6.8 L16.8 6.3 L17.1 5.4 L17.8 4.4 L17.5 4.1 L17.1 3.9 L16.1 3.8 L15.2 4.4 L14.6 5.6 L14.0 5.8 L6.4 5.8 L5.8 5.9 L4.5 6.9 L3.9 7.5 L3.6 8.8 L3.7 10.2 L4.1 10.9 L5.0 11.9 L6.1 12.8 L6.4 13.4 L6.3 20.6 L6.8 21.2 L7.4 21.4 L10.5 21.4 L11.2 21.1 L11.9 20.6 L12.4 18.6 L12.9 18.2 L13.9 18.2 L14.9 18.9 L16.2 19.1 L17.1 19.6 L17.6 19.7 L17.9 19.3 L18.1 18.5 L18.6 18.1 L22.2 18.1 L22.8 18.3 L23.1 18.6 L23.0 20.5 L23.4 21.1 L25.8 21.8 L27.3 21.6 L28.6 21.3 L29.1 20.9 L29.3 19.6 L29.9 18.8 L30.3 17.2 L31.0 16.4 L31.3 15.1 L31.5 14.9 L32.3 15.1 L32.8 15.0 L33.8 14.1 L34.1 13.3 L34.2 12.5 L34.9 11.6 L35.1 10.3 L35.6 9.5 L36.5 9.1 L37.9 9.0 L39.0 8.0 L39.9 6.4Z M32.6 8.2 L33.0 8.5 L33.1 9.3 L32.8 9.8 L32.3 9.8 L32.0 9.6 L31.9 9.1 L32.2 8.4Z'

/* A single wave period that scrolls horizontally to suggest liquid gold. */
const WAVE_PATH = 'M0 1q5.5-1.3 11 0t11 0 11 0 11 0 11 0 11 0 11 0 11 0V30H0z'

const BRAND_NAME = 'BRAUN BÜFFEL'
const TYPE_A = 'EST. 1887'
const TYPE_B = 'GERMANY'

/* The level group translates down by LEVEL_EMPTY px when empty and rises to LEVEL_FULL. */
const LEVEL_EMPTY = 23.5
const LEVEL_FULL = 2.0

/* Paced choreography: typing & liquid-gold bull rise together over ~2.25s,
   then the mark becomes the transition: it zooms through the plate and hands
   the screen to the page. */
const TYPING_START_DELAY_MS = 380
const TYPING_DURATION_MS = 2250
const HOLD_AT_FULL_MS = 520
const ZOOM_OUT_MS = 2400

type Phase = 'loading' | 'complete' | 'zooming' | 'fading' | 'dismissed'

function isReducedMotionPreferred(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export default function Preloader() {
  const [displayProgress, setDisplayProgress] = useState(() =>
    isReducedMotionPreferred() ? 1 : 0
  )
  const [phase, setPhase] = useState<Phase>(() =>
    isReducedMotionPreferred() ? 'complete' : 'loading'
  )
  const assetsReadyRef = useRef(false)

  /* Track real asset readiness while pacing the visual typing & bull fill smoothly. */
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (isReducedMotionPreferred()) {
      const t1 = window.setTimeout(() => setPhase('fading'), 180)
      const t2 = window.setTimeout(() => setPhase('dismissed'), 420)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }

    let cancelled = false
    const timers: number[] = []

    const markAssetsReady = () => {
      assetsReadyRef.current = true
    }

    // Check window load + critical hero images
    if (document.readyState === 'complete') {
      markAssetsReady()
    } else {
      window.addEventListener('load', markAssetsReady, { once: true })
    }

    const criticalSources = getCriticalSources()
    if (criticalSources.length > 0) {
      Promise.all(criticalSources.map((src) => loadCritical(src)))
        .then(markAssetsReady)
        .catch(markAssetsReady)
    }

    // Safety cap so a slow asset never blocks completion past 3.2s
    timers.push(window.setTimeout(markAssetsReady, 3200))

    // Drive both the gold fill and typewriter from the same frame-synced progress value.
    const startTime = performance.now()
    let frameId = 0

    const tick = (now: number) => {
      if (cancelled) return
      const elapsed = now - startTime - TYPING_START_DELAY_MS
      const rawT = Math.min(1, Math.max(0, elapsed / TYPING_DURATION_MS))

      // Smooth ease-in-out curve with gentle organic cadence
      const eased =
        rawT < 0.5
          ? 2 * rawT * rawT
          : 1 - Math.pow(-2 * rawT + 2, 2) / 2

      // Hold at 92% only if critical assets are still loading; otherwise glide to 100%.
      const nextProgress = Math.min(assetsReadyRef.current ? 1 : 0.92, eased)
      setDisplayProgress(nextProgress)

      if (nextProgress >= 0.999) {
        frameId = 0
        setDisplayProgress(1)
        setPhase('complete')

        timers.push(
          window.setTimeout(() => {
            if (!cancelled) setPhase('zooming')
          }, HOLD_AT_FULL_MS)
        )
        timers.push(
          window.setTimeout(() => {
            if (!cancelled) setPhase('dismissed')
          }, HOLD_AT_FULL_MS + ZOOM_OUT_MS)
        )
        return
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      cancelled = true
      if (frameId) window.cancelAnimationFrame(frameId)
      timers.forEach((id) => clearTimeout(id))
      window.removeEventListener('load', markAssetsReady)
    }
  }, [])

  /* Lock body scroll while the overlay is on screen. */
  useEffect(() => {
    if (phase === 'dismissed') {
      document.body.classList.remove('preloader-visible')
      return
    }
    document.body.classList.add('preloader-visible')
    return () => document.body.classList.remove('preloader-visible')
  }, [phase])

  const levelY = useMemo(
    () => LEVEL_EMPTY - displayProgress * (LEVEL_EMPTY - LEVEL_FULL),
    [displayProgress]
  )

  const { typedA, typedB } = useMemo(() => {
    const total = TYPE_A.length + TYPE_B.length
    const n = Math.round(displayProgress * total)
    return {
      typedA: TYPE_A.slice(0, Math.min(TYPE_A.length, n)),
      typedB: TYPE_B.slice(0, Math.max(0, n - TYPE_A.length)),
    }
  }, [displayProgress])

  if (phase === 'dismissed') return null

  const isComplete = phase === 'complete' || phase === 'zooming'
  const isZooming = phase === 'zooming'
  const isFading = phase === 'fading'

  return (
    <div
      className={`preloader${isZooming ? ' preloader--zooming' : ''}${isFading ? ' preloader--done' : ''}`}
      role="status"
      aria-label="Loading Braun Büffel"
      aria-busy={!isComplete}
    >
      {/* Gold bloom that expands behind the mark as it becomes the transition. */}
      <div className="preloader__bloom" aria-hidden="true" />

      <div className="preloader__wrap">
        <svg
          className={`preloader__bull${isComplete ? ' preloader__bull--done' : ''}`}
          viewBox="0 0 44 26"
          role="img"
          aria-label="Braun Büffel bull"
        >
          <defs>
            <linearGradient id="preloader-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ecd28f" />
              <stop offset="0.5" stopColor="#b08d4a" />
              <stop offset="1" stopColor="#8a6a30" />
            </linearGradient>
            <linearGradient id="preloader-sheen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
              <stop offset="0.65" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <clipPath id="preloader-clip">
              <path clipRule="evenodd" d={BULL_PATH} />
            </clipPath>
          </defs>

          {/* Faint ghost bull silhouette, always visible from frame 1 */}
          <path className="preloader__ghost" d={BULL_PATH} />

          {/* The pop lives on this inner group, so it never competes with the
              outer SVG's zoom transform when the loader hands over. */}
          <g className="preloader__body">
            <g clipPath="url(#preloader-clip)">
              {/* Liquid gold rises smoothly in lockstep with the typed letters */}
              <g
                className="preloader__lvl"
                style={{ transform: `translateY(${levelY.toFixed(2)}px)` }}
              >
                <g className="preloader__wave">
                  <path fill="url(#preloader-gold)" d={WAVE_PATH} />
                </g>
              </g>
              {/* Sheen sweeps across when typing and bull fill hit 100% */}
              <rect
                className="preloader__sheen"
                x="0"
                y="0"
                width="44"
                height="26"
                fill="url(#preloader-sheen)"
              />
            </g>
          </g>
        </svg>

        <div className="preloader__word" aria-label={BRAND_NAME}>
          {BRAND_NAME.split('').map((ch, i) =>
            ch === ' ' ? (
              <span
                key={i}
                className="preloader__word-space"
                style={{ animationDelay: `${0.18 + i * 0.045}s` }}
              />
            ) : (
              <span key={i} style={{ animationDelay: `${0.18 + i * 0.045}s` }}>
                {ch}
              </span>
            )
          )}
        </div>

        <div className="preloader__type" aria-label={`${TYPE_A} ${TYPE_B}`}>
          <span className="preloader__type-full" aria-hidden="true">
            <span className="preloader__type-a">{TYPE_A}</span>
            <span className="preloader__type-b">{TYPE_B}</span>
          </span>
          <span className="preloader__type-typed" aria-hidden="true">
            <span className="preloader__type-a">{typedA}</span>
            {typedB.length > 0 && (
              <span className="preloader__type-b">{typedB}</span>
            )}
            <i className="preloader__caret" />
          </span>
        </div>
      </div>
    </div>
  )
}

/* Collect the two above-the-fold hero images so progress tracks real loading. */
function getCriticalSources(): string[] {
  if (typeof document === 'undefined') return []
  const sources: string[] = []
  const seen = new Set<string>()
  document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    const src = img.currentSrc || img.src
    if (!src || seen.has(src)) return
    if (
      img.closest('.photo-scene__product--selection') ||
      img.classList.contains('photo-scene__campaign')
    ) {
      seen.add(src)
      sources.push(src)
    }
  })
  return sources
}

function loadCritical(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
      resolve()
      return
    }
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => {
      // Image failed to load; still consider assets ready so preloader completes
      // (the preloader should not get stuck on a single failed asset)
      resolve()
    }
    img.src = src
  })
}
