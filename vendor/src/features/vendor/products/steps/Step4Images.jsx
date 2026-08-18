import React from 'react'
import { useFormContext } from 'react-hook-form'
import { UploadCloud, Image as ImageIcon, X, Trash2, Plus } from 'lucide-react'

// Helper to safely get image preview URL
const getImageSrc = (file) => {
  if (!file) return null
  if (typeof file === 'string') return file
  if (file instanceof Blob || file instanceof File) {
    try {
      return URL.createObjectURL(file)
    } catch (e) {
      return null
    }
  }
  return null
}

export default function Step4Images() {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
  
  const mainImage = watch('mainImage')
  const gallery = watch('gallery') || []

  const mainImageSrc = getImageSrc(mainImage)

  const handleMainImageDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setValue('mainImage', e.dataTransfer.files[0], { shouldValidate: true })
    }
  }

  const handleGalleryDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).slice(0, 5 - gallery.length)
      if (newFiles.length > 0) {
        setValue('gallery', [...gallery, ...newFiles], { shouldValidate: true })
      }
    }
  }

  const removeGalleryImage = (index) => {
    setValue('gallery', gallery.filter((_, i) => i !== index), { shouldValidate: true })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-serif font-bold text-[#002F24] mb-1">Product Images</h3>
        <p className="text-xs text-gray-500 mb-6">Upload high-quality images. The main image is what customers see first.</p>
        
        <div className="space-y-8 max-w-3xl">
          
          {/* Main Image */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Main Product Image *</label>
            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={handleMainImageDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors relative ${
                mainImageSrc ? 'border-[#002F24] bg-[#F8F2E7]/20' : 'border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#F8F2E7]/10'
              } ${errors.mainImage ? 'border-red-400 bg-red-50/50' : ''}`}
            >
              {!mainImageSrc ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#F8F2E7]/50 flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Click or drag image to upload main photo</p>
                  <p className="text-xs text-gray-400 mb-4">PNG, JPG up to 5MB. 1000x1000px recommended.</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="main-image-upload" 
                    onChange={e => {
                      if (e.target.files?.[0]) setValue('mainImage', e.target.files[0], { shouldValidate: true })
                    }} 
                  />
                  <label htmlFor="main-image-upload" className="px-4 py-2 bg-[#F8F2E7] border border-[#D4AF37]/30 text-[#002F24] rounded-lg text-xs font-bold cursor-pointer hover:bg-[#F8F2E7]/80">
                    Select Image
                  </label>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-lg border border-gray-200 overflow-hidden mb-3 bg-white">
                    <img src={mainImageSrc} alt="Preview" className="w-full h-full object-contain" />
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setValue('mainImage', null, { shouldValidate: true }) }}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-gray-700">{mainImage?.name || 'Main Image'}</p>
                </div>
              )}
            </div>
            {errors.mainImage && <p className="text-[10px] text-red-500 mt-2 font-bold">{errors.mainImage.message}</p>}
          </div>

          {/* Gallery Images */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image Gallery</label>
                <p className="text-[10px] text-gray-400">Add up to 5 supporting images (nutrition label, lifestyle shots)</p>
              </div>
              <span className="text-[10px] font-bold text-gray-500">{gallery.length} / 5</span>
            </div>
            
            <div 
              onDragOver={e => e.preventDefault()}
              onDrop={handleGalleryDrop}
              className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                gallery.length >= 5 ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#F8F2E7]/5'
              } ${errors.gallery ? 'border-red-400 bg-red-50/50' : ''}`}
            >
              {gallery.length === 0 ? (
                <div className="text-center py-4">
                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 mb-3">Drag & drop multiple images here</p>
                  <input 
                    type="file" 
                    multiple
                    accept="image/*" 
                    className="hidden" 
                    id="gallery-upload" 
                    disabled={gallery.length >= 5}
                    onChange={e => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files).slice(0, 5 - gallery.length)
                        setValue('gallery', [...gallery, ...newFiles], { shouldValidate: true })
                      }
                    }} 
                  />
                  <label htmlFor="gallery-upload" className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-50">
                    Browse Files
                  </label>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {gallery.map((file, i) => {
                      const src = getImageSrc(file)
                      if (!src) return null
                      return (
                        <div key={i} className="relative w-20 h-20 rounded-lg border border-gray-200 bg-white overflow-hidden group">
                          <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeGalleryImage(i)}
                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )
                    })}
                    
                    {gallery.length < 5 && (
                      <label htmlFor="gallery-upload-more" className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37] cursor-pointer transition-colors">
                        <Plus className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-bold">Add More</span>
                        <input 
                          type="file" 
                          multiple
                          accept="image/*" 
                          className="hidden" 
                          id="gallery-upload-more" 
                          onChange={e => {
                            if (e.target.files) {
                              const newFiles = Array.from(e.target.files).slice(0, 5 - gallery.length)
                              setValue('gallery', [...gallery, ...newFiles], { shouldValidate: true })
                            }
                          }} 
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.gallery && <p className="text-[10px] text-red-500 mt-2 font-bold">{errors.gallery.message}</p>}
          </div>

        </div>
      </div>
    </div>
  )
}
