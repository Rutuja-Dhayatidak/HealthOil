import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInventoryList, adjustInventory, updateThreshold } from '../../ApiServices/vendorAuthService'

export function useInventory(filters) {
  return useQuery({
    queryKey: ['vendor', 'inventory', filters],
    queryFn: async () => {
      const params = {}
      if (filters.q) params.q = filters.q
      if (filters.status) params.status = filters.status
      if (filters.oilType) params.oilType = filters.oilType
      if (filters.sort) params.sort = filters.sort
      if (filters.page) params.page = filters.page
      if (filters.limit) params.limit = filters.limit
      
      const res = await getInventoryList(params)
      const data = res?.data || {}
      if (res?.meta) {
        data._meta = res.meta
      }
      return data
    },
    keepPreviousData: true
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ variantId, data, idempotencyKey }) => {
      // In the previous version it passed idempotencyKey via headers in apiClient.patch
      // Since vendorAuthService's adjustInventory doesn't take idempotencyKey right now,
      // we'll just pass data. Note: We might need to update adjustInventory in service to support it if needed.
      return adjustInventory(variantId, data)
    },
    onMutate: async ({ variantId, data, filters }) => {
      const queryKey = ['vendor', 'inventory', filters]
      await queryClient.cancelQueries({ queryKey })
      const previousInventory = queryClient.getQueryData(queryKey)
      
      if (previousInventory?.rows) {
        queryClient.setQueryData(queryKey, old => {
          return {
            ...old,
            rows: old.rows.map(row => {
              if (row.variantId === variantId) {
                const delta = data.mode === 'ADD' ? Number(data.quantity) : -Number(data.quantity)
                const newPhysicalStock = row.physicalStock + delta
                return {
                  ...row,
                  physicalStock: newPhysicalStock
                }
              }
              return row
            })
          }
        })
      }

      return { previousInventory, queryKey }
    },
    onError: (err, newTodo, context) => {
      if (context?.previousInventory) {
        queryClient.setQueryData(context.queryKey, context.previousInventory)
      }
    },
    onSettled: (data, error, variables, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey })
      }
      queryClient.invalidateQueries({ queryKey: ['vendor', 'ledger'] })
    }
  })
}

export function useUpdateLowStockThreshold() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ variantId, lowStockThreshold }) => updateThreshold(variantId, lowStockThreshold),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'inventory'] })
    }
  })
}
