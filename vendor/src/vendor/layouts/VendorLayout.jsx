import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import VendorSidebar from '../components/VendorSidebar'
import VendorNavbar from '../components/VendorNavbar'
import MobileSidebar from '../components/MobileSidebar'

function VendorLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-[#1e293b] font-sans flex w-full">
      
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex">
        <VendorSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <MobileSidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar */}
        <VendorNavbar onMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[100%] mx-auto w-full">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  )
}

export default VendorLayout
