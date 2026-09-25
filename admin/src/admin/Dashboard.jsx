import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  AlertTriangle,
  Package,
  Loader2,
  MapPin,
  Compass,
  Store,
  Building2,
  Layers,
  ArrowRight
} from 'lucide-react'
import { getPendingVendors, getAllProducts } from '../ApiServices/adminService'
import { getCityVendorDistributionApi } from '../ApiServices/cityService'

export default function Dashboard({ 
  stats = {}, 
  salesRange = 'this_week', 
  setSalesRange, 
  loadingSales = false, 
  refreshStats 
}) {
  const navigate = useNavigate()
  const totalSales = stats.sales || 0;
  const totalOrders = stats.orders || 0;
  const totalVendors = stats.vendors || 0;
  const totalCustomers = stats.customers || 0;
  const pendingApprovals = (stats.productApproval || 0) + (stats.vendorVerification || 0);
  const refundRequests = stats.returns || 0;

  // Filter & Sales Overview State
  const [salesFilterOpen, setSalesFilterOpen] = useState(false)

  const filterOptions = [
    { key: 'this_week', label: 'This Week' },
    { key: 'today', label: 'Today' },
    { key: 'this_month', label: 'This Month' },
    { key: 'this_year', label: 'This Year' },
    { key: 'all', label: 'All Time' }
  ]

  const getCurrentWeekLabel = () => {
    const now = new Date()
    const day = now.getDay()
    const diffToMon = (day === 0 ? -6 : 1 - day)
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMon)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    const monStr = monday.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    const sunStr = sunday.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    return `${monStr} - ${sunStr}`
  }

  const defaultWeekData = (() => {
    const now = new Date()
    const day = now.getDay()
    const diffToMon = (day === 0 ? -6 : 1 - day)
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMon)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return {
        day: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        sales: 0,
        orders: 0
      }
    })
  })()

  const salesData = (stats.salesOverview && stats.salesOverview.length > 0) 
    ? stats.salesOverview 
    : defaultWeekData

  // Dynamic data states
  const [pendingVendorsList, setPendingVendorsList] = useState([])
  const [pendingProductsList, setPendingProductsList] = useState([])
  const [allProductsList, setAllProductsList] = useState([])
  const [cityDistribution, setCityDistribution] = useState([])
  const [loadingVendors, setLoadingVendors] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingDistribution, setLoadingDistribution] = useState(true)

  // Fetch real city-wise vendor distribution
  useEffect(() => {
    const fetchCityDistribution = async () => {
      try {
        setLoadingDistribution(true)
        const res = await getCityVendorDistributionApi()
        if (res?.success) {
          setCityDistribution(res.distribution || [])
        }
      } catch (err) {
        console.error('Failed to fetch city distribution:', err)
      } finally {
        setLoadingDistribution(false)
      }
    }
    fetchCityDistribution()
  }, [])

  // Fetch real pending vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true)
        const res = await getPendingVendors()
        if (res.success) {
          setPendingVendorsList(res.vendors || [])
        }
      } catch (err) {
        console.error('Failed to fetch pending vendors:', err)
      } finally {
        setLoadingVendors(false)
      }
    }
    fetchVendors()
  }, [])

  // Fetch real products (pending + all for low stock)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true)
        const res = await getAllProducts()
        if (res.success) {
          const products = res.products || []
          setAllProductsList(products)
          setPendingProductsList(products.filter(p => p.status === 'PENDING_APPROVAL'))
        }
      } catch (err) {
        console.error('Failed to fetch products:', err)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  // Compute low stock products from real data
  const lowStockProducts = allProductsList
    .filter(p => p.status === 'ACTIVE')
    .flatMap(p => (p.variants || []).map(v => ({
      productName: p.basicDetails?.name || 'Unknown',
      size: v.size,
      unit: v.unit,
      currentStock: v.currentStock || 0,
      lowStockThreshold: v.lowStockThreshold || 10
    })))
    .filter(v => v.currentStock <= v.lowStockThreshold)
    .sort((a, b) => a.currentStock - b.currentStock)
    .slice(0, 4)

  // Dynamic alerts from real data
  const dynamicAlerts = []
  if (pendingVendorsList.length > 0) {
    dynamicAlerts.push({ type: 'info', msg: `${pendingVendorsList.length} vendor verification request${pendingVendorsList.length > 1 ? 's' : ''} pending` })
  }
  if (pendingProductsList.length > 0) {
    dynamicAlerts.push({ type: 'warning', msg: `${pendingProductsList.length} product${pendingProductsList.length > 1 ? 's' : ''} awaiting approval` })
  }
  if (lowStockProducts.length > 0) {
    dynamicAlerts.push({ type: 'warning', msg: `Low stock alert for ${lowStockProducts.length} product variant${lowStockProducts.length > 1 ? 's' : ''}` })
  }
  if (refundRequests > 0) {
    dynamicAlerts.push({ type: 'error', msg: `${refundRequests} refund request${refundRequests > 1 ? 's' : ''} require attention` })
  }
  if (dynamicAlerts.length === 0) {
    dynamicAlerts.push({ type: 'info', msg: 'No alerts right now. Everything looks good!' })
  }

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

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const getVendorStatusLabel = (status) => {
    switch(status) {
      case 'UNDER_REVIEW': return 'Review'
      case 'APPROVED': return 'Approved'
      case 'REJECTED': return 'Rejected'
      case 'BUSINESS_DETAILS_PENDING': return 'Incomplete'
      case 'DOCUMENTS_PENDING': return 'Docs Pending'
      case 'BANK_DETAILS_PENDING': return 'Bank Pending'
      case 'PICKUP_DETAILS_PENDING': return 'Pickup Pending'
      case 'OTP_VERIFIED': return 'OTP Verified'
      default: return 'Pending'
    }
  }

  const getVendorStatusType = (status) => {
    switch(status) {
      case 'APPROVED': return 'Approved'
      case 'REJECTED': return 'Cancelled'
      case 'UNDER_REVIEW': return 'Review'
      default: return 'Pending'
    }
  }

  const getStockStatus = (current, threshold) => {
    if (current <= 0) return 'Critical'
    if (current <= threshold * 0.5) return 'Critical'
    if (current <= threshold) return 'Low Stock'
    return 'Reorder Soon'
  }

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'New Order': case 'New': return <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">New Order</span>
      case 'Packed': return <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-100">Packed</span>
      case 'Delivered': case 'Approved': return <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold border border-green-100">{status}</span>
      case 'Cancelled': return <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100">Cancelled</span>
      case 'Returned': return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">Returned</span>
      case 'Pending': return <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-100">Pending</span>
      case 'Review': return <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">Review</span>
      case 'Incomplete': case 'Docs Pending': case 'Bank Pending': case 'Pickup Pending': case 'OTP Verified': 
        return <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-100">{status}</span>
      case 'PENDING_APPROVAL': return <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-100">Pending</span>
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

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
    </div>
  )

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
        <div className="xl:col-span-5 bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-800">Sales Overview</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                {salesRange === 'this_week' ? `Current Week (${getCurrentWeekLabel()})` : 
                 salesRange === 'today' ? 'Today (24-Hour Breakdown)' : 
                 salesRange === 'this_month' ? 'This Month Breakdown' : 
                 salesRange === 'this_year' ? 'This Year Analytics' : 'Lifetime Sales Data'}
              </p>
            </div>

            {/* Dropdown Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSalesFilterOpen(!salesFilterOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  salesRange === 'this_week' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{filterOptions.find(o => o.key === salesRange)?.label || 'This Week'}</span>
                {loadingSales ? (
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                ) : (
                  <ChevronDown className={`w-3 h-3 transition-transform ${salesFilterOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {salesFilterOpen && (
                <div className="absolute right-0 top-10 w-44 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-30 font-medium text-xs text-left animate-in fade-in slide-in-from-top-2 duration-150">
                  {filterOptions.map((opt) => {
                    const isSelected = salesRange === opt.key
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          if (setSalesRange) setSalesRange(opt.key)
                          if (refreshStats) refreshStats(opt.key)
                          setSalesFilterOpen(false)
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end mb-4 gap-4">
            <div>
              <p className="text-[10px] text-gray-400 font-medium mb-1">
                {salesRange === 'all' ? 'Lifetime Sales' : 'Total Period Sales'}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-none">
                  ₹{totalSales.toLocaleString('en-IN')}
                </h2>
                <span className="text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                  {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-green-500 block"></span> <span className="text-gray-500">Sales (₹)</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-100 block"></span> <span className="text-gray-500">Orders</span></div>
            </div>
          </div>

          <div className="h-64 w-full relative">
            {loadingSales && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-10 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-semibold text-gray-600">Updating sales overview...</span>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSalesAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value, name) => [
                    name === 'sales' ? `₹${value.toLocaleString('en-IN')}` : value,
                    name === 'sales' ? 'Sales Revenue' : 'Orders Count'
                  ]}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesAdmin)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="xl:col-span-7 bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">View all</button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-xs">No orders yet.</div>
            ) : (
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
            )}
          </div>

          {recentOrders.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
              <span className="text-[10px] text-gray-500">Showing 1-{recentOrders.length} of {totalOrders.toLocaleString('en-IN')} orders</span>
              <button onClick={() => navigate('/admin/orders')} className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">View all →</button>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Dynamic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 */}
        <div className="space-y-6">
          {/* Vendor Verification Requests — DYNAMIC */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Vendor Verification Requests</h3>
              <button onClick={() => navigate('/admin/verification')} className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">View all</button>
            </div>
            {loadingVendors ? (
              <LoadingSpinner />
            ) : pendingVendorsList.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-xs">No pending vendor requests.</div>
            ) : (
              <div className="space-y-4">
                {pendingVendorsList.slice(0, 5).map((vendor) => (
                  <div key={vendor._id} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0 uppercase">
                      {(vendor.business?.storeName || vendor.fullName || '?').substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate">{vendor.business?.storeName || vendor.fullName}</h4>
                      <p className="text-[9px] text-gray-400 truncate mt-0.5">{vendor.email}</p>
                    </div>
                    <div className="text-[9px] text-gray-400 shrink-0">{formatDate(vendor.submittedAt || vendor.createdAt)}</div>
                    <div className="shrink-0 w-16 text-center"><StatusBadge status={getVendorStatusLabel(vendor.onboardingStatus)} /></div>
                    <button 
                      onClick={() => navigate('/admin/verification')}
                      className="text-[10px] font-bold text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts — DYNAMIC */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Low Stock Alerts</h3>
              <button onClick={() => navigate('/admin/products')} className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">View all</button>
            </div>
            {loadingProducts ? (
              <LoadingSpinner />
            ) : lowStockProducts.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-xs">No low stock alerts right now.</div>
            ) : (
              <div className="flex justify-between gap-2 overflow-x-auto pb-2">
                {lowStockProducts.map((item, idx) => (
                  <div key={idx} className="text-center w-20 shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-2">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <h4 className="text-[10px] font-bold text-gray-800 leading-tight h-6 flex items-center justify-center truncate">{item.productName}</h4>
                    <p className="text-[9px] text-gray-500 my-1">{item.size} {item.unit}</p>
                    <p className="text-[9px] text-gray-500">Stock: {item.currentStock}</p>
                    <StockBadge status={getStockStatus(item.currentStock, item.lowStockThreshold)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {/* Product Approval Queue — DYNAMIC */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Product Approval Queue</h3>
              <button onClick={() => navigate('/admin/approval')} className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">View all</button>
            </div>
            {loadingProducts ? (
              <LoadingSpinner />
            ) : pendingProductsList.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-xs">No products awaiting approval.</div>
            ) : (
              <div className="space-y-4">
                {pendingProductsList.slice(0, 5).map((product) => {
                  const variant0 = product.variants?.[0]
                  return (
                    <div key={product._id} className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 bg-gray-50">
                        {(() => {
                          const img = product.images?.mainImage || product.images?.gallery?.[0] || product.bannerImage || product.image
                          let rawUrl = typeof img === 'string' ? img : (img?.url || img?.fileLocation || img?.secure_url || '')
                          if (rawUrl && !rawUrl.startsWith('http') && !rawUrl.startsWith('data:') && !rawUrl.startsWith('blob:')) {
                            const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl.replace(/\\/g, '/')}`
                            rawUrl = `http://localhost:5006${cleanPath}`
                          }
                          return rawUrl ? (
                            <img 
                              src={rawUrl} 
                              alt="" 
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.parentElement.querySelector('.dashboard-fallback-icon')?.classList.remove('hidden')
                              }}
                            />
                          ) : null
                        })()}
                        <div className="dashboard-fallback-icon hidden flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold text-gray-800 truncate">{product.basicDetails?.name}</h4>
                        <p className="text-[9px] text-gray-500 truncate mt-0.5">by {product.vendor?.business?.storeName || product.vendor?.fullName || 'Unknown'}</p>
                        {variant0?.sku && <p className="text-[8px] text-gray-400 truncate">SKU: {variant0.sku}</p>}
                      </div>
                      <div className="text-[9px] text-gray-400 shrink-0 text-center">
                        <div>Submitted:</div>
                        <div>{formatDate(product.createdAt)}</div>
                      </div>
                      <div className="shrink-0"><StatusBadge status="Pending" /></div>
                      <button 
                        onClick={() => navigate('/admin/approval')}
                        className="text-[10px] font-bold text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Alerts & Notifications — DYNAMIC */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Alerts & Notifications</h3>
            </div>
            <div className="space-y-4">
              {dynamicAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <AlertIcon type={alert.type} />
                  <p className="text-[11px] text-gray-700 flex-1">{alert.msg}</p>
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
              <button onClick={() => navigate('/admin/payments')} className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">View all</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="border border-gray-100 rounded-lg p-4 relative bg-gray-50/50">
                <p className="text-[10px] text-gray-500 mb-1">Total Sales</p>
                <h3 className="text-xl font-bold text-gray-800">₹{totalSales.toLocaleString('en-IN')}</h3>
                <p className="text-[9px] text-gray-400 mt-1">From {totalOrders} orders</p>
                <Wallet className="absolute top-4 right-4 w-5 h-5 text-green-500 opacity-80" />
              </div>
              <div className="border border-gray-100 rounded-lg p-4 relative bg-gray-50/50">
                <p className="text-[10px] text-gray-500 mb-1">Active Products</p>
                <h3 className="text-xl font-bold text-gray-800">{stats.products || 0}</h3>
                <p className="text-[9px] text-gray-400 mt-1">{pendingProductsList.length} pending approval</p>
                <Package className="absolute top-4 right-4 w-5 h-5 text-blue-500 opacity-80" />
              </div>
            </div>

            <button 
              onClick={() => navigate('/admin/payments')}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Go to Payments
            </button>
          </div>

          {/* Store Performance / Platform Metrics */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm">Platform Metrics</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-[9px] text-gray-500 mb-2 leading-tight h-6 flex items-center justify-center">Total Vendors</p>
                <h3 className="text-sm font-bold text-gray-800">{totalVendors.toLocaleString('en-IN')}</h3>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gray-500 mb-2 leading-tight h-6 flex items-center justify-center">Total Products</p>
                <h3 className="text-sm font-bold text-gray-800">{(stats.products || 0).toLocaleString('en-IN')}</h3>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-gray-500 mb-2 leading-tight h-6 flex items-center justify-center">Total Customers</p>
                <h3 className="text-sm font-bold text-gray-800">{totalCustomers.toLocaleString('en-IN')}</h3>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* City-wise & Area-wise Vendor Distribution (Bottom Section) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>City-wise Vendor Distribution</span>
                <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  Live Footprint
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Geographic vendor concentration across serviceable Main Cities and Sub-Cities / Localities.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/cities')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-blue-600 text-xs font-bold rounded-xl transition-all border border-gray-200 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Manage Cities & Areas</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* City Cards Grid */}
        {loadingDistribution ? (
          <div className="py-12 text-center">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-gray-400 mt-2 font-medium">Loading city distribution...</p>
          </div>
        ) : cityDistribution.length === 0 ? (
          <div className="py-10 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-700">No cities configured yet</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Add serviceable cities in City Management to track vendor concentration.
            </p>
            <button
              onClick={() => navigate('/admin/cities')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
            >
              + Add Cities
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cityDistribution.map((city) => {
              const areaCount = city.areas?.length || 0
              const mappedVendorCount = (city.areas || []).reduce((sum, a) => sum + (a.vendorCount || 0), 0)

              return (
                <div
                  key={city._id}
                  className="bg-gray-50/50 border border-gray-200/80 hover:border-blue-300 rounded-2xl p-5 transition-all shadow-2xs space-y-4"
                >
                  {/* City Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                        {city.image ? (
                          <img
                            src={city.image}
                            alt={city.cityName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-gray-900 leading-tight">
                            {city.cityName}
                          </h4>
                          {city.state && (
                            <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                              {city.state}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {areaCount} Sub-Areas Configured
                        </p>
                      </div>
                    </div>

                    {/* Total Vendors in City */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-xs">
                        <Store className="w-3.5 h-3.5" />
                        <span>{city.totalVendors} Vendors</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">
                        {city.percentage}% of platform
                      </p>
                    </div>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(city.percentage, 5))}%` }}
                      />
                    </div>
                  </div>

                  {/* Sub-Cities / Areas Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-gray-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-blue-600" />
                        Sub-City / Area Breakdown ({areaCount})
                      </span>
                      <button
                        onClick={() => navigate('/admin/cities')}
                        className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Edit Localities
                      </button>
                    </div>

                    {areaCount === 0 ? (
                      <p className="text-xs text-gray-400 italic bg-white p-3 rounded-xl border border-gray-200">
                        No specific sub-cities added for {city.cityName}. Click "Manage Cities & Areas" to add localities.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {city.areas.map((area) => (
                          <div
                            key={area._id}
                            className="bg-white border border-gray-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs hover:border-blue-200 transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${area.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <h5 className="text-xs font-bold text-gray-800 truncate">
                                  {area.name}
                                </h5>
                              </div>
                              {area.pincode && (
                                <p className="text-[10px] font-mono text-gray-400 mt-0.5 pl-3">
                                  PIN: {area.pincode}
                                </p>
                              )}
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold shrink-0 ${
                                area.vendorCount > 0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-400 border border-gray-200'
                              }`}
                            >
                              {area.vendorCount} {area.vendorCount === 1 ? 'Vendor' : 'Vendors'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Unassigned / Direct city vendors note if any */}
                    {city.unspecifiedAreaVendors > 0 && (
                      <div className="mt-2 text-[10px] text-gray-500 bg-white/80 border border-gray-200 rounded-lg px-3 py-1.5 flex items-center justify-between">
                        <span>📍 Registered in {city.cityName} (Direct / other sectors):</span>
                        <span className="font-bold text-gray-700">{city.unspecifiedAreaVendors} Vendors</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

