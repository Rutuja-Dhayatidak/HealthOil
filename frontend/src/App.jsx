import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
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
            cartCount={cartCount}
            onOpenCart={() => navigate('/cart')}
            onOpenNearbyShops={() => navigate('/nearby-shops')}
            onOpenProfile={() => navigate('/profile')}
            userLocation={userLocation}
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  const [userLocation, setUserLocation] = useState('Pune, Maharashtra')
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('guestCart');
    return saved ? JSON.parse(saved) : [];
  })

  // Sync guest cart to local storage whenever it changes (only if no token)
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      localStorage.setItem('guestCart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Fetch backend cart if logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      import('./ApiServices/cartService').then(({ getCart }) => {
        getCart().then(res => {
          if (res.success && res.items) {
            setCartItems(res.items);
          }
        }).catch(err => console.error('Failed to load cart', err));
      });
    }
  }, []);

  const handleAddToCart = async (newItem) => {
    const token = localStorage.getItem('token');
    
    // Optimistic UI update
    setCartItems(prev => {
      const exists = prev.find(item => item.id === newItem.id && item.variant === newItem.variant)
      if (exists) {
        return prev.map(item => 
          (item.id === newItem.id && item.variant === newItem.variant) 
            ? { ...item, qty: item.qty + (newItem.qty || 1) } 
            : item
        )
      }
      return [...prev, newItem]
    });

    if (token) {
      try {
        const { addToCartAPI } = await import('./ApiServices/cartService');
        await addToCartAPI(newItem);
      } catch (err) {
        console.error('Failed to add to backend cart', err);
      }
    }
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
