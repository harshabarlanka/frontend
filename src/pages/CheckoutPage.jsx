import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrderAPI } from "../api/order.api";
import { verifyPaymentAPI } from "../api/payment.api";
import { validateCouponAPI } from "../api/admin/admin.api";
import { addAddressAPI, getAddressesAPI } from "../api/user.api";
import { RAZORPAY_KEY_ID } from "../constants/constants_index";
import { formatPrice, getErrorMessage } from "../utils";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import AddressCard from "../components/address/AddressCard";
import AddressForm from "../components/address/AddressForm";
import toast from "react-hot-toast";

const STEPS = ["Address", "Payment", "Review"];
const MAX_ADDRESSES = 5;

// ── Partial COD Constants ──────────────────────────────────────────────────────
const COD_FEE = 50; // ₹50 COD handling fee charged by Shiprocket
const COD_ADVANCE_PCT = 0.2; // 20% advance paid online

const toShippingPayload = (addr) => ({
  fullName: addr.fullName,
  phone: addr.phone,
  addressLine1: addr.addressLine1,
  addressLine2: addr.addressLine2 || "",
  city: addr.city,
  state: addr.state,
  pincode: addr.pincode,
  country: addr.country || "India",
});

// ── Tooltip explaining split payment ─────────────────────────────────────────
const CodTooltip = () => (
  <span className="group relative inline-block ml-1 cursor-help align-middle">
    <span className="text-xs bg-amber-200 text-amber-700 rounded-full w-4 h-4 inline-flex items-center justify-center font-bold">
      ?
    </span>
    <span className="pointer-events-none absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-earth-900 text-white text-xs rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl leading-relaxed">
      Pay 20% online via Razorpay to confirm your order. Pay the remaining 80%
      in cash when your order is delivered.
    </span>
  </span>
);

