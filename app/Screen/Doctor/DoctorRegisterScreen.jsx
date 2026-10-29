import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { appointmentAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

const DoctorRegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    specialization: '',
    qualification: '',
    experience: '',
    license_number: '',
    hourly_rate: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const progressAnim = useState(new Animated.Value(0))[0];
  const inputFocusAnim = useState(new Animated.Value(0))[0];

  const steps = [
    'Personal Info',
    'Professional Details',
    'Verification'
  ];

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  useEffect(() => {
    // Update progress animation when step changes
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / steps.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const handleInputFocus = () => {
    Animated.timing(inputFocusAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleInputBlur = () => {
    Animated.timing(inputFocusAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    if (!formData.specialization || !formData.qualification || !formData.experience) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call - comment back in later
      await new Promise(resolve => setTimeout(resolve, 2000));
      // await appointmentAPI.registerDoctor({
      //   ...formData,
      //   experience: parseInt(formData.experience),
      //   hourly_rate: parseFloat(formData.hourly_rate)
      // });
      
      Alert.alert('Success', 'Doctor registration submitted for verification');
      navigation.navigate('DoctorDashboard');
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepProgressBar}>
          <Animated.View 
            style={[
              styles.stepProgressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />
        </View>
        <View style={styles.stepDots}>
          {steps.map((step, index) => (
            <View key={step} style={styles.stepDotWrapper}>
              <View 
                style={[
                  styles.stepDot,
                  index <= currentStep && styles.stepDotActive
                ]}
              >
                {index < currentStep && (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                )}
              </View>
              <Text style={[
                styles.stepText,
                index <= currentStep && styles.stepTextActive
              ]}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderInput = (placeholder, value, onChangeText, key, props = {}) => (
    <Animated.View 
      style={[
        styles.inputContainer,
        {
          transform: [
            { 
              scale: inputFocusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.02]
              }) 
            }
          ]
        }
      ]}
    >
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={(text) => onChangeText(text)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        {...props}
      />
      <View style={styles.inputBorder} />
    </Animated.View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View 
            style={[
              styles.stepContent,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {renderInput(
              "Specialization *",
              formData.specialization,
              (text) => setFormData({...formData, specialization: text}),
              'specialization'
            )}
            {renderInput(
              "License Number",
              formData.license_number,
              (text) => setFormData({...formData, license_number: text}),
              'license_number'
            )}
          </Animated.View>
        );
      
      case 1:
        return (
          <Animated.View 
            style={[
              styles.stepContent,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {renderInput(
              "Qualifications *",
              formData.qualification,
              (text) => setFormData({...formData, qualification: text}),
              'qualification',
              { multiline: true, numberOfLines: 4, style: styles.textArea }
            )}
            {renderInput(
              "Years of Experience *",
              formData.experience,
              (text) => setFormData({...formData, experience: text}),
              'experience',
              { keyboardType: 'numeric' }
            )}
          </Animated.View>
        );
      
      case 2:
        return (
          <Animated.View 
            style={[
              styles.stepContent,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {renderInput(
              "Hourly Rate ($)",
              formData.hourly_rate,
              (text) => setFormData({...formData, hourly_rate: text}),
              'hourly_rate',
              { keyboardType: 'decimal-pad' }
            )}
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Registration Summary</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Specialization:</Text>
                <Text style={styles.summaryValue}>{formData.specialization || 'Not provided'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Experience:</Text>
                <Text style={styles.summaryValue}>{formData.experience ? `${formData.experience} years` : 'Not provided'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>License:</Text>
                <Text style={styles.summaryValue}>{formData.license_number || 'Not provided'}</Text>
              </View>
            </View>
          </Animated.View>
        );
      
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#D946EF']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={32} color="#6366F1" />
          </View>
          <Text style={styles.title}>Doctor Registration</Text>
          <Text style={styles.subtitle}>
            Join our network of healthcare professionals
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderStepIndicator()}
        {renderStepContent()}

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={prevStep}
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={20} color="#6366F1" />
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < steps.length - 1 ? (
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={nextStep}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.registerButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.registerButtonText}>Complete Registration</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text 
              style={styles.footerLink}
              onPress={() => navigation.navigate('Login')}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepProgressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  stepProgressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  stepDotWrapper: {
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepDotActive: {
    backgroundColor: '#6366F1',
  },
  stepText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  stepTextActive: {
    color: '#6366F1',
  },
  stepContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  inputBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#6366F1',
    transform: [{ scaleX: 0 }],
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#6366F1',
    marginLeft: 10,
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  secondaryButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  footerLink: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
});

export default DoctorRegisterScreen;