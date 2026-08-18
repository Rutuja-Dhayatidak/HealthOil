import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAdjustStock } from '../../../../api/hooks/useInventory'
import { generateIdempotencyKey } from '../../../../lib/idempotency'
import toast from 'react-hot-toast'
import { Drawer } from '../../../../components/ui/Drawer'

export default function AdjustStockDrawer({ isOpen, onClose, variantId, type, filters }) {
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')

  const adjustStockMutation = useAdjustStock()

  const quickReasons = type === 'add' 
    ? ['New stock received', 'Stock count correction', 'Returned from customer']
    : ['Damaged', 'Stock count correction', 'Returned to supplier']

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setReason('')
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
          onClose()
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

  if (!isOpen) return null

  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={onClose} 
      title={type === 'add' ? 'Add Stock' : 'Reduce Stock'}
      maxWidth="w-[30vw] min-w-[350px]"
    >
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Quantity</label>
          <input 
            type="number" 
            min="1"
            required
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#002F24]"
          />
        </div>
        
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Reason</label>
          <input 
            type="text" 
            required
            minLength="3"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Stock count correction"
            className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#002F24] mb-3"
          />
          <div className="flex flex-wrap gap-2">
            {quickReasons.map(r => (
              <button 
                key={r} 
                type="button" 
                onClick={() => setReason(r)}
                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-600 transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={adjustStockMutation.isPending}
            className={`flex-1 py-3 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
              type === 'add' ? 'bg-[#002F24] hover:bg-[#014D3A]' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {adjustStockMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Adjustment'}
          </button>
        </div>
      </form>
    </Drawer>
  )
}
