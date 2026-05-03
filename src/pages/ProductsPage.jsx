/**
 * ProductsPage.jsx
 *
 * Single page for ALL product browsing.
 * Reads every filter exclusively from URL query params via useSearchParams.
 *
 * Supported params:
 *   ?category=veg-pickles        → category filter
 *   ?tag=bestseller              → show bestsellers (uses separate API)
 *   ?sort=-createdAt             → sort order (default: -createdAt)
 *   ?page=1                      → current page  (default: 1)
 *
 * Combined examples:
 *   /products?category=veg-pickles&sort=minPrice&page=2
 *   /products?tag=bestseller
 *   /products?sort=-ratings.average
 */

import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getProductsAPI, getBestsellersAPI } from "../api/product.api";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/common/Pagination";
import { CATEGORIES, SORT_OPTIONS } from "../constants/constants_index";

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
  // ── URL state (single source of truth) ─────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || ""; // e.g. "veg-pickles"
  const tag = searchParams.get("tag") || ""; // e.g. "bestseller"
  const sort = searchParams.get("sort") || "-createdAt";
  const page = Math.max(1, Number(searchParams.get("page") || 1));

  const isBestsellers = tag === "bestseller";

  // ── Scroll to top on every filter / page / category change ─────────────────
  // useLayoutEffect fires before paint so the user never sees a mid-page flash.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [searchParams.toString()]);

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Filter updater ──────────────────────────────────────────────────────────
  /**
   * Update one or more query params atomically.
   * Any filter change besides "page" resets page to 1.
   *
   * Usage:
   *   updateParams({ sort: "minPrice" })
   *   updateParams({ category: "veg-pickles" })
   *   updateParams({ page: "3" })
   *   updateParams({ tag: "bestseller" })        — clears category
   *   updateParams({ category: "veg-pickles" })  — clears tag
   */
  const updateParams = useCallback(
    (updates) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        // If switching to category, clear tag and vice-versa (they're mutually exclusive)
        if ("category" in updates) next.delete("tag");
        if ("tag" in updates) next.delete("category");

        Object.entries(updates).forEach(([key, value]) => {
          if (value) next.set(key, value);
          else next.delete(key);
        });

        // Any filter change (not page itself) resets pagination
        const isPageChange =
          Object.keys(updates).length === 1 && "page" in updates;
        if (!isPageChange) next.set("page", "1");

        return next;
      });
    },
    [setSearchParams],
  );

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isBestsellers) {
        // Bestsellers come from a dedicated endpoint (sorted by order count + rating)
        const { data } = await getBestsellersAPI({
          page,
          limit: PRODUCTS_PER_PAGE,
        });
        setProducts(data.data?.products ?? []);
        setMeta(data.meta ?? { total: 0, pages: 1, page: 1 });
      } else {
        // Standard products endpoint — supports category, sort, page
        const params = { page, limit: PRODUCTS_PER_PAGE, sort };
        if (category) params.category = category;
        const { data } = await getProductsAPI(params);
        setProducts(data.data?.products ?? []);
        setMeta(data.meta ?? { total: 0, pages: 1, page: 1 });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [category, tag, sort, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Derived page title ──────────────────────────────────────────────────────
  const pageTitle = (() => {
    if (isBestsellers) return "Best Sellers";
    if (category)
      return CATEGORIES.find((c) => c.value === category)?.label ?? "Products";
    return "All Products";
  })();

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container">
        {/* ── Header row: title + sort ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">{pageTitle}</h1>
            {!loading && (
              <p className="font-body text-earth-500 text-sm mt-1">
                {meta.total} product{meta.total !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          {/* Sort — hidden for bestsellers (they have their own fixed order) */}
          {!isBestsellers && (
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="select-field text-sm py-2"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ── Category pills (optional quick-filter bar) ── */}
        <CategoryPills
          activeCategory={category}
          isBestsellers={isBestsellers}
          onSelect={(cat) => {
            if (cat === "bestseller") updateParams({ tag: "bestseller" });
            else updateParams({ category: cat });
          }}
          onClear={() => updateParams({ category: "", tag: "" })}
        />

        {/* ── Product grid ── */}
        <ProductGrid products={products} loading={loading} error={error} />

        {/* ── Pagination ── */}
        <Pagination
          page={meta.page}
          pages={meta.pages}
          onPageChange={(p) => updateParams({ page: String(p) })}
        />
      </div>
    </div>
  );
};

// ── Category pill filter bar ─────────────────────────────────────────────────

const CategoryPills = ({
  activeCategory,
  isBestsellers,
  onSelect,
  onClear,
}) => {
  const pills = [
    { label: "All", value: "all" },
    { label: "Best Sellers", value: "bestseller" },
    ...CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
  ];

  const getActive = (value) => {
    if (value === "all") return !activeCategory && !isBestsellers;
    if (value === "bestseller") return isBestsellers;
    return activeCategory === value;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {pills.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => (value === "all" ? onClear() : onSelect(value))}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
            getActive(value)
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-white text-earth-700 border-earth-200 hover:border-brand-400 hover:text-brand-600"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ProductsPage;
