import { useEffect, useRef, useState } from "react";
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
import { CATEGORIES } from "../constants/constants_index";
import heroBanner from "../assets/banner.jpeg";
import ProductCard from "../components/product/ProductCard";
import logo from "../assets/banner_logo.jpeg";

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
  <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
    <div className="aspect-square animate-pulse rounded-[20px] bg-earth-100" />
    <div className="mt-4 h-4 w-24 animate-pulse rounded bg-earth-100" />
    <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-earth-100" />
    <div className="mt-4 h-5 w-28 animate-pulse rounded bg-earth-100" />
  </div>
);

const HomePage = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await getBestsellersAPI({ limit: 4 });
        if (!cancelled) setBestsellers(data?.data?.products ?? []);
      } catch {
        // fail silently; section stays empty
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
      >
        <FiShoppingBag className="text-base" />
        Shop Now
      </Link>

      {/* Hero */}
      <section className="relative w-full">
        <img
          src={heroBanner}
          alt="Naidu Gari Ruchulu Banner"
          className="w-full h-[260px] sm:h-[340px] md:h-[440px] lg:h-[600px] xl:h-[670px] object-cover object-[15%_center] sm:object-[35%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-black/30 sm:bg-black/40" />
      </section>

      {/* Promo strip */}
      <section className="-mt-8 relative z-10 pb-6 sm:-mt-10 sm:pb-10">
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
                  <FiClock />
                  Freshly prepared & packed
                </div>

                <Link
                  to="/products?sort=-createdAt"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  Order Now
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[#faf7f3] py-14 sm:py-18 lg:py-24">
        <div className="page-container">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
                Shop by Category
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-earth-950 sm:text-4xl">
                Choose your favourite flavours.
              </h2>
              <p className="mt-3 text-sm leading-7 text-earth-500 sm:text-base">
                From spicy pickles to traditional sweets — something for every
                craving.
              </p>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <button
                onClick={() =>
                  scrollRef.current?.scrollBy({
                    left: -320,
                    behavior: "smooth",
                  })
                }
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-earth-200 bg-white text-earth-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={() =>
                  scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })
                }
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-earth-200 bg-white text-earth-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-4 no-scrollbar sm:gap-5"
            >
              {CATEGORIES.map((cat, index) => (
                <Link
                  key={cat.value}
                  to={`/products?category=${cat.value}`}
                  className="group relative min-w-[240px] sm:min-w-[280px] lg:min-w-[320px]"
                >
                  <div className="relative aspect-[0.92] overflow-hidden rounded-[28px] bg-earth-200 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <h3 className="mt-3 text-2xl font-semibold text-white">
                        {cat.label}
                      </h3>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition-transform duration-300 group-hover:translate-x-1">
                        Explore category
                        <FiArrowRight />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-14 sm:py-18 lg:py-24">
        <div className="page-container">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
              Why Choose Us
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-earth-950 sm:text-4xl">
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
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:scale-110">
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

      {/* Best Sellers */}
      <section className="bg-[radial-gradient(circle_at_top,#fff7ed,transparent_42%),linear-gradient(to_bottom,#ffffff,#fffaf5)] py-14 sm:py-18 lg:py-24">
        <div className="page-container">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
                Best Sellers
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-earth-950 sm:text-4xl">
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
              <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 animate-fade-in">
              {bestsellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Story */}
      <section className="py-14 sm:py-18 lg:py-24">
        <div className="page-container">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="overflow-hidden rounded-[32px] shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
              <img
                src={logo}
                alt="Authentic homemade food"
                className="w-full h-[260px] sm:h-[320px] md:h-full object-cover object-[center_20%] sm:object-center rounded-[24px] sm:rounded-[32px]"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
                Our Story
              </p>
              <h2 className="mt-2 max-w-xl text-3xl font-semibold text-earth-950 sm:text-4xl">
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
                >
                  <FiInstagram />
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

      {/* Testimonials */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fff7ed_0%,#fffdf9_45%,#ffffff_100%)] py-14 sm:py-18 lg:py-24">
        <div className="absolute left-0 top-10 h-40 w-40 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-orange-100/60 blur-3xl" />

        <div className="page-container relative">
          <div className="mb-8 text-center sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
              Customer Love
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-earth-950 sm:text-4xl">
              What our customers say
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-earth-500 sm:text-base">
              Real feedback from happy customers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-[28px] border border-white/60 bg-white/60 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
              >
                <div className="mb-5 flex gap-1 text-brand-500">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <FiStar key={i} className="fill-current" />
                  ))}
                </div>

                <p className="text-base leading-8 text-earth-700">
                  &quot;{t.text}&quot;
                </p>

                <div className="mt-6 border-t border-earth-100 pt-5">
                  <p className="font-semibold text-earth-950">{t.name}</p>
                  <p className="text-sm text-earth-400">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
