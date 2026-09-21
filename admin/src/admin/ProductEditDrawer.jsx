import { useState, useEffect, useRef } from 'react'
import { X, Package, Tag, FileText, Activity, Plus, Trash2, Loader2, Save, ChevronDown, ChevronUp, Sparkles, Leaf, Box } from 'lucide-react'
import gsap from 'gsap'

const SectionHeader = ({ icon: Icon, title, subtitle, isOpen, onToggle, accentColor = '#b89547' }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between py-3.5 cursor-pointer group transition-all"
  >
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105"
        style={{
          background: `${accentColor}15`,
          border: `1.5px solid ${accentColor}30`,
        }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: accentColor }} />
      </div>
      <div className="text-left">
        <h4 className="text-[13px] font-bold text-[#1a2b23] leading-tight">{title}</h4>
        {subtitle && <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{subtitle}</p>}
      </div>
    </div>
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-gray-100 rotate-0' : 'bg-gray-50 rotate-0'} group-hover:bg-gray-100`}>
      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </div>
  </button>
)

const FieldLabel = ({ children, unit }) => (
  <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
    {children} {unit && <span className="font-normal text-gray-400 normal-case tracking-normal">({unit})</span>}
  </label>
)

const InputField = ({ label, type = 'text', value, onChange, placeholder, required, min, unit, className = '', rows }) => (
  <div className={className}>
    <FieldLabel unit={unit}>{label}</FieldLabel>
    {rows ? (
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0b3b84] focus:ring-2 focus:ring-[#0b3b84]/10 transition-all bg-white placeholder-gray-300 resize-none leading-relaxed"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0b3b84] focus:ring-2 focus:ring-[#0b3b84]/10 transition-all bg-white placeholder-gray-300"
      />
    )}
  </div>
)

