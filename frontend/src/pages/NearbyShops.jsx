import { useState, useEffect } from 'react'
import {
  ArrowLeft, MapPin, ShieldCheck, Clock, Star, Phone, Search, Store,
  ArrowRight, Compass, Heart, ChevronDown, ListFilter, Truck, Tag, Users, Map
} from 'lucide-react'
import { fetchPublicShops } from '../ApiServices/publicShopService'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import headerIcon from '../assets/image copy 2.png'

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function NearbyShops({ onBackToShop, onSelectShop, userLocation = 'Koramangala, Bengaluru' }) {
  const [shopsList, setShopsList] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedShopId, setSelectedShopId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filter states
  const [locationText, setLocationText] = useState(userLocation)
  const [userLatLng, setUserLatLng] = useState([12.9352, 77.6245]) // Default Koramangala
  const [isLocating, setIsLocating] = useState(false)
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(true)
  
  const [category, setCategory] = useState('All Categories')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const categories = ['All Categories', 'Mustard Oil', 'Groundnut Oil', 'Coconut Oil', 'Sesame Oil', 'Cold Pressed Oils', 'Wood Pressed Oils']
  
  const [radius, setRadius] = useState('30 km')
  const [showRadiusDropdown, setShowRadiusDropdown] = useState(false)
  const radiusOptions = ['5 km', '10 km', '20 km', '30 km']

  const [activeTab, setActiveTab] = useState('All Shops')

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hr12 = hour % 12 || 12;
    return `${hr12}:${m} ${ampm}`;
  };

  useEffect(() => {
    const loadRealShops = async () => {
      setLoading(true)
      const res = await fetchPublicShops()
      if (res && res.success && res.shops) {
        // We will mock some extra data like delivery or ratings to match the mockup perfectly if needed
        const catList = ['Mustard Oil', 'Groundnut Oil', 'Coconut Oil', 'Sesame Oil', 'Cold Pressed Oils', 'Wood Pressed Oils'];
        // Consistent random generator based on string
        const getConsistentRandom = (str, salt = 0) => {
          let hash = salt;
          for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
          }
          return Math.abs(hash) / 2147483647; // 0 to ~1
        };

        const enhancedShops = res.shops.map((shop, i) => {
          const r1 = getConsistentRandom(shop.id || String(i), 1);
          const r2 = getConsistentRandom(shop.id || String(i), 2);
          const r3 = getConsistentRandom(shop.id || String(i), 3);
          
          // Determine base lat/lng from address
          let baseLat = 12.9352; // Default Bangalore
          let baseLng = 77.6245;
          const addressLower = (shop.address || '').toLowerCase();
          
          if (addressLower.includes('pune') || addressLower.includes('aakhurdi')) {
            baseLat = 18.6200; // Pune approx
            baseLng = 73.8000;
          } else if (addressLower.includes('mumbai')) {
            baseLat = 19.0760;
            baseLng = 72.8777;
          } else if (addressLower.includes('delhi')) {
            baseLat = 28.7041;
            baseLng = 77.1025;
          }
          
          return {
            ...shop,
            distance: (r1 * 15).toFixed(1), // Consistent distance 0-15km for demo
            deliveryAvailable: r2 > 0.3,
            minOrder: '₹499',
            reviews: shop.reviews || Math.floor(r3 * 500) + 50,
            category: catList[i % catList.length],
            // Ignore backend hardcoded 35,40 if it exists by checking if it's 35
            lat: (shop.lat && shop.lat !== 35) ? shop.lat : baseLat + (r1 - 0.5) * 0.08,
            lng: (shop.lng && shop.lng !== 40) ? shop.lng : baseLng + (r2 - 0.5) * 0.08
          }
        })
        setShopsList(enhancedShops)
        if (enhancedShops.length > 0) {
          setSelectedShopId(enhancedShops[0].id)
          // Automatically center map to the first shop's city
          setUserLatLng([enhancedShops[0].lat, enhancedShops[0].lng])
          if (enhancedShops[0].address && enhancedShops[0].address.toLowerCase().includes('pune')) {
            setLocationText('Pune, Maharashtra');
          }
        }
      }
      setLoading(false)
    }
    loadRealShops()
  }, [])

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    setLocationText("Locating...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county || "";
            const state = data.address.state || "";
            setLocationText(`${city}, ${state}`);
            setUsingCurrentLocation(true);
            setUserLatLng([latitude, longitude]);
          } else {
            setLocationText(userLocation);
            setUserLatLng([latitude, longitude]);
          }
        } catch (error) {
          setLocationText(userLocation);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setLocationText(userLocation);
        setIsLocating(false);
      }
    );
  };

  const filteredShops = shopsList.filter(shop => {
    // Tab filter
    if (activeTab !== 'All Shops' && !shop.category?.toLowerCase().includes(activeTab.toLowerCase()) && !shop.specialty?.toLowerCase().includes(activeTab.toLowerCase())) {
      return false
    }
    // Category dropdown filter
    if (category !== 'All Categories' && !shop.category?.toLowerCase().includes(category.toLowerCase()) && !shop.specialty?.toLowerCase().includes(category.toLowerCase())) {
      return false
    }
    // Radius filter
    const maxDist = parseInt(radius.split(' ')[0]);
    if (parseFloat(shop.distance) > maxDist) {
      return false
    }
    return true
  }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1a1a1a] font-sans selection:bg-[#005c4a]/20 selection:text-[#005c4a] text-left py-4 sm:py-6 animate-landing">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation back */}
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#005c4a] transition-colors cursor-pointer group mb-4"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-8">
          <div className="max-w-xl flex gap-6">
            <div className="hidden sm:block shrink-0 relative w-20 h-20 bg-amber-50 rounded-2xl overflow-hidden border border-amber-100">
              <img src={headerIcon} alt="Nearby Shops Icon" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#004d40] tracking-tight mb-3" style={{ fontFamily: "'Variable', sans-serif" }}>
                Discover <span className="text-[#005c4a]">Nearby Shops</span><br />Around You
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Find trusted local shops, compare options and shop<br className="hidden sm:block" /> from the best businesses near you.
              </p>
            </div>
          </div>

          {/* Search Controls Card */}
          <div className="bg-white p-3 rounded-none shadow-sm border border-gray-100 flex-1 lg:max-w-3xl">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Location */}
              <div className="flex-1 w-full relative">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider absolute -top-1.5 left-3 bg-white px-1">Your Location</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-none px-3 py-2.5 w-full hover:border-gray-300 transition-colors">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => {
                      setLocationText(e.target.value);
                      setUsingCurrentLocation(false);
                    }}
                    className="bg-transparent text-sm outline-none w-full text-gray-700 font-medium"
                    placeholder="Enter location"
                  />
                  {isLocating ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#005c4a] border-t-transparent animate-spin shrink-0"></div>
                  ) : (
                    <Compass onClick={handleGetLocation} className="w-4 h-4 text-gray-400 shrink-0 cursor-pointer hover:text-[#005c4a]" />
                  )}
                </div>
                {usingCurrentLocation && (
                  <div className="absolute -bottom-6 left-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-none border border-emerald-100">
                    <MapPin className="w-3 h-3" /> Using your current location
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="flex-1 w-full relative">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider absolute -top-1.5 left-3 bg-white px-1 z-10">Category</label>
                <div 
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center justify-between border border-gray-200 rounded-none px-3 py-2.5 w-full cursor-pointer hover:border-gray-300 transition-colors bg-white relative z-0"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 font-medium">{category}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </div>
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-lg z-50 py-1 rounded">
                    {categories.map(cat => (
                      <div 
                        key={cat} 
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 cursor-pointer font-medium"
                        onClick={() => { setCategory(cat); setShowCategoryDropdown(false); }}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Radius */}
              <div className="w-full md:w-32 relative">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider absolute -top-1.5 left-3 bg-white px-1 z-10">Radius</label>
                <div 
                  onClick={() => setShowRadiusDropdown(!showRadiusDropdown)}
                  className="flex items-center justify-between border border-gray-200 rounded-none px-3 py-2.5 w-full cursor-pointer hover:border-gray-300 transition-colors bg-white relative z-0"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 font-medium">{radius}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRadiusDropdown ? 'rotate-180' : ''}`} />
                </div>
                {showRadiusDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 shadow-lg z-50 py-1 rounded">
                    {radiusOptions.map(rad => (
                      <div 
                        key={rad} 
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 cursor-pointer font-medium"
                        onClick={() => { setRadius(rad); setShowRadiusDropdown(false); }}
                      >
                        {rad}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Btn */}
              <button 
                onClick={() => {
                  const btn = document.getElementById('search-btn-icon');
                  if (btn) btn.classList.add('animate-spin');
                  setTimeout(() => {
                    if (btn) btn.classList.remove('animate-spin');
                  }, 600);
                }}
                className="w-full md:w-auto bg-[#005c4a] hover:bg-[#004d40] text-white px-6 py-2.5 rounded-none text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0 h-[42px] mt-2 md:mt-0 cursor-pointer"
              >
                <Search id="search-btn-icon" className="w-4 h-4" /> Search Shops
              </button>
            </div>

            <div className="hidden md:flex justify-end mt-4">
              <span className="text-[10px] text-gray-400 italic">Looking for something specific? Search and explore! ✨</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-6">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-md p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-emerald-900 leading-none">{filteredShops.length}</h3>
              <p className="text-xs font-semibold text-emerald-800 mt-1">Nearby Shops</p>
              <p className="text-[10px] text-emerald-600">within {radius}</p>
            </div>
          </div>

          <div className="bg-orange-50/50 border border-orange-100 rounded-md p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shrink-0">
              <Clock className="w-6 h-6 fill-current text-orange-100 stroke-orange-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-orange-900 leading-none">
                {filteredShops.filter(shop => shop.status !== 'closed' && shop.status !== 'inactive').length}
              </h3>
              <p className="text-xs font-semibold text-orange-800 mt-1">Open Now</p>
              <p className="text-[10px] text-orange-600">ready to serve you</p>
            </div>
          </div>

          <div className="bg-purple-50/50 border border-purple-100 rounded-md p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
              <Star className="w-6 h-6 fill-current text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-900 leading-none">
                {filteredShops.length > 0 
                  ? (filteredShops.reduce((acc, shop) => acc + (parseFloat(shop.rating) || 4.0), 0) / filteredShops.length).toFixed(1) 
                  : '0.0'}
              </h3>
              <p className="text-xs font-semibold text-purple-800 mt-1">Top Rated</p>
              <p className="text-[10px] text-purple-600">average rating</p>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-md p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 shrink-0">
              <Truck className="w-6 h-6 fill-current text-blue-100 stroke-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-900 leading-none">
                {filteredShops.filter(shop => shop.deliveryAvailable).length}
              </h3>
              <p className="text-xs font-semibold text-blue-800 mt-1">Delivery Available</p>
              <p className="text-[10px] text-blue-600">fast to your door</p>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar flex-1">



            <button className="px-4 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
              <Clock className="w-3.5 h-3.5" /> Open Now
            </button>
            <button className="px-4 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
              <ListFilter className="w-3.5 h-3.5" /> More Filters <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500 font-medium">Sort by:</span>
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-md cursor-pointer hover:border-gray-300">
              <span className="text-xs font-bold text-gray-700">Distance: Nearest</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Main Layout: Map + Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: Map Section */}
          <div className="lg:col-span-5 bg-white border border-gray-100 rounded-md p-4 shadow-sm relative h-[600px] overflow-hidden flex flex-col">
            <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-md text-[10px] font-bold text-gray-700 border border-gray-200 flex items-center gap-1.5 shadow-sm">
              <Compass className="w-3.5 h-3.5 text-green-600" /> Showing shops within {radius}
            </div>

            <div className="absolute top-6 right-6 z-10">
              <button className="w-8 h-8 bg-white/90 backdrop-blur border border-gray-200 rounded-md flex items-center justify-center hover:bg-white shadow-sm">
                <Map className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 bg-[#f0f4f1] rounded-md relative overflow-hidden flex items-center justify-center z-0">
              <MapContainer center={userLatLng} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* User Location */}
                <Marker position={userLatLng}>
                  <Popup>
                    You are here: {locationText}
                  </Popup>
                </Marker>

                {/* Radius Circle (Convert text radius to meters) */}
                <Circle 
                  center={userLatLng} 
                  pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.1 }} 
                  radius={parseInt(radius.split(' ')[0]) * 1000} 
                />

                {/* Shop Markers */}
                {filteredShops.map(shop => (
                  <Marker 
                    key={shop.id} 
                    position={[shop.lat, shop.lng]}
                    eventHandlers={{
                      click: () => setSelectedShopId(shop.id),
                    }}
                  >
                    <Popup>
                      <div className="text-center font-sans">
                        <strong className="block text-[#005c4a] mb-1">{shop.name}</strong>
                        <span className="text-xs text-gray-600 block">{shop.distance} km away</span>
                        <button 
                          onClick={() => onSelectShop(shop)}
                          className="mt-2 bg-[#005c4a] text-white px-3 py-1 rounded text-xs font-bold w-full"
                        >
                          View Store
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Legend (Overlaying on map) */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur border border-gray-200 rounded-md p-4 shadow-sm text-[10px] space-y-2.5 font-medium text-gray-600 z-[1000] pointer-events-none">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white shadow-sm"></div> You are here</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4"><img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" alt="marker" className="h-full object-contain" /></div> Shops</div>
              </div>

            </div>
          </div>

          {/* Right: Shop Cards List */}
          <div className="lg:col-span-7 flex flex-col gap-5 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredShops.slice(0, 6).map((shop, i) => (
              <div key={shop.id || i} className="bg-white border border-[#005c4a] rounded-none p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.2)] transition-shadow flex flex-col sm:flex-row gap-5 relative group">

                {/* Image (Left) */}
                <div className="w-full sm:w-[160px] h-[160px] rounded-none overflow-hidden relative shrink-0">
                  <div className="absolute top-2 left-2 bg-gray-800/85 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    {shop.distance || '0.4'} km
                  </div>
                  <img
                    src={shop.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Details (Right) */}
                <div className="flex-1 flex flex-col relative py-1">
                  {/* Heart */}
                  <button className="absolute top-0 right-0 text-gray-300 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>

                  {/* Title & Open */}
                  <div className="flex items-center gap-3 pr-8 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{shop.name}</h3>
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                      Open
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{shop.address || 'Aakhurdi, pune, maharastra, 411001'}</span>
                  </div>

                  {/* Rating & Category */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      {shop.rating} <span className="font-normal text-yellow-600/70">({shop.reviews})</span>
                    </div>
                    <div className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-[11px] font-medium">
                      {shop.categories?.[0] || 'Oil'}
                    </div>
                  </div>

                  {/* Delivery info */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 font-medium mb-5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" /> Pickup available
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                    <div className="text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>
                        {shop.storeProfile?.openTime && shop.storeProfile?.closeTime 
                          ? `${formatTime(shop.storeProfile.openTime)} - ${formatTime(shop.storeProfile.closeTime)}`
                          : shop.timing || 'Closes at 10:00 PM'}
                      </span>
                      {shop.storeProfile?.operatingDays && shop.storeProfile.operatingDays.length > 0 && (
                        <span className="text-gray-400 ml-1">
                          ({shop.storeProfile.operatingDays.length === 7 ? 'All Days' : shop.storeProfile.operatingDays.map(d => d.slice(0, 3)).join(', ')})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-3 mt-auto">
                    <button
                      onClick={() => onSelectShop(shop)}
                      className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 font-bold text-xs hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                    >
                      View Store <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectShop(shop)}
                      className="flex-1 py-2 bg-[#005c4a] text-white rounded-lg font-bold text-xs hover:bg-[#004d40] shadow-sm transition-colors"
                    >
                      Browse Products
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Feature Banner */}
        <div className="mt-12 bg-orange-50/50 rounded-2xl p-6 border border-orange-100 flex flex-col md:flex-row justify-between gap-6 items-center">
          <div className="flex items-center gap-3 text-left w-full md:w-auto">
            <ShieldCheck className="w-8 h-8 text-[#005c4a]" />
            <div>
              <h4 className="font-bold text-[#005c4a] text-sm">Verified Shops</h4>
              <p className="text-[11px] text-gray-600">Quality checked & trusted</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-orange-200/50"></div>

          <div className="flex items-center gap-3 text-left w-full md:w-auto">
            <Truck className="w-8 h-8 text-[#005c4a]" />
            <div>
              <h4 className="font-bold text-[#005c4a] text-sm">Fast Delivery</h4>
              <p className="text-[11px] text-gray-600">Quick & reliable delivery</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-orange-200/50"></div>

          <div className="flex items-center gap-3 text-left w-full md:w-auto">
            <Tag className="w-8 h-8 text-[#D4AF37]" />
            <div>
              <h4 className="font-bold text-[#005c4a] text-sm">Best Prices</h4>
              <p className="text-[11px] text-gray-600">Compare & save more</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-orange-200/50"></div>

          <div className="flex items-center gap-3 text-left w-full md:w-auto">
            <Users className="w-8 h-8 text-[#005c4a]" />
            <div>
              <h4 className="font-bold text-[#005c4a] text-sm">Local & Trusted</h4>
              <p className="text-[11px] text-gray-600">Supporting local businesses</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
