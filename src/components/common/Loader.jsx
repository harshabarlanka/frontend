import { memo } from "react";

// ── Inline Spinner ────────────────────────────────────────────────────────────
const Loader = memo(({ size = "md", className = "" }) => {
  const sizes = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-2", lg: "h-12 w-12 border-[3px]" };
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`rounded-full border-brand-200 border-t-brand-600 animate-spin ${sizes[size]} ${className}`}
    />
  );
});
Loader.displayName = "Loader";

// ── Full-page loader (route Suspense fallback) ────────────────────────────────
export const PageLoader = memo(() => (
  <div
    className="fixed inset-0 z-50 bg-white flex items-center justify-center"
    role="status"
    aria-live="polite"
    aria-label="Loading page"
  >
    <div className="text-center">
      <div className="text-5xl mb-4 animate-bounce" aria-hidden="true">🫙</div>
      <Loader size="lg" className="mx-auto" />
      <p className="mt-4 font-body text-earth-500 text-sm tracking-wide">Loading…</p>
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
  <div className="flex items-center gap-3 py-8 justify-center" role="status" aria-live="polite">
    <Loader size="sm" />
    <span className="font-body text-earth-500 text-sm">{text}</span>
  </div>
));
InlineLoader.displayName = "InlineLoader";

export default Loader;
