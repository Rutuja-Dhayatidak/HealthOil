import React, { useState } from 'react'
import { Download, Upload } from 'lucide-react'
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
    limit: 20
  })
  const [activeTab, setActiveTab] = useState('inventory') // 'inventory' | 'ledger'
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(null) // { variantId, productName }
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [adjustConfig, setAdjustConfig] = useState({ isOpen: false, variantId: null, type: 'add' })

  // Debounce search in a real scenario
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

  return (
    <div className="space-y-6 text-left w-full mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#002F24]">Stock & Inventory</h2>
          <p className="text-xs text-gray-500 mt-1">Manage physical stock, set low-stock alerts, and view reserved quantities.</p>
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
          className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'inventory' 
              ? 'border-[#002F24] text-[#002F24]' 
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          Stock & Inventory
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
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
            <div className="w-full md:w-72">
              <input 
                type="text" 
                placeholder="Search by product name or SKU..." 
                value={filters.q}
                onChange={handleSearch}
                className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#002F24]"
              />
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
                  onClick={() => setFilters({ q: '', status: 'ALL', page: 1, limit: 20 })}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700"
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
              
              {/* Pagination placeholder (server-side pagination control) */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-[10px] text-gray-500">
                  Showing page {data?._meta?.page || 1} of {Math.ceil((data?._meta?.total || 1) / (data?._meta?.limit || 20))}
                </span>
                <div className="flex gap-2">
                  <button 
                    disabled={filters.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="px-3 py-1 border border-gray-200 rounded text-[10px] font-bold disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={filters.page >= Math.ceil((data?._meta?.total || 1) / (data?._meta?.limit || 20))}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="px-3 py-1 border border-gray-200 rounded text-[10px] font-bold disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
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







