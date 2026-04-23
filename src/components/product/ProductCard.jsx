import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import StarRating from "../common/StarRating";
import { formatPrice, getErrorMessage } from "../../utils";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const variant = product.variants?.length
    ? product.variants.reduce((min, v) => (v.price < min.price ? v : min))
    : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!variant) return;

    try {
      setAdding(true);
      await addToCart(product._id, variant._id, 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="card group flex flex-col hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-earth-50 rounded-t-xl aspect-square">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">
            🫙
          </div>
        )}

        {/* Category */}
        <div className="absolute top-3 right-3">
          <span className="badge bg-white/90 text-earth-700 capitalize">
            {product.category}
          </span>
        </div>

        {/* Out of stock */}
        {variant && variant.stock === 0 && (
          <div className="absolute inset-0 bg-earth-900/50 flex items-center justify-center rounded-t-xl">
            <span className="badge bg-white text-earth-800 text-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3 className="font-display font-bold text-earth-900 text-base leading-snug group-hover:text-brand-700 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {product.ratings?.count > 0 && (
            <div className="mt-1.5">
              <StarRating
                rating={product.ratings.average}
                count={product.ratings.count}
                size="sm"
              />
            </div>
          )}
        </div>

        {/* Price + Button */}
        <div className="flex items-center justify-between gap-2">
          {/* ✅ PRICE SECTION */}
          <div className="flex items-center gap-2">
            {/* Selling Price (slightly bold & darker) */}
            <span className="text-sm text-earth-900 font-semibold">
              {formatPrice(variant?.price ?? 0)}
            </span>

            {/* MRP (light + strike) */}
            {variant?.mrp > variant?.price && (
              <span className="text-sm text-earth-400 line-through">
                {formatPrice(variant?.mrp)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || (variant && variant.stock === 0)}
            className="btn-primary text-xs py-2 px-3 rounded-md"
          >
            {adding ? "…" : variant?.stock === 0 ? "Sold Out" : "+ Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
