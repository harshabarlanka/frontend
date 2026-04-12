import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import AdminHeader from './AdminHeader'

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-earth-50 overflow-hidden font-body">
      {/* ── Desktop Sidebar (always visible ≥ lg) ─────────────────────── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile Sidebar Drawer ─────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-earth-950/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 flex lg:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader onMenuToggle={() => setSidebarOpen((p) => !p)} />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-screen-xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
