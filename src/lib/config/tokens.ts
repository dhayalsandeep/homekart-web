/**
 * Design tokens. Colour values are measured, not assumed:
 *  - brand-500 is the dominant coral sampled from the official logo PNG (#D36946, 1,486+ px cluster)
 *  - ink is the charcoal sampled from the same logo (#292929)
 *  - brand-action is a darkened variation used wherever coral would fail contrast,
 *    because brand-500 measures only 3.57:1 on white (large text / UI only).
 */
export const colors = {
  brand50: '#FDF3EE',
  brand100: '#F8DED1',
  brand200: '#F0BCA3',
  brand400: '#DE8058',
  brand500: '#D36946',
  brand600: '#B4441F',
  brand700: '#93371A',
  ink: '#292929',
  inkSoft: '#756B64',
  warmWhite: '#FFF8F1',
  cream: '#F7EFE6',
  sand: '#EAD8C8',
  border: '#E9DED4',
  white: '#FFFFFF',
  success: '#0F6B3C',
  successBg: '#DFF5E8',
  danger: '#9B1C1C',
} as const;

/**
 * Measured contrast ratios (WCAG 2.1 relative luminance) against the surfaces we ship.
 * Kept here so a reviewer can check the accessibility claims in the README.
 */
export const contrast = {
  inkOnWhite: 14.55,
  inkOnCream: 12.78,
  inkSoftOnWhite: 5.19,
  inkSoftOnCream: 4.56,
  brandActionOnWhite: 5.54,
  whiteOnBrandAction: 5.54,
  brand500OnWhite: 3.57,
} as const;

export const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 } as const;

export const breakpoints = { sm: 480, md: 768, lg: 1024, xl: 1280 } as const;

/** Official logo geometry, measured from public/brand/homekart-logo.png. */
export const logo = {
  src: '/brand/homekart-logo.png',
  canvasWidth: 2170,
  canvasHeight: 725,
  canvasAspect: 2170 / 725,
  /** Transparent padding baked into the supplied file: L82 R99 T130 B118. */
  contentBox: { left: 82, top: 130, right: 2071, bottom: 607 } as const,
  contentAspect: (2071 - 82) / (607 - 130),
  /** Visible mark occupies this fraction of the canvas, so CSS height must be scaled up. */
  verticalFill: (607 - 130) / 725,
  alt: 'HomeKart by Astafic',
} as const;
