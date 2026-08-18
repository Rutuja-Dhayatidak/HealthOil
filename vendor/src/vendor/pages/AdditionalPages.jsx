import React, { useState } from 'react'
import { 
  Tag, 
  Plus, 
  CreditCard, 
  Download, 
  RefreshCcw, 
  Eye, 
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
  Mail
} from 'lucide-react'
import { StatusBadge, SettlementSummary, PermissionGuard } from '../components/VendorComponents'

// ==========================================
// 1. OFFERS & COUPONS PAGE
// ==========================================
export function Offers() {
  const [showAddModal, setShowAddModal] = useState(false)
  const offersList = [
    { code: 'GOLDENMILK10', name: 'Premium Coconut Discount', type: 'Percentage', value: '10%', minOrder: '₹500', status: 'Active' },
    { code: 'FREESHIPMUST', name: 'Mustard Oil Promo', type: 'Flat Discount', value: '₹50', minOrder: '₹600', status: 'Active' },
  ]

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#002F24]">Coupons & Offers</h2>
          <p className="text-xs text-gray-500 mt-1">Manage shop discount codes and promotional campaigns.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#002F24] hover:bg-[#014D3A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold">
                <th className="pb-3">Coupon Code</th>
                <th className="pb-3">Campaign Name</th>
                <th className="pb-3">Discount Type</th>
                <th className="pb-3">Value</th>
                <th className="pb-3">Min Order</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offersList.map((offer, idx) => (
                <tr key={idx} className="text-gray-655 hover:bg-[#F8F2E7]/15">
                  <td className="py-3.5 font-mono font-bold text-[#D4AF37]">{offer.code}</td>
                  <td className="py-3.5 font-bold text-[#002F24]">{offer.name}</td>
                  <td className="py-3.5">{offer.type}</td>
                  <td className="py-3.5 font-bold text-[#16A34A]">{offer.value}</td>
                  <td className="py-3.5">{offer.minOrder}</td>
                  <td className="py-3.5 text-right">
                    <StatusBadge status={offer.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#D4AF37]/25 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-left">
            <h3 className="font-serif font-bold text-[#002F24] text-sm mb-4">Create New Coupon</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Coupon Code</label>
                <input type="text" placeholder="E.g., MUSTARD15" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Discount Value</label>
                <input type="text" placeholder="15% or ₹100" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-4">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 cursor-pointer">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-[#002F24] text-white rounded-xl text-xs font-bold cursor-pointer">Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
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
  const returns = [
    { id: '#RET-904', orderId: '#PO-9812', product: 'Coconut Oil (2L)', reason: 'Leakage from cap', status: 'Approved', amount: '₹510' }
  ]

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#002F24]">Returns & Refunds</h2>
        <p className="text-xs text-gray-500 mt-1">Monitor returns logistics and audit request statuses.</p>
      </div>

      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold">
                <th className="pb-3">Return ID</th>
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Product</th>
                <th className="pb-3">Reason Description</th>
                <th className="pb-3">Refund Amount</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.map((ret, idx) => (
                <tr key={idx} className="text-gray-655 hover:bg-[#F8F2E7]/15">
                  <td className="py-3.5 font-mono font-bold text-[#D4AF37]">{ret.id}</td>
                  <td className="py-3.5 font-mono text-gray-500">{ret.orderId}</td>
                  <td className="py-3.5 font-bold text-[#002F24]">{ret.product}</td>
                  <td className="py-3.5 text-gray-500">{ret.reason}</td>
                  <td className="py-3.5 font-bold text-rose-600">{ret.amount}</td>
                  <td className="py-3.5 text-right">
                    <StatusBadge status={ret.status} />
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
// 4. REVIEWS PAGE
// ==========================================
export function Reviews() {
  const reviews = [
    { customer: 'Rajesh Kumar', rating: 5, comment: 'High quality oil, delivery was extremely quick!', product: 'Cold Pressed Mustard Oil' },
    { customer: 'Sneha Patel', rating: 4, comment: 'Good quality coconut oil, container cap was a bit tight.', product: 'Organic Coconut Cooking Oil' }
  ]

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#002F24]">Customer Reviews</h2>
        <p className="text-xs text-gray-500 mt-1">Review feedback, store ratings, and reply to customers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev, idx) => (
          <div key={idx} className="bg-white border border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm text-left flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="font-bold text-[#002F24] text-xs">{rev.customer}</span>
                <span className="text-[#D4AF37] font-bold text-xs">{rev.rating} ★</span>
              </div>
              <span className="text-[9px] text-gray-400 font-bold block mt-1">Product: {rev.product}</span>
              <p className="text-xs text-gray-605 leading-relaxed mt-3">"{rev.comment}"</p>
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-100 flex gap-2">
              <input type="text" placeholder="Type response reply..." className="flex-1 bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#002F24]" />
              <button className="bg-[#002F24] text-white font-bold text-[10px] px-3 py-1.5 rounded-xl cursor-pointer">Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// 5. REPORTS & ANALYTICS PAGE
// ==========================================
export function Reports() {
  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#002F24]">Reports & Analytics</h2>
          <p className="text-xs text-gray-500 mt-1">Generate sales summaries, inventory history, and tax statements.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3.5 py-2 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1">
            <Download className="w-4 h-4" />
            Export Sales PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm">
          <h4 className="font-bold text-xs text-[#002F24] mb-3">Gross Revenue Ledger</h4>
          <p className="text-xs text-gray-500 mb-4">Detailed list of store payouts, taxes, and platform commissions.</p>
          <button className="text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer">Generate Statement →</button>
        </div>

        <div className="bg-white border border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm">
          <h4 className="font-bold text-xs text-[#002F24] mb-3">Inventory Restock History</h4>
          <p className="text-xs text-gray-500 mb-4">Stock arrival statements, damages, and expired batch logs.</p>
          <button className="text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer">Generate Statement →</button>
        </div>

        <div className="bg-white border border-[#D4AF37]/20 p-5 rounded-2xl shadow-sm">
          <h4 className="font-bold text-xs text-[#002F24] mb-3">Cancellation Report</h4>
          <p className="text-xs text-gray-500 mb-4">Decline rates, user cancellations, and refunds distribution.</p>
          <button className="text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer">Generate Statement →</button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 6. NOTIFICATIONS CENTER
// ==========================================
export function Notifications() {
  const notificationsList = [
    { title: 'New Order Received', desc: 'Order #PO-9840 was placed by Amit Sharma for Groundnut Oil (5L)', time: '10 mins ago', cat: 'Orders' },
    { title: 'Low Stock Alert', desc: 'Cold Pressed Groundnut Oil (1L) has dropped below threshold limit.', time: '1 hr ago', cat: 'Inventory' },
    { title: 'KYC Verification Done', desc: 'Krishna Oils documents has been approved by HealthOil Admin.', time: 'Yesterday', cat: 'KYC' }
  ]

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#002F24]">Notification Center</h2>
          <p className="text-xs text-gray-500 mt-1">Review active orders alerts, stock indicators, and admin broadcasts.</p>
        </div>
        <button className="text-xs text-[#D4AF37] hover:underline font-bold cursor-pointer">Mark all as read</button>
      </div>

      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm space-y-4">
        {notificationsList.map((not, idx) => (
          <div key={idx} className="bg-[#F8F2E7]/25 border border-gray-150/40 p-4 rounded-xl flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                <h4 className="font-bold text-xs text-[#002F24]">{not.title}</h4>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">{not.desc}</p>
            </div>
            <span className="text-[10px] text-gray-400 shrink-0 font-bold">{not.time}</span>
          </div>
        ))}
      </div>
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
// 8. SUPPORT PAGE
// ==========================================
export function Support() {
  const tickets = [
    { id: '#TKT-2490', subject: 'Payout delays for settlement #SET-4821', category: 'Payment Issue', priority: 'High', status: 'Open' }
  ]

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#002F24]">Support Tickets</h2>
          <p className="text-xs text-gray-500 mt-1">File disputes, request product category approvals, or contact admin.</p>
        </div>
        <button className="bg-[#002F24] hover:bg-[#014D3A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm">
          <Plus className="w-4 h-4" />
          Create Support Ticket
        </button>
      </div>

      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold">
                <th className="pb-3">Ticket ID</th>
                <th className="pb-3">Subject Description</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((tkt, idx) => (
                <tr key={idx} className="text-gray-655 hover:bg-[#F8F2E7]/15">
                  <td className="py-3.5 font-mono font-bold text-[#D4AF37]">{tkt.id}</td>
                  <td className="py-3.5 font-bold text-[#002F24]">{tkt.subject}</td>
                  <td className="py-3.5">{tkt.category}</td>
                  <td className="py-3.5 font-bold text-rose-500">{tkt.priority}</td>
                  <td className="py-3.5 text-right">
                    <StatusBadge status={tkt.status} />
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
// 9. SETTINGS PAGE
// ==========================================
export function Settings() {
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '' })

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
            <input type="password" value={passForm.oldPass} onChange={(e) => setPassForm({...passForm, oldPass: e.target.value})} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
            <input type="password" value={passForm.newPass} onChange={(e) => setPassForm({...passForm, newPass: e.target.value})} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" />
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
