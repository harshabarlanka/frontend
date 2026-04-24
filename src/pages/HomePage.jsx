import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProductsAPI } from "../api/product.api";
import ProductGrid from "../components/product/ProductGrid";
import { CATEGORIES } from "../constants/constants_index";
import heroBanner from "../assets/banner.jpeg";

const TESTIMONIALS = [
  {
    name: "Priya S.",
    city: "Bengaluru",
    text: "The veg pickles are just like my dadi used to make. Absolutely authentic!",
    stars: 5,
  },
  {
    name: "Rahul M.",
    city: "Mumbai",
    text: "Best non-veg pickle I've ever tasted. My wife ordered three jars already!",
    stars: 5,
  },
  {
    name: "Ananya K.",
    city: "Chennai",
    text: "Fast delivery and perfectly sealed jars. The sweets and snacks are divine.",
    stars: 5,
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProductsAPI({ featured: true, limit: 6 });
        setFeatured(data.data?.products ?? []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* ✅ HERO BANNER */}
      <section className="w-full">
        <img
  src={heroBanner}
  alt="Naidu Gari Ruchulu Banner"
  className="
    w-full 
    h-[260px] sm:h-[340px] md:h-[440px] 
    lg:h-[600px] xl:h-[670px]
    object-cover 
    object-[40%_center]
  "
/>
      </section>

      {/* ✅ STATS */}
      <section className="bg-brand-600 py-6 sm:py-8">
        <div className="page-container grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
          {[
            { value: "35+", label: "Pickle Varieties" },
            { value: "12K+", label: "Happy Customers" },
            { value: "100%", label: "Natural" },
            { value: "3–5", label: "Day Delivery" },
          ].map((item) => (
            <div key={item.label}>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {item.value}
              </h3>
              <p className="text-xs sm:text-sm text-brand-100">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ CATEGORIES */}
      <section className="py-12 sm:py-16 lg:py-20 bg-earth-50">
        <div className="page-container">
          {/* Title */}
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Browse Categories
            </h2>
            <p className="text-sm sm:text-base text-earth-500 mt-2">
              Pickles, Sweets, Snacks & more
            </p>
          </div>

          {/* Grid */}
          <div
            className="
            grid 
            grid-cols-2 
            sm:grid-cols-3 
            md:grid-cols-4 
            lg:grid-cols-5 
            gap-3 sm:gap-4
          "
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                to={`/products?category=${cat.value}`}
                className="
      group
      flex flex-col items-center
      gap-2
    "
              >
                {/* IMAGE CARD */}
                <div
                  className="
    w-full
    aspect-square
    overflow-hidden
    rounded-md sm:rounded-lg
    shadow-sm group-hover:shadow-lg
    transition-all duration-300
  "
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="
      w-full h-full
      object-cover
      group-hover:scale-110
      transition-transform duration-500
    "
                  />
                </div>

                {/* LABEL BELOW */}
                <span
                  className="
    text-sm sm:text-base md:text-lg
    font-semibold
    text-center
    text-earth-800
    group-hover:text-brand-600
    transition
  "
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ FEATURED PRODUCTS */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Best Sellers
              </h2>
              <p className="text-sm sm:text-base text-earth-500 mt-1">
                Customer favorites
              </p>
            </div>

            <Link
              to="/products?featured=true"
              className="btn-secondary text-sm"
            >
              View All →
            </Link>
          </div>

          <ProductGrid products={featured} loading={loading} />
        </div>
      </section>

      {/* ✅ TESTIMONIALS */}
      <section className="py-12 sm:py-16 lg:py-20 bg-brand-50">
        <div className="page-container">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              What Our Customers Say
            </h2>
          </div>

          <div
            className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            gap-4 sm:gap-6
          "
          >
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-xl p-5 sm:p-6 shadow-sm"
              >
                <div className="text-brand-500 mb-2">{"★".repeat(t.stars)}</div>

                <p className="text-sm sm:text-base text-earth-700 italic mb-3">
                  "{t.text}"
                </p>

                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-earth-400">{t.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
