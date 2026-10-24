import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Eye,
  Check,
  ArrowUpRight,
  Compass,
  SlidersHorizontal,
  Plus,
  Minus,
  Trash2,
  Share2,
} from 'lucide-react'
import Scene3D from './components/Scene3D'
import ImageWithFallback from './components/ImageWithFallback'
import { storyProgress } from './components/storyTimeline'
import useScrollAnimations from './hooks/useScrollAnimations'
import useSmoothScroll from './hooks/useSmoothScroll'
import {
  AnnouncementBar,
  Bestsellers,
  Craftsmanship,
  BackpacksFeature,
  GenderEdits,
  SmallWonders,
  TechMeetsCraft,
  FinaleFilm,
  GenderCollections,
  NewArrivals,
} from './components/HomepageSections'
import {
  BESTSELLERS,
  NEW_ARRIVALS,
  REISE_COLLECTION_SHOWCASE,
  type ShopProduct,
} from './data/siteContent'
import Preloader from './components/Preloader'
import { QuietStandard, FoundedScene } from './components/ScrollScenes'
import './App.css'
import './components/CartDrawer.css'
import './components/ScrollScenes.css'

/* ======================================================
   BRAUN BÜFFEL SINGAPORE — Official Collection Showcase
   ====================================================== */

const ALL_SHOP_PRODUCTS = [
  ...REISE_COLLECTION_SHOWCASE,
  ...NEW_ARRIVALS,
  ...BESTSELLERS,
]

const CATALOG_BY_ID = new Map(ALL_SHOP_PRODUCTS.map((product) => [product.id, product]))

/* ------------------------------------------------------------------
   Shareable product deep links — the open quick view is mirrored in the
   URL as `?product=<id>` so every piece can be linked, bookmarked and
   closed with the browser back button.
   ------------------------------------------------------------------ */

const PRODUCT_QUERY_KEY = 'product'
const PAGE_TITLE = 'BRAUN BÜFFEL Singapore — Crafted for the Journey'

function readProductParam(): string | null {
  try {
    return new URLSearchParams(window.location.search).get(PRODUCT_QUERY_KEY)
  } catch {
    // Failed to parse URL search params — no product deep link specified
    return null
  }
}

function writeProductParam(id: string | null, mode: 'push' | 'replace') {
  try {
    const current = window.location.pathname + window.location.search + window.location.hash
    const url = new URL(window.location.href)
    if (id) url.searchParams.set(PRODUCT_QUERY_KEY, id)
    else url.searchParams.delete(PRODUCT_QUERY_KEY)
    const next = url.pathname + url.search + url.hash
    if (next === current) return
    if (mode === 'push') window.history.pushState({ [PRODUCT_QUERY_KEY]: id }, '', next)
    else window.history.replaceState({ [PRODUCT_QUERY_KEY]: id }, '', next)
  } catch {
    // URL synchronisation is best-effort; the modal still works without it.
  }
}

type CartLine = { product: ShopProduct; quantity: number }

function readSavedCart(): CartLine[] {
  try {
    const stored = window.localStorage.getItem('bb-showcase-demo-cart')
    const parsed: unknown = stored ? JSON.parse(stored) : []
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((line: unknown) => {
      if (!line || typeof line !== 'object') return []
      const { id, quantity } = line as { id?: unknown; quantity?: unknown }
      const product = typeof id === 'string' ? CATALOG_BY_ID.get(id) : undefined
      if (!product || typeof quantity !== 'number' || !Number.isFinite(quantity)) return []
      return [{ product, quantity: Math.max(1, Math.min(99, Math.floor(quantity))) }]
    })
  } catch {
    // LocalStorage data was corrupted or unavailable; start with an empty cart.
    return []
  }
}

const NAV_LINKS = [
  { label: 'Reise Collection', href: '#collection' },
  { label: 'New Arrivals', href: '#new-arrivals' },
  { label: 'Craftsmanship', href: '#craftsmanship' },
  { label: 'Small Wonders', href: '#small-wonders' },
  { label: 'Bestsellers', href: '#bestsellers' },
]

const REISE_VIEWS = [
  { id: 'front', code: '01', label: 'Front Profile', image: '/images/reise-gallery-front.webp' },
  { id: 'angle', code: '02', label: 'Three-Quarter', image: '/images/reise-gallery-angle.webp' },
  { id: 'detail', code: '03', label: 'Nickel Clasp', image: '/images/reise-gallery-detail.webp' },
  { id: 'rear', code: '04', label: 'Trolley Sleeve', image: '/images/reise-gallery-rear.webp' },
  { id: 'inside', code: '05', label: '16" Interior', image: '/images/reise-gallery-inside.webp' },
] as const

// Transparent cutouts that float as 3D cards in the scroll story.
const REISE_STORY_FRAMES = [
  { label: 'Front Profile', image: '/images/reise-gallery-front.webp' },
  { label: 'Satin Nickel Clasp', image: '/images/reise-gallery-detail.webp' },
  { label: 'Trolley Sleeve', image: '/images/reise-gallery-rear.webp' },
  { label: '16" Interior Vault', image: '/images/reise-gallery-inside.webp' },
] as const

/* Optional campaign film. Drop an authorised clip at public/videos/hero-campaign.mp4
   and point this at it. The still campaign photograph stays underneath as the
   fallback, so an empty string simply keeps the current photographic hero. */
const HERO_FILM_SRC = ''

