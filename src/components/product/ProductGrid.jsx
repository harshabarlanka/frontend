import { memo } from "react";
import ProductCard from "./ProductCard";
import { SkeletonList } from "../common/Loader";
import EmptyState from "../common/EmptyState";
import { Link } from "react-router-dom";

const ProductGrid = memo(({ products, loading, error }) => {
  // First load → skeleton
  if (loading && (!products || products.length === 0)) {
    return <SkeletonList count={6} />;
  }

  if (error) {
    return (
      <div className="text-center py-16" role="alert">
        <p className="font-body text-earth-500">{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
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
  }

  return (
    <div className="relative">
      <div
        className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 transition-opacity duration-300 ${
          loading ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
        role="list"
        aria-label="Products"
        aria-busy={loading}
      >
        {products.map((product, index) => (
          <div key={product._id} role="listitem">
            {/* priority=true for the first 4 cards (above fold) */}
            <ProductCard product={product} priority={index < 4} />
          </div>
        ))}
      </div>

      {/* Shimmer overlay while paginating (non-blocking) */}
      {loading && products.length > 0 && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl"
          aria-hidden="true"
        >
          <div className="w-full h-full shimmer opacity-40" />
        </div>
      )}
    </div>
  );
});

ProductGrid.displayName = "ProductGrid";
export default ProductGrid;
