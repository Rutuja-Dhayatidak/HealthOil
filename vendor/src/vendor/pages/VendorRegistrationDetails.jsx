import { useState, useEffect } from 'react'
import { 
  UserCheck, 
  Building, 
  CreditCard, 
  MapPin, 
  ShieldCheck, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Store,
  Mail,
  Phone,
  User,
  Hash,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getVendorRegistrationDetails, updateVendorRegistrationDetails, getActiveCitiesApi } from '../../ApiServices/vendorAuthService'
import { useNavigate } from 'react-router-dom'

export default function VendorRegistrationDetails() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('BASIC')
  const [activeCities, setActiveCities] = useState([])

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    onboardingStatus: '',
    vendorStatus: '',
    business: {
      storeName: '',
      legalBusinessName: '',
      businessType: 'Sole Proprietorship',
      gstNumber: '',
      panNumber: '',
      businessEmail: '',
      businessPhone: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        subCity: '',
        city: '',
        state: '',
        pincode: ''
      }
    },
    bank: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'Current'
    },
    pickupAddress: {
      contactName: '',
      mobile: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      subCity: '',
      city: '',
      state: '',
      pincode: ''
    }
  })

  // Fetch Vendor registration info
  const fetchDetails = async () => {
    try {
      setLoading(true)
      const [res, citiesRes] = await Promise.allSettled([
        getVendorRegistrationDetails(),
        getActiveCitiesApi()
      ])

      if (citiesRes.status === 'fulfilled' && citiesRes.value?.success) {
        setActiveCities(citiesRes.value.cities || [])
      }

      if (res.status === 'fulfilled' && res.value?.success && res.value?.vendor) {
        const v = res.value.vendor
        setFormData({
          fullName: v.fullName || '',
          email: v.email || '',
          mobile: v.mobile || '',
          onboardingStatus: v.onboardingStatus || 'APPROVED',
          vendorStatus: v.vendorStatus || 'ACTIVE',
          business: {
            storeName: v.business?.storeName || '',
            legalBusinessName: v.business?.legalBusinessName || '',
            businessType: v.business?.businessType || 'Sole Proprietorship',
            gstNumber: v.business?.gstNumber || '',
            panNumber: v.business?.panNumber || '',
            businessEmail: v.business?.businessEmail || v.email || '',
            businessPhone: v.business?.businessPhone || v.mobile || '',
            address: {
              addressLine1: v.business?.address?.addressLine1 || '',
              addressLine2: v.business?.address?.addressLine2 || '',
              landmark: v.business?.address?.landmark || '',
              subCity: v.business?.address?.subCity || '',
              city: v.business?.address?.city || '',
              state: v.business?.address?.state || '',
              pincode: v.business?.address?.pincode || ''
            }
          },
          bank: {
            accountHolderName: v.bank?.accountHolderName || '',
            bankName: v.bank?.bankName || '',
            accountNumber: v.bank?.accountNumber || '',
            ifscCode: v.bank?.ifscCode || '',
            accountType: v.bank?.accountType || 'Current'
          },
          pickupAddress: {
            contactName: v.pickupAddress?.contactName || v.fullName || '',
            mobile: v.pickupAddress?.mobile || v.mobile || '',
            addressLine1: v.pickupAddress?.addressLine1 || '',
            addressLine2: v.pickupAddress?.addressLine2 || '',
            landmark: v.pickupAddress?.landmark || '',
            subCity: v.pickupAddress?.subCity || '',
            city: v.pickupAddress?.city || '',
            state: v.pickupAddress?.state || '',
            pincode: v.pickupAddress?.pincode || ''
          }
        })
      }
    } catch (err) {
      console.error('Failed to load registration details', err)
      toast.error('Failed to fetch registration details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [])

  // Nested form change handlers
  const handleBasicChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }))
  }

  const handleBusinessChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      business: { ...prev.business, [field]: val }
    }))
  }

  const handleBusinessAddressChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      business: {
        ...prev.business,
        address: { ...prev.business.address, [field]: val }
      }
    }))
  }

  const handleBankChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      bank: { ...prev.bank, [field]: val }
    }))
  }

  const handlePickupChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      pickupAddress: { ...prev.pickupAddress, [field]: val }
    }))
  }

  const handleCopyBusinessToPickup = () => {
    setFormData(prev => ({
      ...prev,
      pickupAddress: {
        contactName: prev.fullName || prev.pickupAddress.contactName,
        mobile: prev.mobile || prev.pickupAddress.mobile,
        addressLine1: prev.business.address.addressLine1 || '',
        addressLine2: prev.business.address.addressLine2 || '',
        landmark: prev.business.address.landmark || '',
        city: prev.business.address.city || '',
        state: prev.business.address.state || '',
        pincode: prev.business.address.pincode || ''
      }
    }))
    toast.success('Business address copied to pickup location!')
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    if (!formData.fullName.trim()) return toast.error('Owner Name is required')
    if (!formData.email.trim()) return toast.error('Email is required')
    if (!formData.mobile.trim()) return toast.error('Mobile number is required')

    try {
      setSaving(true)
      const res = await updateVendorRegistrationDetails({
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        business: formData.business,
        bank: formData.bank,
        pickupAddress: formData.pickupAddress
      })

      if (res.success) {
        toast.success('Registration details updated successfully!')
        // Update local storage vendor name if updated
        try {
          const stored = localStorage.getItem('vendorData')
          if (stored) {
            const parsed = JSON.parse(stored)
            parsed.fullName = formData.fullName
            parsed.email = formData.email
            localStorage.setItem('vendorData', JSON.stringify(parsed))
          }
        } catch (e) {}
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update registration details')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'BASIC', label: 'Owner & Basic Info', icon: UserCheck, count: 'Step 1' },
    { id: 'BUSINESS', label: 'Business & Tax Details', icon: Building, count: 'Step 2' },
    { id: 'BANK', label: 'Bank & Payout Details', icon: CreditCard, count: 'Step 3' },
    { id: 'PICKUP', label: 'Pickup & Warehouse Address', icon: MapPin, count: 'Step 4' },
  ]

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="font-semibold text-sm">Loading Registration Details...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left text-slate-800 pb-16 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Vendor Registration Details</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                formData.onboardingStatus === 'APPROVED' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {formData.onboardingStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              View and update your complete vendor registration, store identity, bank accounts, and pickup locations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Tabs + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isSelected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-xs">{tab.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </button>
              )
            })}
          </div>

          {/* Quick Notice Card */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-2xl p-4 border border-blue-100/80 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Verified Account</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Updating your bank details or GSTIN takes immediate effect for all your upcoming order settlements and customer invoices.
            </p>
          </div>
        </div>

        {/* Content Form Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            
            <form onSubmit={handleSave} className="space-y-6">

              {/* TAB 1: BASIC & OWNER INFO */}
              {activeTab === 'BASIC' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Owner & Account Credentials
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Primary contact details registered with HealthOil platform.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Owner / Authorized Person Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => handleBasicChange('fullName', e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Primary Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleBasicChange('email', e.target.value)}
                        placeholder="e.g. vendor@example.com"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Registered Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.mobile}
                        onChange={(e) => handleBasicChange('mobile', e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Account Status
                      </label>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>Vendor Status: <span className="text-emerald-600 font-bold">{formData.vendorStatus}</span></span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BUSINESS & TAX DETAILS */}
              {activeTab === 'BUSINESS' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      Business & Tax Registration
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Store name, legal business identity, GSTIN and PAN details.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Public Store / Brand Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.business.storeName}
                        onChange={(e) => handleBusinessChange('storeName', e.target.value)}
                        placeholder="e.g. Pure Agro Health Oils"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Legal Registered Entity Name
                      </label>
                      <input
                        type="text"
                        value={formData.business.legalBusinessName}
                        onChange={(e) => handleBusinessChange('legalBusinessName', e.target.value)}
                        placeholder="e.g. Pure Agro Private Limited"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Business Type
                      </label>
                      <select
                        value={formData.business.businessType}
                        onChange={(e) => handleBusinessChange('businessType', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                      >
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Private Limited">Private Limited</option>
                        <option value="LLP">LLP</option>
                        <option value="Individual">Individual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        GSTIN Number
                      </label>
                      <input
                        type="text"
                        value={formData.business.gstNumber}
                        onChange={(e) => handleBusinessChange('gstNumber', e.target.value.toUpperCase())}
                        placeholder="22AAAAA0000A1Z5"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-slate-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Business PAN Number
                      </label>
                      <input
                        type="text"
                        value={formData.business.panNumber}
                        onChange={(e) => handleBusinessChange('panNumber', e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-slate-800 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Official Business Support Email
                      </label>
                      <input
                        type="email"
                        value={formData.business.businessEmail}
                        onChange={(e) => handleBusinessChange('businessEmail', e.target.value)}
                        placeholder="support@pureagro.com"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Business Registered Address */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 mb-3">Registered Business Office Address</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address Line 1</label>
                        <input
                          type="text"
                          value={formData.business.address.addressLine1}
                          onChange={(e) => handleBusinessAddressChange('addressLine1', e.target.value)}
                          placeholder="Shop/Office No, Building Name, Street"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Landmark</label>
                        <input
                          type="text"
                          value={formData.business.address.landmark}
                          onChange={(e) => handleBusinessAddressChange('landmark', e.target.value)}
                          placeholder="Near City Market"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* City Dropdown */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                        <select
                          value={formData.business.address.city || ''}
                          onChange={(e) => {
                            const cityName = e.target.value
                            const cityObj = activeCities.find(c => c.name.toLowerCase() === cityName.toLowerCase())
                            setFormData(prev => ({
                              ...prev,
                              business: {
                                ...prev.business,
                                address: {
                                  ...prev.business.address,
                                  city: cityName,
                                  state: cityObj ? (cityObj.state || prev.business.address.state) : prev.business.address.state,
                                  subCity: '',
                                  pincode: ''
                                }
                              }
                            }))
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                        >
                          <option value="">Select City</option>
                          {activeCities.map(c => (
                            <option key={c._id} value={c.name}>{c.name} {c.state ? `(${c.state})` : ''}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sub-City Dropdown */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sub-City / Area</label>
                        {(() => {
                          const currentCity = activeCities.find(c => c.name.toLowerCase() === (formData.business.address.city || '').toLowerCase())
                          const areas = currentCity?.areas || []
                          return (
                            <select
                              value={formData.business.address.subCity || ''}
                              onChange={(e) => {
                                const areaName = e.target.value
                                const areaObj = areas.find(a => a.name.toLowerCase() === areaName.toLowerCase())
                                setFormData(prev => ({
                                  ...prev,
                                  business: {
                                    ...prev.business,
                                    address: {
                                      ...prev.business.address,
                                      subCity: areaName,
                                      pincode: areaObj?.pincode || prev.business.address.pincode
                                    }
                                  }
                                }))
                              }}
                              disabled={!formData.business.address.city}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-medium disabled:opacity-50"
                            >
                              <option value="">
                                {!formData.business.address.city ? 'Select City first' : (areas.length === 0 ? 'No sub-areas configured' : 'Select Sub-City / Area')}
                              </option>
                              {areas.map(a => (
                                <option key={a._id} value={a.name}>{a.name} {a.pincode ? `- ${a.pincode}` : ''}</option>
                              ))}
                            </select>
                          )
                        })()}
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>State</span>
                          {formData.business.address.city && <span className="text-[10px] text-emerald-600 font-medium">Auto-filled</span>}
                        </label>
                        <input
                          type="text"
                          value={formData.business.address.state}
                          onChange={(e) => handleBusinessAddressChange('state', e.target.value)}
                          placeholder="e.g. Maharashtra"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Pincode */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>Pincode</span>
                          {formData.business.address.subCity && formData.business.address.pincode && <span className="text-[10px] text-emerald-600 font-medium">Auto-filled</span>}
                        </label>
                        <input
                          type="text"
                          value={formData.business.address.pincode}
                          onChange={(e) => handleBusinessAddressChange('pincode', e.target.value)}
                          placeholder="411001"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BANK & PAYOUTS */}
              {activeTab === 'BANK' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Bank Account & Payout Settlements
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Order revenue will be directly transferred to this bank account.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Account Holder Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.bank.accountHolderName}
                        onChange={(e) => handleBankChange('accountHolderName', e.target.value)}
                        placeholder="e.g. Pure Agro Enterprises"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Bank Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.bank.bankName}
                        onChange={(e) => handleBankChange('bankName', e.target.value)}
                        placeholder="e.g. HDFC Bank / State Bank of India"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Bank Account Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.bank.accountNumber}
                        onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                        placeholder="50200012345678"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        IFSC Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.bank.ifscCode}
                        onChange={(e) => handleBankChange('ifscCode', e.target.value.toUpperCase())}
                        placeholder="HDFC0001234"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Account Type
                      </label>
                      <select
                        value={formData.bank.accountType}
                        onChange={(e) => handleBankChange('accountType', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                      >
                        <option value="Current">Current Account</option>
                        <option value="Savings">Savings Account</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PICKUP & WAREHOUSE ADDRESS */}
              {activeTab === 'PICKUP' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        Courier Pickup & Warehouse Location
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Location where logistics couriers will arrive to collect packaged oil orders.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyBusinessToPickup}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      📋 Copy Business Address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pickup Contact Person Name
                      </label>
                      <input
                        type="text"
                        value={formData.pickupAddress.contactName}
                        onChange={(e) => handlePickupChange('contactName', e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pickup Contact Mobile
                      </label>
                      <input
                        type="tel"
                        value={formData.pickupAddress.mobile}
                        onChange={(e) => handlePickupChange('mobile', e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Warehouse / Pickup Address Line
                      </label>
                      <input
                        type="text"
                        value={formData.pickupAddress.addressLine1}
                        onChange={(e) => handlePickupChange('addressLine1', e.target.value)}
                        placeholder="Plot No 45, Industrial Estate, Phase 2"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Landmark</label>
                      <input
                        type="text"
                        value={formData.pickupAddress.landmark}
                        onChange={(e) => handlePickupChange('landmark', e.target.value)}
                        placeholder="Near Highway Toll"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* City Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                      <select
                        value={formData.pickupAddress.city || ''}
                        onChange={(e) => {
                          const cityName = e.target.value
                          const cityObj = activeCities.find(c => c.name.toLowerCase() === cityName.toLowerCase())
                          setFormData(prev => ({
                            ...prev,
                            pickupAddress: {
                              ...prev.pickupAddress,
                              city: cityName,
                              state: cityObj ? (cityObj.state || prev.pickupAddress.state) : prev.pickupAddress.state,
                              subCity: '',
                              pincode: ''
                            }
                          }))
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="">Select City</option>
                        {activeCities.map(c => (
                          <option key={c._id} value={c.name}>{c.name} {c.state ? `(${c.state})` : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sub-City Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sub-City / Area</label>
                      {(() => {
                        const currentCity = activeCities.find(c => c.name.toLowerCase() === (formData.pickupAddress.city || '').toLowerCase())
                        const areas = currentCity?.areas || []
                        return (
                          <select
                            value={formData.pickupAddress.subCity || ''}
                            onChange={(e) => {
                              const areaName = e.target.value
                              const areaObj = areas.find(a => a.name.toLowerCase() === areaName.toLowerCase())
                              setFormData(prev => ({
                                ...prev,
                                pickupAddress: {
                                  ...prev.pickupAddress,
                                  subCity: areaName,
                                  pincode: areaObj?.pincode || prev.pickupAddress.pincode
                                }
                              }))
                            }}
                            disabled={!formData.pickupAddress.city}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-medium disabled:opacity-50"
                          >
                            <option value="">
                              {!formData.pickupAddress.city ? 'Select City first' : (areas.length === 0 ? 'No sub-areas configured' : 'Select Sub-City / Area')}
                            </option>
                            {areas.map(a => (
                              <option key={a._id} value={a.name}>{a.name} {a.pincode ? `- ${a.pincode}` : ''}</option>
                            ))}
                          </select>
                        )
                      })()}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span>State</span>
                        {formData.pickupAddress.city && <span className="text-[10px] text-emerald-600 font-medium">Auto-filled</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.pickupAddress.state}
                        onChange={(e) => handlePickupChange('state', e.target.value)}
                        placeholder="e.g. Maharashtra"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pincode</label>
                      <input
                        type="text"
                        value={formData.pickupAddress.pincode}
                        onChange={(e) => handlePickupChange('pincode', e.target.value)}
                        placeholder="411001"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Action Footer */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab)
                    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id)
                  }}
                  disabled={activeTab === 'BASIC'}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous Step
                </button>

                <div className="flex items-center gap-3">
                  {activeTab !== 'PICKUP' && (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(t => t.id === activeTab)
                        if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id)
                      }}
                      className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Next Step
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm hover:shadow transition-all disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Save All Details</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>

      </div>

    </div>
  )
}
