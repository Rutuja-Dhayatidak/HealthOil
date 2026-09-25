import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Search, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  X, 
  Store, 
  User, 
  Receipt, 
  Loader2,
  ChevronDown,
  ShieldCheck,
  Building2
} from 'lucide-react'
import { getAdminPayments } from '../ApiServices/adminService'
import toast from 'react-hot-toast'

function Payments() {
  const [paymentsList, setPaymentsList] = useState([])
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    paidCount: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    totalTransactions: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [methodFilter, setMethodFilter] = useState('ALL')
  
  // Modal state for view details
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const res = await getAdminPayments()
      if (res?.success) {
        setPaymentsList(res.payments || [])
        if (res.summary) setSummary(res.summary)
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err)
      toast.error('Failed to load payments data')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = (payment) => {
    setSelectedPayment(payment)
    setDetailsModalOpen(true)
  }

  const handleExportCSV = () => {
    if (filteredPayments.length === 0) return toast.error('No payments to export.')

    const headers = ['Transaction ID', 'Order ID', 'Date', 'Customer', 'Vendor Store', 'Payment Method', 'Amount (INR)', 'Platform Fee (5%)', 'Net Payout', 'Status']
    const rows = filteredPayments.map(p => [
      `"${p.id}"`,
      `"${p.orderId}"`,
      `"${p.date}"`,
      `"${p.customer}"`,
      `"${p.store}"`,
      `"${p.method}"`,
      `"₹${p.amount}"`,
      `"₹${p.platformFee}"`,
      `"₹${p.netPayout}"`,
      `"${p.status}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `HealthOil_Payments_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Payments CSV exported successfully!')
  }

  const filteredPayments = paymentsList.filter(p => {
    const matchesSearch = 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderId.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.store.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || p.status.toLowerCase() === statusFilter.toLowerCase()
    
    let matchesMethod = true
    if (methodFilter !== 'ALL') {
      matchesMethod = p.method.toLowerCase().includes(methodFilter.toLowerCase())
    }

    return matchesSearch && matchesStatus && matchesMethod
  })

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#031d13] tracking-tight">Payments & Financial Settlements</h2>
          <p className="text-xs text-gray-500 mt-1">
            Monitor real-time transactions, online gateway logs, vendor payouts, and refund histories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchPayments}
            className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#031d13] hover:bg-[#b89547] text-[#FAF4E8] hover:text-[#031d13] rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Received Revenue */}
        <div className="bg-white border border-[#b89547]/20 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Received Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-[#031d13]">
              ₹{summary.totalRevenue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>{summary.paidCount} successful payments</span>
            </p>
          </div>
        </div>

        {/* Completed Paid Count */}
        <div className="bg-white border border-[#b89547]/20 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Paid Transactions</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-[#031d13]">
              {summary.paidCount} / {summary.totalTransactions}
            </h3>
            <p className="text-[10px] text-gray-500 font-medium mt-1">
              Confirmed gateway checkouts
            </p>
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="bg-white border border-[#b89547]/20 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Payments</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-amber-600">
              ₹{summary.pendingAmount.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-gray-500 font-medium mt-1">
              Awaiting delivery / COD collection
            </p>
          </div>
        </div>

        {/* Refunds / Returned */}
        <div className="bg-white border border-[#b89547]/20 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Refunds & Reversals</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-rose-600">
              ₹{summary.refundedAmount.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] text-rose-500 font-medium mt-1">
              Cancelled or returned orders
            </p>
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#b89547]/20 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white border border-[#b89547]/25 rounded-xl px-3.5 py-2 w-full sm:w-80 shadow-xs focus-within:border-[#031d13]">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Payment ID, Order ID, Customer..." 
              className="bg-transparent text-xs outline-none w-full text-[#031d13] placeholder-gray-400 font-medium"
            />
          </div>

          {/* Filter Badges / Dropdown */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {['ALL', 'PAID', 'PENDING', 'REFUNDED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-[#031d13] text-[#FAF4E8] shadow-xs' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {st === 'ALL' ? 'All Payments' : st}
              </button>
            ))}
          </div>

        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="py-12 text-center text-xs font-bold text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading payments transaction logs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#b89547]/20 text-gray-400 font-bold">
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Vendor / Shop</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.length > 0 ? filteredPayments.map((p, idx) => (
                  <tr key={idx} className="text-gray-600 hover:bg-[#FAF4E8]/30 transition-colors duration-150">
                    <td className="py-3.5 font-mono font-bold text-blue-700">{p.id}</td>
                    <td className="py-3.5 font-mono font-bold text-[#b89547]">#{p.orderId}</td>
                    <td className="py-3.5 text-gray-400 whitespace-nowrap">{p.date}</td>
                    <td className="py-3.5 font-bold text-[#031d13]">{p.customer}</td>
                    <td className="py-3.5 text-gray-500">{p.store}</td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">
                        <CreditCard className="w-3 h-3 text-blue-600" />
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3.5 font-extrabold text-[#031d13]">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        p.status === 'PAID' 
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200' 
                          : p.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-700 border border-amber-200'
                          : 'bg-rose-500/10 text-rose-600 border border-rose-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button 
                        onClick={() => handleOpenDetails(p)}
                        className="px-2.5 py-1 bg-[#031d13]/5 hover:bg-[#031d13] text-[#031d13] hover:text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-gray-400 font-medium">
                      No payment transactions found matching search or status filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* Payment Receipt / Breakdown Modal */}
      {/* ======================================================== */}
      {detailsModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-left">
            
            {/* Modal Header */}
            <div className="bg-[#0b3b84] text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-yellow-300 font-mono">
                  Payment Receipt
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">Ref: {selectedPayment.id}</p>
              </div>

              <button 
                onClick={() => setDetailsModalOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs">
              
              {/* Amount Header Banner */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Transaction Value</span>
                <h2 className="text-3xl font-extrabold text-[#031d13] mt-1">₹{selectedPayment.amount.toLocaleString('en-IN')}</h2>
                <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold mt-2 ${
                  selectedPayment.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                  selectedPayment.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  Status: {selectedPayment.status}
                </span>
              </div>

              {/* Breakdown Grid */}
              <div className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-white">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Order Reference</span>
                  <span className="font-bold text-[#031d13] font-mono">#{selectedPayment.orderId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Transaction Date</span>
                  <span className="font-medium text-gray-800">{selectedPayment.date}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Payment Gateway</span>
                  <span className="font-bold text-blue-600">{selectedPayment.method}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Platform Commission (5%)</span>
                  <span className="font-bold text-gray-700">₹{selectedPayment.platformFee}</span>
                </div>
                <div className="flex justify-between items-center pt-1 font-bold">
                  <span className="text-gray-800">Net Vendor Payout</span>
                  <span className="text-emerald-700 text-sm">₹{selectedPayment.netPayout}</span>
                </div>
              </div>

              {/* Customer & Merchant Information */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Customer</span>
                  <p className="font-bold text-gray-900 truncate">{selectedPayment.customer}</p>
                  <p className="text-[10px] text-gray-500 truncate">{selectedPayment.customerEmail}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Vendor Merchant</span>
                  <p className="font-bold text-gray-900 truncate">{selectedPayment.store}</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Verified Merchant</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="w-full py-2.5 bg-[#031d13] text-[#FAF4E8] rounded-xl text-xs font-bold hover:bg-[#b89547] hover:text-[#031d13] transition-all cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Payments
