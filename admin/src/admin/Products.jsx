import { useState, useEffect } from 'react'
import { Package, Search, Plus, CheckCircle, XCircle } from 'lucide-react'
import { getAllProducts, approveProduct, rejectProduct } from '../ApiServices/adminService'
import toast from 'react-hot-toast'
import ProductDetailsDrawer from './ProductDetailsDrawer'

function Products({ refreshStats }) {
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await getAllProducts()
      if (res.success) {
        setProductsList(res.products)
      }
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleApprove = async (id) => {
    try {
      const res = await approveProduct(id)
      if (res.success) {
        toast.success('Product approved successfully')
        fetchProducts()
        if (refreshStats) refreshStats()
      }
    } catch (error) {
      toast.error('Failed to approve product')
    }
  }

  const handleReject = async (id) => {
    try {
      const res = await rejectProduct(id)
      if (res.success) {
        toast.success('Product rejected successfully')
        fetchProducts()
        if (refreshStats) refreshStats()
      }
    } catch (error) {
      toast.error('Failed to reject product')
    }
  }

  const filteredProducts = productsList.filter(p => 
    p.status === 'ACTIVE' &&
    (p.basicDetails?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.vendor?.business?.storeName || p.vendor?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#031d13] tracking-tight">Vendor Products</h2>
        <p className="text-xs text-gray-500 mt-1">Review, approve or reject products submitted by vendors.</p>
      </div>

      <div className="bg-white border border-[#b89547]/20 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white border border-[#b89547]/25 rounded-xl px-3 py-1.5 w-full sm:w-72 shadow-sm">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products or vendors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs outline-none w-full text-[#031d13] placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-10 text-center text-gray-500 text-sm">Loading products...</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#b89547]/20 text-gray-400 font-bold">
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Vendor</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Stock Info</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-500">No products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    // Summarize total stock and variants
                    const totalVariants = product.variants?.length || 0;
                    const totalStock = product.variants?.reduce((acc, v) => acc + (v.currentStock || 0), 0) || 0;
                    
                    return (
                      <tr 
                        key={product._id} 
                        className="text-gray-600 hover:bg-[#FAF4E8]/20 transition-colors duration-150 cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(product)
                          setIsDrawerOpen(true)
                        }}
                      >
                        <td className="py-3.5 font-bold text-[#031d13] flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[#FAF4E8]/70 border border-[#b89547]/20 flex items-center justify-center text-[#031d13] shrink-0">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div>{product.basicDetails?.name}</div>
                            <div className="text-[9px] text-gray-400 font-normal">{product.variants?.[0]?.price ? `₹${product.variants[0].price} starting` : ''}</div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="font-semibold text-[#031d13]">{product.vendor?.business?.storeName || product.vendor?.fullName || 'Unknown'}</span>
                          <div className="text-[9px] text-gray-400">{product.vendor?.email}</div>
                        </td>
                        <td className="py-3.5 text-gray-500">{product.compliance?.oilType || 'Other'}</td>
                        <td className="py-3.5">
                          <div className="text-[#031d13] font-semibold">{totalStock} Units</div>
                          <div className="text-[9px] text-gray-400">{totalVariants} Variants</div>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            product.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 
                            product.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600' :
                            'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {product.status === 'PENDING_APPROVAL' ? 'PENDING' : product.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          {product.status === 'PENDING_APPROVAL' && (
                            <>
                              <button 
                                onClick={() => handleApprove(product._id)}
                                className="p-1 text-emerald-500 hover:text-emerald-700 transition-colors duration-200 cursor-pointer"
                                title="Approve Product"
                              >
                                <CheckCircle className="w-4 h-4 inline" />
                              </button>
                              <button 
                                onClick={() => handleReject(product._id)}
                                className="p-1 text-rose-500 hover:text-rose-700 transition-colors duration-200 cursor-pointer"
                                title="Reject Product"
                              >
                                <XCircle className="w-4 h-4 inline" />
                              </button>
                            </>
                          )}
                          {product.status === 'ACTIVE' && (
                            <button 
                              onClick={() => handleReject(product._id)}
                              className="p-1 text-rose-500 hover:text-rose-700 transition-colors duration-200 cursor-pointer"
                              title="Reject Product"
                            >
                              <XCircle className="w-4 h-4 inline" />
                            </button>
                          )}
                          {product.status === 'REJECTED' && (
                            <button 
                              onClick={() => handleApprove(product._id)}
                              className="p-1 text-emerald-500 hover:text-emerald-700 transition-colors duration-200 cursor-pointer"
                              title="Approve Product"
                            >
                              <CheckCircle className="w-4 h-4 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ProductDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  )
}

export default Products
