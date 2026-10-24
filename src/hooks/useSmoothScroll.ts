import { useEffect, useRef, type MutableRefObject } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION, velocityReferencePx, windowPx } from '../motion'

/**
 * useSmoothScroll — Lenis-driven inertial scrolling for the whole page.
 *
 * Lenis owns the scroll itself: a wheel tick or trackpad gesture nudges a
 * target position and every animation frame eases the page toward it, so the
 * document glides to a stop instead of snapping. That is the feel the design
 * leans on — the 3D camera, the pinned scenes and the `--scroll` CSS
 * calculations all read the same eased position.
 *
 * The eased value (0–1) is written to two places so that scrolling never
 * re-renders React:
 *  - the returned ref, read by react-three-fiber components inside useFrame
 *  - the `--scroll` CSS custom property on the document root, read by CSS calc()
 *
 * Safety: Lenis can only move the page while animation frames are being served.
 * A page whose frames are suspended (occluded window, frame-less embed) would
 * otherwise swallow wheel input and appear frozen, so Lenis is only switched on
 * after a probe frame proves the document is actually animating. Everything
 * that reads scroll still works on the native scroll event, so the fallback is
 * the same page with instant scrolling.
 *
 * Notes:
 *  - `--scroll` is only written when the rounded value changes, so an idle
 *    frame costs no style invalidation.
 *  - The document height is cached and refreshed by a ResizeObserver and by
 *    ScrollTrigger's own refresh, so the frame loop never forces a layout read
 *    and a re-spaced pin cannot leave the beat measuring an old page.
 *  - In-page anchors glide instead of jumping.
 *  - Visitors who ask for reduced motion keep native, instant scrolling.
 *
 * @param onFrame Optional callback with the eased progress, called every frame
 *                while the value changes. Use it for low-frequency state (captions).
 */
