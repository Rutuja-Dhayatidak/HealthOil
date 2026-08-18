import { useState } from 'react'
import { X, Check, Droplet, Info, ShieldCheck, ChevronRight, ChevronLeft, ShoppingCart, Plus, Minus } from 'lucide-react'

export default function ProductDetailsDrawer({ product, isOpen, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1)
  const [currentImageIdx, setCurrentImageIdx] = useState(0)

  if (!isOpen || !product) return null

  // Combine main image and gallery
  const allImages = []
  if (product.image) allImages.push(product.image)
  if (product.gallery && product.gallery.length > 0) {
    allImages.push(...product.gallery)
  }

  const handleNextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % allImages.length)
  }

  const handlePrevImage = () => {
    setCurrentImageIdx((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const handleAdd = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      variant: product.size,
      price: product.price,
      qty: qty,
      image: product.image
    })
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Full Screen Drawer/Modal */}
      <div className={`fixed inset-0 bg-[#FAF4E8] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col overflow-hidden ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-[#D4AF37]/20 flex justify-between items-center shrink-0">
          <h2 className="font-serif font-bold text-xl text-[#002F24] tracking-tight">Product Details</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content (Split Layout on Desktop) */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0 flex flex-col md:flex-row">
          
          {/* Image Gallery (Left Half on Desktop) */}
          <div className="bg-white p-6 relative flex items-center justify-center border-b md:border-b-0 md:border-r border-[#D4AF37]/10 md:w-1/2 shrink-0 md:min-h-full">
            {allImages.length > 0 ? (
              <div className="relative w-[250px] md:w-[350px] lg:w-[450px] h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center group">
                <img 
                  src={allImages[currentImageIdx]} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain"
                />
                
                {allImages.length > 1 && (
                  <>
                    <button onClick={handlePrevImage} className="absolute left-[-20px] md:left-[-40px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <ChevronLeft className="w-5 h-5 text-[#002F24]" />
                    </button>
                    <button onClick={handleNextImage} className="absolute right-[-20px] md:right-[-40px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 shadow rounded-full flex items-center justify-center hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <ChevronRight className="w-5 h-5 text-[#002F24]" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-[200px] h-[250px] md:w-[300px] md:h-[350px] bg-[#FAF6EC] rounded-2xl border border-[#D4AF37]/20 flex flex-col items-center justify-center text-gray-400">
                <span className="text-5xl md:text-6xl mb-4">🛢️</span>
                <span className="text-sm font-bold uppercase tracking-widest">No Image</span>
              </div>
            )}
            
            {/* Dots */}
            {allImages.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {allImages.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentImageIdx(i)}
                    className={`h-2 rounded-full cursor-pointer ${i === currentImageIdx ? 'bg-[#002F24] w-6' : 'bg-gray-300 hover:bg-gray-400 w-2'} transition-all`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details (Right Half on Desktop) */}
          <div className="p-6 md:p-8 lg:p-12 space-y-6 md:w-1/2 md:overflow-y-auto">
            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider mb-3 border border-emerald-100">
                    {product.pressedType || 'Premium Oil'}
                  </span>
                  {product.brandName && (
                    <span className="block text-xs font-bold text-[#D4AF37] tracking-widest uppercase mb-1">{product.brandName}</span>
                  )}
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#002F24] leading-tight mb-2">{product.name}</h1>
                  <span className="text-sm text-gray-500 font-bold block">{product.size}</span>
                </div>
              </div>
              <div className="mt-5 flex items-end gap-3">
                <span className="text-4xl md:text-5xl font-extrabold text-[#002F24] leading-none">₹{product.price}</span>
                {product.mrp > product.price && (
                  <span className="text-lg text-gray-400 line-through mb-1">₹{product.mrp}</span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-2xl p-6 border border-[#D4AF37]/15 shadow-sm">
                <h3 className="text-sm font-bold text-[#002F24] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#D4AF37]" />
                  About Product
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && product.highlights[0].text && (
              <div className="bg-[#FAF4E8] rounded-2xl p-6 border border-[#D4AF37]/20 shadow-inner">
                <h3 className="text-sm font-bold text-[#002F24] uppercase tracking-wider mb-4">Key Highlights</h3>
                <ul className="space-y-3">
                  {product.highlights.map((highlight, idx) => highlight.text ? (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                      <div className="bg-emerald-100 rounded-full p-1 mt-0.5 shrink-0">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="leading-relaxed">{highlight.text}</span>
                    </li>
                  ) : null)}
                </ul>
              </div>
            )}

            {/* Compliance & Nutrition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Compliance */}
              <div className="bg-white rounded-2xl p-5 border border-[#D4AF37]/15 shadow-sm">
                <h3 className="text-sm font-bold text-[#002F24] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  Quality & Details
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">FSSAI License</span>
                    <span className="font-bold text-[#002F24]">{product.compliance?.fssaiLicenseNo || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">100% Organic</span>
                    <span className="font-bold text-[#002F24]">{product.compliance?.isOrganic ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Extraction</span>
                    <span className="font-bold text-[#002F24] truncate max-w-[120px] text-right" title={product.compliance?.extractionMethod}>
                      {product.compliance?.extractionMethod || 'Cold Pressed'}
                    </span>
                  </div>
                  {product.compliance?.refiningType && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Refining</span>
                      <span className="font-bold text-[#002F24]">{product.compliance.refiningType}</span>
                    </div>
                  )}
                  {product.compliance?.packagingType && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Packaging</span>
                      <span className="font-bold text-[#002F24]">{product.compliance.packagingType}</span>
                    </div>
                  )}
                  {product.compliance?.shelfLifeDays && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Shelf Life</span>
                      <span className="font-bold text-[#002F24]">{product.compliance.shelfLifeDays} Days</span>
                    </div>
                  )}
                  {product.compliance?.hsnCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">HSN Code</span>
                      <span className="font-bold text-[#002F24]">{product.compliance.hsnCode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nutrition */}
              <div className="bg-white rounded-2xl p-5 border border-[#D4AF37]/15 shadow-sm">
                <h3 className="text-sm font-bold text-[#002F24] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Droplet className="w-4 h-4 text-[#D4AF37]" />
                  Nutrition Facts
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Energy</span>
                    <span className="font-bold text-[#002F24]">{product.nutrition?.energy || 0} kcal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total Fat</span>
                    <span className="font-bold text-[#002F24]">{product.nutrition?.totalFat || 0}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Saturated Fat</span>
                    <span className="font-bold text-[#002F24]">{product.nutrition?.saturatedFat || 0}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Trans Fat</span>
                    <span className="font-bold text-[#002F24]">{product.nutrition?.transFat || 0}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">MUFA</span>
                    <span className="font-bold text-[#002F24]">{product.nutrition?.mufa || 0}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">PUFA</span>
                    <span className="font-bold text-[#002F24]">{product.nutrition?.pufa || 0}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Cholesterol</span>
                    <span className="font-bold text-[#002F24]">{product.nutrition?.cholesterol || 0}mg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Action Area (Hidden on Mobile) */}
            <div className="hidden md:flex flex-col gap-4 pt-6 border-t border-[#D4AF37]/20 mt-8">
              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between border-2 border-gray-200 rounded-xl px-4 h-14 w-36 bg-gray-50 shrink-0">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#002F24] hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold text-[#002F24]">{qty}</span>
                  <button 
                    onClick={() => setQty(qty + 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#002F24] hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  onClick={handleAdd}
                  className="flex-1 h-14 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-base font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
                  Add {qty} to Cart - ₹{product.price * qty}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Footer Actions (Hidden on Desktop) */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-[#D4AF37]/20 p-4 px-6 flex items-center gap-4 z-10 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between border-2 border-gray-100 rounded-xl px-3 h-12 w-28 bg-gray-50 shrink-0">
            <button 
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#002F24] hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold text-[#002F24]">{qty}</span>
            <button 
              onClick={() => setQty(qty + 1)}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#002F24] hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            onClick={handleAdd}
            className="flex-1 h-12 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-[#D4AF37]" />
            Add {qty} to Cart - ₹{product.price * qty}
          </button>
        </div>

      </div>
    </>
  )
}
