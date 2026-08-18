import { useState, useEffect } from 'react'
import { ArrowLeft, User, Mail, Phone, MapPin, Package, Award, Wallet, CreditCard, ChevronRight, LogOut, ShieldAlert, Loader2, Truck, Search, CheckCircle2, Store, Calendar, Tag, ShieldCheck, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { userService } from '../ApiServices/userService'
import { orderService } from '../ApiServices/orderService'
import { reviewService } from '../ApiServices/reviewService'
import AddressMapPicker from '../components/AddressMapPicker'

export default function Profile({ cartCount, onOpenCart, onOpenNearbyShops, onOpenProfile, onBackToHome }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddressPicker, setShowAddressPicker] = useState(false)
  const [trackOrderId, setTrackOrderId] = useState('')
  const [trackOrderResult, setTrackOrderResult] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    coins: 450,
    walletBalance: 1250,
    walletBalance: 1250,
    joinDate: ''
  })

  const [userOrders, setUserOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewOrder, setReviewOrder] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      
      try {
        const res = await userService.getUserProfile();
        if (res.success) {
          setUserProfile({
            ...userProfile,
            name: res.user.name,
            email: res.user.email,
            phone: res.user.phone,
            joinDate: new Date(res.user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          });
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      setOrdersLoading(true);
      try {
        const res = await orderService.getUserOrders();
        if (res.success) {
          setUserOrders(res.orders);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchProfile();
    fetchOrders();
  }, []);

  const [editMode, setEditMode] = useState(false)
  const [tempName, setTempName] = useState('')
  const [tempEmail, setTempEmail] = useState('')
  const [tempPhone, setTempPhone] = useState('')

  // Saved Addresses
  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      label: 'Home',
      details: 'Flat 302, Block C, Link Road, Mundka, New Delhi - 110041',
      isPrimary: true
    },
    {
      id: 'addr-2',
      label: 'Office',
      details: 'Tech Park, Building B, Sector 5, Rohini, New Delhi - 110085',
      isPrimary: false
    }
  ])

  // Order history (Fetched from API)

  const handleProfileSave = (e) => {
    e.preventDefault()
    setUserProfile(prev => ({
      ...prev,
      name: tempName,
      email: tempEmail,
      phone: tempPhone
    }))
    setEditMode(false)
  }

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackOrderId.trim()) return;
    setTrackingLoading(true);
    setTrackOrderResult(null);
    try {
      const res = await orderService.trackOrder(trackOrderId.trim());
      if (res.success) {
        setTrackOrderResult(res.order);
      }
    } catch (err) {
      setTrackOrderResult({ error: err.message || 'Order not found' });
    } finally {
      setTrackingLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    navigate('/login')
  }

  const handleOpenReview = (order) => {
    setReviewOrder(order)
    setReviewRating(5)
    setReviewComment('')
    setShowReviewModal(true)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewOrder) return
    setSubmittingReview(true)
    try {
      const data = await reviewService.submitReview({
        vendorId: reviewOrder.vendor._id,
        orderId: reviewOrder._id,
        productName: reviewOrder.items?.[0]?.productName || 'Order Items',
        rating: reviewRating,
        comment: reviewComment
      })
      if (data.success) {
        setShowReviewModal(false)
        alert('Review submitted successfully!')
      } else {
        alert(data.message || 'Error submitting review')
      }
    } catch (err) {
      alert(err.message || 'Error submitting review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF4E8] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
        <p className="text-[#002F24] font-bold">Loading Profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF4E8] text-[#15251F] font-sans selection:bg-[#D4AF37] selection:text-[#002F24] text-left animate-landing">
      {/* Header navbar */}
      <Navbar 
        cartCount={cartCount} 
        onOpenCart={onOpenCart} 
        onOpenNearbyShops={onOpenNearbyShops} 
        onOpenProfile={onOpenProfile}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation back */}
        <button 
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#002F24] transition-colors mb-6 cursor-pointer group border-none bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-0.5 transition-transform" />
          Back to Homepage
        </button>

        {/* Outer frame layout */}
        <div className="grid grid-cols-t1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Quick Profile Info Card */}
          <div className="lg:col-span-4 bg-white border border-[#D4AF37]/15 rounded-none p-6 shadow-sm sticky top-6 z-20">
            <div className="flex flex-col items-center text-center">
              {/* Profile Avatar Frame */}
              <div className="w-24 h-24 rounded-full bg-[#FAF4E8] border-2 border-[#D4AF37]/20 flex items-center justify-center text-[#002F24] relative shadow-inner mb-4">
                <span className="font-serif text-3xl font-bold uppercase">{userProfile.name ? userProfile.name.charAt(0) : '?'}</span>
                <span className="absolute bottom-0 right-1 text-base">🟢</span>
              </div>

              {/* Name & Joining details */}
              <h2 className="text-xl font-serif font-bold text-[#002F24] leading-snug">{userProfile.name || 'Guest User'}</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Customer Profile</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{userProfile.joinDate ? `Member since ${userProfile.joinDate}` : 'Not registered'}</p>

              {/* Wallet and coins widgets row */}
              <div className="grid grid-cols-2 gap-3 w-full border-t border-b border-gray-100 py-4 my-5">
                <div className="bg-[#FAF6EC] border border-gray-100 p-2.5 rounded-xl text-left">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Wallet</span>
                  </div>
                  <span className="block font-serif font-extrabold text-[#002F24] text-base mt-1">₹{userProfile.walletBalance}</span>
                </div>
                <div className="bg-[#FAF6EC] border border-gray-100 p-2.5 rounded-xl text-left">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Coins</span>
                  </div>
                  <span className="block font-serif font-extrabold text-[#002F24] text-base mt-1">{userProfile.coins}</span>
                </div>
              </div>

              {/* Vertical Tabs Navigation Links */}
              <div className="flex flex-col gap-1 w-full text-left">
                {[
                  { id: 'profile', label: 'My Account Info', icon: User },
                  { id: 'orders', label: 'Order History', icon: Package },
                  { id: 'track_order', label: 'Track Order', icon: Truck },
                  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
                  { id: 'wallet', label: 'Payment Methods', icon: CreditCard }
                ].map(tab => {
                  const Icon = tab.icon
                  const isSelected = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${
                        isSelected 
                          ? 'bg-[#002F24] text-white' 
                          : 'bg-transparent text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  )
                })}
                
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border-none cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 mt-4"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </div>
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Right panel: Active Tab Content display */}
          <div className="lg:col-span-8 bg-white border border-[#D4AF37]/15 rounded-none p-6 shadow-sm min-h-[460px]">
            
            {!isLoggedIn ? (
              <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center py-10">
                <div className="w-16 h-16 bg-[#FAF6EC] rounded-full flex items-center justify-center mb-4">
                  <ShieldAlert className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#002F24] mb-2">Login to HealthOil</h3>
                <p className="text-xs text-gray-500 mb-6">Please login to view and manage your profile, orders, and addresses.</p>
                <Link to="/login" className="w-full inline-block py-3 mt-2 bg-[#002F24] hover:bg-[#014D3A] text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer border-none no-underline">
                  Go to Login Page
                </Link>
              </div>
            ) : (
              <>
            {/* Tab: My Account Info */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-serif font-bold text-[#002F24] border-b border-gray-100 pb-3 mb-6">Account Information</h3>
                
                {!editMode ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 bg-[#FAF6EC] p-4 border border-gray-100 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-white border border-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">Full Name</span>
                          <span className="text-sm font-bold text-[#002F24]">{userProfile.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-[#FAF6EC] p-4 border border-gray-100 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-white border border-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">Email Address</span>
                          <span className="text-sm font-bold text-[#002F24]">{userProfile.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-[#FAF6EC] p-4 border border-gray-100 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-white border border-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">Phone Number</span>
                          <span className="text-sm font-bold text-[#002F24]">{userProfile.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-[#FAF6EC] p-4 border border-gray-100 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-white border border-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">Loyalty Points</span>
                          <span className="text-sm font-bold text-[#002F24]">{userProfile.coins} HealthCoins</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                      <button 
                        onClick={() => {
                          setTempName(userProfile.name)
                          setTempEmail(userProfile.email)
                          setTempPhone(userProfile.phone)
                          setEditMode(true)
                        }}
                        className="px-6 py-2.5 bg-[#002F24] hover:bg-[#014D3A] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer border-none"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileSave} className="space-y-4 max-w-md text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full bg-[#FAF6EC] border border-gray-200 outline-none rounded-xl py-2 px-3 text-sm font-bold text-[#002F24]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className="w-full bg-[#FAF6EC] border border-gray-200 outline-none rounded-xl py-2 px-3 text-sm font-bold text-[#002F24]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        className="w-full bg-[#FAF6EC] border border-gray-200 outline-none rounded-xl py-2 px-3 text-sm font-bold text-[#002F24]"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button 
                        type="submit"
                        className="px-6 py-2.5 bg-[#002F24] hover:bg-[#014D3A] text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer border-none"
                      >
                        Save Changes
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-all cursor-pointer border-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Tab: Order History */}
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-serif font-bold text-[#002F24] border-b border-gray-100 pb-3 mb-6">Recent Orders</h3>
                {ordersLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" /></div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-bold text-sm">No orders found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => {
                      let statusColor = 'text-gray-600 bg-gray-50 border-gray-200';
                      if (order.status === 'Delivered') statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                      else if (order.status === 'Cancelled' || order.status === 'Returned') statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
                      else statusColor = 'text-amber-600 bg-amber-50 border-amber-200';

                      return (
                        <div key={order._id} className="border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col text-left">
                          
                          {/* Header section */}
                          <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#002F24] rounded-full flex items-center justify-center text-white shrink-0">
                                <Store className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-lg font-serif font-extrabold text-[#002F24]">{order.vendor?.business?.storeName || 'Vendor Store'}</span>
                                <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1 font-medium">
                                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(order.createdAt).toLocaleString()}</div>
                                  <span className="text-gray-300">|</span>
                                  <div className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />{order.orderId}</div>
                                </div>
                              </div>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${statusColor}`}>
                              <CheckCircle className="w-3.5 h-3.5" />
                              {order.status}
                            </span>
                          </div>
                          
                          {/* Body items section */}
                          <div className="p-3 px-4 space-y-2">
                            {order.items?.map((i, idx) => (
                              <div key={idx} className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-[#FAF6EC] rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                  {i.image ? (
                                    <img src={i.image} alt={i.productName} className="w-full h-full object-contain mix-blend-multiply" />
                                  ) : (
                                    <Package className="w-6 h-6 text-[#D4AF37]/50" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-base font-bold text-[#002F24] leading-tight mb-2">{i.productName}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-[#EBF3EF] text-[#002F24] font-black text-xs px-2 py-1 rounded">{i.qty}x</span>
                                    {/* Size placeholder if none exists */}
                                    <span className="text-gray-500 text-sm font-medium">Item</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Mini Timeline */}
                          <div className="px-4 pb-3">
                            <div className="relative py-2">
                              {/* Background Line */}
                              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0 rounded-full"></div>
                              
                              {/* Active Line */}
                              <div 
                                className="absolute top-1/2 left-0 h-0.5 bg-[#002F24] -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                                style={{ 
                                  width: order.status === 'New' ? '0%' : 
                                         order.status === 'Accepted' ? '33%' : 
                                         ['Preparing', 'Ready for Pickup', 'Out for Delivery'].includes(order.status) ? '66%' : 
                                         order.status === 'Delivered' ? '100%' : '0%'
                                }}
                              ></div>

                              <div className="flex justify-between relative z-10">
                                {[
                                  { label: 'Accepted', match: ['Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'] },
                                  { label: 'Packed', match: ['Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'] },
                                  { label: 'Shipped', match: ['Out for Delivery', 'Delivered'] },
                                  { label: 'Delivered', match: ['Delivered'] }
                                ].map((step, idx) => {
                                  const isCompleted = step.match.includes(order.status);
                                  
                                  return (
                                    <div key={step.label} className="flex flex-col items-center gap-2 bg-white px-3">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                                        isCompleted ? 'bg-[#002F24] text-white border-2 border-white' : 'bg-gray-200 text-transparent border-2 border-white'
                                      }`}>
                                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                                      </div>
                                      <span className={`text-[11px] font-bold ${isCompleted ? 'text-[#002F24]' : 'text-gray-400'}`}>{step.label}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                          
                          {/* Footer Section */}
                          <div className="bg-gray-50/70 border-t border-gray-100 p-3 px-4 flex flex-wrap items-center justify-between gap-4 mt-auto">
                            <div>
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Total Price</span>
                              <span className="text-xl font-black text-[#002F24]">₹{order.totalAmount}</span>
                            </div>
                            
                            <div className="hidden md:flex items-center gap-8">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase leading-tight">Secure<br/>Payment</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5 text-gray-400" />
                                <div>
                                  <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">Estimated Delivery</span>
                                  <span className="text-xs font-bold text-[#002F24]">Within 24 Hours</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {order.status === 'Delivered' && (
                                <button
                                  onClick={() => handleOpenReview(order)}
                                  className="px-4 py-2 bg-white border border-[#D4AF37] text-[#D4AF37] text-[11px] font-bold rounded-lg hover:bg-[#FAF6EC] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  Add Review
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setTrackOrderId(order.orderId);
                                  setActiveTab('track_order');
                                }}
                                className="px-4 py-2 bg-[#002F24] text-white text-[11px] font-bold rounded-lg hover:bg-[#014D3A] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                Track Order
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Track Order */}
            {activeTab === 'track_order' && (
              <div>
                <h3 className="text-lg font-serif font-bold text-[#002F24] border-b border-gray-100 pb-3 mb-6">Track Your Order</h3>
                
                <form onSubmit={handleTrackOrder} className="flex gap-3 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Enter Order ID (e.g. #HO-1234)" 
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                      value={trackOrderId}
                      onChange={(e) => setTrackOrderId(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={trackingLoading}
                    className="px-6 py-3 bg-[#002F24] text-white font-bold text-sm rounded-xl hover:bg-[#014D3A] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {trackingLoading ? 'Searching...' : 'Track'}
                  </button>
                </form>

                {trackOrderResult && trackOrderResult.error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
                    {trackOrderResult.error}
                  </div>
                )}

                {trackOrderResult && !trackOrderResult.error && (
                  <div className="bg-[#FAF6EC] border border-[#D4AF37]/20 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-6 border-b border-[#D4AF37]/20 pb-4">
                      <div>
                        <h4 className="font-bold text-[#002F24] text-lg">{trackOrderResult.orderId}</h4>
                        <p className="text-xs text-gray-500 mt-1">Placed on {new Date(trackOrderResult.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 text-[#002F24] text-[10px] font-bold uppercase tracking-wider rounded-full">
                          {trackOrderResult.status || 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="relative py-4">
                      {/* Tracking Line */}
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
                      
                      {/* Active Tracking Line */}
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-[#002F24] -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                        style={{ 
                          width: trackOrderResult.status === 'New' ? '0%' : 
                                 trackOrderResult.status === 'Accepted' ? '33%' : 
                                 trackOrderResult.status === 'Out for Delivery' ? '66%' : 
                                 trackOrderResult.status === 'Delivered' ? '100%' : '0%'
                        }}
                      ></div>

                      <div className="flex justify-between relative z-10">
                        {['New', 'Accepted', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                          const statusOrder = { 'New': 0, 'Accepted': 1, 'Out for Delivery': 2, 'Delivered': 3 };
                          const currentOrder = statusOrder[trackOrderResult.status] || 0;
                          const isCompleted = currentOrder >= idx;
                          
                          return (
                            <div key={step} className="flex flex-col items-center gap-2 bg-[#FAF6EC] px-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                isCompleted ? 'bg-[#002F24] text-white border-2 border-white shadow-sm' : 'bg-gray-200 text-gray-400'
                              }`}>
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <span className={`text-[10px] font-bold ${isCompleted ? 'text-[#002F24]' : 'text-gray-400'}`}>{step}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-200/50 flex flex-col gap-2">
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Details</h5>
                      {trackOrderResult.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-[#002F24] font-medium">{item.qty}x {item.productName}</span>
                          <span className="font-bold text-gray-600">₹{item.price}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center text-sm font-bold border-t border-gray-200/50 pt-2 mt-2">
                        <span>Total Amount</span>
                        <span className="text-[#002F24] text-lg">₹{trackOrderResult.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Saved Addresses */}
            {activeTab === 'addresses' && (
              <div>
                <h3 className="text-lg font-serif font-bold text-[#002F24] border-b border-gray-100 pb-3 mb-6">Saved Delivery Addresses</h3>
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="flex gap-4 p-4 border border-gray-150 rounded-2xl bg-white hover:border-[#D4AF37]/35 transition-all">
                      <div className="w-9 h-9 rounded-lg bg-[#FAF4E8] flex items-center justify-center text-[#D4AF37] shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-serif font-bold text-[#002F24]">{address.label} Address</span>
                          {address.isPrimary && (
                            <span className="bg-emerald-50 text-emerald-700 text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{address.details}</p>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowAddressPicker(true)}
                    className="w-full py-3 bg-[#FAF6EC] hover:bg-[#efe7d3] text-[#002F24] border border-dashed border-[#D4AF37]/50 rounded-2xl text-xs font-bold transition-all cursor-pointer border-none"
                  >
                    + Add New Delivery Address
                  </button>
                </div>

                {showAddressPicker && (
                  <AddressMapPicker 
                    onClose={() => setShowAddressPicker(false)}
                    onSave={(newAddress) => {
                      setAddresses([...addresses, newAddress]);
                      setShowAddressPicker(false);
                    }}
                  />
                )}
              </div>
            )}

            {/* Tab: Payment methods / Wallet */}
            {activeTab === 'wallet' && (
              <div>
                <h3 className="text-lg font-serif font-bold text-[#002F24] border-b border-gray-100 pb-3 mb-6">Wallet & Payment Options</h3>
                <div className="space-y-6">
                  {/* Big Card balance */}
                  <div className="bg-[#002F24] border-2 border-[#D4AF37] p-6 rounded-2xl text-white flex justify-between items-center shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-6 -translate-y-6" />
                    <div>
                      <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider block">HealthOil Wallet Balance</span>
                      <span className="text-3xl font-serif font-extrabold block mt-2 text-[#D4AF37]">₹{userProfile.walletBalance}.00</span>
                    </div>
                    <button className="px-4 py-2 bg-white hover:bg-gray-100 text-[#002F24] text-xs font-bold rounded-xl transition-all shadow cursor-pointer border-none">
                      + Add Money
                    </button>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase mb-3">Saved Cards</span>
                    <div className="flex items-center justify-between p-4 border border-gray-150 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-[#D4AF37] shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-[#002F24]">HDFC Platinum Credit Card</span>
                          <span className="block text-[9px] text-gray-400">•••• •••• •••• 4252 • Exp: 12/29</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">Primary</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
              </>
            )}

          </div>

        </div>

      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-left">
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
            >
              &times;
            </button>
            <h3 className="text-xl font-serif font-bold text-[#002F24] mb-1">Write a Review</h3>
            <p className="text-xs text-gray-500 mb-6">For {reviewOrder?.items?.[0]?.productName || 'your order'} from {reviewOrder?.vendor?.business?.storeName || 'Vendor'}</p>
            
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl cursor-pointer bg-transparent border-none ${star <= reviewRating ? 'text-[#D4AF37]' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-[#FAF6EC] border border-gray-200 outline-none rounded-xl py-2 px-3 text-sm text-[#002F24] min-h-[100px] resize-none"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-[#002F24] text-white font-bold text-sm rounded-xl hover:bg-[#014D3A] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
