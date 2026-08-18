import React, { useState } from 'react'
import { useLedger } from '../../../../api/hooks/useLedger'
import LedgerTable from './LedgerTable'
import { EmptyState, ErrorState, Skeleton } from '../../../../components/ui/Primitives'

// For the panel, we might pass variantId if we want to show it for a single variant, 
// or if we just want a global ledger, we omit variantId and adjust useLedger to handle global if needed.
// The prompt says "The drawer opened from a table row is the same component scoped to one variantId."
// So this Panel handles the global ledger (variantId = undefined). Wait, useLedger expects variantId to be enabled.
// Let's assume for the global panel we pass variantId = 'ALL' or we change useLedger to not require variantId for the global view.
// In Phase 1 I added: `enabled: !!filters.variantId` to useLedger. 
// Let's modify useLedger later or just pass variantId='ALL' and enable it.

export default function LedgerPanel({ variantId = 'ALL' }) {
  const [filters, setFilters] = useState({
    variantId,
    type: 'ALL',
    from: '',
    to: '',
    page: 1,
    limit: 10
  })

  const { data, isLoading, isError, error, refetch } = useLedger(filters)

  return (
    <div className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h3 className="font-serif font-bold text-sm text-[#002F24]">Inventory Log Ledger</h3>
        
        <div className="flex items-center gap-3">
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
          
          <input 
            type="date"
            value={filters.from}
            onChange={e => setFilters(prev => ({ ...prev, from: e.target.value, page: 1 }))}
            className="bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#002F24]"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input 
            type="date"
            value={filters.to}
            onChange={e => setFilters(prev => ({ ...prev, to: e.target.value, page: 1 }))}
            className="bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#002F24]"
          />
        </div>
      </div>

      {isLoading && <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      
      {isError && <ErrorState message={error?.message || "Failed to load ledger"} onRetry={refetch} />}
      
      {!isLoading && !isError && (!data?.rows || data.rows.length === 0) && (
        <EmptyState 
          title="No records found" 
          description="There are no inventory logs matching your filters." 
          action={
            <button 
              onClick={() => setFilters({ variantId, type: 'ALL', from: '', to: '', page: 1, limit: 10 })}
              className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700"
            >
              Clear Filters
            </button>
          }
        />
      )}

      {!isLoading && !isError && data?.rows && data.rows.length > 0 && (
        <>
          <LedgerTable rows={data.rows} />
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <span className="text-[10px] text-gray-500">
              Showing page {data?._meta?.page || 1} of {Math.ceil((data?._meta?.total || 1) / (data?._meta?.limit || 10))}
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
  )
}
