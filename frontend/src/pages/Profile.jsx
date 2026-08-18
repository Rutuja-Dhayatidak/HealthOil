import { useState, useEffect } from 'react'
import { ArrowLeft, User, Mail, Phone, MapPin, Package, Award, Wallet, CreditCard, ChevronRight, LogOut, ShieldAlert, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { userService } from '../ApiServices/userService'

export default function Profile({ cartCount, onOpenCart, onOpenNearbyShops, onOpenProfile, onBackToHome }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    coins: 450,
    walletBalance: 1250,
    joinDate: ''
  })

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
    fetchProfile();
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

  // Order history
  const orders = [
    {
      id: 'HO-9824',
      date: 'Today, 2:30 PM',
      shop: 'Krishna Organic Oils',
      items: '1x Cold Pressed Kachi Ghani Mustard Oil (1 Litre Bottle)',
      total: 199,
      status: 'Out for Delivery',
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      id: 'HO-8711',
      date: 'Aug 3, 2026',
      shop: 'Balaji Mustard Mills',
      items: '2x Premium Wood Pressed Coconut Oil (1 Litre Bottle)',
      total: 658,
      status: 'Delivered',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    }
  ]

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

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    navigate('/login')
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
    <div className="min-h-screen bg-[#FAF4E8] text-[#15251F] font-sans selection:bg-[#D4AF37] selection:text-[#002F24] overflow-x-hidden text-left">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Quick Profile Info Card */}
          <div className="lg:col-span-4 bg-white border border-[#D4AF37]/15 rounded-none p-6 shadow-sm">
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
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-150 rounded-2xl p-4 bg-[#FAF6EC]/30">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                        <div>
                          <span className="text-xs font-serif font-bold text-[#002F24]">{order.shop}</span>
                          <span className="block text-[9px] text-gray-400 mt-0.5">{order.date} • ID: {order.id}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${order.color}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-600 leading-snug">{order.items}</p>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                          <span className="text-[10px] text-gray-400">Total Price</span>
                          <span className="text-sm font-extrabold text-[#002F24]">₹{order.total}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <button className="w-full py-3 bg-[#FAF6EC] hover:bg-[#efe7d3] text-[#002F24] border border-dashed border-[#D4AF37]/50 rounded-2xl text-xs font-bold transition-all cursor-pointer border-none">
                    + Add New Delivery Address
                  </button>
                </div>
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
    </div>
  )
}
