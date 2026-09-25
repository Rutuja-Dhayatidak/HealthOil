import { useState, useEffect } from 'react'
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Store, 
  CreditCard, 
  Package, 
  ChevronDown, 
  Download, 
  Loader2 
} from 'lucide-react'
import { getAllOrders, updateOrderStatusAdminApi } from '../ApiServices/adminService'
import toast from 'react-hot-toast'

function Orders() {
  const [rawOrdersList, setRawOrdersList] = useState([])
  const [ordersList, setOrdersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newStatusValue, setNewStatusValue] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getAllOrders()
      if (res?.success) {
        const raw = res.orders || []
        setRawOrdersList(raw)

        const formatted = raw.map(o => ({
          raw: o,
          id: o.orderId || o._id,
          customer: o.user?.fullName || o.user?.name || o.deliveryAddress?.name || 'Guest User',
          shop: o.vendor?.business?.storeName || o.vendor?.fullName || 'HealthOil Direct',
          product: (o.items || []).map(i => `${i.productName || i.name} (${i.qty || i.quantity || 1})`).join(', '),
          amount: `₹${o.totalAmount}`,
          status: o.status || 'Pending',
          date: new Date(o.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
          })
        }))
        setOrdersList(formatted)
      }
    } catch (err) {
      console.error('Failed to fetch admin orders', err)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = (orderItem) => {
    setSelectedOrder(orderItem.raw || orderItem)
    setNewStatusValue(orderItem.raw?.status || orderItem.status || 'Pending')
    setModalOpen(true)
  }

  const handleUpdateStatus = async (orderId, statusToUpdate) => {
    try {
      setUpdatingStatus(true)
      const res = await updateOrderStatusAdminApi(orderId, statusToUpdate)

      if (res?.success) {
        toast.success(`Order status updated to "${statusToUpdate}"`)
        setSelectedOrder(prev => prev ? { ...prev, status: statusToUpdate } : prev)
        fetchOrders()
      }
    } catch (err) {
      console.error('Failed to update order status', err)
      toast.error(err.message || 'Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleExportCSV = () => {
    if (ordersList.length === 0) return toast.error('No orders to export.')

    const headers = ['Order ID', 'Date', 'Customer', 'Shop', 'Product Items', 'Amount', 'Status']
    const rows = filteredOrders.map(o => [
      `"${o.id}"`,
      `"${o.date}"`,
      `"${o.customer}"`,
      `"${o.shop}"`,
      `"${o.product.replace(/"/g, '""')}"`,
      `"${o.amount}"`,
      `"${o.status}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `HealthOil_Orders_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV Exported successfully!')
  }

  const filteredOrders = ordersList.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || order.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#031d13] tracking-tight">Order Management</h2>
        <p className="text-xs text-gray-500 mt-1">Track customer orders, delivery routes, and payment statuses.</p>
      </div>

      <div className="bg-white border border-[#b89547]/20 rounded-2xl p-6 shadow-sm">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white border border-[#b89547]/25 rounded-xl px-3 py-1.5 w-full sm:w-80 shadow-sm focus-within:border-[#031d13]">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, customer, product..." 
              className="bg-transparent text-xs outline-none w-full text-[#031d13] placeholder-gray-400 font-medium"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto relative">
            
            {/* Filter Status Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter !== 'ALL' 
                    ? 'bg-[#031d13] text-[#FAF4E8] border-[#031d13]' 
                    : 'bg-[#FAF4E8]/35 text-[#031d13] border-[#b89547]/25 hover:bg-[#FAF4E8]/80'
                }`}
              >
                <span>{statusFilter === 'ALL' ? 'Filter Status' : `Status: ${statusFilter}`}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {filterDropdownOpen && (
                <div className="absolute right-0 top-11 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-30 font-semibold text-xs text-left">
                  {['ALL', 'New', 'Packed', 'In Transit', 'Delivered', 'Cancelled', 'Pending'].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st)
                        setFilterDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between ${
                        statusFilter === st ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-700'
                      }`}
                    >
                      <span>{st === 'ALL' ? 'All Statuses' : st}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export CSV Button */}
            <button 
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#031d13] hover:bg-[#b89547] text-[#FAF4E8] hover:text-[#031d13] rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading orders data...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#b89547]/20 text-gray-400 font-bold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Shop</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? filteredOrders.map((order, idx) => (
                  <tr key={idx} className="text-gray-600 hover:bg-[#FAF4E8]/30 transition-colors duration-150">
                    <td className="py-3.5 font-mono font-bold text-[#b89547]">{order.id}</td>
                    <td className="py-3.5 text-gray-400">{order.date}</td>
                    <td className="py-3.5 font-bold text-[#031d13]">{order.customer}</td>
                    <td className="py-3.5 text-gray-500">{order.shop}</td>
                    <td className="py-3.5 max-w-xs truncate">{order.product}</td>
                    <td className="py-3.5 font-bold text-[#031d13]">{order.amount}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        order.status === 'Delivered' 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : order.status === 'In Transit' || order.status === 'Packed'
                          ? 'bg-amber-500/10 text-amber-600'
                          : order.status === 'Cancelled'
                          ? 'bg-rose-500/10 text-rose-600'
                          : 'bg-yellow-500/10 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button 
                        onClick={() => handleOpenDetails(order)}
                        title="View Full Order Details"
                        className="p-1.5 hover:bg-[#031d13]/10 text-gray-500 hover:text-[#031d13] rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-400 font-medium">
                      No orders found matching search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* Full Order Details Modal */}
      {/* ======================================================== */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-gray-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-left">
            
            {/* Modal Header */}
            <div className="bg-[#0b3b84] text-white px-6 py-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg font-mono text-yellow-300">
                    Order #{selectedOrder.orderId || selectedOrder._id}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    selectedOrder.status === 'Delivered' ? 'bg-emerald-500 text-white' :
                    selectedOrder.status === 'In Transit' ? 'bg-amber-500 text-white' :
                    selectedOrder.status === 'Packed' ? 'bg-blue-500 text-white' :
                    selectedOrder.status === 'Cancelled' ? 'bg-rose-500 text-white' :
                    'bg-yellow-500 text-gray-900'
                  }`}>
                    {selectedOrder.status || 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-1">
                  Placed on: {new Date(selectedOrder.createdAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>

              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">

              {/* 3 Detail Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Customer Info */}
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs border-b border-gray-200 pb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Customer Information
                  </h4>
                  <p className="font-bold text-gray-900 text-sm">
                    {selectedOrder.user?.fullName || selectedOrder.user?.name || selectedOrder.deliveryAddress?.name || 'Guest User'}
                  </p>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{selectedOrder.user?.email || selectedOrder.deliveryAddress?.email || 'N/A'}</span>
                  </p>
                  <p className="text-gray-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{selectedOrder.user?.mobile || selectedOrder.user?.phone || selectedOrder.deliveryAddress?.phone || 'N/A'}</span>
                  </p>
                </div>

                {/* Delivery Address */}
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs border-b border-gray-200 pb-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Delivery Address
                  </h4>
                  {selectedOrder.deliveryAddress ? (
                    <div className="text-gray-700 leading-relaxed">
                      <p className="font-bold text-gray-900">{selectedOrder.deliveryAddress.name}</p>
                      <p>{selectedOrder.deliveryAddress.addressLine1 || selectedOrder.deliveryAddress.street}</p>
                      {selectedOrder.deliveryAddress.subCity && <p>{selectedOrder.deliveryAddress.subCity}</p>}
                      <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}</p>
                      <p className="mt-1 font-semibold text-gray-600">📱 {selectedOrder.deliveryAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No delivery address recorded</p>
                  )}
                </div>

                {/* Vendor Details */}
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-2">
                  <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs border-b border-gray-200 pb-2">
                    <Store className="w-4 h-4 text-purple-600" />
                    Vendor / Merchant
                  </h4>
                  <p className="font-bold text-gray-900 text-sm">
                    {selectedOrder.vendor?.business?.storeName || selectedOrder.vendor?.fullName || 'HealthOil Merchant'}
                  </p>
                  {selectedOrder.vendor?.email && (
                    <p className="text-gray-500 truncate">📧 {selectedOrder.vendor.email}</p>
                  )}
                  {selectedOrder.vendor?.mobile && (
                    <p className="text-gray-500">📱 {selectedOrder.vendor.mobile}</p>
                  )}
                </div>

              </div>

              {/* Financial & Payment Summary */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Payment Method</span>
                  <span className="font-bold text-gray-800 text-sm flex items-center gap-1.5 mt-0.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    {selectedOrder.paymentMethod || 'Online Payment (Razorpay)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Payment Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold mt-0.5 ${
                    selectedOrder.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedOrder.paymentStatus || 'PAID'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Total Amount</span>
                  <span className="font-extrabold text-lg text-emerald-700">
                    ₹{selectedOrder.totalAmount?.toLocaleString('en-IN') || 0}
                  </span>
                </div>
              </div>

              {/* Ordered Items Table */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-xs flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-blue-600" />
                  Order Items ({selectedOrder.items?.length || 0})
                </h4>

                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Price</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="p-3 font-bold text-gray-800">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm shrink-0">
                                📦
                              </div>
                              <div>
                                <div>{item.productName}</div>
                                {item.variantSize && <div className="text-[10px] text-gray-400 font-normal">{item.variantSize}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-gray-600 font-medium">₹{item.price}</td>
                          <td className="p-3 text-center font-bold text-gray-800">{item.qty || item.quantity || 1}</td>
                          <td className="p-3 text-right font-bold text-emerald-700">
                            ₹{(item.price * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Update Status Admin Controls */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Update Order Status</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={newStatusValue}
                      onChange={(e) => setNewStatusValue(e.target.value)}
                      className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold outline-none text-gray-800 focus:border-blue-500"
                    >
                      <option value="New">New</option>
                      <option value="Packed">Packed</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.orderId || selectedOrder._id, newStatusValue)}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {updatingStatus ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close Details
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Orders
