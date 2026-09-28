import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, SafeAreaView, Image, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onNavigateToLogin, onNavigateToHome }: { onNavigateToLogin: () => void, onNavigateToHome: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Image / Main Image */}
      <Animated.Image 
        source={require('../assets/image.png')} 
        style={[
          styles.image, 
          { 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }] 
          }
        ]}
        resizeMode="cover"
      />
      
      {/* Overlay Content (Button) */}
      <Animated.View style={[
        styles.contentContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <View style={styles.spacer} />
        
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={onNavigateToHome}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginContainer} activeOpacity={0.6} onPress={onNavigateToLogin}>
          <Text style={styles.loginText}>Already have an account? <Text style={styles.loginTextBold}>Log In</Text></Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EA', // matching the beige background roughly
  },
  image: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  spacer: {
    flex: 1,
  },
  button: {
    backgroundColor: '#0F730C', // Dark green from the logo
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginContainer: {
    marginTop: 20,
    paddingVertical: 10,
  },
  loginText: {
    color: '#555',
    fontSize: 16,
  },
  loginTextBold: {
    color: '#0F730C', // Same as button green
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
