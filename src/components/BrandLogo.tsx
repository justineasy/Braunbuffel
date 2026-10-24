import { useRef, useEffect } from 'react'

/**
 * BrandLogo — loading-screen lockup for Braun Büffel.
 *
 * The bull icon is drawn on a small SVG with the same gold-on-dark feel as the
 * brand, and the wordmark sits below it. This is a stylized representation, not the
 * official artwork, so it stays visually close without depending on the live CDN.
 */

const BULL_PATH =
  'M30.2 12.6c-1.8 0-3.2.4-4.9.5s-3.1-.3-4.3-.5c-.7-.3-1.4-.2-2-.2 1.8 2.9 4.1 5.2 6 6.9 2.5 2 4.3 3.3 4.8 4.5.5-2.1 1.5-4.1 2.4-5.8-3.2-.9-6.5-1.6-9.5-1.3zm-10.5 4c-.3.7-.7 1.2-1.5 1.2-.9 0-1.4-1.1-.9-2.7.3-1.8 1.1-3 2.4-3 1 .8 1.9 2.1 2.4 3.4.7-1.3 2-2.1 3.6-2.1.7 0 1.4.4 1.7.6zM8.5 11.9c.2-1.2 1.1-2.2 3.6-2.2 2.5 0 3.6 1 3.7 2.2h4.3c.2-1 .2-1.9 0-2.9-3.6-3.6-7.3-4.5-10.3-4.5-5.4 0-10.4 1.3-10.4 5.3 0 .7.1 1.4.4 1.9zM28.8 12.2c.3-4.1-1.8-7.3-5.2-7.3-2.8 0-4.9 2.1-4.9 4.6-.1 1.9.2 3.1 1.9 3.4 1.3.2 2.5.4 3-1.3zM4.6 5.2c0-3.4 1.9-6.2 4.2-6.2 2.4 0 4.2 2.8 4.2 6.2-.6 1.4-1.5 2.2-2.4 2.1-2.3 0-3.7-1.3-3.8-4.6h4.7z'

interface BrandLogoProps {
  size?: number
}

export default function BrandLogo({ size = 64 }: BrandLogoProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    if (animated.current || !svgRef.current) return
    animated.current = true

    const path = svgRef.current.querySelector('path') as SVGPathElement | null
    const dot = svgRef.current.querySelector('.bull-dot') as SVGPathElement | null
    if (!path || !dot) return

    const drawMark = () => {
      if (!svgRef.current || !path || !dot) return
      const t = Math.max(0, Math.min(1, Number((svgRef.current as any).__draw ?? 0)))
      if (t < 1) {
        (svgRef.current as any).__draw = t + 0.04
        path.setAttribute('stroke-dashoffset', String(4800 * (1 - t)))
        dot.setAttribute('opacity', String(t))
        requestAnimationFrame(drawMark)
      }
    }

    path.style.strokeDasharray = '4800'
    path.style.strokeDashoffset = '4800'
    dot.style.opacity = '0'
    requestAnimationFrame(drawMark)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.85rem',
      }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 40 40"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {/* Gold gradient for the bull silhouette */}
        <defs>
          <linearGradient id="bbBullGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c9aa5d" />
            <stop offset="1" stopColor="#b89748" />
          </linearGradient>
        </defs>

        {/* Bull body */}
        <path
          className="brand-bull"
          d={BULL_PATH}
          fill="none"
          stroke="url(#bbBullGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Small dot inside the upper loop of the Ü (approximated here inside the bull) */}
        <path
          className="bull-dot"
          d="M20 15c0 0.9 0.7 1.6 1.6 1.6s1.6-.7 1.6-1.6S22.5 13 21.6 13 20 13.9 20 15z"
          fill="#3b3b3b"
          opacity="1"
        />
      </svg>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: '400',
            fontSize: 'clamp(1.1rem, 1.6vw, 1.6rem)',
            letterSpacing: '0.06em',
            color: '#222',
            lineHeight: '1.05',
            textAlign: 'center',
          }}
        >
          BRAUN BÜFFEL
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: '400',
            fontSize: '0.55rem',
            letterSpacing: '0.32em',
            color: '#c9aa5d',
            textTransform: 'uppercase',
            marginTop: '0.06rem',
          }}
        >
          Since 1887 · Germany
        </div>
      </div>
    </div>
  )
}
