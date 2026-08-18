import React, { useState } from 'react'
import { Drawer } from '../../../../components/ui/Drawer'
import { useLedger } from '../../../../api/hooks/useLedger'
import LedgerTable from './LedgerTable'
import { EmptyState, ErrorState, Skeleton } from '../../../../components/ui/Primitives'

export default function LedgerDrawer({ isOpen, onClose, variantId, productName }) {
  const [filters, setFilters] = useState({
    variantId,
    type: 'ALL',
    from: '',
    to: '',
    page: 1,
    limit: 10
  })

  // We only run the query when the drawer is open and we have a variantId
  const { data, isLoading, isError, error, refetch } = useLedger({
    ...filters,
    variantId // Always ensure it's the current one
  })

  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={onClose} 
      title={<>Ledger: <span className="text-sm text-gray-500 font-normal ml-2">{productName}</span></>}
    >
      <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl border border-[#D4AF37]/20 shadow-sm">
        <div className="flex flex-col">
          <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">Type</label>
          <select 
            value={filters.type}
            onChange={e => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
            className="bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#002F24]"
          >
            <option value="ALL">All Types</option>
            <option value="RESTOCK">Restock</option>
            <option value="ADJUSTMENT">Adjustments</option>
            <option value="ORDER_RESERVE">Order Reserves</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">From Date</label>
          <input 
            type="date"
            value={filters.from}
            onChange={e => setFilters(prev => ({ ...prev, from: e.target.value, page: 1 }))}
            className="bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#002F24]"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">To Date</label>
          <input 
            type="date"
            value={filters.to}
            onChange={e => setFilters(prev => ({ ...prev, to: e.target.value, page: 1 }))}
            className="bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#002F24]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
        {isLoading && <div className="space-y-4 p-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>}
        
        {isError && <div className="p-4"><ErrorState message={error?.message || "Failed to load ledger"} onRetry={refetch} /></div>}
        
        {!isLoading && !isError && (!data?.rows || data.rows.length === 0) && (
          <EmptyState 
            title="No records found" 
            description="There are no inventory logs for this item." 
          />
        )}

        {!isLoading && !isError && data?.rows && data.rows.length > 0 && (
          <>
            <LedgerTable rows={data.rows} />
            
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <span className="text-[10px] text-gray-500">
                Page {data?._meta?.page || 1} of {Math.ceil((data?._meta?.total || 1) / (data?._meta?.limit || 10))}
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
                  disabled={filters.page >= Math.ceil((data?._meta?.total || 1) / (data?._meta?.limit || 10))}
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
    </Drawer>
  )
}
