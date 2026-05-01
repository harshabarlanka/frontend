import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrderAPI, cancelOrderAPI, trackOrderAPI } from "../api/order.api";
import { ORDER_STATUSES } from "../constants/constants_index";
import {
  formatPrice,
  formatDate,
  formatDateTime,
  getErrorMessage,
} from "../utils";
import { PageLoader } from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import toast from "react-hot-toast";

const STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: "✅" },
  { key: "packed", label: "Packed", icon: "📦" },
  { key: "shipped", label: "Shipped", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🏠" },
];
const STEP_INDEX = {
  pending: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  delivered: 4,
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getOrderAPI(id);
      setOrder(data.data.order);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      setCancelling(true);
      await cancelOrderAPI(id);
      toast.success("Order cancelled successfully");
      fetchOrder();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const handleTrack = async () => {
    try {
      setTrackLoading(true);
      const { data } = await trackOrderAPI(id);
      setTracking(data.data.tracking);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTrackLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error)
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center">
        <ErrorState message={error} onRetry={fetchOrder} />
      </div>
    );
  if (!order) return null;

  const statusInfo = ORDER_STATUSES[order.status] || {
    label: order.status,
    color: "bg-gray-100 text-gray-700",
  };
  const currentStep = STEP_INDEX[order.status] ?? 0;
  const isCancellable = ["pending", "confirmed", "packed"].includes(
    order.status,
  );

  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container">
        {/* Back + header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/orders")}
            className="btn-ghost text-sm mb-4 pl-0"
          >
            ← Back to Orders
          </button>
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-earth-900 mb-1">
                Order {order.orderNumber}
              </h1>
              <p className="font-body text-sm text-earth-500">
                Placed on {formatDateTime(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`badge ${statusInfo.color} text-sm px-3 py-1`}>
                {statusInfo.label}
              </span>
              {isCancellable && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="btn-danger text-sm py-2 px-4"
                >
                  {cancelling ? "Cancelling…" : "Cancel Order"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* ── Tracking stepper ──────────────────────────────────── */}
            {order.status !== "cancelled" && order.status !== "refunded" && (
              <div className="card p-6">
                <h2 className="font-display font-bold text-earth-900 mb-6">
                  Order Status
                </h2>
                <div className="relative">
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-earth-100" />
                  <div className="flex justify-between relative">
                    {STEPS.map((step, i) => {
                      const done = currentStep > i + 1;
                      const active = currentStep === i + 1;
                      return (
                        <div
                          key={step.key}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-all mb-3 ${
                              done
                                ? "bg-leaf-500 text-white shadow-sm"
                                : active
                                  ? "bg-brand-600 text-white shadow-md ring-4 ring-brand-100"
                                  : "bg-earth-100 text-earth-300"
                            }`}
                          >
                            {done ? "✓" : step.icon}
                          </div>
                          <p
                            className={`font-body text-xs text-center font-bold ${
                              done || active
                                ? "text-earth-800"
                                : "text-earth-400"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AWB & live tracking */}
                {order.awbCode && (
                  <div className="mt-6 pt-5 border-t border-earth-100">
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                      <div>
                        <p className="font-body text-sm text-earth-600">
                          <span className="font-bold">Courier:</span>{" "}
                          {order.courierName || "N/A"}
                        </p>
                        <p className="font-body text-sm text-earth-600">
                          <span className="font-bold">AWB:</span>{" "}
                          <code className="bg-earth-100 px-2 py-0.5 rounded font-mono text-xs">
                            {order.awbCode}
                          </code>
                        </p>
                      </div>
                      <button
                        onClick={handleTrack}
                        disabled={trackLoading}
                        className="btn-secondary text-sm py-2"
                      >
                        {trackLoading ? "Fetching…" : "📍 Live Track"}
                      </button>
                    </div>

                    {tracking && (
                      <div className="mt-4 bg-earth-50 rounded-xl p-4">
                        <p className="font-body text-sm font-bold text-earth-800 mb-1">
                          Current: {tracking.currentStatus}
                        </p>
                        {tracking.deliveryDate && (
                          <p className="font-body text-xs text-earth-500">
                            Expected delivery:{" "}
                            {formatDate(tracking.deliveryDate)}
                          </p>
                        )}
                        {tracking.shipmentTrackActivities?.length > 0 && (
                          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                            {tracking.shipmentTrackActivities
                              .slice(0, 6)
                              .map((act, i) => (
                                <div
                                  key={i}
                                  className="flex gap-3 text-xs font-body"
                                >
                                  {/*
                                  FIX Bug 12: Original used act.date which was always
                                  undefined because Shiprocket returns the key as "SR Date".
                                  The service now normalises it to act.date (see shiprocket.service.js).
                                  We also guard with a fallback to avoid "Invalid Date".
                                */}
                                  <span className="text-earth-400 flex-shrink-0 whitespace-nowrap">
                                    {act.date ? formatDateTime(act.date) : "—"}
                                  </span>
                                  <span className="text-earth-700">
                                    {act.activity || act.location || ""}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Cancelled / Refunded notice ───────────────────────── */}
            {(order.status === "cancelled" || order.status === "refunded") && (
              <div className="card p-5 border-spice-200 bg-spice-50">
                <p className="font-body text-sm font-bold text-spice-700 mb-1">
                  {order.status === "cancelled"
                    ? "❌ Order Cancelled"
                    : "↩️ Order Refunded"}
                </p>
                <p className="font-body text-sm text-spice-600">
                  {order.statusHistory?.slice(-1)[0]?.note ||
                    "This order has been cancelled."}
                </p>
              </div>
            )}

            {/* ── Order items ───────────────────────────────────────── */}
            <div className="card p-6">
              <h2 className="font-display font-bold text-earth-900 mb-4">
                Items Ordered ({order.items?.length})
              </h2>
              <div className="divide-y divide-earth-100">
                {order.items?.map((item, i) => (
                  <div
                    key={item._id || i}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="w-16 h-16 rounded-xl bg-earth-100 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0">
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
                    <div className="flex-1">
                      <p className="font-body font-bold text-earth-900">
                        {item.name}
                      </p>
                      <p className="font-body text-sm text-earth-500">
                        {item.size}
                      </p>
                      <p className="font-body text-sm text-earth-600 mt-1">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-display font-bold text-earth-900 text-right">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Status history ────────────────────────────────────── */}
            {order.statusHistory?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display font-bold text-earth-900 mb-4">
                  Activity Log
                </h2>
                <div className="space-y-3">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex gap-3 text-sm font-body">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                        {i < order.statusHistory.length - 1 && (
                          <div className="w-px flex-1 bg-earth-200 mt-1" />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="font-bold text-earth-800 capitalize">
                          {ORDER_STATUSES[h.status]?.label || h.status}
                        </p>
                        {h.note && (
                          <p className="text-earth-500 mt-0.5">{h.note}</p>
                        )}
                        <p className="text-earth-400 text-xs mt-1">
                          {formatDateTime(h.changedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Price summary */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-earth-900 mb-4">
                Price Summary
              </h3>
              <div className="space-y-2 font-body text-sm">
                <div className="flex justify-between text-earth-700">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-earth-700">
                  <span>Shipping</span>
                  <span
                    className={
                      order.shippingCharge === 0
                        ? "text-leaf-700 font-bold"
                        : ""
                    }
                  >
                    {order.shippingCharge === 0
                      ? "FREE"
                      : formatPrice(order.shippingCharge)}
                  </span>
                </div>
                <div className="flex justify-between text-earth-700">
                  <span>GST</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                {/* COD fee row — only for Partial COD orders */}
                {order.paymentMode === "COD_PARTIAL" && order.codFee > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>COD Handling Fee</span>
                    <span className="font-bold">
                      +{formatPrice(order.codFee)}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-earth-100 flex justify-between font-display font-bold text-earth-900 text-base">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                {/* Partial COD split summary */}
                {order.paymentMode === "COD_PARTIAL" && (
                  <div className="pt-2 border-t border-amber-100 space-y-1.5">
                    <div className="flex justify-between text-brand-700 font-bold text-xs">
                      <span>✅ Paid Online</span>
                      <span>{formatPrice(order.advancePaidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-amber-700 font-bold text-xs">
                      <span>💵 Pay on Delivery</span>
                      <span>{formatPrice(order.codRemainingAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment info */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-earth-900 mb-3">
                Payment
              </h3>
              <div className="font-body text-sm space-y-1">
                <p className="text-earth-700">
                  <span className="font-bold">Method:</span>{" "}
                  {order.paymentMode === "COD_PARTIAL"
                    ? "Cash on Delivery (Partial)"
                    : order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                </p>
                {order.paymentId?.status && (
                  <p className="text-earth-700">
                    <span className="font-bold">Status:</span>{" "}
                    <span className="capitalize">
                      {order.paymentId.status === "partial_paid"
                        ? "Advance Paid (COD balance pending)"
                        : order.paymentId.status.replace(/_/g, " ")}
                    </span>
                  </p>
                )}
                {order.paymentId?.razorpayPaymentId && (
                  <p className="text-earth-500 text-xs break-all">
                    ID: {order.paymentId.razorpayPaymentId}
                  </p>
                )}
                {/* COD split details on order page */}
                {order.paymentMode === "COD_PARTIAL" && (
                  <div className="mt-3 pt-3 border-t border-amber-100 space-y-1.5">
                    <div className="flex justify-between text-brand-700 text-xs font-bold">
                      <span>✅ Paid Online</span>
                      <span>{formatPrice(order.advancePaidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-amber-700 text-xs font-bold">
                      <span>💵 Pay on Delivery</span>
                      <span>{formatPrice(order.codRemainingAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping address */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-earth-900 mb-3">
                Delivery Address
              </h3>
              <div className="font-body text-sm text-earth-700 space-y-1">
                <p className="font-bold">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </p>
                <p>PIN: {order.shippingAddress?.pincode}</p>
                <p className="text-earth-500">{order.shippingAddress?.phone}</p>
              </div>
            </div>

            <Link to="/orders" className="btn-secondary w-full justify-center">
              ← All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
