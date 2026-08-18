import React from 'react'

export default function StatusPill({ status }) {
  switch (status) {
    case 'IN_STOCK':
      return <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100">In Stock</span>
    case 'LOW_STOCK':
      return <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-100">Low Stock</span>
    case 'OUT_OF_STOCK':
      return <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-100">Out of Stock</span>
    default:
      return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-gray-200">{status}</span>
  }
}
