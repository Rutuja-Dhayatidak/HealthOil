import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPublicShops, getPublicProducts } from '../services/shopService';

const HomeScreen = ({ onNavigateToStore, onNavigateToProduct, onNavigateToCart }: { onNavigateToStore?: (storeId: string) => void, onNavigateToProduct?: (productId: string) => void, onNavigateToCart?: () => void }) => {
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [shopsRes, productsRes] = await Promise.all([
          getPublicShops(),
          getPublicProducts()
        ]);
        
        if (shopsRes.success) setStores(shopsRes.shops);
        if (productsRes.success) setProducts(productsRes.products);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.deliverToText}>Deliver to</Text>
          <Text style={styles.locationText}>Pimpri, Pune ∨</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
             <Text>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onNavigateToCart}>
             <Text>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search oil, brand or store..." 
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.filterButton}>
          <Text>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <ImageBackground 
        source={require('../assets/image copy.png')} 
        style={styles.bannerContainer}
        imageStyle={{ borderRadius: 12, resizeMode: 'cover' }}
      >
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>100% Pure Oils</Text>
          <Text style={styles.bannerSubtitle}>Delivered Near You</Text>
          <Text style={styles.bannerOffer}>Up to 30% OFF</Text>
          <TouchableOpacity style={styles.shopNowButton}>
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {[
          { name: 'Mustard', image: require('../assets/MustardOil.png') },
          { name: 'Sunflower', image: require('../assets/sunflowerOil.png') },
          { name: 'Groundnut', image: require('../assets/GroundnutOil.png') },
          { name: 'Coconut', image: require('../assets/CoconutOil.png') },
          { name: 'Olive', image: require('../assets/OliveOil.png') },
          { name: 'Rice Bran', image: require('../assets/RiceBrainOil.png') }
        ].map((item, index) => (
          <View key={index} style={styles.categoryItem}>
            <Image 
              source={item.image} 
              style={[styles.categoryIcon, { resizeMode: 'cover' }]} 
            />
            <Text style={styles.categoryText}>{item.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Nearby Stores */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nearby Stores</Text>
        <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storesContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#1A3616" style={{ margin: 20 }} />
        ) : stores.length === 0 ? (
          <Text style={{ marginHorizontal: 15, color: '#666' }}>No stores found near you.</Text>
        ) : (
          stores.map((store) => (
            <TouchableOpacity 
              key={store.id} 
              style={styles.storeCard} 
              activeOpacity={0.8}
              onPress={() => onNavigateToStore && onNavigateToStore(store.id)}
            >
              <Image 
                source={store.image ? { uri: store.image } : require('../assets/image copy 2.png')} 
                style={styles.storeImage} 
              />
              <View style={styles.storeInfoContainer}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeDistance}>{store.distance || '2.5'} KM away</Text>
                <View style={styles.storeFooter}>
                  <View style={styles.storeRating}>
                    <Text style={styles.ratingText}>⭐ {store.rating || '4.0'}  •  30 min</Text>
                  </View>
                  <View style={[styles.openBadge, store.status === 'Closed' && { backgroundColor: '#FF3B30' }]}>
                    <Text style={[styles.openBadgeText, store.status === 'Closed' && { color: '#fff' }]}>{store.status}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Popular Near You */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Near You</Text>
        <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#1A3616" style={{ margin: 20 }} />
        ) : products.length === 0 ? (
          <Text style={{ marginHorizontal: 15, color: '#666' }}>No products found.</Text>
        ) : (
          products.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.productCard}
              activeOpacity={0.8}
              onPress={() => onNavigateToProduct && onNavigateToProduct(item.id)}
            >
               <Image 
                 source={item.image ? { uri: item.image } : require('../assets/sunflower_oil_bottle.jpg')} 
                 style={styles.productImage} 
               />
               <View style={styles.productInfo}>
                 <Text style={styles.productBrand} numberOfLines={1}>{item.brandName || 'HealthOil'}</Text>
                 <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                 <Text style={styles.productSize}>{item.size}</Text>
                 <View style={styles.priceRow}>
                   <Text style={styles.productPrice}>₹{item.price}</Text>
                   {item.mrp > item.price && <Text style={styles.productMrp}>₹{item.mrp}</Text>}
                 </View>
                 <View style={styles.cardFooter}>
                   {item.mrp > item.price ? (
                     <View style={styles.discountPill}><Text style={styles.discountText}>{Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF</Text></View>
                   ) : <View style={styles.discountPill}><Text style={styles.discountText}>BEST PRICE</Text></View>}
                   <TouchableOpacity style={styles.addBtn}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
                 </View>
               </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <View style={{height: 80}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  deliverToText: {
    fontSize: 12,
    color: '#666',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    color: '#333',
  },
  filterButton: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  bannerContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  bannerOffer: {
    fontSize: 14,
    color: '#d9534f',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  shopNowButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  shopNowText: {
    color: '#fff',
    fontSize: 12,
  },
  bannerImage: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    color: '#f0ad4e',
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 25,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIcon: {
    width: 85,
    height: 85,
    backgroundColor: '#f9f9f9',
    borderRadius: 45,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#333',
  },
  storesContainer: {
    marginBottom: 25,
  },
  storeCard: {
    width: 220,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f5e8d3',
    overflow: 'hidden',
  },
  storeImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  storeInfoContainer: {
    padding: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  storeDistance: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#555',
  },
  openBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadgeText: {
    color: '#2e7d32',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productsContainer: {
    marginBottom: 20,
    paddingBottom: 8,
  },
  productCard: {
    width: 180,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 130,
    resizeMode: 'cover',
    backgroundColor: '#F6F4EE',
  },
  productInfo: {
    padding: 12,
  },
  productBrand: { fontSize: 10, color: '#6B7280', marginBottom: 2 },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  productSize: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 6,
  },
  productMrp: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  discountPill: { backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  discountText: { fontSize: 9, color: '#2E7D32', fontWeight: '700' },
  addBtn: { backgroundColor: '#1A3616', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', lineHeight: 20 },
});

export default HomeScreen;
