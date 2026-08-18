import { useState, useEffect, useRef } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import bgImg from '../assets/image copy.png'
import oilsPodium from '../assets/oils_podium.png'
import scooterPodium from '../assets/scooter_podium.png'
import sunflowerOilImg from '../assets/sunflowerOil.png'
import howItWorksMap from '../assets/how_it_works_map.png'
import howItWorksBasket from '../assets/how_it_works_basket.png'
import howItWorksPayment from '../assets/how_it_works_payment.png'
import howItWorksDelivery from '../assets/how_it_works_delivery.png'
import mustardOilImg from '../assets/MustardOil.png'
import groundnutOilImg from '../assets/GroundnutOil.png'
import coconutOilImg from '../assets/CoconutOil.png'
import oliveOilImg from '../assets/OliveOil.png'
import riceBranOilImg from '../assets/RiceBrainOil.png'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Award, Truck, Lock, Headphones, Leaf, Beaker, Droplet, ArrowRight, ChevronRight, Check } from 'lucide-react'

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

function Homepage({ cartCount, onOpenCart, onOpenNearbyShops, onOpenProfile, userLocation = 'Pune, Maharashtra', onLocationChange }) {
  const [deliveryLocation, setDeliveryLocation] = useState(userLocation)
  const containerRef = useRef(null)

  const categories = [
    { name: "Sunflower Oil", image: sunflowerOilImg },
    { name: "Mustard Oil", image: mustardOilImg },
    { name: "Groundnut Oil", image: groundnutOilImg },
    { name: "Coconut Oil", image: coconutOilImg },
    { name: "Olive Oil", image: oliveOilImg },
    { name: "Rice Bran Oil", image: riceBranOilImg }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entry animations for Hero
      gsap.from('.hero-badge', {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: 'power3.out'
      })

      gsap.from('.hero-title', {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.2,
        ease: 'power4.out'
      })

      gsap.from('.hero-desc', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out'
      })

      gsap.from('.hero-search', {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        delay: 0.5,
        ease: 'power3.out'
      })

      gsap.from('.hero-mini-feature', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.6,
        stagger: 0.15,
        ease: 'power3.out'
      })

      // Category section reveal scroll-bound
      gsap.from('.category-circle', {
        opacity: 0,
        scale: 0.85,
        y: 30,
        duration: 1,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.category-section-trigger',
          start: 'top 90%',
          end: 'top 55%',
          scrub: 1
        }
      })

      // Features Bar reveal scroll-bound
      gsap.from('.floating-bar-item', {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.features-bar-section',
          start: 'top 95%',
          end: 'top 65%',
          scrub: 1
        }
      })

      // Reconstructed 2-card grid reveal scroll-bound
      gsap.from('.goodness-card', {
        opacity: 0,
        x: -80,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.cards-grid-section',
          start: 'top 90%',
          end: 'top 60%',
          scrub: 1
        }
      })

      gsap.from('.scooter-card', {
        opacity: 0,
        x: 80,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.cards-grid-section',
          start: 'top 90%',
          end: 'top 60%',
          scrub: 1
        }
      })

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#010905] text-gray-100 font-sans selection:bg-[#b89547] selection:text-[#010905] overflow-x-hidden">
      {/* Header / Navbar */}
      <Navbar cartCount={cartCount} onOpenCart={onOpenCart} onOpenNearbyShops={onOpenNearbyShops} onOpenProfile={onOpenProfile} userLocation={userLocation} />

      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-12 pb-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImg})` }}
      >
        {/* Subtle Decorative Backdrop Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#031c12]/85 via-[#021710]/90 to-[#010905] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Content Block */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">

              {/* Badge */}
              <div className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#b89547]/10 border border-[#b89547]/30 text-[#b89547] text-xs font-bold tracking-wider uppercase w-fit mb-6">
                <span className="text-sm">⚡</span> Fast & Reliable Oil Delivery
              </div>

              {/* Headings */}
              <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold text-white leading-tight mb-6">
                Pure Oil. <br />
                Delivered <br />
                <span className="text-[#b89547] underline decoration-[#b89547]/30">Within 15 KM.</span>
              </h1>

              {/* Description */}
              <p className="hero-desc text-gray-400 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
                Premium quality cooking oils from trusted local shops, delivered fast to your doorstep.
              </p>

              {/* Location Input Group */}
              <div className="hero-search flex flex-col sm:flex-row items-stretch sm:items-center bg-[#010a06]/85 border border-[#b89547]/30 rounded-2xl p-1.5 max-w-lg mb-10 shadow-lg shadow-black/40">
                <div className="flex items-center flex-1 px-3 py-2.5 sm:py-0">
                  <svg className="w-5 h-5 text-[#b89547] mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter your delivery location"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
                  />
                </div>
                <button 
                  onClick={() => {
                    if (deliveryLocation.trim()) {
                      onLocationChange(deliveryLocation)
                    }
                    onOpenNearbyShops()
                  }}
                  className="bg-gradient-to-r from-[#d4af37] to-[#b89547] hover:from-[#e5c158] hover:to-[#cfa754] text-[#02120b] font-bold text-sm px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-[#b89547]/20 cursor-pointer"
                >
                  Find Shops
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

              {/* Mini Features List */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">

                {/* Feature 1 */}
                <div className="hero-mini-feature flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#b89547]/10 flex items-center justify-center border border-[#b89547]/20">
                    <svg className="w-5 h-5 text-[#b89547]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">15 KM Delivery</span>
                    <span className="text-[11px] text-gray-500">Super fast delivery</span>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="hero-mini-feature flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#b89547]/10 flex items-center justify-center border border-[#b89547]/20">
                    <svg className="w-5 h-5 text-[#b89547]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">100% Pure Oil</span>
                    <span className="text-[11px] text-gray-500">Best quality assured</span>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="hero-mini-feature flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#b89547]/10 flex items-center justify-center border border-[#b89547]/20">
                    <svg className="w-5 h-5 text-[#b89547]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Trusted Local Shops</span>
                    <span className="text-[11px] text-gray-500">Verified & reliable</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* LOWER SECTION CONTAINER: Rich Cream Background */}
      <div className="bg-[#FAF4E8] text-[#02120b] py-16">

        {/* Category Strip */}
        <section className="category-section-trigger max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <div className="text-center mb-10 flex items-center justify-center gap-3">
            <div className="w-10 h-[1px] bg-[#b89547]/45" />
            <h2 className="text-3xl font-serif font-bold tracking-wide">Shop by Category</h2>
            <div className="w-10 h-[1px] bg-[#b89547]/45" />
          </div>

          <div className="relative flex items-center">
            {/* Scrollable Circle Items */}
            <div className="flex gap-6 overflow-x-auto w-full pb-4 scrollbar-none justify-start lg:justify-between px-2">
              {categories.map((cat, index) => (
                <div
                  key={index}
                  className="category-circle flex-shrink-0 flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#b89547]/20 group-hover:border-[#b89547]/75 bg-[#faf9f5] shadow-md flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#02120b] mt-3 group-hover:text-[#b89547] transition-colors">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Slider Next Arrow Icon */}
            <button className="absolute -right-2 top-[30%] -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-[#b89547] transition-colors shadow-lg z-20">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Replaced Features Floating Bar */}
        <section className="features-bar-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <div className="bg-[#031d13] border border-[#b89547]/45 rounded-3xl p-6 md:p-8 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-[#b89547]/20">

            {/* Box 1 */}
            <div className="floating-bar-item flex items-center gap-4 lg:pr-6">
              <Award className="w-10 h-10 text-[#b89547] shrink-0" strokeWidth={1.5} />
              <div className="text-left">
                <h4 className="font-semibold text-white text-base">Premium Quality</h4>
                <p className="text-xs text-gray-400 mt-0.5">Carefully selected brands & oils</p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="floating-bar-item flex items-center gap-4 lg:px-8">
              <Truck className="w-10 h-10 text-[#b89547] shrink-0" strokeWidth={1.5} />
              <div className="text-left">
                <h4 className="font-semibold text-white text-base">Fast Delivery</h4>
                <p className="text-xs text-gray-400 mt-0.5">Quick doorstep delivery</p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="floating-bar-item flex items-center gap-4 lg:px-8">
              <Lock className="w-10 h-10 text-[#b89547] shrink-0" strokeWidth={1.5} />
              <div className="text-left">
                <h4 className="font-semibold text-white text-base">Secure Payment</h4>
                <p className="text-xs text-gray-400 mt-0.5">Multiple safe payment options</p>
              </div>
            </div>

            {/* Box 4 */}
            <div className="floating-bar-item flex items-center gap-4 lg:pl-8">
              <Headphones className="w-10 h-10 text-[#b89547] shrink-0" strokeWidth={1.5} />
              <div className="text-left">
                <h4 className="font-semibold text-white text-base">24/7 Support</h4>
                <p className="text-xs text-gray-400 mt-0.5">We're here to help you anytime</p>
              </div>
            </div>

          </div>
        </section>

        {/* Two-Column Grid: Goodness Card & Scooter Card */}
        <section className="cards-grid-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Card: Goodness Delivered Daily */}
            <div className="goodness-card lg:col-span-8 bg-[#fdfcf9] border border-[#b89547]/25 rounded-[32px] flex flex-col md:flex-row items-stretch justify-between shadow-lg overflow-hidden group">

              {/* Copy Area */}
              <div className="flex-1 p-6 sm:p-7 text-left flex flex-col justify-between z-10 relative">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#b89547]/10 text-[#b89547] text-[10px] font-bold uppercase tracking-wider mb-3.5 border border-[#b89547]/20">
                    👑 Premium Quality
                  </span>

                  <h3 className="text-3xl sm:text-4xl font-serif font-bold leading-tight mb-2">
                    <span className="text-[#02120b] block">Goodness</span>
                    <span className="text-[#b89547] block mt-1">Delivered Daily</span>
                  </h3>

                  {/* Leaf Divider line */}
                  <div className="flex items-center gap-2 my-3">
                    <div className="w-12 h-[1px] bg-[#b89547]/30" />
                    <span className="text-[#b89547] text-[10px]">🌿</span>
                    <div className="w-12 h-[1px] bg-[#b89547]/30" />
                  </div>

                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-5 max-w-sm">
                    We bring you the finest cooking oils from trusted local shops, delivered fresh to your doorstep.
                  </p>
                </div>

                {/* Sub Badges (Circular) */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6.5 h-6.5 rounded-full bg-[#021c12]/10 border border-[#b89547]/20 flex items-center justify-center">
                      <Leaf className="w-3 h-3 text-[#021c12]" />
                    </div>
                    <span className="text-[#02120b] text-[11px] font-bold">100% Natural</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-6.5 h-6.5 rounded-full bg-[#021c12]/10 border border-[#b89547]/20 flex items-center justify-center">
                      <Droplet className="w-3 h-3 text-[#021c12]" />
                    </div>
                    <span className="text-[#02120b] text-[11px] font-bold">No Preservatives</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-6.5 h-6.5 rounded-full bg-[#021c12]/10 border border-[#b89547]/20 flex items-center justify-center">
                      <Beaker className="w-3 h-3 text-[#021c12]" />
                    </div>
                    <span className="text-[#02120b] text-[11px] font-bold">Lab Tested</span>
                  </div>
                </div>

                {/* Explore + Fast Delivery row */}
                <div className="flex flex-wrap items-center gap-3.5 mt-1">
                  <button className="bg-[#2d3a24] hover:bg-[#b89547] text-[#FAF4E8] hover:text-[#02120b] font-bold text-xs px-5 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-[#2d3a24]/10">
                    Explore Products
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2 bg-[#FAF4E8] border border-[#b89547]/15 rounded-xl p-2 shadow-sm">
                    <div className="w-7 h-7 rounded-full bg-[#b89547]/10 flex items-center justify-center text-[#b89547]">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <h5 className="text-[9px] font-bold text-[#02120b] leading-none">Fast & Reliable Delivery</h5>
                      <p className="text-[8px] text-gray-500 mt-0.5 leading-none">Right to your doorstep</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Image Area with Green Background, S-Curve & Gold Stamp */}
              <div className="w-full md:w-[45%] bg-[#022818] md:bg-transparent p-4 flex items-center justify-center shrink-0 relative min-h-[250px] md:min-h-auto z-10">

                {/* Gold Diagonal Slant Divider Background (desktop only) */}
                <svg className="absolute inset-y-0 -left-12 right-0 h-full w-auto text-[#022818] fill-current hidden md:block pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon points="15,0 100,0 100,100 0,100" />
                </svg>

                {/* Cream-colored Diagonal Mask to slant the image on desktop */}
                <svg className="absolute inset-y-0 -left-12 right-0 h-full w-auto text-[#fdfcf9] fill-current hidden md:block pointer-events-none z-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon points="0,0 15,0 0,100" />
                </svg>

                {/* Gold Metallic Slant Line Trace */}
                <svg className="absolute inset-y-0 -left-12 right-0 h-full w-auto text-[#b89547]/45 stroke-current fill-none hidden md:block pointer-events-none z-30" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="15" y1="0" x2="0" y2="100" strokeWidth="2.5" />
                </svg>

                {/* Gold Circular Stamp Overlay */}
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full border border-[#b89547] bg-[#021c12]/85 backdrop-blur-sm flex flex-col items-center justify-center text-[7px] text-[#b89547] font-bold uppercase tracking-widest leading-none z-20 shadow-lg select-none">
                  <span className="scale-[0.8]">Pure Oil</span>
                  <span className="text-[10px] my-0.5">🌿</span>
                  <span className="scale-[0.8]">Promise</span>
                </div>

                <img
                  src={oilsPodium}
                  alt="Premium Oils Showcase Reconstructed"
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500 z-10"
                />
              </div>

            </div>

            {/* Right Card: We Deliver Within 15 KM */}
            <div className="scooter-card lg:col-span-4 bg-[#031d13] text-white border border-[#b89547]/30 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group min-h-[345px]">

              {/* Golden 3D Scooter Image Background Overlay */}
              <div className="absolute inset-0 z-0">
                <img
                  src={scooterPodium}
                  alt="3D Golden Delivery Scooter Showcase"
                  className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
                {/* Dark overlay gradient to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#031d13] via-transparent to-black/35" />
              </div>

              <div className="relative z-10 text-center sm:text-left">
                <h4 className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">We Deliver Within</h4>
                <p className="text-4xl font-extrabold text-[#b89547] my-1">15 KM</p>
                <p className="text-xs text-gray-300">From Shop</p>
              </div>

              {/* Path and Actions */}
              <div className="relative z-10">
                <div className="flex items-center justify-between text-xs px-2 mb-6">
                  <span className="text-gray-300">📍 Shop</span>
                  <div className="flex-1 mx-3 border-b-2 border-dashed border-[#b89547]/35 animate-pulse" />
                  <span className="text-[#b89547] font-bold">🏠 Home</span>
                </div>

                <button className="w-full bg-gradient-to-r from-[#d4af37] to-[#b89547] hover:from-[#e5c158] hover:to-[#cfa754] text-[#02120b] font-bold text-xs py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-[#b89547]/10">
                  Check Availability
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </section>



        {/* How It Works Section */}
        <section className="how-it-works-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">

          {/* Title with gold lines */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="w-12 h-[1px] bg-[#b89547]/35" />
            <h2 className="text-lg font-bold font-serif uppercase tracking-widest text-[#02120b]">How It Works</h2>
            <div className="w-12 h-[1px] bg-[#b89547]/35" />
          </div>

          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 lg:gap-2">

            {/* Step 1 */}
            <div className="how-it-works-card group flex-1 bg-white border border-[#b89547]/15 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-300 relative text-left min-h-[210px] flex flex-col justify-between max-w-xs w-full">
              <div>
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#031d13] text-[#FAF4E8] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    1
                  </div>
                  <h4 className="font-bold text-[#02120b] text-sm tracking-wide">Enter Location</h4>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed pl-1">
                  Enter your location to find nearby oil shops within 15 KM.
                </p>
              </div>
              <div className="flex justify-center items-center mt-4 h-20 shrink-0">
                <img
                  src={howItWorksMap}
                  alt="Enter Location"
                  className="max-h-full w-auto object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="hidden lg:flex items-center justify-center text-[#b89547]/60 text-xl font-bold px-2">
              →
            </div>

            {/* Step 2 */}
            <div className="how-it-works-card group flex-1 bg-white border border-[#b89547]/15 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-300 relative text-left min-h-[210px] flex flex-col justify-between max-w-xs w-full">
              <div>
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#031d13] text-[#FAF4E8] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    2
                  </div>
                  <h4 className="font-bold text-[#02120b] text-sm tracking-wide">Choose Oil</h4>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed pl-1">
                  Browse oils, select quantity and add to cart.
                </p>
              </div>
              <div className="flex justify-center items-center mt-4 h-20 shrink-0">
                <img
                  src={howItWorksBasket}
                  alt="Choose Oil"
                  className="max-h-full w-auto object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="hidden lg:flex items-center justify-center text-[#b89547]/60 text-xl font-bold px-2">
              →
            </div>

            {/* Step 3 */}
            <div className="how-it-works-card group flex-1 bg-white border border-[#b89547]/15 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-300 relative text-left min-h-[210px] flex flex-col justify-between max-w-xs w-full">
              <div>
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#031d13] text-[#FAF4E8] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    3
                  </div>
                  <h4 className="font-bold text-[#02120b] text-sm tracking-wide">Place Order</h4>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed pl-1">
                  Confirm your order and make payment securely.
                </p>
              </div>
              <div className="flex justify-center items-center mt-4 h-20 shrink-0">
                <img
                  src={howItWorksPayment}
                  alt="Place Order"
                  className="max-h-full w-auto object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Arrow 3 */}
            <div className="hidden lg:flex items-center justify-center text-[#b89547]/60 text-xl font-bold px-2">
              →
            </div>

            {/* Step 4 */}
            <div className="how-it-works-card group flex-1 bg-white border border-[#b89547]/15 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-300 relative text-left min-h-[210px] flex flex-col justify-between max-w-xs w-full">
              <div>
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#031d13] text-[#FAF4E8] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    4
                  </div>
                  <h4 className="font-bold text-[#02120b] text-sm tracking-wide">Get It Delivered</h4>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed pl-1">
                  We deliver your order quickly to your doorstep.
                </p>
              </div>
              <div className="flex justify-center items-center mt-4 h-20 shrink-0">
                <img
                  src={howItWorksDelivery}
                  alt="Get It Delivered"
                  className="max-h-full w-auto object-contain transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

          </div>
        </section>

        {/* Dedicated Redesigned Footer Component */}
        <Footer />

      </div>
    </div>
  )
}

export default Homepage
