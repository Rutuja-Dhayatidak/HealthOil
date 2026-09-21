import React, { useState } from 'react'
import { Download, Upload, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import { useInventory } from '../../../api/hooks/useInventory'
import InventoryTable from './components/InventoryTable'
import FilterChips from './components/FilterChips'
import LedgerPanel from './components/LedgerPanel'
import LedgerDrawer from './components/LedgerDrawer'
import AdjustStockDrawer from './components/AdjustStockDrawer'
import CsvUploadModal from './components/CsvUploadModal'
import { useExportInventory } from '../../../api/hooks/useCsvJob'
import { EmptyState, ErrorState, Skeleton } from '../../../components/ui/Primitives'
import toast from 'react-hot-toast'

export default function InventoryPage() {
  const [filters, setFilters] = useState({
    q: '',
    status: 'ALL', // 'ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'
    page: 1,
    limit: 15
  })
  const [activeTab, setActiveTab] = useState('inventory') // 'inventory' | 'ledger'
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(null) // { variantId, productName }
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [adjustConfig, setAdjustConfig] = useState({ isOpen: false, variantId: null, type: 'add' })

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, q: e.target.value, page: 1 }))
  }

  const { data, isLoading, isError, error, refetch } = useInventory(filters)
  const { refetch: fetchExport, isFetching: isExporting } = useExportInventory(filters)

  const handleDownloadCsv = async () => {
    toast.loading('Preparing export...', { id: 'csv-export' })
    try {
      const { data: exportData } = await fetchExport()
      
      const url = window.URL.createObjectURL(new Blob([exportData]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'inventory_export.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('CSV downloaded successfully!', { id: 'csv-export' })
    } catch (err) {
      toast.error('Failed to export CSV', { id: 'csv-export' })
    }
  }

  const currentPage = filters.page || 1
  const limit = filters.limit || 15
  const totalCount = data?._meta?.total || 0
  const totalPages = data?._meta?.totalPages || Math.ceil(totalCount / limit) || 1

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return
    setFilters(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate pagination page numbers
  const getPageNumbers = () => {
    const total = totalPages
    const current = currentPage
    const pages = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('...')
      
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }
    return pages
  }

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1
  const endRecord = Math.min(currentPage * limit, totalCount)

  return (
    <div className="space-y-6 text-left w-full mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#002F24]">Stock & Inventory</h2>
          <p className="text-xs text-gray-500 mt-1">Manage physical stock, set low-stock alerts, and view reserved quantities (15 items per page).</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCsvModal(true)}
            className="px-4 py-2 bg-white border border-gray-200 text-[#002F24] rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
          <button 
            onClick={handleDownloadCsv}
            disabled={isExporting}
            className="px-4 py-2 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-bold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'inventory' 
              ? 'border-[#002F24] text-[#002F24]' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          Stock & Inventory
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 text-sm font-bold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'ledger' 
              ? 'border-[#002F24] text-[#002F24]' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          Inventory Log Ledger
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm flex flex-col min-h-[500px]">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <FilterChips 
              currentStatus={filters.status} 
              onChange={(status) => setFilters(prev => ({ ...prev, status, page: 1 }))}
              meta={data?._meta}
            />
            <div className="w-full md:w-80 relative">
              <input 
                type="text" 
                placeholder="Search by product name or SKU..." 
                value={filters.q}
                onChange={handleSearch}
                className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#002F24]"
              />
              {filters.q && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, q: '', page: 1 }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Content States */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          )}

          {isError && (
            <ErrorState message={error?.message || "Failed to load inventory"} onRetry={refetch} />
          )}

          {!isLoading && !isError && (!data?.rows || data.rows.length === 0) && (
            <EmptyState 
              title="No inventory found" 
              description="We couldn't find any items matching your filters." 
              action={
                <button 
                  onClick={() => setFilters({ q: '', status: 'ALL', page: 1, limit: 15 })}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Clear Filters
                </button>
              } 
            />
          )}

          {!isLoading && !isError && data?.rows && data.rows.length > 0 && (
            <>
              <InventoryTable 
                rows={data.rows} 
                filters={filters} 
                onRowClick={(variantId, productName) => {
                  setSelectedVariant({ variantId, productName })
                  setDrawerOpen(true)
                }}
                onAdjustClick={(variantId, currentStock, type) => {
                  setAdjustConfig({ isOpen: true, variantId, type })
                }}
              />
              
              {/* Pagination Controls */}
              {totalCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 gap-4">
                  <div className="text-xs text-gray-500">
                    Showing <span className="font-bold text-[#002F24]">{startRecord}</span> to <span className="font-bold text-[#002F24]">{endRecord}</span> of <span className="font-bold text-[#002F24]">{totalCount}</span> items (15 / page)
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* First Page */}
                    <button 
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="First Page"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>

                    {/* Previous Page */}
                    <button 
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-3 h-8 rounded-lg border border-gray-200 flex items-center gap-1 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Prev
                    </button>

                    {/* Numbered Page Buttons */}
                    <div className="flex items-center gap-1 mx-1">
                      {getPageNumbers().map((page, idx) => {
                        if (page === '...') {
                          return <span key={`dots-${idx}`} className="px-1 text-xs text-gray-400">...</span>
                        }
                        const isCurrent = page === currentPage
                        return (
                          <button
                            key={`page-${page}`}
                            type="button"
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-[#002F24] text-white shadow-sm ring-1 ring-[#002F24]'
                                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                    </div>

                    {/* Next Page */}
                    <button 
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-3 h-8 rounded-lg border border-gray-200 flex items-center gap-1 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Last Page */}
                    <button 
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Last Page"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Ledger Panel */}
      {activeTab === 'ledger' && <LedgerPanel />}

      {/* Ledger Drawer for specific variant */}
      {selectedVariant && (
        <LedgerDrawer 
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          variantId={selectedVariant.variantId}
          productName={selectedVariant.productName}
        />
      )}
      {/* CSV Upload Modal */}
      <CsvUploadModal 
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
      />

      {adjustConfig.isOpen && (
        <AdjustStockDrawer
          isOpen={adjustConfig.isOpen}
          onClose={() => setAdjustConfig({ ...adjustConfig, isOpen: false })}
          variantId={adjustConfig.variantId}
          type={adjustConfig.type}
          filters={filters}
        />
      )}
    </div>
  )
}
