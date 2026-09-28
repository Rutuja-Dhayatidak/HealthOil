/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnboardingScreen from './src/components/OnboardingScreen';
import LoginScreen from './src/components/LoginScreen';
import RegisterScreen from './src/components/RegisterScreen';
import ForgotPasswordScreen from './src/components/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import NearbyStoresScreen from './src/screens/NearbyStoresScreen';
import StoreDetailsScreen from './src/screens/StoreDetailsScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import BottomNavBar from './src/components/BottomNavBar';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [history, setHistory] = useState<string[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [currentScreen, setCurrentScreenState] = useState('onboarding');

  const setCurrentScreen = (screen: string) => {
    // Only add to history if we're actually changing screens
    if (screen !== currentScreen) {
      setHistory(prev => [...prev, currentScreen]);
      setCurrentScreenState(screen);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (history.length > 0) {
        const previousScreen = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setCurrentScreenState(previousScreen);
        return true; // Prevent default behavior (app exit)
      }
      return false; // Exit app if no history
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [history]);


  const showBottomNav = ['home', 'searchResults', 'nearbyStores', 'cart', 'checkout', 'orderSuccess', 'orderTracking', 'myOrders', 'profile', 'wishlist'].includes(currentScreen);
  
  const getActiveTab = () => {
    if (currentScreen === 'home') return 'home';
    if (currentScreen === 'searchResults') return 'search';
    if (currentScreen === 'myOrders') return 'orders';
    if (currentScreen === 'profile') return 'profile';
    if (currentScreen === 'wishlist') return 'wishlist';
    return 'home';
  };

  return (
    <SafeAreaProvider>
      {/* @ts-ignore: Android specific props not recognized by this TS version */}
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      
      {currentScreen === 'onboarding' && (
        <OnboardingScreen 
          onNavigateToLogin={() => setCurrentScreen('login')} 
          onNavigateToHome={() => setCurrentScreen('home')}
        />
      )}
      
      {currentScreen === 'login' && (
        <LoginScreen 
          onBack={() => setCurrentScreen('onboarding')} 
          onNavigateToRegister={() => setCurrentScreen('register')} 
          onNavigateToForgotPassword={() => setCurrentScreen('forgotPassword')}
          onNavigateToHome={() => setCurrentScreen('home')}
        />
      )}
      
      {currentScreen === 'register' && (
        <RegisterScreen 
          onNavigateToLogin={() => setCurrentScreen('login')} 
          onNavigateToHome={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'forgotPassword' && (
        <ForgotPasswordScreen onNavigateToLogin={() => setCurrentScreen('login')} />
      )}

      {currentScreen === 'home' && (
        <HomeScreen 
          onNavigateToStore={(id) => {
            setSelectedStoreId(id);
            setCurrentScreen('storeDetails');
          }}
          onNavigateToProduct={(id) => {
            setSelectedProductId(id);
            setCurrentScreen('productDetails');
          }}
          onNavigateToCart={() => setCurrentScreen('cart')}
        />
      )}
      {currentScreen === 'searchResults' && (
        <SearchResultsScreen 
          onNavigateToStore={(id) => { setSelectedStoreId(id); setCurrentScreen('storeDetails'); }} 
          onNavigateToProduct={(id) => { setSelectedProductId(id); setCurrentScreen('productDetails'); }}
          onBack={() => setCurrentScreen('home')}
          onNavigateToCart={() => setCurrentScreen('cart')}
        />
      )}
      {currentScreen === 'nearbyStores' && <NearbyStoresScreen />}
      {currentScreen === 'storeDetails' && <StoreDetailsScreen storeId={selectedStoreId} onNavigateToProduct={(id) => { setSelectedProductId(id); setCurrentScreen('productDetails'); }} onBack={() => setCurrentScreen('home')} />}
      {currentScreen === 'productDetails' && <ProductDetailsScreen productId={selectedProductId} onNavigateToCart={() => setCurrentScreen('cart')} onBack={() => setCurrentScreen('storeDetails')} />}
      {currentScreen === 'cart' && <CartScreen onBack={() => setCurrentScreen('home')} onCheckout={() => setCurrentScreen('checkout')} />}
      {currentScreen === 'checkout' && (
        <CheckoutScreen 
          onBack={() => setCurrentScreen('cart')} 
          onOrderSuccess={(orderId) => { 
            if (orderId) setSelectedOrderId(orderId);
            setCurrentScreen('orderSuccess'); 
          }} 
        />
      )}
      {currentScreen === 'orderSuccess' && (
        <OrderSuccessScreen 
          orderId={selectedOrderId || undefined}
          onTrackOrder={(orderId) => { 
            if (orderId) setSelectedOrderId(orderId);
            setCurrentScreen('orderTracking'); 
          }} 
          onContinueShopping={() => setCurrentScreen('home')} 
        />
      )}
      {currentScreen === 'orderTracking' && <OrderTrackingScreen orderId={selectedOrderId} onBack={() => setCurrentScreen('home')} />}
      {currentScreen === 'myOrders' && (
        <MyOrdersScreen 
          onTrackOrder={(orderId) => { setSelectedOrderId(orderId); setCurrentScreen('orderTracking'); }} 
          onNavigateToLogin={() => setCurrentScreen('login')}
          onShopNow={() => setCurrentScreen('home')}
        />
      )}
      {currentScreen === 'profile' && (
        <ProfileScreen 
          onNavigateToLogin={() => setCurrentScreen('login')} 
          onNavigateToOrders={() => setCurrentScreen('myOrders')}
          onNavigateToWishlist={() => setCurrentScreen('wishlist')}
        />
      )}
      {currentScreen === 'wishlist' && <WishlistScreen onBack={() => setCurrentScreen('home')} onNavigateToCart={() => setCurrentScreen('cart')} />}

      {showBottomNav && (
        <BottomNavBar 
          currentTab={getActiveTab()}
          onTabPress={(tab) => {
            if (tab === 'home') setCurrentScreen('home');
            else if (tab === 'search') setCurrentScreen('searchResults');
            else if (tab === 'orders') setCurrentScreen('myOrders');
            else if (tab === 'profile') setCurrentScreen('profile');
            else if (tab === 'wishlist') setCurrentScreen('wishlist');
          }}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;

