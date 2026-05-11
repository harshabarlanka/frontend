/**
 * imageTransform.js
 * Cloudinary URL transformation helpers for SEO-friendly image delivery.
 * Uses f_auto (WebP/AVIF for supported browsers), q_auto (quality compression),
 * and size-specific transforms to minimise LCP and CLS.
 */

// ── Base transforms ───────────────────────────────────────────────────────────

/** Standard product card thumbnail: 400×400, auto format (WebP/AVIF), auto quality */
const CARD_TRANSFORM    = "c_fill,w_400,h_400,g_auto,f_auto,q_auto";

/** Full-size product detail image: 800×800 */
const DETAIL_TRANSFORM  = "c_fill,w_800,h_800,g_auto,f_auto,q_auto";

/** Open Graph / social share image: 1200×630 */
const OG_TRANSFORM      = "c_fill,w_1200,h_630,g_auto,f_auto,q_auto";

/** Thumbnail strip (gallery row): 120×120 */
const THUMB_TRANSFORM   = "c_fill,w_120,h_120,g_auto,f_auto,q_auto";

/** Legacy default — kept for backward-compat */
const LEGACY_TRANSFORM  = "c_crop,w_920,h_920,g_south_west,x_20,f_auto,q_auto";

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply a Cloudinary transform string to a Cloudinary upload URL.
 * - Returns "" for falsy input.
 * - Idempotent: does not double-apply the same segment.
 * - No-ops on non-Cloudinary / external URLs.
 *
 * @param {string} url       - Cloudinary upload URL
 * @param {string} transform - Cloudinary transformation string
 */
function applyTransform(url, transform) {
  if (!url) return "";
  const segment = `/upload/${transform}/`;
  if (url.includes(segment)) return url;           // already applied
  if (!url.includes("/upload/")) return url;        // not a Cloudinary URL
  return url.replace("/upload/", segment);
}

/**
 * Default transform used across the codebase.
 * Produces a 400×400 WebP/AVIF card image.
 */
export const transformImage = (url) => applyTransform(url, CARD_TRANSFORM);

/**
 * High-res transform for the product detail hero image (800×800).
 */
export const transformImageDetail = (url) => applyTransform(url, DETAIL_TRANSFORM);

/**
 * Social share / Open Graph image transform (1200×630).
 */
export const transformImageOG = (url) => applyTransform(url, OG_TRANSFORM);

/**
 * Tiny thumbnail strip transform (120×120).
 */
export const transformImageThumb = (url) => applyTransform(url, THUMB_TRANSFORM);

/**
 * Legacy alias — used by existing code that called transformImage with the old 920px transform.
 * Gradually replace with transformImage() or transformImageDetail() as needed.
 */
export const transformImageLegacy = (url) => applyTransform(url, LEGACY_TRANSFORM);
