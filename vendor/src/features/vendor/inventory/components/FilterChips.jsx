import React from 'react'

export default function FilterChips({ currentStatus, onChange, meta }) {
  const chips = [
    { id: 'ALL', label: 'All', count: meta?.totalSkus || 0 },
    { id: 'IN_STOCK', label: 'In Stock', count: meta?.inStock || 0 },
    { id: 'LOW_STOCK', label: 'Low Stock', count: meta?.lowStock || 0 },
    { id: 'OUT_OF_STOCK', label: 'Out of Stock', count: meta?.outOfStock || 0 }
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map(chip => (
        <button
          key={chip.id}
          onClick={() => onChange(chip.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
            currentStatus === chip.id
              ? 'bg-[#002F24] text-white border border-[#002F24]'
              : 'bg-[#F8F2E7]/40 text-gray-600 border border-[#D4AF37]/20 hover:bg-[#F8F2E7]'
          }`}
        >
          {chip.label}
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] leading-none ${
            currentStatus === chip.id ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
          }`}>
            {chip.count}
          </span>
        </button>
      ))}
    </div>
  )
}