export default function useSmoothScroll(
  onFrame?: (progress: number) => void,
): MutableRefObject<number> {
  const progress = useRef(0)
  const onFrameRef = useRef(onFrame)

  useEffect(() => {
    onFrameRef.current = onFrame
  })

  useEffect(() => {
    const root = document.documentElement
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let maxScroll = 0
    let frameId = 0
    let lastWritten = -1
    let lastReported = -1
    let lenis: Lenis | null = null
    let disposed = false

    const writeProgress = (value: number) => {
      const rounded = Math.round(value * 1e4) / 1e4
      if (rounded === lastWritten) return
      lastWritten = rounded
      root.style.setProperty('--scroll', rounded.toFixed(4))
    }

    const readProgress = () => {
      const next = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0
      progress.current = next
      writeProgress(next)
      if (Math.abs(next - lastReported) > 1e-4) {
        lastReported = next
        onFrameRef.current?.(next)
      }
    }

    /* Scroll velocity, normalised to −1…1 and lightly damped. The reference is
       the input's own ceiling — a wheel tops out far below a finger fling — so
       a hard swipe does not pin the window breath at full depth.
       Read once: the pointer that scrolled the page in is the one it is tuned
       for, the same assumption every scrub in src/motion.ts makes. */
    const velocityReference = velocityReferencePx()
    let lastY = window.scrollY
    let lastStamp = 0
    let velocity = 0
    let lastVelocityWritten = -1
    let velocityIdle = 0

    const writeVelocity = (value: number) => {
      const rounded = Math.round(value * 100) / 100
      if (rounded === lastVelocityWritten) return
      lastVelocityWritten = rounded
      root.style.setProperty('--scroll-velocity', rounded.toFixed(2))
    }

    const readVelocity = (stamp: number) => {
      if (reduceMotion) return
      const y = window.scrollY
      if (!lastStamp) {
        /* First sample only establishes the baseline for the next one. */
        lastStamp = stamp
        lastY = y
        return
      }
      const delta = (stamp - lastStamp) / 1000
      if (delta < 0.004) return

      const instant = (y - lastY) / delta / velocityReference
      const target = instant > 1 ? 1 : instant < -1 ? -1 : instant
      velocity += (target - velocity) * (1 - Math.exp(-delta * 10))
      lastY = y
      lastStamp = stamp
      writeVelocity(Math.abs(velocity) < 0.01 ? 0 : velocity)

      /* With native scrolling there are no frames after the last event, so the
         breath has to settle on a timer instead of decaying frame by frame. */
      window.clearTimeout(velocityIdle)
      velocityIdle = window.setTimeout(() => {
        velocity = 0
        writeVelocity(0)
      }, 140)
    }

    /* Cached measurement — never read layout inside the frame loop. */
    let lastRate = -1
    const measure = () => {
      maxScroll = Math.max(0, root.scrollHeight - window.innerHeight)

      /* Motion system: every window is measured in beats, not pixels.
         `--window-rate` converts page progress into a rate so a window opens
         over exactly one beat — a screen on desktop, three quarters of one on
         a phone — at any page height or size. */
      const rate = maxScroll > 0 ? maxScroll / windowPx() : 30
      const roundedRate = Math.round(rate * 100) / 100
      if (roundedRate !== lastRate) {
        lastRate = roundedRate
        root.style.setProperty('--window-rate', roundedRate.toFixed(2))
      }
      root.style.setProperty('--motion-breath', MOTION.breath.toFixed(2))

      readProgress()
    }

    const loop = (time: number) => {
      lenis?.raf(time)
      readProgress()
      readVelocity(time)
      frameId = requestAnimationFrame(loop)
    }

    const start = () => {
      if (!frameId) frameId = requestAnimationFrame(loop)
    }

    const stop = () => {
      cancelAnimationFrame(frameId)
      frameId = 0
    }

    const bootLenis = () => {
      if (disposed || reduceMotion || lenis) return
      lenis = new Lenis({
        // Time-based rather than per-frame lerp: the glide takes the same time
        // at 60, 120 and 144 Hz. The weight comes from MOTION, not from here.
        duration: MOTION.glideSeconds,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        smoothWheel: true,
        // Native touch scrolling stays in charge on phones: it is smoother
        // than any JS hand-off and keeps momentum exactly as the OS expects.
        // That is also why there is no touchMultiplier here — touch weight is
        // carried by the shorter scrub and higher velocity reference in
        // src/motion.ts, not by Lenis fighting the OS.
        syncTouch: false,
        autoRaf: false,
      })
      /* ScrollTrigger reads the same native scroll position, so it stays in step. */
      lenis.on('scroll', ScrollTrigger.update)
      start()
    }

    /* In-page anchors glide rather than jump, so #collection doesn't break the spell. */
    const handleAnchorClick = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented) return
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null
      if (!anchor) return
      const hash = anchor.getAttribute('href') ?? ''
      if (hash.length < 2) return
      const target = document.getElementById(hash.slice(1))
      if (!target) return
      event.preventDefault()
      lenis.scrollTo(target, { duration: MOTION.glideSeconds * 1.15 })
    }

    const handleAnchorHistory = () => {
      if (!lenis) return
      const hash = window.location.hash
      const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null
      if (target) lenis.scrollTo(target, { immediate: true })
    }

    const handlePageShow = () => {
      measure()
      readProgress()
      /* Re-baseline the velocity so a restored position never reads as speed. */
      lastY = window.scrollY
      lastStamp = 0
      velocity = 0
      writeVelocity(0)
      if (lenis) start()
    }

    const handleScroll = () => {
      readProgress()
      readVelocity(performance.now())
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handlePageShow()
        /* A tab that opened behind another surface can retry the probe now. */
        probeAttempts = 0
        armProbe()
      } else if (lenis) {
        stop()
      }
    }

    measure()
    readProgress()

    /* Height changes (lazy images, pins, font swap) refresh the cache. */
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => measure())
        : null
    resizeObserver?.observe(document.body)

    /* Pins re-space and lazy media grows the document without a window resize.
       ScrollTrigger's refresh is the moment the page height is final again, so
       the beat is re-measured there rather than drifting out of date. */
    const handleTriggerRefresh = () => measure()
    ScrollTrigger.addEventListener('refresh', handleTriggerRefresh)

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handlePageShow)
    window.addEventListener('orientationchange', handlePageShow)
    window.addEventListener('pageshow', handlePageShow)
    window.addEventListener('hashchange', handleAnchorHistory)
    document.addEventListener('click', handleAnchorClick)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    /* Probe a frame: swap to Lenis only once the document really animates.
       A frame-less surface keeps native scrolling instead of freezing. */
    let probeId = 0
    let probeTimer = 0
    let probeAttempts = 0
    const armProbe = () => {
      if (disposed || reduceMotion || lenis) return
      if (probeAttempts >= 6) return
      probeAttempts += 1
      probeId = requestAnimationFrame(() => {
        window.clearTimeout(probeTimer)
        bootLenis()
      })
      probeTimer = window.setTimeout(() => {
        cancelAnimationFrame(probeId)
        armProbe()
      }, 600)
    }
    armProbe()

    return () => {
      disposed = true
      window.clearTimeout(probeTimer)
      cancelAnimationFrame(probeId)
      resizeObserver?.disconnect()
      lenis?.destroy()
      lenis = null
      stop()
      window.clearTimeout(velocityIdle)
      ScrollTrigger.removeEventListener('refresh', handleTriggerRefresh)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handlePageShow)
      window.removeEventListener('orientationchange', handlePageShow)
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('hashchange', handleAnchorHistory)
      document.removeEventListener('click', handleAnchorClick)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return progress
}
