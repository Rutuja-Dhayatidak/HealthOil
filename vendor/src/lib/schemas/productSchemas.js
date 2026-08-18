import { z } from 'zod'

export const basicDetailsSchema = z.object({
  name: z.string().min(10, 'Name must be at least 10 characters').max(120, 'Name cannot exceed 120 characters'),
  brandName: z.string().min(2, 'Brand name is required'),
  description: z.string().min(100, 'Description must be at least 100 characters').max(3000, 'Description cannot exceed 3000 characters'),
  highlights: z.array(z.object({
    id: z.string().optional(),
    text: z.string().max(120, 'Highlight cannot exceed 120 characters')
  })).max(6, 'Maximum 6 highlights allowed')
})

export const oilDetailsSchema = z.object({
  oilType: z.string().min(1, 'Select an oil type'),
  refiningType: z.string().min(1, 'Select a refining type'),
  extractionMethod: z.string().min(1, 'Select an extraction method'),
  packagingType: z.string().min(1, 'Select a packaging type'),
  isOrganic: z.boolean(),
  fssaiLicenseNo: z.string().regex(/^[0-9]{14}$/, 'FSSAI License must be exactly 14 digits'),
  hsnCode: z.string().min(4, 'Valid HSN code required'),
  shelfLifeDays: z.coerce.number().min(30, 'Shelf life must be at least 30 days'),
  nutrition: z.object({
    energy: z.coerce.number().min(0),
    totalFat: z.coerce.number().min(0),
    saturatedFat: z.coerce.number().min(0),
    transFat: z.coerce.number().min(0),
    mufa: z.coerce.number().min(0),
    pufa: z.coerce.number().min(0),
    cholesterol: z.coerce.number().min(0)
  })
})

export const variantsSchema = z.object({
  variants: z.array(z.object({
    id: z.string().optional(),
    size: z.string().min(1, 'Size is required'),
    unit: z.string().min(1, 'Unit is required'),
    sku: z.string().min(3, 'SKU must be at least 3 chars'),
    price: z.coerce.number().min(1, 'Price must be > 0'),
    mrp: z.coerce.number().min(1, 'MRP must be > 0'),
    initialStock: z.coerce.number().min(0, 'Initial stock cannot be negative'),
    lowStockThreshold: z.coerce.number().min(0)
  })).min(1, 'At least one variant is required')
})

export const imagesSchema = z.object({
  mainImage: z.any().refine(val => val, "Main image is required"),
  gallery: z.array(z.any()).max(5, "Maximum 5 gallery images allowed")
})
