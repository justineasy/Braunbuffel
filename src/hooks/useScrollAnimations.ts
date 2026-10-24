import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { beatFraction, scrubSeconds, windowPx } from '../motion'

gsap.registerPlugin(ScrollTrigger)
gsap.ticker.lagSmoothing(0)

/* Mobile URL-bar resizes would otherwise force a full refresh mid-scroll. */
ScrollTrigger.config({ ignoreMobileResize: true })

/**
 * useScrollAnimations — Sets up GSAP ScrollTrigger animations for all HTML sections.
 * Coordinates text reveals, fades, and transitions with the scroll-driven 3D camera.
 *
 * @param isLoaded Whether the loading screen has completed
 */
export default function useScrollAnimations(isLoaded: boolean) {
  const hasInitialized = useRef(false)

  const setupAnimations = useCallback(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const duration = prefersReducedMotion ? 0.01 : 0.85
    const stagger = prefersReducedMotion ? 0 : 0.14

    // ── Hero entrance animation (fromTo so elements are visible by default in CSS) ──
    const heroTl = gsap.timeline({ delay: 0.15 })
    heroTl
      .fromTo(
        '#hero-tagline',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration, ease: 'power3.out' }
      )
      .fromTo(
        '#hero-title',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: duration * 1.15, ease: 'power3.out' },
        `-=${duration * 0.65}`
      )
      .fromTo(
        '#hero-subtitle',
        { opacity: 0, y: 24 },
        { opacity: 0.86, y: 0, duration, ease: 'power3.out' },
        `-=${duration * 0.65}`
      )
      .fromTo(
        '#hero-cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration, ease: 'power3.out' },
        `-=${duration * 0.55}`
      )
      .fromTo(
        '#hero-scroll',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: duration * 1.1, ease: 'power3.out' },
        `-=${duration * 0.5}`
      )

    // Safety fallback: ensure hero elements are visible even if browser tab throttles rAF
    const safetyTimer = window.setTimeout(() => {
      heroTl.progress(1)
    }, 1400)

    // ── Hero fade out on scroll ──
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      /* The copy clears across the first half of the window's beat, so the
         photograph is alone on stage before the frame has finished opening. */
      end: () => `+=${Math.round(windowPx() * 0.5)}`,
      scrub: scrubSeconds(),
      onUpdate: (self) => {
        const progress = self.progress
        const heroContent = document.querySelector('.hero__content') as HTMLElement
        if (heroContent) {
          heroContent.style.opacity = String(Math.max(0, 1 - progress * 1.45))
        }
      },
    })

    // ── Campaign image — restrained editorial parallax ──
    const campaignImage = document.querySelector('.campaign-editorial__image')
    if (campaignImage && !prefersReducedMotion) {
      gsap.fromTo(
        campaignImage,
        { yPercent: 7, scale: 1.06 },
        {
          yPercent: -7,
          scale: 1.06,
          ease: 'none',
          scrollTrigger: {
            trigger: '#campaign-editorial',
            start: 'top bottom',
            end: 'bottom top',
            scrub: scrubSeconds(),
          },
        }
      )
    }

    // ── Campaign window — the photograph arrives framed, then opens to full bleed
    const campaignSection = document.querySelector<HTMLElement>('.campaign-editorial')
    if (campaignSection && !prefersReducedMotion) {
      const setWindow = (value: number) =>
        campaignSection.style.setProperty('--campaign-open', value.toFixed(4))

      /* Start framed so the first paint never flashes an open photograph.
         The window finishes opening exactly as the section reaches the top of
         the viewport and starts one beat earlier: a screen on desktop, three
         quarters of one on a phone. Same ending, same beat, quicker on a phone. */
      setWindow(0)
      ScrollTrigger.create({
        trigger: campaignSection,
        start: () => `top ${(beatFraction() * 100).toFixed(0)}%`,
        end: 'top top',
        onUpdate: (self) => setWindow(self.progress),
        onRefresh: (self) => setWindow(self.progress),
      })
    }

    // ── Stage finale — hold the composed frame, then hand it to the shop ──
    const stageFinale = document.querySelector<HTMLElement>('#stage-finale')
    let releaseStageExit: (() => void) | null = null
    if (stageFinale) {
      const setVar = (name: string, value: number) =>
        document.documentElement.style.setProperty(name, value.toFixed(4))

      const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value)

      /* Measured from the live rect on every scroll rather than cached by a
         trigger: the epilogue is a full-viewport scene whose height can settle
         after the first layout, and a stale measurement leaves a seam where the
         stage disappears before the shop section has covered it. The frame stays
         fully bright until the scene's centre reaches the top, then hands over
         across its second half. */
      const updateStageExit = () => {
        const rect = stageFinale.getBoundingClientRect()
        const travel = rect.height / 2
        const progress = travel > 0 ? (-rect.top - travel) / travel : 1
        setVar('--stage-exit', clamp01(progress))

        /* A tall phone can reach the epilogue before the progress-keyed product
           cutout does, so the still bag is also tied to the scene's approach:
           the held frame is never empty. */
        const approach = (window.innerHeight - rect.top) / (window.innerHeight * 0.5)
        setVar('--stage-cutout', clamp01(approach))

        /* The HUD belongs to the story; it clears as the epilogue approaches so
           its caption never sits under the epilogue's own copy. Measured from
           the scene rather than page progress, which lands differently on a
           tall phone. */
        const hud = (rect.top - window.innerHeight * 0.5) / (window.innerHeight * 0.5)
        setVar('--stage-hud', clamp01(hud))
      }

      updateStageExit()
      window.addEventListener('scroll', updateStageExit, { passive: true })
      window.addEventListener('resize', updateStageExit)
      window.addEventListener('pageshow', updateStageExit)
      releaseStageExit = () => {
        window.removeEventListener('scroll', updateStageExit)
        window.removeEventListener('resize', updateStageExit)
        window.removeEventListener('pageshow', updateStageExit)
      }
    }

    // ── Product detail gallery — staggered, scroll-led editorial reveal ──
    const productFigures = document.querySelectorAll('.product-story__figure')
    if (productFigures.length > 0 && !prefersReducedMotion) {
      gsap.fromTo(
        productFigures,
        { y: window.innerWidth < 768 ? 18 : 32, opacity: 0.82 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.product-story__gallery',
            start: 'top 88%',
            end: 'center 56%',
            scrub: scrubSeconds(),
          },
        }
      )
    }

    // ── Craftsmanship / Product Story intro ──
    ScrollTrigger.create({
      trigger: '#craftsmanship',
      start: 'top 82%',
      end: '35% center',
      scrub: scrubSeconds(),
      onUpdate: (self) => {
        const el = document.getElementById('craft-text')
        if (el) {
          const progress = self.progress
          el.style.opacity = String(Math.min(progress * 2.2, 1))
          el.style.transform = `translateY(${(1 - progress) * 32}px)`
        }
      },
    })

    // ── Product Reveal section ──
    ScrollTrigger.create({
      trigger: '#product-reveal',
      start: 'top 80%',
      end: '40% center',
      scrub: scrubSeconds(),
      onUpdate: (self) => {
        const el = document.getElementById('reveal-text')
        if (el) {
          const progress = self.progress
          el.style.opacity = String(Math.min(progress * 2, 1))
          el.style.transform = `translateX(${(1 - progress) * 48}px)`
        }
      },
    })

    ScrollTrigger.create({
      trigger: '#product-reveal',
      start: '65% center',
      end: 'bottom center',
      scrub: scrubSeconds(),
      onUpdate: (self) => {
        const el = document.getElementById('reveal-text')
        if (el) {
          el.style.opacity = String(1 - self.progress)
        }
      },
    })

    // ── Journey section ──
    ScrollTrigger.create({
      trigger: '#journey',
      start: 'top 72%',
      end: '50% center',
      scrub: scrubSeconds(),
      onUpdate: (self) => {
        const el = document.getElementById('journey-text')
        if (el) {
          const progress = self.progress
          el.style.opacity = String(Math.min(progress * 2, 1))
          el.style.transform = `translateY(${(1 - progress) * 44}px) scale(${0.96 + progress * 0.04})`
        }
      },
    })

    ScrollTrigger.create({
      trigger: '#journey',
      start: '55% center',
      end: 'bottom center',
      scrub: scrubSeconds(),
      onUpdate: (self) => {
        const el = document.getElementById('journey-text')
        if (el) {
          el.style.opacity = String(1 - self.progress)
        }
      },
    })

    // ── Collection section — staggered card reveal ──
    const cards = document.querySelectorAll('.product-card')
    if (cards.length > 0) {
      gsap.set(cards, { opacity: 0, y: 36 })
      ScrollTrigger.create({
        trigger: '#collection',
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration,
            stagger,
            ease: 'power2.out',
          })
        },
      })
    }

    // ── Campaign section ──
    const campaignContent = document.querySelector('.campaign__content')
    if (campaignContent) {
      gsap.set(campaignContent, { opacity: 0, y: 28 })
      ScrollTrigger.create({
        trigger: '#campaign',
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(campaignContent, {
            opacity: 1,
            y: 0,
            duration: duration * 1.15,
            ease: 'power2.out',
          })
        },
      })
    }

    // ── Footer ──
    const footerGrid = document.querySelector('.footer__grid')
    if (footerGrid) {
      gsap.set(footerGrid, { opacity: 0, y: 20 })
      ScrollTrigger.create({
        trigger: '#footer',
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(footerGrid, {
            opacity: 1,
            y: 0,
            duration,
            ease: 'power2.out',
          })
        },
      })
    }

    return () => {
      releaseStageExit?.()
      clearTimeout(safetyTimer)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    const timer = setTimeout(setupAnimations, 80)

    return () => {
      clearTimeout(timer)
      ScrollTrigger.getAll().forEach((st) => st.kill())
      hasInitialized.current = false
    }
  }, [isLoaded, setupAnimations])
}
