import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Package, Search, Plus, Edit2, LayoutGrid, List, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, X } from 'lucide-react'
import { StatusBadge } from '../components/VendorComponents'
import AddProductWizard from '../../features/vendor/products/AddProductWizard'
import { getProducts } from '../../ApiServices/vendorAuthService'

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

export default function Products() {
  const location = useLocation()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('list') // list vs grid
  
  const [productsList, setProductsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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

  const fetchProducts = useCallback(async (page = currentPage, q = searchQuery) => {
    try {
      setIsLoading(true)
      const res = await getProducts({
        page,
        limit,
        q: q.trim()
      })
      if (res && res.data && Array.isArray(res.data)) {
        setProductsList(res.data)
        if (res.pagination) {
          setPagination(res.pagination)
          setCurrentPage(res.pagination.currentPage || page)
        }
      } else if (res && Array.isArray(res)) {
        setProductsList(res)
      } else {
        setProductsList([])
      }
    } catch (error) {
      console.error('Failed to fetch products', error)
      setProductsList([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, limit, searchQuery])

  useEffect(() => {
    if (!location.pathname.startsWith('/vendor/products/add') && !location.pathname.startsWith('/vendor/products/edit/')) {
      fetchProducts(currentPage, searchQuery)
    }
  }, [location.pathname, currentPage])

  // Live search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1)
      if (!location.pathname.startsWith('/vendor/products/add') && !location.pathname.startsWith('/vendor/products/edit/')) {
        fetchProducts(1, searchQuery)
      }
    }, 400)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === currentPage) return
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditClick = (product) => {
    navigate('/vendor/products/edit/' + product._id)
  }

  // Generate pagination page numbers
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

  // If on the add or edit route, render wizard
  if (location.pathname.startsWith('/vendor/products/add') || location.pathname.startsWith('/vendor/products/edit/')) {
    return <AddProductWizard />
  }

  return (
    <div className="space-y-8 text-left text-[#15251F]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#002F24] tracking-tight">Oils Product Catalog</h2>
          <p className="text-xs text-gray-500 mt-1">Add cooking oil varieties, set prices, and list discount offers (15 items per page).</p>
        </div>
        <div className="flex items-center gap-3">
          {pagination.totalProducts > 0 && (
            <div className="text-xs font-bold px-3.5 py-2 bg-[#FAF4E8] text-[#002F24] border border-[#D4AF37]/30 rounded-xl shadow-2xs">
              Total: <span className="text-[#D4AF37]">{pagination.totalProducts}</span>
            </div>
          )}
          <button 
            onClick={() => navigate('/vendor/products/add')}
            className="bg-[#002F24] hover:bg-[#014D3A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Oil Type
          </button>
        </div>
      </div>

      {/* Filter list options */}
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white border border-[#D4AF37]/25 rounded-xl px-3 py-1.5 w-full sm:w-80 shadow-sm focus-within:border-[#002F24] transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products by name, oil type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs outline-none w-full text-[#15251F] placeholder-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              Page <span className="font-bold text-[#002F24]">{currentPage}</span> of <span className="font-bold text-[#002F24]">{pagination.totalPages || 1}</span>
            </div>
            <div className="flex gap-1.5 border border-[#D4AF37]/20 rounded-xl p-0.5 bg-[#FAF4E8]/40">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-white shadow-2xs text-[#002F24]' : 'text-gray-400 hover:text-[#002F24]'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-white shadow-2xs text-[#002F24]' : 'text-gray-400 hover:text-[#002F24]'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Display listing */}
        {isLoading ? (
          <div className="py-16 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
            <span>Loading products (page {currentPage})...</span>
          </div>
        ) : productsList.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">No products found. Add a new product to get started!</div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Oil Type</th>
                  <th className="pb-3">Refining Type</th>
                  <th className="pb-3">Starting Price</th>
                  <th className="pb-3">Stock level</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productsList.map((product) => {
                  const firstVariant = product.variants?.[0] || {}
                  const totalStock = product.variants?.reduce((acc, v) => acc + (v.currentStock || 0), 0) || 0
                  const imgUrl = getProductImageUrl(product)
                  
                  return (
                    <tr key={product._id} className="text-gray-600 hover:bg-[#F8F2E7]/20 transition-colors">
                      <td className="py-3.5 font-bold text-[#002F24] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F8F2E7]/70 border border-[#D4AF37]/20 flex items-center justify-center text-[#002F24] shrink-0 overflow-hidden shadow-2xs">
                          {imgUrl ? (
                            <img 
                              src={imgUrl} 
                              alt={product.basicDetails?.name || 'Product'} 
                              className="w-full h-full object-cover rounded-xl"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.parentElement.querySelector('.vendor-prod-fallback')?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`vendor-prod-fallback ${imgUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                            <Package className="w-5 h-5 text-[#D4AF37]" />
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#002F24]">{product.basicDetails?.name}</div>
                          {product.basicDetails?.brandName && (
                            <div className="text-[10px] text-gray-400 font-normal">{product.basicDetails.brandName}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 text-gray-500">{product.compliance?.oilType || 'N/A'}</td>
                      <td className="py-3.5">{product.compliance?.extractionMethod || 'N/A'}</td>
                      <td className="py-3.5 font-semibold text-[#002F24]">₹{firstVariant.price || 0}</td>
                      <td className="py-3.5">{totalStock} Units</td>
                      <td className="py-3.5">
                        <StatusBadge status={product.status === 'PENDING_APPROVAL' ? 'Pending Approval' : product.status} />
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-1.5 bg-[#F8F2E7]/60 border border-[#D4AF37]/20 rounded-lg text-gray-500 hover:text-[#002F24] cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsList.map((product) => {
              const firstVariant = product.variants?.[0] || {}
              const totalStock = product.variants?.reduce((acc, v) => acc + (v.currentStock || 0), 0) || 0
              const imgUrl = getProductImageUrl(product)
              
              return (
                <div key={product._id} className="bg-[#F8F2E7]/25 border border-[#D4AF37]/20 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#D4AF37]/25 flex items-center justify-center text-[#002F24] overflow-hidden shrink-0">
                        {imgUrl ? (
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-[#D4AF37]" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#002F24] text-xs truncate max-w-[140px]">{product.basicDetails?.name}</h4>
                        <span className="text-[9px] text-gray-400 font-bold block">{product.compliance?.oilType}</span>
                      </div>
                    </div>
                    <StatusBadge status={product.status === 'PENDING_APPROVAL' ? 'Pending Approval' : product.status} />
                  </div>
                  <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                    <p>💰 Price: <span className="font-bold text-[#002F24]">₹{firstVariant.price || 0}</span></p>
                    <p>📦 Stock: <span className="font-bold text-[#002F24]">{totalStock} Units</span></p>
                    <p>🌾 Type: <span className="font-semibold text-gray-600">{product.compliance?.extractionMethod || 'N/A'}</span></p>
                  </div>
                  <div className="mt-5 border-t border-[#D4AF37]/10 pt-4 flex justify-end gap-2">
                    <button 
                      onClick={() => handleEditClick(product)}
                      className="px-3 py-1.5 bg-white border border-[#D4AF37]/35 rounded-lg text-[10px] font-bold text-[#002F24] hover:bg-[#002F24] hover:text-white transition-colors cursor-pointer"
                    >
                      Edit Product
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && pagination.totalProducts > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              Showing <span className="font-bold text-[#002F24]">{startRecord}</span> to <span className="font-bold text-[#002F24]">{endRecord}</span> of <span className="font-bold text-[#002F24]">{pagination.totalProducts}</span> products (15 / page)
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

    </div>
  )
}
