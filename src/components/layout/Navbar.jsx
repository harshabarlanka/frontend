import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userDrop, setUserDrop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  const params = new URLSearchParams(location.search);
  const currentCategory = params.get("category");

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setUserDrop(false); }, [location.pathname]);

  // Scroll shadow
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled((prev) => {
            const next = window.scrollY > 20;
            return prev === next ? prev : next;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setUserDrop(false);
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  const navLinkCls = (category) =>
    `font-body font-semibold text-sm tracking-wide transition ${
      currentCategory === category
        ? "text-brand-600"
        : "text-earth-700 hover:text-brand-600"
    }`;

  const mobileNavLinkBase =
    "block font-body font-semibold text-sm text-earth-700 hover:text-brand-600 py-2.5 transition";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md border-b border-earth-100"
          : "bg-white shadow-sm"
      }`}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-20 sm:h-24">

          {/* LOGO */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src={logo}
              alt="Naidu Gari Ruchulu"
              className={`object-contain transition-all duration-300 ${
                scrolled
                  ? "h-9 sm:h-12 max-w-[170px]"
                  : "h-12 sm:h-16 md:h-20 max-w-[200px] md:max-w-[260px]"
              }`}
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={() => navLinkCls(null)}>
              Home
            </NavLink>
            <NavLink to="/products?category=veg-pickles" className={() => navLinkCls("veg-pickles")}>
              Veg Pickles
            </NavLink>
            <NavLink to="/products?category=non-veg-pickles" className={() => navLinkCls("non-veg-pickles")}>
              Non Veg
            </NavLink>
            <NavLink to="/products?category=podis" className={() => navLinkCls("podis")}>
              Podis
            </NavLink>
            <NavLink to="/products?category=sweets" className={() => navLinkCls("sweets")}>
              Sweets
            </NavLink>
            <NavLink to="/products?category=snacks" className={() => navLinkCls("snacks")}>
              Snacks
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={() => `${navLinkCls(null)} text-spice-600`}>
                Admin
              </NavLink>
            )}
          </nav>

          {/* RIGHT: CART + USER + HAMBURGER */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* CART ICON */}
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative p-2 rounded-lg hover:bg-earth-50 transition-colors"
            >
              <svg className="w-5 h-5 text-earth-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6h13" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* USER MENU (desktop dropdown) */}
            {user ? (
              <div className="relative hidden sm:block" id="user-menu" ref={dropRef}>
                <button
                  onClick={() => setUserDrop((v) => !v)}
                  aria-expanded={userDrop}
                  aria-label="Account menu"
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-earth-50 transition"
                >
                  {/* Avatar circle */}
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-bold text-earth-700 max-w-[100px] truncate">
                    {user.name?.split(" ")[0]}
                  </span>
                  <svg
                    className={`w-3 h-3 text-earth-500 transition-transform ${userDrop ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* DROPDOWN */}
                {userDrop && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-earth-100 py-1.5 animate-fade-in">
                    {/* User info header */}
                    <div className="px-4 py-2.5 border-b border-earth-100">
                      <p className="font-body text-xs font-bold text-earth-800 truncate">{user.name}</p>
                      <p className="font-body text-xs text-earth-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Account links */}
                    <div className="py-1">
                      <DropLink to="/profile" icon="👤" label="My Profile" onClick={() => setUserDrop(false)} />
                      {/* <DropLink to="/profile?tab=Addresses" icon="📍" label="My Addresses" onClick={() => setUserDrop(false)} /> */}
                      <DropLink to="/orders" icon="📦" label="My Orders" onClick={() => setUserDrop(false)} />
                    </div>

                    {/* Admin */}
                    {isAdmin && (
                      <div className="border-t border-earth-100 py-1">
                        <DropLink to="/admin" icon="⚙️" label="Admin Panel" className="text-spice-600 hover:bg-spice-50" onClick={() => setUserDrop(false)} />
                      </div>
                    )}

                    {/* Logout */}
                    <div className="border-t border-earth-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-body text-earth-600 hover:bg-earth-50 transition-colors"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
              </div>
            )}

            {/* HAMBURGER (mobile only) */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-lg hover:bg-earth-50 transition"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 bg-earth-700 rounded transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                <span className={`block h-0.5 bg-earth-700 rounded transition-all duration-200 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block h-0.5 bg-earth-700 rounded transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[9px]" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ────────────────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden border-t border-earth-100 animate-slide-up">
            <div className="py-3 flex flex-col">

              {/* Category links */}
              <div className="space-y-0.5 pb-3">
                <NavLink to="/" end className={() => mobileNavLinkBase} onClick={() => setMenuOpen(false)}>Home</NavLink>
                <NavLink to="/products?category=veg-pickles" className={() => mobileNavLinkBase} onClick={() => setMenuOpen(false)}>Veg Pickles</NavLink>
                <NavLink to="/products?category=non-veg-pickles" className={() => mobileNavLinkBase} onClick={() => setMenuOpen(false)}>Non Veg Pickles</NavLink>
                <NavLink to="/products?category=podis" className={() => mobileNavLinkBase} onClick={() => setMenuOpen(false)}>Podis</NavLink>
                <NavLink to="/products?category=sweets" className={() => mobileNavLinkBase} onClick={() => setMenuOpen(false)}>Sweets</NavLink>
                <NavLink to="/products?category=snacks" className={() => mobileNavLinkBase} onClick={() => setMenuOpen(false)}>Snacks</NavLink>
              </div>

              {/* ── Account section (logged in) ── */}
              {user ? (
                <div className="border-t border-earth-100 pt-3 space-y-0.5">
                  {/* User identity */}
                  <div className="flex items-center gap-3 py-2 mb-1">
                    <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-body text-sm font-bold text-earth-900 truncate">{user.name}</p>
                      <p className="font-body text-xs text-earth-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Account nav links */}
                  <MobileNavLink to="/profile" icon="👤" label="My Profile" onClick={() => setMenuOpen(false)} />
                  {/* <MobileNavLink to="/profile?tab=Addresses" icon="📍" label="My Addresses" onClick={() => setMenuOpen(false)} /> */}
                  <MobileNavLink to="/orders" icon="📦" label="My Orders" onClick={() => setMenuOpen(false)} />

                  {isAdmin && (
                    <MobileNavLink to="/admin" icon="⚙️" label="Admin Panel" onClick={() => setMenuOpen(false)} className="text-spice-600" />
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 py-2.5 text-sm font-body font-semibold text-earth-500 hover:text-spice-600 transition-colors mt-1 border-t border-earth-100 pt-3"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                /* ── Auth buttons (logged out) ── */
                <div className="border-t border-earth-100 pt-3 flex gap-2">
                  <Link to="/login" className="flex-1 btn-secondary text-sm text-center" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="flex-1 btn-primary text-sm text-center" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

/* ── Small reusable sub-components ────────────────────────────────────────── */

const DropLink = ({ to, icon, label, onClick, className = "" }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-body text-earth-700 hover:bg-earth-50 transition-colors ${className}`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </Link>
);

const MobileNavLink = ({ to, icon, label, onClick, className = "" }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 py-2.5 text-sm font-body font-semibold text-earth-700 hover:text-brand-600 transition-colors ${className}`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </Link>
);

export default Navbar;
