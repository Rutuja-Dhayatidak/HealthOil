import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { getOrderById } from '../services/orderService';

const OrderTrackingScreen = ({ orderId, onBack }: { orderId?: string | null, onBack?: () => void }) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await getOrderById(orderId);
        if (res.success && res.order) {
          setOrder(res.order);
        } else if (res.data) {
          setOrder(res.data);
        } else {
          setOrder(res); // Fallback if structure is just the order object
        }
      } catch (err) {
        console.error('Error tracking order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#f0ad4e" />
        <Text style={{marginTop: 10, color: '#666'}}>Fetching order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{color: '#d9534f', fontSize: 16}}>Order not found.</Text>
        <TouchableOpacity style={{marginTop: 20}} onPress={onBack}>
          <Text style={{color: '#f0ad4e', fontWeight: 'bold'}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Dynamic tracking logic based on standard statuses
  const statusHierarchy = ['Placed', 'Accepted', 'Packed', 'Out for Delivery', 'Delivered'];
  const currentStatusIndex = statusHierarchy.findIndex(s => s.toLowerCase() === (order.status || 'placed').toLowerCase());
  
  const trackingSteps = statusHierarchy.map((status, index) => {
    return {
      id: index.toString(),
      title: status,
      time: index <= currentStatusIndex ? 'Updated' : 'Pending',
      completed: index <= currentStatusIndex,
      current: index === currentStatusIndex,
    };
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}><Text>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Details */}
        <View style={styles.orderDetailsContainer}>
          <Text style={styles.orderId}>Order ID: {order.id || order._id || orderId}</Text>
          <Text style={styles.orderTime}>Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recently'}</Text>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.timelineContainer}>
          {trackingSteps.map((step, index) => (
            <View key={step.id} style={styles.timelineStep}>
              {/* Timeline Line */}
              {index !== trackingSteps.length - 1 && (
                <View style={[styles.timelineLine, step.completed && styles.timelineLineCompleted]} />
              )}
              
              {/* Timeline Icon */}
              <View style={[
                styles.timelineIconContainer,
                step.completed && styles.timelineIconCompleted,
                step.current && styles.timelineIconCurrent
              ]}>
                {step.completed ? (
                  <Text style={styles.checkmarkIcon}>✓</Text>
                ) : (
                  <View style={styles.dotIcon} />
                )}
              </View>

              {/* Timeline Text */}
              <View style={styles.timelineTextContainer}>
                <Text style={[styles.stepTitle, (step.completed || step.current) && styles.stepTitleActive]}>
                  {step.title}
                </Text>
                <Text style={styles.stepTime}>{step.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Partner */}
        {(order.deliveryPartner || currentStatusIndex >= 3) && (
          <View style={styles.deliveryPartnerContainer}>
             <Image source={{ uri: order.deliveryPartner?.image || 'https://via.placeholder.com/50' }} style={styles.partnerImage} />
             <View style={styles.partnerInfo}>
               <Text style={styles.partnerLabel}>Delivery Partner</Text>
               <Text style={styles.partnerName}>{order.deliveryPartner?.name || 'Assigning soon...'}</Text>
             </View>
             <TouchableOpacity style={styles.callButton}>
               <Text style={styles.callIcon}>📞</Text>
             </TouchableOpacity>
          </View>
        )}
        <View style={{height: 100}} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpText}>Need Help?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
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
    padding: 20,
  },
  orderDetailsContainer: {
    marginBottom: 30,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
  },
  timelineContainer: {
    paddingLeft: 10,
    marginBottom: 30,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 30,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 25,
    bottom: -30,
    width: 2,
    backgroundColor: '#eee',
  },
  timelineLineCompleted: {
    backgroundColor: '#5cb85c',
  },
  timelineIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    zIndex: 1,
  },
  timelineIconCompleted: {
    borderColor: '#5cb85c',
    backgroundColor: '#5cb85c',
  },
  timelineIconCurrent: {
    borderColor: '#5cb85c',
  },
  checkmarkIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dotIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  timelineTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepTitleActive: {
    color: '#333',
  },
  stepTime: {
    fontSize: 14,
    color: '#666',
  },
  deliveryPartnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
  },
  partnerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 16,
  },
  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  helpButton: {
    backgroundColor: '#f0ad4e',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default OrderTrackingScreen;
