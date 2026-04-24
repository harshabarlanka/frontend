import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import logo from "../../assets/logo.png";
import { useLocation } from "react-router-dom";
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userDrop, setUserDrop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentCategory = params.get("category");

useEffect(() => {
  let ticking = false;

  const handleScroll = () => {
    const shouldScroll = window.scrollY > 20;

    setScrolled((prev) => {
      if (prev === shouldScroll) return prev; // prevent unnecessary updates
      return shouldScroll;
    });
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  return () => window.removeEventListener("scroll", onScroll);
}, []);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("#user-menu")) setUserDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserDrop(false);
    navigate("/");
  };

  const navLinkCls = (category) =>
    `font-body font-semibold text-sm tracking-wide transition ${
      currentCategory === category
        ? "text-brand-600"
        : "text-earth-700 hover:text-brand-600"
    }`;

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
          {/* ✅ LOGO */}
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

          {/* ✅ DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={navLinkCls}>
              Home
            </NavLink>
            <NavLink
              to="/products?category=veg-pickles"
              className={() => navLinkCls("veg-pickles")}
            >
              Veg Pickles
            </NavLink>

            <NavLink
              to="/products?category=non-veg-pickles"
              className={() => navLinkCls("non-veg-pickles")}
            >
              Non Veg Pickles
            </NavLink>

            <NavLink
              to="/products?category=podis"
              className={() => navLinkCls("podis")}
            >
              Podis
            </NavLink>

            <NavLink
              to="/products?category=sweets"
              className={() => navLinkCls("sweets")}
            >
              Sweets
            </NavLink>

            <NavLink
              to="/products?category=snacks"
              className={() => navLinkCls("snacks")}
            >
              Snacks
            </NavLink>

            {/* {user && (
              <NavLink to="/orders" className={navLinkCls}>
                My Orders
              </NavLink>
            )} */}

            {isAdmin && (
              <NavLink to="/admin" className={`${navLinkCls} text-spice-600`}>
                Admin
              </NavLink>
            )}
          </nav>

          {/* ✅ UPDATED RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* CART */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-earth-50 transition-colors"
            >
              <svg
                className="w-5 h-5 text-earth-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6h13"
                />
              </svg>

              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* USER */}
            {user ? (
              <div className="relative" id="user-menu">
                <button
                  onClick={() => setUserDrop(!userDrop)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-earth-50 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  <span className="hidden sm:block text-sm font-bold text-earth-700 max-w-[100px] truncate">
                    {user.name?.split(" ")[0]}
                  </span>

                  <svg
                    className={`w-3 h-3 text-earth-500 transition-transform ${
                      userDrop ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {userDrop && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-earth-100 py-1.5">
                    {/* EMAIL */}
                    <div className="px-4 py-2 border-b border-earth-50">
                      <p className="text-xs text-earth-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserDrop(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-earth-700 hover:bg-earth-50"
                    >
                      📦 My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDrop(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-spice-600 hover:bg-spice-50"
                      >
                        ⚙️ Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-earth-700 hover:bg-earth-50"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* HAMBURGER */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-earth-50 transition"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className={`block h-0.5 bg-earth-700 rounded transition ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                />
                <span
                  className={`block h-0.5 bg-earth-700 rounded transition ${menuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`block h-0.5 bg-earth-700 rounded transition ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-earth-100">
            <div className="page-container py-4 flex flex-col gap-1">
              <NavLink
                to="/"
                className={navLinkCls + " py-2.5"}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/products?category=veg-pickles"
                className={() => navLinkCls("veg-pickles")}
              >
                Veg Pickles
              </NavLink>

              <NavLink
                to="/products?category=non-veg-pickles"
                className={() => navLinkCls("non-veg-pickles")}
              >
                Non Veg Pickles
              </NavLink>

              <NavLink
                to="/products?category=podis"
                className={() => navLinkCls("podis")}
              >
                Podis
              </NavLink>

              <NavLink
                to="/products?category=sweets"
                className={() => navLinkCls("sweets")}
              >
                Sweets
              </NavLink>

              <NavLink
                to="/products?category=snacks"
                className={() => navLinkCls("snacks")}
              >
                Snacks
              </NavLink>

              {/* {user && (
                <NavLink
                  to="/orders"
                  className={navLinkCls + " py-2.5"}
                  onClick={() => setMenuOpen(false)}
                >
                  My Orders
                </NavLink>
              )} */}

              {!user && (
                <div className="flex gap-2 pt-2 border-t border-earth-100 mt-1">
                  <Link to="/login" className="flex-1 btn-secondary text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="flex-1 btn-primary text-sm">
                    Sign Up
                  </Link>
                </div>
              )}

              {user && (
                <button
                  onClick={handleLogout}
                  className="text-left text-sm text-earth-500 py-2.5 mt-1 border-t border-earth-100"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
