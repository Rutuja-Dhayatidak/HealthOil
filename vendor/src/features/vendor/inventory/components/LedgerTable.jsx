import React from 'react'

export default function LedgerTable({ rows }) {
  // Helpers
  const formatDelta = (delta) => {
    if (delta > 0) return <span className="text-green-600 font-bold">+{delta}</span>
    if (delta < 0) return <span className="text-red-600 font-bold">{delta}</span>
    return <span className="text-gray-500 font-bold">0</span>
  }

  const getTypePill = (type) => {
    switch (type) {
      case 'RESTOCK': return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-700 border border-green-100">Restock</span>
      case 'ADJUSTMENT': return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100">Adjustment</span>
      case 'ORDER_RESERVE': return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-orange-50 text-orange-700 border border-orange-100">Order Held</span>
      case 'ORDER_FULFILLED': return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-100">Order Shipped</span>
      default: return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-700 border border-gray-200">{type}</span>
    }
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#D4AF37]/20 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <th className="pb-3 px-4">Date</th>
            <th className="pb-3 px-4">Time</th>
            <th className="pb-3 px-4">Type</th>
            <th className="pb-3 px-4">Delta</th>
            <th className="pb-3 px-4">Before &rarr; After</th>
            <th className="pb-3 px-4 w-1/3">Reason</th>
            <th className="pb-3 px-4">Actor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows?.map((row, idx) => (
            <tr key={idx} className="hover:bg-[#F8F2E7]/20">
              <td className="py-3 px-4">
                <span className="text-gray-800 font-bold text-[11px] whitespace-nowrap">{row.date}</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-col">
                  <span className="text-gray-600 font-medium whitespace-nowrap">{row.time}</span>
                  <span className="text-gray-400 text-[9px]">{row.relativeTime}</span>
                </div>
              </td>
              <td className="py-3 px-4">{getTypePill(row.type)}</td>
              <td className="py-3 px-4">{formatDelta(row.delta)}</td>
              <td className="py-3 px-4 text-gray-500 font-mono text-[10px]">
                {row.before} &rarr; <span className="font-bold text-gray-800">{row.after}</span>
              </td>
              <td className="py-3 px-4 text-gray-700">{row.reason}</td>
              <td className="py-3 px-4 text-gray-500">{row.actor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
