import { useState, useEffect, useCallback } from 'react'
import { Package, Search, Plus, CheckCircle, XCircle, Pencil, Trash2, X, Loader2, AlertTriangle, Mail, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { getAllProducts, approveProduct, rejectProduct, updateProductAdmin, deleteProductAdmin } from '../ApiServices/adminService'
import toast from 'react-hot-toast'
import ProductDetailsDrawer from './ProductDetailsDrawer'
import ProductEditDrawer from './ProductEditDrawer'

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
  return `http://localhost:5000${cleanPath}`
}

function Products({ refreshStats }) {
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Backend Pagination state (15 items per page)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(15)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Edit and Delete states
  const [editModalProduct, setEditModalProduct] = useState(null)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [deleteModalProduct, setDeleteModalProduct] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const fetchProducts = useCallback(async (page = currentPage, search = searchTerm) => {
    try {
      setLoading(true)
      const res = await getAllProducts({
        page,
        limit,
        status: 'ACTIVE',
        search: search.trim()
      })

      if (res.success) {
        setProductsList(res.products || [])
        if (res.pagination) {
          setPagination(res.pagination)
          setCurrentPage(res.pagination.currentPage || page)
        }
      }
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [currentPage, limit, searchTerm])

  useEffect(() => {
    fetchProducts(currentPage, searchTerm)
  }, [currentPage])

  // Handle live search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1)
      fetchProducts(1, searchTerm)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === currentPage) return
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleApprove = async (id) => {
    try {
      const res = await approveProduct(id)
      if (res.success) {
        toast.success('Product approved successfully')
        fetchProducts(currentPage, searchTerm)
        if (refreshStats) refreshStats()
      }
    } catch (error) {
      toast.error('Failed to approve product')
    }
  }

  const handleReject = async (id) => {
    try {
      const res = await rejectProduct(id)
      if (res.success) {
        toast.success('Product rejected successfully')
        fetchProducts(currentPage, searchTerm)
        if (refreshStats) refreshStats()
      }
    } catch (error) {
      toast.error('Failed to reject product')
    }
  }

  const handleOpenEdit = (product) => {
    setEditModalProduct(product)
    setIsEditDrawerOpen(true)
  }

  const handleSaveEdit = async (productId, payload) => {
    if (isActionLoading) return

    try {
      setIsActionLoading(true)
      const res = await updateProductAdmin(productId, payload)
      if (res.success) {
        toast.success('Product updated successfully!')
        setEditModalProduct(null)
        setIsEditDrawerOpen(false)
        fetchProducts(currentPage, searchTerm)
        if (refreshStats) refreshStats()
      }
    } catch (error) {
      toast.error('Failed to update product')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteModalProduct || isActionLoading) return

    try {
      setIsActionLoading(true)
      const res = await deleteProductAdmin(deleteModalProduct._id)
      if (res.success) {
        toast.success('Product deleted successfully!')
        setDeleteModalProduct(null)
        fetchProducts(currentPage, searchTerm)
        if (refreshStats) refreshStats()
      }
    } catch (error) {
      toast.error('Failed to delete product')
    } finally {
      setIsActionLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Generate pagination page numbers to display
  const getPageNumbers = () => {
    const total = pagination.totalPages || 1
    const current = currentPage
    const pages = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('...')
      
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }
    return pages
  }

  const startRecord = pagination.totalProducts === 0 ? 0 : (currentPage - 1) * limit + 1
  const endRecord = Math.min(currentPage * limit, pagination.totalProducts || 0)

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#031d13] tracking-tight">Vendor Products</h2>
          <p className="text-xs text-gray-500 mt-1">Review, edit, delete or manage products submitted by vendors (15 items per page).</p>
        </div>

        {pagination.totalProducts > 0 && (
          <div className="text-xs font-bold px-3.5 py-1.5 bg-[#FAF4E8] text-[#031d13] border border-[#b89547]/30 rounded-xl shadow-2xs self-start sm:self-auto">
            Total Products: <span className="text-[#b89547]">{pagination.totalProducts}</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#b89547]/20 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white border border-[#b89547]/25 rounded-xl px-3 py-1.5 w-full sm:w-80 shadow-sm focus-within:border-blue-500 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by product, brand, category, vendor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs outline-none w-full text-[#031d13] placeholder-gray-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Page <span className="font-bold text-[#031d13]">{currentPage}</span> of <span className="font-bold text-[#031d13]">{pagination.totalPages || 1}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#b89547]" />
              <span>Loading products (page {currentPage})...</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#b89547]/20 text-gray-400 font-bold">
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
                {productsList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="w-10 h-10 text-gray-300" />
                        <p className="font-medium">No products found matching your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  productsList.map((product) => {
                    const totalVariants = product.variants?.length || 0
                    const totalStock = product.variants?.reduce((acc, v) => acc + (v.currentStock || 0), 0) || 0
                    
                    return (
                      <tr 
                        key={product._id} 
                        className="text-gray-600 hover:bg-[#FAF4E8]/20 transition-colors duration-150 cursor-pointer"
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
                              <Mail className="w-3.5 h-3.5 text-[#b89547] shrink-0" />
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
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              product.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 
                              product.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600' :
                              'bg-yellow-500/10 text-yellow-600'
                            }`}>
                              {product.status === 'PENDING_APPROVAL' ? 'PENDING' : product.status}
                            </span>
                            {product.status === 'ACTIVE' && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                {formatDate(product.approvedAt || product.updatedAt || product.createdAt)}
                              </span>
                            )}
                            {product.status === 'REJECTED' && (
                              <span className="text-[10px] text-rose-400 font-medium">
                                {formatDate(product.rejectedAt || product.updatedAt || product.createdAt)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Edit Button */}
                          <button 
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 text-[#031d13] hover:text-[#b89547] hover:bg-[#FAF4E8] rounded-lg transition-colors border border-gray-200/60 inline-flex items-center justify-center cursor-pointer shadow-xs"
                            title="Edit Product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button 
                            onClick={() => setDeleteModalProduct(product)}
                            className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-colors border border-rose-200 inline-flex items-center justify-center cursor-pointer shadow-xs"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination Controls */}
        {!loading && pagination.totalProducts > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              Showing <span className="font-bold text-[#031d13]">{startRecord}</span> to <span className="font-bold text-[#031d13]">{endRecord}</span> of <span className="font-bold text-[#031d13]">{pagination.totalProducts}</span> products (15 / page)
            </div>

            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Previous Page */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 h-8 rounded-lg border border-gray-200 flex items-center gap-1 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {getPageNumbers().map((page, idx) => {
                  if (page === '...') {
                    return <span key={`dots-${idx}`} className="px-1 text-xs text-gray-400">...</span>
                  }
                  const isCurrent = page === currentPage
                  return (
                    <button
                      key={`page-${page}`}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#002F24] text-white shadow-sm ring-1 ring-[#002F24]'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 h-8 rounded-lg border border-gray-200 flex items-center gap-1 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={currentPage === pagination.totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Drawer */}
      <ProductEditDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false)
          setEditModalProduct(null)
        }}
        product={editModalProduct}
        onSave={handleSaveEdit}
        isLoading={isActionLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[110] flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-lg text-gray-900 mb-1">Delete Product?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteModalProduct.basicDetails?.name}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => setDeleteModalProduct(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {isActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  )
}

export default Products
