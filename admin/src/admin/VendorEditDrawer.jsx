import { useState, useEffect, useRef } from 'react'
import { X, User, Building2, Landmark, MapPin, Store, ChevronDown, ChevronUp, Lock, Shield, Eye } from 'lucide-react'
import gsap from 'gsap'

const SectionHeader = ({ icon: Icon, title, subtitle, isOpen, onToggle, accentColor = '#0b3b84' }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between py-3.5 cursor-pointer group transition-all"
  >
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105"
        style={{ background: `${accentColor}15`, border: `1.5px solid ${accentColor}30` }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: accentColor }} />
      </div>
      <div className="text-left">
        <h4 className="text-[13px] font-bold text-[#1a2b23] leading-tight">{title}</h4>
        {subtitle && <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{subtitle}</p>}
      </div>
    </div>
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-gray-100' : 'bg-gray-50'} group-hover:bg-gray-100`}>
      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </div>
  </button>
)

const FieldLabel = ({ children }) => (
  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{children}</label>
)

const InputField = ({ label, value, placeholder, type = 'text' }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <input
      type={type}
      value={value || ''}
      readOnly
      disabled
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
    />
  </div>
)

export default function VendorEditDrawer({ isOpen, onClose, vendor }) {
  const drawerRef = useRef(null)
  const backdropRef = useRef(null)

  const [openSections, setOpenSections] = useState({
    personal: true,
    business: true,
    bank: true,
    pickup: false,
    store: false,
    status: true
  })

  useEffect(() => {
    if (vendor) {
      setOpenSections({ personal: true, business: true, bank: true, pickup: false, store: false, status: true })
    }
  }, [vendor])

  useEffect(() => {
    if (isOpen) {
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out', display: 'block' })
      gsap.to(drawerRef.current, { x: '0%', duration: 0.45, ease: 'power3.out' })
    } else {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => gsap.set(backdropRef.current, { display: 'none' }) })
      gsap.to(drawerRef.current, { x: '100%', duration: 0.3, ease: 'power3.in' })
    }
  }, [isOpen])

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const vendorStatusConfig = {
    ACTIVE: { label: 'Active', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    INACTIVE: { label: 'Inactive', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
    SUSPENDED: { label: 'Suspended', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' }
  }

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[110]"
        style={{ opacity: 0, display: 'none' }}
        onClick={onClose}
      />

      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.12)] z-[120] flex flex-col translate-x-full"
        style={{ borderLeft: '1px solid #e5e7eb' }}
      >
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-[#0b3b84] to-[#0a2f6b] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <Eye className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-[17px] text-white tracking-tight leading-tight">Vendor Details (View Only)</h3>
                <p className="text-[11px] text-blue-200/80 mt-0.5 truncate max-w-[300px] font-medium">
                  {vendor?.business?.storeName || vendor?.fullName || 'Vendor Profile'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all cursor-pointer">
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>

        {vendor && (
          <div className="flex-1 overflow-y-auto flex flex-col min-h-0 text-left">
            <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

              {/* View Only Warning Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-semibold text-amber-800 flex items-start gap-3 shadow-2xs">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">Read-Only Permission Enforced</p>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    Admins are not permitted to edit vendor profile details. Vendor profile editing is restricted to the vendor via the Vendor Panel.
                  </p>
                </div>
              </div>

              {/* ===== Personal Info ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-5 pt-2">
                  <SectionHeader icon={User} title="Personal Info" subtitle="Owner name, email, mobile" isOpen={openSections.personal} onToggle={() => toggleSection('personal')} accentColor="#0b3b84" />
                </div>
                {openSections.personal && (
                  <div className="px-5 pb-5 space-y-3.5 border-t border-gray-100 pt-4">
                    <InputField label="Full Name" value={vendor.fullName} placeholder="Owner full name" />
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Email" value={vendor.email} placeholder="email@example.com" type="email" />
                      <InputField label="Mobile" value={vendor.mobile} placeholder="9876543210" />
                    </div>
                  </div>
                )}
              </div>

              {/* ===== Business Details ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-5 pt-2">
                  <SectionHeader icon={Building2} title="Business Details" subtitle="Store name, GST, PAN, address" isOpen={openSections.business} onToggle={() => toggleSection('business')} accentColor="#059669" />
                </div>
                {openSections.business && (
                  <div className="px-5 pb-5 space-y-3.5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Store Name" value={vendor.business?.storeName} placeholder="Store name" />
                      <InputField label="Legal Business Name" value={vendor.business?.legalBusinessName} placeholder="Legal name" />
                    </div>
                    <div className="grid grid-cols-3 gap-3.5">
                      <InputField label="Business Type" value={vendor.business?.businessType} placeholder="e.g. Proprietorship" />
                      <InputField label="GST Number" value={vendor.business?.gstNumber} placeholder="GST number" />
                      <InputField label="PAN Number" value={vendor.business?.panNumber} placeholder="PAN number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Business Email" value={vendor.business?.businessEmail} placeholder="Business email" />
                      <InputField label="Business Phone" value={vendor.business?.businessPhone} placeholder="Business phone" />
                    </div>
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Business Address</p>
                      <div className="space-y-3">
                        <InputField label="Address Line 1" value={vendor.business?.address?.addressLine1} placeholder="Street address" />
                        <InputField label="Address Line 2" value={vendor.business?.address?.addressLine2} placeholder="Apartment, suite, etc." />
                        <div className="grid grid-cols-3 gap-3.5">
                          <InputField label="City" value={vendor.business?.address?.city} placeholder="City" />
                          <InputField label="State" value={vendor.business?.address?.state} placeholder="State" />
                          <InputField label="Pincode" value={vendor.business?.address?.pincode} placeholder="Pincode" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ===== Bank Details ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-5 pt-2">
                  <SectionHeader icon={Landmark} title="Bank Details" subtitle="Account holder, bank name, IFSC" isOpen={openSections.bank} onToggle={() => toggleSection('bank')} accentColor="#8b5cf6" />
                </div>
                {openSections.bank && (
                  <div className="px-5 pb-5 space-y-3.5 border-t border-gray-100 pt-4">
                    <InputField label="Account Holder Name" value={vendor.bank?.accountHolderName} placeholder="Account holder name" />
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Bank Name" value={vendor.bank?.bankName} placeholder="e.g. SBI, HDFC" />
                      <InputField label="Account Number" value={vendor.bank?.accountNumber} placeholder="Account number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="IFSC Code" value={vendor.bank?.ifscCode} placeholder="e.g. SBIN0001234" />
                      <InputField label="Account Type" value={vendor.bank?.accountType} placeholder="Savings / Current" />
                    </div>
                  </div>
                )}
              </div>

              {/* ===== Pickup Address ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-5 pt-2">
                  <SectionHeader icon={MapPin} title="Pickup Address" subtitle="Pickup contact & address" isOpen={openSections.pickup} onToggle={() => toggleSection('pickup')} accentColor="#f59e0b" />
                </div>
                {openSections.pickup && (
                  <div className="px-5 pb-5 space-y-3.5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Contact Name" value={vendor.pickupAddress?.contactName} placeholder="Contact person" />
                      <InputField label="Mobile" value={vendor.pickupAddress?.mobile} placeholder="Mobile number" />
                    </div>
                    <InputField label="Address Line 1" value={vendor.pickupAddress?.addressLine1} placeholder="Street address" />
                    <InputField label="Address Line 2" value={vendor.pickupAddress?.addressLine2} placeholder="Apartment, suite, etc." />
                    <div className="grid grid-cols-3 gap-3.5">
                      <InputField label="City" value={vendor.pickupAddress?.city} placeholder="City" />
                      <InputField label="State" value={vendor.pickupAddress?.state} placeholder="State" />
                      <InputField label="Pincode" value={vendor.pickupAddress?.pincode} placeholder="Pincode" />
                    </div>
                  </div>
                )}
              </div>

              {/* ===== Store Profile ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-5 pt-2">
                  <SectionHeader icon={Store} title="Store Profile" subtitle="Description, category, timings" isOpen={openSections.store} onToggle={() => toggleSection('store')} accentColor="#ec4899" />
                </div>
                {openSections.store && (
                  <div className="px-5 pb-5 space-y-3.5 border-t border-gray-100 pt-4">
                    <div>
                      <FieldLabel>Store Description</FieldLabel>
                      <textarea
                        rows={3}
                        value={vendor.storeProfile?.description || ''}
                        readOnly
                        disabled
                        placeholder="No description provided..."
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none bg-gray-50 text-gray-700 font-semibold cursor-not-allowed resize-none"
                      />
                    </div>
                    <InputField label="Business Category" value={vendor.storeProfile?.businessCategory} placeholder="e.g. Cooking Oils" />
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Open Time" value={vendor.storeProfile?.openTime} placeholder="e.g. 09:00 AM" />
                      <InputField label="Close Time" value={vendor.storeProfile?.closeTime} placeholder="e.g. 09:00 PM" />
                    </div>
                  </div>
                )}
              </div>

              {/* ===== Status ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 space-y-4">
                <div>
                  <FieldLabel>Vendor Status</FieldLabel>
                  <div className="mt-1">
                    <span className="inline-block px-3 py-1 rounded-xl border font-bold text-xs" style={{
                      borderColor: vendorStatusConfig[vendor.vendorStatus]?.color || '#e5e7eb',
                      backgroundColor: vendorStatusConfig[vendor.vendorStatus]?.bg || '#f9fafb',
                      color: vendorStatusConfig[vendor.vendorStatus]?.color || '#374151'
                    }}>
                      {vendorStatusConfig[vendor.vendorStatus]?.label || vendor.vendorStatus}
                    </span>
                  </div>
                </div>

                <div>
                  <FieldLabel>Onboarding Status</FieldLabel>
                  <div className="mt-1">
                    <span className="inline-block px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">
                      {vendor.onboardingStatus?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-2" />
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-4 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-[13px] transition-all cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
