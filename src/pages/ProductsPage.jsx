import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getProductsAPI } from "../api/product.api";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/common/Pagination";
import { CATEGORIES } from "../constants/constants_index";

const ProductsPage = () => {
  const { category } = useParams(); // ✅ SEO URL param
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Filters (clean)
  const filters = {
    category: category || null,
    featured: searchParams.get("featured"),
    sort: searchParams.get("sort") || "-createdAt",
    page: Number(searchParams.get("page") || 1),
  };

  // ✅ Update query params (only for sort & pagination)
  const updateFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (value) next.set(key, value);
      else next.delete(key);

      if (key !== "page") next.set("page", "1");

      return next;
    });
  };

  // ✅ Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: filters.page,
        limit: 12,
        sort: filters.sort,
      };

      if (filters.category) {
        params.category = filters.category;
      }

      if (filters.featured) {
        params.featured = filters.featured;
      }

      const { data } = await getProductsAPI(params);

      setProducts(data.data?.products ?? []);
      setMeta(data.meta ?? { total: 0, pages: 1, page: 1 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [category, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ✅ Dynamic category label
  const categoryLabel =
    CATEGORIES.find((c) => c.value === category)?.label || "All Products";

  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container py-8 pt-24">
        {/* ✅ Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">{categoryLabel}</h1>

            {!loading && (
              <p className="font-body text-earth-500 text-sm mt-1">
                {meta.total} product{meta.total !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          {/* ✅ Sort */}
          <div>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="select-field text-sm py-2"
            >
              <option value="-createdAt">Newest</option>
              <option value="createdAt">Oldest</option>
              <option value="minPrice">Price: Low to High</option>
              <option value="-minPrice">Price: High to Low</option>
              <option value="-ratings.average">Top Rated</option>
            </select>
          </div>
        </div>

        {/* ✅ Products */}
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
