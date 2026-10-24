import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { pinEnd, scrubSeconds } from '../motion'

gsap.registerPlugin(ScrollTrigger)

/**
 * ScrollScenes — two pinned, scroll-scrubbed interludes in the campaign.
 *
 * They borrow the pacing of the best scroll sites: the page holds still, the
 * copy arrives a word at a time, and only then does the next chapter begin.
 * Both scenes sit inside the dark/paper alternation of the page so they read as
 * breaths between the product chapters rather than as extra content.
 */

function Word({ children, italic = false }: { children: ReactNode; italic?: boolean }) {
  return (
    <span className="scroll-scene__word">
      <span className={`scroll-scene__word-inner${italic ? ' is-italic' : ''}`}>{children}</span>
    </span>
  )
}

function useSceneAnimation(
  rootRef: RefObject<HTMLElement | null>,
  build: (reduced: boolean) => void,
) {
  /* Keep the latest builder without re-running the effect on every render
     (the live clock re-renders once a minute; the pin must not be rebuilt). */
  const buildRef = useRef(build)
  useEffect(() => {
    buildRef.current = build
  })

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const context = gsap.context(() => {
      buildRef.current(reduced)
    }, root)

    /* Pinned heights are only correct once fonts and images have settled. */
    const refresh = () => ScrollTrigger.refresh()
    const timer = window.setTimeout(refresh, 400)
    window.addEventListener('load', refresh)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('load', refresh)
      context.revert()
    }
  }, [rootRef])
}

const sgtTime = () =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())

export function QuietStandard() {
  const rootRef = useRef<HTMLElement>(null)

  const build = (reduced: boolean) => {
    const root = rootRef.current
    if (!root || reduced) return

    const words = gsap.utils.toArray<HTMLElement>('.scroll-scene__word-inner', root)

    /* Words arrive across the whole approach and land exactly as the section
       pins, so there is no stretch of dead travel before the hold. */
    gsap.fromTo(
      words,
      { yPercent: 116 },
      {
        yPercent: 0,
        stagger: 0.08,
        ease: 'none',
        /* Paint on the scroll event itself rather than the next ticker frame. */
        lazy: false,
        scrollTrigger: {
          trigger: root,
          start: 'top bottom',
          end: 'top top',
          scrub: scrubSeconds(),
        },
      },
    )

    gsap.fromTo(
      '.scroll-scene__foot-rule',
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        lazy: false,
        scrollTrigger: {
          trigger: root,
          start: 'top 55%',
          end: 'top top',
          scrub: scrubSeconds(),
        },
      },
    )

    gsap.fromTo(
      '.scroll-scene__ghost',
      { yPercent: 6 },
      {
        yPercent: -14,
        ease: 'none',
        lazy: false,
        scrollTrigger: {
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          scrub: scrubSeconds(),
        },
      },
    )

    /* Then the finished statement holds for one beat before the next chapter. */
    ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: pinEnd(),
      pin: true,
      anticipatePin: 1,
    })
  }

  useSceneAnimation(rootRef, build)

  return (
    <section
      className="section scroll-scene scroll-scene--ink"
      id="quiet-standard"
      ref={rootRef}
      aria-labelledby="quiet-standard-title"
    >
      <span className="scroll-scene__ghost" aria-hidden="true">
        company
      </span>

      <div className="scroll-scene__inner">
        <p className="scroll-scene__eyebrow">The Quiet Standard</p>

        <h2 className="scroll-scene__line" id="quiet-standard-title">
          <span className="sr-only">Make it useful. Then make it quiet.</span>
          <span aria-hidden="true">
            <Word>Make</Word>
            <Word>it</Word>
            <Word>useful.</Word>
            <Word>Then</Word>
            <Word>make</Word>
            <Word>it</Word>
            <Word italic>quiet.</Word>
          </span>
        </h2>

        <div className="scroll-scene__foot">
          <span className="scroll-scene__foot-rule" aria-hidden="true" />
          <span className="scroll-scene__foot-item">REISE-73-000 · Nylon &amp; nappa leather</span>
          <span className="scroll-scene__foot-item scroll-scene__foot-item--end">Keep scrolling</span>
        </div>
      </div>
    </section>
  )
}

export function FoundedScene() {
  const rootRef = useRef<HTMLElement>(null)
  const [time, setTime] = useState(sgtTime)

  useEffect(() => {
    const id = window.setInterval(() => setTime(sgtTime()), 20000)
    return () => window.clearInterval(id)
  }, [])

  const build = (reduced: boolean) => {
    const root = rootRef.current
    if (!root || reduced) return

    gsap.fromTo(
      '.scroll-scene__numeral',
      { scale: 1.12, yPercent: 5 },
      {
        scale: 0.94,
        yPercent: -3,
        ease: 'none',
        lazy: false,
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          /* One beat, matching the statement scene and the window open. */
          end: pinEnd(),
          pin: true,
          anticipatePin: 1,
          scrub: scrubSeconds(),
        },
      },
    )

    const facts = gsap.utils.toArray<HTMLElement>('.scroll-scene__fact', root)
    gsap.fromTo(
      facts,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        ease: 'power2.out',
        lazy: false,
        scrollTrigger: {
          trigger: root,
          start: 'top 70%',
          end: 'top top',
          scrub: scrubSeconds(),
        },
      },
    )
  }

  useSceneAnimation(rootRef, build)

  return (
    <section
      className="section scroll-scene scroll-scene--paper scroll-scene--founded"
      id="founded"
      ref={rootRef}
      aria-labelledby="founded-title"
    >
      <div className="scroll-scene__inner">
        <p className="scroll-scene__eyebrow scroll-scene__eyebrow--center">Kirn, Germany</p>

        <h2 className="scroll-scene__numeral" id="founded-title">
          <span className="sr-only">Braun Büffel, founded 1887</span>
          <span aria-hidden="true">1887</span>
        </h2>

        <div className="scroll-scene__facts">
          <div className="scroll-scene__fact">
            <span>Founded</span>
            <strong>Kirn, Germany, 1887</strong>
          </div>
          <div className="scroll-scene__fact">
            <span>Practice</span>
            <strong>Leather goods, then and now</strong>
          </div>
          <div className="scroll-scene__fact">
            <span>Singapore</span>
            <strong>{time} SGT</strong>
          </div>
        </div>
      </div>
    </section>
  )
}
