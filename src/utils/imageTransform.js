/**
 * imageTransform.js
 * Cloudinary URL transformation helpers — preserves RIGHT side exactly,
 * crops only from LEFT side like your reference URL.
 */

// ── Transform presets ─────────────────────────────────────────────────────────
const TRANSFORMS = {
  /**
   * Product card thumbnail
   * Keeps RIGHT side intact
   * Crops only LEFT overflow
   */
  card: "c_fill,w_800,h_800,x_0,y_0,g_south_west/c_crop,w_680,h_800/f_auto,q_auto:good",

  /** Mobile card */
  cardSm:
    "c_fill,w_240,h_240,x_0,y_0,g_south_west/c_crop,w_204,h_240/f_auto,q_auto:good",

  /** Product detail hero */
  detail:
    "c_fill,w_800,h_800,x_0,y_0,g_south_west/c_crop,w_680,h_800/f_auto,q_auto:best",

  /** Thumbnail strip */
  thumb:
    "c_fill,w_120,h_120,x_0,y_0,g_south_west/c_crop,w_102,h_120/f_auto,q_auto:eco",

  /** Open Graph / social */
  og: "c_fill,w_1200,h_630,x_0,y_0,g_south_west/c_crop,w_1020,h_630/f_auto,q_auto:good",

  /** Combo card */
  combo:
    "c_fill,w_600,h_600,x_0,y_0,g_south_west/c_crop,w_510,h_600/f_auto,q_auto:good",

  /** Legacy */
  legacy:
    "c_fill,w_800,h_800,x_0,y_0,g_south_west/c_crop,w_680,h_800/f_auto,q_auto",
};

// ── Core helper ───────────────────────────────────────────────────────────────
function applyTransform(url, transform) {
  if (!url) return "";

  const segment = `/upload/${transform}/`;

  // Already transformed
  if (url.includes(segment)) return url;

  // Not Cloudinary
  if (!url.includes("/upload/")) return url;

  return url.replace("/upload/", segment);
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Product card image */
export const transformImage = (url) => applyTransform(url, TRANSFORMS.card);

/** Product detail hero */
export const transformImageDetail = (url) =>
  applyTransform(url, TRANSFORMS.detail);

/** Open Graph image */
export const transformImageOG = (url) => applyTransform(url, TRANSFORMS.og);

/** Gallery thumbnail */
export const transformImageThumb = (url) =>
  applyTransform(url, TRANSFORMS.thumb);

/** Combo card */
export const transformImageCombo = (url) =>
  applyTransform(url, TRANSFORMS.combo);

/** Legacy alias */
export const transformImageLegacy = (url) =>
  applyTransform(url, TRANSFORMS.legacy);

/**
 * Responsive srcset
 */
export function buildSrcSet(url, widths = [240, 400, 600, 800]) {
  if (!url || !url.includes("/upload/")) return "";

  return widths
    .map((w) => {
      const cropWidth = Math.round(w * 0.85);

      const t =
        `c_fill,w_${w},h_${w},x_0,y_0,g_south_west/` +
        `c_crop,w_${cropWidth},h_${w}/f_auto,q_auto:good`;

      return `${applyTransform(url, t)} ${w}w`;
    })
    .join(", ");
}

// ── Responsive sizes ──────────────────────────────────────────────────────────

/** Product cards */
export const CARD_SIZES =
  "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

/** Product detail */
export const DETAIL_SIZES = "(max-width: 768px) 100vw, 50vw";
