import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ScrollManager from "./components/common/ScrollManager";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { PageLoader } from "./components/common/Loader";

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
import CategoryRedirect from "./pages/CategoryRedirect";
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
const AdminOrderDetail = lazy(
  () => import("./pages/admin/AdminOrderDetailPage"),
);
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
import AnnouncementBar from "./components/common/AnnouncementBar";
// Layouts
// noPad={true} → full-bleed pages (HomePage hero flush to navbar)
// noPad={false} → all other pages get consistent py-8 breathing room
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
      {/* ───────── PUBLIC ROUTES ───────── */}

      <Route
        path="/"
        element={
          <MainLayout noPad>
            <HomePage />
          </MainLayout>
        }
      />

      {/* ✅ PRODUCTS */}

      {/* All products */}

      <Route path="/products" element={<CategoryRedirect />} />

      {/* Category (SEO) */}
      <Route
        path="/products/:category"
        element={
          <MainLayout>
            <ProductsPage />
          </MainLayout>
        }
      />

      {/* Product detail (NO CONFLICT) */}
      <Route
        path="/product/:slug"
        element={
          <MainLayout>
            <ProductDetailPage />
          </MainLayout>
        }
      />

      {/* Cart */}
      <Route
        path="/cart"
        element={
          <MainLayout>
            <CartPage />
          </MainLayout>
        }
      />

      {/* Footer */}
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

      {/* ───────── AUTH ───────── */}

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

      {/* ───────── USER ───────── */}

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
      {/* /account is an alias for /profile */}
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ───────── ADMIN ───────── */}

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
      <Route
        path="/admin/coupons"
        element={
          <AdminPage>
            <AdminCoupons />
          </AdminPage>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default App;
