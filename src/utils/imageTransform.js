const CLOUDINARY_TRANSFORM =
  "c_crop,w_920,h_920,g_south_west,x_20,f_auto,q_auto";

const TRANSFORM_SEGMENT = `/upload/${CLOUDINARY_TRANSFORM}/`;

/**
 * Applies a Cloudinary crop/optimise transform to a Cloudinary upload URL.
 *
 * Rules:
 *  - Returns "" for falsy input.
 *  - No-ops if the transform is already present (idempotent).
 *  - No-ops for non-Cloudinary / external URLs (no "/upload/" segment).
 */
export const transformImage = (url) => {
  if (!url) return "";

  // Already transformed – avoid doubling up the segment
  if (url.includes(TRANSFORM_SEGMENT)) return url;

  // Only transform Cloudinary delivery URLs that contain "/upload/"
  if (!url.includes("/upload/")) return url;

  return url.replace("/upload/", TRANSFORM_SEGMENT);
};