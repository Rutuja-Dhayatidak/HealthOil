import { useState, useEffect } from 'react'
import { Store, Search, ShieldCheck, CheckCircle, XCircle, FileText, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPendingVendors, getApprovedVendors, approveVendor, rejectVendor } from '../ApiServices/adminService'

function Shops() {
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingVendors, setPendingVendors] = useState([])
  const [approvedVendors, setApprovedVendors] = useState([])
  const [loading, setLoading] = useState(true)
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
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  const currentVendors = activeTab === 'pending' ? pendingVendors : approvedVendors;

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

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#031d13] tracking-tight">Partner Shops</h2>
        <p className="text-xs text-gray-500 mt-1">Review pending applications and manage approved vendors.</p>
      </div>

      <div className="bg-white border border-[#b89547]/20 rounded-2xl p-6 shadow-sm">
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-100 pb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
              activeTab === 'pending' 
                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' 
                : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-50'
            }`}
          >
            Pending Verification ({pendingVendors.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
              activeTab === 'approved' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' 
                : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-50'
            }`}
          >
            Approved Shops ({approvedVendors.length})
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500 text-xs">Loading applications...</div>
        ) : currentVendors.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-xs">No {activeTab} vendor applications at the moment.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase text-gray-500 font-bold">
                  <th className="px-4 py-3">Store & Owner</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applied Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentVendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#b89547]/20 flex items-center justify-center text-[#b89547] shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-[#031d13] text-xs">{vendor.business?.storeName || 'Shop Name Pending'}</p>
                          <p className="text-[10px] text-gray-500 font-bold">{vendor.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600">
                      <p>{vendor.mobile}</p>
                      <p className="text-[10px] text-gray-400">{vendor.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-bold ${
                        vendor.onboardingStatus === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' : 
                        vendor.onboardingStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {vendor.onboardingStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      {new Date(vendor.submittedAt || vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button 
                        onClick={() => setSelectedVendor(vendor)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 shadow-xl border border-[#b89547]/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-[#031d13]">Vendor Application Review</h3>
              <button onClick={() => setSelectedVendor(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-sm font-bold">Close</button>
            </div>

            {selectedVendor.onboardingStatus !== 'UNDER_REVIEW' && selectedVendor.onboardingStatus !== 'DOCUMENTS_PENDING' && (
              <div className="mb-6 bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200 text-xs font-bold">
                ⚠️ This application is incomplete. The vendor is currently at the stage: {selectedVendor.onboardingStatus.replace(/_/g, ' ')}. Some details may be missing.
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
                          <a href={doc.fileLocation.startsWith('http') ? doc.fileLocation : `http://localhost:5000/${doc.fileLocation.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
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

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
              {selectedVendor.onboardingStatus !== 'APPROVED' ? (
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
                    onClick={() => handleReject(selectedVendor._id)}
                    className="px-6 py-2.5 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Suspend Vendor
                  </button>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}

export default Shops
