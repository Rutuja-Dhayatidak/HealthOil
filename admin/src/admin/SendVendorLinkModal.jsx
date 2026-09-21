import { useState } from 'react'
import { X, Send, Copy, Check, MessageSquare, Mail, Link as LinkIcon, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

function SendVendorLinkModal({ isOpen, onClose, vendor }) {
  if (!isOpen || !vendor) return null

  // Determine vendor portal origin (defaults to localhost:5173 or environment host)
  const getVendorBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const port = window.location.port
      if (port === '5174') {
        return window.location.origin.replace(':5174', ':5173')
      }
      return window.location.origin
    }
    return 'http://localhost:5173'
  }

  const baseUrl = getVendorBaseUrl()
  
  const linkOptions = [
    {
      id: 'kyc',
      label: 'Vendor KYC / Onboarding Link',
      description: 'Send this to vendor to complete their documents and shop profile verification.',
      url: `${baseUrl}/vendor/kyc`,
      tag: 'KYC Verification'
    },
    {
      id: 'login',
      label: 'Vendor Portal Login Link',
      description: 'Send this to approved vendors to log into their HealthOil store dashboard.',
      url: `${baseUrl}/vendor/login`,
      tag: 'Portal Login'
    },
    {
      id: 'register',
      label: 'New Vendor Registration Link',
      description: 'Send this to invite new sellers to register an account on HealthOil.',
      url: `${baseUrl}/vendor/register`,
      tag: 'New Registration'
    },
    {
      id: 'shop',
      label: 'Vendor Shop & Products Page',
      description: 'Direct link to vendor storefront & inventory management.',
      url: `${baseUrl}/vendor/shop`,
      tag: 'Storefront'
    }
  ]

  const [selectedType, setSelectedType] = useState('kyc')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)

  const activeOption = linkOptions.find(o => o.id === selectedType) || linkOptions[0]
  const vendorName = vendor.fullName || 'Partner'
  const storeName = vendor.business?.storeName || 'HealthOil Partner Shop'
  const mobile = vendor.mobile ? String(vendor.mobile).replace(/\D/g, '') : ''
  const email = vendor.email || ''

  const defaultMessage = `Hello ${vendorName},\n\nGreetings from HealthOil Admin Team!\n\nPlease use the link below to access your vendor portal for ${storeName}:\n\n🔗 ${activeOption.url}\n\nIf you have any questions or need help with verification, feel free to contact us.\n\nThank you,\nHealthOil Team`

  const [customMessage, setCustomMessage] = useState(defaultMessage)

  // Update message when link type changes
  const handleTypeChange = (typeId) => {
    setSelectedType(typeId)
    const opt = linkOptions.find(o => o.id === typeId) || linkOptions[0]
    setCustomMessage(`Hello ${vendorName},\n\nGreetings from HealthOil Admin Team!\n\nPlease use the link below to access your vendor portal for ${storeName}:\n\n🔗 ${opt.url}\n\nIf you have any questions or need help with verification, feel free to contact us.\n\nThank you,\nHealthOil Team`)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeOption.url)
    setCopiedLink(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage)
    setCopiedMessage(true)
    toast.success('Message & Link copied to clipboard!')
    setTimeout(() => setCopiedMessage(false), 2000)
  }

  const handleSendWhatsApp = () => {
    if (!mobile) {
      toast.error('No mobile number available for this vendor.')
      return
    }
    const cleanMobile = mobile.length === 10 ? `91${mobile}` : mobile
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanMobile}&text=${encodeURIComponent(customMessage)}`
    window.open(whatsappUrl, '_blank')
    toast.success('Opening WhatsApp...')
  }

  const handleSendEmail = () => {
    if (!email) {
      toast.error('No email address available for this vendor.')
      return
    }
    const subject = encodeURIComponent(`HealthOil Vendor Portal Link - ${storeName}`)
    const body = encodeURIComponent(customMessage)
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self')
    toast.success('Opening Email client...')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-[#b89547]/30 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#FAF8F5] to-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#031d13]">Send Link to Vendor</h3>
              <p className="text-xs text-gray-500">Share verification, onboarding, or login links with the vendor</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1 text-left">
          
          {/* Vendor Summary Card */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#031d13]">{storeName}</p>
              <p className="text-[11px] text-gray-500">Owner: {vendorName}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {mobile ? (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-100">
                  📱 +91 {mobile.slice(-10)}
                </span>
              ) : (
                <span className="text-gray-400 text-[11px]">No Phone</span>
              )}
              {email ? (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100">
                  ✉️ {email}
                </span>
              ) : (
                <span className="text-gray-400 text-[11px]">No Email</span>
              )}
            </div>
          </div>

          {/* Select Link Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
              Select Link Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {linkOptions.map((opt) => {
                const isSelected = selectedType === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleTypeChange(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#031d13]">{opt.label}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {opt.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{opt.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Generated URL Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Generated Link URL
            </label>
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
              <LinkIcon className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
              <input 
                type="text" 
                readOnly 
                value={activeOption.url} 
                className="w-full bg-transparent text-xs text-gray-700 font-mono outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Message Preview
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedMessage ? 'Copied Full Message' : 'Copy Message'}
              </button>
            </div>
            <textarea
              rows={5}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 text-xs bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700 font-sans leading-relaxed resize-none shadow-2xs"
            />
          </div>

        </div>

        {/* Footer Quick Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {email && (
              <button
                type="button"
                onClick={handleSendEmail}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5" />
                Send Email
              </button>
            )}

            {mobile && (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Send on WhatsApp
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Link
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SendVendorLinkModal
