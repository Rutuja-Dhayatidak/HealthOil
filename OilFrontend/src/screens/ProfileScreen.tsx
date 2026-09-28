import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  PermissionsAndroid,
  Platform,
  StatusBar,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, deleteAccountAPI } from '../services/userService';
import Geolocation from '@react-native-community/geolocation';

const { width } = Dimensions.get('window');

// ── Clean SVG Icons ─────────────────────────────────────────────────────────

const BellIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21a2 2 0 0 1-3.46 0"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="19" cy="5" r="3.5" fill="#EF4444" />
  </Svg>
);

const EditIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
      stroke="#14532D"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const OrdersBagIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
      stroke="#166534"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="3" y1="6" x2="21" y2="6" stroke="#166534" strokeWidth="2" />
    <Path d="M16 10a4 4 0 0 1-8 0" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const WishlistHeartIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="#DC2626"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PinLocationIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
      stroke="#D97706"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="10" r="3" stroke="#D97706" strokeWidth="2" />
  </Svg>
);

const PointsRewardIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke="#7C3AED" strokeWidth="2" />
    <Path d="M12 6v6l4 2" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ChevronRightIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Polyline points="9 18 15 12 9 6" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserShieldIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LockKeyIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#16A34A" strokeWidth="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#16A34A" strokeWidth="2" />
  </Svg>
);

const SupportHelpIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke="#8B5CF6" strokeWidth="2" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="17" x2="12.01" y2="17" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const DocumentTermsIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#64748B" strokeWidth="2" />
    <Polyline points="14 2 14 8 20 8" stroke="#64748B" strokeWidth="2" />
    <Line x1="16" y1="13" x2="8" y2="13" stroke="#64748B" strokeWidth="2" />
    <Line x1="16" y1="17" x2="8" y2="17" stroke="#64748B" strokeWidth="2" />
  </Svg>
);

const LogoutIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      stroke="#DC2626"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline points="16 17 21 12 16 7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="21" y1="12" x2="9" y2="12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Polyline points="3 6 5 6 21 6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      stroke="#EF4444"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Profile Screen Component ──────────────────────────────────────────────

