import { useState, useEffect, useRef } from 'react'
import { X, Image as ImageIcon, Upload, Loader2, Check, Sparkles } from 'lucide-react'

function CityModal({ isOpen, onClose, city, onSave, isLoading }) {
  const [name, setName] = useState('')
  const [state, setState] = useState('')
  const [displayOrder, setDisplayOrder] = useState(99)
  const [isActive, setIsActive] = useState(true)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (city) {
      setName(city.name || '')
      setState(city.state || '')
      setDisplayOrder(city.displayOrder !== undefined ? city.displayOrder : 99)
      setIsActive(city.isActive !== undefined ? city.isActive : true)
      setExistingImageUrl(city.image || '')
      setPreviewUrl(city.image || '')
      setImageFile(null)
    } else {
      setName('')
      setState('')
      setDisplayOrder(99)
      setIsActive(true)
      setExistingImageUrl('')
      setPreviewUrl('')
      setImageFile(null)
    }
    setError('')
  }, [city, isOpen])

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, WEBP, SVG)')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be under 5MB')
        return
      }
      setError('')
      setImageFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setPreviewUrl('')
    setExistingImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('City Name is required')
      return
    }

    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('state', state.trim())
    formData.append('displayOrder', displayOrder === '' ? 0 : displayOrder)
    formData.append('isActive', isActive)

    if (imageFile) {
      formData.append('image', imageFile)
    } else if (existingImageUrl) {
      formData.append('image', existingImageUrl)
    } else {
      formData.append('image', '')
    }

    onSave(formData, city ? city._id : null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10 transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              {city ? 'Edit City' : 'Add New City'}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* City Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              City Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pune, Mumbai, Bangalore"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 transition-all text-gray-800 placeholder-gray-400"
              required
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              State
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Maharashtra, Karnataka"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 transition-all text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* City Cover Image */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              City Cover Image (Cloudinary)
            </label>
            
            <div className="flex items-center gap-4">
              {/* Image Preview Box */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-indigo-400 transition-colors relative group"
              >
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-indigo-600">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* File details / input */}
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 border border-gray-300 hover:border-gray-400 text-xs font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
                  >
                    Choose file
                  </button>
                  <span className="text-xs text-gray-500 truncate max-w-[180px]">
                    {imageFile ? imageFile.name : (previewUrl ? 'Current image selected' : 'No file chosen')}
                  </span>
                </div>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-[11px] text-red-500 hover:text-red-700 font-medium mt-1.5 block cursor-pointer"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Display Order & Active status row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Display Order (lower = first)
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="99"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 transition-all text-gray-800"
              />
            </div>

            <div className="flex items-center sm:pt-6">
              <label className="relative flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 rounded-md transition-all flex items-center justify-center">
                    {isActive && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-700">
                  Active (visible in app)
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{city ? 'Save Changes' : 'Create City'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default CityModal
