import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createProduct, updateProduct, uploadProductImages, publishProduct, checkSku, getProduct } from '../../ApiServices/vendorAuthService'

export function useProduct(id) {
  // hook for getting a single product
  return useQuery({
    queryKey: ['vendor', 'product', id],
    queryFn: () => getProduct(id),
    enabled: !!id
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productData) => createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'product'] })
    }
  })
}

export function useUpdateProduct(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updateData) => updateProduct(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'product', id] })
    }
  })
}

export function useUploadProductImages() {
  return useMutation({
    mutationFn: ({ id, formData }) => uploadProductImages(id, formData)
  })
}

export function usePublishProduct(id) {
  return useMutation({
    mutationFn: () => publishProduct(id)
  })
}

export function useCheckSku() {
  return useMutation({
    mutationFn: (skuCode) => checkSku(skuCode)
  })
}
