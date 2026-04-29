import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getProductsAPI, getBestsellersAPI } from "../api/product.api";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/common/Pagination";
import { CATEGORIES } from "../constants/constants_index";

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "createdAt", label: "Oldest" },
  { value: "minPrice", label: "Price: Low to High" },
  { value: "-minPrice", label: "Price: High to Low" },
  { value: "-ratings.average", label: "Top Rated" },
];

const ProductsPage = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isBestsellers = category === "bestsellers";
  const normalCategory = category && category !== "all" && !isBestsellers ? category : null;
  const sort = searchParams.get("sort") || "-createdAt";
  const page = Number(searchParams.get("page") || 1);

  const updateFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== "page") next.set("page", "1");
        return next;
      });
    },
    [setSearchParams],
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isBestsellers) {
        const { data } = await getBestsellersAPI({ page, limit: 12 });
        setProducts(data.data?.products ?? []);
        setMeta(data.meta ?? { total: 0, pages: 1, page: 1 });
      } else {
        const params = { page, limit: 12, sort };
        if (normalCategory) params.category = normalCategory;
        const { data } = await getProductsAPI(params);
        setProducts(data.data?.products ?? []);
        setMeta(data.meta ?? { total: 0, pages: 1, page: 1 });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [category, sort, page]); // eslint-disable-line

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categoryLabel = (() => {
    if (isBestsellers) return "Best Sellers";
    if (!category || category === "all") return "All Products";
    return CATEGORIES.find((c) => c.value === category)?.label || "All Products";
  })();

  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">{categoryLabel}</h1>
            {!loading && (
              <p className="font-body text-earth-500 text-sm mt-1">
                {meta.total} product{meta.total !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          {!isBestsellers && (
            <div>
              <select
                value={sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="select-field text-sm py-2"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <ProductGrid products={products} loading={loading} error={error} />

          <Pagination
            page={meta.page}
            pages={meta.pages}
            onPageChange={(p) => updateFilter("page", String(p))}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
