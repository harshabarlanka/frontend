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
      className="group overflow-hidden rounded-[24px] sm:rounded-[28px] border border-white/70 bg-white p-3 sm:p-4 
      shadow-[0_18px_55px_rgba(15,23,42,0.07)] 
      transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)]"
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-[18px] sm:rounded-[22px]">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full aspect-square sm:aspect-[1.02] object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="aspect-square flex items-center justify-center text-5xl bg-earth-50">
            🫙
          </div>
        )}

        {/* Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge */}
        <div className="absolute left-3 top-3 sm:left-4 sm:top-4 rounded-full bg-white/85 px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-earth-900 backdrop-blur-sm">
          {product.category}
        </div>

        {/* Hover CTA (VISIBLE ON MOBILE ALSO) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            navigate(`/product/${product.slug}`);
          }}
          className="absolute bottom-3 left-3 right-3 inline-flex items-center justify-center gap-2 rounded-full bg-earth-950 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg 
          opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300"
        >
          View Product
        </button>
      </div>

      {/* Content */}
      <div className="px-1 pb-1 pt-4 sm:pt-5">
        <h3 className="mt-2 line-clamp-2 text-base sm:text-xl font-semibold text-earth-950">
          {product.name}
        </h3>

        {product.ratings?.count > 0 && (
          <div className="mt-2">
            <StarRating
              rating={product.ratings.average}
              count={product.ratings.count}
              size="sm"
            />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2 sm:gap-3">
          <div>
            <p className="text-sm sm:text-lg font-semibold text-earth-950">
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
            className="inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-earth-200 bg-earth-50 text-earth-800 transition-all duration-300 hover:scale-105 hover:bg-earth-950 hover:text-white"
          >
            →
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
