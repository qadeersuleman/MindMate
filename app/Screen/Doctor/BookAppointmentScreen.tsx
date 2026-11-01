import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import Colors from "../../assets/colors"

const { width } = Dimensions.get('window');

const BookAppointmentScreen = ({ route, navigation }) => {
  // const { doctorId } = route.params;
  const [formData, setFormData] = useState({
    appointment_date: new Date(),
    appointment_time: new Date(),
    symptoms: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  const formOpacity = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    // Start entrance animations
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
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const animateButton = () => {
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
      })
    ]).start();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleBookAppointment = async () => {
    animateButton();

    if (!formData.symptoms.trim()) {
      Alert.alert('Error', 'Please describe your symptoms');
      return;
    }

    setLoading(true);
    
    // Simulate API call with beautiful loading state
    try {
      await new Promise(resolve => setTimeout(() => resolve(null), 2000));
      
      // Success simulation
      Alert.alert(
        '🎉 Success!', 
        'Your appointment has been booked successfully!',
        [
          { 
            text: 'View Details', 
            onPress: () => navigation.navigate('AppointmentDetail', { appointmentId: '1' }) 
          },
          { 
            text: 'Dashboard', 
            style: 'cancel',
            onPress: () => navigation.navigate('PatientDashboard')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={Colors.gradients.primary}
        style={styles.header}
      >
        <View style={styles.headerTopBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Book Appointment</Text>
            <Text style={styles.subtitle}>Schedule your consultation</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: formOpacity,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Doctor Info Card */}
          <View style={styles.doctorCard}>
            <View style={styles.avatar}>
              <Ionicons name="medical" size={32} color={Colors.brand.primary} />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>Dr. Sarah Johnson</Text>
              <Text style={styles.doctorSpecialty}>Cardiologist • 12 years exp.</Text>
              <Text style={styles.doctorQualification}>MD, MBBS</Text>
            </View>
          </View>

          {/* Date Selection */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Ionicons name="calendar-outline" size={20} color={Colors.brand.primary} />
              <Text style={styles.inputLabel}>Appointment Date</Text>
            </View>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={Colors.brand.primary} />
              <Text style={styles.pickerButtonText}>
                {formatDate(formData.appointment_date)}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Time Selection */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Ionicons name="time-outline" size={20} color={Colors.brand.primary} />
              <Text style={styles.inputLabel}>Preferred Time</Text>
            </View>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={20} color={Colors.brand.primary} />
              <Text style={styles.pickerButtonText}>
                {formatTime(formData.appointment_time)}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Symptoms Input */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
              <Ionicons name="medical-outline" size={20} color={Colors.brand.primary} />
              <Text style={styles.inputLabel}>Symptoms & Concerns</Text>
            </View>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Describe your symptoms, concerns, or reason for visit in detail..."
                placeholderTextColor="#94A3B8"
                value={formData.symptoms}
                onChangeText={(text) => setFormData({...formData, symptoms: text})}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <View style={styles.characterCount}>
                <Text style={styles.characterCountText}>
                  {formData.symptoms.length}/500
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Notes */}
          <View style={styles.tipsCard}>
            <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
            <Text style={styles.tipsText}>
              Please provide detailed symptoms to help your doctor prepare for your consultation.
            </Text>
          </View>

          {/* Book Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              style={[styles.bookButton, loading && styles.bookButtonDisabled]}
              onPress={handleBookAppointment}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={Colors.gradients.primary}
                style={styles.bookButtonGradient}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.bookButtonText}>Booking...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="calendar" size={18} color="#fff" />
                    <Text style={styles.bookButtonText}>Confirm Appointment</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Success Animation (Hidden until booking) */}
          {loading && (
            <View style={styles.animationContainer}>
              {/* <LottieView
                source={require('../assets/animations/loading-medical.json')}
                autoPlay
                loop
                style={styles.loadingAnimation}
              /> */}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.appointment_date}
          mode="date"
          display="spinner"
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData({...formData, appointment_date: selectedDate});
            }
          }}
          textColor="#6366F1"
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={formData.appointment_time}
          mode="time"
          display="spinner"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setFormData({...formData, appointment_time: selectedTime});
            }
          }}
          textColor="#6366F1"
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 48 : 36,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginTop: -8,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: Colors.ui.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.brand.primaryPastel,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: Colors.brand.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  doctorQualification: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: Colors.ui.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    marginLeft: 10,
    fontWeight: '500',
  },
  textInputContainer: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 110,
    textAlignVertical: 'top',
  },
  characterCount: {
    position: 'absolute',
    bottom: 10,
    right: 12,
  },
  characterCountText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    marginLeft: 8,
    lineHeight: 18,
  },
  bookButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.brand.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingAnimation: {
    width: 100,
    height: 100,
  },
});

export default BookAppointmentScreen;