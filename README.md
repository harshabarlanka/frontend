# 🫙 Pickle & Co. — React Frontend

Production-ready React frontend for a homemade Indian pickle eCommerce store.
Built with **Vite + React 18 + Tailwind CSS**, featuring a warm artisan aesthetic.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Build Tool | Vite 5 |
| UI Library | React 18 (functional components + hooks) |
| Styling | Tailwind CSS 3 (custom design system) |
| Routing | React Router v6 |
| HTTP Client | Axios (with auto token-refresh interceptor) |
| State | Context API (AuthContext + CartContext) |
| Notifications | react-hot-toast |
| Payments | Razorpay Checkout JS |
| Fonts | Playfair Display (display) + Lato (body) |

---

## Folder Structure

```
src/
├── api/                    # Axios modules — one file per domain
│   ├── axios.js            # Axios instance + JWT interceptor + auto-refresh
│   ├── auth.api.js
│   ├── cart.api.js
│   ├── order.api.js
│   ├── payment.api.js
│   ├── product.api.js
│   └── user.api.js
│
├── components/
│   ├── common/             # Reusable UI atoms
│   │   ├── Badge.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorState.jsx
│   │   ├── Loader.jsx      # Loader, PageLoader, SkeletonCard, SkeletonList, InlineLoader
│   │   ├── Pagination.jsx
│   │   └── StarRating.jsx  # Static + interactive modes
│   ├── layout/
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx      # Responsive, scroll-aware, cart badge, user dropdown
│   │   └── ProtectedRoute.jsx
│   ├── cart/
│   │   └── CartItem.jsx    # Quantity stepper + remove
│   ├── product/
│   │   ├── ProductCard.jsx # Variant selector, add-to-cart, discount badge
│   │   └── ProductGrid.jsx
│   └── order/
│       └── OrderStatusStepper.jsx
│
├── context/
│   ├── AuthContext.jsx     # user, login, register, logout, updateUser
│   └── CartContext.jsx     # cart, addToCart, updateQuantity, removeItem, clearCart
│
├── hooks/
│   └── useFetch.js         # Generic async data fetching hook
│
├── pages/
│   ├── HomePage.jsx        # Hero, categories, featured products, USP section
│   ├── ProductsPage.jsx    # Filterable grid with sidebar filters
│   ├── ProductDetailPage.jsx # Image gallery, variants, reviews, add-to-cart
│   ├── CartPage.jsx        # Cart items, summary, free-shipping progress
│   ├── CheckoutPage.jsx    # 3-step: address → payment → review, Razorpay + COD
│   ├── LoginPage.jsx       # Combined login / register with split layout
│   ├── OrdersPage.jsx      # Order history with status filters + progress bar
│   ├── OrderDetailPage.jsx # Full order detail, live tracking, status history
│   ├── ProfilePage.jsx     # Profile, addresses, change password tabs
│   └── NotFoundPage.jsx    # 404
│
├── constants/index.js      # Categories, order statuses, sort options, states
├── utils/index.js          # formatPrice, formatDate, getErrorMessage, etc.
├── App.jsx                 # Route definitions (lazy-loaded pages)
├── main.jsx                # React root + providers + Toaster
└── index.css               # Tailwind + global component classes
```

---

## Prerequisites

