import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../config/server';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const ForgetPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: '' });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Button press animation
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const response = await axios.post(
        `${API_BASE_URL}password-reset/`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      console.log(response.data);
      Alert.alert(
        'Password Reset',
        'If an account exists with this email, you will receive a password reset link.'
      );
      navigation.goBack();
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'An error occurred while processing your request'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          {/* Header with Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
                borderBottomLeftRadius: isTablet ? 180 : 120,
                borderBottomRightRadius: isTablet ? 180 : 120,
              },
            ]}
          >
            <LinearGradient
              colors={['#4E7AC7', '#5EC8D8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <LottieView
                source={require('../../assets/json/wave.json')}
                autoPlay
                loop
                style={styles.waveAnimation}
              />
              <Animated.View style={{ transform: [{ scale: logoScale }] }}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          {/* Main Content */}
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ translateY: slideUpAnim }],
                paddingHorizontal: isTablet ? 40 : 20,
              },
            ]}
          >
            <Text style={[styles.title, { fontSize: isTablet ? 28 : 24 }]}>
              Reset Password
            </Text>
            <Text style={styles.subtitle}>
              Enter your email address to receive a password reset link
            </Text>

            {/* Email Input */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="email"
                size={20}
                color="#666"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter Your Email..."
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            {/* Reset Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  {
                    backgroundColor: isSubmitting ? '#3A5F9A' : '#4E7AC7',
                  },
                ]}
                onPress={handleResetPassword}
                activeOpacity={0.9}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LottieView
                    source={require('../../assets/json/Trail loading.json')}
                    autoPlay
                    loop
                    style={styles.loadingAnimation}
                  />
                ) : (
                  <Text style={styles.resetButtonText}>
                    Send Reset Link <Feather name="arrow-right" size={18} />
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Back to Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Remember your password?{' '}
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={{ color: '#4E7AC7', fontWeight: '600' }}>
                    Login
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    width: '100%',
    height: isTablet ? height * 0.3 : height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: isTablet ? 20 : 10,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveAnimation: {
    position: 'absolute',
    width: '200%',
    height: '100%',
    opacity: 0.6,
  },
  logoImage: {
    width: isTablet ? 120 : 100,
    height: isTablet ? 120 : 100,
    tintColor: '#fff',
  },
  title: {
    marginTop: isTablet ? 10 : 5,
    marginBottom: 10,
    textAlign: 'center',
    color: '#4E7AC7',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: isTablet ? 16 : 14,
    marginBottom: isTablet ? 30 : 20,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  label: {
    marginBottom: 8,
    marginLeft: 15,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '500',
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 30,
    marginBottom: 5,
    paddingHorizontal: 20,
    height: isTablet ? 60 : 50,
    backgroundColor: '#f5f5f5',
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    height: '100%',
    color: '#333',
  },
  icon: {
    marginRight: 10,
  },
  resetButton: {
    height: isTablet ? 60 : 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#4E7AC7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingAnimation: {
    width: 50,
    height: 50,
  },
  resetButtonText: {
    fontSize: isTablet ? 20 : 18,
    letterSpacing: 0.5,
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    marginTop: isTablet ? 30 : 20,
    alignItems: 'center',
  },
  footerText: {
    marginBottom: 10,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: isTablet ? 14 : 12,
    marginLeft: 20,
    marginBottom: isTablet ? 15 : 10,
  },
});

export default ForgetPassword;