import { useState, useEffect } from 'react'
import { 
  Store, 
  Search, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Download, 
  Eye, 
  Loader2, 
  Send, 
  Ban, 
  RefreshCw,
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  getVendorsAdminApi, 
  toggleVendorSuspendApi, 
  approveVendor, 
  rejectVendor 
} from '../ApiServices/adminService'
import VendorEditDrawer from './VendorEditDrawer'
import SendVendorLinkModal from './SendVendorLinkModal'

function Shops() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [vendorsList, setVendorsList] = useState([])
  const [counts, setCounts] = useState({ all: 0, active: 0, pending: 0, suspended: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVendor, setSelectedVendor] = useState(null)

  // Pagination states (15 per page backend driven)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVendors: 0,
    limit: 15,
    hasNextPage: false,
    hasPrevPage: false
  })

  // View drawer states
  const [editVendor, setEditVendor] = useState(null)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)

  // Send link modal state
  const [sendLinkVendor, setSendLinkVendor] = useState(null)

  useEffect(() => {
    fetchVendors(page, statusFilter, searchQuery)
  }, [page, statusFilter])

  const fetchVendors = async (p = page, st = statusFilter, q = searchQuery) => {
    try {
      setLoading(true)
      const res = await getVendorsAdminApi({ page: p, limit: 15, status: st, search: q })
      if (res.success) {
        setVendorsList(res.vendors || [])
        if (res.counts) setCounts(res.counts)
        if (res.pagination) setPagination(res.pagination)
      }
    } catch (err) {
      toast.error('Failed to load vendor applications')
    } finally {
      setLoading(false)
    }
  }

  const getPageNumbers = () => {
    const total = pagination.totalPages || 1
    const current = page
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const pages = []
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
    return pages
  }

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchQuery(val)
    setPage(1)
    fetchVendors(1, statusFilter, val)
  }

  const handleStatusFilterChange = (st) => {
    setStatusFilter(st)
    setPage(1)
  }

  const handleToggleSuspend = async (vendorId) => {
    try {
      const res = await toggleVendorSuspendApi(vendorId)
      if (res.success) {
        toast.success(res.message || 'Vendor status updated!')
        fetchVendors()
        if (selectedVendor && selectedVendor._id === vendorId) {
          setSelectedVendor(prev => prev ? { ...prev, vendorStatus: res.vendorStatus } : prev)
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update vendor status')
    }
  }

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this vendor?")) return;
    try {
      await approveVendor(id)
      toast.success("Vendor Approved!")
      setSelectedVendor(null)
      fetchVendors()
    } catch (error) {
      toast.error("Approval failed")
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection:")
    if (!reason) return;
    try {
      await rejectVendor(id, reason)
      toast.error("Vendor Rejected")
      setSelectedVendor(null)
      fetchVendors()
    } catch (error) {
      toast.error("Rejection failed")
    }
  }

  const handleOpenEdit = (vendor) => {
    setEditVendor(vendor)
    setIsEditDrawerOpen(true)
    setSelectedVendor(null)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#031d13] tracking-tight">Partner Shops & Vendor Management</h2>
          <p className="text-xs text-gray-500 mt-1">
            Track active stores, pending verification requests, and manage suspended vendor accounts.
          </p>
        </div>

        <button 
          onClick={() => fetchVendors(page, statusFilter, searchQuery)}
          className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          title="Refresh Vendors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white border border-[#b89547]/20 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Top Controls: Status Filters + Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-5">
          
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => handleStatusFilterChange('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                statusFilter === 'ALL' 
                  ? 'bg-[#031d13] text-[#FAF4E8] border-[#031d13] shadow-xs' 
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              All Vendors ({counts.all})
            </button>

            <button
              onClick={() => handleStatusFilterChange('ACTIVE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                statusFilter === 'ACTIVE' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Active ({counts.active})
            </button>

            <button
              onClick={() => handleStatusFilterChange('PENDING')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                statusFilter === 'PENDING' 
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending ({counts.pending})
            </button>

            <button
              onClick={() => handleStatusFilterChange('SUSPENDED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                statusFilter === 'SUSPENDED' 
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs' 
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              Suspended ({counts.suspended})
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-white border border-[#b89547]/25 rounded-xl px-3.5 py-2 w-full md:w-72 shadow-xs focus-within:border-[#031d13]">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search store, owner, email..." 
              className="bg-transparent text-xs outline-none w-full text-[#031d13] placeholder-gray-400 font-medium"
            />
          </div>

        </div>
        
        {/* Table Content */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-xs font-bold flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading vendor records...</span>
          </div>
        ) : vendorsList.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs font-medium border border-dashed border-gray-200 rounded-2xl">
            No {statusFilter === 'ALL' ? '' : statusFilter.toLowerCase()} vendors found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase text-gray-500 font-bold">
                  <th className="px-4 py-3.5">Store & Owner</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Vendor Status</th>
                  <th className="px-4 py-3.5">Onboarding / Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendorsList.map((vendor) => {
                  const isSuspended = vendor.vendorStatus === 'SUSPENDED'
                  const isActive = vendor.vendorStatus === 'ACTIVE'

                  return (
                    <tr key={vendor._id} className={`transition-colors ${isSuspended ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-gray-50/50'}`}>
                      {/* Store & Owner */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                            isSuspended ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-[#FAF8F5] text-[#b89547] border-[#b89547]/20'
                          }`}>
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#031d13] text-xs flex items-center gap-1.5">
                              <span>{vendor.business?.storeName || 'Shop Name Pending'}</span>
                              {isSuspended && (
                                <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                                  Suspended
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-gray-500 font-bold mt-0.5">{vendor.fullName}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4 text-gray-600">
                        <p className="font-bold text-gray-800">{vendor.mobile}</p>
                        <p className="text-[10px] text-gray-400">{vendor.email}</p>
                      </td>

                      {/* Vendor Status Badge */}
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                          isSuspended 
                            ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                            : isActive 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {vendor.vendorStatus || 'INACTIVE'}
                        </span>
                      </td>

                      {/* Date Info */}
                      <td className="px-4 py-4 text-xs">
                        {isSuspended ? (
                          <div>
                            <span className="text-[10px] text-rose-600 font-bold block">Suspended On:</span>
                            <span className="text-rose-700 font-medium">{formatDate(vendor.suspendedAt || vendor.updatedAt)}</span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-[10px] text-gray-400 font-semibold block">Applied Date:</span>
                            <span className="text-gray-600 font-medium">{formatDate(vendor.submittedAt || vendor.createdAt)}</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* View Drawer Button */}
                          <button 
                            onClick={() => handleOpenEdit(vendor)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="View Vendor Details (Read Only)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Send Link Button */}
                          <button 
                            onClick={() => setSendLinkVendor(vendor)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Send Link to Vendor"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Link</span>
                          </button>

                          {/* Suspend / Reactivate Action Button */}
                          {isSuspended ? (
                            <button
                              onClick={() => handleToggleSuspend(vendor._id)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Reactivate Vendor Account"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Reactivate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleSuspend(vendor._id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1 transition-all cursor-pointer"
                              title="Suspend Vendor Account"
                            >
                              <Ban className="w-3.5 h-3.5 text-rose-600" />
                              <span>Suspend</span>
                            </button>
                          )}

                          {/* Review Button for Pending */}
                          {vendor.onboardingStatus !== 'APPROVED' && (
                            <button 
                              onClick={() => setSelectedVendor(vendor)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer shadow-xs"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Backend Pagination Bar (15 per page) */}
        {!loading && vendorsList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs">
            <p className="text-gray-500 font-medium">
              Showing <span className="font-bold text-[#031d13]">{(page - 1) * 15 + 1}</span> to{' '}
              <span className="font-bold text-[#031d13]">{Math.min(page * 15, pagination.totalVendors)}</span> of{' '}
              <span className="font-bold text-[#031d13]">{pagination.totalVendors}</span> vendors
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {getPageNumbers().map((pNum, idx) => (
                pNum === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 font-bold">...</span>
                ) : (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer ${
                      pNum === page
                        ? 'bg-[#031d13] text-[#FAF4E8] shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pNum}
                  </button>
                )
              ))}

              <button
                onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasNextPage}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Review Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-gray-200 text-left">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-[#031d13]">Vendor Application Review</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSendLinkVendor(selectedVendor)}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Send Link
                </button>
                <button 
                  onClick={() => handleOpenEdit(selectedVendor)}
                  className="px-3 py-2 border border-blue-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>
                <button onClick={() => setSelectedVendor(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-sm font-bold ml-2">Close</button>
              </div>
            </div>

            {selectedVendor.onboardingStatus !== 'UNDER_REVIEW' && selectedVendor.onboardingStatus !== 'DOCUMENTS_PENDING' && (
              <div className="mb-6 bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200 text-xs font-bold">
                ⚠️ This application is incomplete. Current stage: {selectedVendor.onboardingStatus.replace(/_/g, ' ')}.
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-[#b89547] border-b border-gray-100 pb-2 mb-3">Owner Details</h4>
                  <div className="text-xs text-gray-600 space-y-2">
                    <p><strong>Name:</strong> {selectedVendor.fullName || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedVendor.email || 'N/A'}</p>
                    <p><strong>Mobile:</strong> {selectedVendor.mobile || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#b89547] border-b border-gray-100 pb-2 mb-3">Business Details</h4>
                  <div className="text-xs text-gray-600 space-y-2">
                    <p><strong>Store Name:</strong> {selectedVendor.business?.storeName || 'Not Submitted'}</p>
                    <p><strong>Legal Name:</strong> {selectedVendor.business?.legalBusinessName || 'Not Submitted'}</p>
                    <p><strong>GST:</strong> {selectedVendor.business?.gstNumber || 'Not Submitted'}</p>
                    <p><strong>PAN:</strong> {selectedVendor.business?.panNumber || 'Not Submitted'}</p>
                    <p><strong>Address:</strong> {selectedVendor.business?.address ? `${selectedVendor.business.address.addressLine1}, ${selectedVendor.business.address.city}, ${selectedVendor.business.address.state} - ${selectedVendor.business.address.pincode}` : 'Not Submitted'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-[#b89547] border-b border-gray-100 pb-2 mb-3">Bank Information</h4>
                  <div className="text-xs text-gray-600 space-y-2">
                    <p><strong>Bank:</strong> {selectedVendor.bank?.bankName || 'Not Submitted'}</p>
                    <p><strong>A/C Holder:</strong> {selectedVendor.bank?.accountHolderName || 'Not Submitted'}</p>
                    <p><strong>Account:</strong> {selectedVendor.bank?.accountNumberLast4 ? `XXXXXX${selectedVendor.bank.accountNumberLast4}` : 'Not Submitted'}</p>
                    <p><strong>IFSC:</strong> {selectedVendor.bank?.ifscCode || 'Not Submitted'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#b89547] border-b border-gray-100 pb-2 mb-3">Uploaded Documents</h4>
                  <div className="text-xs text-gray-600 space-y-2">
                    {selectedVendor.documents?.length > 0 ? (
                      selectedVendor.documents.map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> {doc.documentType}</span>
                          <a href={doc.fileLocation.startsWith('http') ? doc.fileLocation : `http://localhost:5006/${doc.fileLocation.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" /> View
                          </a>
                        </div>
                      ))
                    ) : (
                      <p>No documents uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
              {selectedVendor.vendorStatus === 'SUSPENDED' ? (
                <button 
                  onClick={() => handleToggleSuspend(selectedVendor._id)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Reactivate Vendor Account
                </button>
              ) : selectedVendor.onboardingStatus !== 'APPROVED' ? (
                <>
                  <button 
                    onClick={() => handleReject(selectedVendor._id)}
                    className="px-6 py-2.5 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(selectedVendor._id)}
                    className="px-6 py-2.5 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Vendor
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleToggleSuspend(selectedVendor._id)}
                  className="px-6 py-2.5 border border-rose-200 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 cursor-pointer flex items-center gap-2 transition-colors"
                >
                  <Ban className="w-4 h-4 text-rose-600" /> Suspend Vendor Account
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* Vendor Details (View Only) Drawer */}
      <VendorEditDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false)
          setEditVendor(null)
        }}
        vendor={editVendor}
      />

      {/* Send Vendor Link Modal */}
      <SendVendorLinkModal
        isOpen={Boolean(sendLinkVendor)}
        onClose={() => setSendLinkVendor(null)}
        vendor={sendLinkVendor}
      />
    </div>
  )
}

export default Shops
