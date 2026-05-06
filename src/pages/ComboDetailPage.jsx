import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getComboBySlugAPI } from "../api/combo.api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils";
import { transformImage } from "../utils/imageTransform";
import { PageLoader } from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import toast from "react-hot-toast";

const ComboDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addComboToCart } = useCart();

  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await getComboBySlugAPI(slug);
        if (!cancelled) setCombo(data?.data?.combo);
      } catch {
        if (!cancelled) setError("Combo not found or unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setAdding(true);
      await addComboToCart(combo._id, 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !combo)
    return <ErrorState message={error || "Combo not found."} />;

  const allImages = [
    ...(combo.images || []),
    ...(combo.products?.flatMap((e) => e.product?.images?.slice(0, 1) || []) ||
      []),
  ].filter(Boolean);

  const displayImages = allImages.length > 0 ? allImages : null;

  const discountPercent =
    combo.originalPrice && combo.originalPrice > combo.price
      ? Math.round(
          ((combo.originalPrice - combo.price) / combo.originalPrice) * 100,
        )
      : 0;

  const savings = combo.originalPrice ? combo.originalPrice - combo.price : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-earth-50 aspect-square">
            {displayImages ? (
              <img
                src={transformImage(displayImages[activeImg])}
                alt={combo.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                🎁
              </div>
            )}
            {discountPercent > 0 && (
              <div className="absolute top-4 right-4 bg-spice-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                {discountPercent}% OFF
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {displayImages && displayImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImg === i ? "border-brand-600" : "border-earth-200"
                  }`}
                >
                  <img
                    src={transformImage(img)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              Bundle Deal
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-earth-900 leading-tight">
            {combo.name}
          </h1>

          {combo.description && (
            <p className="mt-3 text-earth-500 font-body text-sm leading-relaxed">
              {combo.description}
            </p>
          )}

          {/* Pricing */}
          <div className="mt-6 p-4 bg-earth-50 rounded-xl">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-[#b4532a]">
                ₹{combo.price?.toFixed(0)}
              </span>
              {combo.originalPrice > combo.price && (
                <span className="text-lg text-earth-400 line-through">
                  ₹{combo.originalPrice?.toFixed(0)}
                </span>
              )}
            </div>
            {savings > 0 && (
              <p className="mt-1 text-green-600 font-semibold text-sm">
                🎉 You save ₹{savings} with this combo!
              </p>
            )}
          </div>

          {/* Included products */}
          <div className="mt-6">
            <h3 className="font-display font-bold text-earth-900 mb-3 text-base">
              What's included:
            </h3>
            <div className="space-y-3">
              {combo.products?.map((entry, i) => {
                const product = entry.product;
                if (!product) return null;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-earth-100"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-earth-50 shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={transformImage(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🫙
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-earth-900 text-sm truncate">
                        {product.name}
                      </p>
                      {product.category && (
                        <p className="text-xs text-earth-400">
                          {product.category}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-brand-600 bg-brand-50 rounded-full px-2 py-0.5">
                      ×{entry.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-base
                         hover:bg-brand-700 active:scale-[0.98] transition-all duration-150
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {adding ? "Adding..." : "Add Combo to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboDetailPage;
