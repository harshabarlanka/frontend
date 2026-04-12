import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/admin/dashboard': { title: 'Dashboard',   subtitle: 'Overview & stats' },
  '/admin/orders':    { title: 'Orders',       subtitle: 'Manage & fulfil orders' },
  '/admin/products':  { title: 'Products',     subtitle: 'Manage your pickle catalogue' },
  '/admin/users':     { title: 'Users',        subtitle: 'Customer accounts' },
}

const AdminHeader = ({ onMenuToggle }) => {
  const { pathname } = useLocation()
  const { user } = useAuth()

  const page = PAGE_TITLES[pathname] || { title: 'Admin', subtitle: '' }

  return (
    <header className="h-16 bg-white border-b border-earth-100 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-earth-500 hover:bg-earth-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-lg font-bold text-earth-900 leading-tight truncate">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="font-body text-xs text-earth-400 hidden sm:block">{page.subtitle}</p>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Store link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 font-body text-xs text-earth-500
                     hover:text-brand-700 transition-colors px-3 py-1.5 rounded-lg
                     border border-earth-200 hover:border-brand-300"
        >
          <span>🫙</span>
          <span>View Store</span>
        </a>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center
                          text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <span className="font-body text-sm font-bold text-earth-800 hidden md:block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
