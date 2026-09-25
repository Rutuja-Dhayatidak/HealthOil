import React, { useState, useEffect, useRef } from 'react'
import { 
  Bell, 
  CheckCircle2, 
  FileCheck, 
  CheckSquare, 
  ShoppingBag, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  X, 
  Check, 
  Trash2, 
  ExternalLink,
  Loader2,
  Inbox
} from 'lucide-react'

export default function NotificationsPanel({ isOpen, onClose, onNavigate, stats }) {
  const panelRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'unread' | 'system'
  
  // Initial notifications constructed from live stats + system events
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    // Build real-time notifications list based on stats
    const timer = setTimeout(() => {
      const generated = []

      if (stats?.vendorVerification > 0) {
        generated.push({
          id: 'notif-vendor-verif',
          type: 'verification',
          icon: FileCheck,
          iconBg: 'bg-amber-100 text-amber-700',
          title: 'Pending Vendor Verification',
          message: `${stats.vendorVerification} new vendor application(s) awaiting your review and approval.`,
          time: 'Just now',
          unread: true,
          link: '/admin/verification',
          category: 'action'
        })
      }

      if (stats?.productApproval > 0) {
        generated.push({
          id: 'notif-prod-approval',
          type: 'approval',
          icon: CheckSquare,
          iconBg: 'bg-blue-100 text-blue-700',
          title: 'Product Approval Required',
          message: `${stats.productApproval} product listing(s) submitted by vendors require catalog verification.`,
          time: '10 mins ago',
          unread: true,
          link: '/admin/approval',
          category: 'action'
        })
      }

      if (stats?.orders > 0) {
        generated.push({
          id: 'notif-orders',
          type: 'orders',
          icon: ShoppingBag,
          iconBg: 'bg-emerald-100 text-emerald-700',
          title: 'New Orders Received',
          message: `${stats.orders} active orders currently processing in the system.`,
          time: '25 mins ago',
          unread: true,
          link: '/admin/orders',
          category: 'action'
        })
      }

      if (stats?.returns > 0) {
        generated.push({
          id: 'notif-returns',
          type: 'returns',
          icon: RotateCcw,
          iconBg: 'bg-rose-100 text-rose-700',
          title: 'Return Request Filed',
          message: `${stats.returns} return/refund request(s) require admin resolution.`,
          time: '1 hour ago',
          unread: true,
          link: '/admin/returns',
          category: 'action'
        })
      }

      // Default system health notification
      generated.push({
        id: 'notif-system-health',
        type: 'system',
        icon: ShieldCheck,
        iconBg: 'bg-teal-100 text-teal-700',
        title: 'System Operational Status',
        message: 'All payment gateways, SMS services, and database backups are healthy.',
        time: 'Today, 09:00 AM',
        unread: false,
        link: '/admin/settings',
        category: 'system'
      })

      setNotifications(generated)
      setLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [isOpen, stats])

  // Close panel on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const markSingleAsRead = (id, e) => {
    e.stopPropagation()
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.unread
    if (filter === 'system') return n.type === 'system'
    return true
  })

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div 
      ref={panelRef}
      className="absolute right-0 top-14 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="px-5 py-4 bg-[#0b3b84] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-300" />
          <h3 className="font-bold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              className="p-1 hover:bg-white/20 rounded-md transition-colors text-xs font-medium text-blue-100 cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Read all</span>
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-md transition-colors text-white cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center border-b border-gray-100 bg-gray-50/70 px-4 py-2 gap-2 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filter === 'unread' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('system')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filter === 'system' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          System
        </button>

        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="ml-auto text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            title="Clear all notifications"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content Body */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State */
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-3 border border-blue-100">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-800 mb-1">No Notifications</h4>
            <p className="text-xs text-gray-500 max-w-[220px]">
              {filter === 'unread' 
                ? "You have read all your notifications!" 
                : "You're all caught up! No pending alerts or system notifications."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const Icon = notif.icon
            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.link) {
                    onNavigate(notif.link)
                    onClose()
                  }
                }}
                className={`p-4 hover:bg-blue-50/50 transition-colors cursor-pointer flex gap-3 relative group ${
                  notif.unread ? 'bg-blue-50/20' : 'bg-white'
                }`}
              >
                {/* Left Icon Badge */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${notif.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Right Text Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h5 className={`text-xs font-bold truncate ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </h5>
                    <span className="text-[10px] text-gray-400 shrink-0 font-medium">{notif.time}</span>
                  </div>

                  <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Action link indicator */}
                  {notif.link && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-blue-600 group-hover:underline">
                      <span>View details</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Unread Indicator & Mark Read Button */}
                {notif.unread && (
                  <button
                    onClick={(e) => markSingleAsRead(notif.id, e)}
                    title="Mark as read"
                    className="absolute right-3 top-4 w-2.5 h-2.5 rounded-full bg-blue-600 hover:scale-125 transition-transform"
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
        <button
          onClick={() => {
            onNavigate('/admin/support')
            onClose()
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          View All Support & System Activity →
        </button>
      </div>
    </div>
  )
}