export default function ProductEditDrawer({ isOpen, onClose, product, onSave, isLoading }) {
  const drawerRef = useRef(null)
  const backdropRef = useRef(null)

  const [openSections, setOpenSections] = useState({
    basic: true,
    compliance: true,
    nutrition: false,
    variants: true,
    status: true
  })

  const [form, setForm] = useState({
    basicDetails: { name: '', brandName: '', description: '', highlights: [] },
    compliance: {
      oilType: '', extractionMethod: '', refiningType: '', packagingType: '',
      isOrganic: false, fssaiLicenseNo: '', hsnCode: '', shelfLifeDays: 180
    },
    nutrition: {
      energy: 0, totalFat: 0, saturatedFat: 0, transFat: 0,
      mufa: 0, pufa: 0, cholesterol: 0
    },
    variants: [],
    status: 'ACTIVE'
  })

  useEffect(() => {
    if (product) {
      setForm({
        basicDetails: {
          name: product.basicDetails?.name || '',
          brandName: product.basicDetails?.brandName || '',
          description: product.basicDetails?.description || '',
          highlights: product.basicDetails?.highlights?.map(h => ({ text: h.text || '' })) || []
        },
        compliance: {
          oilType: product.compliance?.oilType || '',
          extractionMethod: product.compliance?.extractionMethod || '',
          refiningType: product.compliance?.refiningType || '',
          packagingType: product.compliance?.packagingType || '',
          isOrganic: product.compliance?.isOrganic || false,
          fssaiLicenseNo: product.compliance?.fssaiLicenseNo || '',
          hsnCode: product.compliance?.hsnCode || '',
          shelfLifeDays: product.compliance?.shelfLifeDays || 180
        },
        nutrition: {
          energy: product.nutrition?.energy || 0,
          totalFat: product.nutrition?.totalFat || 0,
          saturatedFat: product.nutrition?.saturatedFat || 0,
          transFat: product.nutrition?.transFat || 0,
          mufa: product.nutrition?.mufa || 0,
          pufa: product.nutrition?.pufa || 0,
          cholesterol: product.nutrition?.cholesterol || 0
        },
        variants: product.variants?.map(v => ({
          _id: v._id,
          size: v.size || '1',
          unit: v.unit || 'Litre',
          sku: v.sku || '',
          price: v.price || 0,
          mrp: v.mrp || 0,
          initialStock: v.initialStock || 0,
          currentStock: v.currentStock || 0,
          lowStockThreshold: v.lowStockThreshold || 10
        })) || [],
        status: product.status || 'ACTIVE'
      })
      setOpenSections({ basic: true, compliance: true, nutrition: false, variants: true, status: true })
    }
  }, [product])

  useEffect(() => {
    if (isOpen) {
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out', display: 'block' })
      gsap.to(drawerRef.current, { x: '0%', duration: 0.45, ease: 'power3.out' })
    } else {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => gsap.set(backdropRef.current, { display: 'none' }) })
      gsap.to(drawerRef.current, { x: '100%', duration: 0.3, ease: 'power3.in' })
    }
  }, [isOpen])

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const updateBasic = (key, value) => setForm(prev => ({ ...prev, basicDetails: { ...prev.basicDetails, [key]: value } }))
  const updateCompliance = (key, value) => setForm(prev => ({ ...prev, compliance: { ...prev.compliance, [key]: value } }))
  const updateNutrition = (key, value) => setForm(prev => ({ ...prev, nutrition: { ...prev.nutrition, [key]: Number(value) } }))
  const updateVariant = (idx, key, value) => {
    setForm(prev => {
      const newVariants = [...prev.variants]
      newVariants[idx] = { ...newVariants[idx], [key]: ['price', 'mrp', 'initialStock', 'currentStock', 'lowStockThreshold'].includes(key) ? Number(value) : value }
      return { ...prev, variants: newVariants }
    })
  }

  const addHighlight = () => updateBasic('highlights', [...form.basicDetails.highlights, { text: '' }])
  const removeHighlight = (idx) => updateBasic('highlights', form.basicDetails.highlights.filter((_, i) => i !== idx))
  const updateHighlight = (idx, value) => {
    const newHighlights = [...form.basicDetails.highlights]
    newHighlights[idx] = { text: value }
    updateBasic('highlights', newHighlights)
  }

  const addVariant = () => setForm(prev => ({
    ...prev,
    variants: [...prev.variants, { size: '1', unit: 'Litre', sku: '', price: 0, mrp: 0, initialStock: 0, currentStock: 0, lowStockThreshold: 10 }]
  }))
  const removeVariant = (idx) => setForm(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLoading) return

    const payload = {
      basicDetails: {
        name: form.basicDetails.name,
        brandName: form.basicDetails.brandName,
        description: form.basicDetails.description,
        highlights: form.basicDetails.highlights.filter(h => h.text.trim() !== '')
      },
      compliance: {
        oilType: form.compliance.oilType,
        extractionMethod: form.compliance.extractionMethod,
        refiningType: form.compliance.refiningType,
        packagingType: form.compliance.packagingType,
        isOrganic: form.compliance.isOrganic,
        fssaiLicenseNo: form.compliance.fssaiLicenseNo,
        hsnCode: form.compliance.hsnCode,
        shelfLifeDays: Number(form.compliance.shelfLifeDays)
      },
      nutrition: {
        energy: Number(form.nutrition.energy),
        totalFat: Number(form.nutrition.totalFat),
        saturatedFat: Number(form.nutrition.saturatedFat),
        transFat: Number(form.nutrition.transFat),
        mufa: Number(form.nutrition.mufa),
        pufa: Number(form.nutrition.pufa),
        cholesterol: Number(form.nutrition.cholesterol)
      },
      variants: form.variants.map(v => ({
        ...(v._id ? { _id: v._id } : {}),
        size: v.size,
        unit: v.unit,
        sku: v.sku,
        price: Number(v.price),
        mrp: Number(v.mrp),
        initialStock: Number(v.initialStock),
        currentStock: Number(v.currentStock),
        lowStockThreshold: Number(v.lowStockThreshold)
      })),
      status: form.status
    }

    if (form.status === 'ACTIVE' && product?.status !== 'ACTIVE') {
      payload.approvedAt = new Date()
    }

    onSave(product._id, payload)
  }

  const statusConfig = {
    ACTIVE: { label: 'Active — Published', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    PENDING_APPROVAL: { label: 'Pending — Under Review', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
    DRAFT: { label: 'Draft — Not Published', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[110]"
        style={{ opacity: 0, display: 'none' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-[520px] bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.12)] z-[120] flex flex-col translate-x-full"
        style={{ borderLeft: '1px solid #e5e7eb' }}
      >
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-[#0b3b84] to-[#0a2f6b] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-[17px] text-white tracking-tight leading-tight">Edit Product</h3>
                <p className="text-[11px] text-blue-200/80 mt-0.5 truncate max-w-[300px] font-medium">
                  {product?.basicDetails?.name || 'Product'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        {product && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

              {/* ===== SECTION 1: Basic Details ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-5 pt-2">
                  <SectionHeader
                    icon={Tag}
                    title="Basic Details"
                    subtitle="Product name, brand, description & highlights"
                    isOpen={openSections.basic}
                    onToggle={() => toggleSection('basic')}
                    accentColor="#0b3b84"
                  />
                </div>
                {openSections.basic && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                    <InputField
                      label="Product Name"
                      value={form.basicDetails.name}
                      onChange={(e) => updateBasic('name', e.target.value)}
                      required
                      placeholder="e.g. Cold Pressed Groundnut Oil"
                    />
                    <InputField
                      label="Brand Name"
                      value={form.basicDetails.brandName}
                      onChange={(e) => updateBasic('brandName', e.target.value)}
                      placeholder="e.g. HealthOil"
                    />
                    <InputField
                      label="Description"
                      value={form.basicDetails.description}
                      onChange={(e) => updateBasic('description', e.target.value)}
                      placeholder="Product description..."
                      rows={3}
                    />

                    {/* Highlights */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <FieldLabel>Highlights</FieldLabel>
                        <button
                          type="button"
                          onClick={addHighlight}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#0b3b84] hover:text-[#082d66] transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-blue-50"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                      {form.basicDetails.highlights.length === 0 && (
                        <p className="text-[11px] text-gray-400 italic py-2 text-center border border-dashed border-gray-200 rounded-xl">No highlights added yet</p>
                      )}
                      <div className="space-y-2">
                        {form.basicDetails.highlights.map((h, idx) => (
                          <div key={idx} className="flex items-center gap-2 group">
                            <span className="text-[10px] font-bold text-gray-300 w-4 text-right shrink-0">{idx + 1}.</span>
                            <input
                              type="text"
                              value={h.text}
                              onChange={(e) => updateHighlight(idx, e.target.value)}
                              placeholder={`Highlight ${idx + 1}`}
                              className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-[13px] outline-none focus:border-[#0b3b84] focus:ring-2 focus:ring-[#0b3b84]/10 bg-white transition-all placeholder-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeHighlight(idx)}
                              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ===== SECTION 2: Compliance & Legal ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-5 pt-2">
                  <SectionHeader
                    icon={FileText}
                    title="Compliance & Legal"
                    subtitle="Oil type, FSSAI, HSN, extraction & packaging"
                    isOpen={openSections.compliance}
                    onToggle={() => toggleSection('compliance')}
                    accentColor="#059669"
                  />
                </div>
                {openSections.compliance && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Oil Type" value={form.compliance.oilType} onChange={(e) => updateCompliance('oilType', e.target.value)} placeholder="e.g. Groundnut" />
                      <InputField label="Extraction Method" value={form.compliance.extractionMethod} onChange={(e) => updateCompliance('extractionMethod', e.target.value)} placeholder="e.g. Cold Pressed" />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Refining Type" value={form.compliance.refiningType} onChange={(e) => updateCompliance('refiningType', e.target.value)} placeholder="e.g. Unrefined" />
                      <InputField label="Packaging Type" value={form.compliance.packagingType} onChange={(e) => updateCompliance('packagingType', e.target.value)} placeholder="e.g. Tin / Bottle" />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="FSSAI License No" value={form.compliance.fssaiLicenseNo} onChange={(e) => updateCompliance('fssaiLicenseNo', e.target.value)} placeholder="14 digit number" />
                      <InputField label="HSN Code" value={form.compliance.hsnCode} onChange={(e) => updateCompliance('hsnCode', e.target.value)} placeholder="e.g. 1515" />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <InputField label="Shelf Life" type="number" value={form.compliance.shelfLifeDays} onChange={(e) => updateCompliance('shelfLifeDays', e.target.value)} unit="Days" min="0" />
                      <div>
                        <FieldLabel>Organic</FieldLabel>
                        <button
                          type="button"
                          onClick={() => updateCompliance('isOrganic', !form.compliance.isOrganic)}
                          className={`w-full flex items-center justify-center gap-2 border rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all cursor-pointer ${
                            form.compliance.isOrganic
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-500'
                          }`}
                        >
                          <Leaf className={`w-4 h-4 ${form.compliance.isOrganic ? 'text-emerald-500' : 'text-gray-300'}`} />
                          {form.compliance.isOrganic ? 'Organic' : 'Not Organic'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ===== SECTION 3: Nutrition Info ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-5 pt-2">
                  <SectionHeader
                    icon={Activity}
                    title="Nutrition Info"
                    subtitle="Per 100g/ml — Energy, fats, cholesterol"
                    isOpen={openSections.nutrition}
                    onToggle={() => toggleSection('nutrition')}
                    accentColor="#f59e0b"
                  />
                </div>
                {openSections.nutrition && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-3 gap-3">
                      <InputField label="Energy" type="number" value={form.nutrition.energy} onChange={(e) => updateNutrition('energy', e.target.value)} unit="kcal" min="0" />
                      <InputField label="Total Fat" type="number" value={form.nutrition.totalFat} onChange={(e) => updateNutrition('totalFat', e.target.value)} unit="g" min="0" />
                      <InputField label="Saturated Fat" type="number" value={form.nutrition.saturatedFat} onChange={(e) => updateNutrition('saturatedFat', e.target.value)} unit="g" min="0" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <InputField label="Trans Fat" type="number" value={form.nutrition.transFat} onChange={(e) => updateNutrition('transFat', e.target.value)} unit="g" min="0" />
                      <InputField label="MUFA" type="number" value={form.nutrition.mufa} onChange={(e) => updateNutrition('mufa', e.target.value)} unit="g" min="0" />
                      <InputField label="PUFA" type="number" value={form.nutrition.pufa} onChange={(e) => updateNutrition('pufa', e.target.value)} unit="g" min="0" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <InputField label="Cholesterol" type="number" value={form.nutrition.cholesterol} onChange={(e) => updateNutrition('cholesterol', e.target.value)} unit="mg" min="0" />
                    </div>
                  </div>
                )}
              </div>

              {/* ===== SECTION 4: Variants & Pricing ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-5 pt-2">
                  <SectionHeader
                    icon={Box}
                    title={`Variants & Pricing (${form.variants.length})`}
                    subtitle="Size, SKU, price, MRP, stock for each variant"
                    isOpen={openSections.variants}
                    onToggle={() => toggleSection('variants')}
                    accentColor="#8b5cf6"
                  />
                </div>
                {openSections.variants && (
                  <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
                    {form.variants.length === 0 && (
                      <p className="text-[11px] text-gray-400 italic text-center py-4 border border-dashed border-gray-200 rounded-xl">No variants. Add one below.</p>
                    )}
                    {form.variants.map((v, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Variant Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#8b5cf6]/10 text-[#8b5cf6] text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                            <span className="text-[12px] font-bold text-gray-700">
                              {v.size} {v.unit} {v.sku ? `• ${v.sku}` : ''}
                            </span>
                          </div>
                          {form.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 hover:text-rose-600 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-rose-50"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          )}
                        </div>
                        {/* Variant Body */}
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <InputField label="Size" value={v.size} onChange={(e) => updateVariant(idx, 'size', e.target.value)} placeholder="1" />
                            <div>
                              <FieldLabel>Unit</FieldLabel>
                              <select
                                value={v.unit}
                                onChange={(e) => updateVariant(idx, 'unit', e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] outline-none focus:border-[#0b3b84] focus:ring-2 focus:ring-[#0b3b84]/10 bg-white font-medium cursor-pointer"
                              >
                                <option value="ml">ml</option>
                                <option value="Litre">Litre</option>
                                <option value="kg">kg</option>
                                <option value="gm">gm</option>
                              </select>
                            </div>
                            <InputField label="SKU" value={v.sku} onChange={(e) => updateVariant(idx, 'sku', e.target.value)} placeholder="SKU code" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <InputField label="Selling Price" type="number" value={v.price} onChange={(e) => updateVariant(idx, 'price', e.target.value)} unit="₹" min="0" />
                            <InputField label="MRP" type="number" value={v.mrp} onChange={(e) => updateVariant(idx, 'mrp', e.target.value)} unit="₹" min="0" />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <InputField label="Initial Stock" type="number" value={v.initialStock} onChange={(e) => updateVariant(idx, 'initialStock', e.target.value)} min="0" />
                            <InputField label="Current Stock" type="number" value={v.currentStock} onChange={(e) => updateVariant(idx, 'currentStock', e.target.value)} min="0" />
                            <InputField label="Low Stock Alert" type="number" value={v.lowStockThreshold} onChange={(e) => updateVariant(idx, 'lowStockThreshold', e.target.value)} min="0" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addVariant}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-[12px] font-bold text-gray-400 hover:text-[#8b5cf6] hover:border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add New Variant
                    </button>
                  </div>
                )}
              </div>

              {/* ===== SECTION 5: Status ===== */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                <FieldLabel>Product Status</FieldLabel>
                <div className="grid grid-cols-2 gap-2.5 mt-1">
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setForm(prev => ({ ...prev, status: key }))}
                      className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-left transition-all cursor-pointer"
                      style={{
                        borderColor: form.status === key ? cfg.color : '#e5e7eb',
                        backgroundColor: form.status === key ? cfg.bg : '#ffffff',
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border-2"
                        style={{
                          borderColor: form.status === key ? cfg.color : '#d1d5db',
                          backgroundColor: form.status === key ? cfg.color : 'transparent',
                          boxShadow: form.status === key ? `0 0 0 3px ${cfg.color}20` : 'none'
                        }}
                      />
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: form.status === key ? cfg.color : '#9ca3af' }}
                      >
                        {cfg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom spacer */}
              <div className="h-2" />
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-4 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-semibold text-[13px] transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-7 py-2.5 bg-gradient-to-r from-[#0b3b84] to-[#0a2f6b] text-white rounded-xl font-bold text-[13px] hover:from-[#0a2f6b] hover:to-[#082660] transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-blue-900/20 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save All Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
