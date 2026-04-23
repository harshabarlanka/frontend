import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ScrollManager from "./components/common/ScrollManager";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { PageLoader } from "./components/common/Loader";

// Footer and Navbar
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";

// Admin components
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import ResetPassword from "./pages/ResetPassword";
// Eagerly loaded critical paths
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ForgotPassword from "./pages/ForgotPassword";

// Lazily loaded user pages
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

// Lazily loaded admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(
  () => import("./pages/admin/AdminOrderDetailPage"),
);
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons")); // Feature 2

// ── Layout wrappers ──────────────────────────────────────────────────────────

const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
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

// ── App ───────────────────────────────────────────────────────────────────────

const App = () => (
  <Suspense fallback={<PageLoader />}>
    <ScrollManager />
    <Routes>
      {/* ── Public storefront routes ──────────────────────────────────── */}
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path="/products"
        element={
          <MainLayout>
            <ProductsPage />
          </MainLayout>
        }
      />
      <Route
        path="/products/:slug"
        element={
          <MainLayout>
            <ProductDetailPage />
          </MainLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <MainLayout>
            <CartPage />
          </MainLayout>
        }
      />
      {/* Footer links */}
      <Route
        path="/shipping-policy"
        element={
          <MainLayout>
            <ShippingPolicy />
          </MainLayout>
        }
      />
      <Route
        path="/return-policy"
        element={
          <MainLayout>
            <ReturnPolicy />
          </MainLayout>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <MainLayout>
            <PrivacyPolicy />
          </MainLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <MainLayout>
            <Terms />
          </MainLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <MainLayout>
            <Contact />
          </MainLayout>
        }
      />
      <Route
        path="/faq"
        element={
          <MainLayout>
            <FAQ />
          </MainLayout>
        }
      />
      {/* ── Auth routes (no navbar/footer) ───────────────────────────── */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />
      {/* ── Protected user routes ─────────────────────────────────────── */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MainLayout>
              <OrdersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <OrderDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* ── Admin routes (role === 'admin' required) ─────────────────── */}
      <Route
        path="/admin"
        element={
          <AdminPage>
            <AdminDashboard />
          </AdminPage>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminPage>
            <AdminDashboard />
          </AdminPage>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminPage>
            <AdminOrders />
          </AdminPage>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <AdminPage>
            <AdminOrderDetail />
          </AdminPage>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminPage>
            <AdminProducts />
          </AdminPage>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminPage>
            <AdminUsers />
          </AdminPage>
        }
      />
      {/* Feature 2: Coupon management */}
      <Route
        path="/admin/coupons"
        element={
          <AdminPage>
            <AdminCoupons />
          </AdminPage>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthLayout>
            <ForgotPassword />
          </AuthLayout>
        }
      />
      <Route
        path="/reset-password"
        element={
          <AuthLayout>
            <ResetPassword />
          </AuthLayout>
        }
      />
      {/* ── 404 ──────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default App;
