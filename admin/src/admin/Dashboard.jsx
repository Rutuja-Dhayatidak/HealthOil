import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  User, 
  ShieldAlert, 
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Calendar,
  AlertTriangle
} from 'lucide-react'

export default function Dashboard({ stats = {} }) {
  const totalSales = stats.sales || 0;
  const totalOrders = stats.orders || 0;
  const totalVendors = stats.vendors || 0;
  const totalCustomers = stats.customers || 0;
  const pendingApprovals = (stats.productApproval || 0) + (stats.vendorVerification || 0);
  const refundRequests = stats.returns || 0;

  const salesData = [
    { day: '11 May', sales: 200, orders: 40 },
    { day: '12 May', sales: 400, orders: 30 },
    { day: '13 May', sales: 600, orders: 70 },
    { day: '14 May', sales: 400, orders: 50 },
    { day: '15 May', sales: 350, orders: 45 },
    { day: '16 May', sales: 500, orders: 65 },
    { day: '17 May', sales: 700, orders: 80 },
  ]

  const recentOrders = (stats.recentOrders || []).map(order => ({
    id: order.orderId || order._id,
    date: new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    customer: order.user?.name || order.deliveryAddress?.name || 'Guest User',
    email: order.user?.email || order.deliveryAddress?.phone || 'N/A',
    product: order.items?.length > 0 ? `${order.items[0].productName} ${order.items.length > 1 ? `+${order.items.length - 1} more` : ''}` : 'Unknown Product',
    amount: `₹${order.totalAmount}`,
    status: order.status || 'Pending',
    img: '📦'
  }));

  const vendorVerification = [
    { name: 'Green Valley Oils', email: 'contact@greenvalleyoils.com', date: '17 May 2026', status: 'Pending', icon: '🍃' },
    { name: 'PureLife Naturals', email: 'info@purelifenaturals.com', date: '17 May 2026', status: 'Review', icon: '🌿' },
    { name: 'Sri Organic Oils', email: 'hello@sriorganicoils.com', date: '16 May 2026', status: 'Pending', icon: '☀️' },
    { name: 'Farm Fresh Oils', email: 'support@farmfreshoils.com', date: '16 May 2026', status: 'Review', icon: '🌱' },
    { name: 'Natura Oils & Foods', email: 'care@naturafoods.com', date: '15 May 2026', status: 'Approved', icon: '🌱' },
  ]

  const productApproval = [
    { name: 'Cold Pressed Flaxseed Oil 1L', vendor: 'Green Valley Oils', sku: 'CV-FLAX-1L', date: '17 May 2026', status: 'New', icon: '🍾' },
    { name: 'Wood Pressed Sesame Oil 1L', vendor: 'PureLife Naturals', sku: 'PL-SES-1L', date: '17 May 2026', status: 'Review', icon: '🍶' },
    { name: 'Black Seed Oil 100ml', vendor: 'Sri Organic Oils', sku: 'SO-BSO-100', date: '16 May 2026', status: 'New', icon: '🏺' },
    { name: 'Organic Sunflower Oil 1L', vendor: 'Farm Fresh Oils', sku: 'FFO-SUN-1L', date: '16 May 2026', status: 'New', icon: '🌻' },
    { name: 'Virgin Almond Oil 100ml', vendor: 'Natura Oils & Foods', sku: 'NOF-ALM-100', date: '15 May 2026', status: 'Review', icon: '🌰' },
  ]

  const alerts = [
    { type: 'info', msg: '18 new vendor verification requests', time: '10m ago' },
    { type: 'error', msg: '22 refund requests require attention', time: '25m ago' },
    { type: 'warning', msg: '24 products awaiting approval', time: '1h ago' },
    { type: 'warning', msg: 'Low stock alert for 12 products', time: '2h ago' },
  ]

  const lowStock = [
    { name: 'Mustard Oil 1L', stock: '24 units', status: 'Reorder Soon', icon: '🛢️' },
    { name: 'Olive Oil 1L', stock: '18 units', status: 'Reorder Soon', icon: '🌿' },
    { name: 'Sesame Oil 1L', stock: '15 units', status: 'Low Stock', icon: '🌱' },
    { name: 'Flaxseed Oil 1L', stock: '10 units', status: 'Critical', icon: '🍾' },
  ]

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'New Order': case 'New': return <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">New Order</span>
      case 'Packed': return <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-100">Packed</span>
      case 'Delivered': case 'Approved': return <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold border border-green-100">{status}</span>
      case 'Cancelled': return <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100">Cancelled</span>
      case 'Returned': return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">Returned</span>
      case 'Pending': return <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-100">Pending</span>
      case 'Review': return <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">Review</span>
      default: return <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">{status}</span>
    }
  }

  const StockBadge = ({ status }) => {
    switch (status) {
      case 'Critical': return <span className="text-red-500 font-bold text-[10px]">Critical</span>
      case 'Low Stock': return <span className="text-orange-500 font-bold text-[10px]">Low Stock</span>
      case 'Reorder Soon': return <span className="text-yellow-600 font-bold text-[10px]">Reorder Soon</span>
      default: return null
    }
  }

  const AlertIcon = ({ type }) => {
    switch(type) {
      case 'warning': return <div className="w-4 h-4 rounded-md bg-orange-100 text-orange-500 flex items-center justify-center font-bold text-[10px]">!</div>
      case 'error': return <div className="w-4 h-4 rounded-md bg-red-100 text-red-500 flex items-center justify-center font-bold text-[10px]">X</div>
      case 'info': return <div className="w-4 h-4 rounded-md bg-blue-100 text-blue-500 flex items-center justify-center font-bold text-[10px]">i</div>
      default: return null
    }
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* 6 Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-center sm:justify-start">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-gray-500 font-medium mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Total Sales</p>
              <h3 className="text-sm sm:text-lg font-bold text-gray-800 leading-tight truncate">₹{totalSales.toLocaleString('en-IN')}</h3>
              <p className="text-[9px] text-gray-400 mt-0.5 whitespace-nowrap"><span className="text-green-500 font-bold">▲ 0%</span> vs last 7 days</p>
            </div>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-center sm:justify-start">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-gray-500 font-medium mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Total Orders</p>
              <h3 className="text-sm sm:text-lg font-bold text-gray-800 leading-tight truncate">{totalOrders.toLocaleString('en-IN')}</h3>
              <p className="text-[9px] text-gray-400 mt-0.5 whitespace-nowrap"><span className="text-green-500 font-bold">▲ 0%</span> vs last 7 days</p>
            </div>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-center sm:justify-start">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-gray-500 font-medium mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Total Vendors</p>
              <h3 className="text-sm sm:text-lg font-bold text-gray-800 leading-tight truncate">{totalVendors.toLocaleString('en-IN')}</h3>
              <p className="text-[9px] text-gray-400 mt-0.5 whitespace-nowrap"><span className="text-green-500 font-bold">▲ 0%</span> vs last 7 days</p>
            </div>
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-center sm:justify-start">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <User className="w-5 h-5 text-orange-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-gray-500 font-medium mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Total Customers</p>
              <h3 className="text-sm sm:text-lg font-bold text-gray-800 leading-tight truncate">{totalCustomers.toLocaleString('en-IN')}</h3>
              <p className="text-[9px] text-gray-400 mt-0.5 whitespace-nowrap"><span className="text-green-500 font-bold">▲ 0%</span> vs last 7 days</p>
            </div>
          </div>
        </div>
        {/* Card 5 */}
        <div className={`bg-white rounded-xl p-4 shadow-sm border flex items-center justify-center sm:justify-start ${pendingApprovals > 0 ? 'border-yellow-200' : 'border-gray-100'}`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full text-center sm:text-left">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mx-auto sm:mx-0 ${pendingApprovals > 0 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
              <ShieldAlert className={`w-5 h-5 ${pendingApprovals > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-500 font-medium mb-0.5 leading-tight truncate">Pending Approvals</p>
              <h3 className="text-sm sm:text-lg font-bold text-gray-800 leading-tight truncate">{pendingApprovals.toLocaleString('en-IN')}</h3>
              {pendingApprovals > 0 ? (
                <p className="text-[9px] text-red-500 font-bold mt-0.5 whitespace-nowrap">Needs attention</p>
              ) : (
                <p className="text-[9px] text-gray-400 font-bold mt-0.5 whitespace-nowrap">All caught up</p>
              )}
            </div>
          </div>
        </div>
        {/* Card 6 */}
        <div className={`bg-white rounded-xl p-4 shadow-sm border flex items-center justify-center sm:justify-start ${refundRequests > 0 ? 'border-red-200' : 'border-gray-100'}`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full text-center sm:text-left">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mx-auto sm:mx-0 ${refundRequests > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <RotateCcw className={`w-5 h-5 ${refundRequests > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-500 font-medium mb-0.5 leading-tight truncate">Refund Requests</p>
              <h3 className="text-sm sm:text-lg font-bold text-gray-800 leading-tight truncate">{refundRequests.toLocaleString('en-IN')}</h3>
              {refundRequests > 0 ? (
                <p className="text-[9px] text-red-500 font-bold mt-0.5 whitespace-nowrap">Needs action</p>
              ) : (
                <p className="text-[9px] text-gray-400 font-bold mt-0.5 whitespace-nowrap">No pending requests</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Chart & Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Sales Overview */}
        <div className="xl:col-span-5 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Sales Overview</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-600 hover:bg-gray-50">
              This Week <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end mb-4 gap-4">
            <div>
              <p className="text-[10px] text-gray-400 font-medium mb-1">Total Sales</p>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-none">₹{totalSales.toLocaleString('en-IN')}</h2>
                <span className="text-xs font-bold text-green-500">▲ 18.6%</span>
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
                  <linearGradient id="colorSalesAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSalesAdmin)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="xl:col-span-7 bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <a href="#" className="text-xs font-bold text-blue-600 hover:underline">View all</a>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-medium">
                  <th className="pb-3 font-normal">Order ID</th>
                  <th className="pb-3 font-normal">Customer</th>
                  <th className="pb-3 font-normal">Product</th>
                  <th className="pb-3 font-normal">Amount</th>
                  <th className="pb-3 font-normal text-center">Status</th>
                  <th className="pb-3 font-normal text-center">Action</th>
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
                      <div className="font-bold text-gray-700">{order.customer}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5">{order.email}</div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-sm shrink-0 border border-gray-100">{order.img}</div>
                        <span className="font-bold text-gray-700 max-w-[120px] truncate leading-tight">{order.product}</span>
                      </div>
                    </td>
                    <td className="py-3 font-bold text-gray-700">{order.amount}</td>
                    <td className="py-3 text-center"><StatusBadge status={order.status} /></td>
                    <td className="py-3 text-center">
                      <button className="border border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded text-[10px] font-bold transition-colors">View Order</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
            <span className="text-[10px] text-gray-500">Showing 1-5 of 2,318 orders</span>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><ChevronLeft className="w-3 h-3" /></button>
              <button className="w-6 h-6 rounded border border-blue-600 bg-white text-blue-600 flex items-center justify-center text-[10px] font-bold">1</button>
              <button className="w-6 h-6 rounded hover:bg-gray-50 text-gray-600 flex items-center justify-center text-[10px] font-bold">2</button>
              <button className="w-6 h-6 rounded hover:bg-gray-50 text-gray-600 flex items-center justify-center text-[10px] font-bold">3</button>
              <span className="text-[10px] text-gray-400">...</span>
              <button className="w-6 h-6 rounded hover:bg-gray-50 text-gray-600 flex items-center justify-center text-[10px] font-bold">464</button>
              <button className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><ChevronRight className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Masonry-style Grid (3 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 */}
        <div className="space-y-6">
          {/* Vendor Verification Requests */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Vendor Verification Requests</h3>
              <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline">View all</a>
            </div>
            <div className="space-y-4">
              {vendorVerification.map((vendor, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-lg shrink-0">{vendor.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-800 truncate">{vendor.name}</h4>
                    <p className="text-[9px] text-gray-400 truncate mt-0.5">{vendor.email}</p>
                  </div>
                  <div className="text-[9px] text-gray-400 shrink-0">{vendor.date}</div>
                  <div className="shrink-0 w-16 text-center"><StatusBadge status={vendor.status} /></div>
                  <button className="text-[10px] font-bold text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50">
                    {vendor.status === 'Approved' ? 'View' : 'Review'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Low Stock Alerts</h3>
              <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline">View all</a>
            </div>
            <div className="flex justify-between gap-2 overflow-x-auto pb-2">
              {lowStock.map((item, idx) => (
                <div key={idx} className="text-center w-20 shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl mx-auto mb-2">{item.icon}</div>
                  <h4 className="text-[10px] font-bold text-gray-800 leading-tight h-6 flex items-center justify-center">{item.name}</h4>
                  <p className="text-[9px] text-gray-500 my-1">Stock: {item.stock}</p>
                  <StockBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {/* Product Approval Queue */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Product Approval Queue</h3>
              <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline">View all</a>
            </div>
            <div className="space-y-4">
              {productApproval.map((product, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded border border-gray-100 flex items-center justify-center text-lg shrink-0 bg-gray-50">{product.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-bold text-gray-800 truncate">{product.name}</h4>
                    <p className="text-[9px] text-gray-500 truncate mt-0.5">by {product.vendor}</p>
                    <p className="text-[8px] text-gray-400 truncate">SKU: {product.sku}</p>
                  </div>
                  <div className="text-[9px] text-gray-400 shrink-0 text-center">
                    <div>Submitted:</div>
                    <div>{product.date}</div>
                  </div>
                  <div className="shrink-0"><StatusBadge status={product.status} /></div>
                  <button className="text-[10px] font-bold text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50">Review</button>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Alerts & Notifications</h3>
              <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline">View all</a>
            </div>
            <div className="space-y-4">
              {alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <AlertIcon type={alert.type} />
                  <p className="text-[11px] text-gray-700 flex-1">{alert.msg}</p>
                  <span className="text-[9px] text-gray-400">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-6">
          {/* Payments / Settlements Overview */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Payments / Settlements Overview</h3>
              <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline">View all</a>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="border border-gray-100 rounded-lg p-4 relative bg-gray-50/50">
                <p className="text-[10px] text-gray-500 mb-1">Available Balance</p>
                <h3 className="text-xl font-bold text-gray-800">₹12,46,850.00</h3>
                <p className="text-[9px] text-gray-400 mt-1">Withdrawable Amount</p>
                <Wallet className="absolute top-4 right-4 w-5 h-5 text-green-500 opacity-80" />
              </div>
              <div className="border border-gray-100 rounded-lg p-4 relative bg-gray-50/50">
                <p className="text-[10px] text-gray-500 mb-1">Next Settlement</p>
                <p className="text-sm font-bold text-gray-800 mb-0.5">20 May 2026</p>
                <h3 className="text-xl font-bold text-gray-800 mt-1">₹8,90,560.00</h3>
                <Calendar className="absolute top-4 right-4 w-5 h-5 text-blue-500 opacity-80" />
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 mb-4">
              <h4 className="text-[10px] font-bold text-gray-500 mb-3">Commission Summary (This Month)</h4>
              <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100">
                <div>
                  <p className="text-[9px] text-gray-400 mb-1">Total Commission</p>
                  <p className="text-xs font-bold text-gray-800">₹6,78,450.00</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 mb-1">Paid Commission</p>
                  <p className="text-xs font-bold text-green-600">₹4,20,300.00</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 mb-1">Pending Commission</p>
                  <p className="text-xs font-bold text-orange-500">₹2,58,150.00</p>
                </div>
              </div>
            </div>

            <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
              Go to Settlements
            </button>
          </div>

          {/* Store Performance / Platform Metrics */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Store Performance / Platform Metrics</h3>
              <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline">View full report</a>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <p className="text-[9px] text-gray-500 mb-2 leading-tight h-6 flex items-center justify-center">Total Vendors</p>
                <h3 className="text-sm font-bold text-gray-800">1,248</h3>
                <p className="text-[8px] text-green-500 font-bold mt-1">▲ 12.4%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gray-500 mb-2 leading-tight h-6 flex items-center justify-center">Fulfillment Rate</p>
                <h3 className="text-sm font-bold text-gray-800">96.2%</h3>
                <p className="text-[8px] text-green-500 font-bold mt-1">▲ 2.6%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gray-500 mb-2 leading-tight h-6 flex items-center justify-center">Return Rate</p>
                <h3 className="text-sm font-bold text-gray-800">2.1%</h3>
                <p className="text-[8px] text-green-500 font-bold mt-1">▼ 0.6%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gray-500 mb-2 leading-tight h-6 flex items-center justify-center">Avg Response Time</p>
                <h3 className="text-sm font-bold text-gray-800">1.2 hrs</h3>
                <p className="text-[8px] text-green-500 font-bold mt-1">▼ 0.4 hrs</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
