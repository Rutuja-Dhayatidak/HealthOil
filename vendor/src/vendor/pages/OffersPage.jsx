import { useState, useEffect, useCallback } from 'react'
import { 
  Tag, 
  Plus, 
  Search, 
  Percent, 
  Calendar, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  X, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  TrendingUp,
  ShoppingBag,
  Info,
  Gift,
  Zap,
  SlidersHorizontal,
  ArrowRight,
  BadgePercent,
  Layers
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  getVendorOffers, 
  createVendorOffer, 
  updateVendorOffer, 
  toggleOfferStatus, 
  deleteVendorOffer,
  getProducts 
} from '../../ApiServices/vendorAuthService'

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

export default function OffersPage() {
  const [offersList, setOffersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [summary, setSummary] = useState({ total: 0, active: 0, paused: 0, expired: 0, productsWithOffers: 0 })

  // Backend pagination (15 per page)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(15)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOffers: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Vendor's products for offer creation
  const [vendorProducts, setVendorProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteModalOffer, setDeleteModalOffer] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedCode, setCopiedCode] = useState(null)

  // Form State
  const initialForm = {
    title: '',
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '15',
    applicableTo: 'SPECIFIC_PRODUCTS',
    applicableProducts: [],
    minOrderValue: '',
    maxDiscountAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: ''
  }
  const [formData, setFormData] = useState(initialForm)
  const [productSearch, setProductSearch] = useState('')

  // Fetch offers from backend
  const fetchOffers = useCallback(async (page = currentPage, status = statusFilter, search = searchTerm) => {
    try {
      setLoading(true)
      const res = await getVendorOffers({
        page,
        limit,
        status,
        search: search.trim()
      })
      if (res.success) {
        setOffersList(res.offers || [])
        if (res.summary) setSummary(res.summary)
        if (res.pagination) {
          setPagination(res.pagination)
          setCurrentPage(res.pagination.currentPage || page)
        }
      }
    } catch (error) {
      toast.error('Failed to load offers')
    } finally {
      setLoading(false)
    }
  }, [currentPage, limit, statusFilter, searchTerm])

  // Fetch vendor products for selection
  const fetchVendorProducts = async () => {
    try {
      setLoadingProducts(true)
      const res = await getProducts({ limit: 100 })
      if (res && res.data && Array.isArray(res.data)) {
        setVendorProducts(res.data)
      } else if (res && Array.isArray(res)) {
        setVendorProducts(res)
      }
    } catch (err) {
      console.error('Failed to load products for offer', err)
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    fetchOffers(currentPage, statusFilter, searchTerm)
  }, [currentPage, statusFilter])

  useEffect(() => {
    fetchVendorProducts()
  }, [])

  // Live search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1)
      fetchOffers(1, statusFilter, searchTerm)
    }, 350)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const handleOpenCreate = () => {
    setEditingOffer(null)
    setFormData(initialForm)
    setProductSearch('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (offer) => {
    setEditingOffer(offer)
    setFormData({
      title: offer.title || '',
      code: offer.code || '',
      discountType: offer.discountType || 'PERCENTAGE',
      discountValue: offer.discountValue || '',
      applicableTo: offer.applicableTo || 'SPECIFIC_PRODUCTS',
      applicableProducts: (offer.applicableProducts || []).map(p => p._id || p),
      minOrderValue: offer.minOrderValue || '',
      maxDiscountAmount: offer.maxDiscountAmount || '',
      startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
      endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
      description: offer.description || ''
    })
    setProductSearch('')
    setIsModalOpen(true)
  }

  const handleGenerateRandomCode = () => {
    const prefixList = ['HEALTH', 'PURE', 'OIL', 'FESTIVE', 'SUPER', 'ORGANIC', 'SAVE']
    const randomPrefix = prefixList[Math.floor(Math.random() * prefixList.length)]
    const randomVal = formData.discountValue ? Math.round(formData.discountValue) : 15
    const randomCode = `${randomPrefix}${randomVal}`
    setFormData(prev => ({ ...prev, code: randomCode }))
  }

  const handleSetDurationPreset = (days) => {
    const start = new Date(formData.startDate || new Date())
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000)
    setFormData(prev => ({
      ...prev,
      endDate: end.toISOString().split('T')[0]
    }))
  }

  const handleToggleProductSelection = (productId) => {
    setFormData(prev => {
      const exists = prev.applicableProducts.includes(productId)
      return {
        ...prev,
        applicableProducts: exists 
          ? prev.applicableProducts.filter(id => id !== productId)
          : [...prev.applicableProducts, productId]
      }
    })
  }

  const handleSelectAllProducts = () => {
    setFormData(prev => ({
      ...prev,
      applicableProducts: vendorProducts.map(p => p._id)
    }))
  }

  const handleClearSelectedProducts = () => {
    setFormData(prev => ({
      ...prev,
      applicableProducts: []
    }))
  }

  const handleSubmitOffer = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      return toast.error('Please enter offer title')
    }
    if (!formData.code.trim()) {
      return toast.error('Please enter coupon code')
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      return toast.error('Please enter valid discount value')
    }
    if (formData.applicableTo === 'SPECIFIC_PRODUCTS' && formData.applicableProducts.length === 0) {
      return toast.error('Please select at least one product for this offer')
    }
    if (!formData.endDate) {
      return toast.error('Please select expiry date')
    }

    try {
      setIsSaving(true)
      if (editingOffer) {
        const res = await updateVendorOffer(editingOffer._id, formData)
        if (res.success) {
          toast.success('Offer updated successfully!')
          setIsModalOpen(false)
          fetchOffers(currentPage, statusFilter, searchTerm)
        }
      } else {
        const res = await createVendorOffer(formData)
        if (res.success) {
          toast.success('New offer created and active!')
          setIsModalOpen(false)
          fetchOffers(1, statusFilter, searchTerm)
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save offer')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (offerId) => {
    try {
      const res = await toggleOfferStatus(offerId)
      if (res.success) {
        toast.success(res.message)
        fetchOffers(currentPage, statusFilter, searchTerm)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update offer status')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteModalOffer || isDeleting) return
    try {
      setIsDeleting(true)
      const res = await deleteVendorOffer(deleteModalOffer._id)
      if (res.success) {
        toast.success('Offer deleted successfully!')
        setDeleteModalOffer(null)
        fetchOffers(currentPage, statusFilter, searchTerm)
      }
    } catch (error) {
      toast.error('Failed to delete offer')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Coupon code ${code} copied!`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === currentPage) return
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Filtered products for modal search
  const modalFilteredProducts = vendorProducts.filter(p => 
    (p.basicDetails?.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.compliance?.oilType || '').toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.basicDetails?.brandName || '').toLowerCase().includes(productSearch.toLowerCase())
  )

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
      for (let i = start; i <= end; i++) pages.push(i)
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }
    return pages
  }

  const startRecord = pagination.totalOffers === 0 ? 0 : (currentPage - 1) * limit + 1
  const endRecord = Math.min(currentPage * limit, pagination.totalOffers || 0)

  return (
    <div className="space-y-6 text-left text-slate-800">

      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product Offers & Discounts</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Marketing
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Create and manage customer discounts, coupon codes, and bundle offers across your cooking oil catalog.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer shrink-0 active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:border-slate-300 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Campaigns</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{summary.total}</h3>
          </div>
        </div>

        {/* Active */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:border-emerald-200 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active Now</p>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-xl font-bold text-emerald-600">{summary.active}</h3>
              {summary.active > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </div>
          </div>
        </div>

        {/* Products on Sale */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:border-indigo-200 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Discounted Oils</p>
            <h3 className="text-xl font-bold text-indigo-600 mt-0.5">{summary.productsWithOffers}</h3>
          </div>
        </div>

        {/* Paused / Expired */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:border-slate-300 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-500 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Paused / Expired</p>
            <h3 className="text-xl font-bold text-slate-700 mt-0.5">{summary.paused + summary.expired}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Filters and Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/40">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Offers', count: summary.total },
              { id: 'ACTIVE', label: 'Active', count: summary.active },
              { id: 'PAUSED', label: 'Paused', count: summary.paused },
              { id: 'EXPIRED', label: 'Expired', count: summary.expired },
            ].map(tab => {
              const isSelected = statusFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id)
                    setCurrentPage(1)
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'bg-slate-300/60 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, promo code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table of Offers */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
              <span className="font-medium">Loading offers...</span>
            </div>
          ) : offersList.length === 0 ? (
            <div className="py-20 px-4 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 mb-3">
                <Tag className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No discount offers found</h4>
              <p className="text-slate-500 max-w-sm mt-1 text-xs">
                {searchTerm ? 'No results matched your search term.' : 'Boost your oil sales by creating limited-time discounts or promo coupon codes.'}
              </p>
              {!searchTerm && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  + Create Your First Offer
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Offer Title & Code</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Applicable Products</th>
                  <th className="py-3 px-4">Min. Spend</th>
                  <th className="py-3 px-4">Validity Period</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offersList.map((offer) => {
                  const isPercentage = offer.discountType === 'PERCENTAGE'
                  const isFlat = offer.discountType === 'FLAT'
                  const isBogo = offer.discountType === 'BOGO'
                  const isExpired = new Date(offer.endDate) < new Date() || offer.status === 'EXPIRED'
                  const isActive = offer.status === 'ACTIVE' && !isExpired

                  return (
                    <tr key={offer._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Offer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isActive ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            <Tag className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-xs">{offer.title}</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                                {offer.code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(offer.code)}
                                className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
                                title="Copy Promo Code"
                              >
                                {copiedCode === offer.code ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Discount Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 border ${
                          isPercentage 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : isFlat 
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          <BadgePercent className="w-3.5 h-3.5" />
                          {isPercentage && `${offer.discountValue}% OFF`}
                          {isFlat && `₹${offer.discountValue} FLAT OFF`}
                          {isBogo && 'BUY 1 GET 1 FREE'}
                        </span>
                        {offer.maxDiscountAmount && isPercentage && (
                          <span className="text-[10px] text-slate-500 block mt-1">
                            Cap: up to ₹{offer.maxDiscountAmount}
                          </span>
                        )}
                      </td>

                      {/* Applicable Products */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        {offer.applicableTo === 'ALL_PRODUCTS' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                            <Package className="w-3.5 h-3.5" />
                            All Store Products
                          </span>
                        ) : (
                          <div>
                            <span className="text-xs font-semibold text-slate-700">
                              {offer.applicableProducts?.length || 0} Products Selected
                            </span>
                            <div className="flex items-center gap-1 mt-1.5">
                              {offer.applicableProducts?.slice(0, 4).map((prod, idx) => {
                                const img = getProductImageUrl(prod)
                                return (
                                  <div 
                                    key={idx} 
                                    className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center"
                                    title={prod?.basicDetails?.name || 'Product'}
                                  >
                                    {img ? (
                                      <img src={img} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                  </div>
                                )
                              })}
                              {offer.applicableProducts?.length > 4 && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-lg px-1.5 py-1 border border-slate-200">
                                  +{offer.applicableProducts.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Min Order */}
                      <td className="py-3.5 px-4">
                        {offer.minOrderValue > 0 ? (
                          <span className="font-semibold text-slate-800">₹{offer.minOrderValue}</span>
                        ) : (
                          <span className="text-slate-400 font-medium">No Minimum</span>
                        )}
                      </td>

                      {/* Validity */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Till {new Date(offer.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 ml-4">
                          Started {new Date(offer.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                          isExpired 
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : isActive 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isExpired ? 'bg-slate-400' : isActive ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}></span>
                          {isExpired ? 'EXPIRED' : offer.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Toggle active / paused */}
                          {!isExpired && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(offer._id)}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                isActive
                                  ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={isActive ? 'Pause Offer' : 'Activate Offer'}
                            >
                              {isActive ? 'Pause' : 'Activate'}
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(offer)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            title="Edit Offer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalOffer(offer)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200/80 cursor-pointer"
                            title="Delete Offer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 15-Item Backend Pagination Bar */}
        {!loading && pagination.totalOffers > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-800">{startRecord}</span> to <span className="font-bold text-slate-800">{endRecord}</span> of <span className="font-bold text-slate-800">{pagination.totalOffers}</span> offers (15 / page)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 h-8 rounded-lg border border-slate-200 flex items-center gap-1 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </button>

              <div className="flex items-center gap-1 mx-1">
                {getPageNumbers().map((page, idx) => {
                  if (page === '...') {
                    return <span key={`dots-${idx}`} className="px-1 text-xs text-slate-400">...</span>
                  }
                  const isCurrent = page === currentPage
                  return (
                    <button
                      key={`page-${page}`}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'border border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 h-8 rounded-lg border border-slate-200 flex items-center gap-1 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={currentPage === pagination.totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Premium Create / Edit Offer Modal */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col my-auto overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingOffer ? 'Edit Product Offer' : 'Create New Product Offer'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure your discount rule and choose which cooking oils qualify.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitOffer} className="p-6 space-y-6 flex-1 overflow-y-auto text-left">
              
              {/* Row 1: Campaign Title & Coupon Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Offer Campaign Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Festival Special 15% OFF"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Promo / Coupon Code <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomCode}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Auto Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HEALTH15"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Discount Type Selector (Pills) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Discount Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'PERCENTAGE', label: 'Percentage % Off', desc: 'e.g. 15% or 20% discount', icon: Percent },
                    { id: 'FLAT', label: 'Flat Amount ₹ Off', desc: 'e.g. ₹100 direct deduction', icon: Tag },
                    { id: 'BOGO', label: 'Buy 1 Get 1 (BOGO)', desc: 'Promotional bundle deal', icon: Gift },
                  ].map(type => {
                    const isSelected = formData.discountType === type.id
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, discountType: type.id })}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-xs ring-1 ring-blue-500'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{type.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{type.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Row 3: Discount Value & Max Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {formData.discountType === 'PERCENTAGE' 
                      ? 'Discount Percentage (%) *' 
                      : formData.discountType === 'FLAT' 
                        ? 'Flat Amount (₹) *' 
                        : 'Free Units per Order *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max={formData.discountType === 'PERCENTAGE' ? 100 : 10000}
                      placeholder={formData.discountType === 'PERCENTAGE' ? '15' : '100'}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {formData.discountType === 'PERCENTAGE' ? '%' : formData.discountType === 'FLAT' ? '₹' : 'Units'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Max Discount Cap (₹) <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 500 (No limit if blank)"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: Apply Scope (Specific Products vs Store Wide) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Apply Offer To <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, applicableTo: 'SPECIFIC_PRODUCTS' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.applicableTo === 'SPECIFIC_PRODUCTS'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold block">Selected Products Only</span>
                    <span className="text-[10px] text-slate-500 font-normal">Choose specific cooking oils from your catalog</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, applicableTo: 'ALL_PRODUCTS' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      formData.applicableTo === 'ALL_PRODUCTS'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold block">All Catalog Products</span>
                    <span className="text-[10px] text-slate-500 font-normal">Apply store-wide discount to all oils</span>
                  </button>
                </div>

                {/* Specific Products List Box */}
                {formData.applicableTo === 'SPECIFIC_PRODUCTS' && (
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          Select Cooking Oils
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {formData.applicableProducts.length} selected
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllProducts}
                          className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Select All ({vendorProducts.length})
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={handleClearSelectedProducts}
                          className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>

                    {/* Search inside products */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search product name, brand or oil type..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
                      />
                    </div>

                    {loadingProducts ? (
                      <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Loading your products...</span>
                      </div>
                    ) : modalFilteredProducts.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No products found matching "{productSearch}".
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white rounded-lg border border-slate-200/80">
                        {modalFilteredProducts.map((prod) => {
                          const isSelected = formData.applicableProducts.includes(prod._id)
                          const img = getProductImageUrl(prod)
                          const firstPrice = prod.variants?.[0]?.price || 0

                          return (
                            <label
                              key={prod._id}
                              className={`flex items-center gap-3 p-2.5 hover:bg-slate-50 transition-colors cursor-pointer ${
                                isSelected ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleProductSelection(prod._id)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {img ? (
                                  <img src={img} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">{prod.basicDetails?.name}</p>
                                <p className="text-[10px] text-slate-500">
                                  {prod.compliance?.oilType || 'Cooking Oil'} • Price: <span className="font-semibold text-slate-700">₹{firstPrice}</span>
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                              )}
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Row 5: Validity Dates & Min Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Expiry Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-1">
                      {[7, 15, 30].map(days => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => handleSetDurationPreset(days)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium cursor-pointer"
                        >
                          +{days}d
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Min. Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 (No min order)"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 6: Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Terms / Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Valid on 1L & 5L bottles. Maximum 1 coupon per registered account."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Live Preview Card */}
              <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-emerald-50/50 rounded-xl p-4 border border-blue-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    {formData.discountType === 'PERCENTAGE' ? `${formData.discountValue || 0}%` : '₹'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{formData.title || 'Untitled Offer'}</span>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                        {formData.code || 'COUPON'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formData.applicableTo === 'ALL_PRODUCTS' 
                        ? 'Valid on all products' 
                        : `${formData.applicableProducts.length} product(s) selected`}
                      {formData.minOrderValue ? ` • Min. order ₹${formData.minOrderValue}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full whitespace-nowrap">
                  Live Preview
                </span>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingOffer ? 'Save Offer Changes' : 'Publish Offer'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Delete Confirmation Modal */}
      {/* ========================================================================= */}
      {deleteModalOffer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[110] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-base text-slate-900 mb-1">Delete Offer?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to permanently delete coupon <span className="font-bold text-slate-800 font-mono">"{deleteModalOffer.code}"</span>? Customers will no longer be able to use it.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModalOffer(null)}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-semibold text-xs hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Offer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
