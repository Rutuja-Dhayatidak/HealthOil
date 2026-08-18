import { DollarSign, ShoppingBag, Box, TrendingUp, AlertTriangle } from 'lucide-react'

function Dashboard() {
  const stats = [
    { name: "Today's Sales", value: '₹4,850', change: '+15.2%', isUp: true, icon: DollarSign, color: 'bg-emerald-500/10 text-emerald-600' },
    { name: 'Pending Orders', value: '5 Orders', change: 'Action Required', isUp: false, icon: ShoppingBag, color: 'bg-amber-500/10 text-amber-600' },
    { name: 'Active Oil Items', value: '12 Listed', change: 'Normal', isUp: true, icon: Box, color: 'bg-[#b89547]/10 text-[#b89547]' },
    { name: 'Out of Stock', value: '1 Item', change: 'Restock Alert', isUp: false, icon: AlertTriangle, color: 'bg-rose-500/10 text-rose-600' }
  ]

  const incomingOrders = [
    { id: '#PO-9840', customer: 'Amit Sharma', product: 'Groundnut Oil (5L)', amount: '₹950', time: '10 mins ago', status: 'Pending Prep' },
    { id: '#PO-9841', customer: 'Priyanka Sen', product: 'Coconut Oil (2L)', amount: '₹510', time: '1 hr ago', status: 'In Transit' },
  ]

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#031d13] tracking-tight">Vendor Dashboard</h2>
        <p className="text-xs text-gray-500 mt-1">Live overview of your shop orders, stock levels, and daily revenue.</p>
      </div>

      {/* Grid Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-[#b89547]/20 rounded-2xl p-5 hover:border-[#b89547]/40 transition-all duration-300 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.name}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#031d13]">{stat.value}</span>
              <span className={`text-[10px] font-bold ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Orders queue & action widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Incoming Orders */}
        <div className="lg:col-span-8 bg-white border border-[#b89547]/20 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif font-bold text-[#031d13] text-base">Active Shop Orders</h3>
            <button className="text-xs text-[#b89547] hover:text-[#031d13] hover:underline font-bold transition-colors duration-200 cursor-pointer">
              View Order History
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#b89547]/20 text-gray-400 font-bold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Oil Item</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Time Received</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {incomingOrders.map((order, idx) => (
                  <tr key={idx} className="text-gray-600 hover:bg-[#FAF4E8]/20 transition-colors duration-150">
                    <td className="py-3.5 font-mono font-bold text-[#b89547]">{order.id}</td>
                    <td className="py-3.5 font-bold text-[#031d13]">{order.customer}</td>
                    <td className="py-3.5">{order.product}</td>
                    <td className="py-3.5 font-bold text-[#031d13]">{order.amount}</td>
                    <td className="py-3.5 text-gray-400">{order.time}</td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        order.status.includes('Pending') 
                          ? 'bg-amber-500/10 text-amber-600' 
                          : 'bg-emerald-500/10 text-emerald-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rapid Actions */}
        <div className="lg:col-span-4 bg-white border border-[#b89547]/20 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-serif font-bold text-[#031d13] text-base mb-4">Store Status</h3>
            <div className="flex items-center justify-between bg-[#FAF4E8]/35 border border-[#b89547]/25 p-4 rounded-xl mb-6">
              <div>
                <h4 className="text-xs font-bold text-[#031d13]">Accepting Orders</h4>
                <span className="text-[10px] text-gray-500">Currently open for business</span>
              </div>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
            </div>

            <div className="space-y-3">
              <button className="w-full py-3 px-4 rounded-xl bg-[#031d13] hover:bg-[#b89547] text-[#FAF4E8] hover:text-[#031d13] text-xs font-bold transition-all duration-300 text-center cursor-pointer shadow-sm">
                Add New Oil Listing
              </button>
              <button className="w-full py-3 px-4 rounded-xl bg-white border border-[#b89547]/30 hover:bg-[#FAF4E8]/60 text-[#031d13] text-xs font-bold transition-all duration-300 text-center cursor-pointer">
                View Earnings Ledger
              </button>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100 mt-6 text-center text-[10px] text-gray-400">
            PureOil Vendor v1.0.0
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
