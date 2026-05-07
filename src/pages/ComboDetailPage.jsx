import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getComboBySlugAPI } from "../api/combo.api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, formatPrice } from "../utils";
import { transformImage } from "../utils/imageTransform";
import { PageLoader } from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import toast from "react-hot-toast";
import YouMayAlsoLike from "../components/product/YouMayAlsoLike";

const ComboDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { addComboToCart } = useCart();

  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [adding, setAdding] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await getComboBySlugAPI(slug);

        if (!cancelled) {
          setCombo(data?.data?.combo);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const images = useMemo(() => {
    const comboImages = combo?.images || [];

    const productImages =
      combo?.products?.flatMap(
        (entry) => entry?.product?.images?.slice(0, 1) || [],
      ) || [];

    const merged = [...comboImages, ...productImages].filter(Boolean);

    return merged.length ? [...new Set(merged)] : [null];
  }, [combo]);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setSelectedImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length]);

  if (loading) return <PageLoader />;

  if (error || !combo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState
          message={error || "Combo not found"}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const discountPercent =
    combo.originalPrice > combo.price
      ? Math.round(
          ((combo.originalPrice - combo.price) / combo.originalPrice) * 100,
        )
      : 0;

  const savings =
    combo.originalPrice > combo.price ? combo.originalPrice - combo.price : 0;

  const totalItems =
    combo.products?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const estimatedValue = combo.originalPrice || combo.price;

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setAdding(true);

      for (let i = 0; i < qty; i++) {
        await addComboToCart(combo._id, 1);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setAdding(true);

      for (let i = 0; i < qty; i++) {
        await addComboToCart(combo._id, 1);
      }

      navigate("/cart");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-body text-earth-400 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>

          <span>/</span>

          <Link to="/combos" className="hover:text-brand-600 transition-colors">
            Combos
          </Link>

          <span>/</span>

          <span className="text-earth-700 font-semibold truncate max-w-[220px]">
            {combo.name}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
          {/* LEFT */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-[28px] overflow-hidden bg-white border border-earth-100 shadow-[0_12px_40px_rgba(15,23,42,0.06)] group">
              {images[selectedImg] ? (
                <img
                  src={transformImage(images[selectedImg])}
                  alt={combo.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  🎁
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

              {/* Discount */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-[#b4532a] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-xl">
                  🔥 {discountPercent}% OFF
                </div>
              )}

              {/* Combo Badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-earth-900 px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold shadow-md tracking-wide uppercase">
                Combo Pack
              </div>

              {/* Floating savings */}
              {savings > 0 && (
                <div className="absolute bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-2xl shadow-lg">
                  <p className="text-[10px] uppercase tracking-wider font-semibold opacity-90">
                    You Save
                  </p>

                  <p className="text-sm sm:text-base font-bold">
                    {formatPrice(savings)}
                  </p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImg === idx
                        ? "border-brand-600 scale-[1.03] shadow-lg"
                        : "border-earth-200 hover:border-brand-300 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {img ? (
                      <img
                        src={transformImage(img)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-earth-100 flex items-center justify-center">
                        🎁
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: "🚚",
                  text: "Fast Delivery",
                },
                {
                  icon: "🌿",
                  text: "Fresh Products",
                },
                {
                  icon: "💯",
                  text: "Best Savings",
                },
              ].map((item) => (
                <div
                  key={item.text}
                  className="bg-white border border-earth-100 rounded-2xl p-4 text-center"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>

                  <p className="text-[11px] sm:text-xs font-semibold text-earth-600 leading-tight">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-brand-100 text-brand-700 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.18em]">
                Combo Offer
              </span>

              {combo.category && (
                <span className="bg-earth-100 text-earth-700 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.14em]">
                  {combo.category}
                </span>
              )}
            </div>
            {/* Title */}
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-[34px] text-earth-950 leading-[1.12] max-w-2xl">
                {combo.name}
              </h1>

              <p className="mt-3 text-earth-500 text-sm leading-6 max-w-xl">
                {combo.description ||
                  "Curated combo pack with handpicked products at the best value price."}
              </p>
            </div>

            {/* Price Card */}
            <div className="rounded-[28px] border border-earth-100 bg-white p-5 sm:p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-end gap-2">
                <span className="text-2xl sm:text-[30px] font-bold leading-none text-earth-950">
                  {formatPrice(combo.price)}
                </span>

                {combo.originalPrice > combo.price && (
                  <span className="text-sm sm:text-lg text-earth-400 line-through">
                    {formatPrice(combo.originalPrice)}
                  </span>
                )}

                {discountPercent > 0 && (
                  <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Savings */}
              {savings > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                  <span className="text-lg">🎉</span>

                  <p className="text-sm font-semibold text-green-700">
                    You save {formatPrice(savings)} on this combo
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="bg-earth-50 text-earth-700 px-3 py-1.5 rounded-lg text-[11px] font-semibold">
                  📦 {totalItems} Items Included
                </div>

                <div className="bg-earth-50 text-earth-700 px-3 py-1.5 rounded-lg text-[11px] font-semibold">
                  ⚡ Limited Time Offer
                </div>

                <div className="bg-earth-50 text-earth-700 px-3 py-1.5 rounded-lg text-[11px] font-semibold">
                  💰 Worth {formatPrice(estimatedValue)}
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-body font-bold text-earth-700 text-sm mb-2.5 uppercase tracking-wide">
                Quantity
              </h3>

              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-earth-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-11 h-11 flex items-center justify-center text-earth-600 hover:bg-earth-50 transition-colors disabled:opacity-40 text-lg font-bold"
                  >
                    −
                  </button>

                  <span className="w-11 h-11 flex items-center justify-center font-bold text-earth-900">
                    {qty}
                  </span>

                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-11 h-11 flex items-center justify-center text-earth-600 hover:bg-earth-50 transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                </div>

                <span className="font-body text-sm text-earth-500">
                  = {formatPrice(combo.price * qty)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 rounded-2xl bg-earth-900 py-4 text-white text-base font-bold transition-all duration-300 hover:bg-earth-800 hover:-translate-y-0.5 disabled:opacity-50"
              >
                {adding ? "Adding..." : "🛒 Add Combo to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={adding}
                className="flex-1 rounded-2xl bg-[#b4532a] py-4 text-white text-base font-bold transition-all duration-300 hover:bg-[#9f4724] hover:-translate-y-0.5 disabled:opacity-50"
              >
                Buy Now →
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="card overflow-hidden">
          <div className="flex border-b border-earth-100 overflow-x-auto scrollbar-hide">
            {[
              {
                key: "description",
                label: "Description",
              },
              {
                key: "included",
                label: `Included Products (${combo.products?.length || 0})`,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 px-6 py-4 font-body font-bold text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-earth-500 hover:text-earth-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-7">
            {/* DESCRIPTION */}
            {activeTab === "description" && (
              <div className="animate-fade-in">
                <div className="prose prose-earth max-w-none">
                  <p className="font-body text-earth-700 leading-relaxed whitespace-pre-line">
                    {combo.description ||
                      "This combo pack is specially curated to give you the best combination of products at a discounted price."}
                  </p>
                </div>

                {/* Highlight cards */}
                <div className="grid sm:grid-cols-3 gap-4 mt-8">
                  {[
                    {
                      title: "Best Value",
                      desc: "Bundle pricing gives you maximum savings.",
                      icon: "💰",
                    },
                    {
                      title: "Handpicked",
                      desc: "Carefully curated product combination.",
                      icon: "✨",
                    },
                    {
                      title: "Perfect Gift",
                      desc: "Great for family & festive occasions.",
                      icon: "🎁",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-earth-100 bg-earth-50 p-5"
                    >
                      <div className="text-3xl mb-3">{item.icon}</div>

                      <h3 className="font-bold text-earth-900 mb-1">
                        {item.title}
                      </h3>

                      <p className="text-sm text-earth-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INCLUDED PRODUCTS */}
            {activeTab === "included" && (
              <div className="animate-fade-in">
                <div className="grid gap-3">
                  {combo.products?.map((entry, idx) => {
                    const product = entry.product;

                    if (!product) return null;

                    return (
                      <div
                        key={idx}
                        className="group flex items-center gap-3 rounded-2xl border border-earth-100 bg-white p-3 transition-all duration-300 hover:shadow-md"
                      >
                        {/* IMAGE */}
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-earth-50 shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={transformImage(product.images[0])}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">
                              🫙
                            </div>
                          )}
                        </div>

                        {/* INFO */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-[15px] text-earth-900 truncate">
                            {product.name}
                          </h3>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {product.category && (
                              <span className="text-[11px] text-earth-400 capitalize">
                                {product.category}
                              </span>
                            )}

                            {product.variants?.[0]?.price && (
                              <span className="text-[12px] font-bold text-brand-700">
                                {formatPrice(product.variants[0].price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* QTY */}
                        <div className="shrink-0">
                          <span className="bg-brand-50 text-brand-700 font-bold text-xs px-3 py-1.5 rounded-full">
                            ×{entry.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* You May Also Like */}
        <div className="mt-14">
          <YouMayAlsoLike
            excludeIds={
              combo.products
                ?.map((item) => item.product?._id)
                .filter(Boolean) || []
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ComboDetailPage;
