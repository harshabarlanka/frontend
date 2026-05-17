import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useSEO } from "../hooks/useSEO";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiHeart,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTruck,
  FiInstagram,
} from "react-icons/fi";
import { getBestsellersAPI } from "../api/product.api";
import { getCombosAPI } from "../api/combo.api";
import { CATEGORIES } from "../constants/constants_index";

// Use WebP assets (with JPEG fallback via <picture>)
import heroBannerWebP from "../assets/banner.webp";
import heroBannerJPEG from "../assets/banner.webp"; // fallback for unsupported browsers
import logoWebP from "../assets/banner_logo.webp";
import logoJPEG from "../assets/banner_logo.webp"; // fallback for unsupported browsers

import ProductCard from "../components/product/ProductCard";
import ComboCard from "../components/combo/ComboCard";

// Category images — WebP versions (massively smaller)
import vegPicklesWebP from "../assets/categories/veg-pickles.webp";
import nonVegWebP from "../assets/categories/non-veg-pickles.webp";
import podisWebP from "../assets/categories/podis.webp";
import sweetsWebP from "../assets/categories/sweets.webp";
import snacksWebP from "../assets/categories/snacks.webp";

// Map category value → optimized WebP
const CAT_IMAGES = {
  "veg-pickles": vegPicklesWebP,
  "non-veg-pickles": nonVegWebP,
  podis: podisWebP,
  sweets: sweetsWebP,
  snacks: snacksWebP,
};

const TESTIMONIALS = [
  {
    name: "Suresh K.",
    city: "Guntur",
    text: "The veg pickles are just like my Grandmother used to make. Absolutely authentic!",
    stars: 5,
  },
  {
    name: "Ramu C.",
    city: "Visakhapatnam",
    text: "Best non-veg pickle I've ever tasted. My wife ordered three packs already!",
    stars: 5,
  },
  {
    name: "Srinivas Rao.",
    city: "Hyderabad",
    text: "Fast delivery and perfectly sealed packs. The sweets and snacks are divine.",
    stars: 5,
  },
];

const TRUST_POINTS = [
  {
    title: "Homemade Recipes",
    text: "Traditional recipes made in small batches.",
    icon: FiHeart,
  },
  {
    title: "Fresh Dispatch",
    text: "Prepared fresh and delivered safely to your home.",
    icon: FiTruck,
  },
  {
    title: "Clean Ingredients",
    text: "No preservatives, no shortcuts — only quality ingredients.",
    icon: FiShield,
  },
  {
    title: "Loved by Families",
    text: "Trusted by customers who keep coming back.",
    icon: FiStar,
  },
];

const SkeletonCard = () => (
  <div
    className="overflow-hidden rounded-[24px] border border-white/70 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)]"
    aria-hidden="true"
  >
    <div className="aspect-square animate-pulse rounded-[20px] bg-earth-100" />
    <div className="mt-4 h-4 w-24 animate-pulse rounded bg-earth-100" />
    <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-earth-100" />
    <div className="mt-4 h-5 w-28 animate-pulse rounded bg-earth-100" />
  </div>
);

