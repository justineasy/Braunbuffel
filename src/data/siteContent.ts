/**
 * Homepage content for the concept redesign, adapted from the official
 * Braun Büffel Singapore storefront (names, prices, colours, SKUs and product photos
 * as listed there). This concept is independent and is not the official site.
 */

export interface ShopProduct {
  id: string
  sku?: string
  name: string
  category: 'bags' | 'wallets' | 'accessories'
  collection: string
  price: string
  colours?: string
  dimensions?: string
  materials?: string
  description?: string
  features?: readonly string[]
  image: string
  gallery?: readonly string[]
  href: string
  badge?: string
}

export const ANNOUNCEMENTS = [
  'A Charming Addition: Enjoy a complimentary bag charm with every regular-priced bag purchase. While stocks last.',
  'Member Exclusive: Sign up or log in for 10% off regular-priced items. Exclusions apply.',
  'Carry Light, Travel Far: 15% off selected travel styles. Regular-priced items only; exclusions apply.',
  'Your Morning Commute, Elevated: Complimentary travel mug with min. $350 nett spend. T&Cs apply.',
] as const

export const REISE_COLLECTION_SHOWCASE: readonly ShopProduct[] = [
  {
    id: 'reise-large-backpack',
    sku: 'REISE-73-000',
    name: 'REISE Large Backpack',
    category: 'bags',
    collection: 'REISE · Men',
    price: '$689.00 SGD',
    colours: 'Black · Deep Blues',
    dimensions: '33cm (L) × 46cm (H) × 15cm (W)',
    materials: 'Nylon & Nappa Leather · Satin Nickel Hardware',
    description:
      'Built for movement, REISE combines durable nylon, supple nappa leather and satin nickel hardware in streamlined, travel-ready silhouettes.',
    features: [
      'Padded laptop compartment (up to 16 inches)',
      'Dual buckle opening and back zip opening',
      'Cabin trolley slot, two side pockets and one front pocket',
    ],
    image: '/images/reise-large-backpack.webp',
    gallery: [
      '/images/reise-gallery-front.webp',
      '/images/reise-gallery-angle.webp',
      '/images/reise-gallery-detail.webp',
      '/images/reise-gallery-rear.webp',
      '/images/reise-gallery-inside.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/reise-1-73b-large-backpack',

  },
  {
    id: 'reise-large-tote',
    sku: 'REISE-1-58-000',
    name: 'REISE Large Tote Bag',
    category: 'bags',
    collection: 'REISE · Men & Unisex',
    price: '$649.00 SGD',
    colours: 'Black',
    dimensions: '36cm (L) × 35cm (H) × 17cm (W)',
    materials: 'Nylon Body & Nappa Leather Panelling · Satin Gunmetal Hardware',
    description:
      'Built for movement, the REISE collection combines durable nylon, supple nappa leather and satin gun hardware in streamlined, travel-ready silhouettes.',
    features: [
      'Padded laptop compartment (up to 16 inches)',
      'Zip opening with fold-over flap and front pocket with magnetic closure',
      'External back zip compartment and internal bottle holder',
      'Nylon luggage loop and detachable adjustable strap',
    ],
    image: '/images/reise-tote.webp',
    gallery: ['/images/reise-tote.webp', '/images/reise-gallery-detail.webp'],
    href: 'https://braunbuffel.com.sg/products/reise-1-large-tote-bag',
  },
  {
    id: 'reise-small-messenger',
    sku: 'REISE-1-61-000',
    name: 'REISE Small Messenger',
    category: 'bags',
    collection: 'REISE · Men',
    price: '$399.00 SGD',
    colours: 'Black',
    dimensions: '24cm (L) × 15cm (H) × 10cm (W)',
    materials: 'Nylon Body & Nappa Leather Panelling · Satin Gunmetal Hardware',
    description:
      'Built for movement, the REISE collection combines durable nylon, supple nappa leather and satin gun hardware in streamlined, travel-ready silhouettes.',
    features: [
      'Main compartment',
      'Internal zip compartment',
      'Adjustable shoulder strap',
    ],
    image: '/images/reise-messenger.webp',
    gallery: ['/images/reise-messenger.webp', '/images/reise-gallery-detail.webp'],
    href: 'https://braunbuffel.com.sg/products/reise-1-small-messenger',
  },
]

export const NEW_ARRIVALS: readonly ShopProduct[] = [
  ...REISE_COLLECTION_SHOWCASE,
  {
    id: 'valadon-small-messenger',
    name: 'Valadon Small Messenger',
    category: 'bags',
    collection: 'Valadon · Men',
    price: '$599.00 SGD',
    colours: 'Black',
    image: '/images/shop/valadon-small-messenger.webp',
    gallery: [
      '/images/shop/valadon-small-messenger.webp',
      '/images/shop/valadon-small-messenger-2.webp',
      '/images/shop/valadon-small-messenger-3.webp',
      '/images/shop/valadon-small-messenger-4.webp',
      '/images/shop/valadon-small-messenger-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/valadon-c-small-messenger',
  },
  {
    id: 'slate-large-clutch',
    name: 'Slate Large Clutch',
    category: 'bags',
    collection: 'Slate · Men',
    price: '$449.00 SGD',
    colours: 'Dark Gull Grey · Blue Mirage',
    image: '/images/shop/slate-large-clutch.webp',
    gallery: [
      '/images/shop/slate-large-clutch.webp',
      '/images/shop/slate-large-clutch-2.webp',
      '/images/shop/slate-large-clutch-3.webp',
      '/images/shop/slate-large-clutch-4.webp',
      '/images/shop/slate-large-clutch-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/slate-b-large-clutch',
  },
  {
    id: 'eyana-zip-top-wristlet',
    name: 'Eyana Zip Top Wristlet',
    category: 'accessories',
    collection: 'Eyana · Women',
    price: '$249.00 SGD',
    colours: 'Dark Gull Grey · Pearl Blue',
    image: '/images/shop/eyana-zip-top-wristlet.webp',
    gallery: [
      '/images/shop/eyana-zip-top-wristlet.webp',
      '/images/shop/eyana-zip-top-wristlet-2.webp',
      '/images/shop/eyana-zip-top-wristlet-3.webp',
      '/images/shop/eyana-zip-top-wristlet-4.webp',
      '/images/shop/eyana-zip-top-wristlet-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/eyana-a1-zip-top-wristlet',
  },
  {
    id: 'eyana-bifold-long-wallet',
    name: 'Eyana Bi-Fold Long Wallet (Box Gusset with Zip)',
    category: 'wallets',
    collection: 'Eyana · Women',
    price: '$349.00 SGD',
    colours: 'Dark Gull Grey · Pearl Blue',
    image: '/images/shop/eyana-bifold-long-wallet.webp',
    gallery: [
      '/images/shop/eyana-bifold-long-wallet.webp',
      '/images/shop/eyana-bifold-long-wallet-2.webp',
      '/images/shop/eyana-bifold-long-wallet-3.webp',
      '/images/shop/eyana-bifold-long-wallet-4.webp',
      '/images/shop/eyana-bifold-long-wallet-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/eyana-a1-bi-fold-long-wallet-box-gusset-with-zip',
  },
  {
    id: 'eyana-zip-long-wallet',
    name: 'Eyana Zip Long Wallet (3 Gusset)',
    category: 'wallets',
    collection: 'Eyana · Women',
    price: '$349.00 SGD',
    colours: 'Dark Gull Grey · Pearl Blue',
    image: '/images/shop/eyana-zip-long-wallet.webp',
    gallery: [
      '/images/shop/eyana-zip-long-wallet.webp',
      '/images/shop/eyana-zip-long-wallet-2.webp',
      '/images/shop/eyana-zip-long-wallet-3.webp',
      '/images/shop/eyana-zip-long-wallet-4.webp',
      '/images/shop/eyana-zip-long-wallet-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/eyana-a1-zip-long-wallet-3-gusset',
  },
  {
    id: 'eyana-bifold-short-wallet',
    name: 'Eyana Bifold Short Wallet (Box Gusset)',
    category: 'wallets',
    collection: 'Eyana · Women',
    price: '$299.00 SGD',
    colours: 'Dark Gull Grey · Pearl Blue',
    image: '/images/shop/eyana-bifold-short-wallet.webp',
    gallery: [
      '/images/shop/eyana-bifold-short-wallet.webp',
      '/images/shop/eyana-bifold-short-wallet-2.webp',
      '/images/shop/eyana-bifold-short-wallet-3.webp',
      '/images/shop/eyana-bifold-short-wallet-4.webp',
      '/images/shop/eyana-bifold-short-wallet-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/eyana-a1-bifold-short-wallet-box-gusset',
  },
]

export const BESTSELLERS: readonly ShopProduct[] = [
  {
    id: 'viktor-bifold-long-wallet',
    name: 'Viktor Bifold Long Wallet (Box Gusset)',
    category: 'wallets',
    collection: 'Viktor · Men',
    price: '$319.00 SGD',
    colours: 'Dark Gull Grey',
    image: '/images/shop/viktor-bifold-long-wallet.webp',
    gallery: [
      '/images/shop/viktor-bifold-long-wallet.webp',
      '/images/shop/viktor-bifold-long-wallet-2.webp',
      '/images/shop/viktor-bifold-long-wallet-3.webp',
      '/images/shop/viktor-bifold-long-wallet-4.webp',
      '/images/shop/viktor-bifold-long-wallet-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/viktor-f-bifold-long-wallet-box-gusset',

  },
  {
    id: 'viktor-centre-flap-wallet',
    name: 'Viktor Centre Flap Wallet with Coin Compartment',
    category: 'wallets',
    collection: 'Viktor · Men',
    price: '$229.00 SGD',
    colours: 'Dark Gull Grey',
    image: '/images/shop/viktor-centre-flap-wallet.webp',
    gallery: [
      '/images/shop/viktor-centre-flap-wallet.webp',
      '/images/shop/viktor-centre-flap-wallet-2.webp',
      '/images/shop/viktor-centre-flap-wallet-3.webp',
      '/images/shop/viktor-centre-flap-wallet-4.webp',
      '/images/shop/viktor-centre-flap-wallet-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/viktor-f-centre-flap-wallet-with-coin-compartment',

  },
  {
    id: 'viktor-centre-flap-card-wallet',
    name: 'Viktor Centre Flap Card Wallet',
    category: 'wallets',
    collection: 'Viktor · Men',
    price: '$229.00 SGD',
    colours: 'Dark Gull Grey',
    image: '/images/shop/viktor-centre-flap-card-wallet.webp',
    gallery: [
      '/images/shop/viktor-centre-flap-card-wallet.webp',
      '/images/shop/viktor-centre-flap-card-wallet-2.webp',
      '/images/shop/viktor-centre-flap-card-wallet-3.webp',
      '/images/shop/viktor-centre-flap-card-wallet-4.webp',
      '/images/shop/viktor-centre-flap-card-wallet-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/viktor-f-centre-flap-card-wallet',
  },
  {
    id: 'viktor-wallet-coin',
    name: 'Viktor Wallet with Coin Compartment',
    category: 'wallets',
    collection: 'Viktor · Men',
    price: '$209.00 SGD',
    colours: 'Dark Gull Grey',
    image: '/images/shop/viktor-wallet-coin.webp',
    gallery: [
      '/images/shop/viktor-wallet-coin.webp',
      '/images/shop/viktor-wallet-coin-2.webp',
      '/images/shop/viktor-wallet-coin-3.webp',
      '/images/shop/viktor-wallet-coin-4.webp',
      '/images/shop/viktor-wallet-coin-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/viktor-f-wallet-with-coin-compartment',
  },
  {
    id: 'viktor-8-cards-wallet',
    name: 'Viktor 8 Cards Wallet',
    sku: 'VIKTOR-E-313-000',
    category: 'wallets',
    collection: 'Viktor · Men',
    price: '$209.00 SGD',
    colours: 'Dark Gull Grey',
    dimensions: '11cm (L) × 9cm (H)',
    materials: 'Fine Grain Printed Leather · Ionised Black Hardware',
    features: ['8 credit card slots', '2 notes compartments', '2 internal compartments'],
    image: '/images/shop/viktor-8-cards-wallet.webp',
    gallery: [
      '/images/shop/viktor-8-cards-wallet.webp',
      '/images/shop/viktor-8-cards-wallet-2.webp',
      '/images/shop/viktor-8-cards-wallet-3.webp',
      '/images/shop/viktor-8-cards-wallet-4.webp',
      '/images/shop/viktor-8-cards-wallet-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/viktor-f-8-cards-wallet',
  },
  {
    id: 'viktor-bifold-lanyard',
    name: 'Viktor Bifold Lanyard',
    category: 'accessories',
    collection: 'Viktor · Men & Unisex',
    price: '$169.00 SGD',
    colours: 'Dark Gull Grey',
    image: '/images/shop/viktor-bifold-lanyard.webp',
    gallery: [
      '/images/shop/viktor-bifold-lanyard.webp',
      '/images/shop/viktor-bifold-lanyard-2.webp',
      '/images/shop/viktor-bifold-lanyard-3.webp',
      '/images/shop/viktor-bifold-lanyard-4.webp',
      '/images/shop/viktor-bifold-lanyard-5.webp',
    ],
    href: 'https://braunbuffel.com.sg/products/viktor-f-bifold-lanyard',
  },
]

export const HERITAGE_MILESTONES = [
  {
    year: '1887',
    place: 'Kirn, Germany',
    title: 'Founded in Kirn',
    detail: 'Braun Büffel traces its origins to Kirn, Germany, in 1887.',
  },
  {
    year: '2026',
    place: 'Current collection',
    title: 'In Quiet Company',
    detail: 'The REISE and Eyana collections feature in the Braun Büffel Singapore storefront.',
  },
] as const

export const INSTALLMENT_NOTE =
  'Complimentary standard shipping across Singapore. Free returns and exchanges within 14 days of delivery; exclusions apply. See the official store for current terms.'
