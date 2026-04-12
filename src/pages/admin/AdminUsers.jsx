import { useState, useEffect, useCallback } from 'react'
import { getAdminUsersAPI, toggleUserStatusAPI } from '../../api/admin/admin.api'
import { formatDate, getErrorMessage } from '../../utils'
import { InlineLoader } from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)
  const [search, setSearch]     = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [togglingId, setTogglingId] = useState(null)

  const fetchUsers = useCallback(async (pg = 1) => {
    try {
      setLoading(true)
      setError(null)
      const params = { page: pg, limit: 20, role: 'user' }
      if (search.trim()) params.search = search.trim()
      const { data } = await getAdminUsersAPI(params)
      setUsers(data.data.users)
      setTotal(data.meta?.total ?? 0)
      setTotalPages(data.meta?.pages ?? 1)
      setPage(pg)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchUsers(1) }, [search])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const handleToggle = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate'
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} account for ${user.name}?`)) return
    try {
      setTogglingId(user._id)
      const { data } = await toggleUserStatusAPI(user._id)
      setUsers((prev) =>
        prev.map((u) => u._id === user._id ? { ...u, isActive: data.data.user.isActive } : u)
      )
      toast.success(`Account ${data.data.user.isActive ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field pl-9 w-56 py-2 text-sm"
              placeholder="Search by name or email…"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400 text-sm">🔍</span>
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setSearch('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-700 text-xs"
              >✕</button>
            )}
          </div>
          <button type="submit" className="btn-secondary text-sm py-2 px-4">Search</button>
        </form>

        <p className="font-body text-sm text-earth-500">
          {total} customer{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      {loading && <InlineLoader text="Loading users…" />}
      {!loading && error && <ErrorState message={error} onRetry={() => fetchUsers(page)} />}

      {!loading && !error && users.length === 0 && (
        <EmptyState emoji="👥" title="No users found" message="Try a different search." />
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-earth-200 bg-white">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-earth-200 bg-earth-50">
                  {['Customer', 'Phone', 'Joined', 'Status', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-body text-xs font-bold
                                 text-earth-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-earth-100 last:border-0 hover:bg-earth-50 transition-colors"
                  >
                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400
                                        to-earth-600 flex items-center justify-center text-white
                                        font-bold text-sm flex-shrink-0">
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-body text-sm font-bold text-earth-900 truncate">
                            {user.name}
                          </p>
                          <p className="font-body text-xs text-earth-400 truncate max-w-[200px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-body text-sm text-earth-700">{user.phone || '—'}</p>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-body text-sm text-earth-600">{formatDate(user.createdAt)}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggle(user)}
                        disabled={togglingId === user._id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-body
                                   border transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                   ${user.isActive
                                     ? 'bg-spice-50 text-spice-700 border-spice-200 hover:bg-spice-100'
                                     : 'bg-leaf-50 text-leaf-700 border-leaf-200 hover:bg-leaf-100'
                                   }`}
                      >
                        {togglingId === user._id
                          ? '…'
                          : user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={page === 1}
                onClick={() => fetchUsers(page - 1)}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="font-body text-sm text-earth-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => fetchUsers(page + 1)}
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

export default AdminUsers
