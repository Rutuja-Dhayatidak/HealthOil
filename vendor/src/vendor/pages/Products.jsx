import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Package, Search, Plus, Edit2, LayoutGrid, List } from 'lucide-react'
import { StatusBadge } from '../components/VendorComponents'
import AddProductWizard from '../../features/vendor/products/AddProductWizard'
import { getProducts, updateProduct } from '../../ApiServices/vendorAuthService'

export default function Products() {
  const location = useLocation()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('list') // list vs grid
  
  const [productsList, setProductsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!location.pathname.startsWith('/vendor/products/add') && !location.pathname.startsWith('/vendor/products/edit/')) {
      fetchProducts()
    }
  }, [location.pathname])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const res = await getProducts()
      if (res && res.data && Array.isArray(res.data)) {
        setProductsList(res.data)
      } else if (res && Array.isArray(res)) {
        setProductsList(res)
      } else {
        setProductsList([])
      }
    } catch (error) {
      console.error('Failed to fetch products', error)
      setProductsList([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (product) => {
    navigate('/vendor/products/edit/' + product._id)
  }

  // If on the add or edit route, render the new wizard instead of the old listing
  if (location.pathname.startsWith('/vendor/products/add') || location.pathname.startsWith('/vendor/products/edit/')) {
    return <AddProductWizard />
  }

  return (
    <div className="space-y-8 text-left text-[#15251F]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#002F24] tracking-tight">Oils Product Catalog</h2>
          <p className="text-xs text-gray-500 mt-1">Add cooking oil varieties, set prices, and list discount offers.</p>
        </div>
        <button 
          onClick={() => navigate('/vendor/products/add')}
          className="bg-[#002F24] hover:bg-[#014D3A] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Oil Type
        </button>
      </div>

      {/* Filter list options */}
      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white border border-[#D4AF37]/25 rounded-xl px-3 py-1.5 w-full sm:w-72 shadow-sm">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="bg-transparent text-xs outline-none w-full text-[#15251F] placeholder-gray-400"
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 border border-[#D4AF37]/20 rounded-xl cursor-pointer ${viewMode === 'list' ? 'bg-[#F8F2E7]' : 'bg-white'}`}
            >
              <List className="w-4 h-4 text-[#002F24]" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 border border-[#D4AF37]/20 rounded-xl cursor-pointer ${viewMode === 'grid' ? 'bg-[#F8F2E7]' : 'bg-white'}`}
            >
              <LayoutGrid className="w-4 h-4 text-[#002F24]" />
            </button>
          </div>
        </div>

        {/* Display listing */}
        {isLoading ? (
          <div className="text-center py-10 text-gray-500 text-sm">Loading products...</div>
        ) : productsList.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">No products found. Add a new product to get started!</div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 text-gray-400 font-bold">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Oil Type</th>
                  <th className="pb-3">Refining Type</th>
                  <th className="pb-3">Starting Price</th>
                  <th className="pb-3">Stock level</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productsList.map((product) => {
                  const firstVariant = product.variants?.[0] || {}
                  const totalStock = product.variants?.reduce((acc, v) => acc + (v.currentStock || 0), 0) || 0
                  
                  return (
                    <tr key={product._id} className="text-gray-600 hover:bg-[#F8F2E7]/20 transition-colors">
                      <td className="py-3.5 font-bold text-[#002F24] flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#F8F2E7]/70 border border-[#D4AF37]/20 flex items-center justify-center text-[#002F24] shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        {product.basicDetails?.name}
                      </td>
                      <td className="py-3.5 text-gray-500">{product.compliance?.oilType || 'N/A'}</td>
                      <td className="py-3.5">{product.compliance?.extractionMethod || 'N/A'}</td>
                      <td className="py-3.5 font-semibold text-[#002F24]">₹{firstVariant.price || 0}</td>
                      <td className="py-3.5">{totalStock} Units</td>
                      <td className="py-3.5">
                        <StatusBadge status={product.status === 'PENDING_APPROVAL' ? 'Pending Approval' : product.status} />
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-1.5 bg-[#F8F2E7]/60 border border-[#D4AF37]/20 rounded-lg text-gray-500 hover:text-[#002F24] cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsList.map((product) => {
              const firstVariant = product.variants?.[0] || {}
              const totalStock = product.variants?.reduce((acc, v) => acc + (v.currentStock || 0), 0) || 0
              
              return (
                <div key={product._id} className="bg-[#F8F2E7]/25 border border-[#D4AF37]/20 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[#D4AF37]/40 transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#D4AF37]/25 flex items-center justify-center text-[#002F24]">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#002F24] text-xs truncate max-w-[140px]">{product.basicDetails?.name}</h4>
                        <span className="text-[9px] text-gray-400 font-bold block">{product.compliance?.oilType}</span>
                      </div>
                    </div>
                    <StatusBadge status={product.status === 'PENDING_APPROVAL' ? 'Pending Approval' : product.status} />
                  </div>
                  <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                    <p>💰 Price: <span className="font-bold text-[#002F24]">₹{firstVariant.price || 0}</span></p>
                    <p>📦 Stock: <span className="font-bold text-[#002F24]">{totalStock} Units</span></p>
                    <p>🌾 Type: <span className="font-semibold text-gray-600">{product.compliance?.extractionMethod || 'N/A'}</span></p>
                  </div>
                  <div className="mt-5 border-t border-[#D4AF37]/10 pt-4 flex justify-end gap-2">
                    <button 
                      onClick={() => handleEditClick(product)}
                      className="px-3 py-1.5 bg-white border border-[#D4AF37]/35 rounded-lg text-[10px] font-bold text-[#002F24] hover:bg-[#002F24] hover:text-white transition-colors cursor-pointer"
                    >
                      Edit Product
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
