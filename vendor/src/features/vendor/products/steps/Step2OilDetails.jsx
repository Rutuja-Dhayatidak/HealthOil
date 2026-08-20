import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { useOilConfig } from '../../../../api/hooks/useOilConfig'
import { Skeleton } from '../../../../components/ui/Primitives'

export default function Step2OilDetails() {
  const { register, control, formState: { errors } } = useFormContext()
  const { data: config, isLoading } = useOilConfig()

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
  }

  // Fallback options in case API fails or is empty
  const oilTypes = config?.oilTypes || ['Mustard', 'Groundnut', 'Coconut', 'Sesame', 'Olive', 'Flaxseed']
  const refiningTypes = config?.refiningTypes || ['Unrefined / Cold Pressed', 'Refined', 'Filtered']
  const extractionMethods = config?.extractionMethods || ['Wood Pressed (Kachi Ghani)', 'Cold Pressed', 'Expeller Pressed', 'Solvent Extracted']
  const packagingTypes = config?.packagingTypes || ['PET Bottle', 'Glass Bottle', 'Tin Can', 'Pouch']

  const nutritionFields = [
    { name: 'energy', label: 'Energy (kcal)' },
    { name: 'totalFat', label: 'Total Fat (g)' },
    { name: 'saturatedFat', label: 'Saturated Fat (g)' },
    { name: 'transFat', label: 'Trans Fat (g)' },
    { name: 'mufa', label: 'MUFA (g)' },
    { name: 'pufa', label: 'PUFA (g)' },
    { name: 'cholesterol', label: 'Cholesterol (mg)' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-serif font-bold text-[#002F24] mb-1">Oil Details & Compliance</h3>
        <p className="text-xs text-gray-500 mb-6">Specify the technical details and nutritional information per 100ml.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          
          {/* Left Column: Properties */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-gray-800 border-b border-gray-100 pb-2">Properties</h4>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Oil Type *</label>
              <select {...register('oilType')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#002F24]">
                <option value="">Select Oil Type</option>
                {oilTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {errors.oilType && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.oilType.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Extraction Method *</label>
              <select {...register('extractionMethod')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#002F24]">
                <option value="">Select Method</option>
                {extractionMethods.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {errors.extractionMethod && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.extractionMethod.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Refining Type *</label>
              <select {...register('refiningType')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#002F24]">
                <option value="">Select Refining</option>
                {refiningTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Packaging Type *</label>
              <select {...register('packagingType')} className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#002F24]">
                <option value="">Select Packaging</option>
                {packagingTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" {...register('isOrganic')} id="isOrganic" className="w-4 h-4 text-[#002F24] rounded border-gray-300 focus:ring-[#002F24]" />
              <label htmlFor="isOrganic" className="text-sm text-gray-700 font-medium cursor-pointer">This product is Certified Organic</label>
            </div>
          </div>

          {/* Right Column: Compliance & Nutrition */}
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-gray-800 border-b border-gray-100 pb-2">Compliance & Nutrition (per 100ml)</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">FSSAI License No</label>
                <Controller
                  control={control}
                  name="fssaiLicenseNo"
                  render={({ field: { onChange, value } }) => (
                    <div className="relative">
                      <input 
                        maxLength="14"
                        placeholder="14 digit number"
                        value={value || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '')
                          onChange(val)
                        }}
                        className={`w-full bg-[#F8F2E7]/40 border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${
                          errors.fssaiLicenseNo ? 'border-red-300' : 'border-[#D4AF37]/20 focus:border-[#002F24]'
                        }`}
                      />
                      {value && value.length === 14 && !errors.fssaiLicenseNo && (
                        <span className="absolute right-3 top-3 text-green-500 font-bold text-sm">✓</span>
                      )}
                    </div>
                  )}
                />
                {errors.fssaiLicenseNo && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.fssaiLicenseNo.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">HSN Code</label>
                <input 
                  {...register('hsnCode')}
                  placeholder="e.g. 1508"
                  className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#002F24]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Shelf Life (Days) *</label>
              <input 
                type="number"
                {...register('shelfLifeDays')}
                placeholder="e.g. 180"
                className="w-full bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#002F24]"
              />
            </div>

            <div className="bg-[#F8F2E7]/20 border border-[#D4AF37]/20 p-4 rounded-xl">
              <div className="grid grid-cols-2 gap-3">
                {nutritionFields.map(f => (
                  <div key={f.name}>
                    <label className="block text-[9px] font-bold text-gray-500 tracking-wider mb-1">{f.label}</label>
                    <input 
                      type="number"
                      step="0.01"
                      {...register(`nutrition.${f.name}`)}
                      className="w-full bg-white border border-[#D4AF37]/30 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#002F24]"
                    />
                    {errors.nutrition?.[f.name] && <p className="text-[9px] text-red-500 mt-0.5">{errors.nutrition[f.name].message}</p>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
