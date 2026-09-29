import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getPublicRightSidebarNews } from '../services/shopService';
import { config } from '../config';

const MegaphoneIcon = ({ color = '#F59E0B', size = 26 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11.6 16.8L6.4 13.5H3.5C2.67 13.5 2 12.83 2 12V8.5C2 7.67 2.67 7 3.5 7H6.4L11.6 3.7C12.43 3.17 13.5 3.77 13.5 4.76V15.74C13.5 16.73 12.43 17.33 11.6 16.8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.5 8C17.5 9.2 17.5 11.8 16.5 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M19.5 5.5C21.5 7.5 21.5 13.5 19.5 15.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M6 13.5V18.5C6 19.33 6.67 20 7.5 20H8.5C9.33 20 10 19.33 10 18.5V16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const ShoppingBagIcon = ({ color = '#FFFFFF', size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M3 6H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path
      d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export interface BackendNewsItem {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  badgeText?: string;
  image: string;
  benefits?: string[];
  linkType?: string;
  productId?: any;
  blogId?: string;
  customUrl?: string;
}

interface LatestNewsWidgetProps {
  onShopNow?: () => void;
}

const LatestNewsWidget: React.FC<LatestNewsWidgetProps> = ({ onShopNow }) => {
  const [newsList, setNewsList] = useState<BackendNewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedNews, setSelectedNews] = useState<BackendNewsItem | null>(null);

  // Animation progress value (0 = Collapsed Button, 1 = Expanded Panel)
  const animProgress = useRef(new Animated.Value(0)).current;

  // Wave Pulse Animation values behind floating button
  const wave1Scale = useRef(new Animated.Value(1)).current;
  const wave1Opacity = useRef(new Animated.Value(0.7)).current;
  const wave2Scale = useRef(new Animated.Value(1)).current;
  const wave2Opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const createWaveAnimation = (scaleAnim: Animated.Value, opacityAnim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.55,
              duration: 2200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 2200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.7,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    const anim1 = createWaveAnimation(wave1Scale, wave1Opacity, 0);
    const anim2 = createWaveAnimation(wave2Scale, wave2Opacity, 1100);

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, []);

  // Fetch active news directly from Backend API
  useEffect(() => {
    fetchActiveNews();
  }, []);

  const fetchActiveNews = async () => {
    try {
      setLoading(true);
      const res = await getPublicRightSidebarNews();
      if (res && res.success && Array.isArray(res.data)) {
        setNewsList(res.data);
      } else {
        setNewsList([]);
      }
    } catch (err) {
      console.error('Error fetching dynamic right sidebar news:', err);
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  const openPanel = () => {
    setIsExpanded(true);
    Animated.spring(animProgress, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const closePanel = (callback?: () => void) => {
    setIsExpanded(false);
    Animated.timing(animProgress, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      if (callback) callback();
    });
  };

  const getImageUri = (imgUrl: string) => {
    if (!imgUrl) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80';
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return imgUrl;
    }
    // Local server path relative URL
    return `${config.BASE_URL}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
  };

  // Interpolations for Collapsed Button
  const collapsedOpacity = animProgress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0, 0],
  });

  const collapsedScale = animProgress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0.5, 0.5],
  });

  // Interpolations for Expanded Panel
  const expandedOpacity = animProgress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.6, 1],
  });

  const expandedScale = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const expandedTranslateY = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <>
      {/* Floating Wrapper positioned bottom right */}
      <View style={styles.floatingWrapper} pointerEvents="box-none">
        
        {/* 1. COLLAPSED TRIGGER BUTTON WITH ANIMATED WAVE PULSE RINGS */}
        <Animated.View
          style={[
            styles.collapsedBtnWrapper,
            {
              opacity: collapsedOpacity,
              transform: [{ scale: collapsedScale }],
            },
          ]}
          pointerEvents={isExpanded ? 'none' : 'auto'}
        >
          {/* Wave Ripple Ring 1 */}
          <Animated.View
            style={[
              styles.waveRing1,
              {
                transform: [{ scale: wave1Scale }],
                opacity: wave1Opacity,
              },
            ]}
            pointerEvents="none"
          />
          {/* Wave Ripple Ring 2 */}
          <Animated.View
            style={[
              styles.waveRing2,
              {
                transform: [{ scale: wave2Scale }],
                opacity: wave2Opacity,
              },
            ]}
            pointerEvents="none"
          />

          <TouchableOpacity
            style={styles.collapsedBtn}
            activeOpacity={0.85}
            onPress={openPanel}
          >
            <MegaphoneIcon color="#FBBF24" size={24} />
            <Text style={styles.collapsedText}>LATEST</Text>
            <Text style={styles.collapsedText}>NEWS</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 2. EXPANDED VERTICAL PILL PANEL */}
        <Animated.View
          style={[
            styles.expandedPillContainer,
            {
              opacity: expandedOpacity,
              transform: [
                { translateY: expandedTranslateY },
                { scale: expandedScale },
              ],
            },
          ]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
        >
          {/* Top Close Button (x) overlapping top right */}
          <TouchableOpacity
            style={styles.closeBadgeBtn}
            onPress={() => closePanel()}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeBadgeText}>×</Text>
          </TouchableOpacity>

          {/* Top Header Circle */}
          <TouchableOpacity
            style={styles.headerCircle}
            activeOpacity={0.9}
            onPress={() => closePanel()}
          >
            <MegaphoneIcon color="#FBBF24" size={22} />
            <Text style={styles.headerCircleTitle}>LATEST</Text>
            <Text style={styles.headerCircleTitle}>NEWS</Text>
          </TouchableOpacity>

          {/* Scrollable Dynamic News Items */}
          <ScrollView
            style={styles.newsListScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.newsListContent}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#064E3B" style={{ marginVertical: 20 }} />
            ) : newsList.length === 0 ? (
              <Text style={styles.emptyNewsText}>No news available</Text>
            ) : (
              newsList.map((item) => {
                const itemId = item._id || item.id || Math.random().toString();
                const badge = item.badgeText || item.title || 'UPDATE';
                const imageUri = getImageUri(item.image);

                return (
                  <TouchableOpacity
                    key={itemId}
                    style={styles.newsItemBox}
                    activeOpacity={0.85}
                    onPress={() => setSelectedNews(item)}
                  >
                    <View style={styles.badgePill}>
                      <Text style={styles.badgePillText} numberOfLines={1}>{badge.toUpperCase()}</Text>
                    </View>
                    <Image source={{ uri: imageUri }} style={styles.newsItemImage} resizeMode="cover" />
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Bottom Action Button: SHOP NOW */}
          <TouchableOpacity
            style={styles.shopNowCircleBtn}
            activeOpacity={0.85}
            onPress={() => {
              closePanel(() => {
                if (onShopNow) onShopNow();
              });
            }}
          >
            <ShoppingBagIcon color="#FFFFFF" size={20} />
            <Text style={styles.shopNowText}>SHOP</Text>
            <Text style={styles.shopNowText}>NOW</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Dynamic News Detail Modal */}
      {selectedNews && (
        <Modal
          visible={!!selectedNews}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedNews(null)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedNews(null)}
          >
            <View style={styles.modalCard} pointerEvents="auto">
              <View style={styles.modalTagBadge}>
                <Text style={styles.modalTagText}>
                  {(selectedNews.badgeText || selectedNews.title || 'LATEST NEWS').toUpperCase()}
                </Text>
              </View>

              <Image
                source={{ uri: getImageUri(selectedNews.image) }}
                style={styles.modalImage}
                resizeMode="cover"
              />

              <Text style={styles.modalTitle}>{selectedNews.title}</Text>
              {selectedNews.description ? (
                <Text style={styles.modalDescription}>{selectedNews.description}</Text>
              ) : null}

              {/* Benefits list if available */}
              {Array.isArray(selectedNews.benefits) && selectedNews.benefits.length > 0 && (
                <View style={styles.benefitsContainer}>
                  {selectedNews.benefits.map((benefit, idx) => (
                    <View key={idx} style={styles.benefitRow}>
                      <Text style={styles.benefitBullet}>✓</Text>
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedNews(null)}
                >
                  <Text style={styles.modalCloseBtnText}>Close</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalShopBtn}
                  onPress={() => {
                    setSelectedNews(null);
                    closePanel(() => {
                      if (onShopNow) onShopNow();
                    });
                  }}
                >
                  <Text style={styles.modalShopBtnText}>Explore Now →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    right: 14,
    bottom: 110,
    zIndex: 9999,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },

  /* Collapsed Trigger Wrapper */
  collapsedBtnWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveRing1: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.7)',
    zIndex: -1,
  },
  waveRing2: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(6, 78, 59, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.8)',
    zIndex: -1,
  },

  /* Collapsed Floating Button */
  collapsedBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#064E3B', // Deep organic green
    borderWidth: 2.5,
    borderColor: '#10B981', // Accent green ring
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  collapsedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 11,
    letterSpacing: 0.2,
  },

  /* Expanded Pill Panel */
  expandedPillContainer: {
    width: 105,
    maxHeight: 460,
    backgroundColor: '#E5E7EB', // Light grey container
    borderRadius: 42,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 20,
  },

  /* Close Badge (x) top right */
  closeBadgeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  closeBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: -2,
  },

  /* Header Circle in Expanded View */
  headerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#064E3B',
    borderWidth: 2,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerCircleTitle: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 10.5,
  },

  /* Scrollable Dynamic News Items */
  newsListScroll: {
    width: '100%',
    maxHeight: 290,
  },
  newsListContent: {
    alignItems: 'center',
    paddingVertical: 4,
  },

  emptyNewsText: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginVertical: 15,
  },

  /* Individual News Box */
  newsItemBox: {
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  badgePill: {
    backgroundColor: '#F59E0B', // Amber/Yellow tag
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 3,
    maxWidth: 90,
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  badgePillText: {
    color: '#111827',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  newsItemImage: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#F3F4F6',
  },

  /* Bottom Shop Now Button */
  shopNowCircleBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10B981', // Bright action green
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 10.5,
  },

  /* Modal Details */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTagBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalTagText: {
    color: '#D97706',
    fontWeight: '800',
    fontSize: 12,
  },
  modalImage: {
    width: '100%',
    height: 170,
    borderRadius: 16,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitBullet: {
    color: '#10B981',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 14,
  },
  benefitText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalCloseBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    marginRight: 8,
  },
  modalCloseBtnText: {
    color: '#4B5563',
    fontWeight: '700',
  },
  modalShopBtn: {
    flex: 1.4,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalShopBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default LatestNewsWidget;
