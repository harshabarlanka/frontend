import ProductCard from "./ProductCard";
import { SkeletonList } from "../common/Loader";
import EmptyState from "../common/EmptyState";
import { Link } from "react-router-dom";

const ProductGrid = ({ products, loading, error }) => {
  // ✅ First load → show skeleton
  if (loading && (!products || products.length === 0)) {
    return <SkeletonList count={6} />;
  }

  if (error)
    return (
      <div className="text-center py-16">
        <p className="font-body text-earth-500">{error}</p>
      </div>
    );

  if (!products || products.length === 0)
    return (
      <EmptyState
        emoji="🫙"
        title="No pickles found"
        message="Try adjusting your filters — our jars are full, just a different flavour!"
        action={
          <Link to="/products" className="btn-primary">
            View All Pickles
          </Link>
        }
      />
    );

  return (
    <div className="relative">
      {/* ✅ Product grid */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 transition-all duration-300 ${
          loading ? "opacity-70" : "opacity-100"
        }`}
      >
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* ✅ Shimmer overlay instead of spinner */}
      {loading && products.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.2s_infinite]" />
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
