import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { getCartAPI } from '../services/cartService';
import { createRazorpayOrderAPI, verifyPaymentAPI } from '../services/orderService';
import { getUserProfile } from '../services/userService';
import RazorpayCheckout from 'react-native-razorpay';
import Geolocation from '@react-native-community/geolocation';

const CheckoutScreen = ({ onBack, onOrderSuccess }: { onBack?: () => void, onOrderSuccess?: (orderId?: string) => void }) => {
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  
  // Default Map Coordinates (Pune, India)
  const [location, setLocation] = useState({
    latitude: 18.6298,
    longitude: 73.7997,
  });
  const [addressName, setAddressName] = useState('Fetching location...');

  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      const res = await getCartAPI();
      if (res.success && res.cart) {
        setCartItems(res.cart.items || []);
      } else if (res.items) {
        setCartItems(res.items);
      }
      setLoading(false);
    };
    
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        if (res.success && res.user && res.user.phone) {
          setPhoneNumber(res.user.phone);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchCart();
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        setAddressName('Fetching address...');
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`, {
          headers: {
            'User-Agent': 'OilAppFrontend/1.0',
            'Accept-Language': 'en-US,en'
          }
        });
        const data = await response.json();
        if (data && data.display_name) {
          // Take first 3 parts of the address to keep it concise
          const parts = data.display_name.split(',').slice(0, 3).join(',');
          setAddressName(parts);
        } else {
          setAddressName(`Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`);
        }
      } catch (error) {
        setAddressName(`Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`);
      }
    };

    // Debounce the fetch to avoid spamming the API while dragging
    const timeoutId = setTimeout(() => {
      fetchAddress();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [location.latitude, location.longitude]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location to auto-detect your delivery address.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleAutoLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to fetch your current location.');
      return;
    }

    setFetchingLocation(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setFetchingLocation(false);
      },
      (error) => {
        setFetchingLocation(false);
        Alert.alert('Error', 'Failed to get your location. Please check if GPS is enabled.');
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setPlacingOrder(true);
    try {
      const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const deliveryCharge = itemTotal > 299 || itemTotal === 0 ? 0 : 40;
      const packagingCharge = itemTotal > 0 ? 10 : 0;
      const totalAmount = itemTotal + deliveryCharge + packagingCharge;

      // 1. Create Razorpay Order
      const orderRes = await createRazorpayOrderAPI(totalAmount);
      
      if (!orderRes.success || !orderRes.orderId) {
        Alert.alert('Error', orderRes.message || 'Failed to initialize payment');
        setPlacingOrder(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        description: 'HealthOil Purchase',
        image: 'https://cdn-icons-png.flaticon.com/512/3014/3014540.png', // Add a valid logo url here
        currency: orderRes.currency,
        key: orderRes.keyId,
        amount: orderRes.amount,
        name: 'HealthOil',
        order_id: orderRes.orderId,
        prefill: {
          email: 'user@example.com',
          contact: '9876543210',
          name: 'HealthOil User'
        },
        theme: { color: '#1A3616' }
      };

      RazorpayCheckout.open(options).then(async (data: any) => {
        // 3. Verify Payment on Backend
        const verifyRes = await verifyPaymentAPI({
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
          cartItems: cartItems,
          deliveryAddress: `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`,
          totalAmount: totalAmount
        });

        if (verifyRes.success) {
          const createdOrderId = verifyRes.orders?.[0]?.orderId || verifyRes.orders?.[0]?._id;
          if (onOrderSuccess) {
            onOrderSuccess(createdOrderId);
          } else {
            Alert.alert('Success', 'Order placed successfully!');
          }
        } else {
          Alert.alert('Error', verifyRes.message || 'Payment verification failed');
        }
        setPlacingOrder(false);
      }).catch((error: any) => {
        console.error('Razorpay Error:', error);
        Alert.alert('Payment Failed', `Payment cancelled or failed.`);
        setPlacingOrder(false);
      });

    } catch (error) {
      console.error('Checkout Error:', error);
      Alert.alert('Error', 'Something went wrong during checkout.');
      setPlacingOrder(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}><Text>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Deliver To */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Deliver to</Text>
          <View style={{ height: 200, width: '100%', marginBottom: 15, borderRadius: 10, overflow: 'hidden' }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              region={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              mapType="none"
              onRegionChangeComplete={(region) => setLocation({ latitude: region.latitude, longitude: region.longitude })}
            >
              <UrlTile
                urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
              />
              <Marker
                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                title="Delivery Location"
                draggable
                onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
              />
            </MapView>
          </View>
          <View style={styles.addressBox}>
            <View style={styles.addressInfo}>
              <Text style={styles.addressType}>Map Location</Text>
              <Text style={styles.addressText}>{addressName}</Text>
            </View>
            <TouchableOpacity style={styles.autoLocateBtn} onPress={handleAutoLocation} disabled={fetchingLocation}>
               {fetchingLocation ? <ActivityIndicator size="small" color="#1A3616" /> : <Text style={styles.autoLocateBtnText}>📍 Auto Locate</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <View style={styles.addressBox}>
            {isEditingPhone ? (
              <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <TextInput 
                  style={{flex: 1, fontSize: 16, color: '#333', padding: 0}}
                  value={tempPhone}
                  onChangeText={setTempPhone}
                  keyboardType="phone-pad"
                  autoFocus
                />
                <TouchableOpacity onPress={() => {setPhoneNumber(tempPhone); setIsEditingPhone(false);}}>
                  <Text style={styles.changeText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.phoneText}>{phoneNumber || '+91 98765 43210'}</Text>
                <TouchableOpacity onPress={() => {setTempPhone(phoneNumber); setIsEditingPhone(true);}}>
                  <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <TouchableOpacity 
            style={styles.paymentOptionRow}
            onPress={() => setPaymentMethod('Online')}
          >
            <View style={styles.radioContainer}>
              <View style={[styles.radio, paymentMethod === 'Online' && styles.radioSelected]} />
              <Text style={styles.paymentText}>Pay Online (Razorpay)</Text>
            </View>
            <View style={styles.paymentIcons}>
              {/* Mock icons for GPay, PhonePe, Paytm */}
              <Text style={styles.mockIcon}>G</Text>
              <Text style={styles.mockIcon}>P</Text>
              <Text style={styles.mockIcon}>p</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.paymentOptionRow}
            onPress={() => setPaymentMethod('Card')}
          >
            <View style={styles.radioContainer}>
              <View style={[styles.radio, paymentMethod === 'Card' && styles.radioSelected]} />
              <Text style={styles.paymentText}>Credit / Debit Card</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.paymentOptionRow}
            onPress={() => setPaymentMethod('COD')}
          >
            <View style={styles.radioContainer}>
              <View style={[styles.radio, paymentMethod === 'COD' && styles.radioSelected]} />
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.paymentOptionRow}
            onPress={() => setPaymentMethod('Wallet')}
          >
            <View style={styles.radioContainer}>
              <View style={[styles.radio, paymentMethod === 'Wallet' && styles.radioSelected]} />
              <Text style={styles.paymentText}>Wallet (Balance: ₹120)</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Apply Coupon */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Apply Coupon</Text>
          <View style={styles.couponRow}>
            <TextInput style={styles.couponInput} value="SAVE20" />
            <TouchableOpacity><Text style={styles.removeCouponText}>Remove</Text></TouchableOpacity>
          </View>
        </View>
        
        <View style={{height: 100}} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceInfo}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalAmount}>
            ₹{cartItems.length > 0 ? (cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0) + (cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0) > 299 ? 0 : 40) + 10) : 0}
          </Text>
        </View>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={placingOrder || loading}>
          {placingOrder ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  addressBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 15,
  },
  addressInfo: {
    flex: 1,
  },
  addressType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  autoLocateBtn: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  autoLocateBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A3616',
  },
  changeText: {
    color: '#f0ad4e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  phoneText: {
    fontSize: 16,
    color: '#333',
  },
  paymentOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#f0ad4e',
    backgroundColor: '#f0ad4e',
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
  },
  paymentIcons: {
    flexDirection: 'row',
  },
  mockIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
    lineHeight: 24,
    marginLeft: 5,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  couponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  couponInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  removeCouponText: {
    color: '#d9534f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 90, // Avoid overlap with global BottomNavBar
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceInfo: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeOrderBtn: {
    flex: 1,
    backgroundColor: '#1A3616',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeOrderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default CheckoutScreen;
