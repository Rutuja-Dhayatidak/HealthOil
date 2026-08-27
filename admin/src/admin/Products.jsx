import { useState, useEffect } from 'react'
import { Package, Search, Plus, CheckCircle, XCircle, Pencil, Trash2, X, Loader2, AlertTriangle } from 'lucide-react'
import { getAllProducts, approveProduct, rejectProduct, updateProductAdmin, deleteProductAdmin } from '../ApiServices/adminService'
import toast from 'react-hot-toast'
import ProductDetailsDrawer from './ProductDetailsDrawer'

function Products({ refreshStats }) {
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Edit and Delete states
  const [editModalProduct, setEditModalProduct] = useState(null)
  const [deleteModalProduct, setDeleteModalProduct] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    brandName: '',
    oilType: '',
    price: 0,
    mrp: 0,
    currentStock: 0,
    status: 'ACTIVE',
    description: ''
  })

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

  const handleOpenEdit = (product) => {
    setEditModalProduct(product)
    const v0 = product.variants?.[0] || {}
    setEditForm({
      name: product.basicDetails?.name || '',
      brandName: product.basicDetails?.brandName || '',
      oilType: product.compliance?.oilType || '',
      price: v0.price || 0,
      mrp: v0.mrp || 0,
      currentStock: v0.currentStock || 0,
      status: product.status || 'ACTIVE',
      description: product.basicDetails?.description || product.basicDetails?.shortDescription || ''
    })
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editModalProduct || isActionLoading) return

    try {
      setIsActionLoading(true)
      const updatedVariants = [...(editModalProduct.variants || [])]
      if (updatedVariants.length > 0) {
        updatedVariants[0] = {
          ...updatedVariants[0],
          price: Number(editForm.price),
          mrp: Number(editForm.mrp),
          currentStock: Number(editForm.currentStock)
        }
      } else {
        updatedVariants.push({
          size: '1',
          unit: 'Litre',
          price: Number(editForm.price),
          mrp: Number(editForm.mrp),
          currentStock: Number(editForm.currentStock)
        })
      }

      const payload = {
        'basicDetails.name': editForm.name,
        'basicDetails.brandName': editForm.brandName,
        'basicDetails.description': editForm.description,
        'compliance.oilType': editForm.oilType,
        status: editForm.status,
        variants: updatedVariants
      }

      if (editForm.status === 'ACTIVE' && editModalProduct.status !== 'ACTIVE') {
        payload.approvedAt = new Date()
      }

      const res = await updateProductAdmin(editModalProduct._id, payload)
      if (res.success) {
        toast.success('Product updated successfully!')
        setEditModalProduct(null)
        fetchProducts()
        if (refreshStats) refreshStats()
      }
    } catch (error) {
      toast.error('Failed to update product')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteModalProduct || isActionLoading) return

    try {
      setIsActionLoading(true)
      const res = await deleteProductAdmin(deleteModalProduct._id)
      if (res.success) {
        toast.success('Product deleted successfully!')
        setDeleteModalProduct(null)
        fetchProducts()
        if (refreshStats) refreshStats()
      }
    } catch (error) {
      toast.error('Failed to delete product')
    } finally {
      setIsActionLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
        <p className="text-xs text-gray-500 mt-1">Review, edit, delete or manage products submitted by vendors.</p>
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
                    const totalVariants = product.variants?.length || 0
                    const totalStock = product.variants?.reduce((acc, v) => acc + (v.currentStock || 0), 0) || 0
                    
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
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              product.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 
                              product.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600' :
                              'bg-yellow-500/10 text-yellow-600'
                            }`}>
                              {product.status === 'PENDING_APPROVAL' ? 'PENDING' : product.status}
                            </span>
                            {product.status === 'ACTIVE' && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                {formatDate(product.approvedAt || product.updatedAt || product.createdAt)}
                              </span>
                            )}
                            {product.status === 'REJECTED' && (
                              <span className="text-[10px] text-rose-400 font-medium">
                                {formatDate(product.rejectedAt || product.updatedAt || product.createdAt)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Edit Button */}
                          <button 
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 text-[#031d13] hover:text-[#b89547] hover:bg-[#FAF4E8] rounded-lg transition-colors border border-gray-200/60 inline-flex items-center justify-center cursor-pointer shadow-xs"
                            title="Edit Product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button 
                            onClick={() => setDeleteModalProduct(product)}
                            className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-colors border border-rose-200 inline-flex items-center justify-center cursor-pointer shadow-xs"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Edit Product Modal */}
      {editModalProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[110] flex items-center justify-center p-4">
          <div className="bg-white border border-[#b89547]/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setEditModalProduct(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF4E8] border border-[#b89547]/30 flex items-center justify-center text-[#031d13]">
                <Pencil className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#031d13]">Edit Product</h3>
                <p className="text-xs text-gray-500">Update details for {editModalProduct.basicDetails?.name}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#b89547]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Brand Name</label>
                  <input 
                    type="text" 
                    value={editForm.brandName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, brandName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#b89547]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Category / Oil Type</label>
                  <input 
                    type="text" 
                    value={editForm.oilType}
                    onChange={(e) => setEditForm(prev => ({ ...prev, oilType: e.target.value }))}
                    placeholder="e.g. Groundnut Oil"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#b89547]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#b89547]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">MRP (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editForm.mrp}
                    onChange={(e) => setEditForm(prev => ({ ...prev, mrp: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#b89547]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Stock Units</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editForm.currentStock}
                    onChange={(e) => setEditForm(prev => ({ ...prev, currentStock: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#b89547]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Status</label>
                <select 
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#b89547] bg-white font-medium"
                >
                  <option value="ACTIVE">ACTIVE (Published)</option>
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL (Review)</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#b89547]"
                  placeholder="Short description of the product..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => setEditModalProduct(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-bold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2 bg-[#031d13] text-white rounded-xl font-bold hover:bg-[#002F24] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {isActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[110] flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif font-bold text-lg text-gray-900 mb-1">Delete Product?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteModalProduct.basicDetails?.name}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => setDeleteModalProduct(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-bold text-xs transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
              >
                {isActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  )
}

export default Products
