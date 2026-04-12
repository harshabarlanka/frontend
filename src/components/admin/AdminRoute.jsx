import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../common/Loader'

/**
 * AdminRoute guards a route so only users with role === 'admin' can access it.
 * - Still loading  → show full-page loader
 * - Not logged in  → redirect to /login (preserving intended destination)
 * - Logged in but not admin → show access-denied screen (not a redirect,
 *   so the user understands why rather than being silently bounced)
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="text-7xl mb-6">🚫</div>
          <h1 className="font-display text-3xl font-bold text-earth-900 mb-3">
            Access Denied
          </h1>
          <p className="font-body text-earth-500 text-lg mb-8">
            You don&apos;t have permission to access the admin panel.
            This area is restricted to administrators only.
          </p>
          <a href="/" className="btn-primary">
            ← Back to Store
          </a>
        </div>
      </div>
    )
  }

  return children
}

export default AdminRoute
