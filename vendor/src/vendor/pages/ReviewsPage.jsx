import { useState, useEffect, useMemo } from 'react'
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Package, 
  User, 
  Send, 
  CornerDownRight, 
  X, 
  Loader2,
  Award,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Smile,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

// Helper to format image URL
const getProductImageUrl = (img) => {
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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('ALL') // 'ALL', '5', '4', '3', '2', '1', 'FEATURED'
  const [searchTerm, setSearchTerm] = useState('')
  const [replyingReviewId, setReplyingReviewId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const vendorDataStr = localStorage.getItem('vendorData')
      if (!vendorDataStr) return
      const vendorData = JSON.parse(vendorDataStr)
      const vendorId = vendorData.id || vendorData._id

      const res = await fetch(`http://localhost:5006/api/reviews/vendor/${vendorId}`)
      const data = await res.json()
      if (data.success) {
        setReviews(data.reviews || [])
      }
    } catch (err) {
      console.error('Failed to load reviews', err)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  // Toggle Featured status on shop
  const handleToggleFeature = async (reviewId, currentStatus) => {
    try {
      setTogglingId(reviewId)
      const res = await fetch(`http://localhost:5006/api/reviews/${reviewId}/feature`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentStatus })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(!currentStatus ? 'Review featured on your shop!' : 'Review removed from featured')
        setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, isFeatured: !currentStatus } : r))
      }
    } catch (err) {
      toast.error('Failed to update featured status')
    } finally {
      setTogglingId(null)
    }
  }

  // Handle vendor reply submission
  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) return toast.error('Please enter reply message')
    try {
      setIsSubmittingReply(true)
      const res = await fetch(`http://localhost:5006/api/reviews/${reviewId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText.trim() })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Reply submitted successfully!')
        setReviews(prev => prev.map(r => r._id === reviewId ? { 
          ...r, 
          vendorReply: { message: replyText.trim(), repliedAt: new Date() } 
        } : r))
        setReplyingReviewId(null)
        setReplyText('')
      }
    } catch (err) {
      toast.error('Failed to submit reply')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // Analytics & Summary Calculations
  const stats = useMemo(() => {
    const total = reviews.length
    if (total === 0) {
      return {
        total: 0,
        average: 0,
        featuredCount: 0,
        repliedCount: 0,
        starCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        starPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    }

    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
    const average = (sum / total).toFixed(1)
    const featuredCount = reviews.filter(r => r.isFeatured).length
    const repliedCount = reviews.filter(r => r.vendorReply?.message).length

    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)))
      starCounts[star] = (starCounts[star] || 0) + 1
    })

    const starPercentages = {}
    for (let s = 1; s <= 5; s++) {
      starPercentages[s] = Math.round((starCounts[s] / total) * 100)
    }

    return { total, average, featuredCount, repliedCount, starCounts, starPercentages }
  }, [reviews])

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      // Star filter
      if (activeFilter === 'FEATURED' && !rev.isFeatured) return false
      if (activeFilter !== 'ALL' && activeFilter !== 'FEATURED') {
        const targetRating = Number(activeFilter)
        if (Math.round(rev.rating) !== targetRating) return false
      }

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const customerName = (rev.user?.name || '').toLowerCase()
        const prodName = (rev.productName || '').toLowerCase()
        const comment = (rev.comment || '').toLowerCase()
        return customerName.includes(query) || prodName.includes(query) || comment.includes(query)
      }

      return true
    })
  }, [reviews, activeFilter, searchTerm])

  const renderStars = (rating) => {
    const stars = []
    const num = Math.round(Number(rating) || 5)
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= num ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-100'}`} 
        />
      )
    }
    return stars
  }

  return (
    <div className="space-y-6 text-left text-slate-800 pb-16">
      
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <Star className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Reviews & Ratings</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Store Reputation
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Monitor customer feedback on your cooking oils, reply directly to buyers, and select which reviews highlight on your store profile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchReviews}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
          >
            <span>Refresh Reviews</span>
          </button>
        </div>
      </div>

      {/* Analytics & Rating Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Rating Score Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Customer Rating</span>
            <div className="flex items-baseline gap-3 mt-3">
              <h2 className="text-4xl font-extrabold text-slate-900">{stats.average}</h2>
              <span className="text-sm font-semibold text-slate-400">out of 5.0</span>
            </div>

            <div className="flex items-center gap-1 mt-2">
              {renderStars(stats.average)}
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Based on <span className="font-bold text-slate-800">{stats.total} verified</span> customer reviews across all your cooking oil products.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-100 mt-4">
            <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
              <p className="text-[10px] font-bold text-amber-900 uppercase">Featured on Store</p>
              <p className="text-lg font-bold text-amber-800 mt-0.5">{stats.featuredCount}</p>
            </div>
            <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-900 uppercase">Replies Given</p>
              <p className="text-lg font-bold text-blue-800 mt-0.5">{stats.repliedCount}</p>
            </div>
          </div>
        </div>

        {/* Rating Distribution Progress Bars (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Rating Breakdown</h3>
            
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.starCounts[star] || 0
                const percent = stats.starPercentages[star] || 0
                const isSelected = activeFilter === String(star)

                return (
                  <div 
                    key={star}
                    onClick={() => setActiveFilter(activeFilter === String(star) ? 'ALL' : String(star))}
                    className={`flex items-center gap-3 p-1.5 rounded-xl transition-colors cursor-pointer ${
                      isSelected ? 'bg-amber-50/80 ring-1 ring-amber-300' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <span className="text-xs font-bold text-slate-700">{star}</span>
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </div>

                    {/* Progress Track */}
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          star >= 4 ? 'bg-amber-400' : star === 3 ? 'bg-amber-300' : 'bg-rose-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="w-20 text-right shrink-0">
                      <span className="text-xs font-semibold text-slate-700">{count}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({percent}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Click any star bar to filter reviews</span>
            {activeFilter !== 'ALL' && (
              <button 
                onClick={() => setActiveFilter('ALL')}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Clear Rating Filter
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Main Reviews Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Filter Toolbar & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Reviews', count: reviews.length },
              { id: '5', label: '5 Stars ★', count: stats.starCounts[5] },
              { id: '4', label: '4 Stars ★', count: stats.starCounts[4] },
              { id: '3', label: '3 Stars ★', count: stats.starCounts[3] },
              { id: '2', label: '2 Stars ★', count: stats.starCounts[2] },
              { id: '1', label: '1 Star ★', count: stats.starCounts[1] },
              { id: 'FEATURED', label: '★ Featured Only', count: stats.featuredCount },
            ].map(tab => {
              const isSelected = activeFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-300/60 text-slate-600'
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
              placeholder="Search by customer, oil product or text..."
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

        {/* Reviews Cards List */}
        <div className="p-5">
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <span className="font-semibold text-sm">Loading customer reviews...</span>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-3">
                <MessageSquare className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No reviews found</h4>
              <p className="text-slate-500 max-w-sm mt-1 text-xs">
                {searchTerm || activeFilter !== 'ALL' 
                  ? 'No reviews match your selected filter criteria.' 
                  : 'Customer reviews will appear here once buyers review your cooking oil orders.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredReviews.map((rev) => {
                const isReplying = replyingReviewId === rev._id
                const customerName = rev.user?.name || 'Verified Customer'
                const initial = customerName.charAt(0).toUpperCase()
                const formattedDate = new Date(rev.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })

                return (
                  <div 
                    key={rev._id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                      rev.isFeatured ? 'border-amber-300 ring-1 ring-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white' : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Customer Header & Star Rating */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-xs">{customerName}</h4>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                Verified Buyer
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formattedDate}
                            </span>
                          </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 shrink-0">
                          <span className="text-xs font-extrabold text-amber-900">{rev.rating}</span>
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        </div>
                      </div>

                      {/* Product Thumbnail & Name Box */}
                      {(() => {
                        const pImg = getProductImageUrl(rev.productImage)
                        return (
                          <div className="mt-3.5 flex items-center gap-3 bg-slate-50/80 p-2 rounded-xl border border-slate-200/70">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                              {pImg ? (
                                <img 
                                  src={pImg} 
                                  alt={rev.productName} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    if (e.currentTarget.nextSibling) {
                                      e.currentTarget.nextSibling.style.display = 'flex'
                                    }
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full items-center justify-center bg-slate-100 text-slate-400 ${pImg ? 'hidden' : 'flex'}`}>
                                <Package className="w-4 h-4 text-slate-400" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-slate-800 text-xs block truncate" title={rev.productName}>
                                {rev.productName}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {rev.oilType ? `${rev.oilType} • ` : ''}Cooking Oil Product
                              </span>
                            </div>
                          </div>
                        )
                      })()}

                      {/* Comment Body */}
                      <div className="mt-3.5 relative bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-700 leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      </div>

                      {/* Vendor Reply Display */}
                      {rev.vendorReply?.message && (
                        <div className="mt-3 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                              <CornerDownRight className="w-3.5 h-3.5 text-blue-600" />
                              Store Response (Vendor)
                            </span>
                            {rev.vendorReply.repliedAt && (
                              <span className="text-[9px] text-blue-500">
                                {new Date(rev.vendorReply.repliedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {rev.vendorReply.message}
                          </p>
                        </div>
                      )}

                      {/* Reply Input Box (If Replying) */}
                      {isReplying && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span>Reply as Store Owner:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingReviewId(null)
                                setReplyText('')
                              }}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Thank the customer for their review or address their concern..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingReviewId(null)
                                setReplyText('')
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSubmitReply(rev._id)}
                              disabled={isSubmittingReply}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              {isSubmittingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                              Post Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      {/* Reply Button */}
                      {!rev.vendorReply?.message && !isReplying ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(rev._id)
                            setReplyText('')
                          }}
                          className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 p-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          <span>Reply to Buyer</span>
                        </button>
                      ) : rev.vendorReply?.message && !isReplying ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(rev._id)
                            setReplyText(rev.vendorReply.message)
                          }}
                          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Edit Reply
                        </button>
                      ) : (
                        <div></div>
                      )}

                      {/* Feature on Shop Toggle Button */}
                      <button 
                        type="button"
                        onClick={() => handleToggleFeature(rev._id, rev.isFeatured)}
                        disabled={togglingId === rev._id}
                        className={`font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer border transition-all flex items-center gap-1.5 ${
                          rev.isFeatured 
                            ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                        title={rev.isFeatured ? 'Review is prominently displayed on your shop page' : 'Click to feature this review on your store page'}
                      >
                        {togglingId === rev._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Star className={`w-3.5 h-3.5 ${rev.isFeatured ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                        )}
                        <span>{rev.isFeatured ? 'Featured on Shop' : 'Feature on Shop'}</span>
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
