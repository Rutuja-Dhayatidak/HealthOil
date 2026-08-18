import { useState, useEffect } from 'react'
import { FileCheck, Search, ShieldCheck, CheckCircle, XCircle, FileText, Download, Building2, User, Phone, Mail, MapPin, CreditCard, AlertTriangle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPendingVendors, getApprovedVendors, approveVendor, rejectVendor } from '../ApiServices/adminService'

function VendorVerification({ refreshStats }) {
  const [activeFilter, setActiveFilter] = useState('ALL_PENDING')
  const [pendingVendors, setPendingVendors] = useState([])
  const [approvedVendors, setApprovedVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVendor, setSelectedVendor] = useState(null)
  
  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const [pendingRes, approvedRes] = await Promise.all([
        getPendingVendors(),
        getApprovedVendors()
      ])
      setPendingVendors(pendingRes.vendors || [])
      setApprovedVendors(approvedRes.vendors || [])
    } catch (err) {
      toast.error('Failed to load vendor applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this vendor for selling on HealthOil?")) return;
    try {
      await approveVendor(id)
      toast.success("Vendor Approved Successfully!")
      setSelectedVendor(null)
      fetchVendors()
      if (refreshStats) refreshStats()
    } catch (error) {
      toast.error("Vendor approval failed")
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection reason for vendor notification:")
    if (reason === null) return; // User cancelled
    try {
      await rejectVendor(id, reason || 'Document verification failed')
      toast.error("Vendor Application Rejected")
      setSelectedVendor(null)
      fetchVendors()
      if (refreshStats) refreshStats()
    } catch (error) {
      toast.error("Vendor rejection failed")
    }
  }

  // Filter vendors based on status and search query
  const filteredVendors = pendingVendors.filter(vendor => {
    const matchesSearch = 
      (vendor.business?.storeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.mobile || '').includes(searchTerm)

    if (!matchesSearch) return false

    if (activeFilter === 'UNDER_REVIEW') return vendor.onboardingStatus === 'UNDER_REVIEW'
    if (activeFilter === 'DOCUMENTS_PENDING') return vendor.onboardingStatus === 'DOCUMENTS_PENDING'
    return true // ALL_PENDING
  })

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#031d13] tracking-tight flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-blue-600" />
            Vendor Verification & Approval
          </h2>
          <p className="text-xs text-gray-500 mt-1">Review onboarded vendor documents, store information, and approve partner accounts.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pending Approval: {pendingVendors.length}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Verified Vendors: {approvedVendors.length}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 w-full sm:w-80 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search store name, owner, email, phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs outline-none w-full text-gray-800 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveFilter('ALL_PENDING')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'ALL_PENDING'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Pending ({pendingVendors.length})
            </button>
            <button
              onClick={() => setActiveFilter('UNDER_REVIEW')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'UNDER_REVIEW'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ready for Review ({pendingVendors.filter(v => v.onboardingStatus === 'UNDER_REVIEW').length})
            </button>
            <button
              onClick={() => setActiveFilter('DOCUMENTS_PENDING')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'DOCUMENTS_PENDING'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Incomplete ({pendingVendors.filter(v => v.onboardingStatus === 'DOCUMENTS_PENDING').length})
            </button>
          </div>
        </div>

        {/* Vendors Table */}
        {loading ? (
          <div className="py-16 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Loading pending vendor verification requests...
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 opacity-60" />
            <p className="font-semibold text-gray-700">No pending vendor applications matching your filter.</p>
            <p className="text-[11px] text-gray-400">All vendor verification applications have been reviewed!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase text-gray-500 font-bold tracking-wider">
                  <th className="px-4 py-3.5">Store & Owner</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Uploaded Docs</th>
                  <th className="px-4 py-3.5">Verification Status</th>
                  <th className="px-4 py-3.5">Submission Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredVendors.map((vendor) => {
                  const docCount = vendor.documents?.length || 0
                  return (
                    <tr key={vendor._id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold">
                            {vendor.storeProfile?.logo ? (
                              <img src={vendor.storeProfile.logo} alt="Logo" className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              <Building2 className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{vendor.business?.storeName || 'Store Name Not Set'}</p>
                            <p className="text-[11px] text-gray-500 font-medium">{vendor.fullName}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-gray-600 space-y-0.5">
                        <p className="flex items-center gap-1.5 text-gray-800 font-medium">
                          <Phone className="w-3 h-3 text-gray-400" /> {vendor.mobile}
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          <Mail className="w-3 h-3 text-gray-400" /> {vendor.email}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                          docCount > 0 ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <FileText className="w-3 h-3" />
                          {docCount} Documents
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          vendor.onboardingStatus === 'UNDER_REVIEW' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {vendor.onboardingStatus.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-500 text-[11px]">
                        {new Date(vendor.submittedAt || vendor.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedVendor(vendor)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review Application
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive Application Review Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-gray-900">Vendor Verification Application</h3>
                  <p className="text-xs text-gray-500">Submitted by {selectedVendor.fullName} ({selectedVendor.email})</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVendor(null)} 
                className="text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8 flex-1">
              
              {/* Warning notice if incomplete */}
              {selectedVendor.onboardingStatus !== 'UNDER_REVIEW' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800 text-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold mb-0.5">Incomplete Application Notice</h5>
                    <p>This vendor has not fully completed all onboarding steps yet. Current Stage: <span className="font-bold">{selectedVendor.onboardingStatus}</span>.</p>
                  </div>
                </div>
              )}

              {/* Grid 1: Personal & Store Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Personal Details */}
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Owner Contact Info
                  </h4>
                  <div className="text-xs text-gray-700 space-y-2">
                    <p><strong className="text-gray-500">Full Name:</strong> {selectedVendor.fullName || 'N/A'}</p>
                    <p><strong className="text-gray-500">Email Address:</strong> {selectedVendor.email || 'N/A'}</p>
                    <p><strong className="text-gray-500">Mobile Phone:</strong> {selectedVendor.mobile || 'N/A'}</p>
                    <p><strong className="text-gray-500">Vendor Status:</strong> <span className="font-bold text-blue-600">{selectedVendor.vendorStatus}</span></p>
                  </div>
                </div>

                {/* Business Details */}
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> Business Details
                  </h4>
                  <div className="text-xs text-gray-700 space-y-2">
                    <p><strong className="text-gray-500">Store Name:</strong> {selectedVendor.business?.storeName || 'N/A'}</p>
                    <p><strong className="text-gray-500">Legal Business:</strong> {selectedVendor.business?.legalBusinessName || 'N/A'}</p>
                    <p><strong className="text-gray-500">Business Type:</strong> {selectedVendor.business?.businessType || 'N/A'}</p>
                    <p><strong className="text-gray-500">GST Number:</strong> <span className="font-mono font-bold text-gray-800">{selectedVendor.business?.gstNumber || 'N/A'}</span></p>
                    <p><strong className="text-gray-500">PAN Number:</strong> <span className="font-mono font-bold text-gray-800">{selectedVendor.business?.panNumber || 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Grid 2: Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Store Address */}
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Registered Business Address
                  </h4>
                  <div className="text-xs text-gray-700">
                    {selectedVendor.business?.address ? (
                      <p className="leading-relaxed">
                        {selectedVendor.business.address.addressLine1}, {selectedVendor.business.address.addressLine2 && `${selectedVendor.business.address.addressLine2}, `}
                        {selectedVendor.business.address.city}, {selectedVendor.business.address.state} - <strong>{selectedVendor.business.address.pincode}</strong>
                      </p>
                    ) : (
                      <p className="text-gray-400">Address details not provided yet.</p>
                    )}
                  </div>
                </div>

                {/* Pickup Address */}
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Warehouse Pickup Address
                  </h4>
                  <div className="text-xs text-gray-700">
                    {selectedVendor.pickupAddress ? (
                      <div className="space-y-1">
                        <p><strong>Contact:</strong> {selectedVendor.pickupAddress.contactName} ({selectedVendor.pickupAddress.mobile})</p>
                        <p className="leading-relaxed">
                          {selectedVendor.pickupAddress.addressLine1}, {selectedVendor.pickupAddress.city}, {selectedVendor.pickupAddress.state} - {selectedVendor.pickupAddress.pincode}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-400">Pickup address details not provided yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid 3: Bank Information */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Payout Bank Account Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-700">
                  <div>
                    <p className="text-gray-400">Bank Name</p>
                    <p className="font-bold">{selectedVendor.bank?.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Account Holder</p>
                    <p className="font-bold">{selectedVendor.bank?.accountHolderName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Account Number</p>
                    <p className="font-mono font-bold">{selectedVendor.bank?.accountNumber || (selectedVendor.bank?.accountNumberLast4 ? `XXXX${selectedVendor.bank.accountNumberLast4}` : 'N/A')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">IFSC Code</p>
                    <p className="font-mono font-bold text-blue-600">{selectedVendor.bank?.ifscCode || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Grid 4: Uploaded Verification Documents */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Verification Documents ({selectedVendor.documents?.length || 0})
                </h4>
                {selectedVendor.documents?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedVendor.documents.map((doc, idx) => {
                      const fileUrl = doc.fileLocation.startsWith('http') 
                        ? doc.fileLocation 
                        : `http://localhost:5000/${doc.fileLocation.replace(/\\/g, '/')}`
                      
                      return (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-gray-800">{doc.documentType.replace(/_/g, ' ')}</p>
                              <p className="text-[10px] text-gray-400">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" /> View
                          </a>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-400 text-center">
                    No documents uploaded for verification yet.
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-3xl sticky bottom-0 z-10">
              <button 
                onClick={() => setSelectedVendor(null)}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              
              <button 
                onClick={() => handleReject(selectedVendor._id)}
                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Reject Application
              </button>

              <button 
                onClick={() => handleApprove(selectedVendor._id)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" /> Approve Vendor Account
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default VendorVerification
