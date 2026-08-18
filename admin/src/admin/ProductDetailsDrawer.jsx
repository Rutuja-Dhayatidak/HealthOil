import { useEffect, useRef } from 'react'
import { X, Package, Tag, FileText, Activity } from 'lucide-react'
import gsap from 'gsap'

export default function ProductDetailsDrawer({ isOpen, onClose, product }) {
  const drawerRef = useRef(null)
  const backdropRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Animate in
      gsap.to(backdropRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        display: 'block'
      })
      gsap.to(drawerRef.current, {
        x: '0%',
        duration: 0.4,
        ease: 'power3.out'
      })
    } else {
      // Animate out
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(backdropRef.current, { display: 'none' })
        }
      })
      gsap.to(drawerRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in'
      })
    }
  }, [isOpen])

  // Summarize stats
  const totalVariants = product?.variants?.length || 0;
  const totalStock = product?.variants?.reduce((acc, v) => acc + (v.currentStock || 0), 0) || 0;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
        style={{ opacity: 0, display: 'none' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-[30%] min-w-[350px] bg-[#FAF4E8] shadow-2xl z-[100] flex flex-col translate-x-full"
      >
        {/* Header */}
        <div className="bg-[#031d13] p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-serif font-bold text-xl tracking-tight">Product Details</h3>
            <p className="text-xs text-gray-300 mt-1 opacity-80">Review submitted information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {product && (
          <div className="flex-1 overflow-y-auto p-6 space-y-8 text-left text-sm text-[#031d13]">

            {/* Header Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#b89547]/20 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FAF4E8] border border-[#b89547]/30 flex items-center justify-center shrink-0 text-[#031d13]">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">{product.basicDetails?.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${product.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' :
                      product.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600' :
                        'bg-yellow-500/10 text-yellow-600'
                    }`}>
                    {product.status === 'PENDING_APPROVAL' ? 'PENDING' : product.status}
                  </span>
                  <span className="text-xs font-semibold text-[#b89547]">
                    {product.vendor?.business?.storeName || product.vendor?.fullName}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Images */}
            {(product.images?.mainImage || (product.images?.gallery && product.images?.gallery.length > 0)) && (
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#68736e] uppercase tracking-wider pl-2">
                  Product Images
                </h4>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#b89547]/10 flex gap-4 overflow-x-auto">
                  {product.images?.mainImage && (
                    <img 
                      src={product.images.mainImage.url || product.images.mainImage} 
                      alt="Main" 
                      className="w-24 h-24 object-cover rounded-xl border border-gray-100" 
                    />
                  )}
                  {product.images?.gallery?.map((img, i) => (
                    <img 
                      key={i} 
                      src={img.url || img} 
                      alt={`Gallery ${i}`} 
                      className="w-24 h-24 object-cover rounded-xl border border-gray-100" 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                <Tag className="w-4 h-4" /> Categorization & Details
              </h4>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#b89547]/10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Oil Type</label>
                    <p className="font-semibold">{product.compliance?.oilType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Brand Name</label>
                    <p className="font-semibold">{product.basicDetails?.brandName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Extraction Method</label>
                    <p className="font-semibold">{product.compliance?.extractionMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Organic</label>
                    <p className="font-semibold">{product.compliance?.isOrganic ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Refining Type</label>
                    <p className="font-semibold">{product.compliance?.refiningType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Packaging Type</label>
                    <p className="font-semibold">{product.compliance?.packagingType || 'N/A'}</p>
                  </div>
                </div>

                {/* Description & Highlights */}
                {(product.basicDetails?.description || (product.basicDetails?.highlights && product.basicDetails.highlights.length > 0)) && (
                  <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                    {product.basicDetails?.description && (
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Description</label>
                        <p className="text-xs text-gray-700 leading-relaxed">{product.basicDetails.description}</p>
                      </div>
                    )}
                    {product.basicDetails?.highlights && product.basicDetails.highlights.length > 0 && (
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Highlights</label>
                        <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
                          {product.basicDetails.highlights.map((h, i) => (
                            <li key={i}>{h.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Info */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                <FileText className="w-4 h-4" /> Compliance & Legal
              </h4>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#b89547]/10 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">FSSAI License</label>
                    <p className="font-semibold font-mono text-xs">{product.compliance?.fssaiLicenseNo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">HSN Code</label>
                    <p className="font-semibold font-mono text-xs">{product.compliance?.hsnCode || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Shelf Life</label>
                    <p className="font-semibold">{product.compliance?.shelfLifeDays || 0} Days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nutritional Info */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                <Activity className="w-4 h-4" /> Nutritional Info (Per 100g/ml)
              </h4>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#b89547]/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Energy</label>
                    <p className="font-semibold">{product.nutrition?.energy || 0} kcal</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Total Fat</label>
                    <p className="font-semibold">{product.nutrition?.totalFat || 0} g</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Saturated Fat</label>
                    <p className="font-semibold">{product.nutrition?.saturatedFat || 0} g</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Trans Fat</label>
                    <p className="font-semibold">{product.nutrition?.transFat || 0} g</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">MUFA</label>
                    <p className="font-semibold">{product.nutrition?.mufa || 0} g</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">PUFA</label>
                    <p className="font-semibold">{product.nutrition?.pufa || 0} g</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Cholesterol</label>
                    <p className="font-semibold">{product.nutrition?.cholesterol || 0} mg</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory & Variants */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                <Package className="w-4 h-4" /> Variants & Pricing
              </h4>
              <div className="space-y-3">
                {product.variants?.map((v, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-[#b89547]/10 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold block">{v.size} {v.unit}</span>
                        <span className="text-[10px] text-gray-400 font-mono">SKU: {v.sku || 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#031d13] block">₹{v.price}</span>
                        {v.mrp > v.price && <span className="text-[10px] text-gray-400 line-through">MRP: ₹{v.mrp}</span>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                      <span className="text-xs text-gray-500">Initial Stock: {v.initialStock}</span>
                      <span className={`text-[10px] font-bold ${v.currentStock <= (v.lowStockThreshold || 10) ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {v.currentStock} in stock
                      </span>
                    </div>
                  </div>
                ))}
                {(!product.variants || product.variants.length === 0) && (
                  <p className="text-xs text-gray-500">No variants available.</p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </>
  )
}
