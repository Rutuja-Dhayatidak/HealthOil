import { useState, useEffect, Fragment } from 'react'
import { 
  MapPin, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Power, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUpDown,
  Filter,
  Compass,
  ChevronDown,
  ChevronRight,
  Layers
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  getCitiesApi, 
  createCityApi, 
  updateCityApi, 
  deleteCityApi, 
  toggleCityStatusApi 
} from '../ApiServices/cityService'
import CityModal from './CityModal'
import AreaManagementModal from './AreaManagementModal'
import StateModal from './StateModal'

function CityManagement() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState({ total: 0, active: 0 })
  const [expandedRows, setExpandedRows] = useState({})

  // State Modal state
  const [isStateModalOpen, setIsStateModalOpen] = useState(false)

  // City Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Area Modal states
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false)
  const [areaCity, setAreaCity] = useState(null)

  const fetchCities = async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery.trim()) params.search = searchQuery.trim()
      if (statusFilter !== 'all') params.status = statusFilter

      const res = await getCitiesApi(params)
      if (res?.success) {
        setCities(res.cities || [])
        setStats({
          total: res.totalCount || 0,
          active: res.activeCount || 0
        })
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
      toast.error('Failed to load cities')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCities()
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery, statusFilter])

  const toggleRowExpand = (cityId) => {
    setExpandedRows(prev => ({
      ...prev,
      [cityId]: !prev[cityId]
    }))
  }

  const handleOpenAddModal = () => {
    setSelectedCity(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (city) => {
    setSelectedCity(city)
    setIsModalOpen(true)
  }

  const handleOpenAreaModal = (city) => {
    setAreaCity(city)
    setIsAreaModalOpen(true)
  }

  const handleCityUpdatedFromArea = (updatedCity) => {
    setCities(prev => prev.map(c => c._id === updatedCity._id ? updatedCity : c))
    if (areaCity && areaCity._id === updatedCity._id) {
      setAreaCity(updatedCity)
    }
  }

  const handleSaveCity = async (formData, cityId) => {
    try {
      setIsSaving(true)
      if (cityId) {
        const res = await updateCityApi(cityId, formData)
        if (res?.success) {
          toast.success('City updated successfully!')
          setIsModalOpen(false)
          fetchCities()
        }
      } else {
        const res = await createCityApi(formData)
        if (res?.success) {
          toast.success('City created successfully!')
          setIsModalOpen(false)
          fetchCities()
        }
      }
    } catch (error) {
      console.error('Save city error:', error)
      toast.error(error.message || 'Failed to save city')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveState = async (formData) => {
    try {
      setIsSaving(true)
      const res = await createCityApi(formData)
      if (res?.success) {
        toast.success(`State "${res.city.state}" and city "${res.city.name}" added successfully!`)
        setIsStateModalOpen(false)
        fetchCities()
      }
    } catch (error) {
      console.error('Save state error:', error)
      toast.error(error.message || 'Failed to save state')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await toggleCityStatusApi(id)
      if (res?.success) {
        toast.success(res.message || 'Status updated')
        setCities(prev => prev.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c))
        setStats(prev => ({
          ...prev,
          active: currentStatus ? Math.max(0, prev.active - 1) : prev.active + 1
        }))
      }
    } catch (error) {
      console.error('Toggle status error:', error)
      toast.error('Failed to update status')
    }
  }

  const handleDeleteCity = async (city) => {
    if (!window.confirm(`Are you sure you want to delete "${city.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await deleteCityApi(city._id)
      if (res?.success) {
        toast.success('City deleted successfully')
        fetchCities()
      }
    } catch (error) {
      console.error('Delete city error:', error)
      toast.error(error.message || 'Failed to delete city')
    }
  }

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">City & Area Management</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage Main Cities, Sub-Cities / Localities, Cloudinary header images, and ordering for discovery and deliveries.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setIsStateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add State</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add City</span>
          </button>
        </div>
      </div>

      {/* Counter & Search Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <h3 className="text-sm font-bold text-gray-800">
            Active Cities <span className="text-gray-500 font-normal">({stats.active} of {stats.total})</span>
          </h3>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'active' ? 'bg-white text-green-700 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'inactive' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-full sm:w-64 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities or sub-areas..."
              className="bg-transparent text-xs outline-none w-full text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-10"></th>
                <th className="py-3.5 px-4">City Image</th>
                <th className="py-3.5 px-4">City Name</th>
                <th className="py-3.5 px-4">State</th>
                <th className="py-3.5 px-4">Sub-Cities / Areas</th>
                <th className="py-3.5 px-4">Display Order</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs text-gray-400 mt-2 font-medium">Loading cities...</p>
                  </td>
                </tr>
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-3">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-700">No cities found</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                      {searchQuery ? `No results match "${searchQuery}"` : 'Get started by adding your first serviceable city.'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={handleOpenAddModal}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add First City
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                cities.map((city) => {
                  const areaCount = city.areas?.length || 0
                  const isExpanded = !!expandedRows[city._id]

                  return (
                    <Fragment key={city._id}>
                      {/* Main Row */}
                      <tr 
                        className={`transition-colors duration-150 ${
                          !city.isActive ? 'bg-gray-50/40 text-gray-500' : 'hover:bg-gray-50/60 text-gray-700'
                        }`}
                      >
                        {/* Expand Toggle */}
                        <td className="py-3.5 pl-4 pr-1">
                          <button
                            onClick={() => toggleRowExpand(city._id)}
                            className="p-1 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                            title={isExpanded ? "Collapse areas" : "Expand areas"}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* City Image */}
                        <td className="py-3.5 px-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                            {city.image ? (
                              <img 
                                src={city.image} 
                                alt={city.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-full h-full items-center justify-center text-gray-400"
                              style={{ display: city.image ? 'none' : 'flex' }}
                            >
                              <ImageIcon className="w-5 h-5 text-gray-300" />
                            </div>
                          </div>
                        </td>

                        {/* City Name */}
                        <td className="py-3.5 px-4 font-bold text-gray-900 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{city.name}</span>
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                              {city.vendorCount || 0} {city.vendorCount === 1 ? 'Vendor' : 'Vendors'}
                            </span>
                          </div>
                        </td>

                        {/* State */}
                        <td className="py-3.5 px-4 text-gray-600 font-medium">
                          {city.state || '—'}
                        </td>

                        {/* Sub-Cities / Areas Badge & Action */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleOpenAreaModal(city)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                              areaCount > 0 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-indigo-600'
                            }`}
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>{areaCount > 0 ? `${areaCount} Sub-Areas` : '+ Add Areas'}</span>
                          </button>
                        </td>

                        {/* Display Order */}
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-500">
                          #{city.displayOrder ?? 0}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {city.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Power / Toggle Status */}
                            <button
                              onClick={() => handleToggleStatus(city._id, city.isActive)}
                              title={city.isActive ? 'Deactivate city' : 'Activate city'}
                              className={`p-1.5 border rounded-lg transition-all cursor-pointer ${
                                city.isActive
                                  ? 'border-gray-200 text-gray-400 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50'
                                  : 'border-green-200 text-green-600 hover:bg-green-50'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit City */}
                            <button
                              onClick={() => handleOpenEditModal(city)}
                              title="Edit city"
                              className="p-1.5 border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete City */}
                            <button
                              onClick={() => handleDeleteCity(city)}
                              title="Delete city"
                              className="p-1.5 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Sub-cities / Areas Row */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/20 border-b border-gray-100">
                          <td colSpan="8" className="py-3 px-6">
                            <div className="pl-6 border-l-2 border-indigo-300 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                                  Serviceable Sub-Cities / Localities in {city.name} ({areaCount})
                                </span>
                                <button
                                  onClick={() => handleOpenAreaModal(city)}
                                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  Manage / Add Areas
                                </button>
                              </div>

                              {areaCount === 0 ? (
                                <p className="text-[11px] text-gray-400 italic">
                                  No specific sub-cities added yet. Click "+ Add Areas" to configure delivery localities for {city.name}.
                                </p>
                              ) : (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {city.areas.map(area => (
                                    <div
                                      key={area._id}
                                      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs border ${
                                        area.isActive
                                          ? 'bg-white border-gray-200 text-gray-800 shadow-2xs'
                                          : 'bg-gray-100 border-gray-200 text-gray-400 line-through'
                                      }`}
                                    >
                                      <span className="font-semibold">{area.name}</span>
                                      {area.pincode && (
                                        <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-1 py-0.2 rounded border border-gray-200">
                                          {area.pincode}
                                        </span>
                                      )}
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                        {area.vendorCount || 0} {area.vendorCount === 1 ? 'vendor' : 'vendors'}
                                      </span>
                                      <span className="text-[10px] text-gray-400">#{area.displayOrder ?? 0}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add State Modal */}
      <StateModal
        isOpen={isStateModalOpen}
        onClose={() => setIsStateModalOpen(false)}
        onSave={handleSaveState}
        isLoading={isSaving}
      />

      {/* Add / Edit City Modal */}
      <CityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        city={selectedCity}
        onSave={handleSaveCity}
        isLoading={isSaving}
      />

      {/* Manage Areas Modal */}
      <AreaManagementModal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        city={areaCity}
        onCityUpdated={handleCityUpdatedFromArea}
      />
    </div>
  )
}

export default CityManagement
