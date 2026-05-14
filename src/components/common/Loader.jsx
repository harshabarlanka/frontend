import { memo } from "react";

// ── Full-page loader (route Suspense fallback) ────────────────────────────────
export const PageLoader = memo(() => (
  <div
    className="fixed inset-0 z-50 bg-white flex items-center justify-center"
    role="status"
    aria-live="polite"
    aria-label="Loading page"
  >
    <div className="text-center">
      <p className="font-body text-earth-500 tracking-wide text-lg"></p>
    </div>
  </div>
));
PageLoader.displayName = "PageLoader";

// ── Product card skeleton ─────────────────────────────────────────────────────
export const SkeletonCard = memo(() => (
  <div className="card p-4" aria-hidden="true">
    <div className="shimmer rounded-xl mb-4 h-48 w-full" />
    <div className="shimmer rounded h-4 w-3/4 mb-2" />
    <div className="shimmer rounded h-3 w-1/2 mb-4" />
    <div className="shimmer rounded-lg h-10 w-full" />
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

// ── Skeleton grid (used by ProductGrid on first load) ─────────────────────────
export const SkeletonList = memo(({ count = 6 }) => (
  <div
    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    role="status"
    aria-label={`Loading ${count} products`}
    aria-live="polite"
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
));
SkeletonList.displayName = "SkeletonList";

// ── Inline loader (sections, buttons) ────────────────────────────────────────
export const InlineLoader = memo(({ text = "Loading…" }) => (
  <div
    className="flex items-center py-8 justify-center"
    role="status"
    aria-live="polite"
  >
    <span className="font-body text-earth-500 text-sm">{text}</span>
  </div>
));
InlineLoader.displayName = "InlineLoader";

// ── Default export for existing LoginPage import ─────────────────────────────
export default InlineLoader;
