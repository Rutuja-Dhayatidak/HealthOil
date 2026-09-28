import React, { useState, useEffect, useRef } from 'react';
import { loginUser } from '../services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ onBack, onNavigateToRegister, onNavigateToForgotPassword, onNavigateToHome }: { onBack: () => void, onNavigateToRegister: () => void, onNavigateToForgotPassword: () => void, onNavigateToHome: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await loginUser({ email, password, platform: 'mobile' });
      if (res.success && res.token) {
        await AsyncStorage.setItem('userToken', res.token);
        onNavigateToHome();
      } else {
        setErrorMsg(res.message || 'Login failed');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Image - The user uploaded Login.png, we can use it as a background or just the image behind */}
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

          {/* Top spacer to push content down where it should be */}
          <View style={styles.spacer} />

          {/* Form Container */}
          <Animated.View style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            {/* Input fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.iconPlaceholder}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Email or Mobile Number"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
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
              <TouchableOpacity>
                <Text style={styles.iconPlaceholder}>👁️</Text>
              </TouchableOpacity>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.row}>
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onNavigateToForgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            {errorMsg ? <Text style={{color: 'red', marginBottom: 10, textAlign: 'center'}}>{errorMsg}</Text> : null}
            <TouchableOpacity style={styles.loginBtn} activeOpacity={0.8} onPress={handleLogin} disabled={loading}>
              <Text style={styles.loginBtnText}>{loading ? 'Logging in...' : 'Login'}</Text>
              {!loading && <Text style={styles.arrowIcon}>→</Text>}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            {/* Google Button */}
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={onNavigateToRegister}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>

            {/* Back button just for navigation during dev */}
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back to Onboarding</Text>
            </TouchableOpacity>
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
    opacity: 1, // Full opacity as per design
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  spacer: {
    height: height * 0.32, // Increased to push form below the background image's logo and text
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
    borderColor: '#9EAF7D', // Olive green border
    borderRadius: 20, // More rounded
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 60,
    backgroundColor: '#FBFAEE', // Very light yellowish tint
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#37680D',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#37680D',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 14,
    color: '#333',
  },
  forgotText: {
    fontSize: 14,
    color: '#E8630A',
  },
  loginBtn: {
    backgroundColor: '#37680D',
    borderRadius: 30, // More rounded pill shape
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  arrowIcon: {
    color: '#FFF',
    fontSize: 22,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#C3D0A8',
  },
  orText: {
    marginHorizontal: 15,
    color: '#555',
    fontSize: 14,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 25,
    height: 55,
    backgroundColor: '#FFF',
    marginBottom: 30,
  },
  googleIcon: {
    fontSize: 22,
    marginRight: 15,
    fontWeight: 'bold',
    color: '#DB4437',
  },
  googleBtnText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 15,
    color: '#555',
  },
  registerLink: {
    fontSize: 15,
    color: '#E8630A',
    fontWeight: 'bold',
  },
  backBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#888',
    fontSize: 14,
  }
});

export default LoginScreen;
