import React from 'react'
import { ArrowUpRight, ArrowDownRight, Package, ShieldAlert } from 'lucide-react'

// Premium Stat Card with Gold Foil border and delicate shadows
export function StatCard({ title, value, change, isUp, icon: Icon, color = 'bg-[#014D3A] text-[#F2CF65]' }) {
  return (
    <div className="bg-white border-b-2 border-r-2 border-[#D4AF37]/35 rounded-2xl p-6 hover:border-[#002F24] hover:shadow-lg hover:shadow-[#D4AF37]/5 transition-all duration-300 shadow-sm text-left relative overflow-hidden group">
      
      {/* Decorative subtle background pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F8F2E7] to-transparent rounded-full opacity-40 transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-350" />
      
      <div className="flex justify-between items-start relative z-10">
        <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider font-sans">{title}</span>
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shadow-sm`}>
          {Icon && <Icon className="w-4.5 h-4.5" />}
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2 relative z-10">
        <span className="text-2xl font-bold font-serif text-[#002F24] tracking-tight">{value}</span>
        {change && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
            isUp 
              ? 'bg-[#16A34A]/10 text-[#16A34A]' 
              : 'bg-[#DC2626]/10 text-[#DC2626]'
          }`}>
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
    </div>
  )
}

// Status Badge with high-contrast color tones
export function StatusBadge({ status }) {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'delivered':
      case 'paid':
      case 'resolved':
        return 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/25'
      case 'pending':
      case 'under verification':
      case 'processing':
      case 'preparing':
      case 'in transit':
      case 'out for delivery':
        return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/25'
      case 'rejected':
      case 'failed':
      case 'cancelled':
      case 'returned':
      case 'on hold':
        return 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/25'
      default:
        return 'bg-gray-100 text-gray-655 border-gray-200'
    }
  }

  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-bold border tracking-wide uppercase ${getStyles()}`}>
      {status}
    </span>
  )
}

// Pagination
export function Pagination({ currentPage = 1, totalPages = 5, onPageChange }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
      <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
      <div className="flex gap-2">
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          className="px-3 py-1.5 border border-[#D4AF37]/30 rounded-xl text-xs font-bold text-gray-600 hover:bg-[#F8F2E7]/40 disabled:opacity-50 cursor-pointer"
        >
          Previous
        </button>
        <button 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          className="px-3 py-1.5 border border-[#D4AF37]/30 rounded-xl text-xs font-bold text-gray-600 hover:bg-[#F8F2E7]/40 disabled:opacity-50 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  )
}

// Empty State
export function EmptyState({ title = "No data found", description = "Try adjusting your filters or search query." }) {
  return (
    <div className="bg-white border border-[#D4AF37]/15 rounded-2xl p-12 text-center shadow-sm">
      <Package className="w-10 h-10 text-[#D4AF37]/40 mx-auto mb-4" />
      <h4 className="text-sm font-serif font-bold text-[#002F24]">{title}</h4>
      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">{description}</p>
    </div>
  )
}

// Skeleton Loader
export function SkeletonLoader({ rows = 3 }) {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-12 bg-gray-100 rounded-xl w-full" />
      ))}
    </div>
  )
}

// Confirm Modal
export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#D4AF37]/25 rounded-2xl max-w-md w-full p-6 shadow-xl text-left">
        <h3 className="font-serif font-bold text-[#002F24] text-base mb-2">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-[#F8F2E7]/40 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-[#DC2626] text-white rounded-xl text-xs font-bold hover:bg-[#DC2626]/90 cursor-pointer shadow-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// Order Status Timeline
export function OrderStatusTimeline({ steps = [] }) {
  return (
    <div className="relative border-l-2 border-[#D4AF37]/35 ml-3 pl-6 space-y-6 py-2 text-left">
      {steps.map((step, idx) => (
        <div key={idx} className="relative">
          <span className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-[#002F24] border-2 border-[#D4AF37]" />
          <h5 className="text-xs font-bold text-[#002F24]">{step.title}</h5>
          <span className="text-[10px] text-gray-400 block mt-0.5">{step.time}</span>
        </div>
      ))}
    </div>
  )
}

// Settlement Summary Card
export function SettlementSummary({ gross = '₹0', commission = '₹0', net = '₹0' }) {
  return (
    <div className="bg-[#F8F2E7]/40 border border-[#D4AF37]/20 p-5 rounded-2xl space-y-3 text-left">
      <div className="flex justify-between text-xs text-gray-600">
        <span>Gross Earnings</span>
        <span className="font-bold text-[#15251F]">{gross}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Platform Commission</span>
        <span className="font-bold text-[#DC2626]">{commission}</span>
      </div>
      <div className="border-t border-[#D4AF37]/15 pt-2 flex justify-between text-sm font-bold text-[#002F24]">
        <span>Net Payout</span>
        <span>{net}</span>
      </div>
    </div>
  )
}

// Permission Guard
export function PermissionGuard({ role, requiredRole, children }) {
  if (role !== requiredRole) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-left">
        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-red-800">Access Denied</h4>
          <p className="text-[10px] text-red-600 mt-0.5">Your staff role does not have permission to view this section.</p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}
