/**
 * ProductsPage.jsx — All products browsing
 * URL params: ?category=veg-pickles  ?tag=bestseller  ?sort=-createdAt  ?page=1
 */
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getProductsAPI, getBestsellersAPI } from "../api/product.api";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/common/Pagination";
import { CATEGORIES, SORT_OPTIONS } from "../constants/constants_index";
import { useSEO, SITE_URL } from "../hooks/useSEO";

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const tag      = searchParams.get("tag") || "";
  const sort     = searchParams.get("sort") || "-createdAt";
  const page     = Math.max(1, Number(searchParams.get("page") || 1));

  const isBestsellers = tag === "bestseller";

  // ── SEO ──────────────────────────────────────────────────────────────────
  const categoryMeta = CATEGORIES.find((c) => c.value === category);
  const seoTitle = isBestsellers
    ? "Bestselling Andhra Pickles & Snacks — Top Rated Products"
    : categoryMeta
    ? `${categoryMeta.label} — Authentic Andhra Homemade ${categoryMeta.label}`
    : "Shop All Products — Andhra Pickles, Sweets, Snacks & Podis";

  const seoDesc = isBestsellers
    ? "Our top-rated bestselling Andhra homemade pickles, snacks and sweets. Loved by thousands of customers. Preservative-free, pan-India delivery."
    : categoryMeta
    ? `Buy authentic homemade Andhra ${categoryMeta.label.toLowerCase()} online. Traditionally prepared, preservative-free and delivered fresh. Pan-India shipping by Naidu Gari Ruchulu.`
    : "Explore our full range of authentic Andhra pickles, sweets, snacks and podis. Homemade with traditional recipes. No preservatives. Pan-India delivery.";

  useSEO({
    title: seoTitle,
    description: seoDesc,
    canonical: category ? `${SITE_URL}/products?category=${category}` : `${SITE_URL}/products`,
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Shop", url: "/products" },
      ...(categoryMeta ? [{ name: categoryMeta.label, url: `/products?category=${category}` }] : []),
    ],
  });

  // Scroll to top on every filter/page change (before paint)
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [searchParams.toString()]);

  const [products, setProducts] = useState([]);
  const [meta, setMeta]         = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const abortRef                = useRef(null);

  const updateParams = useCallback(
    (updates) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if ("category" in updates) next.delete("tag");
        if ("tag" in updates) next.delete("category");
        Object.entries(updates).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k));
        const isPageChange = Object.keys(updates).length === 1 && "page" in updates;
        if (!isPageChange) next.set("page", "1");
        return next;
      });
    },
    [setSearchParams],
  );

  const fetchProducts = useCallback(async () => {
    // Abort any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      if (isBestsellers) {
        const { data } = await getBestsellersAPI({ page, limit: PRODUCTS_PER_PAGE });
        setProducts(data.data?.products ?? []);
        setMeta(data.meta ?? { total: 0, pages: 1, page: 1 });
      } else {
        const params = { page, limit: PRODUCTS_PER_PAGE, sort };
        if (category) params.category = category;
        const { data } = await getProductsAPI(params);
        setProducts(data.data?.products ?? []);
        setMeta(data.meta ?? { total: 0, pages: 1, page: 1 });
      }
    } catch (err) {
      if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
        setError(err.response?.data?.message || "Failed to load products.");
      }
    } finally {
      setLoading(false);
    }
  }, [category, tag, sort, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchProducts();
    return () => abortRef.current?.abort();
  }, [fetchProducts]);

  const pageTitle = isBestsellers
    ? "Best Sellers"
    : category
    ? (CATEGORIES.find((c) => c.value === category)?.label ?? "Products")
    : "All Products";

  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">{pageTitle}</h1>
            {!loading && (
              <p className="font-body text-earth-500 text-sm mt-1" aria-live="polite">
                {meta.total} product{meta.total !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          {!isBestsellers && (
            <label className="sr-only" htmlFor="products-sort">Sort by</label>
          )}
          {!isBestsellers && (
            <select
              id="products-sort"
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="select-field text-sm py-2"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Category pills */}
        <CategoryPills
          activeCategory={category}
          isBestsellers={isBestsellers}
          onSelect={(cat) => cat === "bestseller" ? updateParams({ tag: "bestseller" }) : updateParams({ category: cat })}
          onClear={() => updateParams({ category: "", tag: "" })}
        />

        {/* Grid */}
        <ProductGrid products={products} loading={loading} error={error} />

        {/* Pagination */}
        <Pagination
          page={meta.page}
          pages={meta.pages}
          onPageChange={(p) => updateParams({ page: String(p) })}
        />
      </div>
    </div>
  );
};

// ── Category pill filter bar ──────────────────────────────────────────────────
const CategoryPills = ({ activeCategory, isBestsellers, onSelect, onClear }) => {
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
    <nav aria-label="Filter by category">
      <div className="flex flex-wrap gap-2 mb-6" role="list">
        {pills.map(({ label, value }) => (
          <button
            key={value}
            role="listitem"
            onClick={() => value === "all" ? onClear() : onSelect(value)}
            aria-pressed={getActive(value)}
            aria-label={`Filter: ${label}`}
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
    </nav>
  );
};

export default ProductsPage;
