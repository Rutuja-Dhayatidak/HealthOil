import React, { useState, useEffect, useRef } from 'react';
import { sendOtp, registerUser } from '../services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image, Alert, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ onNavigateToLogin, onNavigateToHome }: { onNavigateToLogin: () => void, onNavigateToHome: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [isOtpSent, setIsOtpSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
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

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setErrorMsg('Please fill all fields');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await sendOtp(email);
      if (res.success) {
        setIsOtpSent(true);
      } else {
        setErrorMsg(res.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await registerUser({ name, email, phone, password, otp, platform: 'mobile' });
      if (res.success && res.token) {
        await AsyncStorage.setItem('userToken', res.token);
        onNavigateToHome();
      } else {
        setErrorMsg(res.message || 'Registration failed');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Shared Background Image */}
      <Animated.Image 
        source={require('../assets/Login.png')} 
        style={[
          styles.backgroundImage,
          { 
            opacity: fadeAnim, 
            transform: [{ scale: scaleAnim }] 
          }
        ]}
        resizeMode="cover"
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.spacer} />

          <Animated.View style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            {!isOtpSent ? (
              // REGISTRATION FORM
              <>
                {/* Input fields */}
                <View style={styles.inputContainer}>
                  <Text style={styles.iconPlaceholder}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#888"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.iconPlaceholder}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.iconPlaceholder}>📱</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#888"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.iconPlaceholder}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#888"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                {errorMsg ? <Text style={{color: 'red', marginBottom: 10, textAlign: 'center'}}>{errorMsg}</Text> : null}
                {/* Register Button */}
                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleRegister} disabled={loading}>
                  <Text style={styles.primaryBtnText}>{loading ? 'Sending OTP...' : 'Register'}</Text>
                  {!loading && <Text style={styles.arrowIcon}>→</Text>}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.linkRow}>
                  <Text style={styles.linkText}>Already have an account? </Text>
                  <TouchableOpacity onPress={onNavigateToLogin}>
                    <Text style={styles.linkTextBold}>Login</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // OTP VERIFICATION FORM
              <>
                <Text style={styles.otpMessage}>
                  We've sent a 6-digit OTP to your email:{"\n"}{email}
                </Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.iconPlaceholder}>🔢</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#888"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>

                {errorMsg ? <Text style={{color: 'red', marginBottom: 10, textAlign: 'center'}}>{errorMsg}</Text> : null}
                {/* Verify Button */}
                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleVerifyOtp} disabled={loading}>
                  <Text style={styles.primaryBtnText}>{loading ? 'Verifying...' : 'Verify & Complete'}</Text>
                  {!loading && <Text style={styles.arrowIcon}>✓</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.backLink} onPress={() => setIsOtpSent(false)}>
                  <Text style={styles.backLinkText}>← Change Email / Details</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EA',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  spacer: {
    height: height * 0.40, // Matched with LoginScreen to push form below the background image's logo and text
  },
  formContainer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9EAF7D',
    borderRadius: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 60,
    backgroundColor: '#FBFAEE',
  },
  iconPlaceholder: {
    fontSize: 18,
    marginRight: 10,
    color: '#4A5B36',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  primaryBtn: {
    backgroundColor: '#37680D',
    borderRadius: 30,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  arrowIcon: {
    color: '#FFF',
    fontSize: 22,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 15,
    color: '#555',
  },
  linkTextBold: {
    fontSize: 15,
    color: '#E8630A',
    fontWeight: 'bold',
  },
  otpMessage: {
    fontSize: 16,
    color: '#4A5B36',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    fontWeight: '500',
  },
  backLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  backLinkText: {
    color: '#888',
    fontSize: 15,
  }
});

export default RegisterScreen;