// ── COD Breakdown Panel (shown when COD_PARTIAL selected) ─────────────────────
const CodBreakdown = ({ baseTotal }) => {
  // Display-only estimate; backend always recalculates authoritatively
  const grandTotal = baseTotal + COD_FEE;
  const advance = Math.round(grandTotal * COD_ADVANCE_PCT);
  const remaining = grandTotal - advance;
  return (
    <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Order Total</span>
        <span className="font-semibold">{formatPrice(baseTotal)}</span>
      </div>

      <div className="flex justify-between text-amber-700">
        <span>COD Fee</span>
        <span className="font-semibold">+{formatPrice(COD_FEE)}</span>
      </div>

      <div className="border-t pt-2 flex justify-between font-bold">
        <span>Total</span>
        <span>{formatPrice(grandTotal)}</span>
      </div>

      <div className="border-t pt-2 text-xs space-y-1">
        <div className="flex justify-between text-brand-700 font-semibold">
          <span>Pay Now</span>
          <span>{formatPrice(advance)}</span>
        </div>

        <div className="flex justify-between text-earth-600">
          <span>Pay Later</span>
          <span>{formatPrice(remaining)}</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const { user, updateUser } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);

  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // ── Payment mode: 'ONLINE' (default) | 'COD_PARTIAL' ──────────────────────
  const [paymentMode, setPaymentMode] = useState("ONLINE");

  const [shippingCost, setShippingCost] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  const items = cart?.items ?? [];
  const subtotal = cartTotal;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const resolvedShipping = 60;

  // Display-only totals — backend recalculates everything securely
  const baseTotal = Math.max(1, subtotal + resolvedShipping - discountAmount);
  const codFeeDisplay = paymentMode === "COD_PARTIAL" ? COD_FEE : 0;
  const grandTotal = baseTotal + codFeeDisplay;
  const advanceDisplay =
    paymentMode === "COD_PARTIAL"
      ? Math.round(grandTotal * COD_ADVANCE_PCT)
      : baseTotal;
  const remainingDisplay =
    paymentMode === "COD_PARTIAL" ? grandTotal - advanceDisplay : 0;

  const selectedAddress =
    addresses.find((a) => a._id === selectedAddressId) || null;

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await getAddressesAPI();
      const fresh = data.data.user.addresses || [];
      setAddresses(fresh);
      updateUser({ addresses: fresh });
      const defaultAddr = fresh.find((a) => a.isDefault) || fresh[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      if (fresh.length === 0) setShowAddForm(true);
    } catch {
      const fallback = user?.addresses || [];
      setAddresses(fallback);
      const defaultAddr = fallback.find((a) => a.isDefault) || fallback[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      if (fallback.length === 0) setShowAddForm(true);
    } finally {
      setLoadingAddresses(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    setShippingCost(60);
  }, []);

  const handleAddAddress = async (formData) => {
    setSavingAddress(true);
    try {
      const { data } = await addAddressAPI(formData);
      const updatedAddresses = data.data.addresses;
      setAddresses(updatedAddresses);
      updateUser({ addresses: updatedAddresses });
      const newAddr = updatedAddresses[updatedAddresses.length - 1];
      if (newAddr) setSelectedAddressId(newAddr._id);
      setShowAddForm(false);
      toast.success("Address added!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingAddress(false);
    }
  };

  const handleAddressNext = () => {
    if (!selectedAddressId || !selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    setStep(1);
  };

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
      toast.success(
        `Coupon "${coupon.code}" applied! You save ${formatPrice(da)}`,
      );
    } catch (err) {
      setCouponError(getErrorMessage(err));
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

  // ── Razorpay modal ────────────────────────────────────────────────────────────
  // For COD_PARTIAL: Razorpay opens ONLY for the advance amount.
  // The backend already sets razorpay.amount to the advance for COD_PARTIAL.
  const handleRazorpayPayment = (orderData) =>
    new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay SDK not loaded. Please refresh the page."));
        return;
      }
      const isCod = orderData.order?.paymentMode === "COD_PARTIAL";
      const options = {
        key: RAZORPAY_KEY_ID,
        // razorpay.amount is advance for COD_PARTIAL, full total for ONLINE
        amount: orderData.razorpay.amount,
        currency: orderData.razorpay.currency,
        order_id: orderData.razorpay.orderId,
        name: "Naidu Gari Ruchulu",
        description: isCod
          ? `Advance (20%) — Order ${orderData.order.orderNumber}`
          : `Order ${orderData.order.orderNumber}`,
        image: "/favicon.svg",
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || "",
        },
        theme: { color: isCod ? "#d97706" : "#cc6d09" },
        handler: async (response) => {
          try {
            const { data: verifyData } = await verifyPaymentAPI({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            resolve(verifyData.data.order);
          } catch (err) {
            reject(err);
          }
        },
        modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) =>
        reject(new Error(r.error.description || "Payment failed")),
      );
      rzp.open();
    });

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("No delivery address selected");
      setStep(0);
      return;
    }
    try {
      setPlacing(true);
      // Send paymentMode to backend; backend recalculates all amounts securely
      const { data } = await placeOrderAPI({
        shippingAddress: toShippingPayload(selectedAddress),
        paymentMethod: "razorpay",
        paymentMode, // 'ONLINE' | 'COD_PARTIAL'
        couponCode: appliedCoupon?.code || undefined,
      });
      const orderData = data.data;
      if (orderData.order?.shippingCost !== undefined) {
        setShippingCost(orderData.order.shippingCost);
      }
      const confirmedOrder = await handleRazorpayPayment(orderData);
      await clearCart();
      const isCod = orderData.order?.paymentMode === "COD_PARTIAL";
      toast.success(
        isCod
          ? `Advance paid! Pay ₹${orderData.order.codRemainingAmount} cash on delivery. 🎉`
          : "Order placed successfully! 🎉",
      );
      navigate(`/orders/${confirmedOrder._id}`, { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg !== "Payment cancelled") toast.error(msg);
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
          {STEPS.map((s, i) => (
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
                className={`font-body text-sm hidden sm:block ${i === step ? "text-brand-700 font-bold" : "text-earth-500"}`}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px flex-1 ${i < step ? "bg-leaf-400" : "bg-earth-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* ── STEP 0: Address ─────────────────────────────────────────── */}
            {step === 0 && (
              <div className="card p-6 animate-slide-up">
                <h2 className="font-display text-xl font-bold text-earth-900 mb-6">
                  Delivery Address
                </h2>
                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader />
                  </div>
                ) : (
                  <>
                    {addresses.length > 0 && (
                      <div className="space-y-3 mb-6">
                        <p className="font-body text-sm text-earth-500 font-semibold">
                          Choose a delivery address
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {addresses.map((addr) => (
                            <AddressCard
                              key={addr._id}
                              address={addr}
                              selected={selectedAddressId === addr._id}
                              onSelect={() => setSelectedAddressId(addr._id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {!showAddForm ? (
                      addresses.length < MAX_ADDRESSES ? (
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="w-full py-3 rounded-xl border-2 border-dashed border-earth-200 text-earth-500 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-all font-body text-sm font-bold"
                        >
                          + Add a new address
                        </button>
                      ) : (
                        <p className="font-body text-xs text-earth-400 text-center py-2">
                          You have reached the maximum of 5 saved addresses.
                        </p>
                      )
                    ) : (
                      <div className="mt-4 p-5 rounded-2xl border border-earth-200 bg-earth-50 animate-slide-up">
                        <h3 className="font-display font-bold text-earth-900 mb-4">
                          New Address
                        </h3>
                        <AddressForm
                          onSave={handleAddAddress}
                          onCancel={
                            addresses.length > 0
                              ? () => setShowAddForm(false)
                              : undefined
                          }
                          saving={savingAddress}
                          submitLabel="Save"
                        />
                      </div>
                    )}
                    {!showAddForm && (
                      <button
                        onClick={handleAddressNext}
                        disabled={!selectedAddressId}
                        className="btn-primary mt-6 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue to Payment →
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── STEP 1: Payment ─────────────────────────────────────────── */}
            {step === 1 && (
              <div className="card p-6 animate-slide-up">
                <h2 className="font-display text-xl font-bold text-earth-900 mb-6">
                  Payment Method
                </h2>

                {/* Option A: Pay Online (Razorpay) */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMode === "ONLINE"
                      ? "border-brand-500 bg-brand-50"
                      : "border-earth-200 bg-white hover:border-earth-300 hover:bg-earth-50"
                  }`}
                  onClick={() => setPaymentMode("ONLINE")}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMode === "ONLINE"}
                    onChange={() => setPaymentMode("ONLINE")}
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
                      Credit/Debit card, UPI, Net Banking, Wallets via Razorpay
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

                {/* Option B: Cash on Delivery (Partial) */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all mt-3 ${
                    paymentMode === "COD_PARTIAL"
                      ? "border-amber-400 bg-amber-50"
                      : "border-earth-200 bg-white hover:border-amber-200 hover:bg-amber-50/40"
                  }`}
                  onClick={() => setPaymentMode("COD_PARTIAL")}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD_PARTIAL"
                    checked={paymentMode === "COD_PARTIAL"}
                    onChange={() => setPaymentMode("COD_PARTIAL")}
                    className="mt-1 accent-amber-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-body font-bold text-earth-900">
                        Cash on Delivery
                      </span>
                      <span className="text-xs text-amber-600 font-semibold">
                        (20% advance)
                      </span>
                    </div>

                    <p className="font-body text-sm text-earth-500">
                      Pay a small amount now, rest on delivery
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-lg">💵</span>
                      <span className="text-lg">🏠</span>
                    </div>
                    {/* Breakdown — visible only when this option is selected */}
                    {paymentMode === "COD_PARTIAL" && (
                      <CodBreakdown baseTotal={baseTotal} />
                    )}
                  </div>
                </label>

                {/* Coupon */}
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
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyCoupon()
                        }
                        className="input-field flex-1"
                        placeholder="Enter coupon code"
                        maxLength={20}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="btn-secondary px-4 whitespace-nowrap disabled:opacity-50"
                      >
                        {couponLoading ? <Loader size="sm" /> : "Apply"}
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

            {/* ── STEP 2: Review ──────────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-4 animate-slide-up">
                {/* Address review */}
                <div className="card p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-earth-900 mb-2">
                        Delivering to
                      </h3>
                      {selectedAddress ? (
                        <>
                          <p className="font-body text-sm text-earth-700 font-bold">
                            {selectedAddress.fullName}
                          </p>
                          <p className="font-body text-sm text-earth-500">
                            {selectedAddress.addressLine1}
                            {selectedAddress.addressLine2
                              ? `, ${selectedAddress.addressLine2}`
                              : ""}
                          </p>
                          <p className="font-body text-sm text-earth-500">
                            {selectedAddress.city}, {selectedAddress.state} —{" "}
                            {selectedAddress.pincode}
                          </p>
                          <p className="font-body text-sm text-earth-400">
                            {selectedAddress.phone}
                          </p>
                        </>
                      ) : (
                        <p className="font-body text-sm text-spice-600">
                          No address selected
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setStep(0)}
                      className="font-body text-xs text-brand-600 hover:text-brand-800"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Payment review */}
                <div className="card p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-earth-900 mb-1">
                        Payment
                      </h3>
                      {paymentMode === "COD_PARTIAL" ? (
                        <>
                          <p className="font-body text-sm text-amber-700 font-bold">
                            Cash on Delivery (20% paid)
                          </p>
                          <div className="mt-2 space-y-1 text-xs font-body">
                            <div className="flex justify-between text-earth-600">
                              <span>Paid Online (20%):</span>
                              <span className="font-bold text-brand-700">
                                {formatPrice(advanceDisplay)}
                              </span>
                            </div>
                            <div className="flex justify-between text-earth-600">
                              <span>Pay on Delivery (80%):</span>
                              <span className="font-bold text-amber-700">
                                {formatPrice(remainingDisplay)}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="font-body text-sm text-earth-600">
                          💳 Online Payment (Razorpay)
                        </p>
                      )}
                      {appliedCoupon && (
                        <p className="font-body text-sm text-leaf-700 mt-1">
                          🎟️ {appliedCoupon.code} (−
                          {formatPrice(appliedCoupon.discountAmount)})
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="font-body text-xs text-brand-600 hover:text-brand-800 ml-4"
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

                {/* COD note */}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary">
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing || shippingLoading || !selectedAddress}
                    className={`flex-1 py-3.5 text-base disabled:opacity-60 rounded-xl font-bold font-body transition-all shadow-sm ${
                      paymentMode === "COD_PARTIAL"
                        ? "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white"
                        : "btn-primary"
                    }`}
                  >
                    {placing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader size="sm" /> Opening payment…
                      </span>
                    ) : paymentMode === "COD_PARTIAL" ? (
                      `Pay ${formatPrice(advanceDisplay)} Now`
                    ) : (
                      "💳 Pay " + formatPrice(baseTotal)
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Order summary sidebar ────────────────────────────────────── */}
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
                      <span className="ml-1 text-earth-400 text-xs">
                        (checking…)
                      </span>
                    )}
                  </span>
                  <span
                    className={
                      resolvedShipping === 0 ? "text-leaf-700 font-bold" : ""
                    }
                  >
                    {shippingLoading
                      ? "—"
                      : resolvedShipping === 0
                        ? "FREE"
                        : formatPrice(resolvedShipping)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-leaf-700 font-bold">
                    <span>🎟️ Discount</span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
                {/* COD fee — only shown when COD_PARTIAL selected */}
                {paymentMode === "COD_PARTIAL" && (
                  <div className="flex justify-between text-amber-700">
                    <span>COD Fee</span>
                    <span className="font-bold">+{formatPrice(COD_FEE)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-earth-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-earth-600">
                      Total
                    </span>
                    <span className="text-base font-semibold text-earth-800">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-earth-400 mt-1">
                    Inclusive of all taxes • No hidden charges
                  </p>
                </div>
                {/* COD split in sidebar */}
                {paymentMode === "COD_PARTIAL" && (
                  <div className="pt-2 border-t border-amber-100 space-y-1.5">
                    <div className="flex justify-between text-brand-700 font-bold text-xs">
                      <span>⚡ Pay Now (Online)</span>
                      <span>{formatPrice(advanceDisplay)}</span>
                    </div>
                    <div className="flex justify-between text-amber-600 text-xs">
                      <span>💵 Pay on Delivery</span>
                      <span>{formatPrice(remainingDisplay)}</span>
                    </div>
                  </div>
                )}
              </div>

              {appliedCoupon && (
                <div className="mt-4 p-2 rounded-lg bg-leaf-50 border border-leaf-200">
                  <p className="font-body text-xs text-leaf-700 font-bold">
                    🎟️ {appliedCoupon.code} — saving{" "}
                    {formatPrice(discountAmount)}
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
