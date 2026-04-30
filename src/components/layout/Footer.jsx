import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";

const Footer = () => (
  <footer className="bg-[#4A1F14] text-[#EAD9C8] mt-20">
    <div className="page-container py-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display leading-tight">
              Naidu Gari Ruchulu
            </h2>
            <p className="text-xs tracking-[0.2em] uppercase text-[#C48A3A] mt-1">
              Homemade Delights
            </p>
          </div>

          <p className="font-body text-sm leading-relaxed text-[#D6BFA6] max-w-xs">
            Handcrafted with love using age-old family recipes and the finest
            seasonal produce. Every jar tells a story of tradition and flavour.
          </p>

          {/* ✅ Social Icons (FIXED) */}
          <div className="flex gap-3 mt-5">
            <a
              href="https://instagram.com/naidugariruchulu_official"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#5B2A1C] hover:bg-brand-600 flex items-center justify-center transition"
            >
              <FaInstagram size={14} />
            </a>

            <a
              href="https://facebook.com/naidugariruchulu_official"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#5B2A1C] hover:bg-brand-600 flex items-center justify-center transition"
            >
              <FaFacebookF size={14} />
            </a>

            <a
              href="https://wa.me/919052355733"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[#5B2A1C] hover:bg-brand-600 flex items-center justify-center transition"
            >
              <FaWhatsapp size={14} />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-display font-bold text-white text-base mb-4">
            Shop
          </h4>
          <ul className="space-y-2.5">
            {[
              { to: "/products?category=veg-pickles", label: "Veg Pickles" },
              {
                to: "/products?category=non-veg-pickles",
                label: "Non Veg Pickles",
              },
              { to: "/products?category=sweets", label: "Sweets" },
              { to: "/products?category=snacks", label: "Snacks" },
              { to: "/products?tag=bestseller", label: "Best Sellers" },
            ].map(({ to, label }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-sm text-[#D6BFA6] hover:text-[#C48A3A] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="font-display font-bold text-white text-base mb-4">
            Help
          </h4>
          <ul className="space-y-2.5">
            <li>
              <Link
                to="/orders"
                className="text-sm text-[#D6BFA6] hover:text-[#C48A3A]"
              >
                Track Order
              </Link>
            </li>
            <li>
              <Link
                to="/shipping-policy"
                className="text-sm text-[#D6BFA6] hover:text-[#C48A3A]"
              >
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link
                to="/return-policy"
                className="text-sm text-[#D6BFA6] hover:text-[#C48A3A]"
              >
                Return Policy
              </Link>
            </li>
            <li>
              <Link
                to="/faq"
                className="text-sm text-[#D6BFA6] hover:text-[#C48A3A]"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-sm text-[#D6BFA6] hover:text-[#C48A3A]"
              >
                Contact Us
              </Link>
            </li>
          </ul>

          <div className="mt-6 p-4 bg-[#5B2A1C] rounded-lg">
            <p className="text-xs text-[#BFA58A] mb-1">Customer support</p>
            <a
              href="tel:+919052355733"
              className="font-bold text-white text-sm hover:text-[#C48A3A] transition-colors"
            >
              +91 90523 55733
            </a>
            <p className="text-xs text-[#A88E73] mt-0.5">Mon–Sat, 9am – 6pm</p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-12 pt-6 border-t border-[#5B2A1C] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-[#A88E73]">
          © {new Date().getFullYear()} Naidu Gari Ruchulu. All rights reserved.
        </p>

        {/* ✅ FIXED (removed duplicate div) */}
        <div className="flex items-center gap-4">
          <Link
            to="/privacy-policy"
            className="text-xs text-[#A88E73] hover:text-[#EAD9C8]"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="text-xs text-[#A88E73] hover:text-[#EAD9C8]"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
