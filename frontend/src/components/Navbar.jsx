import { useState } from 'react'

function Navbar({ cartCount = 0, onOpenCart, onOpenNearbyShops, onOpenProfile, userLocation = 'Pune, Maharashtra' }) {
  const [activeTab, setActiveTab] = useState('Home')
  const location = userLocation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Nearby Shop', href: '#nearby-shops' },
    { name: 'For Vendors', href: '#vendors' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <header className="w-full bg-[#031c12] border-b-2 border-[#b89547] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <div className="flex items-center gap-3">
            {/* Oil Drop Icon */}
            <svg
              className="w-8 h-10 text-[#b89547] fill-current"
              viewBox="0 0 100 120"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M50 0 C 15 65, 10 85, 10 95 A 40 40 0 0 0 90 95 C 90 85, 85 65, 50 0 Z M 50 15 C 75 70, 80 85, 80 95 A 30 30 0 0 1 20 95 C 20 85, 25 70, 50 15 Z" />
              <path d="M50 30 C 65 72, 70 85, 70 95 A 20 20 0 0 1 30 95 C 30 85, 35 72, 50 30 Z" className="opacity-80" />
            </svg>
            <div className="flex flex-col">
              <span className="font-serif text-3xl font-bold tracking-wide text-white leading-none">Oli</span>
              <span className="text-[7px] tracking-[0.25em] text-[#d4af37] font-semibold uppercase mt-1">
                Pure. Trusted. Delivered.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 lg:gap-8 ml-auto mr-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  setActiveTab(link.name)
                  if (link.name === 'Nearby Shop') {
                    e.preventDefault()
                    onOpenNearbyShops()
                  } else {
                    e.preventDefault()
                    const targetId = link.href.replace('#', '')
                    const element = document.getElementById(targetId)
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }
                }}
                className={`relative py-2 text-sm font-medium transition-colors duration-200 ${activeTab === link.name
                    ? 'text-[#b89547]'
                    : 'text-gray-300 hover:text-white'
                  }`}
              >
                {link.name}
                {activeTab === link.name && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b89547] rounded-full" />
                )}
              </a>
            ))}
          </nav>

          {/* Location, Profile, Cart */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">

            {/* Location Selector */}
            <div className="flex items-center gap-2.5 px-4 py-2 bg-black/20 hover:bg-black/30 border border-[#b89547]/30 hover:border-[#b89547]/60 rounded-full cursor-pointer transition-all duration-200">
              <svg className="w-5 h-5 text-[#b89547]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-gray-400 font-medium leading-none">Your Location</span>
                <span className="text-xs text-white font-semibold leading-tight mt-0.5">{location}</span>
              </div>
              <svg className="w-3.5 h-3.5 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Profile Icon */}
            <button 
              onClick={onOpenProfile}
              className="flex items-center justify-center w-11 h-11 rounded-full border border-[#b89547]/30 hover:border-[#b89547] text-[#b89547] hover:text-white transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Cart Icon */}
            <button onClick={onOpenCart} className="relative flex items-center justify-center w-11 h-11 rounded-full border border-[#b89547]/30 hover:border-[#b89547] text-[#b89547] hover:text-white transition-all duration-200">
              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {/* Badge */}
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-5 h-5 px-1 bg-[#b89547] text-[#031c12] text-[10px] font-extrabold rounded-full">
                {cartCount}
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center gap-3">
            {/* Cart Icon (Mobile) */}
            <button onClick={onOpenCart} className="relative flex items-center justify-center w-10 h-10 rounded-full border border-[#b89547]/30 text-[#b89547]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4.5 h-4.5 px-1 bg-[#b89547] text-[#031c12] text-[9px] font-extrabold rounded-full">
                {cartCount}
              </span>
            </button>

            {/* Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#b89547] hover:text-white focus:outline-none"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#02140d] border-t border-[#b89547]/20 px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  setActiveTab(link.name)
                  setIsMobileMenuOpen(false)
                  if (link.name === 'Nearby Shop') {
                    e.preventDefault()
                    onOpenNearbyShops()
                  } else {
                    e.preventDefault()
                    const targetId = link.href.replace('#', '')
                    const element = document.getElementById(targetId)
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === link.name
                    ? 'bg-[#b89547] text-[#031c12]'
                    : 'text-gray-300 hover:text-white hover:bg-black/10'
                  }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#b89547]/20 flex flex-col gap-3">
            {/* Location Selector (Mobile) */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-black/20 border border-[#b89547]/30 rounded-xl">
              <svg className="w-5 h-5 text-[#b89547]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-gray-400 font-medium">Your Location</span>
                <span className="text-xs text-white font-semibold">{location}</span>
              </div>
            </div>

            {/* Profile Button (Mobile) */}
            <button className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#b89547]/30 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
              <svg className="w-5 h-5 text-[#b89547]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Profile
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
