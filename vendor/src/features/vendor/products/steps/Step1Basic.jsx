import React from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Plus, GripVertical, Trash2 } from 'lucide-react'

export default function Step1Basic() {
  const { register, control, watch, formState: { errors } } = useFormContext()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'highlights'
  })

  const nameValue = watch('name', '')
  const descValue = watch('description', '')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-serif font-bold text-[#002F24] mb-1">Basic Details</h3>
        <p className="text-xs text-gray-500 mb-6">Start by providing the core identity of your product.</p>
        
        <div className="space-y-5 max-w-2xl">
          {/* Name */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product Name *</label>
              <span className={`text-[10px] ${nameValue.length > 120 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {nameValue.length} / 120
              </span>
            </div>
            <input 
              {...register('name')}
              placeholder="e.g. Premium Wood Pressed Groundnut Oil"
              className={`w-full bg-[#F8F2E7]/40 border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${
                errors.name ? 'border-red-300 focus:border-red-500' : 'border-[#D4AF37]/20 focus:border-[#002F24]'
              }`}
            />
            {errors.name && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.name.message}</p>}
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Brand Name *</label>
            <input 
              {...register('brandName')}
              placeholder="Your brand name"
              className={`w-full bg-[#F8F2E7]/40 border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${
                errors.brandName ? 'border-red-300 focus:border-red-500' : 'border-[#D4AF37]/20 focus:border-[#002F24]'
              }`}
            />
            {errors.brandName && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.brandName.message}</p>}
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description *</label>
              <span className={`text-[10px] ${descValue.length < 100 || descValue.length > 3000 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {descValue.length} / 3000
              </span>
            </div>
            <textarea 
              {...register('description')}
              rows={5}
              placeholder="Describe your oil's source, process, and benefits..."
              className={`w-full bg-[#F8F2E7]/40 border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors resize-y min-h-[120px] ${
                errors.description ? 'border-red-300 focus:border-red-500' : 'border-[#D4AF37]/20 focus:border-[#002F24]'
              }`}
            />
            {errors.description && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.description.message}</p>}
          </div>

          {/* Highlights */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Key Highlights</label>
                <p className="text-[10px] text-gray-400">Add up to 6 bullet points (max 120 chars each)</p>
              </div>
              <button 
                type="button"
                onClick={() => { if (fields.length < 6) append({ text: '' }) }}
                disabled={fields.length >= 6}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F2E7]/80 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#002F24] rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" /> Add Highlight
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2 group">
                  <div className="mt-2.5 cursor-grab text-gray-300 hover:text-gray-500">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <input
                      {...register(`highlights.${index}.text`)}
                      placeholder={`Highlight #${index + 1}`}
                      className={`w-full bg-[#F8F2E7]/20 border rounded-lg px-3 py-2 text-xs outline-none transition-colors ${
                        errors.highlights?.[index]?.text ? 'border-red-300 focus:border-red-500' : 'border-[#D4AF37]/20 focus:border-[#002F24]'
                      }`}
                    />
                    {errors.highlights?.[index]?.text && (
                      <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.highlights[index].text.message}</p>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {errors.highlights && !Array.isArray(errors.highlights) && (
                <p className="text-[10px] text-red-500 font-bold">{errors.highlights.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
