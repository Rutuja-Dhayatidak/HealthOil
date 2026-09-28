import React, { useState, useRef, useEffect } from 'react';
import { sendForgotPasswordOtp, resetPassword } from '../services/userService';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image, Alert, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ onNavigateToLogin }: { onNavigateToLogin: () => void }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<any[]>([]);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleOtpChange = (value: string, index: number) => {
    const newOtpArray = [...otpArray];
    newOtpArray[index] = value;
    setOtpArray(newOtpArray);
    setOtp(newOtpArray.join(''));

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current is empty
    if (e.nativeEvent.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async () => {
    if (!email) {
      setErrorMsg('Please enter your email.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await sendForgotPasswordOtp(email);
      if (res.success) {
        setStep(2);
      } else {
        setErrorMsg(res.message || 'Failed to send OTP.');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      // In this flow, we don't hit the API until they enter the new password.
      // So we just move to the password reset step locally.
      setErrorMsg('');
      setStep(3);
    } else {
      setErrorMsg('Please enter a valid 6-digit code.');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match or are empty.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await resetPassword({ email, otp, newPassword, platform: 'mobile' });
      if (res.success) {
        Alert.alert('Password Reset Successful!', 'You can now log in with your new password.');
        onNavigateToLogin();
      } else {
        setErrorMsg(res.message || 'Failed to reset password.');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Something went wrong.');
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
            
            {step === 1 && (
              <>
                <Text style={styles.instructionText}>Enter your email to receive a password reset code.</Text>
                
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

                {errorMsg ? <Text style={{color: 'red', marginBottom: 10, textAlign: 'center'}}>{errorMsg}</Text> : null}
                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleSendOtp} disabled={loading}>
                  <Text style={styles.primaryBtnText}>{loading ? 'Sending...' : 'Send Code'}</Text>
                  {!loading && <Text style={styles.arrowIcon}>→</Text>}
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.instructionText}>We've sent a 6-digit code to{"\n"}{email}</Text>
                
                <View style={styles.otpContainer}>
                  {otpArray.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { inputRefs.current[index] = ref; }}
                      style={styles.otpBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => handleOtpChange(val, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    />
                  ))}
                </View>

                {errorMsg ? <Text style={{color: 'red', marginBottom: 10, textAlign: 'center'}}>{errorMsg}</Text> : null}
                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleVerifyOtp} disabled={loading}>
                  <Text style={styles.primaryBtnText}>Verify Code</Text>
                  <Text style={styles.arrowIcon}>✓</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.instructionText}>Create a new password for your account.</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.iconPlaceholder}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="#888"
                    secureTextEntry={true}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.iconPlaceholder}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    placeholderTextColor="#888"
                    secureTextEntry={true}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                {errorMsg ? <Text style={{color: 'red', marginBottom: 10, textAlign: 'center'}}>{errorMsg}</Text> : null}
                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleResetPassword} disabled={loading}>
                  <Text style={styles.primaryBtnText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
                  {!loading && <Text style={styles.arrowIcon}>✓</Text>}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.backLink} onPress={onNavigateToLogin}>
              <Text style={styles.backLinkText}>← Back to Login</Text>
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
    opacity: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  spacer: {
    height: height * 0.40, // Match Login screen spacing
  },
  formContainer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
    paddingTop: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#4A5B36',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    fontWeight: '500',
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#9EAF7D',
    borderRadius: 12,
    backgroundColor: '#FBFAEE',
    textAlign: 'center',
    fontSize: 22,
    color: '#333',
    fontWeight: 'bold',
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
  backLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  backLinkText: {
    color: '#888',
    fontSize: 15,
  }
});

export default ForgotPasswordScreen;
