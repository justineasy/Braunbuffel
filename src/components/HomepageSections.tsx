import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Eye, Sparkles, ShieldCheck, Compass, Layers, ChevronLeft, ChevronRight } from 'lucide-react'
import useInView from '../hooks/useInView'
import ImageWithFallback from './ImageWithFallback'
import {
  ANNOUNCEMENTS,
  BESTSELLERS,
  HERITAGE_MILESTONES,
  INSTALLMENT_NOTE,
  NEW_ARRIVALS,
  REISE_COLLECTION_SHOWCASE,
  type ShopProduct,
} from '../data/siteContent'

/* ======================================================
   Shared reveal wrapper — fades and rises once on first view
   ====================================================== */

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const [ref, isInView] = useInView<HTMLDivElement>(0.15)
  return (
    <div
      ref={ref}
      className={`reveal ${isInView ? 'reveal--visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ======================================================
   Announcement bar — rotating promotions above the navigation
   ====================================================== */

export function AnnouncementBar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % ANNOUNCEMENTS.length),
      5000
    )
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="announcement" role="region" aria-label="Promotions">
      <p className="announcement__message" key={index}>
        {ANNOUNCEMENTS[index]}
      </p>
    </div>
  )
}

/* ======================================================
   Editorial tiles — Small Wonders and Tech Meets Craft
   ====================================================== */

const ALL_HOMEPAGE_PRODUCTS = [...NEW_ARRIVALS, ...BESTSELLERS]

function productsByName(names: readonly string[]): ShopProduct[] {
  return names
    .map((name) => ALL_HOMEPAGE_PRODUCTS.find((item) => item.name === name))
    .filter((item): item is ShopProduct => item !== undefined)
}

function EditionTile({ product, delay = 0 }: { product: ShopProduct; delay?: number }) {
  return (
    <Reveal className="edition-tile" delay={delay}>
      <a
        className="edition-tile__link"
        href={product.href}
        target="_blank"
        rel="noreferrer"
      >
        <div className="edition-tile__image">
          <ImageWithFallback
            src={product.image}
            alt={`Braun Büffel ${product.name}`}
            loading="lazy"
            decoding="async"
            width={770}
            height={770}
          />
        </div>
        <p className="edition-tile__collection">{product.collection}</p>
        <h3 className="edition-tile__name">{product.name}</h3>
        <p className="edition-tile__price">{product.price}</p>
      </a>
    </Reveal>
  )
}

/* ======================================================
   Small Wonders — compact leather accessories
   ====================================================== */

const SMALL_WONDER_NAMES = [
  'Eyana Zip Top Wristlet',
  'Eyana Bifold Short Wallet (Box Gusset)',
  'Viktor 8 Cards Wallet',
  'Viktor Bifold Lanyard',
]

export function SmallWonders() {
  const products = productsByName(SMALL_WONDER_NAMES)
  return (
    <section
      className="section small-wonders"
      id="small-wonders"
      aria-labelledby="small-wonders-title"
    >
      <div className="container">
        <Reveal className="small-wonders__header">
          <p className="small-wonders__eyebrow">Small Wonders · 2026</p>
          <h2 id="small-wonders-title" className="small-wonders__title">
            Little leather, <em>carried everywhere.</em>
          </h2>
          <p className="small-wonders__text">
            Wristlets, short wallets, card holders and lanyards from the Eyana and Viktor collections.
          </p>
          <a
            className="small-wonders__link"
            href="https://braunbuffel.com.sg/collections/new-arrival-women"
            target="_blank"
            rel="noreferrer"
          >
            Explore Small Wonders ↗
          </a>
        </Reveal>
        <div className="edition-grid edition-grid--four">
          {products.map((product, index) => (
            <EditionTile key={product.id} product={product} delay={index * 90} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ======================================================
   Tech Meets Craft — REISE construction, sourced details only
   ====================================================== */

export function TechMeetsCraft() {
  const points = [
    {
      icon: Layers,
      title: 'Nylon & nappa leather',
      text: 'Durable nylon meets supple nappa leather, finished with satin nickel hardware.',
    },
    {
      icon: ShieldCheck,
      title: 'Room for a laptop',
      text: 'A padded compartment fits a laptop up to 16 inches.',
    },
    {
      icon: Compass,
      title: 'Built for the journey',
      text: 'A cabin trolley slot, dual-opening design and side pockets keep essentials within reach.',
    },
  ]

  return (
    <section
      className="section tech-craft"
      id="tech-meets-craft"
      aria-labelledby="tech-craft-title"
    >
      <div className="container tech-craft__inner">
        <Reveal className="tech-craft__media">
          <ImageWithFallback
            src="/images/reise-stage-detail.webp"
            alt="Detail of a REISE product from Braun Büffel"
            loading="lazy"
            decoding="async"
          />
        </Reveal>
        <Reveal className="tech-craft__copy" delay={120}>
          <p className="tech-craft__eyebrow">
            <Sparkles size={14} strokeWidth={1.5} /> Tech Meets Craft
          </p>
          <h2 id="tech-craft-title" className="tech-craft__title">
            Leather made for the <em>modern day.</em>
          </h2>
          <p className="tech-craft__text">
            Practical technology sits inside considered leathercraft, so everyday carry stays light and the details stay refined.
          </p>
          <ul className="tech-craft__points">
            {points.map(({ icon: Icon, title, text }) => (
              <li key={title} className="tech-craft__point">
                <Icon size={18} strokeWidth={1.4} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <a
            className="btn btn--outline"
            href="https://braunbuffel.com.sg/collections/new-arrival"
            target="_blank"
            rel="noreferrer"
          >
            Explore New Arrivals ↗
          </a>
        </Reveal>
      </div>
    </section>
  )
}

/* ======================================================
   Backpacks — REISE large backpack with its gallery, plus the medium backpack
   ====================================================== */

export function BackpacksFeature() {
  const large = REISE_COLLECTION_SHOWCASE[0]
  const gallery = large.gallery ?? [large.image]
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section
      className="section backpacks"
      id="backpacks"
      aria-labelledby="backpacks-title"
    >
      <div className="container">
        <Reveal className="backpacks__header">
          <p className="backpacks__eyebrow">Backpacks · REISE</p>
          <h2 id="backpacks-title" className="backpacks__title">
            Built for movement, <em>carried with care.</em>
          </h2>
        </Reveal>

        <div className="backpacks__feature">
          <Reveal className="backpacks__media">
            <div className="backpacks__stage">
              <ImageWithFallback
                src={gallery[activeIndex]}
                alt={`${large.name}, view ${activeIndex + 1} of ${gallery.length}`}
                decoding="async"
              />
            </div>
            <div className="backpacks__thumbs" role="group" aria-label="Choose a view">
              {gallery.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  className={`backpacks__thumb ${index === activeIndex ? 'is-active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={index === activeIndex}
                  aria-label={`Show view ${index + 1}`}
                >
                  <ImageWithFallback src={src} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal className="backpacks__copy" delay={120}>
            <p className="backpacks__collection">{large.collection}</p>
            <h3 className="backpacks__name">{large.name}</h3>
            <p className="backpacks__price">{large.price}</p>
            <p className="backpacks__text">{large.description}</p>
            <ul className="backpacks__features">
              {large.features?.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <dl className="backpacks__specs">
              <div>
                <dt>Colours</dt>
                <dd>{large.colours}</dd>
              </div>
              <div>
                <dt>Materials</dt>
                <dd>{large.materials}</dd>
              </div>
              <div>
                <dt>Dimensions</dt>
                <dd>{large.dimensions}</dd>
              </div>
            </dl>
            <a
              className="btn btn--outline"
              href={large.href}
              target="_blank"
              rel="noreferrer"
            >
              View REISE Large Backpack ↗
            </a>
          </Reveal>
        </div>

        <Reveal className="backpacks__companion">
          <div className="backpacks__companion-image">
            <ImageWithFallback
              src="/images/reise-medium-backpack.webp"
              alt="REISE Medium Backpack"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="backpacks__companion-copy">
            <p className="backpacks__collection">REISE · Medium</p>
            <h3 className="backpacks__name">REISE Medium Backpack</h3>
            <p className="backpacks__text">
              A second REISE backpack for a lighter day. Open the collection for colours, sizes and pricing.
            </p>
            <a
              className="btn btn--outline"
              href="https://braunbuffel.com.sg/collections/new-arrival"
              target="_blank"
              rel="noreferrer"
            >
              Explore the REISE line ↗
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ======================================================
   Men's and Women's edits — product picks from each collection
   ====================================================== */

const EDITIONS = [
  {
    key: 'men',
    eyebrow: "Men's Edit",
    title: 'Cut for the everyday man',
    href: 'https://braunbuffel.com.sg/collections/new-arrival',
    campaignImage: '/images/harbour-arrival-men-2026.webp',
    campaignAlt: 'Braun Büffel men’s Harbour Arrival 2026 campaign',
    campaignLine: 'Made to move with you.',
    description: 'City-ready bags, dependable wallets and small essentials selected from the men’s edit.',
    photoCredit: 'Braun Büffel · Harbour Arrival 2026 men’s campaign',
    photoHref: 'https://braunbuffel.com.sg/collections/new-arrival-men',
    names: [
      'Valadon Small Messenger',
      'Slate Large Clutch',
      'Viktor Bifold Long Wallet (Box Gusset)',
    ],
  },
  {
    key: 'women',
    eyebrow: "Women's Edit",
    title: 'Graceful, practical leather',
    href: 'https://braunbuffel.com.sg/collections/new-arrival-women',
    campaignImage: '/images/harbour-arrival-women-2026.webp',
    campaignAlt: 'Braun Büffel women’s Harbour Arrival 2026 campaign',
    campaignLine: 'Quiet details, everyday elegance.',
    description: 'Everyday carry and compact leather essentials selected from the Eyana edit.',
    photoCredit: 'Braun Büffel · Harbour Arrival 2026 women’s campaign',
    photoHref: 'https://braunbuffel.com.sg/collections/new-arrival-women',
    names: [
      'Eyana Bi-Fold Long Wallet (Box Gusset with Zip)',
      'Eyana Zip Long Wallet (3 Gusset)',
    ],
  },
]

export function GenderEdits() {
  return (
    <section className="section gender-edits" aria-labelledby="gender-edits-title">
      <div className="container">
        <header className="gender-edits__intro">
          <p className="gender-edits__eyebrow">The Braun Büffel edit · 01—02</p>
          <h2 id="gender-edits-title" className="gender-edits__title">
            Carried with <em>character.</em>
          </h2>
          <p className="gender-edits__intro-copy">
            Considered pieces for the everyday journey, selected from the men’s and women’s collections.
          </p>
        </header>
        <div className="gender-edits__grid">
          {EDITIONS.map((edition, index) => {
            const products = productsByName(edition.names)
            return (
              <article key={edition.key} className={`gender-edit gender-edit--${edition.key}`}>
                <div className="gender-edit__campaign">
                  <ImageWithFallback
                    className="gender-edit__campaign-image"
                    src={edition.campaignImage}
                    alt={edition.campaignAlt}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="gender-edit__campaign-copy">
                    <p>Braun Büffel · 2026 campaign</p>
                    <h3>{edition.campaignLine}</h3>
                  </div>
                </div>
                <p className="gender-edit__photo-credit">
                  Photo: <a href={edition.photoHref} target="_blank" rel="noreferrer">{edition.photoCredit}</a>
                </p>
                <div className="gender-edit__details">
                  <Reveal className="gender-edit__header" delay={index * 100}>
                    <p className="gender-edit__eyebrow">{edition.eyebrow}</p>
                    <h3 className="gender-edit__title">{edition.title}</h3>
                    <p className="gender-edit__description">{edition.description}</p>
                    <a
                      className="gender-edit__link"
                      href={edition.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Shop the edit <span aria-hidden="true">↗</span>
                    </a>
                  </Reveal>
                  <div className="edition-grid">
                    {products.map((product, productIndex) => (
                      <EditionTile key={product.id} product={product} delay={productIndex * 70} />
                    ))}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ======================================================
   Product cards — official product photo with interactive Quick View
   ====================================================== */

function ShopCard({
  product,
  index,
  onQuickView,
}: {
  product: ShopProduct
  index: number
  onQuickView?: (product: ShopProduct) => void
}) {
  // The gallery usually opens with the hero shot; take the first genuinely
  // different frame so hovering reveals another angle instead of a duplicate.
  const alternate = product.gallery?.find((src) => src !== product.image)

  return (
    <Reveal className="shop-card" delay={Math.min(index, 5) * 65}>
      <div className="shop-card__wrapper">
        <div className="shop-card__media">
          {product.badge && <span className="shop-card__badge">{product.badge}</span>}
          <ImageWithFallback
            className="shop-card__photo"
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
          />
          {alternate && (
            <ImageWithFallback
              className="shop-card__photo shop-card__photo--alt"
              src={alternate}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="shop-card__actions">
            {onQuickView && (
              <button
                type="button"
                className="shop-card__quickview-btn"
                onClick={() => onQuickView(product)}
                aria-label={`Quick inspect ${product.name}`}
              >
                <Eye size={14} strokeWidth={1.6} />
                <span>Inspect Piece</span>
              </button>
            )}
            <a
              className="shop-card__ext-link"
              href={product.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${product.name} on Braun Büffel Singapore`}
            >
              Official Store ↗
            </a>
          </div>
        </div>
        <div className="shop-card__body">
          <p className="shop-card__collection">{product.collection}</p>
          <h3 className="shop-card__name">{product.name}</h3>
          {product.colours && <p className="shop-card__colours">{product.colours}</p>}
          <p className="shop-card__price">{product.price}</p>
        </div>
      </div>
    </Reveal>
  )
}

/* ======================================================
   New arrivals with interactive category filtering
   ====================================================== */

const FILTER_TABS = [
  { id: 'all', label: 'All Pieces' },
  { id: 'bags', label: 'Bags & Carry' },
  { id: 'wallets', label: 'Fine Wallets' },
  { id: 'accessories', label: 'Small Wonders' },
] as const

export function NewArrivals({
  onQuickView,
}: {
  onQuickView?: (product: ShopProduct) => void
}) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'bags' | 'wallets' | 'accessories'>('all')
  const railRef = useRef<HTMLDivElement>(null)
  const filteredProducts =
    activeFilter === 'all'
      ? NEW_ARRIVALS
      : NEW_ARRIVALS.filter((p) => p.category === activeFilter)

  const moveRail = (direction: -1 | 1) => {
    const rail = railRef.current
    if (!rail) return
    const card = rail.querySelector<HTMLElement>('.shop-rail__item')
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 24
    rail.scrollBy({ left: direction * ((card?.offsetWidth ?? rail.clientWidth * 0.72) + gap), behavior: 'smooth' })
  }

  return (
    <section className="section shop-section" id="new-arrivals">
      <div className="container">
        <div className="shop-section__top">
          <Reveal className="shop-section__header">
            <p className="shop-section__eyebrow">New Arrivals</p>
            <h2 className="shop-section__title">The latest collection</h2>
            <p className="shop-section__intro">
              Explore the latest bags and small leather goods from Braun Büffel Singapore.
            </p>
          </Reveal>

          <Reveal className="shop-section__filters" delay={100}>
            <div className="filter-pills" role="group" aria-label="Filter New Arrivals">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={activeFilter === tab.id}
                  className={`filter-pill ${activeFilter === tab.id ? 'filter-pill--active' : ''}`}
                  onClick={() => {
                    setActiveFilter(tab.id)
                    railRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
        <div className="shop-rail-controls">
          <a className="shop-rail-view-all" href="https://braunbuffel.com.sg/collections/new-arrival" target="_blank" rel="noreferrer">
            View all new arrivals <span aria-hidden="true">↗</span>
          </a>
          <div className="shop-rail-arrows" role="group" aria-label="New Arrivals carousel controls">
            <button type="button" onClick={() => moveRail(-1)} aria-label="Scroll to previous products">
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>
            <button type="button" onClick={() => moveRail(1)} aria-label="Scroll to next products">
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="shop-rail shop-rail--carousel" role="list" ref={railRef} aria-label="New Arrivals products">
          {filteredProducts.map((product, index) => (
            <div className="shop-rail__item" role="listitem" key={product.id}>
              <ShopCard product={product} index={index} onQuickView={onQuickView} />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export function Bestsellers({
  onQuickView,
}: {
  onQuickView?: (product: ShopProduct) => void
}) {
  return (
    <section className="section shop-section shop-section--alt" id="bestsellers">
      <div className="container">
        <Reveal className="shop-section__header">
          <p className="shop-section__eyebrow">Bestsellers · The Viktor Series</p>
          <h2 className="shop-section__title">Wallets people reach for</h2>
          <p className="shop-section__intro">
            Hand-burnished calfskin silhouettes that age with character and quiet distinction.
          </p>
        </Reveal>
        <div className="shop-rail" role="list">
          {BESTSELLERS.map((product, index) => (
            <div role="listitem" key={product.id}>
              <ShopCard product={product} index={index} onQuickView={onQuickView} />
            </div>
          ))}
        </div>
        <Reveal className="shop-section__note">
          <p>{INSTALLMENT_NOTE}</p>
        </Reveal>
      </div>
    </section>
  )
}

/* ======================================================
   Men's and women's collections
   ====================================================== */

export function GenderCollections() {
  const collections = [
    {
      key: 'men',
      eyebrow: "Men's Collection",
      title: 'Daily staples, made to move with you',
      copy: 'Explore bags, backpacks, wallets and accessories from the latest men’s collection.',
      image: '/images/harbour-arrival-men-2026.webp',
      href: 'https://braunbuffel.com.sg/collections/new-arrival-men',
    },
    {
      key: 'women',
      eyebrow: "Women's Collection",
      title: 'Effortlessly graceful, every day',
      copy: 'Explore handbags, wallets and small leather goods from the latest women’s collection.',
      image: '/images/harbour-arrival-women-2026.webp',
      href: 'https://braunbuffel.com.sg/collections/new-arrival-women',
    },
  ]

  return (
    <section
      className="section gender-collections"
      aria-label="Men's and women's collections"
    >
      <div className="container gender-collections__grid">
        {collections.map((collection, index) => (
          <Reveal key={collection.key} className="gender-tile" delay={index * 120}>
          <ImageWithFallback
            className="gender-tile__image"
              src={collection.image}
              alt={`Braun Büffel ${collection.eyebrow} campaign`}
              loading="lazy"
              decoding="async"
            />
            <div className="gender-tile__copy">
              <p className="gender-tile__eyebrow">{collection.eyebrow}</p>
              <h2 className="gender-tile__title">{collection.title}</h2>
              <p className="gender-tile__text">{collection.copy}</p>
              <a
                className="gender-tile__link"
                href={collection.href}
                target="_blank"
                rel="noreferrer"
              >
                Shop Collection ↗
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ======================================================
   Our craftsmanship — heritage copy + 1887–2026 Atelier Timeline
   ====================================================== */

export function Craftsmanship() {
  return (
    <section className="section craftsmanship-block" id="heritage">
      <div className="craftsmanship-block__image" aria-hidden="true" />
      <div className="container craftsmanship-block__inner">
        <Reveal className="craftsmanship-block__copy">
          <p className="craftsmanship-block__eyebrow">Our Craftsmanship · Est. 1887</p>
          <h2 className="craftsmanship-block__title">
            Heritage, precision, <em>timeless design.</em>
          </h2>
          <p className="craftsmanship-block__text">
            Founded in Kirn, Germany in 1887, Braun Büffel has built a heritage in leather goods. The collections pair considered materials with practical design for everyday carry.
          </p>

          <div className="craftsmanship-pillars">
            <div className="craftsmanship-pillar">
              <Layers size={18} strokeWidth={1.4} />
              <div>
                <h4>Leather &amp; Material</h4>
                <p>Explore leather goods and material details across the current collection.</p>
              </div>
            </div>
            <div className="craftsmanship-pillar">
              <Compass size={18} strokeWidth={1.4} />
              <div>
                <h4>Practical Design</h4>
                <p>Thoughtful compartments and useful details support everyday journeys.</p>
              </div>
            </div>
            <div className="craftsmanship-pillar">
              <ShieldCheck size={18} strokeWidth={1.4} />
              <div>
                <h4>Made for Everyday Carry</h4>
                <p>Explore bags and small leather goods designed for practical use.</p>
              </div>
            </div>
          </div>

          <a
            className="craftsmanship-block__link"
            href="https://braunbuffel.com.sg/"
            target="_blank"
            rel="noreferrer"
          >
            Discover Our Heritage ↗
          </a>
        </Reveal>

        <Reveal className="heritage-timeline" delay={160}>
          <div className="heritage-timeline__header">
            <Sparkles size={14} strokeWidth={1.5} />
            <span>From Kirn, Germany · Est. 1887</span>
          </div>
          <div className="heritage-timeline__list">
            {HERITAGE_MILESTONES.map((m) => (
              <div key={m.year} className="heritage-milestone">
                <div className="heritage-milestone__meta">
                  <span className="heritage-milestone__year">{m.year}</span>
                  <span className="heritage-milestone__place">{m.place}</span>
                </div>
                <div className="heritage-milestone__body">
                  <h3>{m.title}</h3>
                  <p>{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ======================================================
   Final film — official Instagram Reel embed
   ====================================================== */

const FILM_INSTAGRAM_URL = 'https://www.instagram.com/reel/DdD_3BjgZWF/'
const FILM_POSTER = '/images/harbour-arrival-campaign.webp'
const INSTAGRAM_EMBED_SCRIPT = 'https://www.instagram.com/embed.js'

type InstagramEmbedWindow = Window & {
  instgrm?: { Embeds?: { process: () => void } }
}

export function FinaleFilm() {
  const [sectionRef, isInView] = useInView<HTMLElement>(0.2)

  useEffect(() => {
    if (!isInView) return

    const processEmbeds = () => {
      ;(window as InstagramEmbedWindow).instgrm?.Embeds?.process()
    }
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${INSTAGRAM_EMBED_SCRIPT}"]`
    )

    if (existingScript) {
      if ((window as InstagramEmbedWindow).instgrm?.Embeds) processEmbeds()
      else existingScript.addEventListener('load', processEmbeds, { once: true })
      return () => existingScript.removeEventListener('load', processEmbeds)
    }

    const script = document.createElement('script')
    script.src = INSTAGRAM_EMBED_SCRIPT
    script.async = true
    script.onload = processEmbeds
    document.body.appendChild(script)
  }, [isInView])

  return (
    <section
      ref={sectionRef}
      className="section film film--reel"
      id="film"
      aria-label="Braun Büffel campaign film"
    >
      <div
        className="film__media film__still"
        style={{ backgroundImage: `url(${FILM_POSTER})` }}
        aria-hidden="true"
      />
      <div className="film__embed film__embed--reel">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={FILM_INSTAGRAM_URL}
          data-instgrm-version="14"
        >
          <a href={FILM_INSTAGRAM_URL} target="_blank" rel="noreferrer">
            Watch “In Quiet Company” on Instagram
          </a>
        </blockquote>
      </div>
      <div className="film__shade" aria-hidden="true" />
      <Reveal className="film__copy">
        <p className="film__eyebrow">The Campaign Film · In Quiet Company</p>
        <h2 className="film__title">
          The journey, <em>in motion.</em>
        </h2>
        <a className="btn btn--outline" href="#collection">
          Explore the Collection
        </a>
      </Reveal>
    </section>
  )
}
