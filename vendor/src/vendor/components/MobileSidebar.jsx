import { Link, useLocation } from 'react-router-dom'
import { X, ShieldCheck } from 'lucide-react'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Layers, 
  Store, 
  Tag, 
  CreditCard, 
  RefreshCcw, 
  Star, 
  BarChart2, 
  Bell, 
  Users, 
  HelpCircle, 
  Settings 
} from 'lucide-react'

function MobileSidebar({ isOpen, onClose }) {
  const location = useLocation()
  if (!isOpen) return null

  const menuItems = [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/vendor/orders', icon: ShoppingBag, badge: '5' },
    { name: 'Products', path: '/vendor/products', icon: Package },
    { name: 'Inventory', path: '/vendor/inventory', icon: Layers, badge: 'Low' },
    { name: 'Shop Management', path: '/vendor/shop', icon: Store },
    { name: 'Offers & Coupons', path: '/vendor/offers', icon: Tag },
    { name: 'Payments & Settlements', path: '/vendor/settlements', icon: CreditCard },
    { name: 'Returns & Refunds', path: '/vendor/returns', icon: RefreshCcw },
    { name: 'Reviews', path: '/vendor/reviews', icon: Star },
    { name: 'Reports & Analytics', path: '/vendor/reports', icon: BarChart2 },
    { name: 'Notifications', path: '/vendor/notifications', icon: Bell, badge: '12' },
    { name: 'Staff Management', path: '/vendor/staff', icon: Users },
    { name: 'Support', path: '/vendor/support', icon: HelpCircle },
    { name: 'Settings', path: '/vendor/settings', icon: Settings },
  ]

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer content */}
      <aside className="relative flex flex-col w-64 max-w-xs bg-[#002F24] border-r border-[#D4AF37]/20 text-white animate-in slide-in-from-left duration-200">
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#D4AF37]/15">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#014D3A] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xs font-bold font-serif tracking-wide leading-none text-white">HealthOil</h1>
              <span className="text-[8px] text-[#D4AF37] font-semibold uppercase tracking-wider">Vendor Panel</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-[#D4AF37] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info bar */}
        <div className="p-4 border-b border-[#D4AF37]/10 bg-[#014D3A]/20 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#D4AF37] text-[#002F24] font-bold text-xs flex items-center justify-center shrink-0">
            K
          </div>
          <div className="overflow-hidden text-left">
            <h4 className="text-[10px] font-bold text-white truncate flex items-center gap-1">
              Krishna Oils
              <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
            </h4>
            <span className="text-[8px] text-gray-400 block truncate">ID: #VND-9842</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link 
                key={idx}
                to={item.path}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-[#D4AF37] text-[#002F24] shadow-md shadow-[#D4AF37]/15' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#002F24]' : 'text-[#D4AF37]'}`} />
                <span className="truncate">{item.name}</span>
                {item.badge && (
                  <span className={`ml-auto px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                    item.badge === 'Low' || item.badge === '12'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}

export default MobileSidebar
