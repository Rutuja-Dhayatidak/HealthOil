import { useQuery } from '@tanstack/react-query'
import { getOilConfig } from '../../ApiServices/vendorAuthService'

export function useOilConfig() {
  return useQuery({
    queryKey: ['vendor', 'config', 'oil-options'],
    queryFn: async () => {
      const res = await getOilConfig()
      return res?.data || {}
    },
    staleTime: 1000 * 60 * 60 * 24 // Cache for 24 hours
  })
}
