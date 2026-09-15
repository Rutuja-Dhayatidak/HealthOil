import { useState, useEffect, useCallback } from 'react'
import { Search, Eye, XCircle, CheckCircle, RefreshCcw, MapPin, ExternalLink, Navigation, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, X } from 'lucide-react'
import { StatusBadge, OrderStatusTimeline } from '../components/VendorComponents'
import { getVendorOrders } from '../../ApiServices/vendorAuthService'
import axios from 'axios'
import { io } from 'socket.io-client'

export default function Orders() {
  const [activeTab, setActiveTab] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('Item unavailable')
  const [searchQuery, setSearchQuery] = useState('')
  const [ordersData, setOrdersData] = useState([])
  const [loading, setLoading] = useState(true)

  // Backend Pagination state (15 items per page)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(15)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  const tabs = ['All', 'New', 'Accepted', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Delivered', 'Cancelled', 'Returned']

  const fetchOrders = useCallback(async (page = currentPage, status = activeTab, search = searchQuery) => {
    try {
      setLoading(true)
      const res = await getVendorOrders({
        page,
        limit,
        status,
        search: search.trim()
      })

      if (res.success) {
        const formatted = (res.orders || []).map(o => {
          const lat = o.deliveryAddress?.lat
          const lng = o.deliveryAddress?.lng
          const address = o.deliveryAddress?.addressText || (lat && lng ? `GPS: ${lat}, ${lng}` : 'Address not specified')
          const mapUrl = (lat && lng) 
            ? `https://www.google.com/maps?q=${lat},${lng}` 
            : (address && address !== 'Address not specified' ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null)
          const distance = (lat && lng) ? `${(Math.abs(lat - 18.5204) * 111).toFixed(1)} km` : null

          return {
            id: o.orderId,
            dbId: o._id,
            customer: o.user?.name || o.deliveryAddress?.name || 'Guest',
            mobile: o.user?.phone || o.deliveryAddress?.phone || 'N/A',
            product: o.items.map(i => `${i.productName} (${i.qty})`).join(', '),
            qty: o.items.reduce((sum, i) => sum + i.qty, 0),
            amount: `₹${o.totalAmount}`,
            payment: o.paymentMethod,
            time: new Date(o.createdAt).toLocaleString(),
            status: o.status,
            address: address,
            lat: lat,
            lng: lng,
            mapUrl: mapUrl,
            distance: distance,
            deliveryBoy: 'N/A'
          }
        })
        setOrdersData(formatted)
        if (res.pagination) {
          setPagination(res.pagination)
          setCurrentPage(res.pagination.currentPage || page)
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, limit, activeTab, searchQuery])

  useEffect(() => {
    fetchOrders(currentPage, activeTab, searchQuery)

    // Listen for new orders via socket to update table in real-time
    const token = localStorage.getItem('vendorToken')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const vendorId = payload.id

        const socket = io('http://localhost:5000')
        socket.emit('joinVendorRoom', vendorId)

        socket.on('new-order', () => {
          fetchOrders(currentPage, activeTab, searchQuery)
        })

        return () => socket.disconnect()
      } catch (err) {
        console.error('Socket setup error in Orders', err)
      }
    }
  }, [currentPage, activeTab])

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1)
      fetchOrders(1, activeTab, searchQuery)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === currentPage) return
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('vendorToken')
      const order = ordersData.find(o => o.id === orderId)
      if (!order) return

      const encodedId = encodeURIComponent(order.id);
      await axios.put(`http://localhost:5000/api/vendors/orders/${encodedId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev)
      setOrdersData(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const handleRejectSubmit = () => {
    if (selectedOrder) {
      handleStatusChange(selectedOrder.id, 'Cancelled')
      setShowRejectModal(false)
    }
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

  const startRecord = pagination.totalOrders === 0 ? 0 : (currentPage - 1) * limit + 1
  const endRecord = Math.min(currentPage * limit, pagination.totalOrders || 0)

  return (
    <div className="space-y-8 text-left text-[#15251F]">

      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#002F24] tracking-tight">Order Fulfilment</h2>
          <p className="text-xs text-gray-500 mt-1">Accept incoming purchases, track delivery routes, and monitor customer locations.</p>
        </div>

        {pagination.totalOrders > 0 && (
          <div className="text-xs font-bold px-3.5 py-1.5 bg-[#FAF4E8] text-[#002F24] border border-[#D4AF37]/30 rounded-xl shadow-2xs">
            Total Orders: <span className="text-[#D4AF37]">{pagination.totalOrders}</span>
          </div>
        )}
      </div>

      {/* Tabs list navigation */}
      <div className="flex border-b border-[#D4AF37]/20 gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#D4AF37]/20">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 border-b-2 -mb-0.5 ${activeTab === tab
                ? 'border-[#002F24] text-[#002F24]'
                : 'border-transparent text-gray-500 hover:text-[#002F24]'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table grid layout */}
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5 bg-white border border-[#D4AF37]/25 rounded-xl px-3 py-1.5 w-full sm:w-80 shadow-sm focus-within:border-[#002F24] transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, customer, address, item..."
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

          <div className="text-xs text-gray-500">
            Page <span className="font-bold text-[#002F24]">{currentPage}</span> of <span className="font-bold text-[#002F24]">{pagination.totalPages || 1}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
              <span>Loading orders (page {currentPage})...</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold">
                  <th className="pb-3 px-2 whitespace-nowrap">Order ID</th>
                  <th className="pb-3 px-2 min-w-[130px]">Customer</th>
                  <th className="pb-3 px-2 min-w-[220px]">Delivery Location</th>
                  <th className="pb-3 px-2 min-w-[180px]">Oil Item</th>
                  <th className="pb-3 px-2 text-center whitespace-nowrap">Qty</th>
                  <th className="pb-3 px-2 whitespace-nowrap">Amount</th>
                  <th className="pb-3 px-2 whitespace-nowrap">Payment</th>
                  <th className="pb-3 px-2 whitespace-nowrap">Status</th>
                  <th className="pb-3 px-2 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordersData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-gray-400 text-xs">
                      No orders found for this tab or search filter.
                    </td>
                  </tr>
                ) : (
                  ordersData.map((order, idx) => (
                    <tr key={idx} className="text-gray-650 hover:bg-[#F8F2E7]/20 transition-colors">
                      <td className="py-3.5 px-2 font-mono font-bold text-[#D4AF37] whitespace-nowrap">{order.id}</td>
                      <td className="py-3.5 px-2 min-w-[130px]">
                        <div className="font-bold text-[#002F24]">{order.customer}</div>
                        <div className="text-[10px] text-gray-400">{order.mobile}</div>
                      </td>
                      <td className="py-3.5 px-2 max-w-[220px]">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-gray-700 font-medium" title={order.address}>{order.address}</p>
                            {order.mapUrl && (
                              <a
                                href={order.mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-[#002F24] hover:text-[#D4AF37] font-bold inline-flex items-center gap-0.5 mt-0.5 underline"
                              >
                                Open Maps <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 max-w-[200px]">
                        <p className="truncate font-medium text-[#002F24]" title={order.product}>{order.product}</p>
                      </td>
                      <td className="py-3.5 px-2 text-center font-bold whitespace-nowrap">{order.qty}</td>
                      <td className="py-3.5 px-2 font-bold text-[#002F24] whitespace-nowrap">{order.amount}</td>
                      <td className="py-3.5 px-2 whitespace-nowrap">{order.payment}</td>
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 px-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 bg-[#F8F2E7]/60 border border-[#D4AF37]/20 rounded-lg text-gray-500 hover:text-[#002F24] transition-colors cursor-pointer shadow-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && pagination.totalOrders > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500">
              Showing <span className="font-bold text-[#002F24]">{startRecord}</span> to <span className="font-bold text-[#002F24]">{endRecord}</span> of <span className="font-bold text-[#002F24]">{pagination.totalOrders}</span> orders (15 / page)
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

      {/* Selected Order Detailed View Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-end z-40">
          <div className="bg-white border-l border-[#D4AF37]/25 w-full max-w-lg h-full p-6 flex flex-col justify-between overflow-y-auto text-left shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#002F24]">Order Details: {selectedOrder.id}</h3>
                  {selectedOrder.distance && (
                    <span className="text-[10px] text-gray-400 block mt-0.5">Estimated Distance: {selectedOrder.distance}</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-2.5 py-1 text-[10px] font-bold border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Order address & items details */}
              <div className="space-y-6">
                
                {/* Customer & Location Box */}
                <div className="bg-[#FAF4E8]/40 border border-[#D4AF37]/20 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Customer Delivery Location</span>
                    {selectedOrder.distance && (
                      <span className="text-[10px] font-bold bg-[#002F24] text-[#FAF4E8] px-2 py-0.5 rounded-full">{selectedOrder.distance}</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#002F24]">{selectedOrder.customer} ({selectedOrder.mobile})</p>
                  <p className="text-xs text-gray-600 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{selectedOrder.address}</span>
                  </p>
                  {selectedOrder.mapUrl && (
                    <a
                      href={selectedOrder.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002F24] hover:text-[#D4AF37] mt-1 bg-white border border-[#D4AF37]/30 px-3 py-1.5 rounded-lg shadow-2xs"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600" /> Open Navigation Maps
                    </a>
                  )}
                </div>

                {/* Timeline status step */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Fulfilment Progress</h4>
                  <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs">
                    <OrderStatusTimeline currentStatus={selectedOrder.status} />
                  </div>
                </div>

                {/* Ordered Items overview */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Order Items</h4>
                  <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-[#002F24]">
                      <span>{selectedOrder.product}</span>
                      <span>{selectedOrder.amount}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                      <span>Total Quantity</span>
                      <span className="font-bold text-gray-700">{selectedOrder.qty} Units</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Actions footer */}
            <div className="border-t border-gray-100 pt-4 mt-6 space-y-2">
              {selectedOrder.status === 'New' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Decline Order
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Accepted')}
                    className="py-2.5 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#002F24]/10"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept Order
                  </button>
                </div>
              )}

              {selectedOrder.status === 'Accepted' && (
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, 'Preparing')}
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#C29F30] text-[#002F24] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/10"
                >
                  Start Preparing (Bottling / Packing)
                </button>
              )}

              {selectedOrder.status === 'Preparing' && (
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, 'Ready for Pickup')}
                  className="w-full py-3 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#002F24]/10"
                >
                  Mark Ready for Pickup
                </button>
              )}

              {selectedOrder.status === 'Ready for Pickup' && (
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, 'Picked Up')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/10"
                >
                  Handed Over / Picked Up
                </button>
              )}

              {selectedOrder.status === 'Picked Up' && (
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, 'Delivered')}
                  className="w-full py-3 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#16A34A]/10"
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#D4AF37]/25 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-left">
            <h3 className="font-serif font-bold text-[#002F24] text-sm mb-4">Decline Order</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Rejection Reason</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]"
                >
                  <option>Item unavailable</option>
                  <option>Shop closing</option>
                  <option>Incorrect stock</option>
                  <option>Unable to prepare</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Submit Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
