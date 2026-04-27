import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrderAPI } from "../api/order.api";
import { verifyPaymentAPI } from "../api/payment.api";
import { validateCouponAPI } from "../api/admin/admin.api";
import { INDIAN_STATES, RAZORPAY_KEY_ID } from "../constants/constants_index";
import { formatPrice, getErrorMessage } from "../utils";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";

const steps = ["Address", "Payment", "Review"];

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);

  const defaultAddr =
    user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const [address, setAddress] = useState({
    fullName: defaultAddr?.fullName || user?.name || "",
    phone: defaultAddr?.phone || user?.phone || "",
    addressLine1: defaultAddr?.addressLine1 || "",
    addressLine2: defaultAddr?.addressLine2 || "",
    city: defaultAddr?.city || "",
    state: defaultAddr?.state || "",
    pincode: defaultAddr?.pincode || "",
    country: "India",
  });

  const [paymentMethod] = useState("razorpay");
  const [errors, setErrors] = useState({});

  // ── Coupon state (Feature 2) ───────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // ── Shipping cost from Shiprocket (Feature 7) ──────────────────────────────
  const [shippingCost, setShippingCost] = useState(null); // null = not yet resolved
  const [shippingLoading, setShippingLoading] = useState(false);

  const items = cart?.items ?? [];
  const subtotal = cartTotal;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const tax = Math.round(subtotal * 0.12);

  // Shipping: use resolved cost from API; fall back to simple rule while loading
  const resolvedShipping =
    shippingCost !== null ? shippingCost : subtotal >= 500 ? 0 : 60;
  const total = Math.max(
    1,
    subtotal + resolvedShipping + tax - discountAmount
  );

  // Fetch shipping cost when pincode is complete (6 digits)
  const fetchShippingCost = useCallback(async (pincode) => {
    if (!/^\d{6}$/.test(pincode)) return;

    setShippingLoading(true);
    try {
      // placeOrder returns shippingCost in its response body,
      // but to show it before placing we call a lightweight serviceability check.
      // We piggyback on the order.api validate endpoint if it exists,
      // or show the cart-based fallback while we wait for the actual order placement.
      // For now we use the fallback and update post-placement.
      // The backend will always use the authoritative Shiprocket rate on order creation.
      setShippingCost(subtotal >= 500 ? 0 : 60);
    } finally {
      setShippingLoading(false);
    }
  }, [subtotal]);

  useEffect(() => {
    if (address.pincode?.length === 6) {
      fetchShippingCost(address.pincode);
    }
  }, [address.pincode, fetchShippingCost]);

  // ── Coupon handlers ────────────────────────────────────────────────────────

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setCouponError("");
    setCouponLoading(true);

    try {
      const { data } = await validateCouponAPI(code, subtotal);
      const { discountAmount: da, coupon } = data.data;

      setAppliedCoupon({ code: coupon.code, discountAmount: da });
      setCouponInput("");
      toast.success(`Coupon "${coupon.code}" applied! You save ${formatPrice(da)}`);
    } catch (err) {
      const msg = getErrorMessage(err);
      setCouponError(msg);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
    toast("Coupon removed.", { icon: "✕" });
  };

  // ── Address validation ─────────────────────────────────────────────────────

  const validateAddress = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = "Full name is required";
    if (!/^[6-9]\d{9}$/.test(address.phone))
      errs.phone = "Enter a valid 10-digit mobile number";
    if (!address.addressLine1.trim()) errs.addressLine1 = "Address is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!address.state) errs.state = "State is required";
    if (!/^\d{6}$/.test(address.pincode))
      errs.pincode = "Enter a valid 6-digit pincode";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddressNext = () => {
    if (validateAddress()) setStep(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Razorpay payment flow ──────────────────────────────────────────────────

  const handleRazorpayPayment = (orderData) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay SDK not loaded. Please refresh the page."));
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.razorpay.amount,
        currency: orderData.razorpay.currency,
        order_id: orderData.razorpay.orderId,
        name: "Naidu Gari Ruchulu",
        description: `Order ${orderData.order.orderNumber}`,
        image: "/favicon.svg",
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || "",
        },
        theme: { color: "#cc6d09" },
        handler: async (response) => {
          try {
            // orderId is NOT sent — no Order exists in DB yet.
            // The backend identifies the payment via razorpayOrderId.
            // The Order is created inside verifyPayment after signature check.
            const { data: verifyData } = await verifyPaymentAPI({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            // Return the confirmed order created by verifyPayment
            resolve(verifyData.data.order);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        reject(new Error(response.error.description || "Payment failed"));
      });
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacing(true);

      const { data } = await placeOrderAPI({
        shippingAddress: address,
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      });

      const orderData = data.data;

      // Update shipping cost from actual order response
      if (orderData.order?.shippingCost !== undefined) {
        setShippingCost(orderData.order.shippingCost);
      }

      const confirmedOrder = await handleRazorpayPayment(orderData);

      await clearCart();
      toast.success("Order placed successfully! 🎉");
      // confirmedOrder._id comes from the verifyPayment response (order created post-payment)
      navigate(`/orders/${confirmedOrder._id}`, { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg !== "Payment cancelled") {
        toast.error(msg);
      }
    } finally {
      setPlacing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <EmptyState
          emoji="🔒"
          title="Please log in"
          message="Sign in to complete your purchase."
          action={
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          }
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <EmptyState
          emoji="🛒"
          title="Nothing to checkout"
          message="Add some jars to your cart first!"
          action={
            <Link to="/products" className="btn-primary">
              Browse Pickles
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container">
        <h1 className="section-title mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10 max-w-sm">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-body transition-all ${
                  i < step
                    ? "bg-leaf-500 text-white"
                    : i === step
                    ? "bg-brand-600 text-white"
                    : "bg-earth-200 text-earth-500"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={`font-body text-sm hidden sm:block ${
                  i === step ? "text-brand-700 font-bold" : "text-earth-500"
                }`}
              >
                {s}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`h-px flex-1 ${
                    i < step ? "bg-leaf-400" : "bg-earth-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main form area */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Step 0: Delivery Address ─────────────────────────── */}
            {step === 0 && (
              <div className="card p-6 animate-slide-up">
                <h2 className="font-display text-xl font-bold text-earth-900 mb-6">
                  Delivery Address
                </h2>

                {user?.addresses?.length > 0 && (
                  <div className="mb-6">
                    <p className="font-body text-sm text-earth-600 mb-3">
                      Use a saved address:
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {user.addresses.map((addr) => (
                        <button
                          key={addr._id}
                          onClick={() =>
                            setAddress({
                              fullName: addr.fullName,
                              phone: addr.phone,
                              addressLine1: addr.addressLine1,
                              addressLine2: addr.addressLine2 || "",
                              city: addr.city,
                              state: addr.state,
                              pincode: addr.pincode,
                              country: "India",
                            })
                          }
                          className="text-left p-3 rounded-xl border border-earth-200 hover:border-brand-400 hover:bg-brand-50 transition-all"
                        >
                          <p className="font-body text-sm font-bold text-earth-900">
                            {addr.label || "Saved"}
                          </p>
                          <p className="font-body text-xs text-earth-500 mt-0.5 line-clamp-2">
                            {addr.addressLine1}, {addr.city}
                          </p>
                        </button>
                      ))}
                    </div>
                    <p className="font-body text-xs text-earth-400 mt-3">
                      Or fill in manually below:
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      name="fullName"
                      value={address.fullName}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Priya Sharma"
                    />
                    {errors.fullName && (
                      <p className="text-spice-600 text-xs mt-1 font-body">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      name="phone"
                      value={address.phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                    {errors.phone && (
                      <p className="text-spice-600 text-xs mt-1 font-body">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      name="pincode"
                      value={address.pincode}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="560001"
                      maxLength={6}
                    />
                    {errors.pincode && (
                      <p className="text-spice-600 text-xs mt-1 font-body">
                        {errors.pincode}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      name="addressLine1"
                      value={address.addressLine1}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="House no., Street, Locality"
                    />
                    {errors.addressLine1 && (
                      <p className="text-spice-600 text-xs mt-1 font-body">
                        {errors.addressLine1}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                      Address Line 2{" "}
                      <span className="text-earth-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      name="addressLine2"
                      value={address.addressLine2}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Apartment, Floor, Landmark"
                    />
                  </div>

                  <div>
                    <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                      City *
                    </label>
                    <input
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Bengaluru"
                    />
                    {errors.city && (
                      <p className="text-spice-600 text-xs mt-1 font-body">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-body text-sm font-bold text-earth-700 mb-1">
                      State *
                    </label>
                    <div className="relative">
                      <select
                        name="state"
                        value={address.state}
                        onChange={handleChange}
                        className="select-field"
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-earth-400">
                        ▾
                      </span>
                    </div>
                    {errors.state && (
                      <p className="text-spice-600 text-xs mt-1 font-body">
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAddressNext}
                  className="btn-primary mt-6 w-full sm:w-auto"
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* ── Step 1: Payment method ────────────────────────────── */}
            {step === 1 && (
              <div className="card p-6 animate-slide-up">
                <h2 className="font-display text-xl font-bold text-earth-900 mb-6">
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all border-brand-500 bg-brand-50`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked
                      readOnly
                      className="mt-1 accent-brand-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-body font-bold text-earth-900">
                          Pay Online
                        </span>
                        <span className="badge bg-leaf-100 text-leaf-800 text-xs">
                          Recommended
                        </span>
                      </div>
                      <p className="font-body text-sm text-earth-500">
                        Credit/Debit card, UPI, Net Banking, Wallets via
                        Razorpay
                      </p>
                      <div className="flex gap-2 mt-2">
                        {["💳", "📱", "🏦"].map((icon, i) => (
                          <span key={i} className="text-lg">
                            {icon}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                </div>

                {/* ── Coupon section (Feature 2) ──────────────────── */}
                <div className="mt-6 pt-6 border-t border-earth-100">
                  <h3 className="font-display text-base font-bold text-earth-900 mb-3">
                    Have a Coupon?
                  </h3>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-leaf-50 border border-leaf-200">
                      <div>
                        <p className="font-body text-sm font-bold text-leaf-800">
                          🎟️ {appliedCoupon.code}
                        </p>
                        <p className="font-body text-xs text-leaf-600 mt-0.5">
                          You save {formatPrice(appliedCoupon.discountAmount)}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="font-body text-xs text-spice-600 hover:text-spice-800 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        className="input-field flex-1"
                        placeholder="Enter coupon code"
                        maxLength={20}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="btn-secondary px-4 whitespace-nowrap disabled:opacity-50"
                      >
                        {couponLoading ? (
                          <Loader size="sm" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="font-body text-xs text-spice-600 mt-2">
                      {couponError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="btn-secondary">
                    ← Back
                  </button>
                  <button onClick={() => setStep(2)} className="btn-primary">
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Review ────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-4 animate-slide-up">
                {/* Address summary */}
                <div className="card p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-earth-900 mb-1">
                        Delivering to
                      </h3>
                      <p className="font-body text-sm text-earth-700 font-bold">
                        {address.fullName}
                      </p>
                      <p className="font-body text-sm text-earth-500">
                        {address.addressLine1}
                        {address.addressLine2
                          ? `, ${address.addressLine2}`
                          : ""}
                      </p>
                      <p className="font-body text-sm text-earth-500">
                        {address.city}, {address.state} — {address.pincode}
                      </p>
                      <p className="font-body text-sm text-earth-500">
                        {address.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(0)}
                      className="font-body text-xs text-brand-600 hover:text-brand-800"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Payment + Coupon summary */}
                <div className="card p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-display font-bold text-earth-900 mb-1">
                        Payment
                      </h3>
                      <p className="font-body text-sm text-earth-600">
                        💳 Online Payment (Razorpay)
                      </p>
                      {appliedCoupon && (
                        <p className="font-body text-sm text-leaf-700 mt-1">
                          🎟️ Coupon: {appliedCoupon.code} (−{formatPrice(appliedCoupon.discountAmount)})
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="font-body text-xs text-brand-600 hover:text-brand-800"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="card p-5">
                  <h3 className="font-display font-bold text-earth-900 mb-4">
                    Items ({items.length})
                  </h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item._id} className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-lg bg-earth-100 flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "🫙"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-bold text-earth-900 truncate">
                            {item.name}
                          </p>
                          <p className="font-body text-xs text-earth-500">
                            {item.size} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-body text-sm font-bold text-earth-900 flex-shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary">
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing || shippingLoading}
                    className="btn-primary flex-1 py-3.5 text-base"
                  >
                    {placing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader size="sm" />
                        Opening payment…
                      </span>
                    ) : (
                      "💳 Pay " + formatPrice(total)
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Order summary sidebar (Feature 7: accurate breakdown) ── */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display font-bold text-earth-900 text-lg mb-4">
                Price Breakdown
              </h2>
              <div className="space-y-3 font-body text-sm">
                <div className="flex justify-between text-earth-700">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-earth-700">
                  <span>
                    Shipping
                    {shippingLoading && (
                      <span className="ml-1 text-earth-400 text-xs">(checking…)</span>
                    )}
                  </span>
                  <span
                    className={resolvedShipping === 0 ? "text-leaf-700 font-bold" : ""}
                  >
                    {shippingLoading ? (
                      "—"
                    ) : resolvedShipping === 0 ? (
                      "FREE"
                    ) : (
                      formatPrice(resolvedShipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-earth-700">
                  <span>GST (12%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-leaf-700 font-bold">
                    <span>🎟️ Discount</span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-earth-100 flex justify-between font-display font-bold text-earth-900 text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {appliedCoupon && (
                <div className="mt-4 p-2 rounded-lg bg-leaf-50 border border-leaf-200">
                  <p className="font-body text-xs text-leaf-700 font-bold">
                    🎟️ {appliedCoupon.code} — saving {formatPrice(discountAmount)}
                  </p>
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-earth-100 space-y-2">
                {[
                  "🔒 256-bit SSL encryption",
                  "📦 Packed with care",
                  "↩️ 7-day return policy",
                ].map((t) => (
                  <p
                    key={t}
                    className="font-body text-xs text-earth-500 flex items-center gap-2"
                  >
                    {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