const STORY_CAPTIONS = [
  {
    at: 0.0,
    index: '01 / 04',
    chapter: 'The Silhouette',
    title: 'A shape that stays out of the way.',
    detail: 'REISE Large Backpack · Nylon & Nappa Leather',
  },
  {
    at: 0.115,
    index: '02 / 04',
    chapter: 'The Details',
    title: 'Matte nylon. Warm leather. Satin nickel.',
    detail: 'Satin nickel hardware · Back zip opening',
  },
  {
    at: 0.325,
    index: '03 / 04',
    chapter: 'The Construction',
    title: 'Opens flat. Packs deep.',
    detail: 'Padded laptop compartment · Trolley slot',
  },
  {
    at: 0.405,
    index: '04 / 04',
    chapter: 'Ready to Travel',
    title: 'Packed, zipped, out the door.',
    detail: 'REISE-73-000 · $689.00 SGD',
  },
] as const

const REISE_GALLERY = [
  {
    label: '01 / Front Silhouette',
    caption: '33 × 46 × 15cm profile in nylon and nappa leather.',
    image: '/images/reise-gallery-front.webp',
  },
  {
    label: '02 / Dynamic Profile',
    caption: 'Side pockets and a leather base, shown from a three-quarter view.',
    image: '/images/reise-gallery-angle.webp',
  },
  {
    label: '03 / Travel Ergonomics',
    caption: 'Rear view of the shoulder straps and cabin trolley slot.',
    image: '/images/reise-gallery-rear.webp',
  },
  {
    label: '04 / Interior Architecture',
    caption: 'Interior view of the padded laptop compartment and organizer pockets.',
    image: '/images/reise-gallery-inside.webp',
  },
] as const

const BAG_FEATURES = [
  {
    number: '01',
    spec: 'MATERIALITY',
    title: 'Nylon & Nappa Leather',
    detail:
      'A durable nylon and supple nappa leather mix, listed in the REISE Large Backpack product details.',
  },
  {
    number: '02',
    spec: 'HARDWARE',
    title: 'Satin Nickel Hardware',
    detail:
      'The REISE Large Backpack features satin nickel hardware and a dual buckle opening.',
  },
  {
    number: '03',
    spec: 'CAPACITY',
    title: 'Padded 16" Laptop Compartment',
    detail:
      'A padded laptop compartment, back zip opening and cabin trolley slot support travel and everyday carry.',
  },
] as const

const ANATOMY_HOTSPOTS = [
  {
    id: 'flap',
    x: '50%',
    y: '24%',
    title: 'Nappa Leather Top Flap',
    spec: 'Nylon & Nappa Leather Mix',
    detail: 'The REISE backpack combines nylon with nappa leather panelling.',
    viewIndex: 0,
  },
  {
    id: 'buckle',
    x: '38%',
    y: '46%',
    title: 'Dual Buckle Opening',
    spec: 'Satin Nickel Hardware',
    detail: 'The REISE Large Backpack lists a dual buckle opening and satin nickel hardware.',
    viewIndex: 2,
  },
  {
    id: 'pocket',
    x: '64%',
    y: '62%',
    title: 'Side & Front Pockets',
    spec: 'Nylon & Nappa Leather Mix',
    detail: 'Two side pockets and one front pocket provide quick access to daily essentials.',
    viewIndex: 1,
  },
  {
    id: 'trolley',
    x: '52%',
    y: '78%',
    title: 'Trolley Slot & Padded Laptop Compartment',
    spec: '33cm × 46cm × 15cm',
    detail: 'The product details list a cabin trolley slot and a padded laptop compartment for up to 16 inches.',
    viewIndex: 3,
  },
] as const

