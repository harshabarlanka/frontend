const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  }
  return (
    <div
      className={`rounded-full border-brand-200 border-t-brand-600 animate-spin ${sizes[size]} ${className}`}
    />
  )
}

export const PageLoader = () => (
  <div className="min-h-screen bg-earth-50 flex items-center justify-center">
    <div className="text-center">
      <div className="text-5xl mb-4 animate-bounce">🫙</div>
      <Loader size="lg" className="mx-auto" />
      <p className="mt-4 font-body text-earth-500 text-sm tracking-wide">Loading…</p>
    </div>
  </div>
)

export const SkeletonCard = () => (
  <div className="card p-4">
    <div className="shimmer rounded-xl mb-4 h-48 w-full" />
    <div className="shimmer rounded h-4 w-3/4 mb-2" />
    <div className="shimmer rounded h-3 w-1/2 mb-4" />
    <div className="shimmer rounded-lg h-10 w-full" />
  </div>
)

export const SkeletonList = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)

export const InlineLoader = ({ text = 'Loading…' }) => (
  <div className="flex items-center gap-3 py-8 justify-center">
    <Loader size="sm" />
    <span className="font-body text-earth-500 text-sm">{text}</span>
  </div>
)

export default Loader
