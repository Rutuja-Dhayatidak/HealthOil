import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../ApiServices/axiosConfig'
import { 
  Trash2, Plus, Minus, Tag, ShoppingBag, Truck, Lock, CheckCircle2, 
  Heart, MapPin, Bookmark, Info, Star, ShieldCheck, Search, ChevronDown, 
  Menu, User, ChevronRight, RotateCcw, Shield
} from 'lucide-react'

// Local Assets
import coconutImg from '../assets/CoconutOil.png'
import groundnutImg from '../assets/GroundnutOil.png'
import oliveImg from '../assets/OliveOil.png'
import sunflowerImg from '../assets/sunflowerOil.png'
import riceBranImg from '../assets/RiceBrainOil.png'
import mustardImg from '../assets/MustardOil.png'

import Navbar from '../components/Navbar'
import AddressMapPicker from '../components/AddressMapPicker'

export default function Cart({ 
  cartItems = [], 
  setCartItems, 
  onBackToShop, 
  onProceedToCheckout,
  cartCount,
  onOpenCart,
  onOpenNearbyShops,
  onOpenProfile,
  userLocation
}) {
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [showAddressPicker, setShowAddressPicker] = useState(false)
  const [activeAddress, setActiveAddress] = useState({
    name: 'Arjun Nair',
    tag: 'Home',
    line1: 'No. 45, 3rd Cross, Koramangala 5th Block,',
    line2: 'Bengaluru, Karnataka - 560095',
    phone: '+91 98765 43210'
  })

  // Default items matching the exact screenshot if cart is empty or initialized
  const defaultItems = [
    {
      id: 'mock-1',
      name: 'Cold Pressed Coconut Oil 500 ml',
      brand: 'Thanjai Naturals',
      variant: '500 ml (Glass Bottle)',
      rating: 4.6,
      reviews: 128,
      delivery: 'Delivery by Tue, 20 May',
      price: 349,
      mrp: 399,
      discount: '12% OFF',
      qty: 1,
      inStock: true,
      image: coconutImg
    },
    {
      id: 'mock-2',
      name: 'Wood Pressed Groundnut Oil 1.5 Litre',
      brand: 'Lakshmi Chekku Oils',
      variant: '1.5 Litre (Pet Bottle)',
      rating: 4.7,
      reviews: 205,
      delivery: 'Delivery by Wed, 21 May',
      price: 649,
      mrp: 799,
      discount: '19% OFF',
      qty: 1,
      inStock: true,
      image: groundnutImg
    },
    {
      id: 'mock-3',
      name: 'Extra Virgin Olive Oil 500 ml',
      brand: 'Oleevia',
      variant: '500 ml (Glass Bottle)',
      rating: 4.8,
      reviews: 96,
      delivery: 'Delivery by Thu, 22 May',
      price: 699,
      mrp: 899,
      discount: '22% OFF',
      qty: 1,
      inStock: true,
      image: oliveImg
    }
  ]

  // Use cartItems if available, otherwise default to empty array
  const displayItems = (cartItems && cartItems.length > 0) ? cartItems.map(item => ({
    ...item,
    brand: item.brand || 'Thanjai Naturals',
    variant: item.variant || '500 ml (Glass Bottle)',
    rating: item.rating || 4.7,
    reviews: item.reviews || 120,
    delivery: item.delivery || 'Delivery by Tue, 20 May',
    mrp: item.mrp || Math.round(item.price * 1.2),
    discount: item.discount || `${Math.round((( (item.mrp || Math.round(item.price * 1.2)) - item.price) / (item.mrp || Math.round(item.price * 1.2))) * 100)}% OFF`,
    inStock: true,
    image: item.image || coconutImg
  })) : []

  const fallbackSuggestedProducts = [
    { 
      id: 's1', 
      name: 'Sunflower Oil', 
      size: '1 Litre', 
      rating: 4.5, 
      reviews: 118, 
      price: 179, 
      mrp: 229, 
      discount: '22% OFF', 
      image: sunflowerImg 
    },
    { 
      id: 's2', 
      name: 'Sesame Oil', 
      size: '500 ml', 
      rating: 4.6, 
      reviews: 87, 
      price: 199, 
      mrp: 249, 
      discount: '20% OFF', 
      image: groundnutImg 
    },
    { 
      id: 's3', 
      name: 'Rice Bran Oil', 
      size: '1 Litre', 
      rating: 4.4, 
      reviews: 64, 
      price: 199, 
      mrp: 249, 
      discount: '20% OFF', 
      image: riceBranImg 
    },
    { 
      id: 's4', 
      name: 'Mustard Oil', 
      size: '1 Litre', 
      rating: 4.5, 
      reviews: 93, 
      price: 159, 
      mrp: 189, 
      discount: '16% OFF', 
      image: mustardImg 
    }
  ]

  const [suggestedProducts, setSuggestedProducts] = useState(fallbackSuggestedProducts);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const { fetchPublicProducts } = await import('../ApiServices/publicShopService');
        const res = await fetchPublicProducts();
        if (res && res.success && res.products && res.products.length > 0) {
          const formatted = res.products.map((p, i) => ({
            id: p.id,
            name: p.name || 'Premium Oil',
            size: p.size || '1 Litre',
            rating: 4.5,
            reviews: Math.floor(Math.random() * 100) + 20,
            price: p.price,
            mrp: p.mrp || p.price * 1.2,
            discount: `${Math.round(((p.mrp || (p.price * 1.2)) - p.price) / (p.mrp || (p.price * 1.2)) * 100)}% OFF`,
            image: p.image || fallbackSuggestedProducts[i % 4].image
          }));
          setSuggestedProducts(formatted);
        }
      } catch (err) {
        console.error('Failed to load related products', err);
      }
    };
    fetchRelated();
  }, []);

  const handleQtyChange = async (id, variant, amount) => {
    if (!setCartItems) return
    setCartItems(prev => {
      const targetList = prev.length > 0 ? prev : defaultItems
      return targetList.map(item =>
        (item.id === id && (item.variant === variant || !variant))
          ? { ...item, qty: Math.max(1, item.qty + amount) } 
          : item
      )
    })

    if (localStorage.getItem('token')) {
      try {
        const { updateCartItemAPI } = await import('../ApiServices/cartService')
        await updateCartItemAPI(id, variant, amount)
      } catch (err) {
        console.error('Failed to update qty', err)
      }
    }
  }

  const handleRemoveItem = async (id, variant) => {
    if (!setCartItems) return
    setCartItems(prev => {
      const targetList = prev.length > 0 ? prev : defaultItems
      return targetList.filter(item => !(item.id === id && (item.variant === variant || !variant)))
    })

    if (localStorage.getItem('token')) {
      try {
        const { removeFromCartAPI } = await import('../ApiServices/cartService')
        await removeFromCartAPI(id, variant)
      } catch (err) {
        console.error('Failed to remove item', err)
      }
    }
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    setCouponError('')
    if (!couponCode.trim()) return
    if (couponCode.toUpperCase() === 'GOLDEN10' || couponCode.toUpperCase() === 'HELTHOIL') {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: 317 })
    } else {
      setCouponError('Invalid coupon code. Try HELTHOIL or GOLDEN10')
    }
  }

  // Calculations
  const subtotal = displayItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  const totalMrp = displayItems.reduce((acc, item) => acc + (item.mrp || item.price * 1.2) * item.qty, 0)
  const productDiscount = appliedCoupon ? appliedCoupon.discount : Math.max(0, Math.round(totalMrp - subtotal) || 317)
  const deliveryCharges = 40
  const platformFee = 19
  const totalPayable = subtotal - (appliedCoupon ? appliedCoupon.discount : 0) + deliveryCharges + platformFee

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    if (displayItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // 1. Create order on backend
      const orderData = await axios.post('/orders/create-razorpay-order', {
        amount: totalPayable
      });

      if (!orderData.success) {
        alert('Server error. Are you sure you are logged in?');
        return;
      }

      // 2. Setup Razorpay options
      const options = {
        key: 'rzp_test_SNw35MkokY8h1y', // Enter the Key ID generated from the Dashboard
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'HelthOil',
        description: 'Premium Wellness Products',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyData = await axios.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cartItems: displayItems,
              deliveryAddress: activeAddress,
              totalAmount: totalPayable
            });

            if (verifyData.success) {
              alert('Payment successful! Your order has been placed.');
              if (setCartItems) setCartItems([]);
              navigate('/profile'); // Redirect to profile to see orders
            }
          } catch (err) {
            console.error('Verification failed', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: activeAddress.name,
          email: 'customer@example.com',
          contact: activeAddress.phone.replace(/[^0-9]/g, '')
        },
        theme: {
          color: '#0f532b'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert('Failed to initialize payment.');
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#fcfbfa] antialiased flex flex-col animate-landing"
      style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgb(17, 41, 77)' }}
    >
      
      {/* ========================================================
          1. TOP NAVIGATION HEADER 
         ======================================================== */}
      <Navbar 
        cartCount={cartCount} 
        onOpenCart={onOpenCart} 
        onOpenNearbyShops={onOpenNearbyShops} 
        onOpenProfile={onOpenProfile} 
        userLocation={userLocation} 
      />

      {/* ========================================================
          2. MAIN CONTENT AREA (Breadcrumb + 2 Column Grid)
         ======================================================== */}
      <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex-1">
        
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <span className="cursor-pointer hover:text-gray-700 transition-colors" onClick={onBackToShop}>Home</span>
          <span>/</span>
          <span className="text-gray-800 font-medium">Cart</span>
        </nav>

        {/* Page Title & Count */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
          <p className="text-[#15803d] text-sm font-semibold mt-0.5">{displayItems.length} items in your cart</p>
        </div>

        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-none shadow-sm">
            <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
              Looks like you haven't added any premium cold-pressed oils to your cart yet.
            </p>
            <button 
              onClick={onBackToShop}
              className="px-6 py-3 bg-[#0f532b] hover:bg-[#0c4323] text-white font-bold text-sm rounded-none shadow-sm transition-colors cursor-pointer border-none"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ==========================================
                LEFT COLUMN: Cart Items & Suggestions
               ========================================== */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Cart Product Cards List */}
              <div className="flex flex-col gap-4">
                {displayItems.map((item) => (
                  <div 
                    key={`${item.id}-${item.variant}`}
                    className="bg-white border border-gray-200/90 rounded-none p-5 shadow-xs flex flex-col sm:flex-row items-center gap-6 relative transition-all hover:border-gray-300"
                  >
                    {/* Left: Product Image */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center p-1 bg-white">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-contain drop-shadow-xs" 
                      />
                    </div>

                    {/* Middle: Details */}
                    <div className="flex-1 flex flex-col justify-between self-stretch text-left">
                      <div>
                        <h3 className="font-bold text-base text-gray-900 leading-snug">
                          {item.name}
                        </h3>
                        
                        {/* Seller & Verified Badge */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 font-medium">By {item.brand}</span>
                          <div className="flex items-center gap-1 text-[#15803d] text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-[#15803d] text-white" />
                            <span>Verified Seller</span>
                          </div>
                        </div>

                        {/* Package/Variant info */}
                        <p className="text-xs text-gray-400 mt-1">
                          {item.variant}
                        </p>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="flex items-center text-amber-400 text-xs">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {item.rating} ({item.reviews})
                          </span>
                        </div>
                      </div>

                      {/* Delivery Date Tag */}
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-700">
                        <Truck className="w-4 h-4 text-[#15803d] shrink-0" />
                        <span>Delivery by <span className="font-bold text-gray-800">{item.delivery.replace('Delivery by ', '')}</span></span>
                      </div>
                    </div>

                    {/* Right Column: Pricing & Quantity/Actions */}
                    <div className="flex flex-row sm:flex-col justify-between items-end sm:items-end w-full sm:w-auto shrink-0 gap-4 sm:gap-2 self-stretch sm:min-w-[160px]">
                      
                      {/* Price & Discount */}
                      <div className="text-left sm:text-right">
                        <div className="text-xl font-bold text-gray-900">
                          ₹{item.price}
                        </div>
                        <div className="flex items-center sm:justify-end gap-1.5 text-xs mt-0.5">
                          <span className="text-gray-400 line-through font-normal">₹{item.mrp}</span>
                          <span className="text-[#15803d] font-bold">{item.discount}</span>
                        </div>
                        <div className="flex items-center sm:justify-end gap-1 mt-1">
                          <span className="w-1.5 h-1.5 bg-[#15803d]"></span>
                          <span className="text-[11px] font-semibold text-[#15803d]">In Stock</span>
                        </div>
                      </div>

                      {/* Quantity Selector & Action Links */}
                      <div className="flex flex-col items-end gap-2.5">
                        {/* Qty Pill */}
                        <div className="inline-flex items-center bg-[#f8f9fa] border border-gray-200 p-0.5 shadow-2xs">
                          <button 
                            onClick={() => handleQtyChange(item.id, item.variant, -1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white rounded-none transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-900">
                            {item.qty}
                          </span>
                          <button 
                            onClick={() => handleQtyChange(item.id, item.variant, 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white rounded-none transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove & Save For Later */}
                        <div className="flex flex-col items-end gap-1.5">
                          <button 
                            onClick={() => handleRemoveItem(item.id, item.variant)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer bg-transparent border-none p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0">
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save for later</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* You May Also Like Row */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-gray-900">You may also like</h3>
                  <button className="text-xs font-bold text-[#15803d] hover:underline cursor-pointer bg-transparent border-none">
                    View all
                  </button>
                </div>

                <div className="relative">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {suggestedProducts.map((p) => (
                      <div 
                        key={p.id} 
                        className="bg-white border border-gray-200 p-3.5 flex flex-col justify-between relative group hover:border-[#15803d]/40 hover:shadow-xs transition-all text-left"
                      >
                        {/* Wishlist Button */}
                        <button className="absolute top-3 right-3 text-gray-300 hover:text-rose-500 transition-colors cursor-pointer bg-transparent border-none">
                          <Heart className="w-4 h-4" />
                        </button>

                        {/* Bottle Image */}
                        <div className="w-full h-32 flex items-center justify-center mb-2">
                          <img src={p.image} alt={p.name} className="h-full object-contain" />
                        </div>

                        {/* Info */}
                        <div>
                          <h4 className="font-bold text-xs text-gray-900 truncate">{p.name}</h4>
                          <p className="text-[11px] text-gray-400 mt-0.5">{p.size}</p>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-1 mt-1 text-[11px]">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-gray-700">{p.rating}</span>
                            <span className="text-gray-400">({p.reviews})</span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-xs font-extrabold text-gray-900">₹{p.price}</span>
                            <span className="text-[10px] text-gray-400 line-through">₹{p.mrp}</span>
                            <span className="text-[10px] text-[#15803d] font-bold">{p.discount}</span>
                          </div>

                          {/* Add to Cart Button */}
                          <button 
                            onClick={() => {
                              if (setCartItems) {
                                setCartItems(prev => [...prev, {
                                  id: p.id,
                                  name: p.name,
                                  brand: 'HealthOil Naturals',
                                  variant: p.size,
                                  price: p.price,
                                  mrp: p.mrp,
                                  qty: 1,
                                  image: p.image
                                }])
                              }
                            }}
                            className="w-full mt-3 py-1.5 border border-[#15803d] text-[#15803d] hover:bg-green-50 text-xs font-bold transition-all cursor-pointer bg-white"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right Arrow Button (Carousel control) */}
                  <button className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 shadow-md items-center justify-center text-gray-600 hover:text-black cursor-pointer hover:scale-105 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* ==========================================
                RIGHT COLUMN: Address, Coupon, Price
               ========================================== */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              {/* 1. Delivery Address Card */}
              <div className="bg-[#fcfaf4] border border-[#f2eadc] p-5 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-[#8a6b32]" />
                  <h3 className="font-bold text-sm text-gray-900">Delivery Address</h3>
                </div>
                
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-900">{activeAddress.name}</span>
                      <span className="bg-[#dcfce7] text-[#166534] text-[10px] font-bold px-2 py-0.5">
                        {activeAddress.tag}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {activeAddress.line1}<br/>
                      {activeAddress.line2}<br/>
                      {activeAddress.phone}
                    </p>
                  </div>

                  {/* Change Button */}
                  <button 
                    onClick={() => setShowAddressPicker(true)}
                    className="px-3.5 py-1.5 border border-[#15803d] text-[#15803d] hover:bg-green-50 rounded-none text-xs font-bold transition-colors bg-white cursor-pointer shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* 2. Have a coupon? Card */}
              <div className="bg-white border border-gray-200/90 p-5 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-[#8a6b32]" />
                  <h3 className="font-bold text-sm text-gray-900">Have a coupon?</h3>
                </div>

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-[#15803d] transition-all"
                  />
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-[#0f532b] hover:bg-[#0c4323] text-white text-xs font-bold transition-colors cursor-pointer border-none"
                  >
                    Apply
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] text-rose-500 font-medium mt-2">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-[11px] text-[#15803d] font-bold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Coupon {appliedCoupon.code} applied! Saved ₹{appliedCoupon.discount}
                  </p>
                )}
              </div>

              {/* 3. Price Details Card */}
              <div className="bg-white border border-gray-200/90 p-5 text-left">
                <h3 className="font-bold text-base text-gray-900 mb-4">Price Details</h3>

                <div className="space-y-3 text-xs text-gray-600">
                  
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span>Subtotal ({displayItems.length} items)</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {/* Product Discount */}
                  <div className="flex justify-between items-center text-[#15803d] font-medium">
                    <span>Product Discount</span>
                    <span>-₹{productDiscount}</span>
                  </div>

                  {/* Delivery Charges */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span>Delivery Charges</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="font-semibold text-gray-900">₹{deliveryCharges}</span>
                  </div>

                  {/* Platform Fee */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span>Platform Fee</span>
                      <Info className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="font-semibold text-gray-900">₹{platformFee}</span>
                  </div>

                </div>

                {/* Total Payable Divider */}
                <div className="border-t border-gray-150 my-4 pt-3.5 flex justify-between items-center">
                  <span className="font-extrabold text-sm text-gray-900">Total Payable</span>
                  <span className="font-extrabold text-xl text-gray-900">₹{totalPayable.toLocaleString()}</span>
                </div>

                {/* Savings Announcement */}
                <p className="text-[#15803d] text-xs font-bold mb-4">
                  You save ₹{productDiscount} on this order
                </p>

                {/* Proceed to Checkout CTA Button */}
                <button 
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-[#0f532b] hover:bg-[#0c4323] text-white font-bold text-xs rounded-none shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all border-none"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Proceed to Checkout</span>
                </button>

                {/* 100% Secure Payments Guarantee */}
                <div className="flex items-center justify-center gap-1.5 text-gray-400 text-[11px] font-medium mt-3.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                  <span>100% Secure Payments</span>
                </div>
              </div>

              {/* 4. Trust Badges Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white border border-gray-150 p-2.5 flex flex-col items-center justify-center gap-1">
                  <ShieldCheck className="w-5 h-5 text-[#15803d]" />
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">Secure<br/>Payments</span>
                </div>

                <div className="bg-white border border-gray-150 p-2.5 flex flex-col items-center justify-center gap-1">
                  <RotateCcw className="w-5 h-5 text-[#15803d]" />
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">Easy<br/>Returns</span>
                </div>

                <div className="bg-white border border-gray-150 p-2.5 flex flex-col items-center justify-center gap-1">
                  <CheckCircle2 className="w-5 h-5 text-[#15803d]" />
                  <span className="text-[10px] font-bold text-gray-700 leading-tight">Verified<br/>Sellers</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Address Picker Modal */}
      {showAddressPicker && (
        <AddressMapPicker 
          onClose={() => setShowAddressPicker(false)}
          onSave={(newAddress) => {
            setActiveAddress({
              name: 'Arjun Nair', // Or get from profile
              tag: newAddress.label,
              line1: newAddress.details.split(',').slice(0, 2).join(', '),
              line2: newAddress.details.split(',').slice(2).join(', '),
              phone: '+91 98765 43210' // Keep current
            });
            setShowAddressPicker(false);
          }}
        />
      )}

      {/* ========================================================
          3. TRUST BANNER (5 Pillars)
         ======================================================== */}
      <footer className="w-full bg-[#faf7ef] border-t border-[#eee5d5] py-6 mt-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-left">
          
          {/* Pillar 1 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none-none bg-white flex items-center justify-center border border-[#eee5d5] shrink-0 text-[#15803d]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-gray-900">Verified Sellers</span>
              <span className="block text-[10px] text-gray-500 mt-0.5">Trusted & verified sellers</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none-none bg-white flex items-center justify-center border border-[#eee5d5] shrink-0 text-[#15803d]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-gray-900">Quality Guaranteed</span>
              <span className="block text-[10px] text-gray-500 mt-0.5">100% pure & natural oils</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none-none bg-white flex items-center justify-center border border-[#eee5d5] shrink-0 text-[#15803d]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-gray-900">Fast Delivery</span>
              <span className="block text-[10px] text-gray-500 mt-0.5">On time, every time</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none-none bg-white flex items-center justify-center border border-[#eee5d5] shrink-0 text-[#15803d]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-gray-900">Secure Payments</span>
              <span className="block text-[10px] text-gray-500 mt-0.5">100% safe & secure</span>
            </div>
          </div>

          {/* Pillar 5 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none-none bg-white flex items-center justify-center border border-[#eee5d5] shrink-0 text-[#15803d]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-gray-900">Easy Returns</span>
              <span className="block text-[10px] text-gray-500 mt-0.5">Hassle-free returns</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}
