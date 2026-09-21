import { useState, useEffect } from 'react'
import { 
  X, 
  MapPin, 
  Plus, 
  Pencil, 
  Trash2, 
  Power, 
  Loader2, 
  Check, 
  Search, 
  Compass,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  addAreaApi, 
  updateAreaApi, 
  deleteAreaApi, 
  toggleAreaStatusApi 
} from '../ApiServices/cityService'

function AreaManagementModal({ isOpen, onClose, city, onCityUpdated }) {
  const [areas, setAreas] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingArea, setEditingArea] = useState(null)
  
  // Form states
  const [areaName, setAreaName] = useState('')
  const [pincode, setPincode] = useState('')
  const [displayOrder, setDisplayOrder] = useState(1)
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const resetForm = (currentAreasList) => {
    const list = currentAreasList !== undefined ? currentAreasList : (city?.areas || [])
    setEditingArea(null)
    setAreaName('')
    setPincode('')
    setDisplayOrder((list.length || 0) + 1)
    setIsActive(true)
    setError('')
  }

  useEffect(() => {
    if (city) {
      const cityAreas = city.areas || []
      setAreas(cityAreas)
      resetForm(cityAreas)
    } else {
      setAreas([])
      resetForm([])
    }
  }, [city, isOpen])

  if (!isOpen || !city) return null

  const handleEditClick = (area) => {
    setEditingArea(area)
    setAreaName(area.name || '')
    setPincode(area.pincode || '')
    setDisplayOrder(area.displayOrder ?? 1)
    setIsActive(area.isActive !== undefined ? area.isActive : true)
    setError('')
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!areaName.trim()) {
      setError('Area / Sub-city name is required')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const payload = {
        name: areaName.trim(),
        pincode: pincode.trim(),
        displayOrder: displayOrder === '' ? 0 : Number(displayOrder),
        isActive
      }

      if (editingArea) {
        const res = await updateAreaApi(city._id, editingArea._id, payload)
        if (res?.success) {
          toast.success(`Area "${areaName.trim()}" updated successfully!`)
          setAreas(res.city.areas || [])
          onCityUpdated && onCityUpdated(res.city)
          resetForm()
        }
      } else {
        const res = await addAreaApi(city._id, payload)
        if (res?.success) {
          toast.success(`Area "${areaName.trim()}" added to ${city.name}!`)
          setAreas(res.city.areas || [])
          onCityUpdated && onCityUpdated(res.city)
          resetForm()
        }
      }
    } catch (err) {
      console.error('Error saving area:', err)
      const msg = err.message || 'Failed to save area'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (areaId) => {
    try {
      const res = await toggleAreaStatusApi(city._id, areaId)
      if (res?.success) {
        toast.success(res.message || 'Status updated')
        setAreas(res.city.areas || [])
        onCityUpdated && onCityUpdated(res.city)
      }
    } catch (err) {
      console.error('Error toggling status:', err)
      toast.error('Failed to toggle status')
    }
  }

  const handleDeleteArea = async (area) => {
    if (!window.confirm(`Are you sure you want to delete "${area.name}" from ${city.name}?`)) {
      return
    }

    try {
      const res = await deleteAreaApi(city._id, area._id)
      if (res?.success) {
        toast.success(`Area "${area.name}" deleted`)
        setAreas(res.city.areas || [])
        onCityUpdated && onCityUpdated(res.city)
        if (editingArea && editingArea._id === area._id) {
          resetForm()
        }
      }
    } catch (err) {
      console.error('Error deleting area:', err)
      toast.error(err.message || 'Failed to delete area')
    }
  }

  const filteredAreas = areas.filter(a => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (a.name || '').toLowerCase().includes(q) || (a.pincode || '').toLowerCase().includes(q)
  }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden z-10 transition-all border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                  Sub-Cities / Areas in {city.name}
                </h3>
                {city.state && (
                  <span className="text-[11px] font-semibold bg-gray-200/70 text-gray-700 px-2 py-0.5 rounded-md">
                    {city.state}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage specific serviceable localities, sectors, and pincodes under {city.name}.
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Add / Edit Area Card */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4.5 shadow-2xs">
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                {editingArea ? `Edit Area: ${editingArea.name}` : `Add New Area / Sub-City to ${city.name}`}
              </h4>
              {editingArea && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {error && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                
                {/* Area Name */}
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Area / Locality Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    placeholder="e.g. Baner, Kothrud, Wakad"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white text-gray-800"
                    required
                  />
                </div>

                {/* Pincode */}
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 411045"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white text-gray-800"
                  />
                </div>

                {/* Display Order */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white text-gray-800"
                  />
                </div>

                {/* Active Checkbox & Submit */}
                <div className="sm:col-span-2 flex flex-col justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-3 text-xs font-bold text-white bg-[#4f46e5] hover:bg-[#4338ca] rounded-lg transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : editingArea ? (
                      'Save Area'
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Area</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="relative flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 border border-gray-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 rounded transition-all flex items-center justify-center">
                    {isActive && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600">
                    Active (visible for deliveries & orders)
                  </span>
                </label>
              </div>
            </form>
          </div>

          {/* Sub-Cities / Areas List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Configured Areas ({areas.length})
                </h4>
              </div>

              {/* Search areas */}
              {areas.length > 3 && (
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1 w-48 focus-within:border-indigo-400">
                  <Search className="w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter areas..."
                    className="bg-transparent text-xs outline-none w-full text-gray-700 placeholder-gray-400"
                  />
                </div>
              )}
            </div>

            {areas.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <h5 className="text-xs font-bold text-gray-700">No sub-areas added yet</h5>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Use the form above to add localities or sub-cities in {city.name}.
                </p>
              </div>
            ) : filteredAreas.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                No area matching "{searchQuery}"
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3.5">Area Name</th>
                      <th className="py-2.5 px-3.5">Pincode</th>
                      <th className="py-2.5 px-3.5">Display Order</th>
                      <th className="py-2.5 px-3.5">Status</th>
                      <th className="py-2.5 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredAreas.map((area) => (
                      <tr 
                        key={area._id} 
                        className={`transition-colors ${
                          !area.isActive ? 'bg-gray-50/40 text-gray-400' : 'hover:bg-gray-50/50 text-gray-700'
                        } ${editingArea?._id === area._id ? 'bg-indigo-50/40 ring-1 ring-indigo-200' : ''}`}
                      >
                        {/* Name */}
                        <td className="py-2.5 px-3.5 font-bold text-gray-900">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{area.name}</span>
                          </div>
                        </td>

                        {/* Pincode */}
                        <td className="py-2.5 px-3.5 font-mono text-gray-600">
                          {area.pincode || '—'}
                        </td>

                        {/* Display Order */}
                        <td className="py-2.5 px-3.5 font-mono text-gray-500 font-semibold">
                          #{area.displayOrder ?? 0}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3.5">
                          {area.isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Power status */}
                            <button
                              onClick={() => handleToggleStatus(area._id)}
                              title={area.isActive ? 'Deactivate area' : 'Activate area'}
                              className={`p-1 border rounded-md transition-all cursor-pointer ${
                                area.isActive
                                  ? 'border-gray-200 text-gray-400 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50'
                                  : 'border-green-200 text-green-600 hover:bg-green-50'
                              }`}
                            >
                              <Power className="w-3 h-3" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleEditClick(area)}
                              title="Edit area"
                              className="p-1 border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 rounded-md transition-all cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteArea(area)}
                              title="Delete area"
                              className="p-1 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-500 font-medium">
            Total {areas.length} sub-areas configured for {city.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}

export default AreaManagementModal
