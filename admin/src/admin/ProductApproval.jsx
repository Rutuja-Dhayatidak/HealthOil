import { useState, useEffect } from 'react'
import { Package, Search, CheckCircle, XCircle, Mail, X, Loader2 } from 'lucide-react'
import { getAllProducts, approveProduct, rejectProduct } from '../ApiServices/adminService'
import toast from 'react-hot-toast'
import ProductDetailsDrawer from './ProductDetailsDrawer'

// Helper to safely get product image URL
const getProductImageUrl = (product) => {
  if (!product) return null
  const img = product.images?.mainImage || 
              product.images?.gallery?.[0] || 
              product.bannerImage || 
              product.image
  if (!img) return null
  
  let rawUrl = ''
  if (typeof img === 'string') {
    rawUrl = img
  } else if (typeof img === 'object') {
    rawUrl = img.url || img.fileLocation || img.secure_url || img.path || ''
  }

  if (!rawUrl) return null
  if (rawUrl.startsWith('http') || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
    return rawUrl
  }
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl.replace(/\\/g, '/')}`
  return `http://localhost:5006${cleanPath}`
}

function ProductApproval({ refreshStats }) {
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Rejection Modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectingProduct, setRejectingProduct] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [isSubmittingReject, setIsSubmittingReject] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await getAllProducts()
      if (res.success) {
        // Filter pending products
        const pendingProducts = res.products.filter(p => p.status === 'PENDING_APPROVAL')
        setProductsList(pendingProducts)
      }
    } catch (error) {
      toast.error('Failed to fetch pending products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleApprove = async (id) => {
    try {
      const res = await approveProduct(id)
      if (res.success) {
        toast.success('Product approved successfully')
        // Optimistic state update without full page refresh
        setProductsList(prev => prev.filter(p => p._id !== id))
        if (selectedProduct?._id === id) {
          setIsDrawerOpen(false)
          setSelectedProduct(null)
        }
        if (refreshStats) refreshStats()
      }
    } catch (error) {
      toast.error('Failed to approve product')
    }
  }

  const handleOpenRejectModal = (product) => {
    setRejectingProduct(product)
    setRejectionReason('')
    setRejectError('')
    setIsRejectModalOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectError('Rejection reason is required')
      return
    }

    try {
      setIsSubmittingReject(true)
      const res = await rejectProduct(rejectingProduct._id, rejectionReason.trim())
      if (res.success) {
        toast.success('Product rejected successfully')
        // Optimistic state update without full page refresh
        setProductsList(prev => prev.filter(p => p._id !== rejectingProduct._id))
        if (selectedProduct?._id === rejectingProduct._id) {
          setIsDrawerOpen(false)
          setSelectedProduct(null)
        }
        setIsRejectModalOpen(false)
        setRejectingProduct(null)
        setRejectionReason('')
        if (refreshStats) refreshStats()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reject product')
    } finally {
      setIsSubmittingReject(false)
    }
  }

  const filteredProducts = productsList.filter(p => 
    p.basicDetails?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.vendor?.business?.storeName || p.vendor?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#031d13] tracking-tight">Pending Product Approvals</h2>
        <p className="text-xs text-gray-500 mt-1">Review and approve new products submitted by vendors before they go live.</p>
      </div>

      <div className="bg-white border border-yellow-500/20 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white border border-yellow-500/25 rounded-xl px-3 py-1.5 w-full sm:w-72 shadow-sm">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search pending products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs outline-none w-full text-[#031d13] placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-gray-500 text-sm">Loading pending products...</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Vendor</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Stock Info</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-emerald-400 mb-2 opacity-50" />
                        <p>No products waiting for approval. You're all caught up!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const totalVariants = product.variants?.length || 0;
                    const totalStock = product.variants?.reduce((acc, v) => acc + (v.currentStock || 0), 0) || 0;
                    
                    return (
                      <tr 
                        key={product._id} 
                        className="text-gray-600 hover:bg-yellow-50/50 transition-colors duration-150 cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(product)
                          setIsDrawerOpen(true)
                        }}
                      >
                        <td className="py-3.5 font-bold text-[#031d13] flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#FAF4E8] border border-[#b89547]/30 flex items-center justify-center text-[#031d13] shrink-0 overflow-hidden shadow-2xs">
                            {getProductImageUrl(product) ? (
                              <img 
                                src={getProductImageUrl(product)} 
                                alt={product.basicDetails?.name || 'Product'} 
                                className="w-full h-full object-cover rounded-xl"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.parentElement.querySelector('.fallback-icon')?.classList.remove('hidden')
                                }}
                              />
                            ) : null}
                            <div className={`fallback-icon ${getProductImageUrl(product) ? 'hidden' : 'flex'} items-center justify-center`}>
                              <Package className="w-5 h-5 text-[#b89547]" />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#031d13]">{product.basicDetails?.name}</div>
                            <div className="text-[10px] text-gray-500 font-normal">{product.variants?.[0]?.price ? `₹${product.variants[0].price} starting` : ''}</div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="font-semibold text-[#031d13] block">{product.vendor?.business?.storeName || product.vendor?.fullName || 'Unknown'}</span>
                          {product.vendor?.business?.storeName && product.vendor?.fullName && (
                            <span className="text-[10px] text-gray-400 font-medium block">{product.vendor.fullName}</span>
                          )}
                        </td>
                        <td className="py-3.5">
                          {product.vendor?.email ? (
                            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                              <Mail className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                              <span className="text-[11px] truncate max-w-[200px]" title={product.vendor.email}>{product.vendor.email}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3.5 text-gray-500">{product.compliance?.oilType || 'Other'}</td>
                        <td className="py-3.5">
                          <div className="text-[#031d13] font-semibold">{totalStock} Units</div>
                          <div className="text-[9px] text-gray-400">{totalVariants} Variants</div>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-yellow-500/10 text-yellow-600">
                            PENDING
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleApprove(product._id)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all duration-200 cursor-pointer border border-emerald-100"
                            title="Approve Product"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenRejectModal(product)}
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-all duration-200 cursor-pointer border border-rose-100"
                            title="Reject Product"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Mandatory Rejection Reason Modal */}
      {isRejectModalOpen && rejectingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-4 border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Reject Product: {rejectingProduct.basicDetails?.name}
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {rejectError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg">
                {rejectError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value)
                  if (e.target.value.trim()) setRejectError('')
                }}
                placeholder="Enter mandatory reason for rejecting this product..."
                rows={4}
                className="w-full p-3 text-xs border border-gray-300 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all text-gray-800"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={isSubmittingReject}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmittingReject}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {isSubmittingReject && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Review Drawer */}
      <ProductDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        product={selectedProduct} 
        onApprove={() => {
          if (selectedProduct) handleApprove(selectedProduct._id)
        }}
        onReject={() => {
          if (selectedProduct) handleOpenRejectModal(selectedProduct)
        }}
      />
    </div>
  )
}

export default ProductApproval
