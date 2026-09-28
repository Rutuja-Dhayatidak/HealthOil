import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';

const NearbyStoresScreen = () => {
  const [viewMode, setViewMode] = useState('List View');

  const stores = [
    { id: '1', name: 'Shree Oil Traders', distance: '1.2 KM away', rating: '4.6', time: '30 min', status: 'Open' },
    { id: '2', name: 'Maa Laxmi Oils', distance: '2.4 KM away', rating: '4.3', time: '40 min', status: 'Open' },
    { id: '3', name: 'Swastik Oil Store', distance: '3.1 KM away', rating: '4.2', time: '35 min', status: 'Open' },
    { id: '4', name: 'Patil Oil Center', distance: '4.8 KM away', rating: '4.1', time: '45 min', status: 'Open' },
    { id: '5', name: 'Sai Oil Mart', distance: '5.6 KM away', rating: '4.0', time: '50 min', status: 'Open' },
  ];

  const renderStore = ({ item }: { item: any }) => (
    <View style={styles.storeCard}>
      <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.storeImage} />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeDistance}>{item.distance}</Text>
        <Text style={styles.storeRating}>⭐ {item.rating} • {item.time}</Text>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header and Map Area (Mock) */}
      <View style={styles.mapArea}>
        <View style={styles.header}>
           <TouchableOpacity style={styles.backButton}>
             <Text>←</Text>
           </TouchableOpacity>
           <View style={styles.searchContainer}>
             <Text style={styles.searchText}>🔍 Pimpri, Pune ∨</Text>
           </View>
           <TouchableOpacity style={styles.filterButton}>
             <Text>⚙️</Text>
           </TouchableOpacity>
        </View>
        
        {/* Placeholder for Map */}
        <View style={styles.mapPlaceholder}>
           <Text>Map View Placeholder</Text>
           {/* Mock Map Pins */}
           <View style={[styles.mapPin, { top: 50, left: 100 }]}><Text>📍</Text></View>
           <View style={[styles.mapPin, { top: 80, left: 200 }]}><Text>📍</Text></View>
           <View style={[styles.mapPin, { top: 150, left: 150 }]}><Text>📍</Text></View>
        </View>

        {/* View Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'List View' && styles.activeToggle]}
            onPress={() => setViewMode('List View')}
          >
            <Text style={[styles.toggleText, viewMode === 'List View' && styles.activeToggleText]}>☰ List View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'Map View' && styles.activeToggle]}
            onPress={() => setViewMode('Map View')}
          >
             <Text style={[styles.toggleText, viewMode === 'Map View' && styles.activeToggleText]}>🗺 Map View</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Store List */}
      <FlatList
        data={stores}
        renderItem={renderStore}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapArea: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  searchText: {
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 20,
  },
  mapPlaceholder: {
    height: 300,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPin: {
    position: 'absolute',
  },
  toggleContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: '#f0ad4e',
  },
  toggleText: {
    color: '#555',
    fontWeight: 'bold',
  },
  activeToggleText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  storeInfo: {
    flex: 1,
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
    marginBottom: 4,
  },
  storeRating: {
    fontSize: 12,
    color: '#f0ad4e',
    fontWeight: 'bold',
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#5cb85c',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default NearbyStoresScreen;
