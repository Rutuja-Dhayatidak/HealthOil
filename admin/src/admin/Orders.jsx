import { useState, useEffect } from 'react'
import { ShoppingBag, Search, Eye } from 'lucide-react'
import axios from 'axios'

function Orders() {
  const [ordersList, setOrdersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await axios.get('http://localhost:5000/api/admin/orders')
      if (res.data.success) {
        const formatted = res.data.orders.map(o => ({
          id: o.orderId || o._id,
          customer: o.user?.name || o.deliveryAddress?.name || 'Guest',
          shop: o.vendor?.business?.storeName || o.vendor?.fullName || 'HealthOil Admin',
          product: o.items.map(i => `${i.productName} (${i.qty})`).join(', '),
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
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = ordersList.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.shop.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#031d13] tracking-tight">Order Management</h2>
        <p className="text-xs text-gray-500 mt-1">Track customer orders, delivery routes, and payment statuses.</p>
      </div>

      <div className="bg-white border border-[#b89547]/20 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white border border-[#b89547]/25 rounded-xl px-3 py-1.5 w-full sm:w-72 shadow-sm">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID or customer..." 
              className="bg-transparent text-xs outline-none w-full text-[#031d13] placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-initial px-4 py-2 bg-[#FAF4E8]/35 text-[#031d13] border border-[#b89547]/25 rounded-xl text-xs font-bold hover:bg-[#031d13] hover:text-[#FAF4E8] transition-all duration-300 cursor-pointer">
              Filter Status
            </button>
            <button className="flex-1 sm:flex-initial px-4 py-2 bg-[#031d13] hover:bg-[#b89547] text-[#FAF4E8] hover:text-[#031d13] rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer">
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm font-bold text-gray-400">Loading orders...</div>
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
                  <tr key={idx} className="text-gray-600 hover:bg-[#FAF4E8]/20 transition-colors duration-150">
                    <td className="py-3.5 font-mono font-bold text-[#b89547]">{order.id}</td>
                    <td className="py-3.5 text-gray-400">{order.date}</td>
                    <td className="py-3.5 font-bold text-[#031d13]">{order.customer}</td>
                    <td className="py-3.5 text-gray-500">{order.shop}</td>
                    <td className="py-3.5">{order.product}</td>
                    <td className="py-3.5 font-bold text-[#031d13]">{order.amount}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        order.status === 'Delivered' 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : order.status === 'In Transit'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button className="p-1 text-gray-400 hover:text-[#031d13] transition-colors duration-200 cursor-pointer">
                        <Eye className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-gray-400">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
