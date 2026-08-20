import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  PlusCircle,
  RefreshCcw, 
  CreditCard,
  PieChart,
  Megaphone,
  Star,
  Store, 
  FileText,
  HelpCircle, 
  Headset,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Droplet
} from 'lucide-react'

function VendorSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('vendorSidebarCollapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('vendorSidebarCollapsed', isCollapsed)
  }, [isCollapsed])

  const menuSections = [
    {
      items: [
        { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'CATALOG',
      items: [
        { name: 'Products', path: '/vendor/products', icon: Package },
        { name: 'Add Product', path: '/vendor/products/add', icon: PlusCircle },
      ]
    },
    {
      title: 'ORDERS',
      items: [
        { name: 'Orders', path: '/vendor/orders', icon: ShoppingBag, badge: '12' },
        { name: 'Inventory', path: '/vendor/inventory', icon: Package },
        { name: 'Returns & Refunds', path: '/vendor/returns', icon: RefreshCcw, badge: '2' },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Analytics', path: '/vendor/reports', icon: PieChart },
      ]
    },
    {
      title: 'MARKETING',
      items: [
        { name: 'Promotions', path: '/vendor/offers', icon: Megaphone },
        { name: 'Reviews', path: '/vendor/reviews', icon: Star },
      ]
    },
    {
      title: 'STORE',
      items: [
        { name: 'Store Profile', path: '/vendor/shop', icon: Store },
        { name: 'Documents & Verification', path: '/vendor/kyc', icon: FileText },
      ]
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem('vendorToken')
    navigate('/vendor/login')
  }

  return (
    <aside 
      className="bg-[#0b3b84] flex flex-col shrink-0 transition-all duration-300 relative text-white"
      style={{ width: isCollapsed ? '72px' : '220px' }}
    >
      {/* Brand logo header */}
      <div className="h-16 flex items-center justify-between px-5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-yellow-400 to-green-500 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Droplet className="w-5 h-5 fill-white" />
          </div>
          {!isCollapsed && (
            <div className="text-left leading-tight">
              <h1 className="text-lg font-bold tracking-wide text-white">Helthoil</h1>
              <span className="text-[9px] text-green-300 font-medium uppercase tracking-wider block">Pure Oils, Pure Health</span>
            </div>
          )}
        </div>

        {/* Collapsible Trigger */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-[#0b3b84] border border-blue-400/30 flex items-center justify-center hover:bg-blue-800 cursor-pointer text-white shadow-sm"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 space-y-5 overflow-y-auto scrollbar-none py-6">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && section.title && (
              <h3 className="text-[10px] font-bold text-blue-200/60 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
            )}
            {section.items.map((item, idx) => {
              const isActive = location.pathname.startsWith(item.path)
              return (
                <Link 
                  key={idx}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                  }`}
                  title={item.name}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Logout button footer */}
      <div className="p-4 border-t border-blue-400/20">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-white hover:bg-blue-800/50 transition-all duration-150 cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4 shrink-0 text-white" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default VendorSidebar
