import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAdminOrderAPI, updateOrderStatusAPI, shipOrderAPI, adminCancelOrderAPI } from '../../api/admin/admin.api'
import { ORDER_STATUSES } from '../../constants'
import { formatPrice, formatDate, formatDateTime, getErrorMessage } from '../../utils'
import { PageLoader } from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import Badge from '../../components/common/Badge'
import toast from 'react-hot-toast'

const STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', icon: '✅' },
  { key: 'packed',    label: 'Packed',          icon: '📦' },
  { key: 'shipped',   label: 'Shipped',         icon: '🚚' },
  { key: 'delivered', label: 'Delivered',       icon: '🏠' },
]
const STEP_INDEX = { pending: 0, confirmed: 1, packed: 2, shipped: 3, delivered: 4 }

const STATUS_VARIANT = {
  pending:   'warning',
  confirmed: 'info',
  packed:    'purple',
  shipped:   'brand',
  delivered: 'success',
  cancelled: 'danger',
  refunded:  'default',
}

const NEXT_ACTIONS = {
  pending:   [{ status: 'confirmed', label: 'Confirm Order',   icon: '✅' }],
  confirmed: [{ status: 'packed',    label: 'Mark Packed',     icon: '📦' }],
  packed:    [],
  shipped:   [{ status: 'delivered', label: 'Mark Delivered',  icon: '🏠' }],
  delivered: [],
  cancelled: [],
  refunded:  [],
}

const AdminOrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [busy, setBusy]           = useState(null)

  const fetchOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await getAdminOrderAPI(id)
      setOrder(data.data.order)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrder() }, [id])

  const handleStatusUpdate = async (newStatus, label) => {
    if (!window.confirm(`Mark this order as "${label}"?`)) return
    try {
      setBusy(newStatus)
      const { data } = await updateOrderStatusAPI(order._id, newStatus)
      toast.success(`Order ${data.data.order.orderNumber} → ${label}`)
      setOrder(data.data.order)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const handleShip = async () => {
    if (!window.confirm(`Push order ${order.orderNumber} to Shiprocket and ship?`)) return
    try {
      setBusy('ship')
      const { data } = await shipOrderAPI(order._id)
      toast.success(`Shipped! AWB: ${data.data.order.awbCode} via ${data.data.order.courierName}`)
      setOrder(data.data.order)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm(`Cancel order ${order.orderNumber}? This cannot be undone.`)) return
    try {
      setBusy('cancel')
      await adminCancelOrderAPI(order._id)
      toast.success(`Order ${order.orderNumber} cancelled`)
      fetchOrder()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <PageLoader />
  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorState message={error} onRetry={fetchOrder} />
    </div>
  )
  if (!order) return null

  const statusInfo    = ORDER_STATUSES[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' }
  const statusVariant = STATUS_VARIANT[order.status] || 'default'
  const currentStep   = STEP_INDEX[order.status] ?? 0
  const nextActions   = NEXT_ACTIONS[order.status] || []
  const isCancellable = ['pending', 'confirmed', 'packed'].includes(order.status)
  const canShip       = order.status === 'packed' && !order.shiprocketOrderId

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/admin/orders')}
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
                {busy === status ? '…' : icon} {label}
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
                {busy === 'ship' ? '…' : '🚚'} Ship (Shiprocket)
              </button>
            )}

            {isCancellable && (
              <button
                onClick={handleCancel}
                disabled={!!busy}
                className="btn-danger text-sm py-2 px-4"
              >
                {busy === 'cancel' ? 'Cancelling…' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Customer info — admin-only section */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-earth-900 mb-4">Customer</h2>
            <div className="font-body text-sm space-y-1 text-earth-700">
              <p className="font-bold text-base">{order.userId?.name || '—'}</p>
              <p>{order.userId?.email || '—'}</p>
              {order.userId?.phone && <p>{order.userId.phone}</p>}
            </div>
          </div>

          {/* Status stepper */}
          {order.status !== 'cancelled' && order.status !== 'refunded' && (
            <div className="card p-6">
              <h2 className="font-display font-bold text-earth-900 mb-6">Order Progress</h2>
              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-earth-100" />
                <div className="flex justify-between relative">
                  {STEPS.map((step, i) => {
                    const done   = currentStep > i + 1
                    const active = currentStep === i + 1
                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 transition-all mb-3 ${
                          done   ? 'bg-leaf-500 text-white shadow-sm' :
                          active ? 'bg-brand-600 text-white shadow-md ring-4 ring-brand-100' :
                                   'bg-earth-100 text-earth-300'
                        }`}>
                          {done ? '✓' : step.icon}
                        </div>
                        <p className={`font-body text-xs text-center font-bold ${
                          done || active ? 'text-earth-800' : 'text-earth-400'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* AWB info */}
              {order.awbCode && (
                <div className="mt-6 pt-5 border-t border-earth-100 font-body text-sm text-earth-700 space-y-1">
                  <p><span className="font-bold">Courier:</span> {order.courierName || 'N/A'}</p>
                  <p>
                    <span className="font-bold">AWB:</span>{' '}
                    <code className="bg-earth-100 px-2 py-0.5 rounded font-mono text-xs">{order.awbCode}</code>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cancelled / refunded notice */}
          {(order.status === 'cancelled' || order.status === 'refunded') && (
            <div className="card p-5 border-spice-200 bg-spice-50">
              <p className="font-body text-sm font-bold text-spice-700 mb-1">
                {order.status === 'cancelled' ? '❌ Order Cancelled' : '↩️ Order Refunded'}
              </p>
              <p className="font-body text-sm text-spice-600">
                {order.statusHistory?.slice(-1)[0]?.note || 'This order has been cancelled.'}
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
                <div key={item._id || i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="w-16 h-16 rounded-xl bg-earth-100 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : '🫙'}
                  </div>
                  <div className="flex-1">
                    <p className="font-body font-bold text-earth-900">{item.name}</p>
                    <p className="font-body text-sm text-earth-500">{item.size}</p>
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
              <h2 className="font-display font-bold text-earth-900 mb-4">Activity Log</h2>
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
                      {h.note && <p className="text-earth-500 mt-0.5">{h.note}</p>}
                      <p className="text-earth-400 text-xs mt-1">{formatDateTime(h.changedAt)}</p>
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
            <h3 className="font-display font-bold text-earth-900 mb-4">Price Summary</h3>
            <div className="space-y-2 font-body text-sm">
              <div className="flex justify-between text-earth-700">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-earth-700">
                <span>Shipping</span>
                <span className={order.shippingCharge === 0 ? 'text-leaf-700 font-bold' : ''}>
                  {order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}
                </span>
              </div>
              <div className="flex justify-between text-earth-700">
                <span>GST</span><span>{formatPrice(order.tax)}</span>
              </div>
              <div className="pt-3 border-t border-earth-100 flex justify-between font-display font-bold text-earth-900 text-base">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-earth-900 mb-3">Payment</h3>
            <div className="font-body text-sm space-y-1">
              <p className="text-earth-700">
                <span className="font-bold">Method:</span>{' '}
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
              {order.paymentId?.status && (
                <p className="text-earth-700">
                  <span className="font-bold">Status:</span>{' '}
                  <span className="capitalize">{order.paymentId.status.replace(/_/g, ' ')}</span>
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
            <h3 className="font-display font-bold text-earth-900 mb-3">Delivery Address</h3>
            <div className="font-body text-sm text-earth-700 space-y-1">
              <p className="font-bold">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p>PIN: {order.shippingAddress?.pincode}</p>
              <p className="text-earth-500">{order.shippingAddress?.phone}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/orders')}
            className="btn-secondary w-full justify-center"
          >
            ← All Orders
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetailPage
