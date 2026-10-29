import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {Colors} from "../../assets/colors";

const { width } = Dimensions.get('window');

const DoctorDashboardScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  const loadDashboard = async () => {
    try {
      setRefreshing(true);
      // Simulate API calls with dummy data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dummyDoctor = {
        user: { full_name: 'Rehan Rahim' },
        specialization: 'Cardiologist',
        experience: 12,
        total_appointments: 1247,
        rating: 4.9,
        today_appointments: 8
      };

      const dummyAppointments = [
        {
          id: '1',
          patient_name: 'John Smith',
          appointment_date: '2024-01-15',
          appointment_time: '14:30',
          status: 'confirmed',
          symptoms: 'Chest pain consultation and follow up for previous heart condition',
          patient_age: 45,
          patient_gender: 'Male'
        },
        {
          id: '2',
          patient_name: 'Emma Wilson',
          appointment_date: '2024-01-15',
          appointment_time: '15:30',
          status: 'scheduled',
          symptoms: 'Heart palpitations and dizziness during exercise',
          patient_age: 32,
          patient_gender: 'Female'
        },
        {
          id: '3',
          patient_name: 'Robert Brown',
          appointment_date: '2024-01-15',
          appointment_time: '16:30',
          status: 'completed',
          symptoms: 'Follow-up consultation after bypass surgery',
          patient_age: 58,
          patient_gender: 'Male'
        },
        {
          id: '4',
          patient_name: 'Lisa Anderson',
          appointment_date: '2024-01-16',
          appointment_time: '10:00',
          status: 'confirmed',
          symptoms: 'Regular blood pressure check and medication review',
          patient_age: 29,
          patient_gender: 'Female'
        },
        {
          id: '5',
          patient_name: 'Mike Davis',
          appointment_date: '2024-01-16',
          appointment_time: '11:30',
          status: 'scheduled',
          symptoms: 'Annual heart health checkup and stress test',
          patient_age: 52,
          patient_gender: 'Male'
        }
      ];

      setDoctor(dummyDoctor);
      setAppointments(dummyAppointments);
      
      // Animate content in
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
        })
      ]).start();
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    loadDashboard();
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      Alert.alert('Success', `Appointment ${status}`);
      loadDashboard(); // Refresh data
    } catch (error) {
      Alert.alert('Error', 'Failed to update appointment');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (selectedFilter === 'all') return true;
    return appointment.status === selectedFilter;
  });

  const renderAppointment = ({ item, index }) => (
    <Animated.View
      style={[
        styles.appointmentCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim.interpolate({
              inputRange: [0, 30],
              outputRange: [0, index * 10]
            })}
          ]
        }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.patient_name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{item.patient_name}</Text>
            <Text style={styles.patientMeta}>
              {item.patient_age}y • {item.patient_gender}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.symptoms} numberOfLines={2}>
        {item.symptoms}
      </Text>

      <View style={styles.timeInfo}>
        <Ionicons name="calendar-outline" size={16} color={Colors.brand.primary} />
        <Text style={styles.dateTime}>
          {new Date(item.appointment_date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
        <Ionicons name="time-outline" size={16} color={Colors.brand.primary} style={styles.timeIcon} />
        <Text style={styles.dateTime}>
          {formatTime(item.appointment_time)}
        </Text>
      </View>

      <View style={styles.actionContainer}>
        {item.status === 'scheduled' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => updateAppointmentStatus(item.id, 'confirmed')}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => updateAppointmentStatus(item.id, 'cancelled')}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === 'confirmed' && canJoinCall(item) && (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => navigation.navigate('VideoCall', { appointmentId: item.id })}
          >
            <LinearGradient
              colors={[Colors.brand.primary, Colors.brand.secondary]}
              style={styles.joinButtonGradient}
            >
              <Ionicons name="videocam" size={18} color="#fff" />
              <Text style={styles.joinButtonText}>Join Call</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {item.status === 'completed' && (
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
          >
            <Ionicons name="document-text" size={16} color="#6366F1" />
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const canJoinCall = (appointment) => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();
    const timeDiff = (appointmentDateTime - now) / (1000 * 60); // difference in minutes
    return timeDiff <= 30 && timeDiff >= -120; // 30 minutes before to 2 hours after
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#F59E0B',
      confirmed: '#10B981',
      completed: Colors.brand.primary,
      cancelled: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  // Filter Tabs Component
  const renderFilterTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterScrollView}
      contentContainerStyle={styles.filterContent}
    >
      {[
        { key: 'all', label: 'All', icon: 'apps' },
        { key: 'scheduled', label: 'Scheduled', icon: 'time' },
        { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
        { key: 'completed', label: 'Completed', icon: 'checkmark-done' }
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterTab,
            selectedFilter === filter.key && styles.filterTabActive
          ]}
          onPress={() => setSelectedFilter(filter.key)}
        >
          <Ionicons 
            name={filter.icon} 
            size={16} 
            color={selectedFilter === filter.key ? '#fff' : Colors.brand.primary} 
          />
          <Text style={[
            styles.filterText,
            selectedFilter === filter.key && styles.filterTextActive
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.brand.primary, Colors.brand.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.doctorInfo}>
            <View style={styles.avatarLarge}>
              <Ionicons name="medical" size={32} color={Colors.brand.primary} />
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>Dr. {doctor?.user?.full_name}</Text>
              <Text style={styles.specialization}>{doctor?.specialization}</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{doctor?.rating} • {doctor?.experience} years exp</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        {renderFilterTabs()}
      </View>

      {/* Appointments List */}
      <FlatList
        data={filteredAppointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.brand.primary]}
            tintColor={Colors.brand.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyText}>No appointments found</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'all' 
                ? "You don't have any appointments scheduled" 
                : `No ${selectedFilter} appointments`
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 6,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#E2E8F0',
    fontSize: 14,
    marginLeft: 4,
  },
  filterSection: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.primary,
    marginLeft: 6,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 10,
    marginBottom: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  patientMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  symptoms: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 20,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  timeIcon: {
    marginLeft: 16,
  },
  dateTime: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 5,
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  joinButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 5,
  },
  detailsButtonText: {
    color: Colors.brand.primary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default DoctorDashboardScreen;