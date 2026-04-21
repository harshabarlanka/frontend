import { useState, useEffect, useCallback } from 'react'
import { getAdminOrdersAPI } from '../../api/admin/admin.api'
import { ORDER_STATUSES } from '../../constants/constants_index'
import { getErrorMessage } from '../../utils'
import { InlineLoader } from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import OrderTable from '../../components/admin/OrderTable'

const STATUS_FILTERS = [
  'all',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'shipped',
  'delivered',
  'cancelled',
  'rto',
  'refunded'
]
const PAYMENT_FILTERS = ['all', 'razorpay']

const AdminOrders = () => {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)

  // Filters
  const [statusFilter,  setStatusFilter]  = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [search, setSearch]               = useState('')
  const [searchInput, setSearchInput]     = useState('')

  const fetchOrders = useCallback(async (pg = 1) => {
    try {
      setLoading(true)
      setError(null)
      const params = { page: pg, limit: 20 }
      if (statusFilter  !== 'all') params.status        = statusFilter
      if (paymentFilter !== 'all') params.paymentMethod = paymentFilter
      if (search.trim())           params.search        = search.trim()

      const { data } = await getAdminOrdersAPI(params)
      setOrders(data.data.orders)
      setTotal(data.meta?.total ?? 0)
      setTotalPages(data.meta?.pages ?? 1)
      setPage(pg)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [statusFilter, paymentFilter, search])

  // Re-fetch whenever filters change
  useEffect(() => { fetchOrders(1) }, [statusFilter, paymentFilter, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearch('')
  }

  // Called by OrderTable when an individual order's status changes in-place
  const handleOrderUpdated = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-start justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field pl-9 w-56 py-2 text-sm"
              placeholder="Search order number…"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400 text-sm">🔍</span>
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400
                           hover:text-earth-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="btn-secondary text-sm py-2 px-4">Search</button>
        </form>

        {/* Results count */}
        <p className="font-body text-sm text-earth-500 self-center">
          {total} order{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* ── Filter tabs ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        {/* Status */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-body text-xs font-bold
                         capitalize transition-all ${
                           statusFilter === s
                             ? 'bg-earth-900 text-white'
                             : 'bg-white border border-earth-200 text-earth-600 hover:border-earth-400'
                         }`}
            >
              {s === 'all' ? 'All Statuses' : ORDER_STATUSES[s]?.label || s}
            </button>
          ))}
        </div>

        {/* Payment method */}
        <div className="flex gap-1.5">
          {PAYMENT_FILTERS.map((p) => (
            <button
              key={p}
              onClick={() => setPaymentFilter(p)}
              className={`flex-shrink-0 px-3 py-1 rounded-lg font-body text-xs font-bold
                         capitalize transition-all ${
                           paymentFilter === p
                             ? 'bg-brand-600 text-white'
                             : 'bg-white border border-earth-200 text-earth-500 hover:border-brand-300'
                         }`}
            >
              {p === 'all' ? 'All Payments' : p === 'razorpay' ? '💳 Razorpay' : '💵 COD'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      {loading && <InlineLoader text="Fetching orders…" />}
      {!loading && error && <ErrorState message={error} onRetry={() => fetchOrders(page)} />}

      {!loading && !error && (
        <>
          <OrderTable orders={orders} onOrderUpdated={handleOrderUpdated} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={page === 1}
                onClick={() => fetchOrders(page - 1)}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
              >
                ← Prev
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pg = i + 1
                  return (
                    <button
                      key={pg}
                      onClick={() => fetchOrders(pg)}
                      className={`w-9 h-9 rounded-lg font-body text-sm font-bold transition-all ${
                        pg === page
                          ? 'bg-earth-900 text-white'
                          : 'bg-white border border-earth-200 text-earth-600 hover:border-earth-400'
                      }`}
                    >
                      {pg}
                    </button>
                  )
                })}
                {totalPages > 7 && (
                  <span className="w-9 h-9 flex items-center justify-center text-earth-400 text-sm">…</span>
                )}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => fetchOrders(page + 1)}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminOrders
