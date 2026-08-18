import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  Package, 
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Wallet,
  Calendar,
  MoreVertical,
  Info
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()

  // Mock chart data
  const salesData = [
    { day: '11 May', sales: 5000, orders: 40 },
    { day: '12 May', sales: 4000, orders: 30 },
    { day: '13 May', sales: 9000, orders: 70 },
    { day: '14 May', sales: 7000, orders: 50 },
    { day: '15 May', sales: 6000, orders: 45 },
    { day: '16 May', sales: 9000, orders: 65 },
    { day: '17 May', sales: 13000, orders: 80 },
  ]

  const recentOrders = [
    { id: '#HLO12345', date: '17 May 2026, 10:30 AM', product: 'Cold Pressed Coconut Oil 1L', amount: '₹1,198.00', status: 'New Order', img: '🥥' },
    { id: '#HLO12344', date: '17 May 2026, 09:15 AM', product: 'Mustard Oil 1L', amount: '₹798.00', status: 'Packed', img: '🛢️' },
    { id: '#HLO12343', date: '16 May 2026, 08:45 PM', product: 'Olive Oil 1L', amount: '₹1,497.00', status: 'Delivered', img: '🌿' },
  ]

  const topSelling = [
    { name: 'Cold Pressed Coconut Oil 1L', price: '₹399.00', sold: 342, stock: 156, img: '🥥' },
    { name: 'Mustard Oil 1L', price: '₹249.00', sold: 298, stock: 112, img: '🛢️' },
    { name: 'Olive Oil 1L', price: '₹599.00', sold: 186, stock: 78, img: '🌿' },
  ]

  const alerts = [
    { type: 'warning', msg: 'Low stock warning: Mustard Oil 1L is running low.', time: '10m ago' },
    { type: 'error', msg: 'Return request received for Order #HLO12340.', time: '25m ago' },
    { type: 'info', msg: 'Settlement of ₹8,900 has been processed.', time: '1h ago' },
    { type: 'success', msg: 'Product "Olive Oil 1L" has been approved.', time: '2h ago' },
  ]

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'New Order': return <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold">New Order</span>
      case 'Packed': return <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md text-[10px] font-bold">Packed</span>
      case 'Delivered': return <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-md text-[10px] font-bold">Delivered</span>
      default: return <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-bold">{status}</span>
    }
  }

  const AlertIcon = ({ type }) => {
    switch(type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'error': return <div className="w-4 h-4 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center text-[10px] font-bold">E</div>
      case 'info': return <Info className="w-4 h-4 text-blue-500" />
      case 'success': return <div className="w-4 h-4 rounded-full border-2 border-green-500 text-green-500 flex items-center justify-center text-[10px] font-bold">✓</div>
      default: return null
    }
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* 5 Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Total Sales</p>
              <h3 className="text-xl font-bold text-gray-800">₹48,560</h3>
              <p className="text-[10px] text-gray-400 mt-1"><span className="text-green-500 font-bold">▲ 18.85%</span> vs last 7 days</p>
            </div>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Total Orders</p>
              <h3 className="text-xl font-bold text-gray-800">118</h3>
              <p className="text-[10px] text-gray-400 mt-1"><span className="text-green-500 font-bold">▲ 16.21%</span> vs last 7 days</p>
            </div>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Pending Orders</p>
              <h3 className="text-xl font-bold text-gray-800">12</h3>
            </div>
          </div>
          <a href="#" className="text-[10px] font-bold text-blue-600 mt-2 hover:underline">View all orders &gt;</a>
        </div>
        {/* Card 4 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Low Stock</p>
              <h3 className="text-xl font-bold text-gray-800">8</h3>
            </div>
          </div>
          <a href="#" className="text-[10px] font-bold text-orange-600 mt-2 hover:underline">View products &gt;</a>
        </div>
        {/* Card 5 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Returns</p>
              <h3 className="text-xl font-bold text-gray-800">2</h3>
            </div>
          </div>
          <a href="#" className="text-[10px] font-bold text-blue-600 mt-2 hover:underline">View returns &gt;</a>
        </div>
      </div>

      {/* Row 2: Chart & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Sales Overview</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50">
              This Week <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Total Sales</p>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800">₹48,560</h2>
                <span className="text-xs font-bold text-green-500">▲ 18.85%</span>
                <span className="text-[10px] text-gray-400">vs last 7 days</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-green-500 block"></span> <span className="text-gray-500">Sales (₹)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-100 block"></span> <span className="text-gray-500">Orders</span></div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} tickFormatter={(val) => val >= 1000 ? `${val/1000}K` : val} />
                <Tooltip />
                {/* Simulated bar chart behind line chart using area */}
                <Area type="step" dataKey="sales" fill="none" stroke="none" />
                {/* The actual line chart */}
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <button 
              onClick={() => navigate('/vendor/products/add')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Product
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-medium">
                  <th className="pb-3 font-normal">Order ID</th>
                  <th className="pb-3 font-normal">Product</th>
                  <th className="pb-3 font-normal">Amount</th>
                  <th className="pb-3 font-normal">Status</th>
                  <th className="pb-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-gray-50">
                {recentOrders.map((order, idx) => (
                  <tr key={idx}>
                    <td className="py-3">
                      <div className="font-bold text-gray-700">{order.id}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5">{order.date}</div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-sm">{order.img}</div>
                        <span className="font-bold text-gray-700 max-w-[120px] truncate">{order.product}</span>
                      </div>
                    </td>
                    <td className="py-3 font-bold text-gray-700">{order.amount}</td>
                    <td className="py-3"><StatusBadge status={order.status} /></td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {order.status === 'New Order' ? (
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-[10px] font-bold">Accept Order</button>
                        ) : (
                          <button className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded text-[10px] font-bold">View Order</button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
            <span className="text-[10px] text-gray-500">Showing 1-3 of 3 orders</span>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><ChevronLeft className="w-3 h-3" /></button>
              <button className="w-6 h-6 rounded border border-blue-600 bg-white text-blue-600 flex items-center justify-center text-[10px] font-bold">1</button>
              <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><ChevronRight className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: 4 Equal Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Top Selling */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Top Selling Products</h3>
            <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline">View all</a>
          </div>
          <div className="space-y-4 flex-1">
            {topSelling.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-10 h-10 rounded bg-gray-50 flex items-center justify-center text-lg shrink-0 border border-gray-100">{item.img}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 truncate">{item.name}</h4>
                  <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                    <span className="font-bold text-green-600">{item.price}</span>
                    <span>Sold: {item.sold}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Stock: {item.stock} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Alerts & Notifications</h3>
            <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline">View all</a>
          </div>
          <div className="space-y-4 flex-1">
            {alerts.map((alert, idx) => (
              <div key={idx} className="flex gap-3 items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="mt-0.5"><AlertIcon type={alert.type} /></div>
                <div className="flex-1">
                  <p className="text-[11px] text-gray-700 leading-tight">{alert.msg}</p>
                </div>
                <span className="text-[9px] text-gray-400 whitespace-nowrap">{alert.time}</span>
              </div>
            ))}
          </div>
          <a href="#" className="text-[10px] font-bold text-blue-600 mt-4 text-center hover:underline block">View all notifications &gt;</a>
        </div>

        {/* Payments Overview */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Payments Overview</h3>
            <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline">View all</a>
          </div>
          <div className="flex gap-3 mb-4 flex-1">
            <div className="flex-1 border border-gray-100 rounded-lg p-3 relative">
              <p className="text-[10px] text-gray-500 mb-1">Available Balance</p>
              <h3 className="text-lg font-bold text-gray-800">₹12,460.00</h3>
              <Wallet className="absolute bottom-3 right-3 w-5 h-5 text-blue-300" />
            </div>
            <div className="flex-1 bg-orange-50 rounded-lg p-3 relative">
              <p className="text-[10px] text-orange-800/60 mb-1">Next Settlement</p>
              <p className="text-xs font-bold text-gray-800 mb-0.5">20 May 2026</p>
              <h3 className="text-lg font-bold text-gray-800">₹8,900.00</h3>
              <Calendar className="absolute bottom-3 right-3 w-5 h-5 text-orange-300" />
            </div>
          </div>
          <button className="w-full py-2.5 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
            Go to Payments
          </button>
        </div>

        {/* Store Performance */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Store Performance</h3>
            <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline">View full report</a>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 flex-1">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 mb-1">Rating</p>
              <h3 className="text-xl font-bold text-gray-800">4.6</h3>
              <div className="text-yellow-400 text-[10px]">★★★★★</div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 mb-1">On-time Delivery</p>
              <h3 className="text-xl font-bold text-gray-800">96%</h3>
              <p className="text-[9px] text-green-500 font-bold">▲ 2.5%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 mb-1">Cancellation Rate</p>
              <h3 className="text-xl font-bold text-gray-800">2.1%</h3>
              <p className="text-[9px] text-green-500 font-bold">▼ 0.8%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-gray-500 mb-1">Response Time</p>
              <h3 className="text-xl font-bold text-gray-800">1.2 hrs</h3>
              <p className="text-[9px] text-green-500 font-bold">▼ 0.4 hrs</p>
            </div>
          </div>
          <p className="text-[8px] text-center text-gray-400 mt-2">Performance metrics vs last 7 days</p>
        </div>

      </div>

      {/* Footer Banner */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
            <span className="text-green-500 text-xl">🍃</span>
          </div>
          <p className="text-xs text-gray-700 font-medium">Keep your catalogue updated and maintain high performance to grow your business on Helthoil.</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Learn more &gt;</a>
          <div className="text-3xl rotate-45">🌿</div>
        </div>
      </div>

    </div>
  )
}
