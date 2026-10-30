import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';
import { API_HOST } from '../../config/server';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = API_HOST;

// Font configurations
const Fonts = {
  heading1: {
    fontFamily: 'System',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
  },
  heading2: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 28,
  },
  heading3: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
  },
  titleMedium: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
  },
  buttonPrimary: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonSecondary: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 14,
  },
  caption: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 14,
  },
} as const;

// Color configurations
const Colors = {
  brand: {
    primary: '#5D5FEF',
    primaryLight: '#7B7DF1',
    primaryDark: '#4A4BCC',
  },
  accent: {
    coral: '#FF6B6B',
    teal: '#4ECDC4',
    lavender: '#A78BFA',
    mint: '#81D8D0',
  },
  features: {
    mindfulness: '#FF9A76',
    meditation: '#6A67CE',
    journal: '#4ECDC4',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverted: '#FFFFFF',
  },
  neutrals: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceLow: '#F3F4F6',
    border: '#E5E7EB',
    white: '#FFFFFF',
  },
  ui: {
    overlay: 'rgba(255,255,255,0.1)',
    shadowDark: 'rgba(0,0,0,0.08)',
  },
  gradients: {
    primary: ['#5D5FEF', '#7B7DF1'],
    secondary: ['#FF6B6B', '#FF8E8E'],
    success: ['#10B981', '#34D399'],
  },
};

// Reanimated Animated components
const ReanimatedView = Animated.createAnimatedComponent(View);
const ReanimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const PatientDashboardScreen = ({ navigation, route }) => {
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, total: 0 });

  // Reanimated shared values
  const headerHeight = useSharedValue(250);
  const headerOpacity = useSharedValue(1);
  const scrollY = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  const fadeValue = useSharedValue(0);

  // Ref for scrollview
  const scrollViewRef = useRef<any>(null);

  // Load user data from session
  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('No user data found');
      }

      const userData = JSON.parse(userDataString);
      const currentUserId = userData.id || userData.user_id;
      
      if (!currentUserId) {
        throw new Error('User ID not found');
      }

      setUserId(currentUserId);
      setUserName(userData.full_name || userData.name || userData.username || 'User');
      
      // Load user image if available
      const profileImage = await AsyncStorage.getItem('profileImage');
      if (profileImage) {
        setUserImage(profileImage);
      }

      return currentUserId;
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert(
        'Welcome',
        'Please login to continue',
        [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
      );
      return null;
    }
  };

  // Animated header style
  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      opacity: headerOpacity.value,
      transform: [
        {
          translateY: scrollY.value > 0 ? Math.max(-scrollY.value / 2, -50) : 0,
        },
      ],
    };
  });

  // Animated content style
  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(cardScale.value, { damping: 15 }) },
      ],
      opacity: fadeValue.value,
    };
  });

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUserId = await loadUserData();
      if (!currentUserId) return;

      const response = await fetch(`${API_BASE_URL}/api/my-appointments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ user_id: currentUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || `Request failed`);
      }

      if (data.success) {
        const transformedAppointments = (data.appointments || []).map((appointment, index) => ({
          id: appointment.id.toString(),
          appointment_id: appointment.id,
          doctor_name: appointment.doctor_name || 'Dr. Unknown',
          doctor_specialization: appointment.doctor_specialization || 'Mental Health',
          doctor_image: appointment.doctor_image || `https://i.pravatar.cc/150?img=${index + 1}`,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          status: (appointment.status || 'scheduled').toLowerCase(),
          symptoms: appointment.symptoms || 'Mental health consultation',
          doctor_rating: appointment.doctor_rating || 4.5,
          doctor_experience: appointment.doctor_experience || '5',
          duration: appointment.duration || '45',
          notes: appointment.notes || '',
          doctor_qualification: appointment.doctor_qualification || '',
          created_at: appointment.created_at || new Date().toISOString(),
        }));

        setAppointments(transformedAppointments);
        calculateStats(transformedAppointments);
        
        // Animate in
        fadeValue.value = withTiming(1, { duration: 600 });
        cardScale.value = withSpring(1, { damping: 15 });
      } else {
        throw new Error(data.error || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError(error.message);
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (appointmentsList) => {
    const upcoming = appointmentsList.filter(apt => 
      apt.status === 'scheduled' || apt.status === 'confirmed'
    ).length;
    const completed = appointmentsList.filter(apt => 
      apt.status === 'completed'
    ).length;

    setStats({
      upcoming,
      completed,
      total: appointmentsList.length,
    });
  };

  // Load sample data
  const loadSampleData = () => {
    const sampleAppointments = [
      {
        id: '1',
        appointment_id: 1,
        doctor_name: 'Dr. Sarah Johnson',
        doctor_specialization: 'Clinical Psychologist',
        doctor_image: 'https://i.pravatar.cc/150?img=11',
        appointment_date: '2024-01-20',
        appointment_time: '14:30:00',
        status: 'confirmed',
        symptoms: 'Anxiety and stress management',
        doctor_rating: 4.9,
        doctor_experience: '12',
        duration: '60',
        notes: 'Initial consultation session',
        doctor_qualification: 'PhD in Clinical Psychology',
        created_at: '2024-01-10T10:30:00Z'
      },
      {
        id: '2',
        appointment_id: 2,
        doctor_name: 'Dr. Michael Chen',
        doctor_specialization: 'Psychiatrist',
        doctor_image: 'https://i.pravatar.cc/150?img=22',
        appointment_date: '2024-01-18',
        appointment_time: '11:00:00',
        status: 'scheduled',
        symptoms: 'Depression evaluation',
        doctor_rating: 4.8,
        doctor_experience: '8',
        duration: '45',
        notes: '',
        doctor_qualification: 'MD, Board Certified',
        created_at: '2024-01-09T14:20:00Z'
      },
      {
        id: '3',
        appointment_id: 3,
        doctor_name: 'Dr. Emily Rodriguez',
        doctor_specialization: 'Therapist',
        doctor_image: 'https://i.pravatar.cc/150?img=33',
        appointment_date: '2024-01-15',
        appointment_time: '09:30:00',
        status: 'completed',
        symptoms: 'OCD treatment session',
        doctor_rating: 4.7,
        doctor_experience: '10',
        duration: '50',
        notes: 'Follow-up session completed',
        doctor_qualification: 'MSc in Psychology',
        created_at: '2024-01-08T16:45:00Z'
      },
    ];

    setAppointments(sampleAppointments);
    setUserName('Alex Morgan');
    calculateStats(sampleAppointments);
    
    // Animate in
    fadeValue.value = withTiming(1, { duration: 600 });
    cardScale.value = withSpring(1, { damping: 15 });
  };

  // Initial load
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, []);

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    if (selectedFilter === 'all') return true;
    return appointment.status === selectedFilter;
  });

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === now.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
        });
      }
    } catch (error) {
      return dateString;
    }
  };

  // Format time
  const formatTime = (timeString) => {
    try {
      const time = timeString.includes('T') 
        ? new Date(timeString)
        : new Date(`2000-01-01T${timeString}`);
      
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).replace(' ', '');
    } catch (error) {
      return timeString;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      scheduled: Colors.status.info,
      confirmed: Colors.status.success,
      completed: Colors.brand.primary,
      cancelled: Colors.status.error,
      pending: Colors.text.tertiary,
    };
    return colors[status] || Colors.text.tertiary;
  };

  // Render appointment card
  const renderAppointment = ({ item, index }) => {
    const enteringAnimation = SlideInRight.delay(index * 100).springify().damping(15);
    
    return (
      <ReanimatedView
        entering={enteringAnimation}
        style={styles.appointmentCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.doctorInfo}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.doctor_image }}
                style={styles.doctorImage as any}
                defaultSource={require('../../assets/images/demo.jpg')}
              />
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName} numberOfLines={1}>
                {item.doctor_name}
              </Text>
              <Text style={styles.specialization}>
                {item.doctor_specialization}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color={Colors.accent.coral} />
                <Text style={styles.ratingText}>
                  {item.doctor_rating} • {item.doctor_experience} yrs
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.symptoms} numberOfLines={2}>
            {item.symptoms}
          </Text>

          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <Ionicons name="calendar-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.timeText}>
                {formatDate(item.appointment_date)}
              </Text>
            </View>
            <View style={styles.timeItem}>
              <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
              <Text style={styles.timeText}>
                Session Time : {item.duration} mins
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          {item.status === 'confirmed' || item.status === 'scheduled' ? (
            <>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('VideoCall', { 
                  appointmentId: item.appointment_id,
                  doctorName: item.doctor_name 
                })}
              >
                <LinearGradient
                  colors={Colors.gradients.primary}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="videocam" size={16} color={Colors.text.inverted} />
                  <Text style={styles.primaryButtonText}>Join</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Chat', { 
                  appointmentId: item.appointment_id,
                  doctorName: item.doctor_name 
                })}
              >
                <Ionicons name="chatbubble-outline" size={16} color={Colors.brand.primary} />
                <Text style={styles.secondaryButtonText}>Chat</Text>
              </TouchableOpacity>
            </>
          ) : item.status === 'completed' ? (
            <TouchableOpacity 
              style={styles.completedButton}
              onPress={() => navigation.navigate('AppointmentDetail', { appointment: item })}
            >
              <Ionicons name="document-text-outline" size={16} color={Colors.brand.primary} />
              <Text style={styles.completedButtonText}>View Notes</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ReanimatedView>
    );
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userData');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  // Handle scroll
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    
    // Animate header on scroll
    if (offsetY > 50) {
      headerHeight.value = withTiming(200, { duration: 200 });
      headerOpacity.value = withTiming(0.95, { duration: 200 });
    } else {
      headerHeight.value = withTiming(250, { duration: 200 });
      headerOpacity.value = withTiming(1, { duration: 200 });
    }
  };

  // Render loading
  if (loading && appointments.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>Loading your sessions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <ReanimatedView style={[styles.header, animatedHeaderStyle]}>
        <LinearGradient
          colors={Colors.gradients.primary}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View>
                <Text style={styles.greeting}>Hello,</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.avatarContainer}>
                {userImage ? (
                  <Image source={{ uri: userImage }} style={styles.avatar as any} />
                ) : (
                  <View style={styles.defaultAvatar}>
                    <Text style={styles.avatarText}>
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <ReanimatedView 
              entering={FadeIn.delay(200).duration(400)}
              style={styles.statsContainer}
            >
              <ReanimatedView 
                entering={ZoomIn.delay(300).duration(400)}
                style={styles.statCard}
              >
                <Text style={styles.statNumber}>{stats.upcoming}</Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </ReanimatedView>
              <ReanimatedView 
                entering={ZoomIn.delay(350).duration(400)}
                style={styles.statCard}
              >
                <Text style={styles.statNumber}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </ReanimatedView>
              <ReanimatedView 
                entering={ZoomIn.delay(400).duration(400)}
                style={styles.statCard}
              >
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </ReanimatedView>
            </ReanimatedView>
          </View>
        </LinearGradient>
      </ReanimatedView>

      {/* Main Content */}
      <ReanimatedView style={[styles.contentContainer, animatedContentStyle]}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Filter Tabs */}
          <View style={styles.filterSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((filter, index) => (
                <ReanimatedTouchableOpacity
                  key={filter}
                  entering={SlideInRight.delay(index * 50).duration(300)}
                  style={[
                    styles.filterPill,
                    selectedFilter === filter && styles.filterPillActive
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive
                  ]}>
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </ReanimatedTouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Appointments List */}
          <View style={styles.listSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Sessions</Text>
              <Text style={styles.sectionCount}>
                {filteredAppointments.length} {filteredAppointments.length === 1 ? 'session' : 'sessions'}
              </Text>
            </View>

            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((item, index) => (
                <View key={item.id}>
                  {renderAppointment({ item, index })}
                </View>
              ))
            ) : (
              <ReanimatedView 
                entering={FadeIn.duration(600)}
                style={styles.emptyState}
              >
                <Ionicons name="calendar-outline" size={64} color={Colors.text.tertiary} />
                <Text style={styles.emptyTitle}>No sessions found</Text>
                <Text style={styles.emptyText}>
                  {selectedFilter === 'all' 
                    ? "Start your mental wellness journey" 
                    : `No ${selectedFilter} sessions`
                  }
                </Text>
                {/* <TouchableOpacity 
                  style={styles.findButton}
                  onPress={() => navigation.navigate('SearchTherapists')}
                >
                  <LinearGradient
                    colors={Colors.gradients.primary}
                    style={styles.findButtonGradient}
                  >
                    <Ionicons name="search" size={18} color={Colors.text.inverted} />
                    <Text style={styles.findButtonText}>Find Therapists</Text>
                  </LinearGradient>
                </TouchableOpacity> */}
              </ReanimatedView>
            )}
          </View>
        </ScrollView>
      </ReanimatedView>

      {/* Floating Action Button */}
      {/* <ReanimatedView 
        entering={ZoomIn.delay(500).duration(600).springify()}
        style={styles.fabContainer}
      >
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('SearchTherapists')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={Colors.gradients.primary}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={24} color={Colors.text.inverted} />
          </LinearGradient>
        </TouchableOpacity>
      </ReanimatedView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutrals.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.background,
  },
  loadingText: {
    ...Fonts.bodyMedium,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  headerGradient: {
    height: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  contentContainer: {
    flex: 1,
    marginTop: 250,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    ...Fonts.bodyMedium,
    color: Colors.text.inverted,
    opacity: 0.9,
  },
  userName: {
    ...Fonts.heading2,
    color: Colors.text.inverted,
    marginTop: 2,
    fontSize: 24,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.text.inverted,
    ...Fonts.heading3,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: -10,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...Fonts.heading1,
    color: Colors.text.inverted,
    marginBottom: 4,
    fontSize: 26,
  },
  statLabel: {
    ...Fonts.caption,
    color: Colors.text.inverted,
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterSection: {
    marginTop: 10,
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: Colors.neutrals.surface,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
  },
  filterPillActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  filterText: {
    ...Fonts.bodySmall,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.text.inverted,
  },
  listSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    ...Fonts.heading3,
    color: Colors.text.primary,
  },
  sectionCount: {
    ...Fonts.bodySmall,
    color: Colors.text.tertiary,
  },
  appointmentCard: {
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.neutrals.border,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    ...Fonts.titleMedium,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
    fontSize: 15,
  },
  specialization: {
    ...Fonts.caption,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...Fonts.caption,
    color: Colors.text.tertiary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: Colors.text.inverted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardBody: {
    marginBottom: 16,
  },
  symptoms: {
    ...Fonts.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  timeContainer: {
    backgroundColor: Colors.neutrals.surfaceLow,
    borderRadius: 12,
    padding: 12,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    ...Fonts.bodySmall,
    color: Colors.text.secondary,
    marginLeft: 8,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    ...Fonts.buttonPrimary,
    color: Colors.text.inverted,
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
    borderRadius: 12,
    backgroundColor: Colors.neutrals.surface,
  },
  secondaryButtonText: {
    ...Fonts.buttonSecondary,
    color: Colors.brand.primary,
    marginLeft: 6,
  },
  completedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
    borderRadius: 12,
    backgroundColor: Colors.neutrals.surface,
  },
  completedButtonText: {
    ...Fonts.buttonSecondary,
    color: Colors.brand.primary,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...Fonts.heading3,
    color: Colors.text.secondary,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    ...Fonts.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  findButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 240,
  },
  findButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  findButtonText: {
    ...Fonts.buttonPrimary,
    marginLeft: 10,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    zIndex: 1000,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PatientDashboardScreen;