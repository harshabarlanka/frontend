import { useState, useEffect } from "react";
import { getRecommendationsAPI } from "../../api/product.api";
import ProductCard from "./ProductCard";

/**
 * YouMayAlsoLike
 *
 * Props:
 *   excludeIds  – array of product _id strings to exclude (current product / cart items)
 */
const YouMayAlsoLike = ({ excludeIds = [] }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const { data } = await getRecommendationsAPI(excludeIds);
        if (!cancelled) {
          setProducts(data?.data?.products ?? []);
        }
      } catch {
        // silently hide section on error
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // Re-fetch only when the stringified ids list changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludeIds.join(",")]);

  if (loading) {
    return (
      <section className="mt-12 overflow-hidden">
        <h2 className="section-title mb-6">You May Also Like</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-52 sm:w-60 rounded-[28px] bg-earth-100 animate-pulse aspect-[0.85]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="mt-12 overflow-hidden">
      <h2 className="section-title mb-6">You May Also Like</h2>
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
        {products.map((product) => (
          <div key={product._id} className="shrink-0 w-52 sm:w-60">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default YouMayAlsoLike;
