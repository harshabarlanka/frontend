import { useState, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import StarRating from "../common/StarRating";
import { getErrorMessage } from "../../utils";
import toast from "react-hot-toast";
import { transformImage, buildSrcSet, CARD_SIZES } from "../../utils/imageTransform";

const ProductCard = memo(({ product, priority = false }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const variant = product.variants?.length
    ? product.variants.reduce((min, v) => (v.price < min.price ? v : min))
    : null;

  const hasMultipleVariants = product.variants?.length > 1;
  const hasRatings = product.ratings?.count > 0;
  const imageUrl = product.images?.[0];

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
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

  const handleView = (e) => {
    e.preventDefault();
    navigate(`/product/${product.slug}`);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group overflow-hidden rounded-[26px] bg-white
        shadow-[0_14px_45px_rgba(15,23,42,0.06)]
        transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)]"
      aria-label={`${product.name} — From Rs. ${variant?.price ?? 0}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-[20px]">
        {/* Skeleton shown until image loads */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-gradient-to-r from-earth-200 via-earth-100 to-earth-200 animate-pulse" aria-hidden="true" />
        )}

        {imageUrl && !imgError ? (
          <img
            src={transformImage(imageUrl)}
            srcSet={buildSrcSet(imageUrl)}
            sizes={CARD_SIZES}
            alt={`${product.name} — Naidu Gari Ruchulu`}
            title={product.name}
            width="400"
            height="400"
            loading={priority ? "eager" : "lazy"}
            fetchpriority={priority ? "high" : undefined}
            decoding={priority ? "sync" : "async"}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
            className={`aspect-[1.1] sm:aspect-[1.02] w-full object-cover transition-all duration-700
              ${imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}
              group-hover:scale-105`}
          />
        ) : (
          <div className="aspect-[1.1] flex items-center justify-center text-6xl bg-earth-50" role="img" aria-label={product.name}>
            🫙
          </div>
        )}

        {/* Hover overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" aria-hidden="true" />

        {/* Category badge */}
        <div className="hidden sm:block absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-earth-900 backdrop-blur-sm">
          {product.category}
        </div>

        {/* Desktop hover buttons */}
        <div className="hidden sm:flex absolute bottom-3 left-3 right-3 gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
          <button
            onClick={handleView}
            className="flex-1 rounded-full bg-earth-950 py-2 text-xs font-semibold text-white"
            aria-label={`View ${product.name}`}
          >
            View
          </button>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="flex-1 rounded-full bg-brand-600 py-2 text-xs font-semibold text-white disabled:opacity-70"
            aria-label={`Add ${product.name} to cart`}
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pt-1.5 pb-2.5">
        <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#b4532a] leading-[1.2] line-clamp-2 min-h-[28px]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-[2px]">
          {hasRatings ? (
            <>
              <StarRating rating={product.ratings.average} size="sm" />
              <span className="text-[#b4532a] text-[11px] ml-1" aria-label={`${product.ratings.count} reviews`}>
                ({product.ratings.count})
              </span>
            </>
          ) : (
            <span className="text-[11px] text-earth-400">New</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-1">
          <div>
            <p className="text-[14px] sm:text-[15px] font-semibold text-[#b4532a]">
              {hasMultipleVariants ? "From Rs. " : "Rs. "}
              {(variant?.price ?? 0).toFixed(0)}
            </p>
            {variant?.mrp > variant?.price && (
              <p className="text-[10px] text-[#b4532a]/60 line-through">
                Rs. {variant.mrp?.toFixed(0)}
              </p>
            )}
          </div>

          <button
            onClick={handleView}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-earth-200 bg-earth-50 text-earth-800 transition-all duration-300 hover:bg-earth-950 hover:text-white"
            aria-label={`View details for ${product.name}`}
          >
            →
          </button>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
