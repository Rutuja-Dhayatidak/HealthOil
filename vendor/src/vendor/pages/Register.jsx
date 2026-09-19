import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShieldCheck, Upload, AlertCircle, MapPin, Building, ChevronDown, Loader2 } from 'lucide-react'
import { registerVendor, loginVendor, saveBusinessDetails, uploadVendorDocument, saveBankDetails, submitApplication, getActiveCitiesApi } from '../../ApiServices/vendorAuthService'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Dynamic Cities & Sub-Cities
  const [activeCities, setActiveCities] = useState([])
  const [availableSubCities, setAvailableSubCities] = useState([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [isCustomCity, setIsCustomCity] = useState(false)
  const [isCustomSubCity, setIsCustomSubCity] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1
    ownerName: '', mobile: '', email: '', password: '', confirmPassword: '',
    // Step 2
    shopName: '', businessType: 'Partnership', address: '', city: '', subCity: '', state: '', pincode: '', mapsLocation: '', latitude: '28.6139', longitude: '77.2090',
    // Step 3
    gstNumber: '', fssaiNumber: '', shopRegNumber: '', panNumber: '',
    // Step 4
    aadhaarDoc: null, panDoc: null, gstDoc: null, fssaiDoc: null, licenceDoc: null, chequeDoc: null, frontImage: null, ownerPhoto: null,
    // Step 5
    holderName: '', bankName: '', accountNumber: '', confirmAccount: '', ifscCode: '', accountType: 'Current'
  })

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setCitiesLoading(true)
        const res = await getActiveCitiesApi()
        if (res?.success && Array.isArray(res.cities)) {
          setActiveCities(res.cities)
        }
      } catch (err) {
        console.error('Failed to load active cities:', err)
      } finally {
        setCitiesLoading(false)
      }
    }
    fetchCities()
  }, [])

  const handleTextChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle City Selection -> Auto fills State and loads Sub-cities
  const handleCityChange = (e) => {
    const selectedCityName = e.target.value

    if (selectedCityName === '__custom_city__') {
      setIsCustomCity(true)
      setIsCustomSubCity(true)
      setAvailableSubCities([])
      setFormData(prev => ({
        ...prev,
        city: '',
        subCity: '',
        pincode: ''
      }))
      return
    }

    const selectedCityObj = activeCities.find(c => c.name.toLowerCase() === selectedCityName.toLowerCase())

    if (selectedCityObj) {
      const cityAreas = selectedCityObj.areas || []
      setAvailableSubCities(cityAreas)
      setIsCustomCity(false)
      setIsCustomSubCity(false)
      setFormData(prev => ({
        ...prev,
        city: selectedCityObj.name,
        state: selectedCityObj.state || prev.state,
        subCity: '',
        pincode: ''
      }))
    } else {
      setAvailableSubCities([])
      setIsCustomSubCity(false)
      setFormData(prev => ({
        ...prev,
        city: selectedCityName,
        subCity: '',
        pincode: ''
      }))
    }
  }

  // Handle Sub-City Selection -> Auto fills Pincode
  const handleSubCityChange = (e) => {
    const selectedAreaName = e.target.value

    if (selectedAreaName === '__custom_subcity__') {
      setIsCustomSubCity(true)
      setFormData(prev => ({
        ...prev,
        subCity: '',
        pincode: ''
      }))
      return
    }

    const selectedAreaObj = availableSubCities.find(a => a.name.toLowerCase() === selectedAreaName.toLowerCase())

    if (selectedAreaObj) {
      setFormData(prev => ({
        ...prev,
        subCity: selectedAreaObj.name,
        pincode: selectedAreaObj.pincode || prev.pincode
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        subCity: selectedAreaName
      }))
    }
  }

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    setFormData(prev => ({ ...prev, [fieldName]: file }))
  }

  const handleNext = () => {
    if (step < 6) setStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Register
      await registerVendor({
        fullName: formData.ownerName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      });

      // 2. Login to get token
      await loginVendor(formData.email, formData.password);

      // 3. Save Business Details
      await saveBusinessDetails({
        storeName: formData.shopName,
        businessType: formData.businessType,
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
        address: {
          addressLine1: formData.address,
          subCity: formData.subCity,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      });

      // 4. Upload Documents
      if (formData.panDoc) await uploadVendorDocument('PAN_CARD', formData.panDoc);
      if (formData.gstDoc) await uploadVendorDocument('GST_CERTIFICATE', formData.gstDoc);
      if (formData.fssaiDoc) await uploadVendorDocument('BUSINESS_PROOF', formData.fssaiDoc);
      if (formData.aadhaarDoc) await uploadVendorDocument('OWNER_ID', formData.aadhaarDoc);

      // 5. Save Bank Details
      await saveBankDetails({
        accountHolderName: formData.holderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountNumberLast4: formData.accountNumber.slice(-4),
        ifscCode: formData.ifscCode,
        accountType: formData.accountType
      });

      // 6. Submit Application
      await submitApplication();
      
      toast.success("Registration submitted successfully!");
      navigate('/vendor/kyc', { state: { status: 'Under Verification' } });
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong during registration");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F2E7] flex flex-col justify-center items-center py-12 px-6 text-[#15251F]">
      <div className="max-w-2xl w-full bg-white border border-[#D4AF37]/25 rounded-3xl p-8 shadow-xl text-left">

        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-8 h-8 rounded-full bg-[#002F24] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37]">
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <h1 className="text-sm font-bold font-serif text-[#002F24]">HealthOil Vendor Application</h1>
        </div>

        {/* Step Indicator Tracker Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            <span>Step {step} of 6</span>
            <span>{
              step === 1 ? 'Owner Info' :
                step === 2 ? 'Shop Address' :
                  step === 3 ? 'Licences' :
                    step === 4 ? 'Documents' :
                      step === 5 ? 'Bank Account' : 'Review & Send'
            }</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#002F24] to-[#D4AF37] transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Owner Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#002F24] border-b border-gray-100 pb-2">Owner Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Owner Full Name</label>
                <input type="text" name="ownerName" value={formData.ownerName} onChange={handleTextChange} placeholder="Gopal Das" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                <input type="text" name="mobile" value={formData.mobile} onChange={handleTextChange} placeholder="+91 98765 43210" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleTextChange} placeholder="gopal@krishnaoils.com" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleTextChange} placeholder="••••••••" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleTextChange} placeholder="••••••••" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Shop details */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#002F24] border-b border-gray-100 pb-2">Store Profile & Address</h3>
            
            {/* Shop Name & Business Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Shop Name</label>
                <input type="text" name="shopName" value={formData.shopName} onChange={handleTextChange} placeholder="Krishna Organic Oils" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Business Type</label>
                <select name="businessType" value={formData.businessType} onChange={handleTextChange} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]">
                  <option>Proprietorship</option>
                  <option>Partnership</option>
                  <option>Private Limited</option>
                </select>
              </div>
            </div>

            {/* Full Shop Address */}
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Full Shop Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleTextChange} placeholder="Shop 12, Link Road, Block C" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
            </div>

            {/* City & Sub-City Selection Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City Dropdown / Custom Input */}
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 flex items-center justify-between">
                  <span>City <span className="text-red-500">*</span></span>
                  <div className="flex items-center gap-1.5">
                    {citiesLoading && <span className="text-[8px] text-gray-400 font-normal">Loading cities...</span>}
                    {!isCustomCity ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCity(true)
                          setIsCustomSubCity(true)
                          setAvailableSubCities([])
                          setFormData(prev => ({ ...prev, city: '', subCity: '', pincode: '' }))
                        }}
                        className="text-[8px] text-[#002F24] font-bold hover:underline bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                        title="Can't find your city? Type manually"
                      >
                        + Add City
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCity(false)
                          setIsCustomSubCity(false)
                          setFormData(prev => ({ ...prev, city: '', subCity: '', pincode: '', state: '' }))
                        }}
                        className="text-[8px] text-[#002F24] font-bold hover:underline bg-white border border-[#D4AF37]/40 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                      >
                        List View
                      </button>
                    )}
                  </div>
                </label>

                {isCustomCity ? (
                  <div className="relative">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleTextChange}
                      placeholder="Enter City Name (e.g. Pune, Mumbai)"
                      className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24] font-medium"
                      autoFocus
                    />
                  </div>
                ) : (
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleCityChange}
                    className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24] font-medium"
                  >
                    <option value="">Select City</option>
                    {activeCities.map(c => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name} {c.state ? `(${c.state})` : ''}
                      </option>
                    ))}
                    <option value="__custom_city__" className="font-semibold text-[#002F24] bg-amber-50">
                      ➕ + Add Other City (Type Manually)
                    </option>
                  </select>
                )}
              </div>

              {/* Sub-City / Area Dropdown / Custom Input */}
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 flex items-center justify-between">
                  <span>Sub-City / Area (Locality)</span>
                  <div className="flex items-center gap-1.5">
                    {!isCustomSubCity && availableSubCities.length > 0 && (
                      <span className="text-[8px] text-[#002F24] font-semibold">{availableSubCities.length} areas</span>
                    )}
                    {formData.city && !isCustomCity && (
                      !isCustomSubCity ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomSubCity(true)
                            setFormData(prev => ({ ...prev, subCity: '', pincode: '' }))
                          }}
                          className="text-[8px] text-[#002F24] font-bold hover:underline bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                          title="Can't find your area? Type manually"
                        >
                          + Add Area
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomSubCity(false)
                            setFormData(prev => ({ ...prev, subCity: '', pincode: '' }))
                          }}
                          className="text-[8px] text-[#002F24] font-bold hover:underline bg-white border border-[#D4AF37]/40 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          List View
                        </button>
                      )
                    )}
                  </div>
                </label>

                {isCustomSubCity || isCustomCity ? (
                  <div className="relative">
                    <input
                      type="text"
                      name="subCity"
                      value={formData.subCity}
                      onChange={handleTextChange}
                      placeholder="Enter Sub-City / Area (e.g. Baner, Wakad)"
                      className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24] font-medium"
                      autoFocus={isCustomSubCity && !isCustomCity}
                    />
                  </div>
                ) : (
                  <select
                    name="subCity"
                    value={formData.subCity}
                    onChange={handleSubCityChange}
                    disabled={!formData.city}
                    className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!formData.city ? 'Select City first' : (availableSubCities.length === 0 ? 'No pre-set areas (Select + Add Area)' : 'Select Sub-City / Area')}
                    </option>
                    {availableSubCities.map(a => (
                      <option key={a._id || a.name} value={a.name}>
                        {a.name} {a.pincode ? `- ${a.pincode}` : ''}
                      </option>
                    ))}
                    {formData.city && (
                      <option value="__custom_subcity__" className="font-semibold text-[#002F24] bg-amber-50">
                        ➕ + Add Sub-City / Area (Type Manually)
                      </option>
                    )}
                  </select>
                )}
              </div>
            </div>

            {/* State & Pincode Row (Auto-filled / Manual) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* State */}
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 flex items-center justify-between">
                  <span>State</span>
                  {formData.city && !isCustomCity && <span className="text-[8px] text-emerald-700 font-semibold">Auto-filled</span>}
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleTextChange}
                  placeholder="e.g. Maharashtra"
                  className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1 flex items-center justify-between">
                  <span>Pincode</span>
                  {formData.subCity && formData.pincode && !isCustomSubCity && !isCustomCity ? (
                    <span className="text-[8px] text-emerald-700 font-semibold">Auto-filled</span>
                  ) : (
                    <span className="text-[8px] text-gray-400 font-normal">Enter 6-digit Pincode</span>
                  )}
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleTextChange}
                  placeholder="e.g. 411045"
                  className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]"
                />
              </div>
            </div>

            {/* Maps & Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-50 pt-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Maps Location URL</label>
                <input type="text" name="mapsLocation" value={formData.mapsLocation} onChange={handleTextChange} placeholder="https://maps.google.com/?q=..." className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Latitude</label>
                <input type="text" name="latitude" value={formData.latitude} onChange={handleTextChange} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Longitude</label>
                <input type="text" name="longitude" value={formData.longitude} onChange={handleTextChange} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Business Details */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#002F24] border-b border-gray-100 pb-2">Business Licences & Verification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">GST Identification Number <span className="font-normal lowercase text-gray-400">(optional)</span></label>
                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleTextChange} placeholder="07AAAAA1111A1Z1" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">FSSAI Licence Number <span className="font-normal lowercase text-gray-400">(optional)</span></label>
                <input type="text" name="fssaiNumber" value={formData.fssaiNumber} onChange={handleTextChange} placeholder="10012011000123" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Shop & Establishment Reg Number <span className="font-normal lowercase text-gray-400">(optional)</span></label>
                <input type="text" name="shopRegNumber" value={formData.shopRegNumber} onChange={handleTextChange} placeholder="REG/DEL/2023/1234" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Business PAN Number <span className="font-normal lowercase text-gray-400">(optional)</span></label>
                <input type="text" name="panNumber" value={formData.panNumber} onChange={handleTextChange} placeholder="ABCDE1234F" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Documents */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#002F24] border-b border-gray-100 pb-2">Document Proof Uploads</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-dashed border-[#D4AF37]/40 rounded-2xl p-4 bg-[#F8F2E7]/20 text-center relative group">
                <input type="file" onChange={(e) => handleFileChange(e, 'panDoc')} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <Upload className="w-5 h-5 mx-auto text-[#002F24] mb-1" />
                <p className="text-[10px] font-bold text-[#002F24]">Business PAN Card</p>
                <span className="text-[8px] text-gray-400">{formData.panDoc ? formData.panDoc.name : 'Upload PDF or JPG (Max 5MB)'}</span>
              </div>
              <div className="border border-dashed border-[#D4AF37]/40 rounded-2xl p-4 bg-[#F8F2E7]/20 text-center relative group">
                <input type="file" onChange={(e) => handleFileChange(e, 'gstDoc')} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <Upload className="w-5 h-5 mx-auto text-[#002F24] mb-1" />
                <p className="text-[10px] font-bold text-[#002F24]">GST Certificate</p>
                <span className="text-[8px] text-gray-400">{formData.gstDoc ? formData.gstDoc.name : 'Upload PDF or JPG (Max 5MB)'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-dashed border-[#D4AF37]/40 rounded-2xl p-4 bg-[#F8F2E7]/20 text-center relative group">
                <input type="file" onChange={(e) => handleFileChange(e, 'fssaiDoc')} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <Upload className="w-5 h-5 mx-auto text-[#002F24] mb-1" />
                <p className="text-[10px] font-bold text-[#002F24]">FSSAI Certificate</p>
                <span className="text-[8px] text-gray-400">{formData.fssaiDoc ? formData.fssaiDoc.name : 'Upload PDF or JPG (Max 5MB)'}</span>
              </div>
              <div className="border border-dashed border-[#D4AF37]/40 rounded-2xl p-4 bg-[#F8F2E7]/20 text-center relative group">
                <input type="file" onChange={(e) => handleFileChange(e, 'aadhaarDoc')} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <Upload className="w-5 h-5 mx-auto text-[#002F24] mb-1" />
                <p className="text-[10px] font-bold text-[#002F24]">Owner Aadhaar / ID</p>
                <span className="text-[8px] text-gray-400">{formData.aadhaarDoc ? formData.aadhaarDoc.name : 'Upload PDF or JPG (Max 5MB)'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Bank details */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#002F24] border-b border-gray-100 pb-2">Bank & Payout Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1">Account Holder Name <span className="font-normal lowercase text-gray-400">(optional)</span></label>
                <input type="text" name="holderName" value={formData.holderName} onChange={handleTextChange} placeholder="Gopal Das" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1">Bank Name <span className="font-normal lowercase text-gray-400">(optional)</span></label>
                <input type="text" name="bankName" value={formData.bankName} onChange={handleTextChange} placeholder="State Bank of India" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1">Bank Account Number <span className="font-normal lowercase text-gray-400">(optional)</span></label>
                <input type="password" name="accountNumber" value={formData.accountNumber} onChange={handleTextChange} placeholder="••••••••••••" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1">Confirm Account Number <span className="font-normal lowercase text-gray-400">(optional)</span></label>
                <input type="text" name="confirmAccount" value={formData.confirmAccount} onChange={handleTextChange} placeholder="5020100..." className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1">IFSC Code <span className="font-normal lowercase text-gray-400">(optional)</span></label>
                <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleTextChange} placeholder="SBIN0001234" className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-1">Account Type <span className="font-normal lowercase text-gray-400">(optional)</span></label>
                <select name="accountType" value={formData.accountType} onChange={handleTextChange} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#002F24]">
                  <option>Current</option>
                  <option>Savings</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review and Submit */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-[#002F24] border-b border-gray-100 pb-2">Verification Review</h3>
            <div className="bg-[#F8F2E7]/30 border border-[#D4AF37]/20 rounded-2xl p-4 text-xs space-y-2 text-gray-600">
              <p>👤 Owner: <span className="font-bold text-[#002F24]">{formData.ownerName || 'N/A'}</span></p>
              <p>🏪 Shop: <span className="font-bold text-[#002F24]">{formData.shopName || 'N/A'}</span> ({formData.businessType})</p>
              <p>📍 Address: <span className="font-bold text-[#002F24]">{formData.address || 'N/A'}{formData.subCity ? `, ${formData.subCity}` : ''}, {formData.city}, {formData.state} - {formData.pincode}</span></p>
              <p>📄 Licences: GST: {formData.gstNumber || 'N/A'} | FSSAI: {formData.fssaiNumber || 'N/A'}</p>
              <p>🏦 Account: {formData.bankName} - Account: **********{formData.accountNumber.slice(-4)}</p>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="agreed"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="mt-1 rounded border-gray-300 text-[#002F24]"
              />
              <label htmlFor="agreed" className="text-[10px] text-gray-500 leading-normal font-bold">
                I hereby declare that all uploaded certifications and licencing credentials belong to my registered business entity and are true.
              </label>
            </div>
          </div>
        )}

        {/* Form control buttons */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#D4AF37]/10">
          <button
            type="button"
            disabled={step === 1}
            onClick={handleBack}
            className="px-4 py-2.5 border border-[#D4AF37]/35 rounded-xl text-xs font-bold text-[#002F24] hover:bg-[#F8F2E7]/60 cursor-pointer disabled:opacity-30"
          >
            Previous
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2.5 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!agreed || loading}
              onClick={handleSubmit}
              className="px-4 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40 shadow-md shadow-[#16A34A]/10"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
