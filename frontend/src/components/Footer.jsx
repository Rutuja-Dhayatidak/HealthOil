import logo from '../assets/download.png'
import sunflowerImg from '../assets/footer_sunflower.png'

function Footer() {
  return (
    <footer className="relative bg-[#FAF4E8] text-[#02120b] border-t border-[#b89547]/20 pt-16">
      
      {/* Footer Top Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-left">
          
          {/* Logo & About Column */}
          <div className="lg:col-span-3">
            <div className="flex items-center mb-6">
              <img src={logo} alt="HealthOil" className="h-28 w-auto object-contain" />
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-6 max-w-xs">
              We bring you the finest cooking oils from trusted local shops, delivered fresh to your doorstep.
            </p>
            {/* Social Links */}
            <div className="flex gap-2.5">
              <a href="#" className="w-8 h-8 rounded-full bg-[#faf4e8] border border-[#b89547]/35 flex items-center justify-center text-[#02120b] hover:bg-[#031d13] hover:text-[#FAF4E8] hover:border-[#031d13] transition-all duration-300">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#faf4e8] border border-[#b89547]/35 flex items-center justify-center text-[#02120b] hover:bg-[#031d13] hover:text-[#FAF4E8] hover:border-[#031d13] transition-all duration-300">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#faf4e8] border border-[#b89547]/35 flex items-center justify-center text-[#02120b] hover:bg-[#031d13] hover:text-[#FAF4E8] hover:border-[#031d13] transition-all duration-300">
                {/* Whatsapp SVG */}
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.166.001 6.141 1.233 8.377 3.469 2.235 2.237 3.465 5.214 3.464 8.384-.003 6.525-5.329 11.849-11.86 11.849-2.006 0-3.978-.512-5.713-1.486L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.793 1.452 5.275 0 9.57-4.29 9.573-9.563a9.5 9.5 0 0 0-2.778-6.762A9.444 9.444 0 0 0 11.86 1.547C6.59 1.547 2.296 5.84 2.293 11.115c-.001 1.705.452 3.364 1.31 4.814L2.68 20.315l4.132-1.084z" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#faf4e8] border border-[#b89547]/35 flex items-center justify-center text-[#02120b] hover:bg-[#031d13] hover:text-[#FAF4E8] hover:border-[#031d13] transition-all duration-300">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.545 12 3.545 12 3.545s-7.52 0-9.388.51a3.002 3.002 0 0 0-2.11 2.108C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.868.51 9.388.51 9.388.51s7.52 0 9.388-.51a3.002 3.002 0 0 0 2.11-2.108c.502-1.87.502-5.837.502-5.837s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 md:pl-4">
            <h4 className="text-xs font-bold text-[#031d13] tracking-widest uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Home</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">About Us</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Shop Oils</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">All Categories</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Offers & Deals</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Contact Us</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-[#031d13] tracking-widest uppercase mb-4">Customer Service</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">How It Works</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Delivery Information</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">FAQs</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Privacy Policy</a></li>
            </ul>
          </div>

          {/* My Account */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-[#031d13] tracking-widest uppercase mb-4">My Account</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">My Orders</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Wishlist</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Track Order</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Profile</a></li>
              <li><a href="#" className="hover:text-[#b89547] transition-colors duration-200">Logout</a></li>
            </ul>
          </div>

          {/* Stay Updated */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold text-[#031d13] tracking-widest uppercase mb-4">Stay Updated</h4>
            <p className="text-xs text-gray-600 leading-normal mb-3">
              Subscribe to get special offers, latest updates and healthy tips.
            </p>
            {/* Input Subscription Form */}
            <div className="flex items-stretch rounded-xl border border-[#b89547]/30 bg-white overflow-hidden p-1 shadow-sm max-w-sm mb-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-transparent px-3 text-xs outline-none text-[#02120b]"
              />
              <button className="bg-[#031d13] hover:bg-[#b89547] text-white hover:text-[#02120b] px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        {/* Sunflower Overlap Image */}
        <div className="absolute right-0 bottom-0 pointer-events-none hidden lg:block w-48 h-36 z-0" style={{ mixBlendMode: 'multiply' }}>
          <img src={sunflowerImg} alt="Sunflower Illustration" className="w-full h-full object-contain object-bottom" style={{ mixBlendMode: 'multiply' }} />
        </div>

      </div>

      {/* Footer Bottom Strip (Dark Green) */}
      <div className="bg-[#031d13] text-[#FAF4E8] py-6 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            
            {/* Left/Center Details */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-300">
              
              {/* Item 1: Delivering Area */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#b89547]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span>Delivering within 15 KM (from your selected shop)</span>
              </div>

              {/* Item 2: Customer Help */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#b89547]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <span>Need Help? Call Us <span className="font-bold text-white">+91 12345 67890</span></span>
              </div>

              {/* Item 3: Safety promise */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#b89547]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 11 2 2 4-4" />
                  </svg>
                </div>
                <span>Secure Payments (100% safe & secure)</span>
              </div>

            </div>

            {/* Right Copyright & Payment tags */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-[11px] text-gray-400">© 2025 PureOil. All rights reserved.</span>
              <div className="flex gap-1.5">
                <span className="px-2 py-0.5 rounded bg-white/5 text-white/70 font-mono font-bold text-[9px] border border-white/10 select-none">VISA</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-white/70 font-mono font-bold text-[9px] border border-white/10 select-none">MC</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-white/70 font-mono font-bold text-[9px] border border-white/10 select-none">UPI</span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </footer>
  )
}

export default Footer
