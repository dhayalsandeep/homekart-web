export type IconName =
  | 'home'
  | 'layers'
  | 'package'
  | 'lightbulb'
  | 'zap'
  | 'droplets'
  | 'paintbrush'
  | 'utensils-crossed'
  | 'sofa'
  | 'fan'
  | 'drill'
  | 'wrench'
  | 'cpu'
  | 'shirt'
  | 'sparkles'
  | 'blocks'
  | 'shield-check'
  | 'truck'
  | 'rotate-ccw'
  | 'headphones'
  | 'bolt';

export type NavLink = { readonly label: string; readonly href: string; readonly icon: IconName };

/**
 * Category navigation. `handle` is the Shopify collection handle this entry is
 * *expected* to map to — it is a proposal from the master prompt, not a verified
 * fact about the store. Every consumer must treat a missing collection as a
 * normal outcome and render an honest empty state (see `collectionStatus`).
 */
export type CategoryEntry = NavLink & {
  readonly handle: string;
  readonly blurb: string;
};

export const siteConfig = {
  name: 'HomeKart',
  descriptor: 'by Astafic',
  fullName: 'HomeKart by Astafic',
  shortDescription:
    'Home essentials and construction materials — tiles, sanitaryware, cement, steel, electrical, plumbing, paints, kitchen and furniture.',
  /**
   * Not a delivery promise. The reference artwork advertises 60-minute delivery;
   * that capability has not been implemented or verified, so the badge stays off
   * until the business confirms it and a pincode serviceability check exists.
   */
  deliveryPromise: {
    enabled: false,
    label: '60 Minute Delivery',
    note: 'Requires a configured express-delivery service and pincode serviceability check.',
  },
  currency: { code: 'INR', locale: 'en-IN' },
} as const;

export const primaryNav: readonly NavLink[] = [
  { label: 'Home', href: '/', icon: 'home' },
];

export const categories: readonly CategoryEntry[] = [
  { label: 'Building Materials', href: '/collections/building-materials', handle: 'building-materials', icon: 'package', blurb: 'Cement, sand, bricks, steel and adhesives.' },
  { label: 'Tiles & Bathroom', href: '/collections/tiles-bathroom', handle: 'tiles-bathroom', icon: 'layers', blurb: 'Floor and wall tiles, sanitaryware and fittings.' },
  { label: 'Electrical', href: '/collections/electrical', handle: 'electrical', icon: 'zap', blurb: 'Wires, switches, MCBs and distribution boards.' },
  { label: 'Plumbing', href: '/collections/plumbing', handle: 'plumbing', icon: 'droplets', blurb: 'Pipes, fittings, taps and valves.' },
  { label: 'Paints', href: '/collections/paints-waterproofing', handle: 'paints-waterproofing', icon: 'paintbrush', blurb: 'Interior, exterior and waterproofing coatings.' },
  { label: 'Kitchen & Appliances', href: '/collections/kitchen-appliances', handle: 'kitchen-appliances', icon: 'utensils-crossed', blurb: 'Chimneys, hobs, sinks and modular fittings.' },
  { label: 'Home & Living', href: '/collections/home-living', handle: 'home-living', icon: 'sparkles', blurb: 'Decor, storage and everyday home essentials.' },
  { label: 'Furniture', href: '/collections/furniture', handle: 'furniture', icon: 'sofa', blurb: 'Sofas, beds, tables and seating.' },
  { label: 'Lighting & Fans', href: '/collections/lighting-fans', handle: 'lighting-fans', icon: 'lightbulb', blurb: 'Ceiling lights, pendants, fans and drivers.' },
  { label: 'Tools & Hardware', href: '/collections/tools-hardware', handle: 'tools-hardware', icon: 'drill', blurb: 'Power tools, fasteners and hand tools.' },
];

/** Collapsed behind "More" on narrow desktop viewports. */
export const secondaryCategories: readonly CategoryEntry[] = [
  { label: 'Electronics', href: '/collections/electronics', handle: 'electronics', icon: 'cpu', blurb: 'Appliances and home electronics.' },
  { label: 'Fashion', href: '/collections/fashion', handle: 'fashion', icon: 'shirt', blurb: 'Apparel and accessories.' },
  { label: 'Hardware & Fasteners', href: '/collections/tools-hardware', handle: 'tools-hardware', icon: 'wrench', blurb: 'Fixings, adhesives and sealants.' },
  { label: 'Building Supplies', href: '/collections/building-materials', handle: 'building-materials', icon: 'blocks', blurb: 'Aggregates, blocks and site supplies.' },
];

