import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { getPublicShopDetails } from '../services/shopService';

const { width } = Dimensions.get('window');

const StoreDetailsScreen = ({ storeId, onNavigateToProduct, onBack }: { storeId?: string | null, onNavigateToProduct?: (id: string) => void, onBack?: () => void }) => {
  const [storeData, setStoreData] = useState<any>(null);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [storeReviews, setStoreReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      const res = await getPublicShopDetails(storeId!);
      if (res.success) {
        setStoreData(res.shop);
        setProductsData(res.products);
        setStoreReviews(res.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching store details:', error);
    } finally {
      setLoading(false);
    }
  };
  const categories = [
    { name: 'All Oils', image: require('../assets/sunflower_oil_bottle.jpg') },
    { name: 'Mustard', image: require('../assets/mustard_oil_bottle.jpg') },
    { name: 'Sunflower', image: require('../assets/sunflower_oil_bottle.jpg') },
    { name: 'Groundnut', image: require('../assets/sunflower_oil_bottle.jpg') },
    { name: 'Coconut', image: require('../assets/sunflower_oil_bottle.jpg') },
    { name: 'Olive', image: require('../assets/OliveOil.png') },
  ];

  const bestSelling = [
    { id: '1', name: 'Sunflower Oil 1L', brand: 'Fortune', price: '₹135', originalPrice: '₹150', discount: '10% OFF', image: require('../assets/sunflower_oil_bottle.jpg') },
    { id: '2', name: 'Soya Health Oil 1L', brand: 'Fortune', price: '₹135', originalPrice: '₹150', discount: '10% OFF', image: require('../assets/sunflower_oil_bottle.jpg') },
    { id: '3', name: 'Rice Bran Oil 1L', brand: 'Fortune', price: '₹135', originalPrice: '₹150', discount: '10% OFF', image: require('../assets/sunflower_oil_bottle.jpg') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#1A3616" style={{ marginTop: 100 }} />
        ) : !storeData ? (
          <Text style={{ textAlign: 'center', marginTop: 50 }}>Store not found.</Text>
        ) : (
          <>
            {/* Top Banner & Header */}
        <View style={styles.bannerContainer}>
          <Image source={storeData.banner ? { uri: storeData.banner } : require('../assets/image copy 2.png')} style={styles.storeBannerImg} />
          
          {/* Header Navigation */}
          <View style={styles.headerNav}>
            <TouchableOpacity style={styles.navBtn} onPress={onBack}><Text style={styles.headerIcon}>←</Text></TouchableOpacity>
            <View style={styles.headerRightIcons}>
              <TouchableOpacity style={styles.navBtn}><Text style={styles.headerIcon}>🔗</Text></TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}><Text style={styles.headerIcon}>⋮</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Store Info Card */}
        <View style={styles.storeInfoCard}>
          <View style={styles.storeLogoContainer}>
            <Text style={styles.logoIcon}>🌿</Text>
            <Text style={styles.logoText} numberOfLines={1}>{storeData.name?.substring(0, 10).toUpperCase()}</Text>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.storeTitle}>{storeData.name}</Text>
            <View style={[styles.openPill, storeData.status === 'Closed' && { backgroundColor: '#FF3B30' }]}>
              <Text style={[styles.openText, storeData.status === 'Closed' && { color: '#fff' }]}>{storeData.status}</Text>
            </View>
          </View>
          <Text style={styles.ratingText}>⭐ {storeData.rating || '4.0'} ({storeData.reviews || 0})  •  {storeData.distance || '2.5'} KM away</Text>
          
          <View style={styles.guaranteesRow}>
            <View style={styles.guaranteeItem}><Text style={styles.guaranteeIcon}>🛡️</Text><Text style={styles.guaranteeText}>100% Original</Text></View>
            <View style={styles.guaranteeItem}><Text style={styles.guaranteeIcon}>🏅</Text><Text style={styles.guaranteeText}>Best Quality</Text></View>
            <View style={styles.guaranteeItem}><Text style={styles.guaranteeIcon}>🚚</Text><Text style={styles.guaranteeText}>Fast Delivery</Text></View>
          </View>
        </View>

            {/* Stats Row */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>⏱️</Text>
                <View>
                  <Text style={styles.statValue}>30-35 min</Text>
                  <Text style={styles.statLabel}>Delivery Time</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>🛍️</Text>
                <View>
                  <Text style={styles.statValue}>Minimum Order</Text>
                  <Text style={styles.statLabel}>₹199</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>🚚</Text>
                <View>
                  <Text style={styles.statValue}>Free Delivery</Text>
                  <Text style={styles.statLabel}>Above ₹499</Text>
                </View>
              </View>
            </View>

            {/* Store Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Store Details</Text>
              <Text style={styles.aboutText}>{storeData.description || 'We provide 100% pure and original oils with best quality and fast delivery.'}</Text>
              
              <View style={styles.infoBox}>
                <View style={styles.infoRow}><Text style={styles.infoIcon}>👤</Text><Text style={styles.infoText}><Text style={{fontWeight: '700'}}>Owner:</Text> {storeData.owner}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoIcon}>📞</Text><Text style={styles.infoText}><Text style={{fontWeight: '700'}}>Phone:</Text> {storeData.phone}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoIcon}>✉️</Text><Text style={styles.infoText}><Text style={{fontWeight: '700'}}>Email:</Text> {storeData.email}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoIcon}>📍</Text><Text style={styles.infoText}><Text style={{fontWeight: '700'}}>Address:</Text> {storeData.address}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoIcon}>🕒</Text><Text style={styles.infoText}><Text style={{fontWeight: '700'}}>Timing:</Text> {storeData.timing}</Text></View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <Text style={styles.infoText}>
                    <Text style={{fontWeight: '700'}}>Days Open:</Text> {
                      storeData.operatingDays && storeData.operatingDays.length > 0 
                      ? (storeData.operatingDays.length === 7 ? 'Everyday' : storeData.operatingDays.join(', '))
                      : 'Mon - Sat'
                    }
                  </Text>
                </View>
                {storeData.fssai ? (
                  <View style={styles.infoRow}><Text style={styles.infoIcon}>📜</Text><Text style={styles.infoText}><Text style={{fontWeight: '700'}}>GST/FSSAI:</Text> {storeData.fssai}</Text></View>
                ) : null}
              </View>

              {/* Social Links */}
              {storeData.socialLinks && (storeData.socialLinks.facebook || storeData.socialLinks.instagram || storeData.socialLinks.website) && (
                <View style={styles.socialContainer}>
                  {storeData.socialLinks.facebook ? <TouchableOpacity style={[styles.socialBtn, {marginRight: 8}]}><Text style={styles.socialText}>Facebook</Text></TouchableOpacity> : null}
                  {storeData.socialLinks.instagram ? <TouchableOpacity style={[styles.socialBtn, {marginRight: 8}]}><Text style={styles.socialText}>Instagram</Text></TouchableOpacity> : null}
                  {storeData.socialLinks.website ? <TouchableOpacity style={[styles.socialBtn, {marginRight: 8}]}><Text style={styles.socialText}>Website</Text></TouchableOpacity> : null}
                </View>
              )}
            </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity><Text style={styles.viewAllText}>View All {'>'}</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((cat, idx) => (
            <View key={idx} style={styles.categoryItem}>
              <View style={[styles.categoryImgWrapper, idx === 0 && styles.activeCategoryWrapper]}>
                <Image source={cat.image} style={styles.categoryImg} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Best Selling Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Products</Text>
          <TouchableOpacity><Text style={styles.viewAllText}>View All {'>'}</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
          {productsData.length === 0 ? (
            <Text style={{ marginHorizontal: 16, color: '#666' }}>No products available yet.</Text>
          ) : (
            productsData.map((prod) => (
              <TouchableOpacity key={prod.id} style={styles.productCard} onPress={() => onNavigateToProduct && onNavigateToProduct(prod.id)} activeOpacity={0.8}>
                <TouchableOpacity style={styles.heartBtn}><Text style={styles.heartIcon}>♡</Text></TouchableOpacity>
                <View style={styles.productImgContainer}>
                   <Image source={prod.image ? { uri: prod.image } : require('../assets/sunflower_oil_bottle.jpg')} style={styles.productImg} />
                </View>
                <View style={styles.productInfoContainer}>
                  <Text style={styles.productBrand}>{prod.brandName || 'Brand'}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{prod.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{prod.price}</Text>
                    <Text style={styles.originalPrice}>₹{prod.mrp}</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <View style={styles.discountPill}><Text style={styles.discountText}>10% OFF</Text></View>
                    <TouchableOpacity style={styles.addBtn}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Store Reviews */}
        {storeReviews && storeReviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Store Reviews</Text>
              <TouchableOpacity><Text style={styles.viewAllText}>View All {'>'}</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewsScroll}>
              {storeReviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerAvatar}><Text style={styles.reviewerAvatarText}>{review.userName.charAt(0).toUpperCase()}</Text></View>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName} numberOfLines={1}>{review.userName}</Text>
                      <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.reviewRatingPill}>
                      <Text style={styles.reviewRatingText}>⭐ {review.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewProduct} numberOfLines={1}>Purchased: {review.productName}</Text>
                  <Text style={styles.reviewComment} numberOfLines={3}>"{review.comment}"</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌿</Text>
            <Text style={styles.featureText}>100% Pure{"\n"}And Original</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <Text style={styles.featureText}>Quality{"\n"}Guaranteed</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛵</Text>
            <Text style={styles.featureText}>Fast & Safe{"\n"}Delivery</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎧</Text>
            <Text style={styles.featureText}>24x7{"\n"}Support</Text>
          </View>
        </View>

        <View style={{height: 60}} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFBF8',
  },
  container: {
    flex: 1,
  },
  headerNav: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  navBtn: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
    color: '#1A3616',
    fontWeight: 'bold',
  },
  headerRightIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  storeBannerImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storeInfoCard: {
    backgroundColor: '#FCFBF8',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    position: 'relative',
  },
  storeLogoContainer: {
    position: 'absolute',
    top: -40,
    left: 20,
    backgroundColor: '#fff',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 5,
    borderWidth: 2,
    borderColor: '#F6F4EE',
  },

  logoIcon: {
    fontSize: 20,
    color: '#2E7D32',
  },
  logoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A3616',
    letterSpacing: 1,
  },
  logoSubText: {
    fontSize: 6,
    color: '#666',
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  storeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A3616',
    marginRight: 10,
  },
  openPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  openText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
  },
  ratingText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    marginBottom: 12,
  },
  guaranteesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guaranteeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  guaranteeText: {
    fontSize: 10,
    color: '#4B5563',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    marginBottom: 24,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  aboutContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  aboutTextCol: {
    flex: 1,
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A3616',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  aboutImg: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewAllText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingLeft: 16,
    marginBottom: 24,
    paddingBottom: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryImgWrapper: {
    width: 64,
    height: 64,
    backgroundColor: '#F6F4EE',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeCategoryWrapper: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  categoryImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  categoryName: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  productsScroll: {
    paddingLeft: 16,
    marginBottom: 24,
    paddingBottom: 12,
  },
  productCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  productInfoContainer: {
    padding: 12,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 14,
    color: '#999',
  },
  productImgContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F6F4EE',
  },
  productImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productBrand: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: '#1A3616',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F6F4EE',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  featureText: {
    fontSize: 9,
    color: '#1A3616',
    fontWeight: '600',
  },
  detailsContainer: { paddingHorizontal: 16, marginBottom: 24 },
  infoBox: { backgroundColor: '#FDFCF6', padding: 16, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  infoIcon: { fontSize: 14, marginRight: 8, marginTop: 2 },
  infoText: { fontSize: 12, color: '#4B5563', flex: 1, lineHeight: 18 },
  socialContainer: { flexDirection: 'row', marginTop: 12 },
  socialBtn: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  socialText: { color: '#2E7D32', fontSize: 11, fontWeight: '600' },
  reviewsSection: { marginBottom: 24 },
  reviewsScroll: { paddingLeft: 16, paddingBottom: 12 },
  reviewCard: { width: 260, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginRight: 16, borderWidth: 1, borderColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reviewerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A3616', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  reviewerAvatarText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  reviewerInfo: { flex: 1 },
  reviewerName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  reviewDate: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  reviewRatingPill: { backgroundColor: '#FDFCF6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#E8F5E9' },
  reviewRatingText: { fontSize: 11, color: '#2E7D32', fontWeight: '700' },
  reviewProduct: { fontSize: 10, color: '#2E7D32', fontWeight: '600', marginBottom: 6 },
  reviewComment: { fontSize: 12, color: '#4B5563', lineHeight: 18, fontStyle: 'italic' },
});

export default StoreDetailsScreen;
