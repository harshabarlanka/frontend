import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import "./index.css";

// ── Performance observer: log CWV in development ─────────────────────────────
if (import.meta.env.DEV) {
  import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
    [onCLS, onFCP, onINP, onLCP, onTTFB].forEach((fn) =>
      fn((metric) => console.log(`[CWV] ${metric.name}:`, metric.value.toFixed(1)))
    );
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <CartProvider>
          <App />

          <Toaster
            position="top-right"
            gutter={8}
            containerStyle={{ top: 16, right: 16 }}
            toastOptions={{
              duration: 3500,
              style: {
                background: "#3d1a05",
                color: "#fef9ee",
                fontFamily: '"Lato", sans-serif',
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #883e10",
                maxWidth: "340px",
              },
              success: { iconTheme: { primary: "#62b45a", secondary: "#fef9ee" } },
              error:   { iconTheme: { primary: "#f95630", secondary: "#fef9ee" } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
