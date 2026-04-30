import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ScrollManager from "./components/common/ScrollManager";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { PageLoader } from "./components/common/Loader";
import AnnouncementBar from "./components/common/AnnouncementBar";

// Footer pages
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";

// Admin
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import ResetPassword from "./pages/ResetPassword";

// Core pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForgotPassword from "./pages/ForgotPassword";

// Lazy pages
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

// Admin lazy
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetailPage"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));

const MainLayout = ({ children, noPad = false }) => (
  <div className="flex flex-col min-h-screen">
    <AnnouncementBar />
    <Navbar />
    <main className={`flex-1 ${noPad ? "" : "py-8"}`}>{children}</main>
    <Footer />
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">{children}</div>
);

const AdminPage = ({ children }) => (
  <AdminRoute>
    <AdminLayout>{children}</AdminLayout>
  </AdminRoute>
);

const App = () => (
  <Suspense fallback={<PageLoader />}>
    <ScrollManager />
    <Routes>
      {/* ─── PUBLIC ─── */}
      <Route path="/" element={<MainLayout noPad><HomePage /></MainLayout>} />

      {/* ✅ Single unified products route — all filtering via query params */}
      {/* Examples:
            /products                              → all products, newest first
            /products?sort=-ratings.average        → top rated
            /products?category=veg-pickles         → category filter
            /products?tag=bestseller               → bestsellers
            /products?category=veg-pickles&sort=minPrice&page=2  → combined
      */}
      <Route
        path="/products"
        element={<MainLayout><ProductsPage /></MainLayout>}
      />

      {/* Legacy redirects — catch old dynamic routes and send to /products */}
      <Route path="/products/bestsellers" element={<LegacyRedirect to="/products?tag=bestseller" />} />
      <Route path="/products/all" element={<LegacyRedirect to="/products" />} />
      <Route path="/products/:category" element={<LegacyCategoryRedirect />} />

      {/* Product detail */}
      <Route
        path="/product/:slug"
        element={<MainLayout><ProductDetailPage /></MainLayout>}
      />

      {/* Cart */}
      <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />

      {/* Footer pages */}
      <Route path="/shipping-policy" element={<MainLayout><ShippingPolicy /></MainLayout>} />
      <Route path="/return-policy" element={<MainLayout><ReturnPolicy /></MainLayout>} />
      <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
      <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
      <Route path="/faq" element={<MainLayout><FAQ /></MainLayout>} />

      {/* ─── AUTH ─── */}
      <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
      <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />

      {/* ─── USER ─── */}
      <Route
        path="/checkout"
        element={<ProtectedRoute><MainLayout><CheckoutPage /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/orders"
        element={<ProtectedRoute><MainLayout><OrdersPage /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/orders/:id"
        element={<ProtectedRoute><MainLayout><OrderDetailPage /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>}
      />
      <Route
        path="/account"
        element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>}
      />

      {/* ─── ADMIN ─── */}
      <Route path="/admin" element={<AdminPage><AdminDashboard /></AdminPage>} />
      <Route path="/admin/dashboard" element={<AdminPage><AdminDashboard /></AdminPage>} />
      <Route path="/admin/orders" element={<AdminPage><AdminOrders /></AdminPage>} />
      <Route path="/admin/orders/:id" element={<AdminPage><AdminOrderDetail /></AdminPage>} />
      <Route path="/admin/products" element={<AdminPage><AdminProducts /></AdminPage>} />
      <Route path="/admin/users" element={<AdminPage><AdminUsers /></AdminPage>} />
      <Route path="/admin/coupons" element={<AdminPage><AdminCoupons /></AdminPage>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

// ─── Legacy redirect helpers ──────────────────────────────────────────────────

import { Navigate, useParams, useLocation } from "react-router-dom";

/** Redirect a fixed old URL to a new one, preserving existing query params. */
const LegacyRedirect = ({ to }) => {
  const { search } = useLocation();
  const [base, newSearch] = to.split("?");
  const merged = new URLSearchParams(search);
  if (newSearch) {
    new URLSearchParams(newSearch).forEach((v, k) => merged.set(k, v));
  }
  const qs = merged.toString();
  return <Navigate to={`${base}${qs ? `?${qs}` : ""}`} replace />;
};

/**
 * Redirect /products/:category  →  /products?category=:category
 * Preserves any extra query params (sort, page) from the old URL.
 */
const LegacyCategoryRedirect = () => {
  const { category } = useParams();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  params.set("category", category);
  return <Navigate to={`/products?${params.toString()}`} replace />;
};

export default App;
