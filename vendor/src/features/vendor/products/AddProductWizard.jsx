import React, { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { basicDetailsSchema, oilDetailsSchema, variantsSchema, imagesSchema } from '../../../lib/schemas/productSchemas'
import Step1Basic from './steps/Step1Basic'
import Step2OilDetails from './steps/Step2OilDetails'
import Step3Variants from './steps/Step3Variants'
import Step4Images from './steps/Step4Images'
import { Check, ChevronRight, Loader2 } from 'lucide-react'
import { useCreateProduct, useUploadProductImages, useProduct, useUpdateProduct } from '../../../api/hooks/useProducts'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'

// Steps config
const steps = [
  { id: 1, title: 'Basic Details', schema: basicDetailsSchema },
  { id: 2, title: 'Oil & Compliance', schema: oilDetailsSchema },
  { id: 3, title: 'Variants & Pricing', schema: variantsSchema },
  { id: 4, title: 'Images & Publish', schema: imagesSchema }
]

export default function AddProductWizard() {
  const { id } = useParams()
  const isEditMode = !!id
  const [currentStep, setCurrentStep] = useState(1)

  const getInitialValues = () => {
    const saved = localStorage.getItem('vendor_product_draft')
    if (saved && !isEditMode) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return {
      name: '',
      brandName: '',
      description: '',
      highlights: [{ text: '' }],
      oilType: '',
      refiningType: '',
      extractionMethod: '',
      packagingType: '',
      isOrganic: false,
      fssaiLicenseNo: '',
      hsnCode: '',
      shelfLifeDays: '',
      nutrition: {
        energy: 0, totalFat: 0, saturatedFat: 0, transFat: 0, mufa: 0, pufa: 0, cholesterol: 0
      },
      variants: [{ size: '1', unit: 'Litre', sku: '', price: 0, mrp: 0, initialStock: 0, lowStockThreshold: 10 }],
      mainImage: null,
      gallery: []
    }
  }

  const methods = useForm({
    resolver: steps[currentStep - 1]?.schema ? zodResolver(steps[currentStep - 1].schema) : undefined,
    mode: 'onTouched',
    defaultValues: getInitialValues()
  })

  const { handleSubmit, trigger, reset } = methods
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct(id)
  const uploadMutation = useUploadProductImages()
  const navigate = useNavigate()

  const { data: productDataRes, isLoading: isFetchingProduct } = useProduct(id)

  useEffect(() => {
    if (isEditMode && productDataRes?.data) {
      const p = productDataRes.data
      
      reset({
        name: p.basicDetails?.name || '',
        brandName: p.basicDetails?.brandName || '',
        description: p.basicDetails?.description || '',
        highlights: p.basicDetails?.highlights?.length ? p.basicDetails.highlights : [{ text: '' }],
        oilType: p.compliance?.oilType || '',
        refiningType: p.compliance?.refiningType || '',
        extractionMethod: p.compliance?.extractionMethod || '',
        packagingType: p.compliance?.packagingType || '',
        isOrganic: p.compliance?.isOrganic || false,
        fssaiLicenseNo: p.compliance?.fssaiLicenseNo || '',
        hsnCode: p.compliance?.hsnCode || '',
        shelfLifeDays: p.compliance?.shelfLifeDays || '',
        nutrition: {
          energy: p.nutrition?.energy || 0,
          totalFat: p.nutrition?.totalFat || 0,
          saturatedFat: p.nutrition?.saturatedFat || 0,
          transFat: p.nutrition?.transFat || 0,
          mufa: p.nutrition?.mufa || 0,
          pufa: p.nutrition?.pufa || 0,
          cholesterol: p.nutrition?.cholesterol || 0
        },
        variants: p.variants?.length ? p.variants.map(v => ({
          size: v.size || '',
          unit: v.unit || '',
          sku: v.sku || '',
          price: v.price || 0,
          mrp: v.mrp || 0,
          initialStock: v.currentStock || 0,
          lowStockThreshold: v.lowStockThreshold || 10
        })) : [{ size: '1', unit: 'Litre', sku: '', price: 0, mrp: 0, initialStock: 0, lowStockThreshold: 10 }],
        mainImage: null, // Don't prepopulate files directly
        gallery: []
      })
    }
  }, [isEditMode, productDataRes, reset])

  const onNext = async () => {
    // Validate current step before proceeding
    const isStepValid = await trigger()
    if (isStepValid) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1)
      } else {
        onSubmit(methods.getValues())
      }
    }
  }

  const onPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const onSubmit = (data) => {
    toast.loading(isEditMode ? 'Updating product...' : 'Publishing product...', { id: 'publish' })
    
    // We send data without File objects in JSON to createProduct first
    const productData = { ...data, mainImage: undefined, gallery: undefined }
    
    const mutation = isEditMode ? updateMutation : createMutation;

    mutation.mutate(productData, {
      onSuccess: (res) => {
        const productId = res.data._id || res.data.id;
        
        // If there are images to upload, call the upload API
        if (data.mainImage || (data.gallery && data.gallery.length > 0)) {
           const formData = new FormData();
           if (data.mainImage) formData.append('mainImage', data.mainImage);
           if (data.gallery) {
             data.gallery.forEach(file => formData.append('gallery', file));
           }
           
           uploadMutation.mutate({ id: productId, formData }, {
             onSuccess: () => {
                if (!isEditMode) localStorage.removeItem('vendor_product_draft')
                toast.success(isEditMode ? 'Product updated with images!' : 'Product published with images!', { id: 'publish' })
                navigate('/vendor/products')
             },
             onError: (err) => {
                toast.error(isEditMode ? 'Details updated but images failed' : 'Product created but images failed', { id: 'publish' })
                navigate('/vendor/products')
             }
           });
        } else {
          if (!isEditMode) localStorage.removeItem('vendor_product_draft')
          toast.success(isEditMode ? 'Product updated successfully!' : 'Product published successfully!', { id: 'publish' })
          navigate('/vendor/products')
        }
      },
      onError: (err) => {
        toast.error(err.message || (isEditMode ? 'Failed to update product' : 'Failed to publish product'), { id: 'publish' })
      }
    })
  }

  const handleSaveDraft = () => {
    localStorage.setItem('vendor_product_draft', JSON.stringify(methods.getValues()))
    toast.success('Draft saved successfully! You can safely close this page.')
  }

  if (isEditMode && isFetchingProduct) {
    return <div className="p-10 text-center text-gray-500">Loading product details...</div>
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 relative min-h-[80vh] pb-24">
      {/* Header & Stepper */}
      <div className="mb-8">
        <h2 className="text-xl font-serif font-bold text-[#002F24] mb-6">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>

        <div className="flex items-center">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${currentStep > step.id
                  ? 'bg-[#002F24] text-white'
                  : currentStep === step.id
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-gray-100 text-gray-400'
                  }`}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold mt-2 ${currentStep >= step.id ? 'text-[#002F24]' : 'text-gray-400'
                  }`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 mx-4 mt-[-16px]">
                  <div
                    className="h-full bg-[#002F24] transition-all"
                    style={{ width: currentStep > step.id ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#D4AF37]/20 p-8 min-h-[400px]">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && <Step1Basic />}
            {currentStep === 2 && <Step2OilDetails />}
            {currentStep === 3 && <Step3Variants />}
            {currentStep === 4 && <Step4Images />}
          </form>
        </FormProvider>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex justify-between items-center px-8">
        <button
          onClick={onPrev}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50"
        >
          Back
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2 border border-[#D4AF37]/40 text-[#002F24] rounded-xl text-sm font-bold hover:bg-[#F8F2E7]/40"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {currentStep === steps.length ? 'Publish Product' : 'Continue'}
            {currentStep !== steps.length && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
