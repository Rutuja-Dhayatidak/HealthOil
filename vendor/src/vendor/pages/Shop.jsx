import { useState, useEffect } from 'react'
import { Save, Store, Truck, Camera, Link as LinkIcon, Loader2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { getStoreProfile, updateStoreProfile, uploadStoreImages } from '../../ApiServices/vendorAuthService'

export default function Shop() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    businessCategory: '',
    vendorStatus: 'ACTIVE',
    logo: '',
    banner: '',
    socialLinks: { facebook: '', instagram: '', website: '' },
    address: { addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '' },
    pickupAddress: { contactName: '', mobile: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '' },
    mobile: ''
  })

  const [previewLogo, setPreviewLogo] = useState(null)
  const [previewBanner, setPreviewBanner] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await getStoreProfile()
      if (res.success && res.data) {
        const d = res.data
        setFormData({
          storeName: d.business?.storeName || '',
          description: d.storeProfile?.description || '',
          businessCategory: d.storeProfile?.businessCategory || '',
          vendorStatus: d.vendorStatus || 'ACTIVE',
          logo: d.storeProfile?.logo || '',
          banner: d.storeProfile?.banner || '',
          socialLinks: {
            facebook: d.storeProfile?.socialLinks?.facebook || '',
            instagram: d.storeProfile?.socialLinks?.instagram || '',
            website: d.storeProfile?.socialLinks?.website || ''
          },
          address: d.business?.address || { addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '' },
          pickupAddress: d.pickupAddress || { contactName: '', mobile: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: '', pincode: '' },
          mobile: d.mobile || d.business?.businessPhone || ''
        })
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch store profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value, category = null) => {
    setFormData(prev => {
      if (category) {
        return { ...prev, [category]: { ...prev[category], [field]: value } }
      }
      return { ...prev, [field]: value }
    })
  }

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onload = () => {
      if (type === 'logo') setPreviewLogo(reader.result)
      if (type === 'banner') setPreviewBanner(reader.result)
    }
    reader.readAsDataURL(file)

    try {
      setImageUploading(true)
      const fd = new FormData()
      fd.append(type, file)
      const res = await uploadStoreImages(fd)
      if (res.success) {
        toast.success(`${type} uploaded successfully`)
        if (res.data[type]) {
          setFormData(prev => ({ ...prev, [type]: res.data[type] }))
        }
      }
    } catch (error) {
      toast.error(error.message || `Failed to upload ${type}`);
    } finally {
      setImageUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await updateStoreProfile({
        storeName: formData.storeName,
        description: formData.description,
        businessCategory: formData.businessCategory,
        address: formData.address,
        pickupAddress: formData.pickupAddress,
        socialLinks: formData.socialLinks
      })
      if (res.success) {
        toast.success('Store configuration saved successfully')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save store profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" /></div>
  }

  return (
    <div className="space-y-8 text-left text-[#15251F]">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#002F24] tracking-tight">Store Setup</h2>
        <p className="text-xs text-gray-500 mt-1">Configure your store profile, address, and business details.</p>
      </div>

      <div className="flex border-b border-[#D4AF37]/20 gap-2 overflow-x-auto pb-1">
        <button type="button" onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 border-b-2 -mb-0.5 ${activeTab === 'profile' ? 'border-[#002F24] text-[#002F24]' : 'border-transparent text-gray-500 hover:text-[#002F24]'}`}>Store Profile</button>
        <button type="button" onClick={() => setActiveTab('address')} className={`px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 border-b-2 -mb-0.5 ${activeTab === 'address' ? 'border-[#002F24] text-[#002F24]' : 'border-transparent text-gray-500 hover:text-[#002F24]'}`}>Address & Contact</button>
        <button type="button" onClick={() => setActiveTab('pickup')} className={`px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 border-b-2 -mb-0.5 ${activeTab === 'pickup' ? 'border-[#002F24] text-[#002F24]' : 'border-transparent text-gray-500 hover:text-[#002F24]'}`}>Pickup Details</button>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm max-w-3xl">
        
        {/* TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-sm text-[#002F24] border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#D4AF37]" />
              Branding & Basic Info
            </h3>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Store Logo</label>
                <div className="border-2 border-dashed border-[#D4AF37]/30 rounded-xl p-4 flex flex-col items-center justify-center text-center relative hover:bg-[#F8F2E7]/20 transition-colors">
                  {(previewLogo || formData.logo) ? (
                    <img src={previewLogo || formData.logo} alt="Logo" className="h-20 w-20 object-contain rounded-full border border-gray-200 bg-white" />
                  ) : (
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200"><Store className="w-8 h-8 text-gray-300" /></div>
                  )}
                  <div className="mt-3">
                    <label className="cursor-pointer bg-white border border-[#D4AF37]/40 px-3 py-1.5 rounded-lg text-[10px] font-bold text-[#002F24] hover:bg-[#F8F2E7]/40 flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Change Logo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Cover / Banner Image</label>
                <div className="border-2 border-dashed border-[#D4AF37]/30 rounded-xl p-4 flex flex-col items-center justify-center text-center relative hover:bg-[#F8F2E7]/20 transition-colors h-full min-h-[140px]">
                  {(previewBanner || formData.banner) ? (
                    <img src={previewBanner || formData.banner} alt="Banner" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                  ) : (
                    <div className="w-full h-20 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200"><Camera className="w-8 h-8 text-gray-300" /></div>
                  )}
                  <div className="mt-3">
                    <label className="cursor-pointer bg-white border border-[#D4AF37]/40 px-3 py-1.5 rounded-lg text-[10px] font-bold text-[#002F24] hover:bg-[#F8F2E7]/40 flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Change Banner
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner')} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Store Name</label>
                <input type="text" value={formData.storeName} onChange={(e) => handleInputChange('storeName', e.target.value)} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F] text-xs focus:border-[#002F24]" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Business Category</label>
                <input type="text" value={formData.businessCategory} onChange={(e) => handleInputChange('businessCategory', e.target.value)} placeholder="e.g. Engine Oil, Industrial Oil, Grease" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F] text-xs focus:border-[#002F24]" />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">About Store / Description</label>
              <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows="3" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F] text-xs focus:border-[#002F24]" placeholder="Tell customers about your store and products..." />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-[10px] font-bold text-gray-800 mb-3 flex items-center gap-1.5"><LinkIcon className="w-3 h-3" /> Social Links & Website</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1.5">Website</label>
                  <input type="url" value={formData.socialLinks?.website || ''} onChange={(e) => handleInputChange('website', e.target.value, 'socialLinks')} placeholder="https://" className="w-full bg-white border border-[#D4AF37]/25 rounded-lg px-3 py-2 outline-none text-gray-700 focus:border-[#002F24]" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1.5">Facebook Profile</label>
                  <input type="url" value={formData.socialLinks?.facebook || ''} onChange={(e) => handleInputChange('facebook', e.target.value, 'socialLinks')} placeholder="https://facebook.com/..." className="w-full bg-white border border-[#D4AF37]/25 rounded-lg px-3 py-2 outline-none text-gray-700 focus:border-[#002F24]" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1.5">Instagram Profile</label>
                  <input type="url" value={formData.socialLinks?.instagram || ''} onChange={(e) => handleInputChange('instagram', e.target.value, 'socialLinks')} placeholder="https://instagram.com/..." className="w-full bg-white border border-[#D4AF37]/25 rounded-lg px-3 py-2 outline-none text-gray-700 focus:border-[#002F24]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ADDRESS */}
        {activeTab === 'address' && (
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-sm text-[#002F24] border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#D4AF37]" />
              Store Address & Contact
            </h3>

            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-[10px] text-blue-700 mb-4">
              This address is used for customer billing and store profile display.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Address Line 1</label>
                <input type="text" value={formData.address?.addressLine1 || ''} onChange={(e) => handleInputChange('addressLine1', e.target.value, 'address')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Address Line 2</label>
                <input type="text" value={formData.address?.addressLine2 || ''} onChange={(e) => handleInputChange('addressLine2', e.target.value, 'address')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">City</label>
                <input type="text" value={formData.address?.city || ''} onChange={(e) => handleInputChange('city', e.target.value, 'address')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">State</label>
                <input type="text" value={formData.address?.state || ''} onChange={(e) => handleInputChange('state', e.target.value, 'address')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Pincode</label>
                <input type="text" value={formData.address?.pincode || ''} onChange={(e) => handleInputChange('pincode', e.target.value, 'address')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Contact Number</label>
                <input type="text" value={formData.mobile || ''} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 outline-none text-gray-500 cursor-not-allowed" />
                <span className="text-[8px] text-gray-400 mt-1 block">Contact number is verified during registration.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PICKUP */}
        {activeTab === 'pickup' && (
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-sm text-[#002F24] border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#D4AF37]" />
              Pickup Details
            </h3>

            <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 text-[10px] text-amber-700 mb-4">
              This address is used by delivery partners to pick up orders from you.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Pickup Contact Name</label>
                <input type="text" value={formData.pickupAddress?.contactName || ''} onChange={(e) => handleInputChange('contactName', e.target.value, 'pickupAddress')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Pickup Mobile</label>
                <input type="text" value={formData.pickupAddress?.mobile || ''} onChange={(e) => handleInputChange('mobile', e.target.value, 'pickupAddress')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Address Line 1</label>
                <input type="text" value={formData.pickupAddress?.addressLine1 || ''} onChange={(e) => handleInputChange('addressLine1', e.target.value, 'pickupAddress')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Address Line 2</label>
                <input type="text" value={formData.pickupAddress?.addressLine2 || ''} onChange={(e) => handleInputChange('addressLine2', e.target.value, 'pickupAddress')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Landmark</label>
                <input type="text" value={formData.pickupAddress?.landmark || ''} onChange={(e) => handleInputChange('landmark', e.target.value, 'pickupAddress')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">City</label>
                <input type="text" value={formData.pickupAddress?.city || ''} onChange={(e) => handleInputChange('city', e.target.value, 'pickupAddress')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">State</label>
                <input type="text" value={formData.pickupAddress?.state || ''} onChange={(e) => handleInputChange('state', e.target.value, 'pickupAddress')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" required />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Pincode</label>
                <input type="text" value={formData.pickupAddress?.pincode || ''} onChange={(e) => handleInputChange('pincode', e.target.value, 'pickupAddress')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/25 rounded-xl px-4 py-2.5 outline-none text-[#15251F]" required />
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-[#D4AF37]/15 mt-6 flex justify-end gap-3 items-center">
          {imageUploading && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading image...</span>}
          <button 
            type="submit"
            disabled={saving || imageUploading}
            className="bg-[#002F24] hover:bg-[#014D3A] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md shadow-[#002F24]/10 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Configurations'}
          </button>
        </div>

      </form>
    </div>
  )
}