interface ProfileScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToWishlist?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToLogin,
  onNavigateToOrders,
  onNavigateToWishlist,
}) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Manual Add Address State
  const [isManualModalVisible, setIsManualModalVisible] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      const res = await getUserProfile();
      if (res.success && res.user) {
        setUserData(res.user);
        if (res.user.addresses && res.user.addresses.length > 0) {
          setSavedAddresses(res.user.addresses);
        } else {
          setSavedAddresses([
            {
              id: '1',
              title: 'Home',
              isDefault: true,
              address: 'House N 01, Pune, Maharashtra, 411047',
            },
          ]);
        }
      }
    } catch (error: any) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setIsLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout from your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          setIsLoggedIn(false);
          onNavigateToLogin();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Permanent Account Deletion',
      'Are you sure you want to delete your account?\n\nThis will permanently delete your profile, saved addresses, order history, and cart data from our database. This action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: performDeleteAccount,
        },
      ]
    );
  };

  const performDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteAccountAPI();
      if (res.success) {
        await AsyncStorage.removeItem('userToken');
        setIsLoggedIn(false);
        Alert.alert(
          'Account Deleted',
          'Your account and all associated data have been permanently deleted from the database.',
          [
            {
              text: 'OK',
              onPress: () => onNavigateToLogin(),
            },
          ]
        );
      } else {
        Alert.alert('Error', res.message || 'Failed to delete account. Please try again.');
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not delete account. Please try again later.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'HealthOil needs access to your location to fetch your delivery address automatically.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const fetchLocationAndReverseGeocode = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to fetch address automatically.');
      return;
    }

    setIsFetchingLocation(true);
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.display_name || `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          setSavedAddresses((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              title: 'Current Location',
              address: address,
            },
          ]);
          Alert.alert('Location Added 📍', 'Current GPS delivery address saved successfully!');
        } catch (error) {
          console.error('Geocoding Error:', error);
          setSavedAddresses((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              title: 'GPS Coordinates',
              address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
            },
          ]);
          Alert.alert('Location Added 📍', 'Saved GPS coordinates as delivery location.');
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);
        Alert.alert('GPS Error', 'Failed to get location. Please enable GPS location.');
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleSaveManualAddress = () => {
    if (!manualAddress.trim()) {
      Alert.alert('Missing Field', 'Please enter your complete address.');
      return;
    }

    setSavedAddresses((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: manualTitle.trim() || 'Other',
        address: manualAddress.trim(),
      },
    ]);

    setManualTitle('');
    setManualAddress('');
    setIsManualModalVisible(false);
    Alert.alert('Saved ✨', 'New address added successfully!');
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'HO';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#14532D" />
        <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Loading profile...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.authContainer} edges={['top', 'left', 'right']}>
        {/* @ts-ignore: Android props */}
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAF9" />
        <View style={styles.authContent}>
          <View style={styles.guestIconCircle}>
            <Text style={{ fontSize: 44 }}>🌿</Text>
          </View>
          <Text style={styles.guestTitle}>Welcome to HealthOil</Text>
          <Text style={styles.guestSubtitle}>
            Log in to view your orders, saved addresses, exclusive discounts, and personalized health oils.
          </Text>
          <TouchableOpacity
            style={styles.guestLoginButton}
            onPress={onNavigateToLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.guestLoginButtonText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* @ts-ignore: Android props */}
      <StatusBar barStyle="light-content" backgroundColor="#14532D" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* ── Top Hero Gradient Banner ─────────────────────────────────── */}
        <View style={styles.heroBanner}>
          <Svg
            height="180"
            width={width}
            style={StyleSheet.absoluteFill}
            viewBox={`0 0 ${width} 180`}
          >
            <Defs>
              <LinearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#14532D" />
                <Stop offset="60%" stopColor="#166534" />
                <Stop offset="100%" stopColor="#1E3A2B" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={width} height="180" fill="url(#heroGrad)" />
            <Circle cx={width - 20} cy="20" r="100" fill="#22C55E" opacity="0.08" />
            <Circle cx={20} cy="140" r="70" fill="#22C55E" opacity="0.06" />
          </Svg>

          {/* Top Bar inside Hero */}
          <View style={styles.heroTopBar}>
            <Text style={styles.heroScreenTitle}>My Profile</Text>
            <TouchableOpacity
              style={styles.heroIconBtn}
              onPress={() => Alert.alert('Notifications', 'You have no new notifications.')}
              activeOpacity={0.7}
            >
              <BellIcon />
            </TouchableOpacity>
          </View>

          {/* Profile Identity Row */}
          <View style={styles.identityRow}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGradientBorder}>
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>
                    {getUserInitials(userData?.name || userData?.fullName)}
                  </Text>
                </View>
              </View>
              <View style={styles.verifiedStarBadge}>
                <Text style={styles.verifiedStarText}>✓</Text>
              </View>
            </View>

            {/* User Info Details */}
            <View style={styles.userInfoCol}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.userNameText} numberOfLines={1}>
                  {userData?.name || userData?.fullName || 'HealthOil Customer'}
                </Text>
              </View>

              <Text style={styles.userEmailText} numberOfLines={1}>
                {userData?.email || 'user@healthoil.com'}
              </Text>

              <View style={styles.memberStatusChip}>
                <Text style={styles.memberStatusText}>🌱 Gold Member</Text>
                {userData?.phone && (
                  <Text style={styles.userPhonePill}> • +91 {userData.phone}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* ── Quick Action Metrics Bar ──────────────────────────────────── */}
        <View style={styles.statsCardWrapper}>
          <View style={styles.statsCard}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={onNavigateToOrders}
              activeOpacity={0.75}
            >
              <View style={[styles.statIconBadge, { backgroundColor: '#DCFCE7' }]}>
                <OrdersBagIcon />
              </View>
              <Text style={styles.statTitle}>My Orders</Text>
              <Text style={styles.statSubtitle}>Track & View</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity
              style={styles.statItem}
              onPress={onNavigateToWishlist}
              activeOpacity={0.75}
            >
              <View style={[styles.statIconBadge, { backgroundColor: '#FEE2E2' }]}>
                <WishlistHeartIcon />
              </View>
              <Text style={styles.statTitle}>Wishlist</Text>
              <Text style={styles.statSubtitle}>Saved Items</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity
              style={styles.statItem}
              onPress={() => setIsManualModalVisible(true)}
              activeOpacity={0.75}
            >
              <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
                <PinLocationIcon />
              </View>
              <Text style={styles.statTitle}>Addresses</Text>
              <Text style={styles.statSubtitle}>{savedAddresses.length} Saved</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section: Saved Delivery Addresses ────────────────────────── */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            <View style={styles.addressActionButtonsRow}>
              <TouchableOpacity
                style={styles.miniAddBtn}
                onPress={fetchLocationAndReverseGeocode}
                disabled={isFetchingLocation}
                activeOpacity={0.7}
              >
                {isFetchingLocation ? (
                  <ActivityIndicator size="small" color="#14532D" />
                ) : (
                  <Text style={styles.miniAddBtnText}>📍 GPS</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.miniAddBtn, { marginLeft: 6, backgroundColor: '#14532D' }]}
                onPress={() => setIsManualModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.miniAddBtnText, { color: '#FFFFFF' }]}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {savedAddresses.map((addr, idx) => (
            <View key={addr.id || idx} style={styles.addressCard}>
              <View style={styles.addressTopRow}>
                <View style={styles.addressLabelPill}>
                  <Text style={styles.addressPinIcon}>📍</Text>
                  <Text style={styles.addressLabelTitle}>{addr.title || 'Address'}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSavedAddresses((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.deleteAddressText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.addressDetailText}>{addr.address}</Text>
            </View>
          ))}
        </View>

        {/* ── Section: Account & Security Settings ─────────────────────── */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <View style={styles.menuGroupCard}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Alert.alert('Personal Info', 'Update profile feature coming soon.')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <UserShieldIcon />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>Personal Information</Text>
                <Text style={styles.menuItemSubtitle}>Name, Email & Contact details</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Alert.alert('Security', 'Password change option is enabled.')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <LockKeyIcon />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>Login & Security</Text>
                <Text style={styles.menuItemSubtitle}>Password & authentication</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Alert.alert('Health Rewards', 'You have 120 Green Points ready to redeem!')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#EDE9FE' }]}>
                <PointsRewardIcon />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>Health Rewards & Coupons</Text>
                <Text style={styles.menuItemSubtitle}>120 points available</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section: Support & Info ───────────────────────────────────── */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>Help & Preferences</Text>

          <View style={styles.menuGroupCard}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Alert.alert('Support', 'Contact our support team at support@healthoil.com or +91 9826025913')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <SupportHelpIcon />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>Help & Support</Text>
                <Text style={styles.menuItemSubtitle}>FAQs, Contact Care & Support</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Alert.alert('Privacy Policy', 'HealthOil is committed to safeguarding your organic oils shopping privacy.')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#F1F5F9' }]}>
                <DocumentTermsIcon />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={styles.menuItemTitle}>Terms & Privacy Policy</Text>
                <Text style={styles.menuItemSubtitle}>Legal terms & conditions</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Bottom Actions: Logout & Delete Account ──────────────────── */}
        <View style={styles.bottomActionsWrapper}>
          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <LogoutIcon />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          {/* Delete Account (Danger Zone) */}
          <TouchableOpacity
            style={styles.deleteAccountBtn}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            activeOpacity={0.8}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <TrashIcon />
                <Text style={styles.deleteAccountText}>Delete Account Permanently</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.appVersionText}>HealthOil App v2.4.0 • 100% Pure & Organic</Text>
        </View>
      </ScrollView>

      {/* ── Manual Add Address Modal ───────────────────────────────────── */}
      <Modal
        visible={isManualModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsManualModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setIsManualModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalInputLabel}>Address Label</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Home, Office, Farmhouse"
              placeholderTextColor="#94A3B8"
              value={manualTitle}
              onChangeText={setManualTitle}
            />

            <Text style={styles.modalInputLabel}>Full Address</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Flat/House No., Street, City, Pincode"
              placeholderTextColor="#94A3B8"
              value={manualAddress}
              onChangeText={setManualAddress}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsManualModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveManualAddress}
              >
                <Text style={styles.modalSaveText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  scrollView: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#F8FAF9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  authContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  guestIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  guestLoginButton: {
    backgroundColor: '#14532D',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  guestLoginButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  // ── Hero Banner Styles ──
  heroBanner: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 44,
    backgroundColor: '#14532D',
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroScreenTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGradientBorder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4ADE80',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  verifiedStarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#14532D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedStarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  userInfoCol: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  userEmailText: {
    fontSize: 13,
    color: '#A7F3D0',
    marginTop: 2,
  },
  memberStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  memberStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FEF08A',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  userPhonePill: {
    fontSize: 11,
    color: '#E2E8F0',
  },

  // ── Floating Stats Card ──
  statsCardWrapper: {
    paddingHorizontal: 16,
    marginTop: -28,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },

  // ── Section Container ──
  sectionWrapper: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  addressActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  miniAddBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  miniAddBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#14532D',
  },

  // ── Address Cards ──
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  addressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressLabelPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressPinIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  addressLabelTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  defaultBadge: {
    marginLeft: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },
  deleteAddressText: {
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 4,
  },
  addressDetailText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },

  // ── Grouped Menu Card ──
  menuGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuItemSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 62,
    marginRight: 14,
  },

  // ── Bottom Action Buttons ──
  bottomActionsWrapper: {
    marginTop: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 14,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    marginLeft: 8,
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  deleteAccountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
  appVersionText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 18,
  },

  // ── Modal Styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748B',
    padding: 4,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAF9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 14,
  },
  modalTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSaveBtn: {
    backgroundColor: '#14532D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;
