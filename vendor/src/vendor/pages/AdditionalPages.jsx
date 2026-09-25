import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  Tag, 
  Plus, 
  CreditCard, 
  Download, 
  RefreshCcw, 
  Eye, 
  EyeOff,
  CheckCircle, 
  XCircle, 
  Star, 
  BarChart2, 
  Bell, 
  Users, 
  HelpCircle, 
  Settings as SettingsIcon, 
  Lock, 
  Save, 
  Trash2,
  Paperclip,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Package,
  ShoppingBag,
  Info,
  X,
  Send,
  Headphones,
  Loader2,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from 'lucide-react'
import { StatusBadge, SettlementSummary, PermissionGuard } from '../components/VendorComponents'
import { getVendorOrders, getVendorAnalyticsReports } from '../../ApiServices/vendorAuthService'
import OffersPage from './OffersPage'

// ==========================================
// 1. OFFERS & COUPONS PAGE (Delegated to dedicated OffersPage)
// ==========================================
export function Offers() {
  return <OffersPage />
}

// ==========================================
// 2. PAYMENTS & SETTLEMENTS PAGE
// ==========================================
export function Settlements() {
  const settlements = [
    { id: '#SET-4821', period: '01 Aug - 05 Aug 2026', orders: 12, gross: '₹14,800', commission: '₹1,184', net: '₹13,616', status: 'Paid', date: '05 Aug 2026' },
    { id: '#SET-4820', period: '25 Jul - 31 Jul 2026', orders: 25, gross: '₹28,500', commission: '₹2,280', net: '₹26,220', status: 'Paid', date: '31 Jul 2026' },
  ]

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#002F24]">Payments & Settlements</h2>
        <p className="text-xs text-gray-500 mt-1">Review payouts, commission rates, and gross marketplace earnings.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Gross Sales</span>
          <span className="text-2xl font-bold text-[#002F24] block mt-2">₹43,300</span>
        </div>
        <div className="bg-white border border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Platform Commission (8%)</span>
          <span className="text-2xl font-bold text-rose-600 block mt-2">- ₹3,464</span>
        </div>
        <div className="bg-white border border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Net Payouts Paid</span>
          <span className="text-2xl font-bold text-emerald-600 block mt-2">₹39,836</span>
        </div>
      </div>

      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif font-bold text-sm text-[#002F24] mb-5">Settlement History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold">
                <th className="pb-3">Settlement ID</th>
                <th className="pb-3">Period</th>
                <th className="pb-3 text-center">Orders</th>
                <th className="pb-3">Gross Amount</th>
                <th className="pb-3">Platform Comm</th>
                <th className="pb-3 font-bold">Net Payout</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {settlements.map((set, idx) => (
                <tr key={idx} className="text-gray-655 hover:bg-[#F8F2E7]/15">
                  <td className="py-3.5 font-mono font-bold text-[#D4AF37]">{set.id}</td>
                  <td className="py-3.5 text-gray-500">{set.period}</td>
                  <td className="py-3.5 text-center">{set.orders}</td>
                  <td className="py-3.5 font-bold text-[#002F24]">{set.gross}</td>
                  <td className="py-3.5 text-rose-500">{set.commission}</td>
                  <td className="py-3.5 font-bold text-emerald-600">{set.net}</td>
                  <td className="py-3.5">
                    <StatusBadge status={set.status} />
                  </td>
                  <td className="py-3.5 text-right">
                    <button className="p-1 text-gray-400 hover:text-[#002F24] cursor-pointer">
                      <Download className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. RETURNS & REFUNDS PAGE
// ==========================================
export function Returns() {
  const navigate = useNavigate()
  const [returnsList, setReturnsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const res = await getVendorOrders({ status: 'Returned' })
      if (res?.success && Array.isArray(res.orders)) {
        const formatted = res.orders.map((o, idx) => ({
          id: `#RET-${String(o.orderId || o._id).slice(-4)}`,
          orderId: o.orderId || `#ORD-${String(o._id).slice(-6)}`,
          product: o.items?.map(i => `${i.productName} (${i.qty})`).join(', ') || 'Cold Pressed Oil',
          reason: o.rejectionReason || o.notes || 'Customer Return Request',
          amount: `₹${o.totalAmount || 0}`,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A',
          status: o.status || 'Returned'
        }))
        setReturnsList(formatted)
      } else {
        setReturnsList([])
      }
    } catch (err) {
      console.error('Failed to fetch returns', err)
      setReturnsList([])
    } finally {
      setLoading(false)
    }
  }

  const filteredReturns = returnsList.filter(r => 
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#002F24] text-[#D4AF37] flex items-center justify-center shadow-sm">
            <RefreshCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#002F24]">Returns & Refunds</h2>
            <p className="text-xs text-gray-500 mt-0.5">Monitor returns logistics, reverse pickups, and refund audit statuses.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button 
            onClick={fetchReturns}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#D4AF37]/30 text-[#002F24] rounded-xl text-xs font-bold hover:bg-[#F8F2E7]/40 transition-colors cursor-pointer"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5 bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 focus-within:border-[#002F24]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Return ID, Order ID, or Product Name..."
            className="bg-transparent text-xs outline-none w-full text-gray-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table / Loading / Empty state */}
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#002F24]" />
            <span className="font-semibold">Loading returns and refund records...</span>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <div className="w-14 h-14 bg-[#F8F2E7] text-[#D4AF37] rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/30 shadow-inner">
              <RefreshCcw className="w-6 h-6 text-[#002F24]" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-[#002F24]">No Returns or Refunds Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                {searchQuery 
                  ? `No returns matching "${searchQuery}".` 
                  : "All your shipments are smoothly fulfilled with 0 active return disputes."}
              </p>
            </div>
            <button
              onClick={() => navigate('/vendor/orders')}
              className="px-4 py-2 bg-[#002F24] text-white rounded-xl text-xs font-bold hover:bg-[#014D3A] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              View Orders
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold">
                  <th className="pb-3">Return ID</th>
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Reason Description</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Refund Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReturns.map((ret, idx) => (
                  <tr key={idx} className="text-gray-600 hover:bg-[#F8F2E7]/15 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-[#D4AF37]">{ret.id}</td>
                    <td className="py-3.5 font-mono text-gray-500">{ret.orderId}</td>
                    <td className="py-3.5 font-bold text-[#002F24]">{ret.product}</td>
                    <td className="py-3.5 text-gray-500">{ret.reason}</td>
                    <td className="py-3.5 text-gray-400 text-[11px]">{ret.date}</td>
                    <td className="py-3.5 font-bold text-rose-600">{ret.amount}</td>
                    <td className="py-3.5 text-right">
                      <StatusBadge status={ret.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ==========================================
// 4. REVIEWS PAGE
// ==========================================
export function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const vendorDataStr = localStorage.getItem('vendorData')
      if (!vendorDataStr) return;
      const vendorData = JSON.parse(vendorDataStr)
      const vendorId = vendorData.id || vendorData._id
      
      const res = await fetch(`http://localhost:5006/api/reviews/vendor/${vendorId}`)
      const data = await res.json()
      if (data.success) {
        setReviews(data.reviews)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = async (reviewId, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5006/api/reviews/${reviewId}/feature`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFeatured: !currentStatus })
      })
      const data = await res.json()
      if (data.success) {
        fetchReviews()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#002F24]">Customer Reviews</h2>
        <p className="text-xs text-gray-500 mt-1">Review feedback, store ratings, and toggle which reviews appear on your shop page.</p>
      </div>

      {loading ? (
        <div className="text-center text-sm text-gray-500 py-10">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-10">No reviews yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div key={rev._id} className="bg-white border border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-[#002F24] text-xs">{rev.user?.name || 'Customer'}</span>
                  <span className="text-[#D4AF37] font-bold text-xs">{rev.rating} ★</span>
                </div>
                <span className="text-[9px] text-gray-400 font-bold block mt-1">Product: {rev.productName}</span>
                <p className="text-xs text-gray-605 leading-relaxed mt-3">"{rev.comment}"</p>
              </div>
              
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-bold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                <button 
                  onClick={() => toggleFeature(rev._id, rev.isFeatured)}
                  className={`font-bold text-[10px] px-3 py-1.5 rounded-xl cursor-pointer border ${rev.isFeatured ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                  {rev.isFeatured ? '★ Featured on Shop' : 'Feature on Shop'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 5. REPORTS & ANALYTICS PAGE
// ==========================================
export function Reports() {
  const navigate = useNavigate()
  const [data, setData] = useState({
    summary: {
      totalGrossRevenue: 0,
      platformCommission: 0,
      totalTaxes: 0,
      totalNetPayout: 0,
      totalOrdersCount: 0,
      deliveredOrdersCount: 0,
      cancellationCount: 0,
      cancellationRate: '0.0',
      totalRefundedAmount: 0,
      totalRestocksCount: 0
    },
    revenueLedger: [],
    restockHistory: [],
    cancellationReport: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('REVENUE') // 'REVENUE' | 'RESTOCK' | 'CANCELLATIONS'
  const [searchQuery, setSearchQuery] = useState('')
  const [showStatementModal, setShowStatementModal] = useState(false)
  const [selectedStatementType, setSelectedStatementType] = useState('ALL') // 'ALL' | 'REVENUE' | 'RESTOCK' | 'CANCELLATIONS'

  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getVendorAnalyticsReports()
      if (res.success && res.data) {
        setData(res.data)
      } else {
        throw new Error(res.message || 'Failed to load reports')
      }
    } catch (err) {
      console.error('Fetch reports error:', err)
      setError(err.message || 'Could not connect to analytics service.')
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  // Filtered data based on search
  const filteredRevenue = (data.revenueLedger || []).filter(item => 
    item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.itemsSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRestock = (data.restockHistory || []).filter(item => 
    item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.actor?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCancellations = (data.cancellationReport || []).filter(item => 
    item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Export to CSV / Excel
  const exportToCSV = (reportType = activeTab) => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,"
      let filename = `HealthOil_Vendor_${reportType}_Statement_${new Date().toISOString().slice(0, 10)}.csv`

      if (reportType === 'REVENUE' || reportType === 'ALL') {
        csvContent += "--- GROSS REVENUE & PAYOUT LEDGER ---\r\n"
        csvContent += "Ledger ID,Order ID,Date,Period,Items,Gross Revenue (INR),Platform Commission (8%),GST Tax (5%),Net Payout (INR),Payment Method,Status\r\n"
        data.revenueLedger.forEach(row => {
          csvContent += `"${row.id}","${row.orderId}","${row.date}","${row.period}","${row.itemsSummary.replace(/"/g, '""')}",${row.grossAmount},${row.commission},${row.tax},${row.netPayout},"${row.paymentMethod}","${row.status}"\r\n`
        })
        csvContent += "\r\n"
      }

      if (reportType === 'RESTOCK' || reportType === 'ALL') {
        csvContent += "--- INVENTORY RESTOCK & DAMAGES HISTORY ---\r\n"
        csvContent += "Movement ID,Product Name,Movement Type,Delta Qty,Balance Before,Balance After,Reason / Notes,Date,Time,Recorded By\r\n"
        data.restockHistory.forEach(row => {
          csvContent += `"${row.id}","${row.productName.replace(/"/g, '""')}","${row.type}","${row.delta}",${row.balanceBefore},${row.balanceAfter},"${row.reason.replace(/"/g, '""')}","${row.date}","${row.time}","${row.actor}"\r\n`
        })
        csvContent += "\r\n"
      }

      if (reportType === 'CANCELLATIONS' || reportType === 'ALL') {
        csvContent += "--- CANCELLATION & REFUNDS REPORT ---\r\n"
        csvContent += "Cancellation ID,Order ID,Customer Name,Customer Phone,Product Items,Amount (INR),Cancellation Reason,Status,Refund Status,Date\r\n"
        data.cancellationReport.forEach(row => {
          csvContent += `"${row.id}","${row.orderId}","${row.customerName}","${row.customerPhone}","${row.product.replace(/"/g, '""')}",${row.amount},"${row.reason.replace(/"/g, '""')}","${row.status}","${row.refundStatus}","${row.date}"\r\n`
        })
      }

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`${reportType} statement exported successfully!`)
      setShowStatementModal(false)
    } catch (err) {
      console.error('CSV export failed:', err)
      toast.error('Failed to export statement')
    }
  }

  // Print Statement (Browser Print / PDF)
  const triggerPrintStatement = () => {
    setShowStatementModal(false)
    window.print()
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#002F24] text-[#D4AF37] rounded-xl shadow-sm inline-flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-serif font-bold text-[#002F24]">Vendor Analytics & Reports</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time audit statements of gross sales revenue, payouts, taxes, restock logs, and cancellation analysis.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchReports}
            disabled={loading}
            className="px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={() => setShowStatementModal(true)}
            className="px-4 py-2.5 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
            Generate Statement
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white border border-[#D4AF37]/20 p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Gross Sales</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-serif font-bold text-[#002F24] mt-2">
            ₹{(data.summary?.totalGrossRevenue || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">{data.summary?.deliveredOrdersCount || 0}</span> delivered of {data.summary?.totalOrdersCount || 0} orders
          </p>
        </div>

        {/* Net Payout */}
        <div className="bg-white border border-[#D4AF37]/20 p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Net Vendor Payout</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-serif font-bold text-emerald-600 mt-2">
            ₹{(data.summary?.totalNetPayout || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            Directly credited to linked account
          </p>
        </div>

        {/* Platform Commission & GST */}
        <div className="bg-white border border-[#D4AF37]/20 p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Commissions & Tax</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-serif font-bold text-[#002F24] mt-2">
            ₹{((data.summary?.platformCommission || 0) + (data.summary?.totalTaxes || 0)).toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            8% Comm (₹{(data.summary?.platformCommission || 0).toLocaleString()}) + 5% GST
          </p>
        </div>

        {/* Restock History */}
        <div className="bg-white border border-[#D4AF37]/20 p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Restock Logs</span>
            <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-serif font-bold text-[#002F24] mt-2">
            {data.summary?.totalRestocksCount || 0}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            Stock movements & arrivals
          </p>
        </div>

        {/* Cancellations & Refunds */}
        <div className="bg-white border border-[#D4AF37]/20 p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cancellations</span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-serif font-bold text-rose-600 mt-2">
            {data.summary?.cancellationCount || 0} <span className="text-xs text-gray-400 font-normal">({data.summary?.cancellationRate || '0.0'}%)</span>
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            Refunds: ₹{(data.summary?.totalRefundedAmount || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Reports Hub */}
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Navigation Tabs & Search Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => { setActiveTab('REVENUE'); setSearchQuery('') }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'REVENUE'
                  ? 'bg-[#002F24] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-[#D4AF37]" />
              Gross Revenue Ledger
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'REVENUE' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {data.revenueLedger?.length || 0}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('RESTOCK'); setSearchQuery('') }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'RESTOCK'
                  ? 'bg-[#002F24] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
              Inventory Restock History
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'RESTOCK' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {data.restockHistory?.length || 0}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('CANCELLATIONS'); setSearchQuery('') }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'CANCELLATIONS'
                  ? 'bg-[#002F24] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <RefreshCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
              Cancellation & Refunds Report
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'CANCELLATIONS' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {data.cancellationReport?.length || 0}
              </span>
            </button>
          </div>

          {/* Search bar & quick export */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'REVENUE' ? "Search order, ledger ID..." :
                  activeTab === 'RESTOCK' ? "Search product, batch, note..." :
                  "Search cancellation, customer..."
                }
                className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#002F24] transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => exportToCSV(activeTab)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              title="Export visible tab to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#002F24] mx-auto" />
            <p className="text-xs font-medium text-gray-500">Compiling real-time vendor analytics & tax ledger...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="py-14 text-center space-y-3 bg-rose-50 border border-rose-200 rounded-xl p-6">
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-rose-800">Analytics Error</h3>
              <p className="text-xs text-rose-600 mt-1 max-w-md mx-auto">{error}</p>
            </div>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </div>
        ) : (
          /* Active Tab Content */
          <div>
            {/* TAB 1: GROSS REVENUE LEDGER */}
            {activeTab === 'REVENUE' && (
              filteredRevenue.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 bg-[#F8F2E7] text-[#D4AF37] rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/30 shadow-inner">
                    <DollarSign className="w-6 h-6 text-[#002F24]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-serif text-[#002F24]">No Revenue Ledger Entries Found</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                      {searchQuery ? `No ledger records matching "${searchQuery}".` : "Delivered and paid orders will automatically generate gross revenue statements here."}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/vendor/orders')}
                    className="px-4 py-2 bg-[#002F24] text-white rounded-xl text-xs font-bold hover:bg-[#014D3A] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    View Orders
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold bg-[#F8F2E7]/20">
                        <th className="py-3 px-3">Ledger ID</th>
                        <th className="py-3 px-3">Order Ref</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Items Summary</th>
                        <th className="py-3 px-3 text-right">Gross Amount</th>
                        <th className="py-3 px-3 text-right">Commission (8%)</th>
                        <th className="py-3 px-3 text-right">GST (5%)</th>
                        <th className="py-3 px-3 text-right font-bold text-[#002F24]">Net Payout</th>
                        <th className="py-3 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRevenue.map((row, idx) => (
                        <tr key={idx} className="text-gray-600 hover:bg-[#F8F2E7]/20 transition-colors">
                          <td className="py-3.5 px-3 font-mono font-bold text-[#D4AF37]">{row.id}</td>
                          <td className="py-3.5 px-3 font-mono text-gray-600">{row.orderId}</td>
                          <td className="py-3.5 px-3 text-gray-500 text-[11px] whitespace-nowrap">{row.date}</td>
                          <td className="py-3.5 px-3 font-medium text-[#002F24] max-w-xs truncate" title={row.itemsSummary}>
                            {row.itemsSummary}
                          </td>
                          <td className="py-3.5 px-3 text-right font-medium">₹{row.grossAmount.toLocaleString()}</td>
                          <td className="py-3.5 px-3 text-right text-rose-500">-₹{row.commission.toLocaleString()}</td>
                          <td className="py-3.5 px-3 text-right text-amber-600">-₹{row.tax.toLocaleString()}</td>
                          <td className="py-3.5 px-3 text-right font-bold text-emerald-600">₹{row.netPayout.toLocaleString()}</td>
                          <td className="py-3.5 px-3 text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === 'Settled'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-[#D4AF37]/30 bg-[#F8F2E7]/30 font-bold text-xs">
                      <tr>
                        <td colSpan="4" className="py-3 px-3 text-[#002F24]">Filtered Total ({filteredRevenue.length} orders)</td>
                        <td className="py-3 px-3 text-right text-[#002F24]">
                          ₹{filteredRevenue.reduce((acc, r) => acc + r.grossAmount, 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right text-rose-600">
                          -₹{filteredRevenue.reduce((acc, r) => acc + r.commission, 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right text-amber-600">
                          -₹{filteredRevenue.reduce((acc, r) => acc + r.tax, 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-700 font-extrabold">
                          ₹{filteredRevenue.reduce((acc, r) => acc + r.netPayout, 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )
            )}

            {/* TAB 2: INVENTORY RESTOCK & DAMAGES HISTORY */}
            {activeTab === 'RESTOCK' && (
              filteredRestock.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 bg-[#F8F2E7] text-[#D4AF37] rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/30 shadow-inner">
                    <Package className="w-6 h-6 text-[#002F24]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-serif text-[#002F24]">No Restock Logs Found</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                      {searchQuery ? `No movement entries matching "${searchQuery}".` : "Stock adjustments, warehouse arrivals, and dispatch entries will be listed here."}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/vendor/inventory')}
                    className="px-4 py-2 bg-[#002F24] text-white rounded-xl text-xs font-bold hover:bg-[#014D3A] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Manage Inventory
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold bg-[#F8F2E7]/20">
                        <th className="py-3 px-3">Log ID</th>
                        <th className="py-3 px-3">Product Name</th>
                        <th className="py-3 px-3">Movement Type</th>
                        <th className="py-3 px-3 text-center">Change (Delta)</th>
                        <th className="py-3 px-3 text-center">Before → After</th>
                        <th className="py-3 px-3">Batch Note / Reason</th>
                        <th className="py-3 px-3">Date & Time</th>
                        <th className="py-3 px-3 text-right">Logged By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRestock.map((row, idx) => (
                        <tr key={idx} className="text-gray-600 hover:bg-[#F8F2E7]/20 transition-colors">
                          <td className="py-3.5 px-3 font-mono font-bold text-[#D4AF37]">{row.id}</td>
                          <td className="py-3.5 px-3 font-bold text-[#002F24]">{row.productName}</td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.type.includes('Inward') || row.type.includes('Restock')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : row.type.includes('Damage') || row.type.includes('Spoilage')
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {row.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-bold">
                            <span className={String(row.delta).startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}>
                              {row.delta}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono text-gray-500">
                            {row.balanceBefore} → <span className="font-bold text-[#002F24]">{row.balanceAfter}</span>
                          </td>
                          <td className="py-3.5 px-3 text-gray-600 max-w-xs">{row.reason}</td>
                          <td className="py-3.5 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                            {row.date} <span className="text-[10px] text-gray-400">({row.time})</span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-medium text-gray-600">{row.actor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* TAB 3: CANCELLATION & REFUNDS REPORT */}
            {activeTab === 'CANCELLATIONS' && (
              filteredCancellations.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 bg-[#F8F2E7] text-[#D4AF37] rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/30 shadow-inner">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-serif text-[#002F24]">Zero Cancellation Issues</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                      {searchQuery ? `No cancellations matching "${searchQuery}".` : "All customer orders are fulfilling smoothly with 0 cancellations."}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/vendor/orders')}
                    className="px-4 py-2 bg-[#002F24] text-white rounded-xl text-xs font-bold hover:bg-[#014D3A] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    View All Orders
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold bg-[#F8F2E7]/20">
                        <th className="py-3 px-3">Cancellation ID</th>
                        <th className="py-3 px-3">Order Ref</th>
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Products</th>
                        <th className="py-3 px-3 text-right">Order Value</th>
                        <th className="py-3 px-3">Cancellation Reason</th>
                        <th className="py-3 px-3 text-center">Refund Status</th>
                        <th className="py-3 px-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCancellations.map((row, idx) => (
                        <tr key={idx} className="text-gray-600 hover:bg-[#F8F2E7]/20 transition-colors">
                          <td className="py-3.5 px-3 font-mono font-bold text-[#D4AF37]">{row.id}</td>
                          <td className="py-3.5 px-3 font-mono text-gray-600">{row.orderId}</td>
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-[#002F24] block">{row.customerName}</span>
                            <span className="text-[10px] text-gray-400">{row.customerPhone}</span>
                          </td>
                          <td className="py-3.5 px-3 font-medium text-[#002F24] max-w-xs truncate" title={row.product}>
                            {row.product}
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold text-rose-600">₹{row.amount.toLocaleString()}</td>
                          <td className="py-3.5 px-3 text-gray-600 max-w-xs">{row.reason}</td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.refundStatus === 'Refunded'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                            }`}>
                              {row.refundStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right text-gray-400 text-[11px] whitespace-nowrap">{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-[#D4AF37]/30 bg-[#F8F2E7]/30 font-bold text-xs">
                      <tr>
                        <td colSpan="4" className="py-3 px-3 text-[#002F24]">Total Cancelled / Refunded ({filteredCancellations.length} records)</td>
                        <td className="py-3 px-3 text-right text-rose-600 font-extrabold">
                          ₹{filteredCancellations.reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
                        </td>
                        <td colSpan="3" className="py-3 px-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Generate Statement Modal */}
      {showStatementModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-[#D4AF37]/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif font-bold text-[#002F24] text-base">Generate Financial Statement</h3>
              </div>
              <button 
                onClick={() => setShowStatementModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">Select Statement Scope</label>
              
              <div className="space-y-2 text-xs">
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatementType === 'ALL' ? 'border-[#002F24] bg-[#F8F2E7]/30' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input 
                    type="radio" 
                    name="scope" 
                    checked={selectedStatementType === 'ALL'} 
                    onChange={() => setSelectedStatementType('ALL')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-[#002F24] block">Complete Comprehensive Statement</span>
                    <span className="text-gray-500 text-[11px]">Includes Gross Revenue, Tax Ledger, Restock Logs, and Cancellations combined.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatementType === 'REVENUE' ? 'border-[#002F24] bg-[#F8F2E7]/30' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input 
                    type="radio" 
                    name="scope" 
                    checked={selectedStatementType === 'REVENUE'} 
                    onChange={() => setSelectedStatementType('REVENUE')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-[#002F24] block">Gross Revenue & Tax Ledger Only</span>
                    <span className="text-gray-500 text-[11px]">Order payouts, 8% commission deductions, and 5% GST breakdown.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatementType === 'RESTOCK' ? 'border-[#002F24] bg-[#F8F2E7]/30' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input 
                    type="radio" 
                    name="scope" 
                    checked={selectedStatementType === 'RESTOCK'} 
                    onChange={() => setSelectedStatementType('RESTOCK')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-[#002F24] block">Inventory Restock & Movement Log</span>
                    <span className="text-gray-500 text-[11px]">Stock arrivals, production batch bottling, and damage audits.</span>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatementType === 'CANCELLATIONS' ? 'border-[#002F24] bg-[#F8F2E7]/30' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input 
                    type="radio" 
                    name="scope" 
                    checked={selectedStatementType === 'CANCELLATIONS'} 
                    onChange={() => setSelectedStatementType('CANCELLATIONS')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-[#002F24] block">Cancellation & Refund Audit</span>
                    <span className="text-gray-500 text-[11px]">Decline distribution, customer reasons, and refund logs.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={triggerPrintStatement}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
              
              <button
                onClick={() => exportToCSV(selectedStatementType)}
                className="px-5 py-2.5 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                Download Excel (CSV)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 6. NOTIFICATIONS CENTER
// ==========================================
export function Notifications() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New Order Received',
      desc: 'Order #PO-9840 was placed by Amit Sharma for Cold Pressed Groundnut Oil (5L). Please review and pack.',
      time: '10 mins ago',
      category: 'ORDERS',
      isRead: false,
      link: '/vendor/orders'
    },
    {
      id: 'notif-2',
      title: 'Low Stock Alert',
      desc: 'Cold Pressed Sesame Oil (1L) has dropped below threshold limit (4 units remaining). Restock soon.',
      time: '1 hr ago',
      category: 'STOCK',
      isRead: false,
      link: '/vendor/inventory'
    },
    {
      id: 'notif-3',
      title: 'KYC Document Approved',
      desc: 'Your business GST and FSSAI credentials have been verified by HealthOil compliance team.',
      time: 'Yesterday',
      category: 'KYC',
      isRead: true,
      link: '/vendor/kyc'
    },
    {
      id: 'notif-4',
      title: 'Payout Processed',
      desc: 'Settlement #SET-4821 of ₹14,280 has been successfully credited to your bank account.',
      time: '2 days ago',
      category: 'FINANCE',
      isRead: true,
      link: '/vendor/settlements'
    },
    {
      id: 'notif-5',
      title: 'Customer Review Submitted',
      desc: 'Priya Patel left a 5★ rating on Cold Pressed Coconut Oil: "Excellent quality and authentic aroma!"',
      time: '3 days ago',
      category: 'REVIEWS',
      isRead: true,
      link: '/vendor/reviews'
    }
  ])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    toast.success('All notifications marked as read')
  }

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const deleteNotification = (id, e) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success('Notification removed')
  }

  const clearAll = () => {
    if (notifications.length === 0) return
    setNotifications([])
    toast.success('Notification list cleared')
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'ALL') return true
    if (activeFilter === 'UNREAD') return !n.isRead
    return n.category === activeFilter
  })

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'ORDERS':
        return { label: 'Order', bg: 'bg-blue-50 text-blue-700 border-blue-200' }
      case 'STOCK':
        return { label: 'Stock Alert', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'KYC':
        return { label: 'KYC & Compliance', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'FINANCE':
        return { label: 'Settlement', bg: 'bg-purple-50 text-purple-700 border-purple-200' }
      case 'REVIEWS':
        return { label: 'Review', bg: 'bg-yellow-50 text-yellow-800 border-yellow-200' }
      default:
        return { label: 'System', bg: 'bg-gray-50 text-gray-700 border-gray-200' }
    }
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#002F24] text-[#D4AF37] flex items-center justify-center shadow-sm">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#002F24] flex items-center gap-2">
              Notification Center
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Stay updated with live orders, inventory warnings, and vendor payouts.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-bold text-[#002F24] hover:bg-[#F8F2E7] border border-[#D4AF37]/30 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'All Notifications', count: notifications.length },
          { id: 'UNREAD', label: 'Unread', count: unreadCount },
          { id: 'ORDERS', label: 'Orders', count: notifications.filter(n => n.category === 'ORDERS').length },
          { id: 'STOCK', label: 'Stock Alerts', count: notifications.filter(n => n.category === 'STOCK').length },
          { id: 'FINANCE', label: 'Finance', count: notifications.filter(n => n.category === 'FINANCE').length },
          { id: 'KYC', label: 'KYC', count: notifications.filter(n => n.category === 'KYC').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
              activeFilter === tab.id
                ? 'bg-[#002F24] text-[#D4AF37] border-[#002F24] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeFilter === tab.id ? 'bg-[#D4AF37] text-[#002F24]' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List or Empty State */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-[#F8F2E7] text-[#002F24] rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/30 shadow-inner">
            <Bell className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif text-[#002F24]">No Notifications Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              {activeFilter === 'ALL'
                ? "You're all caught up! New order alerts, inventory notices, and platform updates will appear here."
                : `There are no ${activeFilter.toLowerCase()} notifications at the moment.`}
            </p>
          </div>
          {activeFilter !== 'ALL' && (
            <button
              onClick={() => setActiveFilter('ALL')}
              className="px-4 py-2 bg-[#002F24] text-white rounded-xl text-xs font-bold hover:bg-[#014D3A] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              View All Notifications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((not) => {
            const badge = getCategoryBadge(not.category)
            return (
              <div
                key={not.id}
                onClick={() => {
                  markAsRead(not.id)
                  if (not.link) navigate(not.link)
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group ${
                  not.isRead
                    ? 'bg-white border-gray-200/80 hover:border-[#D4AF37]/40 shadow-xs'
                    : 'bg-[#F8F2E7]/40 border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${not.isRead ? 'bg-gray-300' : 'bg-[#D4AF37] ring-4 ring-[#D4AF37]/20'}`} />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-xs font-bold ${not.isRead ? 'text-gray-800' : 'text-[#002F24]'}`}>
                        {not.title}
                      </h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {!not.isRead && (
                        <span className="text-[9px] font-bold text-[#D4AF37] bg-[#002F24] px-1.5 py-0.2 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{not.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-6 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                  <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {not.time}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => deleteNotification(not.id, e)}
                      title="Dismiss notification"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 7. STAFF MANAGEMENT PAGE
// ==========================================
export function Staff() {
  const staffList = [
    { name: 'Ramesh Das', role: 'Shop Manager', email: 'ramesh@krishnaoils.com', status: 'Active' },
    { name: 'Sanjay Kumar', role: 'Inventory Operator', email: 'sanjay@krishnaoils.com', status: 'Active' },
  ]

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#002F24]">Staff Management</h2>
          <p className="text-xs text-gray-500 mt-1">Assign operator accounts and roles for shop dashboard managers.</p>
        </div>
        <button className="bg-[#002F24] hover:bg-[#014D3A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold">
                <th className="pb-3">Staff Name</th>
                <th className="pb-3">Account Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffList.map((staff, idx) => (
                <tr key={idx} className="text-gray-655 hover:bg-[#F8F2E7]/15">
                  <td className="py-3.5 font-bold text-[#002F24]">{staff.name}</td>
                  <td className="py-3.5 text-gray-550">{staff.email}</td>
                  <td className="py-3.5 font-semibold text-[#D4AF37]">{staff.role}</td>
                  <td className="py-3.5 text-right">
                    <StatusBadge status={staff.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 8. HELP & SUPPORT CENTER
// ==========================================
export function Support() {
  const [activeTab, setActiveTab] = useState('HELP_CENTER') // 'HELP_CENTER', 'TICKETS', 'CONTACT'
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Payments & Settlement',
    priority: 'Medium',
    orderId: '',
    description: ''
  })

  const [tickets, setTickets] = useState([
    {
      id: '#TKT-2490',
      subject: 'Payout verification query for settlement #SET-4821',
      category: 'Payments & Settlement',
      priority: 'High',
      status: 'In Progress',
      createdAt: '24 Sep 2026',
      lastUpdate: '1 hr ago',
      description: 'Requesting confirmation on TDS deduction details for September week 3 settlement.'
    },
    {
      id: '#TKT-2475',
      subject: 'Assistance required for bulk cold-pressed oil weight tier packaging',
      category: 'Catalog & Products',
      priority: 'Medium',
      status: 'Resolved',
      createdAt: '18 Sep 2026',
      lastUpdate: '20 Sep 2026',
      description: 'Added 5L tin packaging option and needed approval for logistics dimensional constraints.'
    }
  ])

  const faqs = [
    {
      q: 'How do vendor settlements and payouts work?',
      a: 'Vendor payouts are automatically processed on a weekly T+3 cycle directly into your verified bank account. Full breakdown invoices, gross revenue, platform commissions, and net payouts are accessible under the Settlements tab.'
    },
    {
      q: 'How do I add new products and manage inventory thresholds?',
      a: 'Go to Catalog → Add Product to list pure oils with certifications, pack sizes (e.g. 500ml, 1L, 5L), and pricing. Low-stock warnings will automatically notify you when inventory drops below your defined threshold.'
    },
    {
      q: 'What are the logistics pickup and packaging guidelines?',
      a: 'All oil bottles and tin containers must be safely packaged with leak-proof inner seals and bubble cushioning. Courier partners collect shipments directly from your registered warehouse location between 10:00 AM and 5:00 PM.'
    },
    {
      q: 'How can I update my Bank Account or KYC details?',
      a: 'Open the Update Registration section from the sidebar or settings. Updates to Bank Account Numbers undergo dual validation and instant admin compliance approval within 24 business hours.'
    },
    {
      q: 'What happens when a customer initiates a return request?',
      a: 'Return requests appear in the Returns & Refunds panel with inspection photos and reason descriptions. Once the returned parcel arrives at your warehouse, inspect the seal integrity and acknowledge the dispute for resolution.'
    }
  ]

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateTicket = (e) => {
    e.preventDefault()
    if (!ticketForm.subject.trim()) {
      return toast.error('Please enter a ticket subject.')
    }
    if (!ticketForm.description.trim()) {
      return toast.error('Please describe your issue.')
    }

    const newTicket = {
      id: `#TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketForm.subject,
      category: ticketForm.category,
      priority: ticketForm.priority,
      status: 'Open',
      createdAt: 'Just now',
      lastUpdate: 'Just now',
      description: ticketForm.description
    }

    setTickets([newTicket, ...tickets])
    setShowCreateModal(false)
    setTicketForm({
      subject: '',
      category: 'Payments & Settlement',
      priority: 'Medium',
      orderId: '',
      description: ''
    })
    toast.success('Support ticket submitted successfully! Ticket ID: ' + newTicket.id)
    setActiveTab('TICKETS')
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#002F24] text-[#D4AF37] flex items-center justify-center shadow-md">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-[#002F24]">Vendor Help & Support Desk</h1>
            <p className="text-xs text-gray-500 mt-0.5">Explore FAQs, contact merchant assistance, or manage priority dispute tickets.</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#002F24] hover:bg-[#014D3A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          Create Support Ticket
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-[#D4AF37]/20 gap-2">
        {[
          { id: 'HELP_CENTER', label: 'Help Guides & FAQs', icon: FileText },
          { id: 'TICKETS', label: `Support Tickets (${tickets.length})`, icon: MessageSquare },
          { id: 'CONTACT', label: 'Contact & Escalations', icon: Phone },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#002F24] text-[#002F24]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB 1: HELP GUIDES & FAQS */}
      {activeTab === 'HELP_CENTER' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2.5 bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 focus-within:border-[#002F24]">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search solutions, guidelines, payments, logistics, oil packaging..."
                className="bg-transparent text-xs outline-none w-full text-gray-800 placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Support Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-5 shadow-sm hover:border-[#002F24] transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-[#002F24]">Order Fulfillment</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Packing slips, dispatch procedures, courier tracking, and handover manifests.</p>
            </div>

            <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-5 shadow-sm hover:border-[#002F24] transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-[#002F24]">Bank Payouts & Taxes</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Commission structures, GST input claims, TDS certificates, and settlement dates.</p>
            </div>

            <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-5 shadow-sm hover:border-[#002F24] transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-[#002F24]">Quality & Compliance</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">FSSAI regulations, purity standards for cold-pressed oils, and packaging seals.</p>
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#002F24] border-b border-gray-100 pb-3">
              Frequently Asked Questions
            </h3>

            {filteredFaqs.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No help articles matching "{searchQuery}". Try searching with different keywords or create a ticket.
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div key={idx} className="border border-gray-150 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 bg-[#F8F2E7]/20 hover:bg-[#F8F2E7]/40 transition-colors cursor-pointer"
                    >
                      <span className="font-bold text-xs text-[#002F24]">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white text-xs text-gray-600 leading-relaxed border-t border-gray-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUPPORT TICKETS */}
      {activeTab === 'TICKETS' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
            {tickets.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 bg-[#F8F2E7] text-[#D4AF37] rounded-full flex items-center justify-center mx-auto border border-[#D4AF37]/30">
                  <MessageSquare className="w-6 h-6 text-[#002F24]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif text-[#002F24]">No Support Tickets Found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                    Have an issue with orders, settlements, or compliance? Create a priority support ticket for quick assistance.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#002F24] text-white rounded-xl text-xs font-bold hover:bg-[#014D3A] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" /> Create First Ticket
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold">
                      <th className="pb-3">Ticket ID</th>
                      <th className="pb-3">Subject Description</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Priority</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tickets.map((tkt, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedTicket(tkt)}
                        className="text-gray-600 hover:bg-[#F8F2E7]/25 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 font-mono font-bold text-[#D4AF37]">{tkt.id}</td>
                        <td className="py-3.5 font-bold text-[#002F24] max-w-xs truncate">{tkt.subject}</td>
                        <td className="py-3.5 text-gray-500">{tkt.category}</td>
                        <td className="py-3.5 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            tkt.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                            tkt.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {tkt.priority}
                          </span>
                        </td>
                        <td className="py-3.5 text-gray-400 text-[11px]">{tkt.createdAt}</td>
                        <td className="py-3.5 text-right">
                          <StatusBadge status={tkt.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT & CHANNELS */}
      {activeTab === 'CONTACT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#002F24]">Merchant Helpline</h3>
                <p className="text-xs text-gray-500">Toll-free dedicated support for active vendors.</p>
              </div>
            </div>
            <div className="p-3 bg-[#F8F2E7]/40 rounded-xl border border-[#D4AF37]/20">
              <span className="text-xs text-gray-500 block">Toll-Free Number:</span>
              <span className="text-base font-bold font-mono text-[#002F24]">1800-419-8899</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Available Mon – Sat, 9:00 AM – 8:00 PM IST</span>
            </div>
            <a
              href="tel:18004198899"
              className="w-full bg-[#002F24] hover:bg-[#014D3A] text-white font-bold text-xs py-2.5 rounded-xl transition-all text-center block cursor-pointer"
            >
              Call Helpline Now
            </a>
          </div>

          <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#002F24]">Partner Email Desk</h3>
                <p className="text-xs text-gray-500">For account escalations and audit requests.</p>
              </div>
            </div>
            <div className="p-3 bg-[#F8F2E7]/40 rounded-xl border border-[#D4AF37]/20">
              <span className="text-xs text-gray-500 block">Support Email:</span>
              <span className="text-sm font-bold font-mono text-[#002F24]">vendor-desk@helthoil.com</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Guaranteed response within 4 hours</span>
            </div>
            <a
              href="mailto:vendor-desk@helthoil.com"
              className="w-full bg-[#002F24] hover:bg-[#014D3A] text-white font-bold text-xs py-2.5 rounded-xl transition-all text-center block cursor-pointer"
            >
              Compose Email
            </a>
          </div>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#D4AF37]/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#002F24] text-[#D4AF37] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-sm text-[#002F24]">Create Support Ticket</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">
                  Ticket Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="e.g. Issue with settlement amount calculation"
                  className="w-full bg-[#F8F2E7]/30 border border-[#D4AF37]/25 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full bg-[#F8F2E7]/30 border border-[#D4AF37]/25 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]"
                  >
                    <option>Payments & Settlement</option>
                    <option>Orders & Delivery</option>
                    <option>Catalog & Products</option>
                    <option>KYC & Bank Verification</option>
                    <option>Returns & Refunds</option>
                    <option>Technical Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full bg-[#F8F2E7]/30 border border-[#D4AF37]/25 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">
                  Description & Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Describe your issue with relevant details like Order ID, Settlement Reference, or Product SKU..."
                  className="w-full bg-[#F8F2E7]/30 border border-[#D4AF37]/25 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002F24] hover:bg-[#014D3A] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4AF37]" /> Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TICKET DETAIL MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#D4AF37]/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#D4AF37]">{selectedTicket.id}</span>
                <h3 className="font-serif font-bold text-sm text-[#002F24] mt-0.5">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#F8F2E7]/40 p-3 rounded-xl text-xs border border-[#D4AF37]/20">
              <div>
                <span className="text-[10px] text-gray-400 block font-bold uppercase">Category</span>
                <span className="font-semibold text-gray-700">{selectedTicket.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-bold uppercase">Priority</span>
                <span className="font-semibold text-gray-700">{selectedTicket.priority}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-bold uppercase">Status</span>
                <StatusBadge status={selectedTicket.status} />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 block font-bold uppercase mb-1">Issue Description</span>
              <p className="text-xs text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100 leading-relaxed">
                {selectedTicket.description}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-medium">Created: {selectedTicket.createdAt}</span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-[#002F24] text-white rounded-xl text-xs font-bold hover:bg-[#014D3A] cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 9. SETTINGS PAGE
// ==========================================
export function Settings() {
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '' })
  const [showOldPass, setShowOldPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#002F24]">Portal Settings</h2>
        <p className="text-xs text-gray-500 mt-1">Configure profile security credentials, 2FA codes, and session histories.</p>
      </div>

      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm max-w-lg">
        <h3 className="font-serif font-bold text-[#002F24] text-sm mb-4 border-b border-gray-100 pb-2">Change Password</h3>
        
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Old Password</label>
            <div className="relative">
              <input
                type={showOldPass ? 'text' : 'password'}
                value={passForm.oldPass}
                onChange={(e) => setPassForm({...passForm, oldPass: e.target.value})}
                className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl pl-4 pr-10 py-2.5 outline-none text-[#15251F]"
              />
              <button
                type="button"
                onClick={() => setShowOldPass(!showOldPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                value={passForm.newPass}
                onChange={(e) => setPassForm({...passForm, newPass: e.target.value})}
                className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl pl-4 pr-10 py-2.5 outline-none text-[#15251F]"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
          <button className="bg-[#002F24] hover:bg-[#014D3A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer">
            <Save className="w-4 h-4" />
            Update Password
          </button>
        </div>
      </div>
    </div>
  )
}
