import { useState, useEffect } from 'react'
import { 
  ArrowLeft, MapPin, ShieldCheck, Clock, Star, Phone, ShoppingCart, 
  Plus, Minus, Shield, CreditCard, Truck, Award, ShoppingBag, Search, ChevronRight, Navigation,
  Store, LayoutGrid, RotateCcw, ArrowRight
} from 'lucide-react'
import bannerBg from '../assets/image copy.png'
import Navbar from '../components/Navbar'
import ProductDetailsDrawer from '../components/ProductDetailsDrawer'
import { fetchPublicShopDetails } from '../ApiServices/publicShopService'
import { reviewService } from '../ApiServices/reviewService'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function ShopDetailsPage({ shop: initialShopProps, onBackToShops, onAddToCart, cartCount, onOpenCart, onOpenNearbyShops, onOpenProfile }) {
  const [shop, setShop] = useState(initialShopProps)
  const [productsList, setProductsList] = useState([])
  const [shopReviews, setShopReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All Products')
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
        
        // Mock data enhancement for visual matching
        const enhancedProducts = (res.products || []).map(p => ({
          ...p,
          mrp: p.mrp || Math.floor(p.price * 1.2),
          discount: p.discount || Math.floor(Math.random() * 10 + 10),
          reviews: p.reviews || Math.floor(Math.random() * 200 + 50),
          rating: p.rating || (Math.random() * 0.5 + 4.5).toFixed(1)
        }))
        
        setProductsList(enhancedProducts.length ? enhancedProducts : [
          { id: '1', name: 'Cold Pressed Coconut Oil', size: '500 ml', price: 299, mrp: 349, discount: 14, rating: 4.7, reviews: 210, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400' },
          { id: '2', name: 'Cold Pressed Mustard Oil', size: '1 L', price: 229, mrp: 269, discount: 15, rating: 4.6, reviews: 185, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400' },
          { id: '3', name: 'Extra Virgin Olive Oil', size: '500 ml', price: 499, mrp: 599, discount: 17, rating: 4.7, reviews: 162, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400' },
          { id: '4', name: 'Cold Pressed Sesame Oil', size: '1 L', price: 279, mrp: 399, discount: 15, rating: 4.6, reviews: 139, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400' }
        ])
      }
      
      // Fetch reviews
      try {
        const vendorId = initialShopProps.id || initialShopProps._id;
        const revData = await reviewService.getShopReviews(vendorId);
        if (revData.success) {
          setShopReviews(revData.reviews);
        }
      } catch (err) {
        console.error('Failed to load reviews');
      }

      setLoading(false)
    }

    loadShopDetails()
  }, [initialShopProps?.id])

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Shop Selected</h2>
          <button onClick={onBackToShops} className="w-full h-11 bg-[#005c4a] text-white font-bold rounded-xl flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
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
      image: product.image,
      vendorId: shop.id || shop._id
    })
    
    setAddedItemIds(prev => [...prev, product.id])
    setTimeout(() => {
      setAddedItemIds(prev => prev.filter(id => id !== product.id))
    }, 2000)
  }

  const bannerImage = shop.banner || shop.image || bannerBg
  
  const shopLat = shop.pickupAddress?.lat || shop.lat || 12.9121;
  const shopLng = shop.pickupAddress?.lng || shop.lng || 77.6446;

  return (
    <div className="min-h-screen bg-[#fcfdfc] text-[#1a1a1a] font-sans selection:bg-[#005c4a]/20 animate-landing">
      <Navbar cartCount={cartCount} onOpenCart={onOpenCart} onOpenNearbyShops={onOpenNearbyShops} onOpenProfile={onOpenProfile} />
      
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] md:text-xs font-medium text-gray-500 mb-4">
          <button onClick={onBackToShops} className="hover:text-[#005c4a] transition-colors cursor-pointer">Home</button>
          <span>/</span>
          <button onClick={onBackToShops} className="hover:text-[#005c4a] transition-colors cursor-pointer">Nearby Shops</button>
          <span>/</span>
          <span className="text-[#005c4a] font-bold">{shop.name}</span>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-5 mb-6">
          {/* Left: Banner & Info Card */}
          <div className="lg:flex-[2] relative rounded-none overflow-hidden h-[240px] md:h-[280px]">
            <img src={bannerImage} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Floating Info Card */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:w-[600px] bg-white rounded-none p-4 shadow-lg flex flex-col md:flex-row gap-4">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-none overflow-hidden shrink-0 border border-gray-100 shadow-sm relative group">
                 {shop.logo ? (
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-2xl font-bold text-[#005c4a]">
                    {shop.name.charAt(0)}
                  </div>
                )}
                {/* Verified Badge overlay on image */}
                <div className="absolute bottom-1 left-1 right-1 bg-white/95 backdrop-blur py-0.5 rounded flex items-center justify-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-[#005c4a]" />
                  <span className="text-[8px] font-bold text-[#005c4a]">Verified</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">{shop.name}</h1>
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
                      <ShieldCheck className="w-3 h-3" /> Verified Seller
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs mb-2.5">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-gray-700 font-bold ml-1">{shop.rating || '4.6'}</span>
                      <span className="text-gray-400">({shop.reviews || 248} reviews)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-gray-600 mb-2.5">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {shop.distance || '2.1'} km
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> 20-30 mins
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wide">Open</span>
                      <span className="text-gray-400">Closes at 10:00 PM</span>
                    </div>
                  </div>

                  <p className="text-[10px] md:text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                    {shop.description || 'Premium and cold pressed oils made from carefully selected natural seeds for a healthier lifestyle.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-3 w-full">
                  <button className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
                    <Navigation className="w-3.5 h-3.5 text-gray-400" /> Get Directions
                  </button>
                  <button className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Contact Shop
                  </button>
                  <button className="flex-[1.2] py-2 rounded-lg bg-[#005c4a] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#004d40] shadow-sm transition-colors">
                    <Store className="w-3.5 h-3.5" /> Visit Store
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Map Box */}
          <div className="lg:flex-1 bg-[#f8f9f8] rounded-none border border-gray-200 p-4 flex flex-col justify-between">
            <div className="w-full h-[140px] md:h-[180px] rounded-none bg-gray-200 overflow-hidden relative mb-4 z-0">
              <MapContainer center={[shopLat, shopLng]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[shopLat, shopLng]} />
              </MapContainer>
            </div>

            <div>
              <div className="flex items-start gap-2 mb-1">
                <MapPin className="w-4 h-4 text-[#005c4a] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{shop.name}</h4>
                  <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                    {shop.address || '17th Cross, HSR Layout, Sector 2, Bengaluru, Karnataka 560102'}
                  </p>
                </div>
              </div>
              <button className="text-[11px] font-bold text-[#005c4a] hover:underline flex items-center gap-1 mt-3 ml-6">
                View larger map <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-[260px] shrink-0 flex flex-col gap-4">
            {/* Info Widget */}
            <div className="bg-[#fcfdfc] border border-gray-100 rounded-none p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-gray-400">ⓘ</span> Shop Information</h3>
              <div className="space-y-3 text-[11px]">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Business Type</span>
                  <span className="font-medium text-gray-900">{shop.businessType || 'Retail Store'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Since</span>
                  <span className="font-medium text-gray-900">{shop.establishedYear || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Speciality</span>
                  <span className="font-medium text-gray-900 line-clamp-1 text-right ml-4">{shop.specialty || 'General'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">GSTIN</span>
                  <span className="font-medium text-gray-900">{shop.gstin || 'Not Provided'}</span>
                </div>
              </div>
            </div>

            {/* Hours Widget */}
            <div className="bg-[#fcfdfc] border border-gray-100 rounded-none p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-gray-400" /> Opening Hours</h3>
              <div className="space-y-3 text-[11px]">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Monday - Saturday</span>
                  <span className="font-medium text-gray-900">{shop.weekdayHours || '9:00 AM — 9:00 PM'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Sunday</span>
                  <span className="font-medium text-gray-900">{shop.sundayHours || 'Closed'}</span>
                </div>
              </div>
            </div>

            {/* Delivery Widget */}
            <div className="bg-[#fcfdfc] border border-gray-100 rounded-none p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-[#005c4a]" /> Delivery Info</h3>
              <div className="space-y-3 text-[11px]">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Delivery Time</span>
                  <span className="font-medium text-gray-900">{shop.deliveryTime || 'Varies'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Min. Order</span>
                  <span className="font-medium text-gray-900">{shop.minOrder ? `₹${shop.minOrder}` : 'No Minimum'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-bold text-[#005c4a]">{shop.deliveryFee ? `₹${shop.deliveryFee}` : 'Dynamic'}</span>
                </div>
              </div>
            </div>

            {/* Categories Widget */}
            {shop.categories && shop.categories.length > 0 && (
              <div className="bg-[#fcfdfc] border border-gray-100 rounded-none p-4 shadow-sm">
                <h3 className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2"><LayoutGrid className="w-3.5 h-3.5 text-gray-400" /> Available Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {shop.categories.map(cat => (
                    <div key={cat} className="border border-gray-200 rounded-none text-center py-2 px-1 text-[10px] font-semibold text-gray-600 hover:border-[#005c4a] hover:text-[#005c4a] cursor-pointer transition-colors line-clamp-1">
                      {cat}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Top Bar (Tabs + Search) */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-2 md:pb-0">
                {['All Products', 'Edible Oils', 'Hair Oils', 'Essential Oils', 'Ayurvedic Oils', 'Cold Pressed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-4 py-2 rounded-none text-xs font-bold transition-all whitespace-nowrap border ${
                      activeFilter === tab
                        ? 'bg-[#005c4a] text-white border-[#005c4a]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#005c4a]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64 shrink-0">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search in this shop..." 
                  className="w-full h-10 pl-9 pr-4 rounded-none border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#005c4a] transition-colors bg-[#f8f9f8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {productsList.map((product) => {
                const isAdded = addedItemIds.includes(product.id)
                const qty = quantities[product.id] || 1
                return (
                  <div 
                    key={product.id}
                    className="bg-white border border-gray-100 rounded-none p-3 sm:p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-[#005c4a]/20 transition-all duration-300 flex flex-col relative group cursor-pointer"
                    onClick={() => setSelectedProductForDrawer(product)}
                  >
                    {/* Image Area */}
                    <div className="w-full h-[140px] sm:h-[180px] mb-4 bg-[#f8f9f8] rounded-none relative flex items-center justify-center overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col text-left">
                      <h3 className="font-bold text-gray-900 text-xs sm:text-[15px] leading-tight line-clamp-2 group-hover:text-[#005c4a]">
                        {product.name}
                      </h3>
                      <span className="text-[11px] text-gray-500 mt-1 block font-medium">{product.size}</span>
                      
                      <div className="flex items-center gap-1.5 mt-2.5 mb-3 text-[10px] sm:text-[11px]">
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span className="font-bold text-gray-700">{product.rating}</span>
                        <span className="text-gray-400">({product.reviews})</span>
                      </div>

                      <div className="mt-auto flex flex-col gap-1 mb-4">
                        <div className="flex items-end gap-2.5">
                          <span className="text-[17px] font-extrabold text-gray-900">₹{product.price}</span>
                          <span className="text-[11px] text-gray-400 line-through mb-0.5">₹{product.mrp}</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2.5 py-0.5 rounded-none w-max tracking-wide uppercase border border-emerald-100 mt-1">
                          In Stock
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCartClick(product)
                          }}
                          className="w-10 h-10 rounded-none border-2 border-gray-100 text-[#005c4a] flex items-center justify-center hover:bg-[#005c4a] hover:border-[#005c4a] hover:text-white transition-all shrink-0"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCartClick(product)
                          }}
                          disabled={isAdded}
                          className={`flex-1 h-10 rounded-none font-bold text-xs flex items-center justify-center transition-all shadow-sm ${
                            isAdded ? 'bg-emerald-600 text-white border border-emerald-600' : 'bg-[#005c4a] text-white hover:bg-[#004d40] border border-[#005c4a]'
                          }`}
                        >
                          {isAdded ? 'Added' : 'Buy Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Section: Reviews & You may also like */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              
              {/* Customer Reviews snippet */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Customer Reviews ({shopReviews.length})</h3>
                  {shopReviews.length > 0 && <button className="text-[11px] font-bold text-[#005c4a] hover:underline">View All Reviews</button>}
                </div>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {shopReviews.length === 0 ? (
                     <div className="text-[11px] text-gray-500 italic p-4">No featured reviews yet for this shop.</div>
                  ) : shopReviews.map((rev) => (
                    <div key={rev._id} className="min-w-[200px] bg-white border border-gray-100 rounded-xl p-3 text-left shadow-sm flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden shrink-0">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.user?.name || 'User'}`} alt="avatar" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="text-[10px] font-bold text-gray-900 line-clamp-1">{rev.user?.name || 'Anonymous User'}</h4>
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                          </div>
                          <div className="flex items-center gap-1 text-[8px]">
                            <div className="flex text-yellow-500">
                               {[...Array(rev.rating || 5)].map((_,j)=><Star key={j} className="w-2 h-2 fill-current"/>)}
                            </div>
                            <span className="text-gray-400">• {new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-600 line-clamp-3 leading-relaxed">"{rev.comment}"</p>
                      <p className="text-[8px] text-[#005c4a] mt-1 font-bold">Purchased: {rev.productName}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* You may also like snippet */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">You may also like</h3>
                  <button className="text-[11px] font-bold text-[#005c4a] hover:underline">View All</button>
                </div>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {[
                    {name: 'PureDrop Store', rating: 4.5, reviews: 186, distance: '2.6', time: '20-30 mins'},
                    {name: 'Shree Ayur Oils', rating: 4.7, reviews: 234, distance: '2.4', time: '25-30 mins'},
                    {name: 'Fresh Press Oils', rating: 4.6, reviews: 153, distance: '2.9', time: '30-40 mins'}
                  ].map((like, i) => (
                    <div key={i} className="min-w-[220px] bg-white border border-gray-100 rounded-xl p-3 flex gap-3 shadow-sm">
                      <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                         <img src={`https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=200&sig=${i}`} alt="shop" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col text-left">
                        <h4 className="text-[11px] font-bold text-gray-900 truncate">{like.name}</h4>
                        <div className="flex items-center gap-1 text-[9px] mt-0.5">
                          <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                          <span className="font-bold text-gray-700">{like.rating}</span>
                          <span className="text-gray-400">({like.reviews})</span>
                        </div>
                        <div className="text-[9px] text-gray-500 mt-1">
                           {like.distance} km • {like.time}
                        </div>
                        <button className="mt-auto py-1 bg-[#005c4a] text-white text-[9px] font-bold rounded-lg hover:bg-[#004d40]">
                          View Shop
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Bottom Features Banner */}
      <div className="bg-[#fcfdfc] border-t border-gray-200 mt-12 py-8">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Verified Sellers</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">All shops are verified & trusted</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Quality Guaranteed</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">100% pure & lab tested oils</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Fast Delivery</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Quick delivery from nearby shops</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Secure Payments</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Safe & encrypted transactions</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Easy Returns</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Hassle-free returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductDetailsDrawer 
        product={selectedProductForDrawer} 
        shop={shop}
        isOpen={!!selectedProductForDrawer} 
        onClose={() => setSelectedProductForDrawer(null)} 
        onAddToCart={(item) => {
          onAddToCart({ ...item, brand: shop.name })
        }}
      />
    </div>
  )
}
