/**
 * imageTransform.js
 * Cloudinary URL transformation helpers — WebP/AVIF auto-format, responsive sizing.
 */

// ── Transform presets ─────────────────────────────────────────────────────────
const TRANSFORMS = {
  /** Product card thumbnail: 400×400, auto-format (AVIF/WebP), auto quality, sharp */
  card:     "c_fill,w_400,h_400,g_auto,f_auto,q_auto:good,e_sharpen:40",

  /** Card on mobile: 240×240 */
  cardSm:   "c_fill,w_240,h_240,g_auto,f_auto,q_auto:good",

  /** Full-size product detail hero: 800×800 */
  detail:   "c_fill,w_800,h_800,g_auto,f_auto,q_auto:best",

  /** Thumbnail strip (gallery row): 120×120 */
  thumb:    "c_fill,w_120,h_120,g_auto,f_auto,q_auto:eco",

  /** Open Graph / social share image: 1200×630 */
  og:       "c_fill,w_1200,h_630,g_auto,f_auto,q_auto:good",

  /** Combo card: 600×600 */
  combo:    "c_fill,w_600,h_600,g_auto,f_auto,q_auto:good",

  /** Legacy default — kept for backward-compat */
  legacy:   "c_crop,w_920,h_920,g_south_west,x_20,f_auto,q_auto",
};

// ── Core helper ───────────────────────────────────────────────────────────────
function applyTransform(url, transform) {
  if (!url) return "";
  const segment = `/upload/${transform}/`;
  if (url.includes(segment)) return url;          // already applied
  if (!url.includes("/upload/")) return url;       // not a Cloudinary URL
  return url.replace("/upload/", segment);
}

// ── Public API ────────────────────────────────────────────────────────────────
/** Default: 400×400 WebP/AVIF product card */
export const transformImage       = (url) => applyTransform(url, TRANSFORMS.card);

/** 800×800 for product detail hero */
export const transformImageDetail = (url) => applyTransform(url, TRANSFORMS.detail);

/** 1200×630 for Open Graph / social */
export const transformImageOG     = (url) => applyTransform(url, TRANSFORMS.og);

/** 120×120 thumbnail strip */
export const transformImageThumb  = (url) => applyTransform(url, TRANSFORMS.thumb);

/** 600×600 combo card */
export const transformImageCombo  = (url) => applyTransform(url, TRANSFORMS.combo);

/** Legacy alias */
export const transformImageLegacy = (url) => applyTransform(url, TRANSFORMS.legacy);

/**
 * Produce a srcset string for responsive images.
 * Widths default to [240, 400, 600, 800].
 *
 * @param {string} url - Cloudinary upload URL
 * @param {number[]} widths
 * @returns {string} value for <img srcset="...">
 */
export function buildSrcSet(url, widths = [240, 400, 600, 800]) {
  if (!url || !url.includes("/upload/")) return "";
  return widths
    .map((w) => {
      const t = `c_fill,w_${w},h_${w},g_auto,f_auto,q_auto:good`;
      return `${applyTransform(url, t)} ${w}w`;
    })
    .join(", ");
}

/**
 * Build sizes attribute for product card images.
 * Cards occupy ~50vw on mobile and ~25vw on desktop (4-col grid).
 */
export const CARD_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

/** Detail image: full width on mobile, 50vw on desktop */
export const DETAIL_SIZES = "(max-width: 768px) 100vw, 50vw";
