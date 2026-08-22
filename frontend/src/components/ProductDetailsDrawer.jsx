import { useState, useEffect } from 'react'
import {
  X, Check, Droplet, Info, ShieldCheck, ChevronRight, ChevronLeft,
  ShoppingCart, Plus, Minus, Heart, Star, MapPin, Store, Phone,
  CheckCircle, Truck, Search, User, Menu, Package, Clock, Shield
} from 'lucide-react'

export default function ProductDetailsDrawer({ product, shop, isOpen, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1)
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)

  // Initialize variant when product changes
  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0])
      } else {
        setSelectedVariant({
          size: product.size || 'Standard Size',
          price: product.price || 0,
          mrp: product.mrp || 0,
          inStock: product.inStock !== false
        })
      }
      setQty(1)
      setCurrentImageIdx(0)
    }
  }, [product])

  if (!isOpen || !product) return null

  // Combine main image and gallery
  const allImages = []
  if (product.image) allImages.push(product.image)
  if (product.gallery && product.gallery.length > 0) {
    allImages.push(...product.gallery)
  }

  const displayImages = allImages.length > 0 ? allImages : [
    'https://via.placeholder.com/600x600?text=No+Image'
  ]

  const handleAdd = () => {
    const vSize = selectedVariant?.size || product.size;
    const vPrice = selectedVariant?.price || product.price;
    onAddToCart({
      id: product.id,
      name: product.name,
      variant: vSize,
      price: vPrice,
      qty: qty,
      image: product.image,
      vendorId: product.vendorId || product.vendor || shop?.id || shop?._id
    })
    onClose()
  }

  const handleBuyNow = () => {
    handleAdd()
  }

  // Fallbacks for shop details
  const shopName = shop?.name || 'Shop'
  const shopRating = shop?.rating || 'N/A'
  const shopReviews = shop?.reviews || 0
  const shopDistance = shop?.distance ? `${shop.distance} km from you` : ''
  const shopPhone = shop?.phone || 'Not Provided'
  const shopHours = shop?.weekdayHours || 'Hours not listed'
  const shopBanner = shop?.banner || 'https://images.unsplash.com/photo-1601000676451-2495914101cc?q=80&w=600&auto=format&fit=crop'
  const shopLogo = shop?.logo || ''

  // Fallbacks for product details
  const prodRating = product.rating || 'N/A'
  const prodReviews = product.reviews || 0

  return (
    <div className={`fixed inset-0 bg-[#f9f9f9] z-[100] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col overflow-y-auto ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>

      {/* Floating Close Button */}
      <button onClick={onClose} className="fixed top-4 right-4 z-[110] w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
        <X className="w-5 h-5" />
      </button>

      {/* Main Content Body */}
      <div className="max-w-[1400px] mx-auto w-full p-4 md:p-6 flex flex-col gap-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="hover:text-[#005c4a] cursor-pointer" onClick={onClose}>Home</span>
          <span>/</span>
          <span className="hover:text-[#005c4a] cursor-pointer" onClick={onClose}>Nearby Shops</span>
          <span>/</span>
          <span className="hover:text-[#005c4a] cursor-pointer" onClick={onClose}>{shopName}</span>
          <span>/</span>
          <span className="text-[#005c4a] font-bold">{product.name}</span>
        </div>

        {/* Top Product Section */}
        <div className="flex flex-col lg:flex-row gap-8 bg-white p-6 border border-gray-100 shadow-sm">

          {/* Left: Images */}
          <div className="flex gap-4 lg:w-[45%] shrink-0 h-[400px]">
            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex flex-col gap-2 w-16 shrink-0 overflow-y-auto hide-scrollbar">
                {displayImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`w-16 h-16 border shrink-0 cursor-pointer flex items-center justify-center p-0 overflow-hidden bg-white ${currentImageIdx === idx ? 'border-[#005c4a] border-2' : 'border-gray-200 hover:border-[#005c4a]/50'}`}
                    onClick={() => setCurrentImageIdx(idx)}
                  >
                    <img
                      src={img}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Img' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 bg-white border border-gray-100 relative overflow-hidden flex items-center justify-center h-full">
              <img
                src={displayImages[currentImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=No+Image' }}
              />
            </div>
          </div>

          {/* Middle: Details */}
          <div className="flex-1 flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-bold text-[#005c4a]">{shopName}</span>
              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold border border-emerald-100">
                <ShieldCheck className="w-3 h-3" /> Verified Seller
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <span className="text-gray-700 font-bold ml-1">{prodRating}</span>
                <span className="text-gray-400 ml-1">({prodReviews} reviews)</span>
              </div>
              {shopDistance && (
                <div className="flex items-center gap-1 text-gray-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#005c4a]" /> {shopDistance}
                </div>
              )}
            </div>

            <div className="flex items-end gap-3 mb-1">
              <span className="text-3xl font-black text-gray-900">₹{selectedVariant?.price || product.price}</span>
              {((selectedVariant?.mrp || product.mrp) > (selectedVariant?.price || product.price)) && (
                <>
                  <span className="text-sm text-gray-400 line-through mb-1">₹{selectedVariant?.mrp || product.mrp}</span>
                  <span className="text-xs font-bold text-emerald-600 mb-1 px-1.5 py-0.5 bg-emerald-50">{Math.round((((selectedVariant?.mrp || product.mrp) - (selectedVariant?.price || product.price)) / (selectedVariant?.mrp || product.mrp)) * 100)}% OFF</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-gray-500 font-medium mb-6">(Inclusive of all taxes)</p>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-700 mb-2">Select Size</h3>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(variant)}
                      className={`flex flex-col items-center justify-center min-w-[80px] px-3 py-2 border ${selectedVariant?.size === variant.size ? 'border-[#005c4a] bg-emerald-50/50 text-[#005c4a]' : 'border-gray-200 text-gray-600 hover:border-[#005c4a]'}`}
                    >
                      <span>{variant.size}</span>
                    </button>
                  ))
                ) : (
                  <button className="flex flex-col items-center justify-center px-4 py-2 border border-[#005c4a] bg-emerald-50/50 text-[#005c4a]">
                    <span>{selectedVariant?.size || product.size || 'Standard Size'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Quantity</h3>
                <div className="flex items-center justify-between border border-gray-200 px-3 h-10 w-28 bg-white">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-500 hover:text-[#005c4a]">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold text-gray-900">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="text-gray-500 hover:text-[#005c4a]">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                {selectedVariant?.inStock || product.inStock ? (
                  <>
                    <span className="text-sm font-bold text-emerald-600 block mt-3">
                      In Stock ({selectedVariant?.currentStock !== undefined ? selectedVariant.currentStock : (product.currentStock || 0)} items)
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">(Available to dispatch)</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold text-red-500 block mt-3">Out of Stock</span>
                    <span className="text-[10px] text-gray-500 font-medium">(Currently unavailable)</span>
                  </>
                )}
              </div>
            </div>



            {/* Features tags */}
            {product.tags && product.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-6 text-[10px] font-bold text-[#005c4a]">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> {tag}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-6 text-[10px] font-bold text-[#005c4a]">
                <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5"><Droplet className="w-3.5 h-3.5" /> 100% Pure</span>
                <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Quality Assured</span>
              </div>
            )}

            <div className="flex flex-row flex-nowrap gap-2 sm:gap-3 mt-auto">
              <button onClick={handleAdd} className="flex-1 h-11 sm:h-12 border-2 border-[#005c4a] text-[#005c4a] font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-50 transition-colors whitespace-nowrap px-2 text-[11px] sm:text-sm">
                <ShoppingCart className="w-4 h-4 shrink-0" /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="flex-1 h-11 sm:h-12 bg-[#005c4a] text-white font-bold flex items-center justify-center gap-1.5 hover:bg-[#004d40] shadow-md transition-colors whitespace-nowrap px-2 text-[11px] sm:text-sm">
                Buy Now
              </button>
            </div>
          </div>

          {/* Right Column (Sold By + Delivery) */}
          <div className="lg:w-[280px] shrink-0 flex flex-col gap-4 lg:mr-8">
            {/* Sold By Widget */}
            <div className="border border-gray-100 bg-white p-2 relative h-max">
            <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 w-5 h-5 flex items-center justify-center shadow-sm z-10 rounded-full">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Sold by</p>

            <div className="relative h-[120px] bg-gray-100 mb-10 border border-gray-100">
              <img
                src={shopBanner}
                alt="Shop Banner"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1601000676451-2495914101cc?q=80&w=600&auto=format&fit=crop' }}
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1 z-0">
                {shopLogo ? (
                  <img
                    src={shopLogo}
                    alt={shopName}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-[#005c4a] font-bold text-lg text-center uppercase">
                    {shopName.substring(0, 1)}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mt-2 mb-4">
              <h3 className="font-bold text-gray-900 text-base">{shopName}</h3>
              <div className="flex items-center justify-center text-[11px] mt-1 text-yellow-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current text-gray-300" />
                <span className="font-bold text-gray-700 ml-1">{shopRating}</span>
                <span className="text-gray-400 ml-1">({shopReviews} reviews)</span>
              </div>
            </div>

            <div className="border-t border-b border-gray-100 py-3 mb-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-700">
                <Phone className="w-3.5 h-3.5 text-[#005c4a]" /> <span className="font-bold">{shopPhone}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
                <Clock className="w-3.5 h-3.5 text-gray-400" /> {shopHours}
              </div>
            </div>

            <button className="w-full h-9 border border-[#005c4a] text-[#005c4a] text-xs font-bold hover:bg-[#005c4a] hover:text-white transition-colors">
              Visit Store
            </button>
          </div>

            {/* Delivery Check */}
            <div className="bg-[#f8f9f8] border border-gray-100 p-4 flex flex-col gap-4">
              <div className="flex items-start gap-2 w-full">
                <Truck className="w-5 h-5 text-[#005c4a] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">Delivery by Tomorrow, 11 May</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-snug">Check delivery time for your pincode</p>
                </div>
              </div>
              <div className="flex w-full shadow-sm">
                <input type="text" placeholder="Enter pincode" className="border border-gray-200 h-10 px-3 w-full text-xs focus:outline-none focus:border-[#005c4a]" />
                <button className="bg-[#005c4a] text-white px-4 h-10 text-xs font-bold hover:bg-[#004d40] shrink-0">Check</button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Highlights */}
          {product.highlights && product.highlights.length > 0 ? (
            <div className="bg-white border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Product Highlights</h3>
              <ul className="space-y-3 text-[11px] text-gray-700 font-medium">
                {product.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#005c4a] shrink-0" />
                    {item.text || item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Description */}
          {product.description && (
            <div className="bg-white border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Description</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="bg-white border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Benefits</h3>
              <ul className="space-y-3 text-[11px] text-gray-700 font-medium">
                {product.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#005c4a] mt-1 shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="bg-white border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Ingredients</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-[#005c4a]" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-900">Main Ingredient:</h4>
                    <p className="text-[11px] text-gray-600">{product.ingredients.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Specifications */}
          {(() => {
            const specs = { ...(product.specifications || {}) };
            if (product.compliance) {
              if (product.compliance.oilType) specs['Oil Type'] = product.compliance.oilType;
              if (product.compliance.extractionMethod) specs['Extraction Method'] = product.compliance.extractionMethod;
              if (product.compliance.packagingType) specs['Packaging Type'] = product.compliance.packagingType;
              if (product.compliance.refiningType) specs['Refining Type'] = product.compliance.refiningType;
              if (product.compliance.shelfLifeDays) specs['Shelf Life'] = `${product.compliance.shelfLifeDays} Days`;
              if (product.compliance.fssaiLicenseNo) specs['FSSAI License'] = product.compliance.fssaiLicenseNo;
              if (product.compliance.isOrganic) specs['Organic'] = 'Yes';
            }
            if (Object.keys(specs).length === 0) return null;
            
            return (
              <div className="bg-white border border-gray-100 p-5">
                <h3 className="text-xs font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Specifications</h3>
                <div className="space-y-2 text-[11px]">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex border-b border-gray-50 pb-2 last:border-0">
                      <span className="w-1/2 text-gray-500 capitalize">{key}</span>
                      <span className="w-1/2 font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Nutrition Info */}
          {(() => {
            if (!product.nutrition || !Object.values(product.nutrition).some(v => v > 0)) return null;
            return (
              <div className="bg-white border border-gray-100 p-5">
                <h3 className="text-xs font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Nutrition (per 100g)</h3>
                <div className="space-y-2 text-[11px]">
                  {Object.entries(product.nutrition).filter(([k,v]) => v > 0).map(([key, value]) => (
                    <div key={key} className="flex border-b border-gray-50 pb-2 last:border-0">
                      <span className="w-1/2 text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="w-1/2 font-bold text-gray-900">{value}{key === 'energy' ? ' kcal' : 'g'}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer Trust Badges */}
        <div className="bg-white border border-gray-100 p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#005c4a]" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-900">Verified Sellers</h4>
              <p className="text-[9px] text-gray-500">All shops are verified & trusted</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center shrink-0">
              <Droplet className="w-4 h-4 text-[#005c4a]" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-900">Quality Guaranteed</h4>
              <p className="text-[9px] text-gray-500">100% pure & tested oils</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-[#005c4a]" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-900">Fast Delivery</h4>
              <p className="text-[9px] text-gray-500">On-time delivery from nearby shops</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-[#005c4a]" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-900">Secure Payments</h4>
              <p className="text-[9px] text-gray-500">100% safe & secure transactions</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
