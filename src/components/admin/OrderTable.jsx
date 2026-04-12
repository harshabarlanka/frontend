import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  updateOrderStatusAPI,
  shipOrderAPI,
  adminCancelOrderAPI,
} from '../../api/admin/admin.api'
import { ORDER_STATUSES } from '../../constants'
import { formatPrice, formatDate, getErrorMessage } from '../../utils'
import Loader from '../common/Loader'
import Badge from '../common/Badge'
import toast from 'react-hot-toast'

// ── Status badge variant mapping ─────────────────────────────────────────────
const STATUS_VARIANT = {
  pending:   'warning',
  confirmed: 'info',
  packed:    'purple',
  shipped:   'brand',
  delivered: 'success',
  cancelled: 'danger',
  refunded:  'default',
}

// ── Valid next statuses per current status ────────────────────────────────────
const NEXT_ACTIONS = {
  pending:   [{ status: 'confirmed', label: 'Confirm',  icon: '✅' }],
  confirmed: [{ status: 'packed',    label: 'Mark Packed', icon: '📦' }],
  packed:    [], // ship is handled by separate "Ship" button (Shiprocket)
  shipped:   [{ status: 'delivered', label: 'Mark Delivered', icon: '🏠' }],
  delivered: [],
  cancelled: [],
  refunded:  [],
}

// ── Single row ───────────────────────────────────────────────────────────────
const OrderRow = ({ order, onUpdated }) => {
  const [busy, setBusy] = useState(null) // tracks which action is loading

  const statusInfo    = ORDER_STATUSES[order.status] || { label: order.status }
  const statusVariant = STATUS_VARIANT[order.status] || 'default'
  const nextActions   = NEXT_ACTIONS[order.status] || []

  // Update status (confirm / mark-packed / mark-delivered)
  const handleStatusUpdate = async (newStatus, label) => {
    if (!window.confirm(`Mark this order as "${label}"?`)) return
    try {
      setBusy(newStatus)
      const { data } = await updateOrderStatusAPI(order._id, newStatus)
      toast.success(`Order ${data.data.order.orderNumber} → ${label}`)
      onUpdated(data.data.order)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  // Ship via Shiprocket (POST /admin/orders/:id/ship)
  const handleShip = async () => {
    if (!window.confirm(`Push order ${order.orderNumber} to Shiprocket and ship?`)) return
    try {
      setBusy('ship')
      const { data } = await shipOrderAPI(order._id)
      toast.success(
        `Shipped! AWB: ${data.data.order.awbCode} via ${data.data.order.courierName}`
      )
      onUpdated(data.data.order)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  // Cancel order
  const handleCancel = async () => {
    if (!window.confirm(`Cancel order ${order.orderNumber}? This cannot be undone.`)) return
    try {
      setBusy('cancel')
      await adminCancelOrderAPI(order._id)
      toast.success(`Order ${order.orderNumber} cancelled`)
      onUpdated({ ...order, status: 'cancelled' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const isCancellable = ['pending', 'confirmed', 'packed'].includes(order.status)
  const canShip       = order.status === 'packed' && !order.shiprocketOrderId

  return (
    <tr className="hover:bg-earth-50 transition-colors border-b border-earth-100 last:border-0">
      {/* Order number */}
      <td className="px-4 py-3 whitespace-nowrap">
        <Link
          to={`/admin/orders/${order._id}`}
          className="font-body text-sm font-bold text-brand-700 hover:underline"
        >
          {order.orderNumber}
        </Link>
        <p className="font-body text-xs text-earth-400 mt-0.5">{formatDate(order.createdAt)}</p>
      </td>

      {/* Customer */}
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="font-body text-sm font-bold text-earth-900">
          {order.userId?.name || '—'}
        </p>
        <p className="font-body text-xs text-earth-400 truncate max-w-[160px]">
          {order.userId?.email || '—'}
        </p>
      </td>

      {/* Amount */}
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="font-body text-sm font-bold text-earth-900">{formatPrice(order.total)}</p>
        <p className="font-body text-xs text-earth-400 capitalize">{order.paymentMethod}</p>
      </td>

      {/* Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <Badge variant={statusVariant}>{statusInfo.label}</Badge>
        {order.awbCode && (
          <p className="font-mono text-xs text-earth-400 mt-1">AWB: {order.awbCode}</p>
        )}
      </td>

      {/* Items count */}
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <span className="font-body text-sm text-earth-700">{order.items?.length ?? 0}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Status progression actions */}
          {nextActions.map(({ status, label, icon }) => (
            <button
              key={status}
              onClick={() => handleStatusUpdate(status, label)}
              disabled={!!busy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
                         font-body font-bold bg-blue-50 text-blue-700 border border-blue-200
                         hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy === status ? <Loader size="sm" /> : icon}
              {label}
            </button>
          ))}

          {/* Ship via Shiprocket */}
          {canShip && (
            <button
              onClick={handleShip}
              disabled={!!busy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
                         font-body font-bold bg-indigo-50 text-indigo-700 border border-indigo-200
                         hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy === 'ship' ? <Loader size="sm" /> : '🚚'}
              Ship (Shiprocket)
            </button>
          )}

          {/* Already shipped via Shiprocket */}
          {order.status === 'packed' && order.shiprocketOrderId && (
            <span className="font-body text-xs text-indigo-500 italic">Shipment created</span>
          )}

          {/* Cancel */}
          {isCancellable && (
            <button
              onClick={handleCancel}
              disabled={!!busy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
                         font-body font-bold bg-spice-50 text-spice-700 border border-spice-200
                         hover:bg-spice-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy === 'cancel' ? <Loader size="sm" /> : '✕'}
              Cancel
            </button>
          )}

          {/* Terminal states — no actions */}
          {['delivered', 'cancelled', 'refunded'].includes(order.status) &&
            !nextActions.length && (
            <span className="font-body text-xs text-earth-400 italic">—</span>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Table shell ───────────────────────────────────────────────────────────────
const OrderTable = ({ orders, onOrderUpdated }) => {
  // When a single order is updated (status change), replace it in-place
  const handleUpdated = (updatedOrder) => {
    onOrderUpdated(updatedOrder)
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">📭</div>
        <p className="font-display text-xl text-earth-700 mb-1">No orders found</p>
        <p className="font-body text-earth-400 text-sm">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-earth-200 bg-white">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-earth-200 bg-earth-50">
            {['Order', 'Customer', 'Amount', 'Status', 'Items', 'Actions'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-body text-xs font-bold text-earth-500
                           uppercase tracking-wide whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order._id} order={order} onUpdated={handleUpdated} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrderTable
