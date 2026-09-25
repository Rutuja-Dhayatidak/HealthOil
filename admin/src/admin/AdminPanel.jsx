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
  Droplet,
  MapPin,
  Menu,
  X
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
import CityManagement from './CityManagement'
import Support from './Support'
import NotificationsPanel from './NotificationsPanel'
import Payments from './Payments'


function AdminPanel() {
  const { tab } = useParams()
  const navigate = useNavigate()
  
  const activeTab = tab || 'dashboard'
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [salesRange, setSalesRange] = useState('this_week')
  const [loadingSales, setLoadingSales] = useState(false)
  
  const [stats, setStats] = useState({
    customers: 0,
    vendors: 0,
    vendorVerification: 0,
    products: 0,
    productApproval: 0,
    orders: 0,
    returns: 0
  })

  const fetchStats = (range = salesRange) => {
    setLoadingSales(true)
    getAdminStats(range)
      .then(res => {
        if (res?.success && res?.stats) {
          setStats(res.stats)
        }
      })
      .catch(err => console.error('Failed to load admin stats:', err))
      .finally(() => setLoadingSales(false))
  }

  useEffect(() => {
    fetchStats(salesRange)
  }, [activeTab, salesRange])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    navigate('/admin/login', { replace: true })
  }

  const notifBadgeCount = (stats.vendorVerification || 0) + (stats.productApproval || 0) + (stats.returns || 0)

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', name: 'Customers', icon: UsersIcon, badge: stats.customers > 0 ? String(stats.customers) : undefined },
    { id: 'shops', name: 'Vendors', icon: Store, badge: stats.vendors > 0 ? String(stats.vendors) : undefined },
    { id: 'verification', name: 'Vendor Verification', icon: FileCheck, badge: stats.vendorVerification > 0 ? String(stats.vendorVerification) : undefined, badgeColor: 'bg-green-600' },
    { id: 'cities', name: 'Manage Cities', icon: MapPin },
    { id: 'products', name: 'Products', icon: Package, badge: stats.products > 0 ? String(stats.products) : undefined },
    { id: 'approval', name: 'Product Approval', icon: CheckSquare, badge: stats.productApproval > 0 ? String(stats.productApproval) : undefined, badgeColor: 'bg-green-600' },
    { id: 'orders', name: 'Orders', icon: ShoppingBag, badge: stats.orders > 0 ? String(stats.orders) : undefined, badgeColor: 'bg-green-600' },
    { id: 'returns', name: 'Returns & Refunds', icon: RotateCcw, badge: stats.returns > 0 ? String(stats.returns) : undefined, badgeColor: 'bg-green-600' },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'support', name: 'Help & Support', icon: HelpCircle },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="h-screen overflow-hidden bg-[#F4F7F6] text-gray-800 font-sans flex w-full relative">

      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-[#0b3b84] flex flex-col shrink-0 transition-all duration-300 z-50 text-white fixed lg:sticky top-0 h-screen inset-y-0 left-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: '260px', minWidth: '260px' }}
      >
        {/* Brand logo header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-blue-400/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-green-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white leading-tight">Helthoil</h1>
              <span className="text-[10px] text-blue-200 uppercase tracking-wider block">Admin Dashboard</span>
            </div>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-blue-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-6 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(`/admin/${item.id}`)
                  setMobileMenuOpen(false)
                }}
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

        {/* Footer Area (Logout) */}
        <div className="p-4 border-t border-blue-400/20 relative shrink-0">
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
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-20 border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between bg-white sticky top-0 z-40 shrink-0">
          
          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center mr-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mr-4 sm:mx-8">
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 w-full focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search orders, customers, vendors, products..." 
                className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
              />
              <span className="hidden sm:inline text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white">⌘ K</span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 sm:gap-6 relative">
            
            {/* Bell Icon & Notification Panel */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-gray-500 hover:text-gray-800 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifBadgeCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border border-white">
                    {notifBadgeCount > 9 ? '9+' : notifBadgeCount}
                  </span>
                )}
              </button>

              <NotificationsPanel 
                isOpen={notifOpen} 
                onClose={() => setNotifOpen(false)} 
                onNavigate={(path) => navigate(path)}
                stats={stats}
              />
            </div>

            {/* Help / Question Icon */}
            <button 
              onClick={() => navigate('/admin/support')}
              className="text-gray-500 hover:text-gray-800 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              title="Help & Support"
            >
              <HelpIcon className="w-5 h-5" />
            </button>

            {/* User Profile Menu */}
            <div className="relative border-l border-gray-200 pl-3 sm:pl-6 flex items-center gap-3 cursor-pointer" onClick={() => setProfileOpen(!profileOpen)}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">
                AS
              </div>
              <div className="hidden lg:block text-left">
                <h4 className="text-sm font-bold text-gray-800 leading-none mb-1">
                  {adminData.name || 'Admin Super'}
                </h4>
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
        <div className="flex-1 p-4 sm:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard 
              stats={stats} 
              salesRange={salesRange} 
              setSalesRange={setSalesRange} 
              loadingSales={loadingSales} 
              refreshStats={fetchStats}
            />
          )}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'shops' && <Shops />}
          {activeTab === 'verification' && <VendorVerification refreshStats={fetchStats} />}
          {activeTab === 'cities' && <CityManagement />}
          {activeTab === 'products' && <Products refreshStats={fetchStats} />}
          {activeTab === 'approval' && <ProductApproval refreshStats={fetchStats} />}
          {activeTab === 'users' && <Users />}
          {activeTab === 'payments' && <Payments />}
          {activeTab === 'support' && <Support />}
          {activeTab === 'settings' && <Settings />}
          {/* Fallback for non-existing tabs */}
          {!['dashboard', 'orders', 'shops', 'verification', 'cities', 'products', 'approval', 'users', 'payments', 'support', 'settings'].includes(activeTab) && (
            <Dashboard 
              stats={stats} 
              salesRange={salesRange} 
              setSalesRange={setSalesRange} 
              loadingSales={loadingSales} 
              refreshStats={fetchStats}
            />
          )}

        </div>
      </main>

    </div>
  )
}

export default AdminPanel
