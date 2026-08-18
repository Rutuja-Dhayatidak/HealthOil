import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Homepage from './components/Homepage'
import Cart from './pages/Cart'
import NearbyShops from './pages/NearbyShops'
import ShopDetailsPage from './pages/ShopDetailsPage'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

function AppContent({ cartItems, setCartItems, handleAddToCart, cartCount, userLocation, setUserLocation }) {
  const navigate = useNavigate()
  const [selectedShop, setSelectedShop] = useState(null)

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Homepage 
            cartCount={cartCount}
            onOpenCart={() => navigate('/cart')} 
            onOpenNearbyShops={() => navigate('/nearby-shops')}
            onOpenProfile={() => navigate('/profile')}
            userLocation={userLocation}
            onLocationChange={setUserLocation}
          />
        } 
      />
      <Route 
        path="/cart" 
        element={
          <Cart 
            cartItems={cartItems}
            setCartItems={setCartItems}
            onBackToShop={() => navigate('/')} 
            onProceedToCheckout={() => alert('Proceeding to checkout with HealthOil payment gateway!')} 
          />
        } 
      />
      <Route 
        path="/nearby-shops" 
        element={
          <NearbyShops 
            onBackToShop={() => navigate('/')}
            onSelectShop={(shop) => {
              setSelectedShop(shop)
              navigate('/shop-details')
            }}
            userLocation={userLocation}
          />
        } 
      />
      <Route 
        path="/shop-details" 
        element={
          <ShopDetailsPage 
            shop={selectedShop}
            onBackToShops={() => navigate('/nearby-shops')}
            onAddToCart={handleAddToCart}
            cartCount={cartCount}
            onOpenCart={() => navigate('/cart')}
            onOpenNearbyShops={() => navigate('/nearby-shops')}
            onOpenProfile={() => navigate('/profile')}
            userLocation={userLocation}
          />
        } 
      />
      <Route 
        path="/profile" 
        element={
          <Profile 
            cartCount={cartCount}
            onOpenCart={() => navigate('/cart')}
            onOpenNearbyShops={() => navigate('/nearby-shops')}
            onOpenProfile={() => navigate('/profile')}
            onBackToHome={() => navigate('/')}
            userLocation={userLocation}
          />
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  )
}

function App() {
  const [userLocation, setUserLocation] = useState('Pune, Maharashtra')
  // Manage cart items globally
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'Kachi Ghani Pure Mustard Oil',
      brand: 'Oli Premium',
      variant: '5 Litre Pouch',
      price: 850,
      qty: 1,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=60'
    },
    {
      id: '2',
      name: 'Cold Pressed Organic Coconut Oil',
      brand: 'Oli Organics',
      variant: '1 Litre Glass Bottle',
      price: 520,
      qty: 2,
      image: 'https://images.unsplash.com/photo-1622484211148-716598e04144?w=200&auto=format&fit=crop&q=60'
    }
  ])

  const handleAddToCart = (newItem) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === newItem.id)
      if (exists) {
        return prev.map(item => item.id === newItem.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, newItem]
    })
  }

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0)

  return (
    <BrowserRouter>
      <AppContent 
        cartItems={cartItems}
        setCartItems={setCartItems}
        handleAddToCart={handleAddToCart}
        cartCount={cartCount}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
      />
    </BrowserRouter>
  )
}

export default App
