import React, { useState, useRef, useEffect } from 'react'
import { Plus, Minus, Check, X, Loader2 } from 'lucide-react'
import { useAdjustStock } from '../../../../api/hooks/useInventory'
import { generateIdempotencyKey } from '../../../../lib/idempotency'
import toast from 'react-hot-toast'

export default function AdjustStockPopover({ variantId, currentStock, type, disabled, disabledReason, filters }) {
  const [isOpen, setIsOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const popoverRef = useRef(null)

  const adjustStockMutation = useAdjustStock()

  const quickReasons = type === 'add' 
    ? ['New stock received', 'Stock count correction', 'Returned from customer']
    : ['Damaged', 'Stock count correction', 'Returned to supplier']

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (reason.length < 3) {
      toast.error('Reason must be at least 3 characters')
      return
    }

    const idempotencyKey = generateIdempotencyKey()
    const payload = {
      mode: type === 'add' ? 'ADD' : 'SUBTRACT',
      quantity: Number(quantity),
      reason
    }

    adjustStockMutation.mutate(
      { variantId, data: payload, idempotencyKey, filters },
      {
        onSuccess: () => {
          toast.success(`Stock ${type === 'add' ? 'added' : 'reduced'} successfully!`)
          setIsOpen(false)
          setQuantity(1)
          setReason('')
        },
        onError: (err) => {
          if (err.code === 'STOCK_RESERVED') {
            toast.error(err.message || 'Cannot reduce below reserved stock held by pending orders.')
          } else {
            toast.error(err.message || 'Failed to adjust stock')
          }
        }
      }
    )
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        disabled={disabled}
        title={disabledReason}
        className={`w-7 h-7 rounded border flex items-center justify-center transition-colors ${
          disabled 
            ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
            : type === 'add'
              ? 'border-green-200 text-green-600 hover:bg-green-50'
              : 'border-red-200 text-red-600 hover:bg-red-50'
        }`}
      >
        {type === 'add' ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#D4AF37]/20 p-5 z-50 cursor-default" onClick={e => e.stopPropagation()}>
          <h4 className="text-xs font-bold text-gray-800 mb-4">{type === 'add' ? 'Add to Stock' : 'Reduce Stock'}</h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Quantity</label>
              <input 
                type="number" 
                min="1"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#002F24]"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Reason</label>
              <input 
                type="text" 
                required
                minLength="3"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Stock count correction"
                className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#002F24] mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {quickReasons.map(r => (
                  <button 
                    key={r} 
                    type="button" 
                    onClick={() => setReason(r)}
                    className="px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-[9px] text-gray-600 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded text-xs text-gray-600 font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={adjustStockMutation.isPending}
                className="px-3 py-1.5 bg-[#002F24] hover:bg-[#014D3A] text-white rounded text-xs font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {adjustStockMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
