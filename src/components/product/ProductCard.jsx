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
      to={`/product/${product.slug}`}
      className="group overflow-hidden rounded-[28px] border border-white/70 bg-white p-4 
      shadow-[0_18px_55px_rgba(15,23,42,0.07)] 
      transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)]"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-[22px]">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="aspect-[1.02] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="aspect-[1.02] flex items-center justify-center text-6xl bg-earth-50">
            🫙
          </div>
        )}

        {/* Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* ✅ Category Badge (smaller in mobile) */}
        <div
          className="
          absolute left-3 top-3 
          rounded-full bg-white/85 
          px-2 py-0.5 text-[9px]   /* mobile */
          sm:px-3 sm:py-1 sm:text-[11px]  /* desktop */
          font-semibold uppercase tracking-[0.14em] text-earth-900 backdrop-blur-sm
        "
        >
          {product.category}
        </div>

        {/* ❌ Hide CTA in mobile, show in desktop */}
        <button
          onClick={(e) => {
            e.preventDefault();
            navigate(`/product/${product.slug}`);
          }}
          className="
          hidden sm:flex   /* 👈 key change */
          absolute bottom-4 left-4 right-4 
          items-center justify-center gap-2 
          rounded-full bg-earth-950 px-4 py-3 
          text-sm font-semibold text-white 
          opacity-0 shadow-lg 
          transition-all duration-300 
          group-hover:opacity-100
        "
        >
          View Product
        </button>
      </div>

      {/* Content */}
      <div className="px-1 pb-1 pt-4">
        <h3 className="mt-1 line-clamp-2 text-base sm:text-xl font-semibold text-earth-950">
          {product.name}
        </h3>

        {product.ratings?.count > 0 && (
          <div className="mt-1 sm:mt-2">
            <StarRating
              rating={product.ratings.average}
              count={product.ratings.count}
              size="sm"
            />
          </div>
        )}

        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-base sm:text-lg font-semibold text-earth-950">
              {formatPrice(variant?.price ?? 0)}
            </p>

            {variant?.mrp > variant?.price && (
              <p className="text-xs sm:text-sm text-earth-400 line-through">
                {formatPrice(variant.mrp)}
              </p>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(`/product/${product.slug}`);
            }}
            className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-earth-200 bg-earth-50 text-earth-800 transition-all duration-300 hover:scale-105 hover:bg-earth-950 hover:text-white"
          >
            →
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
