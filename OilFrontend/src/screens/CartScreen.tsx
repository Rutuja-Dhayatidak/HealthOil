import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { getCartAPI, updateCartItemAPI, removeFromCartAPI } from '../services/cartService';

const CartScreen = ({ onBack, onCheckout }: { onBack?: () => void, onCheckout?: () => void }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    const res = await getCartAPI();
    if (res.success && res.cart) {
      setCartItems(res.cart.items || []);
    } else if (res.items) {
      setCartItems(res.items); // fallback if api returns just items array
    }
    setLoading(false);
  };

  const handleUpdateQty = async (item: any, newQty: number) => {
    if (newQty < 1) return;
    
    // Optimistic update
    setCartItems(prev => prev.map(i => i.id === item.id && i.variant === item.variant ? { ...i, qty: newQty } : i));
    
    await updateCartItemAPI(item.id, item.variant, newQty);
    // Optionally refetch cart here if backend does specific rounding or stock checks
  };

  const handleRemove = async (item: any) => {
    setCartItems(prev => prev.filter(i => !(i.id === item.id && i.variant === item.variant)));
    await removeFromCartAPI(item.id, item.variant);
  };

  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryCharge = itemTotal > 299 || itemTotal === 0 ? 0 : 40;
  const packagingCharge = itemTotal > 0 ? 10 : 0;
  const totalAmount = itemTotal + deliveryCharge + packagingCharge;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}><Text>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart ({cartItems.length})</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        {loading ? (
           <ActivityIndicator size="large" color="#1A3616" style={{ marginTop: 50 }} />
        ) : cartItems.length === 0 ? (
           <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>Your cart is empty.</Text>
        ) : (
          cartItems.map((item, idx) => (
            <View key={`${item.id}-${item.variant}-${idx}`} style={styles.cartItem}>
              <View style={styles.itemTopRow}>
                <Image source={{ uri: item.image || 'https://via.placeholder.com/80' }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemStore}>{item.brand} • {item.variant}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>
                <View style={styles.qtyContainer}>
                  <View style={styles.qtyControls}>
                     <TouchableOpacity style={styles.qtyButton} onPress={() => handleUpdateQty(item, item.qty - 1)}><Text style={styles.qtyText}>-</Text></TouchableOpacity>
                     <Text style={styles.qtyValue}>{item.qty}</Text>
                     <TouchableOpacity style={styles.qtyButton} onPress={() => handleUpdateQty(item, item.qty + 1)}><Text style={styles.qtyText}>+</Text></TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.dividerLight} />
              <TouchableOpacity style={styles.removeButtonFull} onPress={() => handleRemove(item)}>
                <Text style={styles.removeIcon}>🗑</Text>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Price Details */}
        {cartItems.length > 0 && (
          <View style={styles.priceDetailsContainer}>
             <Text style={styles.priceDetailsTitle}>Price Details</Text>
             <View style={styles.priceRow}>
               <Text style={styles.priceLabel}>Item Total</Text>
               <Text style={styles.priceValue}>₹{itemTotal}</Text>
             </View>
             <View style={styles.priceRow}>
               <Text style={styles.priceLabel}>Delivery Charges</Text>
               <Text style={styles.priceValue}>{deliveryCharge > 0 ? `₹${deliveryCharge}` : 'Free'}</Text>
             </View>
             <View style={styles.priceRow}>
               <Text style={styles.priceLabel}>Packaging Charges</Text>
               <Text style={styles.priceValue}>₹{packagingCharge}</Text>
             </View>
             <View style={styles.divider} />
             <View style={styles.totalRow}>
               <Text style={styles.totalLabel}>Total Amount</Text>
               <Text style={styles.totalValue}>₹{totalAmount}</Text>
             </View>
             {deliveryCharge === 0 && <Text style={styles.savingsText}>You saved ₹40 on delivery fees!</Text>}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.proceedButton} onPress={onCheckout}>
            <Text style={styles.proceedText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
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
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  itemTopRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  itemImage: {
    width: 60,
    height: 80,
    resizeMode: 'contain',
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemStore: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  qtyContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  qtyText: {
    fontSize: 16,
    color: '#333',
  },
  qtyValue: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  removeButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  removeIcon: {
    color: '#d9534f',
    fontSize: 16,
    marginRight: 6,
  },
  removeButtonText: {
    color: '#d9534f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceDetailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    marginBottom: 30,
  },
  priceDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#555',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
  },
  priceDiscount: {
    fontSize: 14,
    color: '#5cb85c',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  savingsText: {
    fontSize: 12,
    color: '#5cb85c',
    textAlign: 'center',
    marginTop: 10,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 90,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  proceedButton: {
    backgroundColor: '#f0ad4e',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default CartScreen;
