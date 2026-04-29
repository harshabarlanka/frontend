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

  const hasMultipleVariants = product.variants?.length > 1;
  const hasRatings = product.ratings?.count > 0;

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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="hidden sm:block absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-earth-900 backdrop-blur-sm">
          {product.category}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            navigate(`/product/${product.slug}`);
          }}
          className="hidden sm:flex absolute bottom-4 left-4 right-4 items-center justify-center gap-2 rounded-full bg-earth-950 px-4 py-3 text-sm font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100"
        >
          View Product
        </button>
      </div>

      {/* Content */}
      <div className="px-1 pb-1 pt-3 space-y-1.5">
        <h3 className="text-[15px] sm:text-[16px] font-medium tracking-[0.05em] text-[#b4532a] leading-tight line-clamp-2 min-h-[36px] sm:min-h-[40px]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1">
          {hasRatings ? (
            <>
              <StarRating rating={product.ratings.average} size="sm" />
              <span className="ml-1 text-[#b4532a] text-[12px]">
                ({product.ratings.count})
              </span>
            </>
          ) : (
            <span className="text-[12px] text-earth-400">New</span>
          )}
        </div>

        {/* Price */}
        <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3">
          <div className="mt-2">
            <p className="text-sm sm:text-base font-semibold text-[#b4532a]">
              {hasMultipleVariants ? "From Rs. " : "Rs. "}
              {(variant?.price ?? 0).toFixed(2)}
            </p>

            {variant?.mrp > variant?.price && (
              <p className="text-xs text-[#b4532a]/60 line-through">
                Rs. {variant.mrp?.toFixed(2)}
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
