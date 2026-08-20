import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users as UsersIcon,
  Store,
  FileCheck,
  Package,
  CheckSquare,
  ShoppingBag,
  RotateCcw,
  CreditCard,
  Percent,
  Landmark,
  List,
  Tag,
  BarChart2,
  HelpCircle,
  Settings as SettingsIcon,
  Search,
  Bell,
  HelpCircle as HelpIcon,
  LogOut,
  Droplet
} from 'lucide-react'

// Import subpages
import Dashboard from './Dashboard'
import Orders from './Orders'
import { getAdminStats } from '../ApiServices/adminService'
import Shops from './Shops'
import Products from './Products'
import Users from './Users'
import Settings from './Settings'
import ProductApproval from './ProductApproval'
import VendorVerification from './VendorVerification'

function AdminPanel() {
  const { tab } = useParams()
  const navigate = useNavigate()
  
  const activeTab = tab || 'dashboard'
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}')
  const [profileOpen, setProfileOpen] = useState(false)
  const [stats, setStats] = useState({
    customers: 0,
    vendors: 0,
    vendorVerification: 0,
    products: 0,
    productApproval: 0,
    orders: 0,
    returns: 0
  })

  const fetchStats = () => {
    getAdminStats()
      .then(res => {
        if (res?.success && res?.stats) {
          setStats(res.stats)
        }
      })
      .catch(err => console.error('Failed to load admin stats:', err))
  }

  useEffect(() => {
    fetchStats()
  }, [activeTab])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    navigate('/login', { replace: true })
  }

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', name: 'Customers', icon: UsersIcon, badge: stats.customers > 0 ? String(stats.customers) : undefined },
    { id: 'shops', name: 'Vendors', icon: Store, badge: stats.vendors > 0 ? String(stats.vendors) : undefined },
    { id: 'verification', name: 'Vendor Verification', icon: FileCheck, badge: stats.vendorVerification > 0 ? String(stats.vendorVerification) : undefined, badgeColor: 'bg-green-600' },
    { id: 'products', name: 'Products', icon: Package, badge: stats.products > 0 ? String(stats.products) : undefined },
    { id: 'approval', name: 'Product Approval', icon: CheckSquare, badge: stats.productApproval > 0 ? String(stats.productApproval) : undefined, badgeColor: 'bg-green-600' },
    { id: 'orders', name: 'Orders', icon: ShoppingBag, badge: stats.orders > 0 ? String(stats.orders) : undefined, badgeColor: 'bg-green-600' },
    { id: 'returns', name: 'Returns & Refunds', icon: RotateCcw, badge: stats.returns > 0 ? String(stats.returns) : undefined, badgeColor: 'bg-green-600' },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'support', name: 'Support', icon: HelpCircle },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-gray-800 font-sans flex w-full">

      {/* Sidebar */}
      <aside
        className="bg-[#0b3b84] flex flex-col shrink-0 transition-all duration-300 relative text-white"
        style={{ width: '260px', minWidth: '260px' }}
      >
        {/* Brand logo header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-blue-400/20">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-green-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <Droplet className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white leading-tight">Helthoil</h1>
            <span className="text-[10px] text-blue-200 uppercase tracking-wider block">Admin Dashboard</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-6 custom-scrollbar">
          {navItems.map((item) => {
            // Some items map to the same base component for now, or just show as active if selected
            // If they don't have a component, we just map them to their id.
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/admin/${item.id}`)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                <span className="flex-1 text-left truncate">{item.name}</span>
                {item.badge && (
                  <span className={`min-w-[24px] h-[24px] flex items-center justify-center px-1.5 rounded-full text-[11px] font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : (item.badgeColor ? `${item.badgeColor} text-white` : 'bg-blue-500 text-white')
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer Area (Olive Oil Graphic + Logout) */}
        <div className="p-4 border-t border-blue-400/20 relative">
          {/* Decorative olive oil graphic placeholder */}
          <div className="absolute bottom-16 right-4 text-5xl opacity-40">🫒</div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold text-white hover:bg-blue-800/50 transition-all duration-200 cursor-pointer relative z-10"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-20 border-b border-gray-200 px-8 flex items-center justify-between bg-white sticky top-0 z-40">
          {/* Left menu toggle (hidden on desktop, just placeholder) */}
          <div className="w-8"></div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 w-full focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search orders, customers, vendors, products..." 
                className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
              />
              <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white">⌘ K</span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-gray-800 cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border border-white">
                12
              </span>
            </button>
            <button className="text-gray-500 hover:text-gray-800 cursor-pointer">
              <HelpIcon className="w-5 h-5" />
            </button>

            <div className="relative border-l border-gray-200 pl-6 flex items-center gap-3 cursor-pointer" onClick={() => setProfileOpen(!profileOpen)}>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">
                AS
              </div>
              <div className="hidden lg:block text-left">
                <h4 className="text-sm font-bold text-gray-800 leading-none mb-1">Admin Super</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-[10px] text-gray-500 font-medium">Super Administrator</span>
                </div>
              </div>

              {profileOpen && (
                <div className="absolute right-0 top-12 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <Dashboard stats={stats} />}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'shops' && <Shops />}
          {activeTab === 'verification' && <VendorVerification refreshStats={fetchStats} />}
          {activeTab === 'products' && <Products refreshStats={fetchStats} />}
          {activeTab === 'approval' && <ProductApproval refreshStats={fetchStats} />}
          {activeTab === 'users' && <Users />}
          {activeTab === 'settings' && <Settings />}
          {/* Fallback for non-existing tabs */}
          {!['dashboard', 'orders', 'shops', 'verification', 'products', 'approval', 'users', 'settings'].includes(activeTab) && <Dashboard stats={stats} />}
        </div>
      </main>

    </div>
  )
}

export default AdminPanel
