import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWishlistAPI, removeFromWishlistAPI } from '../services/wishlistService';
import { addToCartAPI } from '../services/cartService';

const WishlistScreen = ({ onBack, onNavigateToCart }: { onBack?: () => void, onNavigateToCart?: () => void }) => {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    const res = await getWishlistAPI();
    if (res.success && res.items) {
      setWishlistItems(res.items);
    }
    setLoading(false);
  };

  const handleRemove = async (item: any) => {
    setWishlistItems(prev => prev.filter(i => i.id !== item.id));
    await removeFromWishlistAPI(item.id);
  };

  const handleAddToCart = async (item: any) => {
    const res = await addToCartAPI({
      id: item.id,
      name: item.name,
      brand: item.brand,
      variant: item.variant || '1L',
      price: item.price,
      qty: 1,
      image: item.image
    });
    
    if (res.success) {
      Alert.alert('Success', 'Item added to cart!');
    } else {
      Alert.alert('Error', res.message || 'Could not add item to cart.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={onBack}>
            <Text style={styles.iconText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wishlist ({wishlistItems.length})</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.cartButton} onPress={onNavigateToCart}>
              <Text style={styles.iconText}>🛒</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {loading ? (
             <ActivityIndicator size="large" color="#1A3616" style={{ marginTop: 50 }} />
          ) : wishlistItems.length === 0 ? (
             <Text style={styles.emptyText}>Your wishlist is empty.</Text>
          ) : (
            wishlistItems.map((item, idx) => (
              <View key={`${item.id}-${idx}`} style={styles.wishlistItem}>
                <View style={styles.itemTopRow}>
                  <Image source={{ uri: item.image || 'https://via.placeholder.com/80' }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    {item.brand && <Text style={styles.itemBrand}>{item.brand}</Text>}
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                  </View>
                </View>
                <View style={styles.dividerLight} />
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item)}>
                    <Text style={styles.removeIcon}>🗑</Text>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addToCartButton} onPress={() => handleAddToCart(item)}>
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FCFBF8' },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconButton: { padding: 8, backgroundColor: '#fff', borderRadius: 20, elevation: 1 },
  iconText: { fontSize: 20, color: '#1A3616' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A3616' },
  headerRight: { flexDirection: 'row', gap: 12 },
  cartButton: { padding: 8, backgroundColor: '#fff', borderRadius: 20, elevation: 1 },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center', 
    marginTop: 50, 
    color: '#666',
    fontSize: 16
  },
  wishlistItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#F9F9F9',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A3616',
  },
  dividerLight: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removeIcon: {
    fontSize: 16,
    color: '#D32F2F',
    marginRight: 6,
  },
  removeButtonText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#1A3616',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default WishlistScreen;
