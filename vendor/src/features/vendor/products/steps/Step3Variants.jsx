import React from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Box } from 'lucide-react'

export default function Step3Variants() {
  const { register, control, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants'
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#002F24] mb-1">Sizes, Pricing & Stock</h3>
            <p className="text-xs text-gray-500">Add all the size variants (e.g., 500ml, 1L, 5L) available for this oil.</p>
          </div>
          <button 
            type="button"
            onClick={() => append({ size: '', unit: 'Litre', sku: '', price: 0, mrp: 0, initialStock: 0, lowStockThreshold: 10 })}
            className="px-4 py-2 bg-white border border-[#D4AF37]/40 text-[#002F24] rounded-xl text-xs font-bold hover:bg-[#F8F2E7]/40 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Variant
          </button>
        </div>

        {errors.variants && !Array.isArray(errors.variants) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-bold">
            {errors.variants.message}
          </div>
        )}
        
        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative group transition-colors focus-within:border-[#D4AF37]/50">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-[#002F24] font-bold text-sm">
                  <Box className="w-4 h-4 text-[#D4AF37]" />
                  Variant #{index + 1}
                </div>
                {fields.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => remove(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remove variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Size & Unit */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Volume/Weight *</label>
                  <div className="flex gap-2">
                    <input 
                      {...register(`variants.${index}.size`)}
                      placeholder="e.g. 1"
                      className={`w-full bg-[#F8F2E7]/40 border rounded-lg px-3 py-2 text-xs outline-none transition-colors ${
                        errors.variants?.[index]?.size ? 'border-red-300 focus:border-red-500' : 'border-[#D4AF37]/20 focus:border-[#002F24]'
                      }`}
                    />
                    <select 
                      {...register(`variants.${index}.unit`)}
                      className="bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-lg px-2 py-2 text-xs outline-none focus:border-[#002F24] shrink-0"
                    >
                      <option value="Litre">Litre</option>
                      <option value="ml">ml</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>
                  {errors.variants?.[index]?.size && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.variants[index].size.message}</p>}
                </div>

                {/* SKU */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">SKU Code *</label>
                  <input 
                    {...register(`variants.${index}.sku`)}
                    placeholder="MUST-1L-001"
                    className={`w-full bg-[#F8F2E7]/40 border rounded-lg px-3 py-2 text-xs outline-none transition-colors ${
                      errors.variants?.[index]?.sku ? 'border-red-300 focus:border-red-500' : 'border-[#D4AF37]/20 focus:border-[#002F24]'
                    }`}
                  />
                  {errors.variants?.[index]?.sku && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.variants[index].sku.message}</p>}
                </div>

                {/* Pricing */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Selling Price (₹) *</label>
                  <input 
                    type="number"
                    {...register(`variants.${index}.price`)}
                    className={`w-full bg-[#F8F2E7]/40 border rounded-lg px-3 py-2 text-xs outline-none transition-colors ${
                      errors.variants?.[index]?.price ? 'border-red-300 focus:border-red-500' : 'border-[#D4AF37]/20 focus:border-[#002F24]'
                    }`}
                  />
                  {errors.variants?.[index]?.price && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.variants[index].price.message}</p>}
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">MRP (₹) *</label>
                  <input 
                    type="number"
                    {...register(`variants.${index}.mrp`)}
                    className={`w-full bg-[#F8F2E7]/40 border rounded-lg px-3 py-2 text-xs outline-none transition-colors ${
                      errors.variants?.[index]?.mrp ? 'border-red-300 focus:border-red-500' : 'border-[#D4AF37]/20 focus:border-[#002F24]'
                    }`}
                  />
                  {errors.variants?.[index]?.mrp && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.variants[index].mrp.message}</p>}
                </div>

                {/* Stock */}
                <div className="col-span-2 md:col-span-1 md:col-start-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Initial Stock</label>
                  <input 
                    type="number"
                    {...register(`variants.${index}.initialStock`)}
                    className={`w-full bg-[#F8F2E7]/40 border rounded-lg px-3 py-2 text-xs outline-none transition-colors ${
                      errors.variants?.[index]?.initialStock ? 'border-red-300 focus:border-red-500' : 'border-[#D4AF37]/20 focus:border-[#002F24]'
                    }`}
                  />
                  {errors.variants?.[index]?.initialStock && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.variants[index].initialStock.message}</p>}
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Low Stock Alert at</label>
                  <input 
                    type="number"
                    {...register(`variants.${index}.lowStockThreshold`)}
                    className={`w-full bg-[#F8F2E7]/40 border rounded-lg px-3 py-2 text-xs outline-none transition-colors ${
                      errors.variants?.[index]?.lowStockThreshold ? 'border-red-300 focus:border-red-500' : 'border-[#D4AF37]/20 focus:border-[#002F24]'
                    }`}
                  />
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
