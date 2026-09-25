import { useState, useEffect } from 'react'
import { X, Loader2, Landmark, Check } from 'lucide-react'

function StateModal({ isOpen, onClose, onSave, isLoading }) {
  const [stateName, setStateName] = useState('')
  const [cityName, setCityName] = useState('')
  const [displayOrder, setDisplayOrder] = useState(99)
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStateName('')
      setCityName('')
      setDisplayOrder(99)
      setIsActive(true)
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!stateName.trim()) {
      setError('State Name is required')
      return
    }
    if (!cityName.trim()) {
      setError('City Name under this state is required')
      return
    }

    const formData = new FormData()
    formData.append('state', stateName.trim())
    formData.append('name', cityName.trim())
    formData.append('displayOrder', displayOrder === '' ? 0 : displayOrder)
    formData.append('isActive', isActive)

    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10 transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                Add New State
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure a new state and its primary serviceable city in the system.
              </p>
            </div>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* State Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              State Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => {
                setStateName(e.target.value)
                setError('')
              }}
              placeholder="e.g. Maharashtra, Goa, Gujarat, Rajasthan"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 transition-all text-gray-800 bg-white"
              required
            />
          </div>

          {/* Primary City Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Primary City Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => {
                setCityName(e.target.value)
                setError('')
              }}
              placeholder="e.g. Panaji, Jaipur, Ahmedabad, Pune"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 transition-all text-gray-800 bg-white"
              required
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Enter the main or capital city for this state.
            </p>
          </div>

          {/* Display Order & Active status row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="99"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-3 focus:ring-emerald-100 transition-all text-gray-800"
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
                  <div className="w-5 h-5 border-2 border-gray-300 peer-checked:border-emerald-600 peer-checked:bg-emerald-600 rounded-md transition-all flex items-center justify-center">
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save State</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default StateModal
