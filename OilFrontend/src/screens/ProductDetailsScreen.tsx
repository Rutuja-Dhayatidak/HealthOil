import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPublicProductDetails } from '../services/shopService';
import { addToCartAPI } from '../services/cartService';
import { addToWishlistAPI, removeFromWishlistAPI, getWishlistAPI } from '../services/wishlistService';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ productId, onNavigateToCart, onBack }: { productId?: string | null, onNavigateToCart?: () => void, onBack?: () => void }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchWishlistStatus();
    }
  }, [productId]);

  const fetchWishlistStatus = async () => {
    const res = await getWishlistAPI();
    if (res.success && res.items) {
      const found = res.items.some((item: any) => item.id === productId);
      setIsFavorite(found);
    }
  };

  const fetchProductDetails = async () => {
    setLoading(true);
    const res = await getPublicProductDetails(productId!);
    if (res.success) {
      setProduct(res.product);
      if (res.product.variants && res.product.variants.length > 0) {
        setSelectedVariant(res.product.variants[0]);
      } else {
        setSelectedVariant({ id: 'default', size: res.product.size, price: res.product.price, mrp: res.product.mrp, inStock: res.product.inStock });
      }
    }
    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    
    setIsAddingToCart(true);
    const res = await addToCartAPI({
      id: product.id || product._id,
      name: product.basicDetails?.name || product.name,
      brand: product.basicDetails?.brandName || product.brandName,
      variant: selectedVariant.size,
      price: selectedVariant.price,
      qty: quantity,
      image: product.images?.mainImage?.url || (typeof product.image === 'string' ? product.image : '')
    });
    setIsAddingToCart(false);
    
    if (res.success) {
      Alert.alert('Success', 'Item added to cart!');
    } else {
      Alert.alert('Error', res.message || 'Could not add item to cart. Please make sure you are logged in.');
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    setIsTogglingFavorite(true);
    if (isFavorite) {
      const res = await removeFromWishlistAPI(product.id || product._id);
      if (res.success) {
        setIsFavorite(false);
      } else {
        Alert.alert('Error', res.message || 'Could not remove from wishlist');
      }
    } else {
      const res = await addToWishlistAPI({
        id: product.id || product._id,
        name: product.basicDetails?.name || product.name,
        brand: product.basicDetails?.brandName || product.brandName,
        price: selectedVariant?.price || product.price,
        image: product.images?.mainImage?.url || (typeof product.image === 'string' ? product.image : '')
      });
      if (res.success) {
        setIsFavorite(true);
      } else {
        Alert.alert('Error', res.message || 'Could not add to wishlist. Please make sure you are logged in.');
      }
    }
    setIsTogglingFavorite(false);
  };

  const handleBuyNow = async () => {
    if (!product || !selectedVariant) return;
    
    setIsAddingToCart(true);
    const res = await addToCartAPI({
      id: product.id || product._id,
      name: product.basicDetails?.name || product.name,
      brand: product.basicDetails?.brandName || product.brandName,
      variant: selectedVariant.size,
      price: selectedVariant.price,
      qty: quantity,
      image: product.images?.mainImage?.url || (typeof product.image === 'string' ? product.image : '')
    });
    setIsAddingToCart(false);
    
    if (res.success) {
      if (onNavigateToCart) {
        onNavigateToCart();
      }
    } else {
      Alert.alert('Error', res.message || 'Could not process buy now. Please make sure you are logged in.');
    }
  };

  const increaseQty = () => setQuantity(q => q + 1);
  const decreaseQty = () => setQuantity(q => q > 1 ? q - 1 : 1);

  const galleryImages = product?.images?.gallery?.filter((img: any) => img.url).map((img: any) => img.url) || product?.gallery || [];
  const mainImage = product?.images?.mainImage?.url || (typeof product?.image === 'string' ? product.image : undefined);
  const isOrganic = product?.compliance?.isOrganic || product?.isOrganic;
  const highlights = product?.basicDetails?.highlights || product?.highlights || [];
  const description = product?.basicDetails?.description || product?.description;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={onBack}><Text style={styles.iconText}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={handleToggleFavorite} disabled={isTogglingFavorite}>
              {isTogglingFavorite ? (
                <ActivityIndicator size="small" color="#1A3616" />
              ) : (
                <Text style={[styles.iconText, isFavorite && { color: 'red' }]}>{isFavorite ? '♥' : '♡'}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartButton} onPress={onNavigateToCart}>
              <Text style={styles.iconText}>🛒</Text>
              <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>3</Text></View>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1A3616" style={{ marginTop: 100 }} />
        ) : !product ? (
          <Text style={{ textAlign: 'center', marginTop: 50 }}>Product not found.</Text>
        ) : (
          <>
            {/* Product Image Banner */}
        <View style={styles.imageBannerWrapper}>
          <Image source={require('../assets/image copy 2.png')} style={styles.bannerBackground} />
          
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const index = Math.round(x / (width - 32));
              if (index !== activeImage) setActiveImage(index);
            }}
            scrollEventThrottle={16}
          >
            {galleryImages.length > 0 ? galleryImages.map((img: string, idx: number) => (
              <Image key={idx} source={{ uri: img }} style={[styles.bannerImage, { width: width - 32 }]} resizeMode="contain" />
            )) : (
              <Image source={mainImage ? { uri: mainImage } : require('../assets/sunflower_oil_bottle.jpg')} style={[styles.bannerImage, { width: width - 32 }]} resizeMode="contain" />
            )}
          </ScrollView>
          
          {isOrganic && (
            <View style={styles.pureBadge}>
               <Text style={styles.pureBadgeIcon}>🌿</Text>
               <View>
                 <Text style={styles.pureBadgeTextBold}>100%</Text>
                 <Text style={styles.pureBadgeText}>ORGANIC</Text>
               </View>
            </View>
          )}
          
          <View style={styles.imageCountPill}>
            <Text style={styles.imageCountText}>{activeImage + 1} / {Math.max(galleryImages.length || 1, 1)}</Text>
          </View>
        </View>

        {/* Product Basic Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={{flex: 1}}>
              <Text style={styles.productTitle}>{product.basicDetails?.name || product.name}</Text>
              <Text style={styles.productSubInfo}>{product.basicDetails?.brandName || product.brandName}  •  {product.compliance?.extractionMethod || product.pressedType || 'Refined'}  •  {selectedVariant?.size || product.size}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.ratingNumber}>{product.vendor?.rating || 4.5}</Text>
              <Text style={styles.ratingReviews}>({product.vendor?.orders ? `${product.vendor.orders}+` : '100+'} orders)</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{selectedVariant?.price || product.price}</Text>
            {(selectedVariant?.mrp || product.mrp) > (selectedVariant?.price || product.price) && <Text style={styles.originalPrice}>₹{selectedVariant?.mrp || product.mrp}</Text>}
            <View style={styles.discountPill}>
              <Text style={styles.discountText}>
                {(selectedVariant?.mrp || product.mrp) > (selectedVariant?.price || product.price) ? `${Math.round((((selectedVariant?.mrp || product.mrp) - (selectedVariant?.price || product.price)) / (selectedVariant?.mrp || product.mrp)) * 100)}% OFF` : 'BEST PRICE'}
              </Text>
            </View>
          </View>
          
          <View style={{ marginBottom: 12 }}>
             <Text style={{ fontSize: 13, fontWeight: '700', color: (selectedVariant?.currentStock ?? selectedVariant?.inStock ?? product.inStock) ? '#2E7D32' : '#D32F2F' }}>
                {(selectedVariant?.currentStock ?? selectedVariant?.inStock ?? product.inStock) ? (typeof (selectedVariant?.currentStock ?? product.currentStock) === 'number' ? `Available: ${selectedVariant?.currentStock ?? product.currentStock} in stock` : 'Available in stock') : 'Currently Out of Stock'}
             </Text>
          </View>

          <Text style={styles.description}>
            {description}
          </Text>
        </View>

        {/* Select Size */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Size</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sizeScroll}>
            {(product.variants && product.variants.length > 0 ? product.variants : [selectedVariant]).map((variant: any) => {
              const isSelected = selectedVariant?.id === variant.id || selectedVariant?.size === variant.size;
              return (
              <TouchableOpacity key={variant.id || variant.size || Math.random().toString()} style={[styles.sizeBox, isSelected && styles.sizeBoxActive]} onPress={() => setSelectedVariant(variant)}>
                <View>
                  <Text style={[styles.sizeText, isSelected && styles.sizeTextActive]}>{variant.size}</Text>
                  <Text style={[styles.sizePriceText, isSelected && styles.sizePriceTextActive]}>₹{variant.price}</Text>
                </View>
                {isSelected && <View style={styles.checkBadge}><Text style={styles.checkBadgeText}>✓</Text></View>}
              </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quantity & Delivery Info */}
        <View style={styles.quantityDeliveryBox}>
          <View style={styles.quantityControl}>
            <Text style={styles.quantityLabel}>Quantity ({selectedVariant?.size || product.size})</Text>
            <View style={styles.qtyButtons}>
              <TouchableOpacity style={styles.qtyBtn} onPress={decreaseQty}><Text style={styles.qtyBtnText}>−</Text></TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={increaseQty}><Text style={styles.qtyBtnTextActive}>+</Text></TouchableOpacity>
            </View>
          </View>
          <View style={styles.deliveryInfo}>
            {(() => {
              const stock = selectedVariant?.currentStock ?? selectedVariant?.inStock ?? product.inStock;
              const hasStock = typeof stock === 'number' ? stock > 0 : stock !== false;
              return (
                <View style={[styles.inStockPill, !hasStock && { backgroundColor: '#FFEBEE' }]}>
                  <Text style={[styles.inStockText, !hasStock && { color: '#D32F2F' }]}>
                    {hasStock ? (typeof stock === 'number' ? `✓ ${stock} in stock` : '✓ In Stock') : '✗ Out of Stock'}
                  </Text>
                </View>
              );
            })()}
            <Text style={styles.deliveryEstimate}>🛵 Delivered by <Text style={{fontWeight:'700'}}>Fast Delivery</Text></Text>
            <Text style={styles.deliveryFree}>Standard delivery charges apply</Text>
          </View>
        </View>

        {/* Features Row */}
        {highlights.length > 0 && (
          <View style={styles.featuresRow}>
            {highlights.slice(0, 4).map((highlight: any, idx: number) => (
              <View key={idx} style={styles.featureItem}>
                <Text style={styles.featureIcon}>✨</Text>
                <Text style={styles.featureText}>{highlight.text || highlight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Product Details Specs */}
        <View style={styles.specsContainer}>
          <View style={styles.specsLeft}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.specRow}><Text style={styles.specDot}>•</Text><Text style={styles.specKey}>Brand</Text><Text style={styles.specVal}>: {product.basicDetails?.brandName || product.brandName || 'HealthOil'}</Text></View>
            <View style={styles.specRow}><Text style={styles.specDot}>•</Text><Text style={styles.specKey}>Type</Text><Text style={styles.specVal}>: {product.compliance?.oilType || product.pressedType || 'Wood Pressed Oil'}</Text></View>
            {product.compliance?.refiningType && <View style={styles.specRow}><Text style={styles.specDot}>•</Text><Text style={styles.specKey}>Refining</Text><Text style={styles.specVal}>: {product.compliance.refiningType}</Text></View>}
            <View style={styles.specRow}><Text style={styles.specDot}>•</Text><Text style={styles.specKey}>Size</Text><Text style={styles.specVal}>: {selectedVariant?.size || product.size}</Text></View>
            {product.compliance?.packagingType && <View style={styles.specRow}><Text style={styles.specDot}>•</Text><Text style={styles.specKey}>Packaging</Text><Text style={styles.specVal}>: {product.compliance.packagingType}</Text></View>}
            <View style={styles.specRow}><Text style={styles.specDot}>•</Text><Text style={styles.specKey}>Shelf Life</Text><Text style={styles.specVal}>: {product.compliance?.shelfLifeDays ? `${product.compliance.shelfLifeDays} Days` : '180 Days'} from Packaging</Text></View>
            <View style={styles.specRow}><Text style={styles.specDot}>•</Text><Text style={styles.specKey}>Extraction</Text><Text style={styles.specVal}>: {product.compliance?.extractionMethod || 'Traditional Cold Pressed'}</Text></View>
            {product.compliance?.fssaiLicenseNo && <View style={styles.specRow}><Text style={styles.specDot}>•</Text><Text style={styles.specKey}>FSSAI No</Text><Text style={styles.specVal}>: {product.compliance.fssaiLicenseNo}</Text></View>}
            {product.compliance?.hsnCode && <View style={styles.specRow}><Text style={styles.specDot}>•</Text><Text style={styles.specKey}>HSN Code</Text><Text style={styles.specVal}>: {product.compliance.hsnCode}</Text></View>}
          </View>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.specsImg} />
          ) : (
            <Image source={require('../assets/sunflower_oil_bottle.jpg')} style={styles.specsImg} />
          )}
        </View>

        {/* Nutrition Info */}
        {product.nutrition && (
          <View style={styles.nutritionContainer}>
            <Text style={styles.sectionTitle}>Nutrition Facts (per 100g)</Text>
            <View style={styles.nutritionGrid}>
              {product.nutrition.energy !== undefined && <View style={styles.nutritionItem}><Text style={styles.nutriLabel}>Energy</Text><Text style={styles.nutriValue}>{product.nutrition.energy} kcal</Text></View>}
              {product.nutrition.totalFat !== undefined && <View style={styles.nutritionItem}><Text style={styles.nutriLabel}>Total Fat</Text><Text style={styles.nutriValue}>{product.nutrition.totalFat} g</Text></View>}
              {product.nutrition.saturatedFat !== undefined && <View style={styles.nutritionItem}><Text style={styles.nutriLabel}>Sat. Fat</Text><Text style={styles.nutriValue}>{product.nutrition.saturatedFat} g</Text></View>}
              {product.nutrition.transFat !== undefined && <View style={styles.nutritionItem}><Text style={styles.nutriLabel}>Trans Fat</Text><Text style={styles.nutriValue}>{product.nutrition.transFat} g</Text></View>}
              {product.nutrition.mufa !== undefined && <View style={styles.nutritionItem}><Text style={styles.nutriLabel}>MUFA</Text><Text style={styles.nutriValue}>{product.nutrition.mufa} g</Text></View>}
              {product.nutrition.pufa !== undefined && <View style={styles.nutritionItem}><Text style={styles.nutriLabel}>PUFA</Text><Text style={styles.nutriValue}>{product.nutrition.pufa} g</Text></View>}
              {product.nutrition.cholesterol !== undefined && <View style={styles.nutritionItem}><Text style={styles.nutriLabel}>Cholesterol</Text><Text style={styles.nutriValue}>{product.nutrition.cholesterol} mg</Text></View>}
            </View>
          </View>
        )}



        {/* Similar Products Removed as it was static */}
          </>
        )}
      </ScrollView>

      {/* Fixed Bottom Bar outside ScrollView */}
      {!loading && product && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarLeft}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <Text style={styles.bottomPrice}>₹{selectedVariant?.price || product.price}</Text>
               {(selectedVariant?.mrp || product.mrp) > (selectedVariant?.price || product.price) && (
                 <View style={styles.discountPill}>
                   <Text style={styles.discountText}>{Math.round((((selectedVariant?.mrp || product.mrp) - (selectedVariant?.price || product.price)) / (selectedVariant?.mrp || product.mrp)) * 100)}% OFF</Text>
                 </View>
               )}
            </View>
            <Text style={styles.bottomSubtext}>{selectedVariant?.size || product.size}  •  View Price Details ⓘ</Text>
          </View>
          <View style={styles.bottomBarRight}>
            <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart} disabled={isAddingToCart}>
              {isAddingToCart ? (
                <ActivityIndicator color="#1A3616" size="small" />
              ) : (
                <Text style={styles.addToCartText}>🛒 Add to Cart</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow} disabled={isAddingToCart}>
              {isAddingToCart ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buyNowText}>⚡ Buy Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FCFBF8' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  iconButton: { padding: 8, backgroundColor: '#fff', borderRadius: 20, elevation: 1 },
  iconText: { fontSize: 20, color: '#1A3616' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A3616' },
  headerRight: { flexDirection: 'row', gap: 12 },
  cartButton: { position: 'relative', padding: 8, backgroundColor: '#fff', borderRadius: 20, elevation: 1 },
  cartBadge: { position: 'absolute', top: 0, right: -2, backgroundColor: '#1A3616', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  imageBannerWrapper: { margin: 16, height: 280, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F9F9F9', position: 'relative' },
  bannerBackground: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.3 },
  bannerImage: { width: '100%', height: '100%' },
  pureBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#FDFCF6', padding: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  pureBadgeIcon: { fontSize: 20, marginRight: 6 },
  pureBadgeTextBold: { fontSize: 11, fontWeight: '800', color: '#1A3616' },
  pureBadgeText: { fontSize: 10, color: '#1A3616' },
  imageCountPill: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  imageCountText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },

  infoSection: { paddingHorizontal: 16, marginBottom: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  productTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  productSubInfo: { fontSize: 12, color: '#6B7280' },
  ratingBox: { alignItems: 'flex-end' },
  starIcon: { fontSize: 12, color: '#F59E0B' },
  ratingNumber: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginVertical: 2 },
  ratingReviews: { fontSize: 10, color: '#6B7280' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  price: { fontSize: 28, fontWeight: '800', color: '#1A3616', marginRight: 10 },
  originalPrice: { fontSize: 16, color: '#9CA3AF', textDecorationLine: 'line-through', marginRight: 12 },
  discountPill: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  discountText: { fontSize: 11, fontWeight: '700', color: '#2E7D32' },
  description: { fontSize: 13, color: '#4B5563', lineHeight: 20 },

  sectionContainer: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },
  sizeScroll: { flexDirection: 'row' },
  sizeBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginRight: 12, backgroundColor: '#fff', position: 'relative' },
  sizeBoxActive: { borderColor: '#1A3616', backgroundColor: '#1A3616' },
  sizeIcon: { fontSize: 20, marginRight: 8, opacity: 0.6 },
  sizeIconActive: { fontSize: 20, marginRight: 8, color: '#fff' },
  sizeText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  sizeTextActive: { fontSize: 12, fontWeight: '700', color: '#fff' },
  sizePriceText: { fontSize: 11, color: '#111827', fontWeight: 'bold' },
  sizePriceTextActive: { fontSize: 11, color: '#fff', fontWeight: 'bold' },
  checkBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#fff', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1A3616' },
  checkBadgeText: { fontSize: 10, color: '#1A3616', fontWeight: 'bold' },

  quantityDeliveryBox: { marginHorizontal: 16, backgroundColor: '#FDFCF6', borderRadius: 16, padding: 16, flexDirection: 'row', marginBottom: 24, borderWidth: 1, borderColor: '#F0F0F0' },
  quantityControl: { flex: 1, borderRightWidth: 1, borderColor: '#E5E7EB', paddingRight: 16 },
  quantityLabel: { fontSize: 11, color: '#4B5563', marginBottom: 8 },
  qtyButtons: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 4, paddingVertical: 2 },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  qtyBtnText: { fontSize: 16, color: '#1A3616', fontWeight: 'bold' },
  qtyBtnTextActive: { fontSize: 16, color: '#2E7D32', fontWeight: 'bold' },
  qtyValue: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#111827' },
  deliveryInfo: { flex: 1.5, paddingLeft: 16 },
  inStockPill: { alignSelf: 'flex-start', backgroundColor: '#F4F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
  inStockText: { fontSize: 10, fontWeight: '700', color: '#1A3616' },
  deliveryEstimate: { fontSize: 11, color: '#4B5563', marginBottom: 4 },
  deliveryFree: { fontSize: 10, color: '#2E7D32' },

  featuresRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'center', flex: 1, backgroundColor: '#fff', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', marginRight: 8 },
  featureIcon: { fontSize: 18, marginRight: 6 },
  featureText: { fontSize: 9, color: '#111827', fontWeight: '600' },

  specsContainer: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#FDFCF6', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F0F0F0' },
  specsLeft: { flex: 1 },
  specRow: { flexDirection: 'row', marginBottom: 6 },
  specDot: { fontSize: 10, color: '#1A3616', marginRight: 6, marginTop: 2 },
  specKey: { fontSize: 11, color: '#4B5563', width: 60, fontWeight: '500' },
  specVal: { fontSize: 11, color: '#111827', flex: 1 },
  specsImg: { width: 100, height: 100, resizeMode: 'contain', alignSelf: 'center' },

  nutritionContainer: { paddingHorizontal: 16, marginBottom: 24 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#FDFCF6', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F0F0F0', justifyContent: 'space-between' },
  nutritionItem: { width: '31%', marginBottom: 8, alignItems: 'center', backgroundColor: '#fff', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  nutriLabel: { fontSize: 10, color: '#6B7280', marginBottom: 4, textAlign: 'center' },
  nutriValue: { fontSize: 12, fontWeight: '700', color: '#1A3616', textAlign: 'center' },



  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  viewAllText: { color: '#1A3616', fontSize: 12, fontWeight: '700' },
  productsScroll: { paddingLeft: 16, marginBottom: 24 },
  productCard: { width: 220, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginRight: 16, borderWidth: 1, borderColor: '#F0F0F0', flexDirection: 'row' },
  heartBtn: { position: 'absolute', top: 8, right: 8, zIndex: 1 },
  heartIcon: { fontSize: 18, color: '#999' },
  productImgContainer: { width: 70, alignItems: 'center', marginRight: 12 },
  productImg: { width: 60, height: 90, resizeMode: 'contain' },
  productCardInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 4 },
  productBrand: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  cardFooter: { marginTop: 4 },
  priceRowCard: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  priceCard: { fontSize: 14, fontWeight: '800', color: '#111827', marginRight: 6 },
  originalPriceCard: { fontSize: 10, color: '#9CA3AF', textDecorationLine: 'line-through' },
  discountPillCard: { backgroundColor: '#F4F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderTopWidth: 1, borderColor: '#E5E7EB', elevation: 10 },
  bottomBarLeft: { flex: 1 },
  bottomPrice: { fontSize: 24, fontWeight: '800', color: '#111827', marginRight: 8 },
  bottomSubtext: { fontSize: 10, color: '#6B7280', marginTop: 4 },
  bottomBarRight: { flexDirection: 'row', gap: 8 },
  addToCartBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1A3616', justifyContent: 'center' },
  addToCartText: { color: '#1A3616', fontSize: 13, fontWeight: '700' },
  buyNowBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: '#1A3616', justifyContent: 'center' },
  buyNowText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

export default ProductDetailsScreen;
