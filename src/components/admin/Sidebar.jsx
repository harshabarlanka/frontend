import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/orders',    icon: '📦', label: 'Orders'    },
  { to: '/admin/products',  icon: '🫙', label: 'Products'  },
  { to: '/admin/coupons',   icon: '🎟️', label: 'Coupons'   }, // Feature 2
  { to: '/admin/users',     icon: '👥', label: 'Users'     },
]

const Sidebar = ({ collapsed = false, onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      className={`
        flex flex-col h-full bg-earth-950 text-earth-100
        ${collapsed ? 'w-16' : 'w-64'}
        transition-all duration-200
      `}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-earth-800">
        <span className="text-2xl flex-shrink-0">🫙</span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display font-bold text-brand-300 text-sm leading-tight truncate">
              Naidu Gari Ruchulu
            </p>
            <p className="font-body text-earth-500 text-xs">Admin Panel</p>
          </div>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-earth-400 hover:text-earth-100 lg:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg font-body text-sm
               transition-all duration-150 group
               ${isActive
                 ? 'bg-brand-700 text-white font-bold'
                 : 'text-earth-400 hover:bg-earth-800 hover:text-earth-100'
               }`
            }
          >
            <span className="text-lg flex-shrink-0">{icon}</span>
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-earth-800 p-4">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="font-body text-xs font-bold text-earth-200 truncate">{user?.name}</p>
              <p className="font-body text-xs text-earth-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg font-body text-sm
                     text-earth-400 hover:bg-spice-900 hover:text-spice-300 transition-all"
        >
          <span className="text-base flex-shrink-0">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
