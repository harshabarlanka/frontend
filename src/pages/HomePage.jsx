import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProductsAPI, getCategoriesAPI } from '../api/product.api'
import ProductGrid from '../components/product/ProductGrid'
import { CATEGORIES } from '../constants'

const TESTIMONIALS = [
  { name: 'Priya S.',    city: 'Bengaluru', text: 'The veg pickles are just like my dadi used to make. Absolutely authentic!', stars: 5 },
  { name: 'Rahul M.',   city: 'Mumbai',    text: 'Best non-veg pickle I\'ve ever tasted. My wife ordered three jars already!', stars: 5 },
  { name: 'Ananya K.',  city: 'Chennai',   text: 'Fast delivery and perfectly sealed jars. The sweets and snacks are divine.', stars: 5 },
]

const HomePage = () => {
  const navigate = useNavigate()
  const [featured, setFeatured]   = useState([])
  const [loading,  setLoading]    = useState(true)
  const [searchQ,  setSearchQ]    = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProductsAPI({ featured: true, limit: 6 })
        setFeatured(data.data?.products ?? [])
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) navigate(`/products?search=${encodeURIComponent(searchQ.trim())}`)
  }

  return (
    <div className="animate-fade-in">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-earth-950">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-texture opacity-30" />
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-brand-800/20 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-spice-900/20 blur-3xl" />
        </div>

        <div className="page-container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-900/60 border border-brand-800 text-brand-300 text-xs font-body font-bold uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                Handcrafted with love since 1986
              </div>

              <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6">
                Authentic<br />
                <span className="text-gradient bg-gradient-to-r from-brand-400 to-spice-400">
                  Indian
                </span><br />
                Pickles
              </h1>

              <p className="font-body text-earth-300 text-lg leading-relaxed max-w-md mb-8">
                Made from family recipes passed down three generations. No preservatives,
                no shortcuts — just sun-dried spices and seasonal produce.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-md">
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search veg pickles, sweets, snacks…"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-brand-400 font-body text-sm"
                />
                <button type="submit" className="btn-primary rounded-xl">
                  Search
                </button>
              </form>

              <div className="flex items-center gap-6">
                <Link to="/products" className="btn-primary text-base py-3.5 px-7 rounded-xl">
                  Shop Now →
                </Link>
                <div className="flex items-center gap-2 text-earth-400">
                  <span className="text-lg">★★★★★</span>
                  <span className="font-body text-xs">4.9 from 2,400+ customers</span>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-[400px] h-[400px]">
                {/* Rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-brand-800/40 animate-spin" style={{ animationDuration: '30s' }} />
                {/* Main jar */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-brand-900 to-earth-900 border border-brand-800/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-2">🫙</div>
                    <p className="font-display font-bold text-brand-300 text-lg">Est. 1986</p>
                  </div>
                </div>
                {/* Floating emoji icons */}
                {[
                  { top: '5%',   left: '50%',  emoji: '🥒', delay: '0s'    },
                  { top: '50%',  left: '95%',  emoji: '🍗', delay: '0.5s'  },
                  { top: '90%',  left: '55%',  emoji: '🍬', delay: '1s'    },
                  { top: '55%',  left: '2%',   emoji: '🍿', delay: '1.5s'  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="absolute text-3xl animate-bounce"
                    style={{ top: item.top, left: item.left, animationDelay: item.delay, animationDuration: '3s' }}
                  >
                    {item.emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full fill-earth-50">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="bg-brand-600 py-6">
        <div className="page-container">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '35+', label: 'Pickle Varieties'   },
              { value: '12K+', label: 'Happy Customers'   },
              { value: '100%', label: 'Natural Ingredients'},
              { value: '3–5', label: 'Day Delivery'       },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-display font-black text-3xl text-white">{value}</div>
                <div className="font-body text-xs text-brand-100 uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-earth-50">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Veg Pickles, Non Veg Pickles, Sweets, Snacks & more</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                to={`/products?category=${cat.value}`}
                className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-earth-100 hover:border-brand-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                  {cat.emoji}
                </span>
                <span className="font-body font-bold text-xs text-earth-700 group-hover:text-brand-700 text-center transition-colors capitalize">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ─────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="section-title">Our Best Sellers</h2>
              <p className="section-subtitle">The jars our customers keep coming back for</p>
            </div>
            <Link to="/products?featured=true" className="btn-secondary shrink-0">
              View All →
            </Link>
          </div>
          <ProductGrid products={featured} loading={loading} />
        </div>
      </section>

      {/* ── Why us ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-earth-900">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white">Why Naidu Gari Ruchulu?</h2>
            <p className="font-body text-earth-400 mt-2 text-lg">Crafted different. Delivered with care.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🌿', title: 'All Natural',      desc: 'Zero artificial preservatives. Just salt, oil, and sunshine.'             },
              { icon: '👵', title: 'Family Recipes',   desc: 'Three generations of pickle wisdom in every jar.'                         },
              { icon: '🚚', title: 'Fast Delivery',    desc: 'Delivered in 3–5 days, sealed to lock in freshness.'                      },
              { icon: '↩️', title: 'Easy Returns',     desc: '7-day no-questions-asked return policy.'                                  },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-earth-800 rounded-2xl p-6 border border-earth-700">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
                <p className="font-body text-earth-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-50">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Over 12,000 happy pickle lovers across India</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, city, text, stars }) => (
              <div key={name} className="card p-6">
                <div className="text-brand-500 text-lg mb-3">{'★'.repeat(stars)}</div>
                <p className="font-body text-earth-700 text-sm leading-relaxed italic mb-4">"{text}"</p>
                <div>
                  <p className="font-body font-bold text-earth-900 text-sm">{name}</p>
                  <p className="font-body text-earth-400 text-xs">{city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-600">
        <div className="page-container text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-3">
            Ready to taste tradition?
          </h2>
          <p className="font-body text-brand-100 mb-7 max-w-md mx-auto">
            Free shipping on orders above ₹500. Use code FIRSTPICKLE for 10% off your first order.
          </p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-white text-brand-700 font-body font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors">
            Shop Now →
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
