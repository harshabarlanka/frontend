import { Link } from 'react-router-dom'

const Footer = () => (
  <footer className="bg-earth-950 text-earth-300 mt-20">
    <div className="page-container py-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-3xl">🫙</span>
            <div>
              <span className="font-display font-bold text-2xl text-white block leading-none">
                Naidu Gari Ruchulu
              </span>
              <span className="font-body text-[9px] uppercase tracking-[0.2em] text-earth-500 block">
                Homemade Delights
              </span>
            </div>
          </div>
          <p className="font-body text-sm leading-relaxed text-earth-400 max-w-xs">
            Handcrafted with love using age-old family recipes and the finest seasonal produce.
            Every jar tells a story of tradition and flavour.
          </p>
          <div className="flex gap-3 mt-5">
            {['Instagram', 'Facebook', 'WhatsApp'].map((s) => (
              <a key={s} href="#" className="w-9 h-9 rounded-full bg-earth-800 hover:bg-brand-600 flex items-center justify-center transition-colors duration-200 text-xs font-body font-bold">
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-display font-bold text-white text-base mb-4">Shop</h4>
          <ul className="space-y-2.5">
            {[
              { to: '/products?category=veg-pickles',     label: 'Veg Pickles'     },
              { to: '/products?category=non-veg-pickles', label: 'Non Veg Pickles' },
              { to: '/products?category=sweets',          label: 'Sweets'          },
              { to: '/products?category=snacks',          label: 'Snacks'          },
              { to: '/products?featured=true',            label: 'Best Sellers'    },
            ].map(({ to, label }) => (
              <li key={label}>
                <Link to={to} className="font-body text-sm text-earth-400 hover:text-brand-400 transition-colors duration-150">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="font-display font-bold text-white text-base mb-4">Help</h4>
          <ul className="space-y-2.5">
            {['Track Order', 'Shipping Policy', 'Return Policy', 'FAQ', 'Contact Us'].map((item) => (
              <li key={item}>
                <a href="#" className="font-body text-sm text-earth-400 hover:text-brand-400 transition-colors duration-150">
                  {item}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-6 p-4 bg-earth-900 rounded-xl">
            <p className="font-body text-xs text-earth-400 mb-1">Customer support</p>
            <a href="tel:+919876543210" className="font-body font-bold text-white text-sm hover:text-brand-400 transition-colors">
              +91 98765 43210
            </a>
            <p className="font-body text-xs text-earth-500 mt-0.5">Mon–Sat, 9am – 6pm</p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-earth-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-body text-xs text-earth-600">
          © {new Date().getFullYear()} Naidu Gari Ruchulu. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {['Privacy Policy', 'Terms of Service'].map((t) => (
            <a key={t} href="#" className="font-body text-xs text-earth-600 hover:text-earth-400 transition-colors">
              {t}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
