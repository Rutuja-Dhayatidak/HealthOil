import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Path,
  Circle,
  Rect,
  Polyline,
  Line,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { getPublicShops, getPublicProducts } from '../services/shopService';
import { addToCartAPI } from '../services/cartService';
import { addToWishlistAPI, removeFromWishlistAPI } from '../services/wishlistService';

const { width } = Dimensions.get('window');
const cardWidth = (width - 44) / 2;

// ── SVG Icons ─────────────────────────────────────────────────────────────

const SearchMagnifierIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke="#4B5563" strokeWidth="2.2" />
    <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const MicIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Rect x="9" y="2" width="6" height="12" rx="3" stroke="#4B5563" strokeWidth="2" />
    <Path d="M5 10a7 7 0 0 0 14 0" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="17" x2="12" y2="21" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const BoxProductIcon = ({ color = '#FFFFFF' }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke={color} strokeWidth="2" />
    <Line x1="12" y1="22.08" x2="12" y2="12" stroke={color} strokeWidth="2" />
  </Svg>
);

const StoreBuildingIcon = ({ color = '#4B5563' }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M3 21h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3z" stroke={color} strokeWidth="2" />
    <Path d="M19 21V10M5 21V10" stroke={color} strokeWidth="2" />
    <Path d="M4 4l1.5-2h13L20 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SlidersFilterIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Line x1="4" y1="21" x2="4" y2="14" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
    <Line x1="4" y1="10" x2="4" y2="3" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="21" x2="12" y2="12" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="8" x2="12" y2="3" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
    <Line x1="20" y1="21" x2="20" y2="16" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
    <Line x1="20" y1="12" x2="20" y2="3" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
    <Line x1="1" y1="14" x2="7" y2="14" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
    <Line x1="9" y1="8" x2="15" y2="8" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
    <Line x1="17" y1="16" x2="23" y2="16" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const HeartCardIcon = ({ filled = false }: { filled?: boolean }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#EF4444' : 'none'}>
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke={filled ? '#EF4444' : '#4B5563'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShoppingCartAddIcon = () => (
  <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="21" r="1.5" fill="#FFFFFF" />
    <Circle cx="20" cy="21" r="1.5" fill="#FFFFFF" />
    <Path
      d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Categories Data ───────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', title: 'All', emoji: '🫒' },
  { id: 'cooking', title: 'Cooking Oil', emoji: '🌻' },
  { id: 'wood', title: 'Wood Pressed', emoji: '🏺' },
  { id: 'edible', title: 'Edible Oils', emoji: '🥥' },
  { id: 'organic', title: 'Organic', emoji: '🍃' },
  { id: 'ghee', title: 'Ghee', emoji: '🧈' },
];

interface SearchResultsScreenProps {
  onNavigateToStore?: (id: string) => void;
  onNavigateToProduct?: (id: string) => void;
  onBack?: () => void;
  onNavigateToCart?: () => void;
}

const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  onNavigateToStore,
  onNavigateToProduct,
  onBack,
  onNavigateToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Products' | 'Stores'>('Products');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistMap, setWishlistMap] = useState<Record<string, boolean>>({});
  const [visibleProductCount, setVisibleProductCount] = useState(40);
  const [shopPage, setShopPage] = useState(1);
  const [hasMoreShops, setHasMoreShops] = useState(true);
  const [loadingMoreShops, setLoadingMoreShops] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setShopPage(1);
      const [shopsRes, productsRes] = await Promise.all([
        getPublicShops(1, 15),
        getPublicProducts(),
      ]);

      if (shopsRes.success && Array.isArray(shopsRes.shops)) {
        setStores(shopsRes.shops);
        setHasMoreShops(shopsRes.hasMore ?? (shopsRes.shops.length === 15));
      }
      if (productsRes.success && productsRes.products) setProducts(productsRes.products);
    } catch (error) {
      console.error('Error fetching search data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreShops = async () => {
    if (loadingMoreShops || !hasMoreShops || loading) return;
    try {
      setLoadingMoreShops(true);
      const nextPage = shopPage + 1;
      const res = await getPublicShops(nextPage, 15);
      if (res.success && Array.isArray(res.shops) && res.shops.length > 0) {
        setStores((prev) => {
          const existingIds = new Set(prev.map((s) => (s.id || s._id || '').toString()));
          const newShops = res.shops.filter(
            (s: any) => !existingIds.has((s.id || s._id || '').toString())
          );
          return [...prev, ...newShops];
        });
        setShopPage(nextPage);
        setHasMoreShops(res.hasMore ?? (res.shops.length === 15));
      } else {
        setHasMoreShops(false);
      }
    } catch (err) {
      console.error('Error loading more shops:', err);
    } finally {
      setLoadingMoreShops(false);
    }
  };

  const handleToggleWishlist = async (item: any) => {
    const id = item.id || item._id;
    const isLiked = !wishlistMap[id];
    setWishlistMap((prev) => ({ ...prev, [id]: isLiked }));

    if (isLiked) {
      await addToWishlistAPI({
        id,
        name: item.name,
        brand: item.brandName || item.brand,
        variant: item.size || '1L',
        price: item.price || 299,
        image: item.image,
      });
    } else {
      await removeFromWishlistAPI(id);
    }
  };

  const handleAddToCart = async (item: any) => {
    const res = await addToCartAPI({
      id: item.id || item._id,
      name: item.name,
      brand: item.brandName || item.brand || 'HealthOil',
      variant: item.size || item.volume || '1 Litre',
      price: item.price,
      qty: 1,
      image: item.image,
    });

    if (res.success) {
      Alert.alert('Added to Cart 🛒', `${item.name} has been added to your cart.`);
    } else {
      Alert.alert('Notice', res.message || 'Item added to cart.');
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 400;
    if (isCloseToBottom) {
      if (activeTab === 'Stores') {
        loadMoreShops();
      } else if (visibleProductCount < filteredProducts.length) {
        setVisibleProductCount((prev) => prev + 16);
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.brandName?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.storeName?.toLowerCase().includes(q);
    return matchesSearch;
  });

  const filteredStores = stores.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || s.name?.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q);
    return matchesSearch;
  });

  const displayedProducts = filteredProducts.slice(0, visibleProductCount);

  const renderProduct = ({ item, index }: { item: any; index: number }) => {
    const id = (item.id || item._id || index).toString();
    const isLiked = !!wishlistMap[id];
    const originalPrice = item.mrp || (item.price ? Math.round(item.price * 1.3) : 499);
    const savings = originalPrice > item.price ? Math.round(originalPrice - item.price) : 0;
    const isBestseller = index === 3;
    const discountText = isBestseller ? 'Bestseller' : index % 2 === 0 ? '20% OFF' : '15% OFF';
    const isColdPressed = index % 2 === 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => onNavigateToProduct && onNavigateToProduct(item.id || item._id)}
        activeOpacity={0.9}
      >
        {/* Top Image Box */}
        <View style={styles.cardImageContainer}>
          <Image
            source={item.image ? { uri: item.image } : require('../assets/sunflower_oil_bottle.jpg')}
            style={styles.productImage}
          />

          {/* Discount / Bestseller Badge */}
          <View
            style={[
              styles.discountBadge,
              isBestseller
                ? { backgroundColor: '#166534' }
                : { backgroundColor: '#EF4444' },
            ]}
          >
            <Text style={styles.discountBadgeText}>{discountText}</Text>
          </View>

          {/* Floating Heart Button */}
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => handleToggleWishlist(item)}
            activeOpacity={0.7}
          >
            <HeartCardIcon filled={isLiked} />
          </TouchableOpacity>
        </View>

        {/* Product Details */}
        <View style={styles.cardDetails}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productBrand} numberOfLines={1}>
            {item.brandName || item.brand || item.storeName || 'Parashoot'}
          </Text>

          {/* Attribute Badges Row */}
          <View style={styles.tagRow}>
            <View style={styles.volumeTag}>
              <Text style={styles.dropEmoji}>💧</Text>
              <Text style={styles.volumeTagText}>{item.size || item.volume || '1 Litre'}</Text>
            </View>
            <View style={styles.typeTag}>
              <Text style={styles.leafEmoji}>🌿</Text>
              <Text style={styles.typeTagText}>
                {isColdPressed ? 'Cold Pressed' : '100% Natural'}
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Text style={styles.starText}>⭐</Text>
            <Text style={styles.ratingValue}>{item.rating || '4.5'}</Text>
            <Text style={styles.reviewsCount}>({item.reviews || '1k+'})</Text>
          </View>

          {/* Price & Action Row */}
          <View style={styles.cardBottomRow}>
            <View style={styles.priceColumn}>
              <View style={styles.priceNumbersRow}>
                <Text style={styles.finalPrice}>₹{item.price || 299}</Text>
                {originalPrice > item.price && (
                  <Text style={styles.mrpStrike}>₹{originalPrice}</Text>
                )}
              </View>
              {savings > 0 && (
                <View style={styles.saveTag}>
                  <Text style={styles.saveTagText}>Save ₹{savings}</Text>
                </View>
              )}
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              style={styles.addToCartBtn}
              activeOpacity={0.85}
              onPress={() => handleAddToCart(item)}
            >
              <ShoppingCartAddIcon />
              <Text style={styles.addToCartBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderStore = ({ item }: { item: any }) => {
    const storeImageUri = item.banner || item.image || item.logo || item.storeProfile?.banner || item.storeProfile?.logo;
    return (
      <TouchableOpacity
        style={styles.storeCard}
        onPress={() => onNavigateToStore && onNavigateToStore(item.id || item._id)}
        activeOpacity={0.85}
      >
        <Image
          source={storeImageUri ? { uri: storeImageUri } : require('../assets/image copy 2.png')}
          style={styles.storeImage}
        />
      <View style={styles.storeDetails}>
        <View style={styles.storeTitleRow}>
          <Text style={styles.storeTitleText} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.storeHeartOutline}>♡</Text>
        </View>

        <View style={styles.storeRatingRow}>
          <View style={styles.storeRatingPill}>
            <Text style={styles.storeRatingNumber}>{item.rating || '4.5'} ⭐</Text>
          </View>
          <Text style={styles.storeReviewCount}>({item.reviews || '100+'} reviews)</Text>
        </View>

        <Text style={styles.storeAddressText} numberOfLines={1}>
          {item.address || 'Local Market, Area'}
        </Text>

        <View style={styles.storeBottomMeta}>
          <Text style={styles.storeMetaTag}>📍 {item.distance ? `${item.distance} km` : '1.5 km'}</Text>
          <TouchableOpacity
            style={styles.viewStoreButton}
            onPress={() => onNavigateToStore && onNavigateToStore(item.id || item._id)}
          >
            <Text style={styles.viewStoreButtonText}>View Store</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* @ts-ignore: Android props */}
      <StatusBar barStyle="dark-content" backgroundColor="#E2F5E9" />

      {/* Top Nature Themed Header Banner */}
      <View style={styles.headerBanner}>
        {/* Background Gradient */}
        <Svg
          height="125"
          width={width}
          style={StyleSheet.absoluteFill}
          viewBox={`0 0 ${width} 125`}
        >
          <Defs>
            <LinearGradient id="natureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#DCF2E4" />
              <Stop offset="50%" stopColor="#EBF8F0" />
              <Stop offset="100%" stopColor="#F9FAF7" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={width} height="125" fill="url(#natureGrad)" />
          <Circle cx={width - 10} cy="10" r="70" fill="#BDE7CB" opacity="0.3" />
          <Circle cx={width - 50} cy="50" r="45" fill="#CCEED8" opacity="0.25" />
        </Svg>

        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity
              style={styles.backCircleBtn}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerTitleCol}>
              <Text style={styles.mainTitle}>Search</Text>
              <Text style={styles.mainSubtitle}>Find your favorite oils, brands or stores</Text>
            </View>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchIconLeft}>
              <SearchMagnifierIcon />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search oils, brands or stores..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={styles.micButton}
              onPress={() => Alert.alert('Voice Search', 'Listening...')}
            >
              <MicIcon />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Main Segmented Toggle Switch: All | Products | Stores */}
        <View style={styles.segmentedToggle}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'All' && styles.segmentBtnActive]}
            onPress={() => {
              Keyboard.dismiss();
              setActiveTab('All');
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.segmentText, activeTab === 'All' && styles.segmentTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'Products' && styles.segmentBtnActive]}
            onPress={() => {
              Keyboard.dismiss();
              setActiveTab('Products');
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BoxProductIcon color={activeTab === 'Products' ? '#FFFFFF' : '#4B5563'} />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'Products' && styles.segmentTextActive,
                { marginLeft: 6 },
              ]}
            >
              Products
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'Stores' && styles.segmentBtnActive]}
            onPress={() => {
              Keyboard.dismiss();
              setActiveTab('Stores');
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <StoreBuildingIcon color={activeTab === 'Stores' ? '#FFFFFF' : '#4B5563'} />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'Stores' && styles.segmentTextActive,
                { marginLeft: 6 },
              ]}
            >
              Stores
            </Text>
          </TouchableOpacity>
        </View>


        {/* Filter Pills Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.filterPillsRow}
        >
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => Alert.alert('Filter', 'Sort by Popularity')}
          >
            <Text style={styles.filterPillIcon}>🌿</Text>
            <Text style={styles.filterPillText}>Popular</Text>
            <Text style={styles.chevronDown}>⌄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => Alert.alert('Filter', 'Filter by Price')}
          >
            <Text style={styles.filterPillText}>₹ Price</Text>
            <Text style={styles.chevronDown}>⌄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => Alert.alert('Filter', 'Filter by Rating')}
          >
            <Text style={styles.filterPillIcon}>⭐</Text>
            <Text style={styles.filterPillText}>Rating</Text>
            <Text style={styles.chevronDown}>⌄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => Alert.alert('Filters', 'Filter options')}
          >
            <SlidersFilterIcon />
            <Text style={[styles.filterPillText, { marginLeft: 6 }]}>Filters</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Content Section */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#14532D" />
            <Text style={{ marginTop: 12, color: '#64748B' }}>Loading products...</Text>
          </View>
        ) : activeTab === 'Stores' ? (
          <View style={{ paddingHorizontal: 16 }}>
            {filteredStores.length === 0 ? (
              <Text style={styles.emptyText}>No stores found.</Text>
            ) : (
              filteredStores.map((item, idx) => (
                <View key={item.id ? `store-${item.id}-${idx}` : `store-idx-${idx}`}>
                  {renderStore({ item })}
                </View>
              ))
            )}
            {loadingMoreShops && (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#14532D" />
                <Text style={{ marginTop: 6, fontSize: 12, color: '#64748B' }}>Loading more stores...</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {displayedProducts.length === 0 ? (
              <Text style={styles.emptyText}>No products found.</Text>
            ) : (
              displayedProducts.map((item, index) => (
                <View
                  key={item.id || item._id ? `prod-${item.id || item._id}-${index}` : `prod-idx-${index}`}
                  style={{ width: cardWidth }}
                >
                  {renderProduct({ item, index })}
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#DCF2E4',
  },
  headerBanner: {
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: '#DCF2E4',
  },
  headerContent: {
    zIndex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  headerTitleCol: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0D3822',
    letterSpacing: -0.3,
  },
  mainSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIconLeft: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  micButton: {
    padding: 4,
  },
  mainScroll: {
    flex: 1,
    backgroundColor: '#F9FAF7',
  },
  mainScrollContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  segmentedToggle: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F0',
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  segmentBtnActive: {
    backgroundColor: '#14532D',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  categoriesRow: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  categoryCircleItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 64,
  },
  categoryCircleBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F1F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCircleBadgeActive: {
    borderColor: '#14532D',
    backgroundColor: '#FFFFFF',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  categoryTitleActive: {
    color: '#14532D',
    fontWeight: '800',
  },
  filterPillsRow: {
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  filterPillIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  chevronDown: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
    marginTop: -2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImageContainer: {
    width: '100%',
    height: 155,
    backgroundColor: '#F8FAF9',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDetails: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 3,
    minHeight: 36,
  },
  productBrand: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
    gap: 4,
  },
  volumeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  dropEmoji: {
    fontSize: 9,
    marginRight: 2,
  },
  volumeTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  leafEmoji: {
    fontSize: 9,
    marginRight: 2,
  },
  typeTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#047857',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starText: {
    fontSize: 11,
    marginRight: 3,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewsCount: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: 3,
    fontWeight: '500',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  priceColumn: {
    flex: 1,
  },
  priceNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginRight: 4,
  },
  mrpStrike: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  saveTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  saveTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14532D',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 5,
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  storeImage: {
    width: 110,
    height: 110,
    resizeMode: 'cover',
  },
  storeDetails: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  storeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  storeHeartOutline: {
    fontSize: 16,
    color: '#64748B',
  },
  storeRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeRatingPill: {
    backgroundColor: '#14532D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  storeRatingNumber: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  storeReviewCount: {
    fontSize: 10,
    color: '#64748B',
  },
  storeAddressText: {
    fontSize: 11,
    color: '#64748B',
  },
  storeBottomMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeMetaTag: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '600',
  },
  viewStoreButton: {
    backgroundColor: '#14532D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  viewStoreButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  loadingContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748B',
    fontSize: 14,
  },
});

export default SearchResultsScreen;
