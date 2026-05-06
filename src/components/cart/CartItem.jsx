import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatPrice, getErrorMessage } from "../../utils";
import { transformImage } from "../../utils/imageTransform";
import toast from "react-hot-toast";

// ── Combo cart item ───────────────────────────────────────────────────────────

const ComboCartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const [updating, setUpdating]   = useState(false);
  const [expanded, setExpanded]   = useState(false);

  const handleQtyChange = async (newQty) => {
    if (newQty < 1 || newQty > 20) return;
    try {
      setUpdating(true);
      await updateQuantity(item._id, newQty);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeItem(item._id);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="py-5 border-b border-earth-100 last:border-0 animate-fade-in">
      <div className="flex gap-4">
        {/* Image */}
        <div className="shrink-0">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-earth-50 border border-earth-100">
            {item.image ? (
              <img
                src={transformImage(item.image)}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-earth-900 text-sm leading-snug">
                  {item.name}
                </h4>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide bg-brand-100 text-brand-700 rounded-full px-2 py-0.5">
                  Bundle
                </span>
              </div>
              <p className="font-body text-xs text-earth-400 mt-0.5">
                Combo deal · {item.comboProducts?.length ?? 0} items
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="shrink-0 p-1 text-earth-400 hover:text-spice-600 transition-colors rounded"
              aria-label="Remove item"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between mt-3">
            {/* Qty controls */}
            <div className="flex items-center border border-earth-200 rounded-lg overflow-hidden">
              <button
                onClick={() => handleQtyChange(item.quantity - 1)}
                disabled={updating || item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center text-earth-600 hover:bg-earth-50 transition-colors disabled:opacity-40 font-body font-bold text-base"
              >
                −
              </button>
              <span className="w-8 h-8 flex items-center justify-center font-body font-bold text-sm text-earth-900 border-x border-earth-200">
                {updating ? "…" : item.quantity}
              </span>
              <button
                onClick={() => handleQtyChange(item.quantity + 1)}
                disabled={updating || item.quantity >= 20}
                className="w-8 h-8 flex items-center justify-center text-earth-600 hover:bg-earth-50 transition-colors disabled:opacity-40 font-body font-bold text-base"
              >
                +
              </button>
            </div>

            <span className="font-medium text-earth-800">
              ₹{item.price * item.quantity}
            </span>
          </div>

          {/* Expandable included products */}
          {item.comboProducts && item.comboProducts.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs text-brand-600 font-semibold flex items-center gap-1 hover:text-brand-800 transition-colors"
            >
              {expanded ? "▲ Hide" : "▼ Show"} included items
            </button>
          )}
        </div>
      </div>

      {/* Expanded products */}
      {expanded && item.comboProducts && item.comboProducts.length > 0 && (
        <div className="ml-24 mt-2 space-y-1">
          {item.comboProducts.map((cp, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-earth-500">
              <span className="text-brand-500">•</span>
              <span>{cp.name}</span>
              <span className="text-earth-400">×{cp.quantity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Product cart item (original, unchanged) ────────────────────────────────────

const ProductCartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const [updating, setUpdating] = useState(false);

  const handleQtyChange = async (newQty) => {
    if (newQty < 1 || newQty > 20) return;
    try {
      setUpdating(true);
      await updateQuantity(item._id, newQty);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeItem(item._id);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const productUrl = `/product/id/${item.productId}`;

  return (
    <div className="flex gap-4 py-5 border-b border-earth-100 last:border-0 animate-fade-in">
      {/* Image */}
      <Link to={productUrl} className="shrink-0">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-earth-50 border border-earth-100">
          {item.image ? (
            <img
              src={transformImage(item.image)}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">🫙</div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={productUrl}>
              <h4 className="font-display font-bold text-earth-900 text-sm leading-snug hover:text-brand-700 transition-colors line-clamp-2">
                {item.name}
              </h4>
            </Link>
            <p className="font-body text-xs text-earth-400 mt-0.5">{item.size}</p>
          </div>
          <button
            onClick={handleRemove}
            className="shrink-0 p-1 text-earth-400 hover:text-spice-600 transition-colors rounded"
            aria-label="Remove item"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Qty controls */}
          <div className="flex items-center border border-earth-200 rounded-lg overflow-hidden">
            <button
              onClick={() => handleQtyChange(item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-earth-600 hover:bg-earth-50 transition-colors disabled:opacity-40 font-body font-bold text-base"
            >
              −
            </button>
            <span className="w-8 h-8 flex items-center justify-center font-body font-bold text-sm text-earth-900 border-x border-earth-200">
              {updating ? "…" : item.quantity}
            </span>
            <button
              onClick={() => handleQtyChange(item.quantity + 1)}
              disabled={updating || item.quantity >= 20}
              className="w-8 h-8 flex items-center justify-center text-earth-600 hover:bg-earth-50 transition-colors disabled:opacity-40 font-body font-bold text-base"
            >
              +
            </button>
          </div>

          <span className="font-medium text-earth-800">₹{item.price * item.quantity}</span>
        </div>
      </div>
    </div>
  );
};

// ── Unified CartItem ──────────────────────────────────────────────────────────

const CartItem = ({ item }) => {
  if (item.itemType === "combo") return <ComboCartItem item={item} />;
  return <ProductCartItem item={item} />;
};

export default CartItem;
