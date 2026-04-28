import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatPrice, getErrorMessage } from "../../utils";
import toast from "react-hot-toast";

const CartItem = ({ item }) => {
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

  return (
    <div className="flex gap-4 py-5 border-b border-earth-100 last:border-0 animate-fade-in">
      {/* Image */}
      <Link to={`/products/${item.productId}`} className="shrink-0">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-earth-50 border border-earth-100">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              🫙
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/products/${item.productId}`}>
              <h4 className="font-display font-bold text-earth-900 text-sm leading-snug hover:text-brand-700 transition-colors line-clamp-2">
                {item.name}
              </h4>
            </Link>
            <p className="font-body text-xs text-earth-400 mt-0.5">
              {item.size}
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="shrink-0 p-1 text-earth-400 hover:text-spice-600 transition-colors rounded"
            aria-label="Remove item"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
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
      </div>
    </div>
  );
};

export default CartItem;
