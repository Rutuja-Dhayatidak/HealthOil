import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OrderSuccessScreenProps {
  orderId?: string;
  onTrackOrder?: (orderId?: string) => void;
  onContinueShopping?: () => void;
}

const OrderSuccessScreen = ({ orderId, onTrackOrder, onContinueShopping }: OrderSuccessScreenProps) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* @ts-ignore: Android props */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        {/* Text Details */}
        <Text style={styles.title}>Order Placed{'\n'}Successfully!</Text>
        
        {orderId ? (
          <Text style={styles.orderIdLabel}>Order ID: {orderId}</Text>
        ) : null}
        
        <Text style={styles.description}>
          Thank you for ordering with HealthOil. Your order has been placed and sent to the vendor.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.bottomBar}>
        {onTrackOrder && (
          <TouchableOpacity style={styles.trackOrderButton} onPress={() => onTrackOrder(orderId)}>
            <Text style={styles.trackOrderText}>Track Order</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.continueButton} onPress={onContinueShopping}>
          <Text style={styles.continueText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
  },
  mockTimeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  rightIcons: {
    flexDirection: 'row',
  },
  signalIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  batteryIcon: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: -50,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5cb85c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#5cb85c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkmark: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 15,
  },
  orderIdLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#eee',
    marginBottom: 30,
  },
  estimatedLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  estimatedTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  bottomBar: {
    padding: 20,
    paddingBottom: 40,
  },
  trackOrderButton: {
    backgroundColor: '#f0ad4e',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  trackOrderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  continueButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default OrderSuccessScreen;