- Node.js **v18+**
- npm or yarn
- Backend running at `http://localhost:5000` (or update `VITE_API_BASE_URL`)
- Razorpay test keys (get from [dashboard.razorpay.com](https://dashboard.razorpay.com))

---

## Setup Instructions

### 1. Install dependencies

```bash
cd pickle-frontend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Your backend API base URL (no trailing slash)
VITE_API_BASE_URL=http://localhost:5000/api

# From Razorpay Dashboard → Settings → API Keys
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx

# App display name
VITE_APP_NAME=Pickle & Co.
```

### 3. Start development server

```bash
npm run dev
```

Opens at **http://localhost:3000**

The Vite dev server proxies all `/api` requests to `http://localhost:5000` automatically — no CORS issues in development.

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`. Serve with Nginx, Vercel, Netlify, or any static host.

---

## Connecting to the Backend

All API calls are centralized in `src/api/`. The base URL is read from the environment:

```js
// src/api/axios.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})
```

**To point to a different backend**, just update `VITE_API_BASE_URL` in `.env` — no code changes needed.

### JWT Token Flow

1. On login/register, `accessToken` and `refreshToken` are stored in `localStorage`
2. Every request automatically includes `Authorization: Bearer <accessToken>` via the Axios request interceptor
3. On a `401` response, the interceptor automatically calls `/auth/refresh-token`, rotates both tokens, and retries the original request — completely transparent to the UI
4. On refresh failure (expired refresh token), the user is redirected to `/login`

---

## Razorpay Integration

The full payment flow lives in `src/pages/CheckoutPage.jsx`:

```
User clicks "Pay ₹598"
  → POST /api/orders  { paymentMethod: 'razorpay', ... }
  → Backend creates Razorpay order → returns { razorpay: { orderId, amount, keyId } }
  → Frontend opens Razorpay modal (window.Razorpay)
  → User completes payment in modal
  → Razorpay calls handler with { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  → POST /api/payment/verify  (HMAC verification server-side)
  → On success: clearCart() → navigate to /orders/:id
```

The Razorpay checkout.js script is loaded in `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

**For test payments**, use Razorpay test credentials and test card `4111 1111 1111 1111`.

---

## Pages Overview

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home — hero, categories, featured | No |
| `/products` | Product listing with filters | No |
| `/products/:slug` | Product detail + reviews | No |
| `/cart` | Cart (shows login prompt if not authed) | No |
| `/login` | Login + Register combined | No |
| `/checkout` | 3-step checkout | ✅ Yes |
| `/orders` | Order history | ✅ Yes |
| `/orders/:id` | Order detail + tracking | ✅ Yes |
| `/profile` | Profile, addresses, password | ✅ Yes |

---

## Design System

### Color Palette

| Token | Purpose | Hex |
|---|---|---|
| `brand-600` | Primary CTAs, buttons | `#cc6d09` |
| `earth-900` | Headings, primary text | `#5b3a30` |
| `earth-500` | Body text, labels | `#b07d56` |
| `earth-50` | Page background | `#faf7f2` |
| `spice-600` | Danger, error, chilli | `#e63a17` |
| `leaf-500` | Success, free shipping | `#3e9636` |

### Component Classes (defined in `index.css`)

```css
.btn-primary     /* Orange CTA button */
.btn-secondary   /* Earth-toned outline button */
.btn-ghost       /* Text-only button */
.btn-danger      /* Red destructive button */
.input-field     /* Styled text input */
.select-field    /* Styled select dropdown */
.card            /* White rounded card with border */
.badge           /* Small pill label */
.section-title   /* Playfair Display h2 */
.page-container  /* Max-width centered container */
.shimmer         /* Animated loading skeleton */
```

### Typography

- **Display font**: Playfair Display (headings, brand name, product names)
- **Body font**: Lato (all UI text, labels, buttons)
- Both loaded from Google Fonts in `index.html`

---

## Key Implementation Details

### Protected Routes
```jsx
// Any protected page:
<Route path="/checkout" element={
  <ProtectedRoute>
    <CheckoutPage />
  </ProtectedRoute>
} />
// ProtectedRoute redirects to /login with { state: { from: location } }
// After login, user is redirected back to the original page
```

### Cart State
- Cart is fetched from the backend on user login
- On logout, cart state resets to empty
- All cart mutations (add/update/remove) hit the backend and update local state with the response
- `cartCount` and `cartTotal` are derived values computed in CartContext

### Code Splitting
All pages except `HomePage` and `LoginPage` are lazy-loaded:
```jsx
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
```
This keeps the initial bundle small (~80KB gzipped).

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Backend API URL, e.g. `https://api.picklestore.com/api` |
| `VITE_RAZORPAY_KEY_ID` | ✅ | Razorpay publishable key (`rzp_test_...` or `rzp_live_...`) |
| `VITE_APP_NAME` | No | App display name, default: `Pickle & Co.` |

> **Note**: All Vite env vars must be prefixed with `VITE_` to be exposed to the client bundle. Never put secret keys (Razorpay secret, JWT secret) in the frontend `.env` — those live only in the backend.

---

## Production Deployment

### Vercel / Netlify
1. Push to GitHub
2. Connect repo in Vercel/Netlify dashboard
3. Set environment variables in the dashboard
4. Set build command: `npm run build`
5. Set output directory: `dist`

### Nginx (self-hosted)
```nginx
server {
  listen 80;
  server_name picklestore.com;
  root /var/www/pickle-frontend/dist;
  index index.html;

  # React Router — all routes serve index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Proxy API calls to backend
  location /api {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### Important: React Router on static hosts
For any static host, configure "rewrite all routes to index.html" so direct URL access and page refreshes work.

---

## Scripts

```bash
npm run dev      # Start dev server on :3000
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```
