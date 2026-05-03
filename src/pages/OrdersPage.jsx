import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyOrdersAPI } from "../api/order.api";
import { ORDER_STATUSES } from "../constants/constants_index";
import { formatPrice, formatDate, getErrorMessage } from "../utils";
import { InlineLoader } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import toast from "react-hot-toast";
import { transformImage } from "../utils/imageTransform";

const statusFilters = [
  "all",
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (pg = 1, status = statusFilter) => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: pg, limit: 8 };
      if (status !== "all") params.status = status;
      const { data } = await getMyOrdersAPI(params);
      setOrders(data.data.orders);
      setTotalPages(data.meta?.pages || 1);
      setPage(pg);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, statusFilter);
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-earth-50 animate-fade-in">
      <div className="page-container">
        <div className="mb-8">
          <h1 className="section-title">My Orders</h1>
          <p className="section-subtitle">
            Track and manage all your pickle orders
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-0">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-body text-sm font-bold capitalize transition-all ${
                statusFilter === s
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white border border-earth-200 text-earth-600 hover:border-brand-300"
              }`}
            >
              {s === "all" ? "All Orders" : ORDER_STATUSES[s]?.label || s}
            </button>
          ))}
        </div>

        {loading && <InlineLoader text="Fetching your orders…" />}
        {error && <ErrorState message={error} onRetry={() => fetchOrders()} />}

        {!loading && !error && orders.length === 0 && (
          <EmptyState
            emoji="📦"
            title="No orders yet"
            message={
              statusFilter === "all"
                ? "Looks like you haven't placed any orders. Let's change that!"
                : `No ${statusFilter} orders found.`
            }
            action={
              <Link to="/products" className="btn-primary">
                Shop Now
              </Link>
            }
          />
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  disabled={page === 1}
                  onClick={() => fetchOrders(page - 1)}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="px-4 py-2 font-body text-sm text-earth-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => fetchOrders(page + 1)}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const OrderCard = ({ order }) => {
  const statusInfo = ORDER_STATUSES[order.status] || {
    label: order.status,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="card p-5 hover:shadow-md transition-shadow animate-slide-up">
      <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <p className="font-body font-bold text-earth-900 text-sm">
              {order.orderNumber}
            </p>
            <span className={`badge ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {order.paymentMethod === "cod" && (
              <span className="badge bg-amber-100 text-amber-800">COD</span>
            )}
          </div>
          <p className="font-body text-xs text-earth-400">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-earth-900 text-lg">
            {formatPrice(order.total)}
          </p>
          <p className="font-body text-xs text-earth-400">
            {order.items?.length} item(s)
          </p>
        </div>
      </div>

      {/* Items preview */}
      <div className="flex gap-3 mb-4 overflow-hidden">
        {order.items?.slice(0, 4).map((item, i) => (
          <div
            key={item._id || i}
            className="w-12 h-12 rounded-lg bg-earth-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-xl"
          >
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
        ))}
        {order.items?.length > 4 && (
          <div className="w-12 h-12 rounded-lg bg-earth-100 flex-shrink-0 flex items-center justify-center">
            <span className="font-body text-xs text-earth-500 font-bold">
              +{order.items.length - 4}
            </span>
          </div>
        )}
      </div>

      {/* Item names */}
      <p className="font-body text-sm text-earth-600 mb-4 line-clamp-1">
        {order.items?.map((i) => `${i.name} (${i.size})`).join(", ")}
      </p>

      {/* Progress stepper */}
      {order.status !== "cancelled" && order.status !== "refunded" && (
        <OrderProgressBar status={order.status} />
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-earth-100">
        <Link
          to={`/orders/${order._id}`}
          className="btn-secondary text-sm py-2 px-4"
        >
          View Details
        </Link>
        {order.awbCode && (
          <Link
            to={`/orders/${order._id}`}
            className="btn-ghost text-sm py-2 px-3 text-brand-600"
          >
            📍 Track
          </Link>
        )}
      </div>
    </div>
  );
};

const STEPS = ["Confirmed", "Packed", "Shipped", "Delivered"];
const STATUS_STEP = {
  pending: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  delivered: 4,
};

const OrderProgressBar = ({ status }) => {
  const current = STATUS_STEP[status] ?? 0;
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const done = current >= stepNum;
        const active = current === stepNum;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-body flex-shrink-0 transition-all ${
                done
                  ? "bg-leaf-500 text-white"
                  : active
                    ? "bg-brand-500 text-white ring-4 ring-brand-100"
                    : "bg-earth-200 text-earth-400"
              }`}
            >
              {done ? "✓" : stepNum}
            </div>
            <p
              className={`hidden sm:block font-body text-xs ml-1 mr-1 ${done || active ? "text-earth-700 font-bold" : "text-earth-400"}`}
            >
              {step}
            </p>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 ${current > stepNum ? "bg-leaf-400" : "bg-earth-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrdersPage;