const HomePage = () => {
  useSEO({
    title: "Authentic Andhra Homemade Pickles, Sweets & Snacks | Buy Online",
    description:
      "Naidu Gari Ruchulu — Order authentic Andhra homemade Avakaya, Chicken Pickle, Gongura Pickle, Prawns Pickle, Sweets & Snacks online. No preservatives. Pan-India delivery.",
    canonical: "https://naidugariruchulu.vercel.app/",
    breadcrumbs: [{ name: "Home", url: "/" }],
  });

  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [combos, setCombos] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [bsRes, comboRes] = await Promise.allSettled([
          getBestsellersAPI({ limit: 4 }),
          getCombosAPI(),
        ]);
        if (!cancelled) {
          if (bsRes.status === "fulfilled")
            setBestsellers(bsRes.value?.data?.data?.products ?? []);
          if (comboRes.status === "fulfilled")
            setCombos((comboRes.value?.data?.data?.combos ?? []).slice(0, 4));
        }
      } catch {
        // fail silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-white text-earth-900 animate-fade-in">
      {/* Floating CTA */}
      <Link
        to="/products?sort=-createdAt"
        className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-earth-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:bg-earth-900 sm:bottom-6 sm:right-6"
        aria-label="Shop Now"
      >
        <FiShoppingBag className="text-base" aria-hidden="true" />
        Shop Now
      </Link>

      {/* ── Hero ── LCP element: use <picture> for WebP + JPEG fallback */}
      <section className="relative w-full" aria-label="Hero banner">
        <picture>
          <source srcSet={heroBannerWebP} type="image/webp" />
          <img
            src={heroBannerJPEG}
            alt="Naidu Gari Ruchulu — Authentic Andhra Homemade Pickles and Snacks"
            className="w-full h-[260px] sm:h-[340px] md:h-[440px] lg:h-[600px] xl:h-[670px] object-cover object-[15%_center] sm:object-[35%_center] md:object-center"
            width="1200"
            height="675"
            fetchpriority="high"
            decoding="sync"
            loading="eager"
          />
        </picture>
        <div
          className="absolute inset-0 bg-black/30 sm:bg-black/40"
          aria-hidden="true"
        />
      </section>

      {/* Promo strip */}
      <section
        className="-mt-8 relative z-10 pb-6 sm:-mt-10 sm:pb-10"
        aria-label="Promotion"
      >
        <div className="page-container">
          <div className="rounded-[24px] border border-white/60 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
                  Fresh Batch Ready
                </p>
                <h2 className="mt-2 text-xl font-semibold text-earth-950 sm:text-2xl">
                  Spicy pickles, tasty sweets, and crunchy snacks — all in one
                  place.
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm text-brand-700">
                  <FiClock aria-hidden="true" />
                  Freshly prepared & packed
                </div>
                <Link
                  to="/products?sort=-createdAt"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  Order Now
                  <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section
        className="bg-[#faf7f3] py-10 sm:py-14 lg:py-20"
        aria-labelledby="categories-heading"
      >
        <div className="page-container">
          <div className="mb-6 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
                Shop by Category
              </p>

              <h2
                id="categories-heading"
                className="mt-1 text-xl sm:text-3xl font-semibold text-earth-950"
              >
                Choose your favourite flavours.
              </h2>

              <p className="mt-2 text-xs sm:text-sm leading-6 sm:leading-7 text-earth-500">
                From spicy pickles to traditional sweets — something for every
                craving.
              </p>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <button
                onClick={() =>
                  scrollRef.current?.scrollBy({
                    left: -300,
                    behavior: "smooth",
                  })
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-earth-200 bg-white text-earth-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                aria-label="Scroll categories left"
              >
                <FiChevronLeft size={18} aria-hidden="true" />
              </button>

              <button
                onClick={() =>
                  scrollRef.current?.scrollBy({
                    left: 300,
                    behavior: "smooth",
                  })
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-earth-200 bg-white text-earth-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                aria-label="Scroll categories right"
              >
                <FiChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Scroll wrapper with fade edges */}
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 px-1 sm:px-2 no-scrollbar snap-x snap-mandatory scroll-smooth"
              role="list"
              aria-label="Product categories"
            >
              {CATEGORIES.map((cat, index) => (
                <Link
                  key={cat.value}
                  to={`/products?category=${cat.value}`}
                  className="group relative min-w-[170px] sm:min-w-[240px] lg:min-w-[300px] snap-start"
                  role="listitem"
                >
                  <div className="relative aspect-[0.9] overflow-hidden rounded-[22px] sm:rounded-[28px] bg-earth-200 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                    <img
                      src={CAT_IMAGES[cat.value] || cat.image}
                      alt={`${cat.label} — Shop ${cat.label}`}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      width="300"
                      height="333"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Overlay */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                      aria-hidden="true"
                    />

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                      <div className="inline-flex rounded-full bg-white/15 px-2 py-0.5 text-[9px] sm:text-[11px] font-medium uppercase tracking-[0.15em] text-white backdrop-blur-sm">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <h3 className="mt-2 text-base sm:text-2xl font-semibold text-white leading-tight">
                        {cat.label}
                      </h3>

                      <span className="mt-1 sm:mt-3 inline-flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm font-semibold text-white transition-transform duration-300 group-hover:translate-x-1">
                        Explore
                        <FiArrowRight aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              <div className="min-w-[20px] sm:min-w-[40px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      <section
        className="bg-[radial-gradient(circle_at_top,#fff7ed,transparent_42%),linear-gradient(to_bottom,#ffffff,#fffaf5)] py-12 sm:py-16 lg:py-20"
        aria-labelledby="bestsellers-heading"
      >
        <div className="page-container">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
                Best Sellers
              </p>
              <h2
                id="bestsellers-heading"
                className="mt-2 text-3xl font-semibold text-earth-950 sm:text-4xl"
              >
                Our most loved products.
              </h2>
              <p className="mt-3 text-sm leading-7 text-earth-500 sm:text-base">
                Top-selling items our customers order again and again.
              </p>
            </div>
            <Link
              to="/products?tag=bestseller"
              className="inline-flex items-center gap-2 self-start rounded-full border border-earth-200 bg-white px-5 py-3 text-sm font-semibold text-earth-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              View All
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div
              className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
              aria-label="Loading products"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 animate-fade-in">
              {bestsellers.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  priority={i < 2}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Combos ── */}
      {combos.length > 0 && (
        <section
          className="bg-[#fdf8f4] pt-0 pb-12 sm:pb-16 lg:pb-20"
          aria-labelledby="combos-heading"
        >
          <div className="page-container">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
                  Bundle Deals
                </p>
                <h2
                  id="combos-heading"
                  className="mt-2 text-3xl font-semibold text-earth-950 sm:text-4xl"
                >
                  Combo Offers
                </h2>
                <p className="mt-3 text-sm leading-7 text-earth-500 sm:text-base">
                  Save more when you buy together — handpicked combos curated
                  for you.
                </p>
              </div>
              <Link
                to="/combos"
                className="inline-flex items-center gap-2 self-start rounded-full border border-earth-200 bg-white px-5 py-3 text-sm font-semibold text-earth-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                View All <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 animate-fade-in">
              {combos.map((combo) => (
                <ComboCard key={combo._id} combo={combo} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Choose Us ── */}
      <section
        className="py-12 sm:py-16 lg:py-20"
        aria-labelledby="why-heading"
      >
        <div className="page-container">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
              Why Choose Us
            </p>
            <h2
              id="why-heading"
              className="mt-2 text-3xl font-semibold text-earth-950 sm:text-4xl"
            >
              Why Our Customers Love Us
            </h2>
            <p className="mt-3 text-sm leading-7 text-earth-500 sm:text-base">
              We focus on real taste, quality, and freshness — just like
              homemade food should be.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {TRUST_POINTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-[24px] border border-earth-100 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]"
                >
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-earth-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-earth-500">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section
        className="py-12 sm:py-16 lg:py-20"
        aria-labelledby="story-heading"
      >
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="overflow-hidden rounded-[32px] shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
              <picture>
                <source srcSet={logoWebP} type="image/webp" />
                <img
                  src={logoJPEG}
                  alt="Authentic homemade Andhra food prepared with love"
                  className="w-full h-[260px] sm:h-[320px] md:h-full object-cover object-[center_20%] sm:object-center rounded-[24px] sm:rounded-[32px]"
                  width="800"
                  height="600"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
                Our Story
              </p>
              <h2
                id="story-heading"
                className="mt-2 max-w-xl text-3xl font-semibold text-earth-950 sm:text-4xl"
              >
                Real Taste, Just Like Home
              </h2>
              <p className="mt-4 text-sm leading-7 text-earth-500 sm:text-base">
                Our recipes come from home kitchens, made with care and
                traditional methods passed down over time.
              </p>
              <p className="mt-4 text-sm leading-7 text-earth-500 sm:text-base">
                We bring you authentic Andhra flavours so you can enjoy real
                homemade taste anywhere in India.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://instagram.com/naidugariruchulu_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b4532a] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9f4724]"
                  aria-label="Follow Naidu Gari Ruchulu on Instagram (opens in new tab)"
                >
                  <FiInstagram aria-hidden="true" />
                  Follow on Instagram
                </a>
                <Link
                  to="/products?tag=bestseller"
                  className="inline-flex items-center justify-center rounded-full border border-earth-200 px-6 py-3 text-sm font-semibold text-earth-800 transition-all duration-300 hover:bg-earth-50"
                >
                  Shop Best Sellers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        className="relative overflow-hidden bg-[linear-gradient(180deg,#fff7ed_0%,#fffdf9_45%,#ffffff_100%)] py-12 sm:py-16 lg:py-20"
        aria-labelledby="testimonials-heading"
      >
        <div
          className="absolute left-0 top-10 h-40 w-40 rounded-full bg-brand-100/60 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-orange-100/60 blur-3xl"
          aria-hidden="true"
        />
        <div className="page-container relative">
          <div className="mb-8 text-center sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
              Customer Love
            </p>
            <h2
              id="testimonials-heading"
              className="mt-2 text-3xl font-semibold text-earth-950 sm:text-4xl"
            >
              What our customers say
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-earth-500 sm:text-base">
              Real feedback from happy customers.
            </p>
          </div>
          <div
            className="grid grid-cols-1 gap-5 lg:grid-cols-3"
            role="list"
            aria-label="Customer testimonials"
          >
            {TESTIMONIALS.map((t) => (
              <article
                key={t.name}
                className="rounded-[28px] border border-white/60 bg-white/60 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
                role="listitem"
              >
                <div
                  className="mb-5 flex gap-1 text-brand-500"
                  aria-label={`${t.stars} out of 5 stars`}
                >
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <FiStar
                      key={i}
                      className="fill-current"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="text-base leading-8 text-earth-700">
                  &quot;{t.text}&quot;
                </blockquote>
                <footer className="mt-6 border-t border-earth-100 pt-5">
                  <cite className="not-italic">
                    <p className="font-semibold text-earth-950">{t.name}</p>
                    <p className="text-sm text-earth-400">{t.city}</p>
                  </cite>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
