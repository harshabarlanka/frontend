import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markReadyForPickupAPI } from "../../api/admin/admin.api";
import {
  getAdminOrderAPI,
  updateOrderStatusAPI,
  shipOrderAPI,
  adminCancelOrderAPI,
  getOrderInvoiceAPI,
  getOrderLabelAPI,
} from "../../api/admin/admin.api";
import { ORDER_STATUSES } from "../../constants/constants_index";
import {
  formatPrice,
  formatDate,
  formatDateTime,
  getErrorMessage,
} from "../../utils";
import { PageLoader } from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import Badge from "../../components/common/Badge";
import toast from "react-hot-toast";
import { transformImage } from "../../utils/imageTransform";

const STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing Order", icon: "🍳" },
  { key: "ready_for_pickup", label: "Ready for Dispatch", icon: "📦" },
  { key: "shipped", label: "Shipped", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🏠" },
];
const STEP_INDEX = {
  confirmed: 1,
  preparing: 2,
  ready_for_pickup: 3,
  shipped: 4,
  delivered: 5,
};

const STATUS_VARIANT = {
  pending: "warning",
  confirmed: "info",
  preparing: "purple",
  ready_for_pickup: "purple",
  shipped: "brand",
  delivered: "success",
  cancelled: "danger",
  refunded: "default",
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Order Confirmed",
  preparing: "Preparing Order",
  ready_for_pickup: "Ready for Dispatch",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const NEXT_ACTIONS = {
  pending: [{ status: "confirmed", label: "Confirm Order", icon: "✅" }],
  confirmed: [{ status: "preparing", label: "Start Preparing", icon: "🍳" }],
  preparing: [{ status: "ready_for_pickup", label: "Mark Ready", icon: "📦" }],
  ready_for_pickup: [],
  shipped: [],
  delivered: [],
  cancelled: [],
  refunded: [],
};

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  // Feature 3: invoice/label download state
  const [invoiceUrl, setInvoiceUrl] = useState(null);
  const [labelUrl, setLabelUrl] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [labelLoading, setLabelLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getAdminOrderAPI(id);
      const o = data.data.order;
      setOrder(o);
      // Pre-populate cached URLs
      if (o.invoiceUrl) setInvoiceUrl(o.invoiceUrl);
      if (o.labelUrl) setLabelUrl(o.labelUrl);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus, label) => {
    if (!window.confirm(`Mark this order as "${label}"?`)) return;

    try {
      setBusy(newStatus);

      let data;

      // 🔥 SPECIAL CASE: preparing → ready_for_pickup
      if (newStatus === "ready_for_pickup") {
        const res = await markReadyForPickupAPI(order._id);
        data = res.data;
      } else {
        const res = await updateOrderStatusAPI(order._id, newStatus);
        data = res.data;
      }

      toast.success(`Order ${data.data.order.orderNumber} → ${label}`);
      setOrder(data.data.order);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const handleShip = async () => {
    if (
      !window.confirm(`Push order ${order.orderNumber} to Shiprocket and ship?`)
    )
      return;
    try {
      setBusy("ship");
      const { data } = await shipOrderAPI(order._id);
      toast.success(
        `Shipped! AWB: ${data.data.order.awbCode} via ${data.data.order.courierName}`,
      );
      setOrder(data.data.order);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = async () => {
    if (
      !window.confirm(
        `Cancel order ${order.orderNumber}? This cannot be undone.`,
      )
    )
      return;
    try {
      setBusy("cancel");
      await adminCancelOrderAPI(order._id);
      toast.success(`Order ${order.orderNumber} cancelled`);
      fetchOrder();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  // Feature 3: Download Invoice
  const handleDownloadInvoice = async () => {
    if (invoiceUrl) {
      window.open(invoiceUrl, "_blank");
      return;
    }
    setInvoiceLoading(true);
    try {
      const { data } = await getOrderInvoiceAPI(order._id);
      const url = data.data.invoiceUrl;
      setInvoiceUrl(url);
      window.open(url, "_blank");
      toast.success("Invoice opened in new tab.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Feature 3: Download Label
  const handleDownloadLabel = async () => {
    if (labelUrl) {
      window.open(labelUrl, "_blank");
      return;
    }
    setLabelLoading(true);
    try {
      const { data } = await getOrderLabelAPI(order._id);
      const url = data.data.labelUrl;
      setLabelUrl(url);
      window.open(url, "_blank");
      toast.success("Label opened in new tab.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLabelLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <ErrorState message={error} onRetry={fetchOrder} />
      </div>
    );
  if (!order) return null;

  const statusInfo = {
    label:
      STATUS_LABELS[order.status] ||
      ORDER_STATUSES[order.status]?.label ||
      order.status,
  };
  const statusVariant = STATUS_VARIANT[order.status] || "default";
  const currentStep = STEP_INDEX[order.status] ?? 0;
  const nextActions = NEXT_ACTIONS[order.status] || [];

  // Cancel allowed only if no AWB and status is before shipment
  const isCancellable =
    !order.awbCode &&
    ["pending", "confirmed", "preparing"].includes(order.status);
  const canShip =
    order.status === "ready_for_pickup" && !order.shiprocketOrderId;
  const hasShipment = !!order.shiprocketShipmentId || !!order.awbCode;
  const hasShiprocketOrder = !!order.shiprocketOrderId;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/admin/orders")}
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
            <Badge variant={statusVariant}>{statusInfo.label}</Badge>

            {/* Status action buttons */}
            {nextActions.map(({ status, label, icon }) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status, label)}
                disabled={!!busy}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm
                           font-body font-bold bg-blue-50 text-blue-700 border border-blue-200
                           hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {busy === status ? "…" : icon} {label}
              </button>
            ))}

            {canShip && (
              <button
                onClick={handleShip}
                disabled={!!busy}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm
                           font-body font-bold bg-indigo-50 text-indigo-700 border border-indigo-200
                           hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {busy === "ship" ? "…" : "🚚"} Create Shipment
              </button>
            )}

            {/* Invoice download — show if stored URL or shiprocket order exists */}
            {(order.invoiceUrl || hasShiprocketOrder) && (
              <button
                onClick={handleDownloadInvoice}
                disabled={invoiceLoading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm
                           font-body font-bold bg-amber-50 text-amber-700 border border-amber-200
                           hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                {invoiceLoading ? "…" : "📄"}{" "}
                {invoiceLoading ? "Generating…" : "Download Invoice"}
              </button>
            )}

            {/* Label download — show only after shipment exists */}
            {(order.labelUrl || order.awbCode || hasShipment) && (
              <button
                onClick={handleDownloadLabel}
                disabled={labelLoading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm
                           font-body font-bold bg-purple-50 text-purple-700 border border-purple-200
                           hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                {labelLoading ? "…" : "🏷️"}{" "}
                {labelLoading ? "Generating…" : "Download Label"}
              </button>
            )}

            {/* Feature 4: AWB-aware cancel */}
            {isCancellable && (
              <button
                onClick={handleCancel}
                disabled={!!busy}
                className="btn-danger text-sm py-2 px-4"
              >
                {busy === "cancel" ? "Cancelling…" : "Cancel Order"}
              </button>
            )}

            {/* Show non-cancellable reason */}
            {!isCancellable &&
              [
                "pending",
                "confirmed",
                "preparing",
                "ready_for_pickup",
              ].includes(order.status) &&
              order.awbCode && (
                <span className="font-body text-xs text-earth-500 italic">
                  (Cannot cancel — AWB assigned)
                </span>
              )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-earth-900 mb-4">
              Customer
            </h2>
            <div className="font-body text-sm space-y-1 text-earth-700">
              <p className="font-bold text-base">{order.userId?.name || "—"}</p>
              <p>{order.userId?.email || "—"}</p>
              {order.userId?.phone && <p>{order.userId.phone}</p>}
            </div>
          </div>

          {/* Status stepper */}
          {order.status !== "cancelled" && order.status !== "refunded" && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-earth-900 mb-6">
                Order Progress
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
                            done || active ? "text-earth-800" : "text-earth-400"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipment info — only after AWB assigned */}
              {hasShipment && order.awbCode ? (
                <div className="mt-6 pt-5 border-t border-earth-100 font-body text-sm text-earth-700 space-y-1">
                  <p>
                    <span className="font-bold">Courier:</span>{" "}
                    {order.courierName || "N/A"}
                  </p>
                  <p>
                    <span className="font-bold">AWB:</span>{" "}
                    <code className="bg-earth-100 px-2 py-0.5 rounded font-mono text-xs">
                      {order.awbCode}
                    </code>
                  </p>
                  {order.etd && (
                    <p>
                      <span className="font-bold">ETD:</span> {order.etd} days
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-6 pt-5 border-t border-earth-100 font-body text-sm text-earth-400 italic">
                  Not yet shipped
                </div>
              )}
            </div>
          )}

          {/* Cancelled / refunded notice */}
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

          {/* Order items */}
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
                        src={transformImage(item.image)}
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

          {/* Status history */}
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
          {/* Price summary — Feature 7: full breakdown */}
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
                    (order.shippingCost ?? order.shippingCharge) === 0
                      ? "text-leaf-700 font-bold"
                      : ""
                  }
                >
                  {(order.shippingCost ?? order.shippingCharge) === 0
                    ? "FREE"
                    : formatPrice(order.shippingCost ?? order.shippingCharge)}
                </span>
              </div>
              <div className="flex justify-between text-earth-700">
                <span>GST</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              {(order.discountAmount || order.discount) > 0 && (
                <div className="flex justify-between text-leaf-700 font-bold">
                  <span>
                    Discount
                    {order.couponCode && (
                      <span className="font-normal text-earth-400 ml-1">
                        ({order.couponCode})
                      </span>
                    )}
                  </span>
                  <span>
                    −{formatPrice(order.discountAmount || order.discount)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-earth-100 flex justify-between font-display font-bold text-earth-900 text-base">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
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
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
              {order.paymentId?.status && (
                <p className="text-earth-700">
                  <span className="font-bold">Status:</span>{" "}
                  <span className="capitalize">
                    {order.paymentId.status.replace(/_/g, " ")}
                  </span>
                </p>
              )}
              {order.paymentId?.razorpayPaymentId && (
                <p className="text-earth-500 text-xs break-all">
                  ID: {order.paymentId.razorpayPaymentId}
                </p>
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

          {/* Documents panel */}
          {(order.invoiceUrl ||
            hasShiprocketOrder ||
            order.labelUrl ||
            order.awbCode ||
            hasShipment) && (
            <div className="card p-5">
              <h3 className="font-display font-bold text-earth-900 mb-3">
                Documents
              </h3>
              <div className="space-y-2">
                {(order.invoiceUrl || hasShiprocketOrder) && (
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={invoiceLoading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                               text-sm font-body font-bold bg-amber-50 text-amber-700
                               border border-amber-200 hover:bg-amber-100 transition-colors
                               disabled:opacity-50"
                  >
                    📄{" "}
                    {invoiceLoading
                      ? "Generating Invoice…"
                      : "Download Invoice"}
                  </button>
                )}
                {(order.labelUrl || order.awbCode || hasShipment) && (
                  <button
                    onClick={handleDownloadLabel}
                    disabled={labelLoading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                               text-sm font-body font-bold bg-purple-50 text-purple-700
                               border border-purple-200 hover:bg-purple-100 transition-colors
                               disabled:opacity-50"
                  >
                    🏷️ {labelLoading ? "Generating Label…" : "Download Label"}
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate("/admin/orders")}
            className="btn-secondary w-full justify-center"
          >
            ← All Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