export const allCategories = [...categories, ...secondaryCategories];

/**
 * Trust strip. Every entry is disabled until the business confirms it — the
 * master prompt forbids publishing claims that cannot be substantiated. Flip
 * `enabled` once each claim is true, or delete it.
 */
export type Benefit = {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly icon: IconName;
  readonly enabled: boolean;
  readonly requires: string;
};

export const benefits: readonly Benefit[] = [
  { id: 'delivery', title: 'Fast delivery', detail: 'On selected items', icon: 'truck', enabled: false, requires: 'A configured delivery SLA plus pincode serviceability checks.' },
  { id: 'range', title: 'Wide range', detail: 'Home & construction', icon: 'package', enabled: false, requires: 'Confirmed once the Shopify catalogue is populated and mapped.' },
  { id: 'payments', title: 'Secure payments', detail: 'Handled by Shopify Checkout', icon: 'shield-check', enabled: false, requires: 'Confirmed once a payment provider is enabled on the store.' },
  { id: 'returns', title: 'Easy returns', detail: 'Return window to be confirmed', icon: 'rotate-ccw', enabled: false, requires: 'A published returns policy on the Shopify store.' },
  { id: 'support', title: 'Support', detail: 'Contact channel to be confirmed', icon: 'headphones', enabled: false, requires: 'A real support channel and published hours.' },
];

export type PromoBanner = {
  readonly id: string;
  readonly title: string;
  readonly copy: string;
  readonly cta: string;
  readonly href: string;
  readonly handle: string;
  readonly tone: 'sand' | 'brand' | 'ink';
};

/** Promotional cards. No discount percentage is asserted — none is verified. */
export const promoBanners: readonly PromoBanner[] = [
  { id: 'tiles', title: 'Tiles & Bathroom Essentials', copy: 'Stylish tiles, sanitaryware and fittings for modern homes.', cta: 'Shop tiles', href: '/collections/tiles-bathroom', handle: 'tiles-bathroom', tone: 'sand' },
  { id: 'building', title: 'Building Materials', copy: 'Cement, sand, bricks and adhesives, right to your site.', cta: 'Order now', href: '/collections/building-materials', handle: 'building-materials', tone: 'brand' },
  { id: 'kitchen', title: 'Kitchen & Appliances', copy: 'Chimneys, hobs, sinks and modular fittings.', cta: 'Shop kitchen', href: '/collections/kitchen-appliances', handle: 'kitchen-appliances', tone: 'ink' },
];

export const featureBanners: readonly PromoBanner[] = [
  { id: 'dream-home', title: 'Build Your Dream Home', copy: 'Cement, steel, bricks, sand and more for every stage of the job.', cta: 'Shop construction', href: '/collections/building-materials', handle: 'building-materials', tone: 'ink' },
  { id: 'beautiful-home', title: 'Make Your Home Beautiful', copy: 'Lighting, furniture and decor for every room.', cta: 'Explore home & living', href: '/collections/home-living', handle: 'home-living', tone: 'sand' },
];

export const popularCollections: readonly { label: string; handle: string; href: string; icon: IconName }[] = [
  { label: 'Floor Tiles Collection', handle: 'floor-tiles', href: '/collections/floor-tiles', icon: 'layers' },
  { label: 'Bathroom Makeover', handle: 'bathroom-makeover', href: '/collections/bathroom-makeover', icon: 'droplets' },
  { label: 'Modular Kitchen', handle: 'modular-kitchen', href: '/collections/modular-kitchen', icon: 'utensils-crossed' },
  { label: 'Paints & Waterproofing', handle: 'paints-waterproofing', href: '/collections/paints-waterproofing', icon: 'paintbrush' },
  { label: 'Home Furniture', handle: 'furniture', href: '/collections/furniture', icon: 'sofa' },
  { label: 'Electrical Essentials', handle: 'electrical', href: '/collections/electrical', icon: 'zap' },
  { label: 'Plumbing Solutions', handle: 'plumbing', href: '/collections/plumbing', icon: 'wrench' },
  { label: 'Tools & Hardware', handle: 'tools-hardware', href: '/collections/tools-hardware', icon: 'drill' },
];

/** Search placeholder from the reference artwork. */
export const searchPlaceholder = 'Search for tiles, cement, lights, sofa, appliances…';
