import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, ShieldCheck, Clock, Star, Phone, ShoppingCart, Plus, Minus, Shield, CreditCard, Truck, Award, ShoppingBag } from 'lucide-react'
import bannerBg from '../assets/image copy.png'
import Navbar from '../components/Navbar'
import ProductDetailsDrawer from '../components/ProductDetailsDrawer'
import { fetchPublicShopDetails } from '../ApiServices/publicShopService'

export default function ShopDetailsPage({ shop: initialShopProps, onBackToShops, onAddToCart, cartCount, onOpenCart, onOpenNearbyShops, onOpenProfile }) {
  const [shop, setShop] = useState(initialShopProps)
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Popular')
  const [quantities, setQuantities] = useState({})
  const [addedItemIds, setAddedItemIds] = useState([])
  const [selectedProductForDrawer, setSelectedProductForDrawer] = useState(null)

  useEffect(() => {
    if (!initialShopProps?.id) return
    setShop(initialShopProps)

    const loadShopDetails = async () => {
      setLoading(true)
      const res = await fetchPublicShopDetails(initialShopProps.id)
      if (res && res.success) {
        if (res.shop) {
          setShop(prev => ({ ...prev, ...res.shop }))
        }
        setProductsList(res.products || [])
      }
      setLoading(false)
    }

    loadShopDetails()
  }, [initialShopProps?.id])

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#FAF4E8] text-[#15251F] font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#D4AF37]/25 max-w-md w-full">
          <h2 className="text-2xl font-serif font-bold text-[#002F24] mb-3">No Shop Selected</h2>
          <p className="text-gray-500 text-sm mb-6">Please select a shop from the nearby shops directory to view its details.</p>
          <button 
            onClick={onBackToShops}
            className="w-full h-11 bg-[#002F24] hover:bg-[#014D3A] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
            Back to Directory
          </button>
        </div>
      </div>
    )
  }

  const handleQtyChange = (productId, delta) => {
    setQuantities(prev => {
      const current = prev[productId] || 1
      const next = Math.max(1, current + delta)
      return { ...prev, [productId]: next }
    })
  }

  const handleAddToCartClick = (product) => {
    const qty = quantities[product.id] || 1
    onAddToCart({
      id: product.id,
      name: product.name,
      brand: shop.name,
      variant: product.size,
      price: product.price,
      qty: qty,
      image: product.image
    })
    
    setAddedItemIds(prev => [...prev, product.id])
    setTimeout(() => {
      setAddedItemIds(prev => prev.filter(id => id !== product.id))
    }, 2000)
  }

  // Filter application
  const activeProducts = productsList || []
  const filteredProducts = activeProducts.filter(p => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Cold Pressed') return p.pressedType === 'Cold Pressed'
    if (activeFilter === 'Refined') return p.pressedType === 'Refined'
    if (activeFilter === '1 Litre') return p.size.includes('1 Litre')
    if (activeFilter === 'Popular') return p.popular
    return true
  })

  // Dynamic Logo extraction helpers
  const logoInitial = (shop.name || 'O').charAt(0)
  const brandWords = (shop.name || 'Oli').split(' ')
  const brandMain = brandWords[0] || 'Oli'
  const brandSub = brandWords.slice(1).join(' ') || 'Organic Oils'

  const bannerImage = shop.banner || shop.image || bannerBg

  return (
    <div className="min-h-screen bg-[#FAF4E8] text-[#15251F] font-sans selection:bg-[#D4AF37] selection:text-[#002F24] overflow-x-hidden text-left">
      <Navbar cartCount={cartCount} onOpenCart={onOpenCart} onOpenNearbyShops={onOpenNearbyShops} onOpenProfile={onOpenProfile} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation back */}
        <button 
          onClick={onBackToShops}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#002F24] transition-colors mb-4 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-0.5 transition-transform" />
          Back to Shops Directory
        </button>

        {/* Shop details banner card wrapper */}
        <div 
          className="bg-cover bg-center rounded-none overflow-hidden relative border-2 border-[#D4AF37]/25 min-h-[300px] lg:min-h-[250px] flex flex-col justify-between p-5 md:p-6 pb-[96px] lg:pb-[68px] shadow-sm mb-8"
          style={{ backgroundImage: `url(${bannerImage})` }}
        >
          {/* Tint Overlay */}
          <div className="absolute inset-0 bg-[#001c13]/60 z-0" />

          {/* Banner Contents Top Row */}
          <div className="relative z-10 flex flex-col md:flex-row gap-5 items-center justify-between w-full flex-1">
            <div className="flex gap-5 items-center">
              {/* White Square Logo Container */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl flex items-center justify-center p-3 border border-[#D4AF37]/35 shadow-md shrink-0 select-none overflow-hidden">
                {shop.logo ? (
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="border border-[#D4AF37] rounded-full w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center relative">
                      <span className="font-serif text-[#002F24] font-extrabold text-lg sm:text-xl leading-none">{logoInitial}</span>
                      <span className="absolute -bottom-1.5 text-[8px] sm:text-[9px]">🌿</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#002F24] tracking-wider mt-1.5 uppercase leading-none">{brandMain}</span>
                    <span className="text-[5px] sm:text-[6px] text-gray-400 tracking-widest uppercase mt-0.5 leading-none">{brandSub}</span>
                  </div>
                )}
              </div>

              {/* Title & Status */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-tight leading-tight">{shop.name}</h1>
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold border border-emerald-400 text-emerald-300 bg-emerald-950/30 uppercase tracking-wider shrink-0">
                    ● OPEN NOW
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-300 mt-1 font-bold">Managed by: {shop.owner}</p>
              </div>
            </div>

            {/* Right frame banner badge */}
            <div className="hidden lg:flex border border-[#D4AF37]/35 rounded-xl px-5 py-3 flex-col items-center justify-center bg-black/20 backdrop-blur-sm shrink-0 select-none">
              <span className="font-serif text-[#D4AF37] tracking-widest text-base font-bold uppercase">{shop.name}</span>
              <div className="w-12 h-[1px] bg-[#D4AF37]/60 my-1" />
              <span className="text-[7.5px] text-[#D4AF37]/80 uppercase tracking-[0.25em]">{shop.specialty || 'Organic Oils'}</span>
            </div>
          </div>

          {/* Banner Contents Bottom Row (Metadata Strip) */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#07130f]/90 border-t border-[#D4AF37]/20 px-6 py-2.5 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between z-10 w-full">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-gray-200">
              
              {/* Address */}
              <div className="flex items-center gap-2 text-left">
                <MapPin className="w-4.5 h-4.5 text-[#D4AF37] shrink-0" />
                <div className="text-left leading-tight">
                  <span className="block font-bold">{shop.address.split(',')[0]}</span>
                  <span className="block text-gray-400 text-[8px]">{shop.address.split(',').slice(1).join(',')}</span>
                </div>
              </div>
              
              <div className="hidden lg:block border-r border-white/10 h-8" />

              {/* Distance */}
              <div className="flex items-center gap-2 text-left">
                <span className="text-sm text-[#D4AF37]">🗺️</span>
                <div className="leading-tight">
                  <span className="block font-bold text-white">{shop.distance} KM</span>
                  <span className="block text-gray-400 text-[8px]">Away</span>
                </div>
              </div>

              <div className="hidden lg:block border-r border-white/10 h-8" />

              {/* Rating */}
              <div className="flex items-center gap-2 text-left">
                <Star className="w-4.5 h-4.5 fill-[#D4AF37] text-[#D4AF37] shrink-0" />
                <div className="leading-tight">
                  <span className="block font-bold text-white">{shop.rating}</span>
                  <span className="block text-gray-400 text-[8px]">({shop.reviews} reviews)</span>
                </div>
              </div>

              <div className="hidden lg:block border-r border-white/10 h-8" />

              {/* FSSAI */}
              <div className="flex items-center gap-2 text-left">
                <ShieldCheck className="w-4.5 h-4.5 text-[#D4AF37] shrink-0" />
                <div className="leading-tight flex items-center gap-1">
                  <div>
                    <span className="block font-bold text-white">FSSAI</span>
                    <span className="block text-gray-400 text-[8px]">Certified</span>
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[7.5px] font-bold">✓</span>
                </div>
              </div>

              <div className="hidden lg:block border-r border-white/10 h-8" />

              {/* Clock */}
              <div className="flex items-center gap-2 text-left">
                <Clock className="w-4.5 h-4.5 text-[#D4AF37] shrink-0" />
                <div className="leading-tight">
                  <span className="block font-bold text-white">9:00 AM - 9:00 PM</span>
                  <span className="block text-gray-400 text-[8px]">Everyday</span>
                </div>
              </div>
            </div>

            {/* Action pill buttons */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end shrink-0">
              <a 
                href={`tel:${shop.phone}`}
                className="h-8 px-4 rounded-xl bg-[#002f24] hover:bg-[#014D3A] text-white border border-[#D4AF37] text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 w-full lg:w-auto"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                Call Shop
              </a>
              <button className="h-8 px-4 rounded-xl bg-white hover:bg-gray-50 text-[#002F24] border border-gray-200 text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 w-full lg:w-auto cursor-pointer">
                <span className="text-[#D4AF37] font-semibold text-xs">🔗</span>
                Share
              </button>
            </div>
          </div>
        </div>
        
        {/* Shop Description & Social Links */}
        {(shop.description || shop.socialLinks?.facebook || shop.socialLinks?.instagram || shop.socialLinks?.youtube) && (
          <div className="bg-white rounded-none p-5 md:p-6 border border-[#D4AF37]/15 shadow-sm mb-6 flex flex-col md:flex-row gap-6 justify-between">
            <div className="flex-1">
              <h3 className="font-serif font-bold text-lg text-[#002F24] mb-2 flex items-center gap-2">
                <span className="text-[#D4AF37]">✦</span> About {shop.name}
              </h3>
              {shop.description && (
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{shop.description}</p>
              )}
            </div>
            {Object.values(shop.socialLinks || {}).some(link => link) && (
              <div className="md:w-64 shrink-0 flex flex-col gap-3 border-l-0 md:border-l border-[#D4AF37]/20 md:pl-6">
                <h4 className="font-bold text-xs text-[#002F24] uppercase tracking-wider">Follow Us</h4>
                <div className="flex items-center gap-3">
                  {shop.socialLinks?.facebook && (
                    <a href={shop.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#FAF6EC] flex items-center justify-center text-[#002F24] hover:bg-[#D4AF37] hover:text-white transition-colors border border-[#D4AF37]/30">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                    </a>
                  )}
                  {shop.socialLinks?.instagram && (
                    <a href={shop.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#FAF6EC] flex items-center justify-center text-[#002F24] hover:bg-[#D4AF37] hover:text-white transition-colors border border-[#D4AF37]/30">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.85 3.89 2.3 7.15 2.23c1.27-.06 1.64-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-4.35.2-6.78 2.62-6.98 6.98C0 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98C24 15.67 24 15.26 24 12s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.83a6.17 6.17 0 1 0 0 12.34 6.17 6.17 0 0 0 0-12.34zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.84-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>
                    </a>
                  )}
                  {shop.socialLinks?.youtube && (
                    <a href={shop.socialLinks.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#FAF6EC] flex items-center justify-center text-[#002F24] hover:bg-[#D4AF37] hover:text-white transition-colors border border-[#D4AF37]/30">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM9.5 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Catalog Section */}
        <div className="bg-white rounded-none p-5 md:p-6 border border-[#D4AF37]/15 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-[#b08b35] shrink-0" />
                <h2 className="text-xl font-serif font-bold text-[#002F24] tracking-tight">Shop Products</h2>
              </div>

              {/* Filters Navigation Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Cold Pressed', 'Refined', '1 Litre', 'Popular'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                      activeFilter === tab 
                        ? 'bg-[#002F24] text-white shadow-sm' 
                        : 'bg-[#FAF6EC] text-gray-600 hover:bg-[#efe7d3]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Filter Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-400">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#FAF6EC] text-[#002F24] outline-none font-bold py-1.5 px-3 rounded-xl border border-gray-200/60 cursor-pointer"
              >
                <option value="Popular">Popular</option>
                <option value="PriceLow">Price: Low to High</option>
                <option value="PriceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isAdded = addedItemIds.includes(product.id)
              const qty = quantities[product.id] || 1
              return (
                <div 
                  key={product.id}
                  className="bg-[#FAF6EC] border border-gray-100 hover:border-[#D4AF37]/35 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group text-left"
                >
                  {/* Main Info Row (Image Left, Text Right) */}
                  <div 
                    className="flex gap-5 cursor-pointer"
                    onClick={() => setSelectedProductForDrawer(product)}
                  >
                    {/* Left Column: Product Image */}
                    <div className="w-[120px] sm:w-[140px] h-[170px] bg-transparent flex items-center justify-center shrink-0 overflow-hidden relative">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="h-4/5 w-4/5 bg-[#002F24]/5 rounded-xl border border-[#D4AF37]/20 flex flex-col items-center justify-center">
                          <span className="text-2xl mb-1">🛢️</span>
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Details & Pricing */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Category Tag */}
                        <span className="inline-block bg-emerald-50 text-emerald-700 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider mb-1.5">
                          {product.pressedType}
                        </span>

                        {/* Title */}
                        <h3 className="font-serif font-bold text-[#002F24] text-sm sm:text-base leading-snug line-clamp-2">{product.name}</h3>
                        
                        {/* Volume */}
                        <span className="text-[10px] text-gray-400 font-bold block mt-1">{product.size}</span>
                        
                        {/* Description */}
                        <p className="text-[10px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
                      </div>

                      {/* Pricing and Stock Row */}
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <span className="text-gray-400 line-through text-[10px]">₹{product.mrp}</span>
                          <span className="text-base font-bold text-[#002F24] block -mt-0.5">₹{product.price}</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 text-[8px] font-extrabold px-2 py-0.5 rounded-md tracking-wider uppercase">
                          In Stock
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row at Bottom */}
                  <div className="mt-4 flex items-center gap-3 w-full border-t border-gray-50 pt-3">
                    {/* Quantity selector pill */}
                    <div className="flex items-center border border-gray-200 rounded-xl px-2.5 py-1 bg-gray-50 shrink-0">
                      <button 
                        onClick={() => handleQtyChange(product.id, -1)}
                        className="p-0.5 hover:bg-gray-200 rounded text-gray-500 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#002F24] px-3">{qty}</span>
                      <button 
                        onClick={() => handleQtyChange(product.id, 1)}
                        className="p-0.5 hover:bg-gray-200 rounded text-gray-500 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Add Button */}
                    <button 
                      onClick={() => handleAddToCartClick(product)}
                      disabled={isAdded}
                      className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                        isAdded 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-[#002F24] hover:bg-[#014D3A] text-white'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {isAdded ? 'Added!' : 'Add to Cart'}
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        </div>

        {/* Highlight Trust Footer */}
        <div className="border border-[#D4AF37]/35 rounded-none bg-white px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF4E8] flex items-center justify-center text-[#002F24] border border-[#D4AF37]/20 shrink-0">
              <Award className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#002F24] block">Pure Oils</span>
              <span className="text-[9px] text-gray-400 block mt-0.5">100% Pure & Natural Oils</span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 sm:border-l border-gray-100 sm:pl-6">
            <div className="w-10 h-10 rounded-full bg-[#FAF4E8] flex items-center justify-center text-[#002F24] border border-[#D4AF37]/20 shrink-0">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#002F24] block">Secure Payments</span>
              <span className="text-[9px] text-gray-400 block mt-0.5">100% Safe & Secure Checkout</span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 md:border-l border-gray-100 md:pl-6">
            <div className="w-10 h-10 rounded-full bg-[#FAF4E8] flex items-center justify-center text-[#002F24] border border-[#D4AF37]/20 shrink-0">
              <Truck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#002F24] block">Fast Delivery</span>
              <span className="text-[9px] text-gray-400 block mt-0.5">Quick & Reliable Delivery</span>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 sm:border-l border-gray-100 sm:pl-6">
            <div className="w-10 h-10 rounded-full bg-[#FAF4E8] flex items-center justify-center text-[#002F24] border border-[#D4AF37]/20 shrink-0">
              <CreditCard className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#002F24] block">Trusted Sellers</span>
              <span className="text-[9px] text-gray-400 block mt-0.5">Quality Shops You Can Trust</span>
            </div>
          </div>
        </div>

      </div>

      {/* Product Details Slide-out Drawer */}
      <ProductDetailsDrawer 
        product={selectedProductForDrawer} 
        isOpen={!!selectedProductForDrawer} 
        onClose={() => setSelectedProductForDrawer(null)} 
        onAddToCart={(item) => {
          onAddToCart({ ...item, brand: shop.name })
        }}
      />
    </div>
  )
}
