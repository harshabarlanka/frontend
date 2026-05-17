/**
 * Footer.jsx — Updated to include Blog link
 * Only change: added "Blog" link to the Quick Links section.
 * All other content preserved exactly.
 *
 * DIFF SUMMARY (search for "// ── BLOG ADDED"):
 *   - One <li> added to Quick Links nav
 */

import { Link } from "react-router-dom";
import logo from "../../assets/logo.webp";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-earth-950 text-earth-200 pt-12 pb-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4" aria-label="Naidu Gari Ruchulu — Home">
              <img src={logo} alt="Naidu Gari Ruchulu" className="h-12 w-auto" loading="lazy" />
            </Link>
            <p className="font-body text-sm text-earth-400 leading-relaxed mb-4">
              Authentic Andhra homemade pickles, sweets, snacks & podis.
              Made fresh. No preservatives. Pan-India delivery.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/naidugariruchulu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-earth-400 hover:text-brand-400 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/naidugariruchulu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-earth-400 hover:text-brand-400 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-earth-300 mb-4">
              Quick Links
            </h3>
            <nav aria-label="Footer quick links">
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="font-body text-sm text-earth-400 hover:text-brand-300 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="font-body text-sm text-earth-400 hover:text-brand-300 transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/combos" className="font-body text-sm text-earth-400 hover:text-brand-300 transition-colors">
                    Combo Packs
                  </Link>
                </li>
                {/* ── BLOG ADDED ─────────────────────────────────────────── */}
                <li>
                  <Link to="/blog" className="font-body text-sm text-earth-400 hover:text-brand-300 transition-colors">
                    Blog
                  </Link>
                </li>
                {/* ────────────────────────────────────────────────────────── */}
                <li>
                  <Link to="/contact" className="font-body text-sm text-earth-400 hover:text-brand-300 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="font-body text-sm text-earth-400 hover:text-brand-300 transition-colors">
                    FAQs
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-earth-300 mb-4">
              Categories
            </h3>
            <nav aria-label="Footer product categories">
              <ul className="space-y-2">
                {[
                  { label: "Veg Pickles", path: "/products?category=veg-pickles" },
                  { label: "Non-Veg Pickles", path: "/products?category=non-veg-pickles" },
                  { label: "Sweets", path: "/products?category=sweets" },
                  { label: "Snacks", path: "/products?category=snacks" },
                  { label: "Podis", path: "/products?category=podis" },
                ].map((cat) => (
                  <li key={cat.path}>
                    <Link
                      to={cat.path}
                      className="font-body text-sm text-earth-400 hover:text-brand-300 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-earth-300 mb-4">
              Policies
            </h3>
            <nav aria-label="Footer policy links">
              <ul className="space-y-2">
                {[
                  { label: "Shipping Policy", path: "/shipping-policy" },
                  { label: "Return Policy", path: "/return-policy" },
                  { label: "Privacy Policy", path: "/privacy-policy" },
                  { label: "Terms & Conditions", path: "/terms" },
                ].map((p) => (
                  <li key={p.path}>
                    <Link
                      to={p.path}
                      className="font-body text-sm text-earth-400 hover:text-brand-300 transition-colors"
                    >
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-earth-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-body text-earth-500">
          <p>
            © {currentYear} Naidu Gari Ruchulu. All rights reserved.
          </p>
          <p>Made with ❤️ in Andhra Pradesh</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
