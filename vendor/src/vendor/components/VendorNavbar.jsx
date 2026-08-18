import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, HelpCircle, User, LogOut, ShieldCheck } from 'lucide-react'

function VendorNavbar({ onMenuToggle }) {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('vendorToken')
    navigate('/vendor/login')
  }

  return (
    <header className="h-20 border-b border-gray-200 px-6 flex items-center justify-between bg-white sticky top-0 z-40">
      
      {/* Left side menu toggle */}
      <div className="flex items-center gap-4 w-1/3">
        <button 
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center Search bar */}
      <div className="hidden md:flex w-1/3 justify-center">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 w-full max-w-md shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search orders, products, customers..." 
            className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center justify-end gap-5 w-1/3">
        
        {/* Notification icon */}
        <button 
          className="relative text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center border border-white">
            3
          </span>
        </button>

        {/* Help icon */}
        <button 
          className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          title="Help Center"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Profile dropdown */}
        <div className="relative border-l border-gray-200 pl-5 flex items-center gap-3">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors shrink-0"
          >
            R
          </button>
          
          <div className="hidden lg:block text-left cursor-pointer" onClick={() => setProfileOpen(!profileOpen)}>
            <h4 className="text-sm font-bold text-gray-800 leading-none">Rahul</h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-gray-500 truncate max-w-[100px]">ABC Natural Oils</span>
              <ShieldCheck className="w-3 h-3 text-blue-500" />
              <span className="text-[9px] font-bold text-blue-500">Verified Vendor</span>
            </div>
          </div>

          {profileOpen && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
              <button 
                onClick={() => { setProfileOpen(false); navigate('/vendor/settings'); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Settings
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer border-t border-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default VendorNavbar
