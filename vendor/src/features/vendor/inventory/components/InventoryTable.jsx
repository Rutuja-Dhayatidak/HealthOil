import React from 'react'
import { Package } from 'lucide-react'
import StatusPill from './StatusPill'
import AdjustStockPopover from './AdjustStockPopover'
import { Table } from '../../../../components/ui/Primitives'

// Helper to format image URL
const getProductImageUrl = (img) => {
  if (!img) return null
  let rawUrl = ''
  if (typeof img === 'string') {
    rawUrl = img
  } else if (typeof img === 'object') {
    rawUrl = img.url || img.fileLocation || img.secure_url || img.path || ''
  }

  if (!rawUrl) return null
  if (rawUrl.startsWith('http') || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
    return rawUrl
  }
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl.replace(/\\/g, '/')}`
  return `http://localhost:5000${cleanPath}`
}

export default function InventoryTable({ rows, filters, onRowClick, onAdjustClick }) {
  const handleRowClick = (variantId, productName) => {
    if (onRowClick) onRowClick(variantId, productName)
  }

  return (
    <Table>
      <thead>
        <tr className="border-b border-[#D4AF37]/20 text-[10px] text-gray-500 uppercase tracking-wider">
          <th className="pb-3 px-4 font-bold">Oil Item</th>
          <th className="pb-3 px-4 font-bold">SKU Code</th>
          <th className="pb-3 px-4 font-bold">Variant</th>
          <th className="pb-3 px-4 font-bold text-right">Physical Stock</th>
          <th className="pb-3 px-4 font-bold text-right">Reserved</th>
          <th className="pb-3 px-4 font-bold text-right">Available</th>
          <th className="pb-3 px-4 font-bold text-center">Status</th>
          <th className="pb-3 px-4 font-bold text-center">Adjust Stock</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((row) => {
          const imgUrl = getProductImageUrl(row.productImage)

          return (
            <tr 
              key={row.variantId} 
              onClick={() => handleRowClick(row.variantId, row.productName)}
              className="hover:bg-[#F8F2E7]/20 cursor-pointer transition-colors group"
            >
              {/* Product Thumbnail & Name */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                    {imgUrl ? (
                      <img 
                        src={imgUrl} 
                        alt={row.productName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = 'flex'
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full items-center justify-center bg-slate-50 text-slate-400 ${imgUrl ? 'hidden' : 'flex'}`}>
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-gray-800 text-xs block group-hover:text-blue-600 transition-colors truncate max-w-[220px]">
                      {row.productName}
                    </span>
                    {row.oilType && (
                      <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                        {row.oilType} {row.brandName ? `• ${row.brandName}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </td>

              <td className="py-3 px-4">
                <span className="font-mono text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 border border-gray-100">
                  {row.skuCode}
                </span>
              </td>
              <td className="py-3 px-4 text-xs text-gray-600">{row.variantLabel}</td>
              <td className="py-3 px-4 text-right font-medium text-gray-700 text-xs">{row.physicalStock}</td>
              <td className="py-3 px-4 text-right">
                <span className="text-gray-400 text-xs font-medium cursor-help border-b border-dashed border-gray-300" title="Held by pending orders">
                  {row.reserved}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="font-bold text-[#002F24] text-sm">{row.available}</span>
              </td>
              <td className="py-3 px-4 text-center">
                <StatusPill status={row.stockStatus} />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <button 
                    disabled={row.physicalStock === row.reserved}
                    onClick={(e) => { e.stopPropagation(); onAdjustClick(row.variantId, row.physicalStock, 'subtract'); }}
                    className={`w-7 h-7 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                      row.physicalStock === row.reserved 
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                        : 'border-red-200 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <span className="text-sm font-bold">-</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAdjustClick(row.variantId, row.physicalStock, 'add'); }}
                    className="w-7 h-7 rounded border border-green-200 text-green-600 hover:bg-green-50 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-bold">+</span>
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}
