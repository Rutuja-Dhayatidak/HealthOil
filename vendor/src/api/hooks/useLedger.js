import { useQuery } from '@tanstack/react-query'
import { getLedger } from '../../ApiServices/vendorAuthService'

export function useLedger(filters) {
  return useQuery({
    queryKey: ['vendor', 'ledger', filters.variantId, filters],
    queryFn: async () => {
      const params = {}
      if (filters.variantId) params.variantId = filters.variantId
      if (filters.type) params.type = filters.type
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to
      if (filters.page) params.page = filters.page
      if (filters.limit) params.limit = filters.limit
      
      const res = await getLedger(params)
      const data = res?.data || {}
      if (res?.meta) {
        data._meta = res.meta
      }
      return data
    },
    enabled: !!filters.variantId,
    keepPreviousData: true
  })
}
