import { useQuery, useMutation } from '@tanstack/react-query'
import { exportInventory, importInventory, getImportStatus } from '../../ApiServices/vendorAuthService'

export function useExportInventory(filters) {
  return useQuery({
    queryKey: ['vendor', 'inventory', 'export', filters],
    queryFn: () => {
      const params = {}
      if (filters.q) params.q = filters.q
      if (filters.status) params.status = filters.status
      if (filters.oilType) params.oilType = filters.oilType
      return exportInventory(params)
    },
    enabled: false // Triggered manually
  })
}

export function useImportCsv() {
  return useMutation({
    mutationFn: (formData) => importInventory(formData)
  })
}

export function useCsvJobStatus(jobId) {
  return useQuery({
    queryKey: ['vendor', 'csv-job', jobId],
    queryFn: () => getImportStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Poll every 2s until completed or failed
      if (data && (data.status === 'COMPLETED' || data.status === 'FAILED')) {
        return false
      }
      return 2000
    }
  })
}
