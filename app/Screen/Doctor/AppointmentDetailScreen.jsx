import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from "../../assets/colors.jsx"

const { width } = Dimensions.get('window');

const AppointmentDetailScreen = ({ route, navigation }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    loadAppointmentDetail();
  }, []);

  const loadAppointmentDetail = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dummyAppointment = {
        id: '1',
        doctor_name: 'Sarah Johnson',
        doctor_specialization: 'Cardiologist',
        doctor_experience: 12,
        doctor_qualification: 'MD, MBBS',
        doctor_avatar: '👩‍⚕️',
        appointment_date: '2024-01-15',
        appointment_time: '14:30',
        duration: 30,
        status: 'confirmed',
        symptoms: 'Chest pain and shortness of breath during physical activity',
        notes: 'Patient needs to undergo ECG and stress test. Avoid strenuous activities until next appointment.',
        created_at: '2024-01-10T10:00:00Z',
        next_available: '2024-02-01'
      };

      setAppointment(dummyAppointment);
      
      // Animate content in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointment details');
      console.error('Appointment detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  const canJoinCall = () => {
    if (!appointment) return false;
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();
    return appointment.status === 'confirmed' && appointmentDateTime <= now;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>Loading appointment details...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.centered}>
        <Ionicons name="calendar-outline" size={64} color={Colors.text.secondary} />
        <Text style={styles.errorText}>Appointment not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.gradients.calm}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text.inverted} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Appointment Details</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Doctor Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="medical-outline" size={20} color={Colors.brand.primary} />
              <Text style={styles.cardTitle}>Doctor Information</Text>
            </View>
            <View style={styles.doctorInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>{appointment.doctor_avatar}</Text>
              </View>
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>Dr. {appointment.doctor_name}</Text>
                <Text style={styles.specialization}>{appointment.doctor_specialization}</Text>
                <View style={styles.doctorMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="school-outline" size={14} color={Colors.text.secondary} />
                    <Text style={styles.metaText}>{appointment.doctor_qualification}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
                    <Text style={styles.metaText}>{appointment.doctor_experience} years exp.</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {canJoinCall() && (
            <View style={styles.actionCard}>
              <Text style={styles.actionTitle}>Ready to Connect</Text>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('VideoCall', { appointmentId: appointment.id })}
              >
                <LinearGradient
                  colors={Colors.gradients.calm}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="videocam-outline" size={20} color={Colors.text.inverted} />
                  <Text style={styles.primaryButtonText}>Join Video Call</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Chat', { appointmentId: appointment.id })}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.brand.primary} />
                <Text style={styles.secondaryButtonText}>Start Chat</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Appointment Time Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={20} color={Colors.brand.primary} />
              <Text style={styles.cardTitle}>Appointment Time</Text>
            </View>
            <View style={styles.timeInfo}>
              <View style={styles.timeItem}>
                <Ionicons name="calendar-outline" size={18} color={Colors.brand.primary} />
                <View style={styles.timeDetails}>
                  <Text style={styles.timeLabel}>Date</Text>
                  <Text style={styles.timeValue}>{formatDate(appointment.appointment_date)}</Text>
                </View>
              </View>
              <View style={styles.timeItem}>
                <Ionicons name="time-outline" size={18} color={Colors.brand.primary} />
                <View style={styles.timeDetails}>
                  <Text style={styles.timeLabel}>Time</Text>
                  <Text style={styles.timeValue}>{appointment.appointment_time}</Text>
                </View>
              </View>
              <View style={styles.timeItem}>
                <Ionicons name="hourglass-outline" size={18} color={Colors.brand.primary} />
                <View style={styles.timeDetails}>
                  <Text style={styles.timeLabel}>Duration</Text>
                  <Text style={styles.timeValue}>{appointment.duration} minutes</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Symptoms Card */}
          {appointment.symptoms && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="alert-circle-outline" size={20} color={Colors.brand.primary} />
                <Text style={styles.cardTitle}>Symptoms</Text>
              </View>
              <Text style={styles.infoText}>{appointment.symptoms}</Text>
            </View>
          )}

          {/* Notes Card */}
          {appointment.notes && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text-outline" size={20} color={Colors.brand.primary} />
                <Text style={styles.cardTitle}>Doctor's Notes</Text>
              </View>
              <Text style={styles.infoText}>{appointment.notes}</Text>
            </View>
          )}

          {/* Footer Info */}
          <View style={styles.footerCard}>
            <View style={styles.footerItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.footerText}>
                Created: {new Date(appointment.created_at).toLocaleString()}
              </Text>
            </View>
            {appointment.next_available && (
              <View style={styles.footerItem}>
                <Ionicons name="arrow-forward-outline" size={16} color={Colors.text.secondary} />
                <Text style={styles.footerText}>
                  Next available: {formatDate(appointment.next_available)}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status) => {
  const colors = {
    scheduled: Colors.status.warning,
    confirmed: Colors.status.success,
    completed: Colors.brand.primary,
    cancelled: Colors.status.error
  };
  return colors[status] || Colors.text.secondary;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.main,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.inverted,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.ui.shadowStrong,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    fontSize: 24,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  specialization: {
    fontSize: 16,
    color: Colors.brand.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  doctorMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  timeInfo: {
    gap: 12,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDetails: {
    marginLeft: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.secondary,
  },
  actionCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: Colors.ui.shadowStrong,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: Colors.text.inverted,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.brand.primary,
    gap: 8,
    width: '100%',
  },
  secondaryButtonText: {
    color: Colors.brand.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.ui.shadowStrong,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
});

export default AppointmentDetailScreen;