import { useState } from 'react'
import { ArrowLeft, Trash2, Plus, Minus, ShieldCheck, Tag, ShoppingBag, Truck, FileText, Lock, CheckCircle2, Heart } from 'lucide-react'

export default function Cart({ cartItems, setCartItems, onBackToShop, onProceedToCheckout }) {
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')

  const handleQtyChange = (id, amount) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id 
          ? { ...item, qty: Math.max(1, item.qty + amount) } 
          : item
      )
    )
  }

  const handleRemoveItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const handleApplyPromo = (e) => {
    e.preventDefault()
    setPromoError('')
    if (promoCode.toUpperCase() === 'GOLDEN10') {
      setAppliedPromo({ code: 'GOLDEN10', discount: 10 }) // 10% discount
    } else {
      setPromoError('Invalid coupon code. Try GOLDEN10')
    }
  }

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  const discount = appliedPromo ? Math.round(subtotal * (appliedPromo.discount / 100)) : 0
  const deliveryCharges = subtotal > 1000 || subtotal === 0 ? 0 : 50
  const gstTax = Math.round((subtotal - discount) * 0.05) // 5% GST
  const grandTotal = subtotal - discount + deliveryCharges + gstTax

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF4E8] text-[#031c12] py-16 px-4 text-center flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-[#b89547]/30 rounded-2xl p-8 shadow-xl">
          <ShoppingBag className="w-16 h-16 text-[#b89547] mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-[#031c12]">Your Cart is Empty</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Looks like you haven't added any premium cooking oils to your cart yet.
          </p>
          <button 
            onClick={onBackToShop}
            className="w-full mt-6 py-3 bg-[#031c12] hover:bg-[#062c1d] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md border-none"
          >
            Start Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF4E8] text-[#031c12] font-sans selection:bg-[#D4AF37] selection:text-[#002F24] overflow-x-hidden text-left pb-12">
      
      {/* Premium Cart Header */}
      <header className="w-full bg-[#031c12] border-b-2 border-[#b89547] text-white py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBackToShop}>
            <span className="font-serif text-2xl font-bold tracking-wide text-white leading-none">OLI</span>
            <span className="text-[7.5px] tracking-[0.2em] text-[#d4af37] font-semibold uppercase mt-0.5">PREMIUM OILS</span>
          </div>

          {/* Header Trust badges */}
          <div className="hidden md:flex items-center gap-6 text-[10px] text-gray-250">
            <div className="flex items-center gap-2 border-r border-white/10 pr-6">
              <span className="text-[#d4af37] text-sm">🍁</span>
              <div>
                <span className="block font-bold">100% Pure</span>
                <span className="block text-gray-400 text-[8px]">No Additives</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-r border-white/10 pr-6">
              <span className="text-[#d4af37] text-sm">💧</span>
              <div>
                <span className="block font-bold">Cold Pressed</span>
                <span className="block text-gray-400 text-[8px]">Goodness</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#d4af37] text-sm">🛡️</span>
              <div>
                <span className="block font-bold">Secure</span>
                <span className="block text-gray-400 text-[8px]">Packaging</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Back Link */}
        <button 
          onClick={onBackToShop}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#031c12] mb-6 transition-colors cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          Back to Shop
        </button>

        {/* Funnel Progress Tracker & Title Grid */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#031c12] tracking-tight">Shopping Cart ({cartItems.length} items)</h1>
          </div>

          {/* Funnel Timeline Progress */}
          <div className="relative flex items-center justify-between w-56 select-none shrink-0">
            {/* Horizontal Line behind */}
            <div className="absolute top-[18px] left-4 right-4 h-[1.5px] bg-gray-200 z-0" />
            
            {/* Step 1 */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-9 h-9 rounded-full bg-[#031c12] border border-[#d4af37] flex items-center justify-center text-[#d4af37] text-sm font-bold shadow-sm">
                🛒
              </div>
              <span className="text-[9px] font-bold text-[#031c12] mt-1">Cart</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                🚚
              </div>
              <span className="text-[9px] font-medium text-gray-400 mt-1">Delivery</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                💳
              </div>
              <span className="text-[9px] font-medium text-gray-400 mt-1">Payment</span>
            </div>
          </div>
        </div>

        {/* Contents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart items list */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-gray-200/50 rounded-xl p-5 flex gap-6 items-center shadow-sm hover:border-[#b89547]/30 transition-colors text-left relative"
              >
                {/* Product Image Rounded */}
                <div className="w-36 h-24 rounded-xl bg-[#faf4e8]/40 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Details layout column */}
                <div className="flex-1 flex flex-col justify-between h-24 min-w-0">
                  {/* Top details block */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="truncate">
                      <span className="text-[9px] text-[#b89547] font-bold uppercase tracking-wider block leading-none">{item.brand}</span>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-[#031c12] leading-tight mt-1.5 truncate">{item.name}</h3>
                      <span className="text-[10px] text-gray-400 block mt-1 leading-none">{item.variant}</span>
                    </div>

                    {/* Pure check pill badge */}
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-2.5 py-1 text-[8.5px] font-bold shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{item.brand.toLowerCase().includes('organic') ? 'Cold Pressed' : '100% Pure'}</span>
                    </div>
                  </div>

                  {/* Price and actions bottom row */}
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-extrabold text-[#031c12] text-base">₹{item.price}</span>

                    <div className="flex items-center gap-3">
                      {/* Quantity selector pill */}
                      <div className="flex items-center border border-gray-250 rounded-xl px-2.5 py-1 bg-gray-50 shrink-0">
                        <button 
                          onClick={() => handleQtyChange(item.id, -1)}
                          className="p-0.5 hover:bg-gray-200 rounded text-gray-500 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#031c12]">{item.qty}</span>
                        <button 
                          onClick={() => handleQtyChange(item.id, 1)}
                          className="p-0.5 hover:bg-gray-200 rounded text-gray-500 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Delete Trash Button */}
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-8 h-8 rounded-xl border border-rose-100 text-rose-500 bg-rose-50 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom trust footer row */}
            <div className="border border-gray-200/50 rounded-xl bg-white px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-left shadow-sm mt-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF4E8] flex items-center justify-center text-[#031c12] border border-[#d4af37]/20 shrink-0">
                  <span className="text-[#d4af37] text-sm">🍂</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#002f24] block">100% Pure & Natural</span>
                  <span className="text-[8px] text-gray-400 block mt-0.5">No additives or preservatives</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 border-l-0 sm:border-l border-gray-100 sm:pl-4">
                <div className="w-9 h-9 rounded-full bg-[#FAF4E8] flex items-center justify-center text-[#031c12] border border-[#d4af37]/20 shrink-0">
                  <span className="text-[#d4af37] text-sm">❄️</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#002f24] block">Cold Pressed</span>
                  <span className="text-[8px] text-gray-400 block mt-0.5">Retains natural nutrients</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-l-0 md:border-l border-gray-100 md:pl-4">
                <div className="w-9 h-9 rounded-full bg-[#FAF4E8] flex items-center justify-center text-[#031c12] border border-[#d4af37]/20 shrink-0">
                  <span className="text-[#d4af37] text-sm">📦</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#002f24] block">Secure Packaging</span>
                  <span className="text-[8px] text-gray-400 block mt-0.5">Quality checked, always</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-l-0 sm:border-l border-gray-100 sm:pl-4">
                <div className="w-9 h-9 rounded-full bg-[#FAF4E8] flex items-center justify-center text-[#031c12] border border-[#d4af37]/20 shrink-0">
                  <span className="text-[#d4af37] text-sm">🚚</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#002f24] block">Fast & Reliable Delivery</span>
                  <span className="text-[8px] text-gray-400 block mt-0.5">Delivered to your doorstep</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout side panels */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Promo Code Card */}
            <div className="bg-white border border-gray-200/50 rounded-xl shadow-sm overflow-hidden text-left relative">
              <div className="bg-[#031c12] px-5 py-3 border-b border-[#b89547]/25 flex justify-between items-center text-white select-none relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[#b89547] text-xs">🎟️</span>
                  <span className="text-xs font-serif font-bold tracking-wide">Apply Coupon</span>
                </div>
                {/* SVG Leaf branch gold */}
                <svg className="w-14 h-14 text-[#b89547]/15 absolute -right-2 -top-1 fill-current" viewBox="0 0 100 100">
                  <path d="M10 80 Q 50 50, 90 20 M 30 65 Q 25 50, 30 45 M 50 50 Q 45 35, 50 30 M 70 35 Q 65 20, 70 15" stroke="currentColor" strokeWidth="2.5" fill="none" />
                </svg>
              </div>
              
              <div className="p-5">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Code: GOLDEN10" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-[#FAF6EC] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#031c12] outline-none focus:border-[#b89547]"
                  />
                  <button 
                    type="submit"
                    className="bg-[#031c12] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#062c1d] cursor-pointer shrink-0 shadow-sm border-none"
                  >
                    Apply
                  </button>
                </form>
                {promoError && <p className="text-[10px] text-rose-600 font-bold mt-2">{promoError}</p>}
                {appliedPromo && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-md p-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    Coupon {appliedPromo.code} applied ({appliedPromo.discount}% off)
                  </p>
                )}
              </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-white border border-gray-200/50 rounded-xl shadow-sm overflow-hidden text-left relative">
              <div className="bg-[#031c12] px-5 py-3 border-b border-[#b89547]/25 flex justify-between items-center text-white select-none relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[#b89547] text-xs">📋</span>
                  <span className="text-xs font-serif font-bold tracking-wide">Order Price Summary</span>
                </div>
                {/* SVG Leaf branch gold */}
                <svg className="w-14 h-14 text-[#b89547]/15 absolute -right-2 -top-1 fill-current" viewBox="0 0 100 100">
                  <path d="M10 80 Q 50 50, 90 20 M 30 65 Q 25 50, 30 45 M 50 50 Q 45 35, 50 30 M 70 35 Q 65 20, 70 15" stroke="currentColor" strokeWidth="2.5" fill="none" />
                </svg>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-gray-600">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Subtotal</span>
                  </div>
                  <span className="font-extrabold text-[#031c12]">₹{subtotal}</span>
                </div>

                {/* Promo discount */}
                {discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-bold">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Promo Discount</span>
                    </div>
                    <span>- ₹{discount}</span>
                  </div>
                )}

                {/* Delivery Charges */}
                <div className="flex justify-between items-center text-gray-600">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Delivery Charges</span>
                  </div>
                  <span className={`font-extrabold ${deliveryCharges === 0 ? 'text-emerald-750' : 'text-[#031c12]'}`}>
                    {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}
                  </span>
                </div>

                {/* GST */}
                <div className="flex justify-between items-center text-gray-600">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>GST Tax (5%)</span>
                  </div>
                  <span className="font-extrabold text-[#031c12]">₹{gstTax}</span>
                </div>

                {/* Grand Total */}
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm font-bold text-[#031c12]">
                  <span>Total Amount</span>
                  <span className="text-lg font-serif font-extrabold text-[#b89547]">₹{grandTotal}</span>
                </div>

                {/* Guarantee Shield Box */}
                <div className="bg-[#faf4e8]/70 border border-[#b89547]/20 rounded-xl p-3 flex gap-2 text-[9px] text-gray-500 leading-relaxed">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#b89547] shrink-0 mt-0.5" />
                  <span>We guarantee 100% pure cold pressed packaging checks. Secure checkout payouts.</span>
                </div>

                {/* Checkout CTA */}
                <button 
                  onClick={onProceedToCheckout}
                  className="w-full py-3 bg-[#031c12] hover:bg-[#062c1d] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md text-center flex items-center justify-center gap-2 border-none"
                >
                  <Lock className="w-4 h-4 text-[#b89547]" />
                  Proceed to Checkout
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Encryption bottom secure bar */}
        <div className="flex items-center justify-center gap-1.5 text-[9px] text-gray-400 font-medium py-2 mt-8 border-t border-gray-200/50">
          <Lock className="w-3.5 h-3.5 text-[#b89547]" />
          <span>Your data is safe and secure. We use industry-leading encryption for a protected experience.</span>
        </div>

      </div>
    </div>
  )
}
