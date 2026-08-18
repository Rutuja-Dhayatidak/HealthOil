import { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, ShieldCheck, Clock, Star, Phone, Search, Store, ArrowRight, Settings, RotateCcw, Compass, Map, Info } from 'lucide-react'
import { fetchPublicShops } from '../ApiServices/publicShopService'

export default function NearbyShops({ onBackToShop, onSelectShop, userLocation = 'Pune, Maharashtra' }) {
  const [shopsList, setShopsList] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedShopId, setSelectedShopId] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [maxDistance, setMaxDistance] = useState(15)
  const [minRating, setMinRating] = useState(4.0)
  const [onlyOpenNow, setOnlyOpenNow] = useState(false)
  const [oilTypeFilter, setOilTypeFilter] = useState('All Oil Types')
  const [certificationFilter, setCertificationFilter] = useState('All Certifications')
  const [locationText, setLocationText] = useState(userLocation)

  useEffect(() => {
    const loadRealShops = async () => {
      setLoading(true)
      const res = await fetchPublicShops()
      if (res && res.success && res.shops) {
        setShopsList(res.shops)
        if (res.shops.length > 0) {
          setSelectedShopId(res.shops[0].id)
        }
      }
      setLoading(false)
    }
    loadRealShops()
  }, [])

  const handleResetFilters = () => {
    setMaxDistance(15)
    setMinRating(4.0)
    setOnlyOpenNow(false)
    setOilTypeFilter('All Oil Types')
    setCertificationFilter('All Certifications')
    setSearchQuery('')
  }

  // Filter application
  const filteredShops = shopsList.filter(shop => {
    const matchesSearch = (shop.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (shop.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (shop.owner || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDistance = parseFloat(shop.distance) <= maxDistance
    const matchesRating = parseFloat(shop.rating) >= minRating
    const matchesOpen = onlyOpenNow ? shop.status === 'Open Now' : true
    const matchesOil = oilTypeFilter === 'All Oil Types' ? true : shop.oilType === oilTypeFilter

    return matchesSearch && matchesDistance && matchesRating && matchesOpen && matchesOil
  })

  const activeShop = shopsList.find(s => s.id === selectedShopId) || shopsList[0] || {}

  return (
    <div className="min-h-screen bg-[#FAF4E8] text-[#15251F] font-sans selection:bg-[#D4AF37] selection:text-[#002F24] text-left py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation back */}
        <button 
          onClick={onBackToShop}
          className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#002F24] transition-colors cursor-pointer group mb-2 animate-landing"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-0.5 transition-transform" />
          Back to website
        </button>

        {/* Header Section (Find Trusted Oil Mills Near You) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 relative animate-landing-delay-1">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#002F24] tracking-tight">
              Find Trusted Oil Mills Near You
            </h1>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Discover organic oil mills and retail partners delivering purity, quality and freshness. Located within your <span className="text-[#D4AF37] font-bold">15 KM</span> radius.
            </p>
          </div>

          {/* Search container widget */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2 bg-white border border-[#D4AF37]/35 rounded-xl px-3 h-10 w-full sm:w-72 shadow-sm focus-within:border-[#002F24] focus-within:ring-1 focus-within:ring-[#002F24]/10 transition-all">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <input 
                type="text" 
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="bg-transparent text-xs outline-none w-full text-[#15251F] font-medium"
              />
              <button className="p-0.5 rounded-full hover:bg-gray-150 text-[#D4AF37]" title="Locate Me">
                <Compass className="w-3.5 h-3.5" />
              </button>
            </div>

            <button className="w-full sm:w-auto h-10 bg-[#002F24] hover:bg-[#014D3A] text-white px-5 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
              Search
            </button>
          </div>

        </div>

        {/* Stats bar */}
        <div className="bg-[#002F24] border-2 border-[#D4AF37] rounded-xl px-5 py-2 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-white sticky top-0 z-50 shadow-md animate-landing-delay-1">
          {/* Stat 1 */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Store className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[9px] text-gray-300 block leading-tight">Nearby Mills</span>
              <span className="text-base font-serif font-extrabold text-white leading-none">12</span>
              <span className="text-[7.5px] text-gray-400 block mt-0.5 leading-none">Within 15 KM</span>
            </div>
          </div>
          {/* Stat 2 */}
          <div className="flex items-center gap-2.5 border-l-0 md:border-l border-white/10 md:pl-5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[9px] text-gray-300 block leading-tight">Open Now</span>
              <span className="text-base font-serif font-extrabold text-white leading-none">9</span>
              <span className="text-[7.5px] text-gray-400 block mt-0.5 leading-none">Open & delivering</span>
            </div>
          </div>
          {/* Stat 3 */}
          <div className="flex items-center gap-2.5 border-l-0 md:border-l border-white/10 md:pl-5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Star className="w-4.5 h-4.5 fill-current" />
            </div>
            <div>
              <span className="text-[9px] text-gray-300 block leading-tight">Top Rated</span>
              <span className="text-base font-serif font-extrabold text-white leading-none">4.8+</span>
              <span className="text-[7.5px] text-gray-400 block mt-0.5 leading-none">Avg. rating</span>
            </div>
          </div>
          {/* Stat 4 */}
          <div className="flex items-center gap-2.5 border-l-0 md:border-l border-white/10 md:pl-5">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[9px] text-gray-300 block leading-tight">Within Radius</span>
              <span className="text-base font-serif font-extrabold text-[#D4AF37] leading-none">15 KM</span>
              <span className="text-[7.5px] text-gray-400 block mt-0.5 leading-none">Your search area</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Central Map + Right Shop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-landing-delay-2">


          {/* Middle panel: Vector map screen */}
          <div className="md:col-span-5 md:sticky md:top-[84px] bg-white border border-[#D4AF37]/25 rounded-2xl p-5 shadow-sm flex flex-col h-[520px] relative overflow-hidden">
            
            {/* Simulated map graphic content */}
            <div className="flex-1 bg-[#EAF2E9]/60 rounded-xl relative overflow-hidden flex items-center justify-center border border-gray-150 shadow-inner">
              

              <span className="absolute bottom-20 right-16 text-[8px] font-bold tracking-widest text-[#002F24]/30 uppercase">Rohini</span>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-widest text-[#002F24]/30 uppercase text-center">New Delhi</span>

              {/* Gold 15 KM boundary radius circle overlay */}
              <div className="absolute w-[360px] h-[360px] rounded-full border-2 border-dashed border-[#D4AF37]/45 bg-[#D4AF37]/2 animate-pulse flex items-center justify-center" />
              
              {/* Fake road paths vector */}
              <svg className="absolute inset-0 w-full h-full text-white/60 stroke-current stroke-[3] fill-none">
                <path d="M0,150 Q100,60 250,200 T500,120" />
                <path d="M100,0 Q180,180 300,300 T500,420" />
                <path d="M0,320 C180,260 280,380 500,290" stroke="#002F24" strokeWidth="2" strokeDasharray="3,3" />
              </svg>

              {/* Map Zoom Controls */}
              <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                <button className="w-7 h-7 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm">+</button>
                <button className="w-7 h-7 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm">-</button>
                <button className="w-7 h-7 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs flex items-center justify-center cursor-pointer shadow-sm mt-1" title="Target Location">
                  <Compass className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* User Home Location Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#002F24] border-2 border-[#D4AF37] flex items-center justify-center shadow-lg animate-pulse">
                  <MapPin className="w-4.5 h-4.5 text-[#D4AF37]" />
                </div>
                <span className="text-[7.5px] font-bold text-white bg-[#002F24] border border-[#D4AF37]/30 px-1.5 py-0.5 rounded shadow mt-1">
                  You are here
                </span>
              </div>

              {/* Shop blips */}
              {filteredShops.map((shop) => {
                const isActive = shop.id === selectedShopId
                return (
                  <div 
                    key={shop.id}
                    className="absolute z-10 flex flex-col items-center transition-all duration-300"
                    style={{ top: `${shop.lat}%`, left: `${shop.lng}%` }}
                    onClick={() => setSelectedShopId(shop.id)}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer shadow ${
                      isActive 
                        ? 'bg-[#D4AF37] border-white scale-110 z-20' 
                        : 'bg-[#002F24] border-[#D4AF37]/50 hover:bg-[#D4AF37]'
                    }`}>
                      <Store className={`w-4 h-4 ${isActive ? 'text-[#002F24]' : 'text-[#D4AF37]'}`} />
                    </div>
                  </div>
                )
              })}

              {/* Connecting path overlay to selected shop */}
              {activeShop && activeShop.lng !== undefined && activeShop.lat !== undefined && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line 
                    x1="50%" 
                    y1="50%" 
                    x2={`${activeShop.lng}%`} 
                    y2={`${activeShop.lat}%`} 
                    stroke="#002F24" 
                    strokeWidth="2" 
                    strokeDasharray="4,4" 
                  />
                </svg>
              )}

              {/* Map Legend */}
              <div className="absolute bottom-3 right-3 bg-white border border-[#D4AF37]/25 rounded-xl p-3 shadow-md text-[8.5px] space-y-1 text-gray-500 z-10">
                <p className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#002F24] border border-[#D4AF37]" /> Your Location</p>
                <p className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#002F24] border border-[#D4AF37]/30" /> Nearby Mills</p>
                <p className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" /> Top Rated</p>
                <p className="flex items-center gap-1.5"><span className="w-1.5 h-2.5 border-t-2 border-[#002F24] border-dashed" /> Your Route</p>
              </div>

            </div>

          </div>

          {/* Right panel: Shop Cards stack list */}
          <div className="md:col-span-7 space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {filteredShops.map((shop) => {
              const isSelected = shop.id === selectedShopId
              return (
                <div 
                  key={shop.id}
                  onClick={() => { setSelectedShopId(shop.id); onSelectShop(shop); }}
                  className={`bg-white border rounded-2xl p-4 transition-all duration-300 flex flex-col sm:flex-row gap-5 cursor-pointer relative group ${
                    isSelected 
                      ? 'border-[#002F24] ring-1 ring-[#002F24]' 
                      : 'border-gray-150 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  {/* Shop banner image */}
                  <div className="w-[200px] h-[200px] rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 relative">
                    <img 
                      src={shop.image} 
                      alt={shop.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2 left-2 bg-[#002F24]/90 border border-[#D4AF37]/50 text-[#F2CF65] px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wider shadow-sm">
                      {shop.distance} KM
                    </div>
                  </div>

                  {/* Details info layout */}
                  <div className="flex-1 flex flex-col justify-between text-xs min-w-0">
                    <div>
                      {/* Title & Status */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-serif font-bold text-[#002F24] text-base leading-tight">{shop.name}</h4>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Under: {shop.owner}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold border tracking-wide uppercase shrink-0 ${
                          shop.status === 'Open Now' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {shop.status === 'Open Now' ? 'OPEN NOW' : 'CLOSED'}
                        </span>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-1.5 text-gray-400 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                        <span className="text-gray-600 truncate sm:whitespace-normal">{shop.address}</span>
                      </div>

                      {/* Ratings & FSSAI */}
                      <div className="flex flex-wrap items-center gap-4 mt-2.5 pb-2.5 border-b border-gray-50">
                        <div className="flex items-center gap-1 font-semibold text-[#002F24]">
                          <Star className="w-3.5 h-3.5 fill-current text-[#D4AF37]" />
                          <span>{shop.rating}</span>
                          <span className="text-gray-400 font-normal">({shop.reviews} reviews)</span>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-emerald-200 text-emerald-700 bg-emerald-50">
                          <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                          FSSAI Certified
                        </span>
                      </div>
                    </div>

                    {/* Specialties & Actions */}
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div className="text-[10px] text-gray-500 leading-relaxed min-w-0 flex-1">
                        <span className="block text-gray-400">Specialties:</span>
                        <span className="font-bold text-[#002F24] line-clamp-2">{shop.specialty}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <a 
                          href={`tel:${shop.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-9 h-9 rounded-full border border-[#D4AF37] flex items-center justify-center hover:bg-[#F8F2E7] text-[#D4AF37] transition-colors"
                          title="Call Shop"
                        >
                          <Phone className="w-4 h-4 fill-current" />
                        </a>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onSelectShop(shop); }}
                          className="px-4 py-2 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl font-bold text-[10px] transition-colors flex items-center gap-1 shadow-sm group/btn"
                        >
                          View Catalog
                          <ArrowRight className="w-3 h-3 text-[#D4AF37] group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>

        </div>

        {/* Feature highlight bar */}
        <div className="mt-12 pt-6 border-t border-[#D4AF37]/20 grid grid-cols-2 md:grid-cols-4 gap-6 animate-landing-delay-3">
          <div className="flex items-center gap-2.5 text-left text-xs">
            <span className="w-7 h-7 rounded-lg bg-[#002F24]/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#002F24] font-extrabold">✓</span>
            <div>
              <h5 className="font-bold text-[#002F24]">100% Organic & Pure</h5>
              <p className="text-[10px] text-gray-400">Naturally sourced, chemical free</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-left text-xs">
            <span className="w-7 h-7 rounded-lg bg-[#002F24]/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#002F24] font-extrabold">✓</span>
            <div>
              <h5 className="font-bold text-[#002F24]">FSSAI Certified Mills</h5>
              <p className="text-[10px] text-gray-400">Quality & safety assured</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-left text-xs">
            <span className="w-7 h-7 rounded-lg bg-[#002F24]/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#002F24] font-extrabold">✓</span>
            <div>
              <h5 className="font-bold text-[#002F24]">Fast Delivery</h5>
              <p className="text-[10px] text-gray-400">Delivered fresh to your doorstep</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-left text-xs">
            <span className="w-7 h-7 rounded-lg bg-[#002F24]/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#002F24] font-extrabold">✓</span>
            <div>
              <h5 className="font-bold text-[#002F24]">Secure Payments</h5>
              <p className="text-[10px] text-gray-400">Safe & encrypted transactions</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
