import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardAPI } from '../../api/admin/admin.api'
import { ORDER_STATUSES } from '../../constants'
import { formatPrice, formatDate, getErrorMessage } from '../../utils'
import { InlineLoader } from '../../components/common/Loader'
import Badge from '../../components/common/Badge'
import ErrorState from '../../components/common/ErrorState'

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ emoji, label, value, sub, color = 'brand' }) => {
  const colorMap = {
    brand:  'bg-brand-50 border-brand-200',
    leaf:   'bg-leaf-50  border-leaf-200',
    spice:  'bg-spice-50 border-spice-200',
    blue:   'bg-blue-50  border-blue-200',
  }
  return (
    <div className={`rounded-2xl border p-5 ${colorMap[color] || colorMap.brand}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-sm text-earth-500 mb-1">{label}</p>
          <p className="font-display text-3xl font-bold text-earth-900">{value}</p>
          {sub && <p className="font-body text-xs text-earth-400 mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{emoji}</span>
      </div>
    </div>
  )
}

// ── Status distribution ───────────────────────────────────────────────────────
const StatusBar = ({ ordersByStatus = {} }) => {
  const total = Object.values(ordersByStatus).reduce((a, b) => a + b, 0)
  if (total === 0) return null

  const colors = {
    pending:   'bg-yellow-400',
    confirmed: 'bg-blue-400',
    packed:    'bg-purple-400',
    shipped:   'bg-indigo-400',
    delivered: 'bg-leaf-400',
    cancelled: 'bg-spice-400',
  }

  return (
    <div className="card p-5">
      <h3 className="font-display font-bold text-earth-900 mb-4">Orders by Status</h3>
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-4">
        {Object.entries(ordersByStatus).map(([status, count]) => (
          count > 0 && (
            <div
              key={status}
              className={`${colors[status] || 'bg-earth-300'} transition-all`}
              style={{ width: `${(count / total) * 100}%` }}
              title={`${ORDER_STATUSES[status]?.label || status}: ${count}`}
            />
          )
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.entries(ordersByStatus).map(([status, count]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-earth-300'}`} />
            <span className="font-body text-xs text-earth-600 capitalize">
              {ORDER_STATUSES[status]?.label || status}
            </span>
            <span className="font-body text-xs font-bold text-earth-900 ml-auto">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getDashboardAPI()
      setData(res.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  if (loading) return <InlineLoader text="Loading dashboard…" />
  if (error)   return <ErrorState message={error} onRetry={fetchDashboard} />

  const { stats, recentOrders = [], lowStockProducts = [], ordersByStatus = {} } = data

  return (
    <div className="space-y-6">
      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          emoji="📦"
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          sub={`${stats.monthOrders} this month`}
          color="brand"
        />
        <StatCard
          emoji="💰"
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          sub={`${formatPrice(stats.monthRevenue)} this month`}
          color="leaf"
        />
        <StatCard
          emoji="⏳"
          label="Pending Actions"
          value={stats.pendingOrders}
          sub="Orders needing attention"
          color="spice"
        />
        <StatCard
          emoji="👥"
          label="Total Customers"
          value={stats.totalUsers.toLocaleString()}
          sub={`${stats.orderGrowth > 0 ? '+' : ''}${stats.orderGrowth}% order growth`}
          color="blue"
        />
      </div>

      {/* ── Status distribution ─────────────────────────────────────── */}
      {Object.keys(ordersByStatus).length > 0 && (
        <StatusBar ordersByStatus={ordersByStatus} />
      )}

      <div className="grid xl:grid-cols-3 gap-6">
        {/* ── Recent orders ─────────────────────────────────────────── */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-earth-900">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="font-body text-xs text-brand-600 hover:text-brand-800 font-bold"
            >
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="font-body text-sm text-earth-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-earth-100">
                    {['Order', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                      <th
                        key={h}
                        className="pb-2 text-left font-body text-xs font-bold
                                   text-earth-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-earth-50 hover:bg-earth-50 transition-colors">
                      <td className="py-3 font-body text-sm font-bold text-brand-700 pr-3">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 font-body text-sm text-earth-700 pr-3">
                        {order.userId?.name || '—'}
                      </td>
                      <td className="py-3 font-body text-sm font-bold text-earth-900 pr-3">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge
                          variant={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'danger'  :
                            order.status === 'shipped'   ? 'brand'   :
                            order.status === 'pending'   ? 'warning' : 'info'
                          }
                        >
                          {ORDER_STATUSES[order.status]?.label || order.status}
                        </Badge>
                      </td>
                      <td className="py-3 font-body text-xs text-earth-400">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Low stock ─────────────────────────────────────────────── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-earth-900">Low Stock</h3>
            <Link
              to="/admin/products"
              className="font-body text-xs text-brand-600 hover:text-brand-800 font-bold"
            >
              Manage →
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">✅</p>
              <p className="font-body text-sm text-earth-400">All products are well-stocked</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-start gap-3 p-3 bg-spice-50 rounded-xl border border-spice-100">
                  <span className="text-xl flex-shrink-0">⚠️</span>
                  <div className="min-w-0">
                    <p className="font-body text-sm font-bold text-earth-900 truncate">
                      {product.name}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {product.variants
                        ?.filter((v) => v.stock <= 10)
                        .map((v) => (
                          <p key={v._id} className="font-body text-xs text-spice-700">
                            {v.size}: <span className="font-bold">{v.stock} left</span>
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
