import { useState, useEffect, useCallback } from "react";
import {
  getAdminProductsAPI,
  deleteProductAPI,
} from "../../api/admin/admin.api";
import { CATEGORIES } from "../../constants/constants_index";
import { formatPrice, getErrorMessage } from "../../utils";
import { InlineLoader } from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";
import ProductForm from "../../components/admin/ProductForm";
import toast from "react-hot-toast";
import { transformImage } from "../../utils/imageTransform";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // null = create mode

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { limit: 50 };
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await getAdminProductsAPI(params);
      setProducts(data.data.products);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search]);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const openCreate = () => {
    setEditProduct(null);
    setShowForm(true);
  };
  const openEdit = (p) => {
    setEditProduct(p);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  // Called by ProductForm on save
  const handleSaved = (savedProduct) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p._id === savedProduct._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedProduct;
        return next;
      }
      return [savedProduct, ...prev];
    });
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`))
      return;
    try {
      await deleteProductAPI(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      toast.success("Product deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field pl-9 w-52 py-2 text-sm"
              placeholder="Search products…"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400 text-sm">
              🔍
            </span>
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="btn-secondary text-sm py-2 px-4">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-earth-500">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={openCreate}
            className="btn-primary text-sm py-2 px-4"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* ── Category filter ───────────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-body text-xs font-bold transition-all ${
            categoryFilter === "all"
              ? "bg-earth-900 text-white"
              : "bg-white border border-earth-200 text-earth-600 hover:border-earth-400"
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategoryFilter(c.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-body text-xs font-bold
                       transition-all flex items-center gap-1 ${
                         categoryFilter === c.value
                           ? "bg-earth-900 text-white"
                           : "bg-white border border-earth-200 text-earth-600 hover:border-earth-400"
                       }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      {loading && <InlineLoader text="Loading products…" />}
      {!loading && error && (
        <ErrorState message={error} onRetry={fetchProducts} />
      )}

      {!loading && !error && products.length === 0 && (
        <EmptyState
          emoji="🫙"
          title="No products found"
          message="Try a different search or category, or add a new product."
          action={
            <button onClick={openCreate} className="btn-primary">
              + Add First Product
            </button>
          }
        />
      )}

      {!loading && !error && products.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-earth-200 bg-white">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-earth-200 bg-earth-50">
                {[
                  "Product",
                  "Category",
                  "Variants / Price",
                  "Stock",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-body text-xs font-bold
                               text-earth-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const minPrice = Math.min(
                  ...(product.variants?.map((v) => v.price) || [0]),
                );
                const totalStock =
                  product.variants?.reduce((s, v) => s + v.stock, 0) || 0;
                const isLowStock = totalStock <= 10;
                const catInfo = CATEGORIES.find(
                  (c) => c.value === product.category,
                );

                return (
                  <tr
                    key={product._id}
                    className="border-b border-earth-100 last:border-0 hover:bg-earth-50 transition-colors"
                  >
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg bg-earth-100 flex-shrink-0
                                        overflow-hidden flex items-center justify-center text-lg"
                        >
                          {product.images?.[0] ? (
                            <img
                              src={transformImage(product.images[0])}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "🫙"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-body text-sm font-bold text-earth-900 truncate max-w-[180px]">
                            {product.name}
                          </p>
                          {product.isFeatured && (
                            <span className="font-body text-xs text-brand-600 font-bold">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`badge text-xs ${catInfo?.color || "bg-earth-100 text-earth-700"}`}
                      >
                        {catInfo?.emoji} {catInfo?.label || product.category}
                      </span>
                    </td>

                    {/* Variants / Price */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-body text-sm font-bold text-earth-900">
                        {formatPrice(minPrice)}+
                      </p>
                      <p className="font-body text-xs text-earth-400">
                        {product.variants?.length} variant
                        {product.variants?.length !== 1 ? "s" : ""}
                      </p>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p
                        className={`font-body text-sm font-bold ${isLowStock ? "text-spice-600" : "text-earth-900"}`}
                      >
                        {totalStock} units
                      </p>
                      {isLowStock && (
                        <p className="font-body text-xs text-spice-500">
                          ⚠️ Low stock
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={product.isActive ? "success" : "danger"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold font-body
                                     bg-blue-50 text-blue-700 border border-blue-200
                                     hover:bg-blue-100 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold font-body
                                     bg-spice-50 text-spice-700 border border-spice-200
                                     hover:bg-spice-100 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product form modal */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={closeForm}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default AdminProducts;
