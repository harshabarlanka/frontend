import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartItemComponent from "../components/cart/CartItem";
import EmptyState from "../components/common/EmptyState";
import { InlineLoader } from "../components/common/Loader";
import { formatPrice } from "../utils";

const SHIPPING_THRESHOLD = 999;

const CartPage = () => {
  const { user } = useAuth();
  const { cart, cartLoading, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart?.items ?? [];
  const shipping = cartTotal >= SHIPPING_THRESHOLD ? 0 : 60;
  const total = cartTotal + shipping;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <EmptyState
          emoji="🔒"
          title="Please log in"
          message="Sign in to view your cart and place orders."
          action={
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          }
        />
      </div>
    );
  }

  if (cartLoading)
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center">
        <InlineLoader text="Loading your cart…" />
      </div>
    );

  if (items.length === 0)
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center">
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          message="Looks like you haven't picked any jars yet. Let's fix that!"
          action={
            <Link to="/products" className="btn-primary">
              Browse Pickles
            </Link>
          }
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container">
        <div className="flex items-center justify-between mb-8">
          <h1 className="section-title">
            Your Cart{" "}
            <span className="text-earth-400 text-2xl font-body font-normal">
              ({items.length} item{items.length !== 1 ? "s" : ""})
            </span>
          </h1>
          <button
            onClick={() => {
              if (window.confirm("Clear entire cart?")) clearCart();
            }}
            className="btn-ghost text-sm text-spice-600 hover:bg-spice-50"
          >
            Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              {items.map((item) => (
                <CartItemComponent key={item._id} item={item} />
              ))}
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-5 font-body text-sm text-earth-500 hover:text-brand-700 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display font-bold text-earth-900 text-xl mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-body text-sm text-earth-700">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between font-body text-sm text-earth-700">
                  <span>Shipping</span>
                  <span
                    className={shipping === 0 ? "text-leaf-700 font-bold" : ""}
                  >
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="pt-3 border-t border-earth-100 flex justify-between">
                  <span className="text-sm font-medium text-earth-600">
                    Total
                  </span>
                  <span className="text-base font-semibold text-earth-800">
                    ₹{total}
                  </span>
                </div>
              </div>

              {/* Free shipping progress */}
              {cartTotal < SHIPPING_THRESHOLD && (
                <div className="mb-5 p-3 bg-brand-50 rounded-xl border border-brand-100">
                  <p className="font-body text-xs text-brand-700 mb-2">
                    Add {formatPrice(SHIPPING_THRESHOLD - cartTotal)} more for
                    free shipping!
                  </p>
                  <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (cartTotal / SHIPPING_THRESHOLD) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {cartTotal >= SHIPPING_THRESHOLD && (
                <div className="mb-5 p-3 bg-leaf-50 rounded-xl border border-leaf-100">
                  <p className="font-body text-xs text-leaf-700 font-bold">
                    🎉 You qualify for free shipping!
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate("/checkout")}
                className="btn-primary w-full text-base py-3.5"
              >
                Proceed to Checkout →
              </button>

              <div className="mt-4 flex items-center justify-center gap-4 text-earth-400">
                {["🔒 Secure", "📦 Packed well", "↩️ Easy returns"].map((t) => (
                  <span key={t} className="font-body text-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
