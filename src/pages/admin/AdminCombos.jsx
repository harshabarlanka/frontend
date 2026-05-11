import { useState, useEffect, useCallback } from "react";
import { getAdminCombosAPI, createComboAPI, updateComboAPI, deleteComboAPI } from "../../api/admin/admin.api";
import { getAdminProductsAPI } from "../../api/admin/admin.api";
import { transformImage } from "../../utils/imageTransform";
import { getErrorMessage } from "../../utils";
import toast from "react-hot-toast";
import { useSEO } from "../../hooks/useSEO";

// ── Helpers ───────────────────────────────────────────────────────────────────

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  images: [],
  products: [], // [{ product: id, quantity: 1, _name: "" }]
};

// ── Product Search Picker ─────────────────────────────────────────────────────

const ProductPicker = ({ selected, onChange }) => {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    try {
      setLoading(true);
      const { data } = await getAdminProductsAPI({ search: q, limit: 10 });
      setResults(data?.data?.products ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 350);
    return () => clearTimeout(timer);
  }, [query, search]);

  const addProduct = (product) => {
    if (selected.find((s) => s.product === product._id)) return;
    onChange([...selected, { product: product._id, quantity: 1, _name: product.name, _image: product.images?.[0] }]);
    setQuery("");
    setResults([]);
  };

  const removeProduct = (productId) => {
    onChange(selected.filter((s) => s.product !== productId));
  };

  const updateQty = (productId, qty) => {
    onChange(selected.map((s) => s.product === productId ? { ...s, quantity: Math.max(1, Number(qty)) } : s));
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products to add..."
          className="w-full border border-earth-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {loading && (
          <div className="absolute right-3 top-3 text-earth-400 text-xs">...</div>
        )}
        {results.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-earth-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
            {results.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => addProduct(p)}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-earth-50 text-left text-sm"
              >
                {p.images?.[0] ? (
                  <img src={transformImage(p.images[0])} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                ) : (
                  <span className="text-xl">🫙</span>
                )}
                <span className="truncate text-earth-900">{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected products */}
      {selected.length > 0 && (
        <div className="space-y-2">
          {selected.map((entry) => (
            <div key={entry.product} className="flex items-center gap-3 p-3 bg-earth-50 rounded-xl border border-earth-100">
              {entry._image ? (
                <img src={transformImage(entry._image)} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
              ) : (
                <span className="text-xl">🫙</span>
              )}
              <span className="flex-1 text-sm font-medium text-earth-900 truncate">{entry._name || entry.product}</span>
              <div className="flex items-center gap-1 shrink-0">
                <label className="text-xs text-earth-500">Qty:</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={entry.quantity}
                  onChange={(e) => updateQty(entry.product, e.target.value)}
                  className="w-14 border border-earth-200 rounded-lg text-center text-sm px-1 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeProduct(entry.product)}
                className="text-spice-500 hover:text-spice-700 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Combo Form Modal ──────────────────────────────────────────────────────────

const ComboFormModal = ({ initial, onClose, onSaved }) => {
  const isEdit = Boolean(initial?._id);
  const [form, setForm]       = useState(() => {
    if (!initial) return emptyForm;
    return {
      name: initial.name || "",
      description: initial.description || "",
      price: initial.price?.toString() || "",
      category: initial.category || "",
      images: initial.images || [],
      products: (initial.products || []).map((e) => ({
        product: e.product?._id || e.product,
        quantity: e.quantity || 1,
        _name: e.product?.name || "",
        _image: e.product?.images?.[0] || "",
      })),
    };
  });
  const [saving, setSaving]   = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const field = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setForm((f) => ({ ...f, images: [...f.images, imageUrl.trim()] }));
    setImageUrl("");
  };

  const removeImage = (i) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required."); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("Valid price required."); return; }
    if (form.products.length === 0) { toast.error("Add at least one product."); return; }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      images: form.images,
      products: form.products.map((e) => ({ product: e.product, quantity: e.quantity })),
    };

    try {
      setSaving(true);
      if (isEdit) {
        await updateComboAPI(initial._id, payload);
        toast.success("Combo updated!");
      } else {
        await createComboAPI(payload);
        toast.success("Combo created!");
      }
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-earth-100">
          <h2 className="text-lg font-display font-bold text-earth-900">
            {isEdit ? "Edit Combo" : "Create Combo"}
          </h2>
          <button onClick={onClose} className="text-earth-400 hover:text-earth-700 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => field("name")(e.target.value)}
              className="w-full border border-earth-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. Family Pickle Bundle"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => field("description")(e.target.value)}
              rows={2}
              className="w-full border border-earth-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="Brief description of the combo..."
            />
          </div>

          {/* Products */}
          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-2">Products * <span className="text-earth-400 font-normal">(search & add)</span></label>
            <ProductPicker
              selected={form.products}
              onChange={field("products")}
            />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1">Combo Price (₹) *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => field("price")(e.target.value)}
                className="w-full border border-earth-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. 499"
                required
              />
              <p className="text-xs text-earth-400 mt-1">Original price is auto-calculated from products.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => field("category")(e.target.value)}
                className="w-full border border-earth-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. veg-pickles"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-2">Images (URLs)</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 border border-earth-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="https://res.cloudinary.com/..."
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
              />
              <button type="button" onClick={addImage} className="px-4 py-2.5 bg-earth-900 text-white rounded-lg text-sm font-semibold hover:bg-earth-700 transition-colors">
                Add
              </button>
            </div>
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={transformImage(img)} alt="" className="w-16 h-16 rounded-lg object-cover border border-earth-200" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-spice-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-earth-200 text-earth-700 font-semibold text-sm hover:bg-earth-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving..." : isEdit ? "Update Combo" : "Create Combo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main AdminCombos Page ─────────────────────────────────────────────────────

const AdminCombos = () => {
  useSEO({ noIndex: true });
  const [combos, setCombos]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null); // combo to edit

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getAdminCombosAPI();
      setCombos(data?.data?.combos ?? []);
    } catch {
      toast.error("Failed to load combos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (combo) => {
    if (!window.confirm(`Deactivate combo "${combo.name}"?`)) return;
    try {
      await deleteComboAPI(combo._id);
      toast.success("Combo deactivated.");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (c)  => { setEditing(c);   setModalOpen(true); };
  const closeModal = ()   => { setModalOpen(false); setEditing(null); };
  const onSaved    = ()   => { closeModal(); load(); };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-earth-900">Combos</h1>
          <p className="text-sm text-earth-500 mt-1">Create and manage bundle deals.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors"
        >
          + New Combo
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-earth-100 animate-pulse" />
          ))}
        </div>
      ) : combos.length === 0 ? (
        <div className="text-center py-24 text-earth-400">
          <p className="text-5xl mb-4">🎁</p>
          <p className="font-semibold text-lg">No combos yet</p>
          <p className="text-sm mt-1">Click "New Combo" to create your first bundle deal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {combos.map((combo) => {
            const image = combo.images?.[0] || combo.products?.[0]?.product?.images?.[0];
            const discount = combo.originalPrice > combo.price
              ? Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100)
              : 0;
            return (
              <div
                key={combo._id}
                className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${
                  !combo.isActive ? "opacity-50" : "border-earth-100"
                }`}
              >
                {/* Image */}
                <div className="aspect-[2/1] bg-earth-50 overflow-hidden">
                  {image ? (
                    <img src={transformImage(image)} alt={combo.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🎁</div>
                  )}
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1">
                  {!combo.isActive && (
                    <span className="bg-earth-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                  {discount > 0 && (
                    <span className="bg-spice-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-display font-bold text-earth-900 text-sm leading-tight truncate">{combo.name}</h3>
                  <p className="text-xs text-earth-400 mt-0.5">{combo.products?.length ?? 0} products</p>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-bold text-[#b4532a]">₹{combo.price}</span>
                    {combo.originalPrice > combo.price && (
                      <span className="text-xs text-earth-400 line-through">₹{combo.originalPrice}</span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEdit(combo)}
                      className="flex-1 py-2 rounded-lg bg-earth-50 border border-earth-200 text-earth-700 text-xs font-semibold hover:bg-earth-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(combo)}
                      className="flex-1 py-2 rounded-lg bg-spice-50 border border-spice-200 text-spice-700 text-xs font-semibold hover:bg-spice-100 transition-colors"
                    >
                      {combo.isActive ? "Deactivate" : "Deactivated"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <ComboFormModal
          initial={editing}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </div>
  );
};

export default AdminCombos;
