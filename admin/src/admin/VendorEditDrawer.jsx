import { useState, useEffect, useRef } from 'react'
import { X, User, Building2, Landmark, MapPin, Store, Save, Loader2, ChevronDown, ChevronUp, Sparkles, Shield } from 'lucide-react'
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

const InputField = ({ label, value, onChange, placeholder, type = 'text', disabled }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0b3b84] focus:ring-2 focus:ring-[#0b3b84]/10 transition-all bg-white placeholder-gray-300 disabled:bg-gray-50 disabled:text-gray-400"
    />
  </div>
)

export default function VendorEditDrawer({ isOpen, onClose, vendor, onSave, isLoading }) {
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

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    vendorStatus: 'INACTIVE',
    onboardingStatus: 'CONTACT_VERIFICATION_PENDING',
    business: {
      storeName: '', legalBusinessName: '', businessType: '', gstNumber: '', panNumber: '',
      businessEmail: '', businessPhone: '',
      address: { addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '' }
    },
    bank: {
      accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', accountType: ''
    },
    pickupAddress: {
      contactName: '', mobile: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: ''
    },
    storeProfile: {
      description: '', businessCategory: '', openTime: '', closeTime: ''
    }
  })

  useEffect(() => {
    if (vendor) {
      setForm({
        fullName: vendor.fullName || '',
        email: vendor.email || '',
        mobile: vendor.mobile || '',
        vendorStatus: vendor.vendorStatus || 'INACTIVE',
        onboardingStatus: vendor.onboardingStatus || 'CONTACT_VERIFICATION_PENDING',
        business: {
          storeName: vendor.business?.storeName || '',
          legalBusinessName: vendor.business?.legalBusinessName || '',
          businessType: vendor.business?.businessType || '',
          gstNumber: vendor.business?.gstNumber || '',
          panNumber: vendor.business?.panNumber || '',
          businessEmail: vendor.business?.businessEmail || '',
          businessPhone: vendor.business?.businessPhone || '',
          address: {
            addressLine1: vendor.business?.address?.addressLine1 || '',
            addressLine2: vendor.business?.address?.addressLine2 || '',
            landmark: vendor.business?.address?.landmark || '',
            city: vendor.business?.address?.city || '',
            state: vendor.business?.address?.state || '',
            pincode: vendor.business?.address?.pincode || ''
          }
        },
        bank: {
          accountHolderName: vendor.bank?.accountHolderName || '',
          bankName: vendor.bank?.bankName || '',
          accountNumber: vendor.bank?.accountNumber || '',
          ifscCode: vendor.bank?.ifscCode || '',
          accountType: vendor.bank?.accountType || ''
        },
        pickupAddress: {
          contactName: vendor.pickupAddress?.contactName || '',
          mobile: vendor.pickupAddress?.mobile || '',
          addressLine1: vendor.pickupAddress?.addressLine1 || '',
          addressLine2: vendor.pickupAddress?.addressLine2 || '',
          landmark: vendor.pickupAddress?.landmark || '',
          city: vendor.pickupAddress?.city || '',
          state: vendor.pickupAddress?.state || '',
          pincode: vendor.pickupAddress?.pincode || ''
        },
        storeProfile: {
          description: vendor.storeProfile?.description || '',
          businessCategory: vendor.storeProfile?.businessCategory || '',
          openTime: vendor.storeProfile?.openTime || '',
          closeTime: vendor.storeProfile?.closeTime || ''
        }
      })
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

  const updateField = (path, value) => {
    setForm(prev => {
      const parts = path.split('.')
      const newForm = JSON.parse(JSON.stringify(prev))
      let target = newForm
      for (let i = 0; i < parts.length - 1; i++) {
        target = target[parts[i]]
      }
      target[parts[parts.length - 1]] = value
      return newForm
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLoading) return
    onSave(vendor._id, form)
  }

  const vendorStatusConfig = {
    ACTIVE: { label: 'Active', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    INACTIVE: { label: 'Inactive', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
    SUSPENDED: { label: 'Suspended', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' }
  }

  const onboardingOptions = [
    { value: 'CONTACT_VERIFICATION_PENDING', label: 'Contact Verification Pending' },
    { value: 'OTP_VERIFIED', label: 'OTP Verified' },
    { value: 'BUSINESS_DETAILS_PENDING', label: 'Business Details Pending' },
    { value: 'DOCUMENTS_PENDING', label: 'Documents Pending' },
    { value: 'PICKUP_DETAILS_PENDING', label: 'Pickup Details Pending' },
    { value: 'BANK_DETAILS_PENDING', label: 'Bank Details Pending' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' }
  ]

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
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-[17px] text-white tracking-tight leading-tight">Edit Vendor</h3>
                <p className="text-[11px] text-blue-200/80 mt-0.5 truncate max-w-[300px] font-medium">
                  {vendor?.business?.storeName || vendor?.fullName || 'Vendor'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all cursor-pointer">
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>

        {vendor && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

              {/* ===== Personal Info ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-5 pt-2">
                  <SectionHeader icon={User} title="Personal Info" subtitle="Owner name, email, mobile" isOpen={openSections.personal} onToggle={() => toggleSection('personal')} accentColor="#0b3b84" />
                </div>
                {openSections.personal && (
                  <div className="px-5 pb-5 space-y-3.5 border-t border-gray-100 pt-4">
                    <InputField label="Full Name" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="Owner full name" />
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="email@example.com" type="email" />
                      <InputField label="Mobile" value={form.mobile} onChange={(e) => updateField('mobile', e.target.value)} placeholder="9876543210" />
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
                      <InputField label="Store Name" value={form.business.storeName} onChange={(e) => updateField('business.storeName', e.target.value)} placeholder="Store name" />
                      <InputField label="Legal Business Name" value={form.business.legalBusinessName} onChange={(e) => updateField('business.legalBusinessName', e.target.value)} placeholder="Legal name" />
                    </div>
                    <div className="grid grid-cols-3 gap-3.5">
                      <InputField label="Business Type" value={form.business.businessType} onChange={(e) => updateField('business.businessType', e.target.value)} placeholder="e.g. Proprietorship" />
                      <InputField label="GST Number" value={form.business.gstNumber} onChange={(e) => updateField('business.gstNumber', e.target.value)} placeholder="GST number" />
                      <InputField label="PAN Number" value={form.business.panNumber} onChange={(e) => updateField('business.panNumber', e.target.value)} placeholder="PAN number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Business Email" value={form.business.businessEmail} onChange={(e) => updateField('business.businessEmail', e.target.value)} placeholder="Business email" />
                      <InputField label="Business Phone" value={form.business.businessPhone} onChange={(e) => updateField('business.businessPhone', e.target.value)} placeholder="Business phone" />
                    </div>
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Business Address</p>
                      <div className="space-y-3">
                        <InputField label="Address Line 1" value={form.business.address.addressLine1} onChange={(e) => updateField('business.address.addressLine1', e.target.value)} placeholder="Street address" />
                        <InputField label="Address Line 2" value={form.business.address.addressLine2} onChange={(e) => updateField('business.address.addressLine2', e.target.value)} placeholder="Apartment, suite, etc." />
                        <div className="grid grid-cols-3 gap-3.5">
                          <InputField label="City" value={form.business.address.city} onChange={(e) => updateField('business.address.city', e.target.value)} placeholder="City" />
                          <InputField label="State" value={form.business.address.state} onChange={(e) => updateField('business.address.state', e.target.value)} placeholder="State" />
                          <InputField label="Pincode" value={form.business.address.pincode} onChange={(e) => updateField('business.address.pincode', e.target.value)} placeholder="Pincode" />
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
                    <InputField label="Account Holder Name" value={form.bank.accountHolderName} onChange={(e) => updateField('bank.accountHolderName', e.target.value)} placeholder="Account holder name" />
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Bank Name" value={form.bank.bankName} onChange={(e) => updateField('bank.bankName', e.target.value)} placeholder="e.g. SBI, HDFC" />
                      <InputField label="Account Number" value={form.bank.accountNumber} onChange={(e) => updateField('bank.accountNumber', e.target.value)} placeholder="Account number" />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="IFSC Code" value={form.bank.ifscCode} onChange={(e) => updateField('bank.ifscCode', e.target.value)} placeholder="e.g. SBIN0001234" />
                      <div>
                        <FieldLabel>Account Type</FieldLabel>
                        <select
                          value={form.bank.accountType}
                          onChange={(e) => updateField('bank.accountType', e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0b3b84] bg-white font-medium cursor-pointer"
                        >
                          <option value="">Select</option>
                          <option value="Savings">Savings</option>
                          <option value="Current">Current</option>
                        </select>
                      </div>
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
                      <InputField label="Contact Name" value={form.pickupAddress.contactName} onChange={(e) => updateField('pickupAddress.contactName', e.target.value)} placeholder="Contact person" />
                      <InputField label="Mobile" value={form.pickupAddress.mobile} onChange={(e) => updateField('pickupAddress.mobile', e.target.value)} placeholder="Mobile number" />
                    </div>
                    <InputField label="Address Line 1" value={form.pickupAddress.addressLine1} onChange={(e) => updateField('pickupAddress.addressLine1', e.target.value)} placeholder="Street address" />
                    <InputField label="Address Line 2" value={form.pickupAddress.addressLine2} onChange={(e) => updateField('pickupAddress.addressLine2', e.target.value)} placeholder="Apartment, suite, etc." />
                    <div className="grid grid-cols-3 gap-3.5">
                      <InputField label="City" value={form.pickupAddress.city} onChange={(e) => updateField('pickupAddress.city', e.target.value)} placeholder="City" />
                      <InputField label="State" value={form.pickupAddress.state} onChange={(e) => updateField('pickupAddress.state', e.target.value)} placeholder="State" />
                      <InputField label="Pincode" value={form.pickupAddress.pincode} onChange={(e) => updateField('pickupAddress.pincode', e.target.value)} placeholder="Pincode" />
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
                        value={form.storeProfile.description}
                        onChange={(e) => updateField('storeProfile.description', e.target.value)}
                        placeholder="Store description..."
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0b3b84] focus:ring-2 focus:ring-[#0b3b84]/10 transition-all bg-white placeholder-gray-300 resize-none"
                      />
                    </div>
                    <InputField label="Business Category" value={form.storeProfile.businessCategory} onChange={(e) => updateField('storeProfile.businessCategory', e.target.value)} placeholder="e.g. Cooking Oils" />
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Open Time" value={form.storeProfile.openTime} onChange={(e) => updateField('storeProfile.openTime', e.target.value)} placeholder="e.g. 09:00 AM" />
                      <InputField label="Close Time" value={form.storeProfile.closeTime} onChange={(e) => updateField('storeProfile.closeTime', e.target.value)} placeholder="e.g. 09:00 PM" />
                    </div>
                  </div>
                )}
              </div>

              {/* ===== Status ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 space-y-4">
                <div>
                  <FieldLabel>Vendor Status</FieldLabel>
                  <div className="grid grid-cols-3 gap-2.5 mt-1">
                    {Object.entries(vendorStatusConfig).map(([key, cfg]) => (
                      <button
                        type="button"
                        key={key}
                        onClick={() => updateField('vendorStatus', key)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all cursor-pointer"
                        style={{
                          borderColor: form.vendorStatus === key ? cfg.color : '#e5e7eb',
                          backgroundColor: form.vendorStatus === key ? cfg.bg : '#ffffff',
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border-2"
                          style={{
                            borderColor: form.vendorStatus === key ? cfg.color : '#d1d5db',
                            backgroundColor: form.vendorStatus === key ? cfg.color : 'transparent',
                            boxShadow: form.vendorStatus === key ? `0 0 0 3px ${cfg.color}20` : 'none'
                          }}
                        />
                        <span className="text-[12px] font-semibold" style={{ color: form.vendorStatus === key ? cfg.color : '#9ca3af' }}>
                          {cfg.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Onboarding Status</FieldLabel>
                  <select
                    value={form.onboardingStatus}
                    onChange={(e) => updateField('onboardingStatus', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0b3b84] bg-white font-medium cursor-pointer"
                  >
                    {onboardingOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="h-2" />
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-4 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-semibold text-[13px] transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-7 py-2.5 bg-gradient-to-r from-[#0b3b84] to-[#0a2f6b] text-white rounded-xl font-bold text-[13px] hover:from-[#0a2f6b] hover:to-[#082660] transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-blue-900/20 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save All Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
