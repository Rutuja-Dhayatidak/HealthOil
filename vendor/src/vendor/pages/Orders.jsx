import { useState } from 'react'
import { Search, Eye, XCircle, CheckCircle, RefreshCcw } from 'lucide-react'
import { StatusBadge, OrderStatusTimeline } from '../components/VendorComponents'

export default function Orders() {
  const [activeTab, setActiveTab] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('Item unavailable')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = ['All', 'New', 'Accepted', 'Preparing', 'Ready for Pickup', 'Picked Up', 'Delivered', 'Cancelled', 'Returned']

  const ordersData = [
    { id: '#PO-9840', customer: 'Amit Sharma', mobile: '+91 99*** *9876', product: 'Groundnut Oil (5L)', qty: 1, amount: '₹950', payment: 'COD', time: '10 mins ago', status: 'New', address: 'Apartment 402, Block A, Green Meadows, New Delhi', distance: '3.2 KM', deliveryBoy: 'Ramesh Kumar (+91 98888 77777)' },
    { id: '#PO-9841', customer: 'Priyanka Sen', mobile: '+91 87*** *6543', product: 'Coconut Oil (2L)', qty: 2, amount: '₹1,020', payment: 'Online', time: '1 hr ago', status: 'Preparing', address: 'House 5, Street 2, Link Road, New Delhi', distance: '4.8 KM', deliveryBoy: 'Suresh Lal (+91 97777 66666)' },
    { id: '#PO-9842', customer: 'Rajesh Kumar', mobile: '+91 76*** *5432', product: 'Mustard Oil (5L)', qty: 1, amount: '₹840', payment: 'Online', time: '05 Aug 2026', status: 'Delivered', address: 'Block D, Sector 4, Rohini, New Delhi', distance: '6.5 KM', deliveryBoy: 'Vijay Singh (+91 96666 55555)' },
  ]

  const handleStatusChange = (orderId, newStatus) => {
    setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev)
  }

  const handleRejectSubmit = () => {
    if (selectedOrder) {
      handleStatusChange(selectedOrder.id, 'Cancelled')
      setShowRejectModal(false)
    }
  }

  const filteredOrders = ordersData.filter(order => {
    const matchesTab = activeTab === 'All' || order.status === activeTab
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-8 text-left text-[#15251F]">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-serif font-bold text-[#002F24] tracking-tight">Order Fulfilment</h2>
        <p className="text-xs text-gray-500 mt-1">Accept incoming purchases, track delivery boys, and monitor order timelines.</p>
      </div>

      {/* Tabs list navigation */}
      <div className="flex border-b border-[#D4AF37]/20 gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#D4AF37]/20">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 border-b-2 -mb-0.5 ${
              activeTab === tab 
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
        <div className="flex items-center gap-2.5 bg-white border border-[#D4AF37]/25 rounded-xl px-3 py-1.5 w-full sm:w-72 shadow-sm mb-6">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Order ID or customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs outline-none w-full text-[#15251F] placeholder-gray-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Oil Item</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Received</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order, idx) => (
                <tr key={idx} className="text-gray-650 hover:bg-[#F8F2E7]/20 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-[#D4AF37]">{order.id}</td>
                  <td className="py-3.5 font-bold text-[#002F24]">{order.customer}</td>
                  <td className="py-3.5">{order.product}</td>
                  <td className="py-3.5 text-center">{order.qty}</td>
                  <td className="py-3.5 font-bold text-[#002F24]">{order.amount}</td>
                  <td className="py-3.5">{order.payment}</td>
                  <td className="py-3.5 text-gray-400">{order.time}</td>
                  <td className="py-3.5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3.5 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 bg-[#F8F2E7]/60 border border-[#D4AF37]/20 rounded-lg text-gray-500 hover:text-[#002F24] transition-colors cursor-pointer shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Order Detailed View Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-end z-40">
          <div className="bg-white border-l border-[#D4AF37]/25 w-full max-w-lg h-full p-6 flex flex-col justify-between overflow-y-auto text-left shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#002F24]">Order Details: {selectedOrder.id}</h3>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Distance: {selectedOrder.distance}</span>
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
                <div className="space-y-1.5 text-xs">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider">Deliver To</span>
                  <p className="font-bold text-[#002F24]">{selectedOrder.customer} ({selectedOrder.mobile})</p>
                  <p className="text-gray-500 leading-relaxed">{selectedOrder.address}</p>
                </div>

                <div className="space-y-2 text-xs border-t border-gray-100 pt-4">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider font-mono">Ordered Product</span>
                  <div className="flex justify-between items-center bg-[#F8F2E7]/25 border border-[#D4AF37]/15 p-3 rounded-xl">
                    <div>
                      <h4 className="font-bold text-[#002F24]">{selectedOrder.product}</h4>
                      <span className="text-[10px] text-gray-500 font-bold">Quantity: {selectedOrder.qty}</span>
                    </div>
                    <span className="font-bold text-[#002F24]">{selectedOrder.amount}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs border-t border-gray-100 pt-4">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider mb-2">Transit Timeline</span>
                  <OrderStatusTimeline steps={[
                    { title: 'Order Received', time: selectedOrder.time },
                    { title: 'Payment Confirmed (' + selectedOrder.payment + ')', time: 'Verified' },
                    { title: 'Current Status: ' + selectedOrder.status, time: 'Pending next action' },
                  ]} />
                </div>
              </div>
            </div>

            {/* Vendor order action triggers */}
            <div className="border-t border-gray-100 pt-6 mt-6 flex gap-2">
              {selectedOrder.status === 'New' && (
                <>
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 py-3 border border-rose-500/20 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline Order
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedOrder.id, 'Accepted')}
                    className="flex-1 py-3 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#002F24]/10"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Order
                  </button>
                </>
              )}

              {selectedOrder.status === 'Accepted' && (
                <button 
                  onClick={() => handleStatusChange(selectedOrder.id, 'Preparing')}
                  className="w-full py-3 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#002F24]/10"
                >
                  Start Preparing Oils
                </button>
              )}

              {selectedOrder.status === 'Preparing' && (
                <button 
                  onClick={() => handleStatusChange(selectedOrder.id, 'Ready for Pickup')}
                  className="w-full py-3 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#16A34A]/10"
                >
                  Mark Ready for Pickup
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