export default function App() {
  const [isNavScrolled, setIsNavScrolled] = useState(() => window.scrollY > 50)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeBagView, setActiveBagView] = useState(0)
  const [activeHotspot, setActiveHotspot] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(() => {
    const id = readProductParam()
    return id ? CATALOG_BY_ID.get(id) ?? null : null
  })
  const [cart, setCart] = useState<CartLine[]>(readSavedCart)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [modalGalleryIdx, setModalGalleryIdx] = useState(0)
  const [story, setStory] = useState({ caption: 0, frame: 0 })
  const [filmReady, setFilmReady] = useState(false)
  const filmRef = useRef<HTMLVideoElement | null>(null)

  /* Respect reduced motion: the film should hold on its poster, not loop. */
  useEffect(() => {
    const video = filmRef.current
    if (!video || !filmReady) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.pause()
  }, [filmReady])
  const [shareCopied, setShareCopied] = useState(false)
  const shareTimerRef = useRef<number | null>(null)

  const handleScrollFrame = useCallback((progress: number) => {
    const caption = STORY_CAPTIONS.reduce(
      (index, item, i) => (progress >= item.at ? i : index),
      0
    )
    const frame = Math.round(
      storyProgress(progress) * (REISE_STORY_FRAMES.length - 1)
    )
    setStory((previous) =>
      previous.caption === caption && previous.frame === frame
        ? previous
        : { caption, frame }
    )
  }, [])

  const scrollProgress = useSmoothScroll(handleScrollFrame)

  useEffect(() => {
    const handleScroll = () => setIsNavScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const locked = isMobileMenuOpen || selectedProduct !== null || isCartOpen
    document.body.style.overflow = locked ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen, selectedProduct, isCartOpen])

  const closeQuickView = useCallback(() => {
    setSelectedProduct(null)
    writeProductParam(null, 'replace')
  }, [])

  const openQuickView = useCallback((product: ShopProduct) => {
    setModalGalleryIdx(0)
    setShareCopied(false)
    setSelectedProduct(product)
    writeProductParam(product.id, 'push')
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (selectedProduct) closeQuickView()
      else if (isCartOpen) setIsCartOpen(false)
      else if (isMobileMenuOpen) setIsMobileMenuOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedProduct, isCartOpen, isMobileMenuOpen, closeQuickView])

  /* Keep the quick view in sync with ?product= when navigating history. */
  useEffect(() => {
    const syncFromUrl = () => {
      const id = readProductParam()
      const product = id ? CATALOG_BY_ID.get(id) : undefined
      setSelectedProduct(product ?? null)
      if (product) setModalGalleryIdx(0)
    }
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  /* Drop a stale ?product= id that is no longer in the catalog. */
  useEffect(() => {
    const id = readProductParam()
    if (id && !CATALOG_BY_ID.has(id)) writeProductParam(null, 'replace')
  }, [])

  /* Mirror the open quick view into the document title. */
  useEffect(() => {
    document.title = selectedProduct ? `${selectedProduct.name} · Braun Büffel` : PAGE_TITLE
  }, [selectedProduct])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'bb-showcase-demo-cart',
        JSON.stringify(cart.map(({ product, quantity }) => ({ id: product.id, quantity })))
      )
    } catch {
      // Storage may be unavailable (e.g. private browsing); the cart works per-session.
    }
  }, [cart])

  const addToCart = (product: ShopProduct) => {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id)
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: Math.min(99, line.quantity + 1) }
            : line
        )
      }
      return [...current, { product, quantity: 1 }]
    })
    closeQuickView()
    setIsCartOpen(true)
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart((current) =>
      current.flatMap((line) =>
        line.product.id !== productId
          ? [line]
          : quantity > 0
            ? [{ ...line, quantity: Math.min(99, quantity) }]
            : []
      )
    )
  }

  const cartCount = cart.reduce((count, line) => count + line.quantity, 0)
  const cartTotal = cart.reduce((total, line) => {
    const price = Number(line.product.price.replace(/[^\d.]/g, ''))
    return total + (Number.isFinite(price) ? price * line.quantity : 0)
  }, 0)
  const formatSgd = (amount: number) =>
    new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(amount)

  /* Share the currently open piece using the native sheet, or copy its deep link. */
  const shareSelectedProduct = useCallback(async () => {
    if (!selectedProduct) return
    const url = window.location.href
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: `${selectedProduct.name} · Braun Büffel Singapore`,
          text: `${selectedProduct.name} — ${selectedProduct.price}`,
          url,
        })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current)
      shareTimerRef.current = window.setTimeout(() => setShareCopied(false), 2200)
    } catch {
      // The share sheet was dismissed or sharing is unavailable — nothing to do.
    }
  }, [selectedProduct])

  useEffect(
    () => () => {
      if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current)
    },
    []
  )

  useScrollAnimations(true)

  const activeCaption = STORY_CAPTIONS[story.caption]

  return (
    <div className="app">
      {/* Loading Screen */}
      <Preloader />

      <AnnouncementBar />

      {/* Fixed 3D Showcase Stage & Campaign Backdrop */}
      {/* The stage's opacity is owned by the closing scene's exit (--stage-exit),
          so the composed frame is held rather than fading with page progress. */}
      <div className="photo-scene" aria-hidden="true">
        <ImageWithFallback
          className="photo-scene__campaign"
          src="/images/in-quiet-company-2026.webp"
          alt="Braun Büffel In Quiet Company 2026 campaign"
          fetchPriority="high"
          style={{
            opacity:
              'calc(0.76 * (1 - clamp(0, (var(--scroll) - 0.03) / 0.04, 1)) + clamp(0, (var(--scroll) - 0.47) / 0.05, 1) * 0.76)',
          }}
        />
        <ImageWithFallback
          className="photo-scene__product photo-scene__product--selection"
          src={REISE_VIEWS[activeBagView].image}
          alt={`Black REISE Large Backpack — ${REISE_VIEWS[activeBagView].label}`}
          fetchPriority="high"
          style={{
            opacity:
              'clamp(0, (1 - clamp(0, (var(--scroll) - 0.015) / 0.035, 1)) + clamp(0, (var(--scroll) - 0.4) / 0.045, 1) + var(--stage-cutout, 0), 1)',
          }}
        />
        {HERO_FILM_SRC && (
          <div
            className="photo-scene__film"
            style={{
              opacity:
                'calc(0.88 * (1 - clamp(0, (var(--scroll) - 0.03) / 0.04, 1)) + clamp(0, (var(--scroll) - 0.47) / 0.05, 1) * 0.88)',
            }}
          >
            <video
              ref={filmRef}
              className={filmReady ? 'is-ready' : ''}
              src={HERO_FILM_SRC}
              poster="/images/in-quiet-company-2026.webp"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              onCanPlay={() => setFilmReady(true)}
            />
          </div>
        )}
        <div className="photo-scene__shade" />
        <Scene3D progress={scrollProgress} frames={REISE_STORY_FRAMES} />

        {/* Architectural 3D Scroll HUD — Appears cleanly only during 3D scroll chapters */}
        <div
          className="photo-scene__hud"
          style={{
            opacity:
              'calc(clamp(0, (var(--scroll) - 0.02) / 0.035, 1) * clamp(0, (0.485 - var(--scroll)) / 0.035, 1) * var(--stage-hud, 1))',
          }}
        >
          <div className="photo-scene__hud-progress" aria-hidden="true">
            <span
              className="photo-scene__hud-progress-fill"
              style={{ transform: 'scaleX(calc((var(--scroll) - 0.02) / 0.44))' }}
            />
          </div>
          <div className="photo-scene__hud-body" key={activeCaption.chapter}>
            <div className="photo-scene__hud-top">
              <span className="photo-scene__hud-index">{activeCaption.index}</span>
              <span className="photo-scene__hud-divider" />
              <span className="photo-scene__hud-chapter">{activeCaption.chapter}</span>
            </div>
            <h2 className="photo-scene__hud-title">{activeCaption.title}</h2>
            <p className="photo-scene__hud-detail">{activeCaption.detail}</p>
          </div>
        </div>

        {/* Vertical 3D Perspective Rail */}
        <div
          className="photo-scene__rail"
          aria-hidden="true"
          style={{ opacity: 'calc(clamp(0, (var(--scroll) - 0.02) / 0.035, 1) * clamp(0, (0.485 - var(--scroll)) / 0.035, 1) * var(--stage-hud, 1))' }}
        >
          <span className="photo-scene__rail-num">0{story.frame + 1}</span>
          <div className="photo-scene__rail-track">
            {REISE_STORY_FRAMES.map((frame, index) => (
              <span
                key={frame.image}
                className={index === story.frame ? 'is-active' : ''}
              />
            ))}
          </div>
          <span className="photo-scene__rail-num">04</span>
        </div>
      </div>

      {/* Hairline window around the campaign photograph; it retracts as the page opens. */}
      <div className="hero-frame" aria-hidden="true">
        {['tl', 'tr', 'bl', 'br'].map((corner) => (
          <span key={corner} className={`hero-frame__tick hero-frame__tick--${corner}`} />
        ))}
        <span className="hero-frame__plate">REISE-73-000</span>
      </div>

      {/* Scroll Progress Bar */}
      <div className="scroll-progress" aria-hidden="true">
        <div
          className="scroll-progress__fill"
          style={{ transform: 'scaleX(var(--scroll))' }}
        />
      </div>

      {/* Navigation */}
      <nav
        className={`nav ${isNavScrolled ? 'nav--scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <a href="#hero" className="nav__brand" aria-label="Braun Büffel Home">
          <svg
            className="nav__brand-mark"
            viewBox="0 0 44 26"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M40.5 4.2 L40.2 3.9 L39.8 3.6 L39.1 3.7 L38.0 4.6 L37.6 6.5 L36.9 7.0 L35.8 7.1 L34.2 6.7 L32.2 5.2 L31.5 4.8 L30.6 4.0 L29.2 3.4 L28.7 3.4 L27.6 3.9 L23.5 5.1 L22.2 5.8 L21.1 5.9 L19.9 6.7 L18.0 7.1 L16.7 7.9 L15.5 7.9 L14.5 8.7 L13.6 8.9 L12.4 9.0 L10.9 9.7 L9.4 10.1 L8.2 10.7 L7.4 10.9 L6.4 10.7 L5.9 10.2 L5.7 9.5 L5.7 8.7 L6.6 7.6 L7.7 7.3 L11.8 7.4 L13.4 7.4 L14.2 7.1 L15.5 7.2 L16.4 6.8 L16.8 6.3 L17.1 5.4 L17.8 4.4 L17.5 4.1 L17.1 3.9 L16.1 3.8 L15.2 4.4 L14.6 5.6 L14.0 5.8 L6.4 5.8 L5.8 5.9 L4.5 6.9 L3.9 7.5 L3.6 8.8 L3.7 10.2 L4.1 10.9 L5.0 11.9 L6.1 12.8 L6.4 13.4 L6.3 20.6 L6.8 21.2 L7.4 21.4 L10.5 21.4 L11.2 21.1 L11.9 20.6 L12.4 18.6 L12.9 18.2 L13.9 18.2 L14.9 18.9 L16.2 19.1 L17.1 19.6 L17.6 19.7 L17.9 19.3 L18.1 18.5 L18.6 18.1 L22.2 18.1 L22.8 18.3 L23.1 18.6 L23.0 20.5 L23.4 21.1 L25.8 21.8 L27.3 21.6 L28.6 21.3 L29.1 20.9 L29.3 19.6 L29.9 18.8 L30.3 17.2 L31.0 16.4 L31.3 15.1 L31.5 14.9 L32.3 15.1 L32.8 15.0 L33.8 14.1 L34.1 13.3 L34.2 12.5 L34.9 11.6 L35.1 10.3 L35.6 9.5 L36.5 9.1 L37.9 9.0 L39.0 8.0 L39.9 6.4Z M32.6 8.2 L33.0 8.5 L33.1 9.3 L32.8 9.8 L32.3 9.8 L32.0 9.6 L31.9 9.1 L32.2 8.4Z"
            />
          </svg>
          <span>Braun Büffel</span>
        </a>

        <div className="nav__links">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="nav__link">
              {link.label}
            </a>
          ))}        </div>

        <div className="nav__icons">
          <a
            className="nav__icon-btn"
            aria-label="Browse official Braun Büffel Singapore products"
            title="Browse products"
            href="https://braunbuffel.com.sg/collections/new-arrival"
            target="_blank"
            rel="noreferrer"
          >
            <Search size={18} strokeWidth={1.5} />
          </a>
          <button
            type="button"
            className="nav__icon-btn nav__cart-btn"
            aria-label={`Open demo shopping bag${cartCount ? `, ${cartCount} items` : ''}`}
            title="Open demo shopping bag"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && <span className="nav__cart-count" aria-hidden="true">{cartCount}</span>}
          </button>
          <button
            className="nav__menu-btn"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-navigation-menu"

          >
            {isMobileMenuOpen ? (
              <X size={22} strokeWidth={1.5} />
            ) : (
              <Menu size={22} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        id="mobile-navigation-menu"
        className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu--open' : ''}`}
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
        aria-hidden={!isMobileMenuOpen}
        inert={!isMobileMenuOpen}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="mobile-menu__link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* HTML Overlay Sections */}
      <div className="html-overlay">
        {/* SECTION 01 — Flagship Store Hero */}
        <section className="section section--dark hero" id="hero">
          <div className="hero__content">
            <div className="hero__main">
              <div className="hero__eyebrow-row" id="hero-tagline">
                <span className="hero__season-tag">In Quiet Company 2026</span>
                <span className="hero__eyebrow-sep" />
                <span className="hero__heritage-tag">Est. 1887 · Singapore</span>
              </div>

              <h1 className="hero__title" id="hero-title">
                In Quiet
                <br />
                <em>Company.</em>
              </h1>

              <p className="hero__subtitle" id="hero-subtitle">
                Black nylon, nappa leather, satin nickel hardware. A padded sleeve for a
                16-inch laptop, a trolley slot for airport days, and side pockets for the
                things you reach for first. Pack it the night before; it is ready when you are.
              </p>

              <div className="hero__spec-strip">
                <div className="hero__spec-item">
                  <span>Model</span>
                  <strong>REISE-73-000</strong>
                </div>
                <div className="hero__spec-divider" />
                <div className="hero__spec-item">
                  <span>Finish</span>
                  <strong>Black · Deep Blues</strong>
                </div>
                <div className="hero__spec-divider" />
                <div className="hero__spec-item">
                  <span>Price</span>
                  <strong>$689.00 SGD</strong>
                </div>
              </div>

              <div className="hero__cta" id="hero-cta">
                <a href="#collection" className="btn btn--primary">
                  Shop the Collection
                </a>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => openQuickView(REISE_COLLECTION_SHOWCASE[0])}
                >
                  Product Details
                </button>
              </div>

              <div
                className="hero__bag-switcher"
                aria-label="Choose REISE bag view"
              >
                <span className="hero__switcher-prefix">VIEW</span>
                {REISE_VIEWS.map((view, index) => (
                  <button
                    key={view.id}
                    type="button"
                    className={`hero__bag-view ${
                      activeBagView === index ? 'hero__bag-view--active' : ''
                    }`}
                    aria-label={`Show ${view.label} bag view`}
                    aria-pressed={activeBagView === index}
                    onClick={() => setActiveBagView(index)}
                  />
                ))}
                <span className="hero__bag-view-label">
                  {REISE_VIEWS[activeBagView].code} — {REISE_VIEWS[activeBagView].label}
                </span>
              </div>
            </div>

            <a
              href="#campaign-editorial"
              className="hero__scroll-indicator"
              id="hero-scroll"
              aria-label="Scroll down to explore the collection"
            >
              <span className="hero__scroll-line" />
              <span className="hero__scroll-text">Scroll to Explore</span>
            </a>
          </div>
        </section>

        {/* SECTION 02 — Campaign Editorial */}
        <section className="section campaign-editorial" id="campaign-editorial">
          <div className="campaign-editorial__media">
            <div className="campaign-editorial__image" />
          </div>
          <div className="campaign-editorial__frame" aria-hidden="true">
            {['tl', 'tr', 'bl', 'br'].map((corner) => (
              <span
                key={corner}
                className={`campaign-editorial__tick campaign-editorial__tick--${corner}`}
              />
            ))}
          </div>
          <div className="campaign-editorial__caption">
            <p className="campaign-editorial__label">
              In Quiet Company · The 2026 Campaign
            </p>
            <p className="campaign-editorial__title">
              Packed the night before.
              <br />
              <em>Ready by morning.</em>
            </p>
            <div className="campaign-editorial__specs">
              <span>REISE-73-000</span>
              <span>·</span>
              <span>33 × 46 × 15 cm</span>
              <span>·</span>
              <span>16&quot; Laptop Compartment</span>
            </div>
          </div>
        </section>

        {/* INTERLUDE — pinned statement, one word at a time */}
        <QuietStandard />

        {/* SECTION 03 — Product Story & Interactive Anatomy */}
        <section className="section product-story" id="craftsmanship">
          <div className="product-story__intro" id="craft-text">
            <p className="product-story__eyebrow">
              The REISE Large Backpack · $689.00 SGD
            </p>
            <h2 className="product-story__title">
              German Craft.
              <br />
              <em>Modern Utility.</em>
            </h2>
            <p className="product-story__description">
              Nylon where it takes the knocks, nappa leather where your hand rests. Inside,
              a padded sleeve holds a 16-inch laptop, a trolley slot gets it through the
              airport, and the back panel opens flat so nothing has to be dug out.
            </p>
            <div className="product-story__actions">
              <a className="product-story__link" href="#collection">
                Explore the REISE Series <span aria-hidden="true">↗</span>
              </a>
              <button
                type="button"
                className="product-story__inspect-btn"
                onClick={() => openQuickView(REISE_COLLECTION_SHOWCASE[0])}
              >
                <SlidersHorizontal size={14} />
                <span>Technical Specifications</span>
              </button>
            </div>
          </div>

          <div
            className="product-story__gallery"
            aria-label="REISE Large Backpack product views"
          >
            {REISE_GALLERY.map((view, index) => (
              <figure
                className={`product-story__figure product-story__figure--${
                  index + 1
                }`}
                key={view.label}
                onClick={() => openQuickView(REISE_COLLECTION_SHOWCASE[0])}
              >
                <ImageWithFallback
                  src={view.image}
                  alt={`${view.label} of the black Braun Büffel REISE Large Backpack`}
                  loading="lazy"
                />
                <figcaption>
                  <strong>{view.label}</strong>
                  <span>{view.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Interactive Craftsmanship Anatomy Explorer */}
          <div className="anatomy-explorer">
            <div className="anatomy-explorer__header">
              <div>
                <p className="product-story__eyebrow">
                  <Compass
                    size={13}
                    style={{
                      display: 'inline',
                      verticalAlign: '-2px',
                      marginRight: '6px',
                    }}
                  />
                  Interactive Specification · REISE-73-000
                </p>
                <h3 className="anatomy-explorer__title">
                  Precision Down to the <em>Millimetre.</em>
                </h3>
              </div>
              <p className="anatomy-explorer__subtitle">
                Select any architectural callout on the silhouette to inspect the materials, hardware, and interior engineering.
              </p>
            </div>

            <div className="anatomy-explorer__stage">
              <div className="anatomy-explorer__visual">
                <ImageWithFallback
                  key={REISE_VIEWS[ANATOMY_HOTSPOTS[activeHotspot].viewIndex].image}
                  className="anatomy-explorer__img"
                  src={REISE_VIEWS[ANATOMY_HOTSPOTS[activeHotspot].viewIndex].image}
                  alt={ANATOMY_HOTSPOTS[activeHotspot].title}
                />
                {ANATOMY_HOTSPOTS.map((spot, idx) => (
                  <button
                    key={spot.id}
                    type="button"
                    className={`anatomy-hotspot ${
                      activeHotspot === idx ? 'anatomy-hotspot--active' : ''
                    }`}
                    style={{ left: spot.x, top: spot.y }}
                    onClick={() => setActiveHotspot(idx)}
                    aria-label={`Inspect ${spot.title}`}
                  >
                    <span className="anatomy-hotspot__pulse" />
                    <span className="anatomy-hotspot__num">0{idx + 1}</span>
                  </button>
                ))}
              </div>

              <div className="anatomy-explorer__details">
                {ANATOMY_HOTSPOTS.map((spot, idx) => (
                  <button
                    key={spot.id}
                    type="button"
                    className={`anatomy-card ${
                      activeHotspot === idx ? 'anatomy-card--active' : ''
                    }`}
                    onClick={() => setActiveHotspot(idx)}
                  >
                    <div className="anatomy-card__top">
                      <span className="anatomy-card__num">0{idx + 1}</span>
                      <span className="anatomy-card__spec">{spot.spec}</span>
                    </div>
                    <h4>{spot.title}</h4>
                    <p>{spot.detail}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="product-story__features">
            {BAG_FEATURES.map((feature) => (
              <article className="product-story__feature" key={feature.number}>
                <div className="product-story__feature-head">
                  <span className="product-story__feature-number">
                    {feature.number}
                  </span>
                  <span className="product-story__feature-spec">
                    {feature.spec}
                  </span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.detail}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 04 — 3D Exploded Product Reveal */}
        <section
          className="section section--dark product-reveal"
          id="product-reveal"
        >
          <div className="product-reveal__content">
            <div className="product-reveal__text" id="reveal-text">
              <div className="showroom-card__header">
                <span className="showroom-card__index">CHAPTER 04</span>
                <span className="showroom-card__tag">3D DECONSTRUCTION</span>
              </div>
              <h2 className="product-reveal__title">
                Everyday utility.
                <br />
                <em>Quiet confidence.</em>
              </h2>
              <p className="product-reveal__description">
                A padded 16-inch laptop compartment, gusseted nappa pockets, and a discreet cabin trolley sleeve keep every journey in effortless order.
              </p>
              <div className="product-reveal__metrics">
                <div>
                  <strong>16&quot;</strong>
                  <span>Padded Laptop Compartment</span>
                </div>
                <div>
                  <strong>33×46×15</strong>
                  <span>Dimensions (cm)</span>
                </div>
                <div>
                  <strong>Cabin</strong>
                  <span>Trolley Slot</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 05 — Journey Reassembly */}
        <section className="section section--dark journey" id="journey">
          <div className="journey__content">
            <div className="journey__text" id="journey-text">
              <div className="showroom-card__header">
                <span className="showroom-card__index">CHAPTER 05</span>
                <span className="showroom-card__tag">UNIFIED SILHOUETTE</span>
              </div>
              <h2 className="journey__title">
                Designed for
                <br />
                <em>Discerning Carry.</em>
              </h2>
              <p className="journey__description">
                From morning boardrooms to evening departures. German leather craft that accompanies your world with understated poise.
              </p>
              <div className="journey__cta">
                <a href="#collection" className="btn btn--primary">
                  Shop REISE Series
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* EPILOGUE — the stage holds its composed frame before the shop begins */}
        <section
          className="section stage-finale"
          id="stage-finale"
          aria-labelledby="stage-finale-title"
        >
          <div className="stage-finale__frame" aria-hidden="true">
            {['tl', 'tr', 'bl', 'br'].map((corner) => (
              <span
                key={corner}
                className={`stage-finale__tick stage-finale__tick--${corner}`}
              />
            ))}
          </div>

          <div className="stage-finale__content">
            <p className="stage-finale__eyebrow">Epilogue · REISE-73-000</p>
            <h2 className="stage-finale__title" id="stage-finale-title">
              The journey,
              <br />
              <em>composed.</em>
            </h2>
            <p className="stage-finale__note">
              Thirty-three by forty-six centimetres of considered space.
              Everything you carry, already accounted for.
            </p>
            <div className="stage-finale__specs">
              <span>33 × 46 × 15 cm</span>
              <span aria-hidden="true">·</span>
              <span>16&quot; laptop</span>
              <span aria-hidden="true">·</span>
              <span>Nylon &amp; nappa</span>
            </div>
            <a className="stage-finale__link" href="#collection">
              Explore the REISE series <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <SmallWonders />

        <TechMeetsCraft />

        {/* SECTION 06 — Complete REISE Collection */}
        <section className="section collection" id="collection">
          <div className="container">
            <div className="collection__header">
              <p className="collection__label">
                A Study in Technical Nylon &amp; Nappa Leather
              </p>
              <h2 className="collection__title">The REISE Collection</h2>
              <p className="collection__intro">
                Explore the REISE Large Backpack, Large Tote Bag and Small Messenger. Select a piece to inspect its available details.
              </p>
            </div>
            <div className="collection__grid">
              {REISE_COLLECTION_SHOWCASE.map((product) => (
                <article
                  key={product.id}
                  className="product-card"
                  tabIndex={0}
                  aria-label={product.name}
                  onClick={() => openQuickView(product)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openQuickView(product)
                    }
                  }}
                >
                  <div className="product-card__image">
                    {product.badge && (
                      <span className="product-card__badge">{product.badge}</span>
                    )}
                    <ImageWithFallback
                      className="product-card__photo"
                      src={product.image}
                      decoding="async"
                      alt={`Braun Büffel ${product.name}`}
                      loading="lazy"
                      width={770}
                      height={770}
                    />
                    <div className="product-card__hover-bar">
                      <span className="product-card__inspect-pill">
                        <Eye size={13} /> Quick View
                      </span>
                      <a
                        className="product-card__image-caption"
                        href={product.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`View ${product.name} on Braun Büffel Singapore`}
                      >
                        Buy ↗
                      </a>
                    </div>
                  </div>
                  <div className="product-card__meta">
                    <p className="product-card__category">
                      {product.sku} · {product.colours}
                    </p>
                    <h3 className="product-card__name">{product.name}</h3>
                    <div className="product-card__bottom">
                      <p className="product-card__price">{product.price}</p>
                      {product.dimensions && (
                        <span className="product-card__dims">
                          {product.dimensions}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <NewArrivals onQuickView={openQuickView} />

        <BackpacksFeature />

        <GenderEdits />

        <GenderCollections />

        {/* INTERLUDE — the founding year, held on screen */}
        <FoundedScene />

        <Craftsmanship />

        <Bestsellers onQuickView={openQuickView} />

        {/* SECTION 07 — Campaign Callout */}
        <section className="section section--espresso campaign" id="campaign">
          <div className="campaign__content">
            <p className="product-reveal__eyebrow">Braun Büffel Singapore · Official Flagship</p>
            <h2 className="campaign__title">
              In Quiet
              <br />
              <em>Company.</em>            </h2>
            <p className="campaign__subtitle">
              Explore the latest Braun Büffel Singapore collections.
            </p>
            <div className="campaign__actions">
              <a
                href="https://braunbuffel.com.sg/collections/new-arrival-men"
                target="_blank"
                rel="noreferrer"
                className="btn btn--primary"
              >
                Shop Official Store ↗
              </a>
              <a href="#hero" className="btn btn--outline">
                Back to Top ↑
              </a>
            </div>
          </div>
        </section>

        <FinaleFilm />

        {/* SECTION 08 — Footer */}
        <footer className="footer" id="footer">
          <div className="container">
            <div className="footer__colophon">
              <div className="footer__brand-name">Braun Büffel</div>
              <p className="footer__brand-description">
                German heritage and leather goods, with origins in Kirn dating to 1887.
              </p>
            </div>
            <div className="footer__grid">
              <div>
                <h4 className="footer__column-title">Collections</h4>
                <a href="#collection" className="footer__link">
                  The REISE Series
                </a>
                <a href="#new-arrivals" className="footer__link">
                  New Arrivals 2026
                </a>
                <a href="#small-wonders" className="footer__link">
                  Small Wonders (Eyana)
                </a>
                <a href="#bestsellers" className="footer__link">
                  Viktor Bestsellers
                </a>
              </div>
              <div>
                <h4 className="footer__column-title">Singapore Boutiques</h4>
                <a
                  href="https://braunbuffel.com.sg/"
                  target="_blank"
                  rel="noreferrer"
                  className="footer__link"
                >
                  ION Orchard · Suntec City ↗
                </a>
                <a
                  href="https://braunbuffel.com.sg/"
                  target="_blank"
                  rel="noreferrer"
                  className="footer__link"
                >
                  VivoCity · Jewel Changi ↗
                </a>
                <a
                  href="https://braunbuffel.com.sg/products/reise-large-backpack"
                  target="_blank"
                  rel="noreferrer"
                  className="footer__link"
                >
                  Official Online Flagship ↗
                </a>
              </div>
              <div>
                <h4 className="footer__column-title">Client Services</h4>
                <span className="footer__link">Complimentary SG Delivery</span>
                <span className="footer__link">14-Day Free Returns</span>
                <span className="footer__link">ecare@braunbuffel.com</span>
              </div>
            </div>
            <div className="footer__bottom">
              <p className="footer__copyright">
                © 2026 BRAUN BÜFFEL Interactive 3D Showcase
              </p>
              <p className="footer__disclaimer">
                Independent interactive 3D concept; catalog details and SGD pricing are shown for reference and may change.{' '}
                <a
                  href="https://braunbuffel.com.sg/collections/new-arrival"
                  target="_blank"
                  rel="noreferrer"
                  className="footer__credit-link"
                >
                  Visit the official store ↗
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Interactive Product Detail & Craftsmanship Modal */}
      {selectedProduct && (
        <div
          className="product-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProduct.name} details`}
          onClick={closeQuickView}
        >
          <div
            className="product-modal"
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="product-modal__close"
              aria-label="Close product inspector"
              onClick={closeQuickView}
              autoFocus
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="product-modal__media">
              <div className="product-modal__stage">
                <ImageWithFallback
                  src={
                    selectedProduct.gallery
                      ? selectedProduct.gallery[modalGalleryIdx]
                      : selectedProduct.image
                  }
                  alt={selectedProduct.name}
                />
              </div>
              {selectedProduct.gallery && selectedProduct.gallery.length > 1 && (
                <div className="product-modal__thumbs">
                  {selectedProduct.gallery.map((imgUrl, idx) => (
                    <button
                      key={imgUrl}
                      type="button"
                      className={`product-modal__thumb ${
                        modalGalleryIdx === idx
                          ? 'product-modal__thumb--active'
                          : ''
                      }`}
                      onClick={() => setModalGalleryIdx(idx)}
                      aria-label={`View angle ${idx + 1}`}
                    >
                      <ImageWithFallback src={imgUrl} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="product-modal__info">
              <div className="product-modal__eyebrow">
                <span>{selectedProduct.collection}</span>
                {selectedProduct.sku && (
                  <span className="product-modal__sku">{selectedProduct.sku}</span>
                )}
              </div>
              <h2 className="product-modal__title">{selectedProduct.name}</h2>
              <p className="product-modal__price">{selectedProduct.price}</p>

              {selectedProduct.description && (
                <p className="product-modal__desc">
                  {selectedProduct.description}
                </p>
              )}

              <div className="product-modal__specs">
                {selectedProduct.colours && (
                  <div className="product-modal__spec-row">
                    <span>Colourway</span>
                    <strong>{selectedProduct.colours}</strong>
                  </div>
                )}
                {selectedProduct.dimensions && (
                  <div className="product-modal__spec-row">
                    <span>Dimensions</span>
                    <strong>{selectedProduct.dimensions}</strong>
                  </div>
                )}
                {selectedProduct.materials && (
                  <div className="product-modal__spec-row">
                    <span>Materials</span>
                    <strong>{selectedProduct.materials}</strong>
                  </div>
                )}
              </div>

              {selectedProduct.features && (
                <ul className="product-modal__features">
                  {selectedProduct.features.map((feat) => (
                    <li key={feat}>
                      <Check size={14} strokeWidth={2} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="product-modal__cta">
                <button
                  type="button"
                  className="btn btn--primary product-modal__demo-add"
                  onClick={() => addToCart(selectedProduct)}
                >
                  Add to demo bag
                </button>
                <p className="product-modal__demo-note">Demo only · checkout is completed on the official store.</p>
                <a
                  href={selectedProduct.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--primary product-modal__buy"
                >
                  <span>Shop on Braun Büffel SG</span>
                  <ArrowUpRight size={15} />
                </a>
                <button
                  type="button"
                  className="product-modal__share"
                  onClick={shareSelectedProduct}
                >
                  <Share2 size={14} strokeWidth={1.6} />
                  <span>{shareCopied ? 'Link copied' : 'Share this piece'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-drawer__header">
              <div>
                <p className="cart-drawer__eyebrow">Independent demo cart</p>
                <h2 id="cart-title">Your shopping bag <span>({cartCount})</span></h2>
              </div>
              <button
                type="button"
                className="cart-drawer__close"
                aria-label="Close shopping bag"
                onClick={() => setIsCartOpen(false)}
                autoFocus
              >
                <X size={20} />
              </button>
            </div>
            <p className="cart-drawer__notice">This preview cart is stored in this browser only. Place orders securely on the official store.</p>
            {cart.length === 0 ? (
              <div className="cart-drawer__empty">
                <ShoppingBag size={30} strokeWidth={1.2} />
                <p>Your demo bag is empty.</p>
                <button type="button" onClick={() => setIsCartOpen(false)}>Continue exploring</button>
              </div>
            ) : (
              <>
                <div className="cart-drawer__items" data-lenis-prevent>
                  {cart.map(({ product, quantity }) => (
                    <article className="cart-item" key={product.id}>
                      <ImageWithFallback src={product.image} alt="" />
                      <div className="cart-item__details">
                        <p className="cart-item__collection">{product.collection}</p>
                        <h3>{product.name}</h3>
                        <p className="cart-item__price">{product.price}</p>
                        <div className="cart-item__controls" aria-label={`${product.name} quantity controls`}>
                          <button type="button" aria-label={`Remove one ${product.name}`} onClick={() => updateCartQuantity(product.id, quantity - 1)}><Minus size={14} /></button>
                          <span aria-label={`Quantity ${quantity}`}>{quantity}</span>
                          <button type="button" aria-label={`Add one ${product.name}`} onClick={() => updateCartQuantity(product.id, quantity + 1)}><Plus size={14} /></button>
                          <button type="button" className="cart-item__remove" aria-label={`Remove ${product.name}`} onClick={() => updateCartQuantity(product.id, 0)}><Trash2 size={15} /> Remove</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="cart-drawer__footer">
                  <div className="cart-drawer__subtotal"><span>Estimated subtotal</span><strong>{formatSgd(cartTotal)}</strong></div>
                  <a className="btn btn--primary" href="https://braunbuffel.com.sg/collections/new-arrival" target="_blank" rel="noreferrer">Continue on official store <ArrowUpRight size={15} /></a>
                  <p>Prices shown are indicative and may change on the official store.</p>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
