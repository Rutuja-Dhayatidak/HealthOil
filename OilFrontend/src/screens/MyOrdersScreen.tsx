import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyOrders } from '../services/orderService';

interface MyOrdersScreenProps {
  onTrackOrder?: (orderId: string) => void;
  onNavigateToLogin?: () => void;
  onShopNow?: () => void;
}

const MyOrdersScreen = ({
  onTrackOrder,
  onNavigateToLogin,
  onShopNow,
}: MyOrdersScreenProps) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Ongoing' | 'Completed' | 'Cancelled'>('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const fetchOrders = useCallback(async (isPullRefresh = false) => {
    try {
      if (isPullRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      setIsAuthenticated(true);

      const res = await getMyOrders();
      let fetchedOrders: any[] = [];
      if (res && res.success && Array.isArray(res.orders)) {
        fetchedOrders = res.orders;
      } else if (Array.isArray(res?.data)) {
        fetchedOrders = res.data;
      } else if (Array.isArray(res)) {
        fetchedOrders = res;
      }

      // Sort by date descending
      fetchedOrders.sort(
        (a: any, b: any) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Error fetching my orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getOrderType = (status?: string): 'Completed' | 'Cancelled' | 'Ongoing' => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'delivered' || s === 'completed') return 'Completed';
    if (s === 'cancelled' || s === 'declined' || s === 'returned') return 'Cancelled';
    return 'Ongoing';
  };

  const getStatusBadgeStyle = (status?: string) => {
    const type = getOrderType(status);
    if (type === 'Completed') {
      return { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' };
    }
    if (type === 'Cancelled') {
      return { bg: '#FFEBEE', text: '#C62828', border: '#FFCDD2' };
    }
    return { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' };
  };

  const filteredOrders =
    activeTab === 'All'
      ? orders
      : orders.filter((order) => getOrderType(order.status) === activeTab);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* @ts-ignore: Android props */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Track and view all your purchase history</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['All', 'Ongoing', 'Completed', 'Cancelled'] as const).map((tab) => {
          const count =
            tab === 'All'
              ? orders.length
              : orders.filter((o) => getOrderType(o.status) === tab).length;

          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab} {orders.length > 0 ? `(${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders(true)}
            colors={['#14532D']}
            tintColor="#14532D"
          />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#14532D" />
            <Text style={styles.loadingText}>Fetching your orders...</Text>
          </View>
        ) : !isAuthenticated ? (
          <View style={styles.centerContainer}>
            <Text style={styles.authTitle}>Please Login</Text>
            <Text style={styles.authSubtitle}>
              You need to be logged in to view and track your orders.
            </Text>
            {onNavigateToLogin && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onNavigateToLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Login / Register</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>
              No {activeTab === 'All' ? '' : activeTab.toLowerCase()} orders found
            </Text>
            <Text style={styles.emptySubtitle}>
              You have not placed any {activeTab === 'All' ? '' : activeTab.toLowerCase()} orders yet.
            </Text>
            {onShopNow && (
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 16 }]}
                onPress={onShopNow}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Explore Products</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredOrders.map((order, index) => {
            const statusType = getOrderType(order.status);
            const isCompleted = statusType === 'Completed';
            const isCancelled = statusType === 'Cancelled';
            const badgeColors = getStatusBadgeStyle(order.status);

            const orderDateStr = order.createdAt;
            const orderFormattedDate = orderDateStr
              ? new Date(orderDateStr).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            const items: any[] = Array.isArray(order.items) ? order.items : [];
            const firstItem = items[0] || {};
            const storeName =
              order.vendor?.business?.storeName ||
              order.vendor?.fullName ||
              order.storeName ||
              'HealthOil Vendor';

            const displayOrderId = order.orderId || order.id || order._id || `#HO-${index + 1}`;

            return (
              <View key={displayOrderId} style={styles.orderCard}>
                {/* Order Header */}
                <View style={styles.orderHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderIdText}>Order ID: {displayOrderId}</Text>
                    {orderFormattedDate ? (
                      <Text style={styles.orderDateText}>{orderFormattedDate}</Text>
                    ) : null}
                  </View>

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: badgeColors.bg,
                        borderColor: badgeColors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: badgeColors.text }]}>
                      {order.status || 'Placed'}
                    </Text>
                  </View>
                </View>

                {/* Vendor / Store Name */}
                <View style={styles.vendorRow}>
                  <Text style={styles.vendorLabel}>🏪 Sold by: </Text>
                  <Text style={styles.vendorNameText} numberOfLines={1}>
                    {storeName}
                  </Text>
                </View>

                {/* Items Section */}
                <View style={styles.itemsDivider} />

                {items.length > 0 ? (
                  items.map((it: any, itIdx: number) => {
                    const itemName = it.productName || it.name || 'Product';
                    const itemImg = it.image;
                    const itemQty = it.qty || it.quantity || 1;
                    const itemPrice = it.price || 0;

                    return (
                      <View key={itIdx} style={styles.itemRow}>
                        {itemImg ? (
                          <Image
                            source={{ uri: itemImg }}
                            style={styles.itemImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.itemImagePlaceholder}>
                            <Text style={{ fontSize: 18 }}>🫒</Text>
                          </View>
                        )}
                        <View style={styles.itemDetailsCol}>
                          <Text style={styles.itemNameText} numberOfLines={2}>
                            {itemName}
                          </Text>
                          <Text style={styles.itemQtyText}>
                            Qty: {itemQty} × ₹{itemPrice}
                          </Text>
                        </View>
                        <Text style={styles.itemTotalText}>₹{itemQty * itemPrice}</Text>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.itemRow}>
                    <View style={styles.itemImagePlaceholder}>
                      <Text style={{ fontSize: 18 }}>🫒</Text>
                    </View>
                    <View style={styles.itemDetailsCol}>
                      <Text style={styles.itemNameText}>
                        {firstItem.productName || 'Order Items'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Order Summary & Footer */}
                <View style={styles.cardFooterRow}>
                  <View>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalPrice}>₹{order.totalAmount || 0}</Text>
                  </View>

                  {!isCancelled && (
                    <TouchableOpacity
                      style={[
                        styles.trackButton,
                        isCompleted ? styles.completedButton : styles.ongoingTrackButton,
                      ]}
                      onPress={() => {
                        if (onTrackOrder) {
                          onTrackOrder(displayOrderId);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.trackButtonText,
                          isCompleted
                            ? styles.completedButtonText
                            : styles.ongoingTrackButtonText,
                        ]}
                      >
                        {isCompleted ? 'View Details' : 'Track Order 🚚'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#14532D',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#14532D',
    fontWeight: '800',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#14532D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderDateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  vendorLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  vendorNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#14532D',
    flex: 1,
  },
  itemsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginRight: 10,
  },
  itemImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemDetailsCol: {
    flex: 1,
  },
  itemNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemQtyText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  itemTotalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  trackButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  trackButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ongoingTrackButton: {
    backgroundColor: '#14532D',
    borderColor: '#14532D',
  },
  ongoingTrackButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  completedButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  completedButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default MyOrdersScreen;
