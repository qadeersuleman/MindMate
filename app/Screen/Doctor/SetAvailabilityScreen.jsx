import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { appointmentAPI } from '../services/api';

const { width } = Dimensions.get('window');

const DAYS = [
  { id: 0, name: 'Monday', short: 'MON' },
  { id: 1, name: 'Tuesday', short: 'TUE' },
  { id: 2, name: 'Wednesday', short: 'WED' },
  { id: 3, name: 'Thursday', short: 'THU' },
  { id: 4, name: 'Friday', short: 'FRI' },
  { id: 5, name: 'Saturday', short: 'SAT' },
  { id: 6, name: 'Sunday', short: 'SUN' },
];

const SetAvailabilityScreen = ({ navigation }) => {
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const dayScaleAnim = useState(new Animated.Value(0.9))[0];

  // Dummy data for demonstration
  const loadAvailabilities = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dummyAvailabilities = [
        {
          id: '1',
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00'
        },
        {
          id: '2',
          day_of_week: 2,
          start_time: '09:00',
          end_time: '17:00'
        },
        {
          id: '3',
          day_of_week: 3,
          start_time: '09:00',
          end_time: '17:00'
        },
        {
          id: '4',
          day_of_week: 4,
          start_time: '09:00',
          end_time: '17:00'
        },
        {
          id: '5',
          day_of_week: 5,
          start_time: '10:00',
          end_time: '14:00'
        }
      ];

      setAvailabilities(dummyAvailabilities);
      
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
      console.error('Error loading availabilities:', error);
    }
  };

  useEffect(() => {
    loadAvailabilities();
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeForAPI = (date) => {
    return date.toTimeString().split(' ')[0].substring(0, 5);
  };

  const addAvailability = async () => {
    if (startTime >= endTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // await appointmentAPI.setAvailability({
      //   day_of_week: selectedDay,
      //   start_time: formatTimeForAPI(startTime),
      //   end_time: formatTimeForAPI(endTime),
      // });
      
      Alert.alert('Success', 'Availability added successfully');
      loadAvailabilities();
    } catch (error) {
      Alert.alert('Error', 'Failed to add availability');
      console.error('Add availability error:', error);
    }
  };

  const removeAvailability = async (id) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      // await appointmentAPI.deleteAvailability(id);
      
      Alert.alert('Success', 'Availability removed');
      loadAvailabilities();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove availability');
    }
  };

  const handleDaySelect = (dayId) => {
    setSelectedDay(dayId);
    // Animate day selection
    Animated.spring(dayScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const renderAvailability = ({ item, index }) => (
    <Animated.View
      style={[
        styles.availabilityCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { 
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1]
              })
            }
          ]
        }
      ]}
    >
      <View style={styles.availabilityContent}>
        <View style={styles.dayIndicator}>
          <Text style={styles.dayName}>
            {DAYS.find(day => day.id === item.day_of_week)?.name}
          </Text>
        </View>
        
        <View style={styles.timeSlot}>
          <View style={styles.timeItem}>
            <Ionicons name="time-outline" size={16} color="#6366F1" />
            <Text style={styles.timeText}>{item.start_time}</Text>
          </View>
          <Text style={styles.timeSeparator}>-</Text>
          <View style={styles.timeItem}>
            <Ionicons name="time-outline" size={16} color="#6366F1" />
            <Text style={styles.timeText}>{item.end_time}</Text>
          </View>
        </View>

        <View style={styles.duration}>
          <Text style={styles.durationText}>
            {calculateDuration(item.start_time, item.end_time)}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeAvailability(item.id)}
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
      </TouchableOpacity>
    </Animated.View>
  );

  const calculateDuration = (start, end) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    const duration = endTotal - startTotal;
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const renderDayButton = (day) => (
    <TouchableOpacity
      key={day.id}
      onPress={() => handleDaySelect(day.id)}
    >
      <Animated.View
        style={[
          styles.dayButton,
          selectedDay === day.id && styles.dayButtonSelected,
          {
            transform: [
              {
                scale: selectedDay === day.id ? dayScaleAnim : 1
              }
            ]
          }
        ]}
      >
        <Text style={[
          styles.dayButtonShort,
          selectedDay === day.id && styles.dayButtonShortSelected
        ]}>
          {day.short}
        </Text>
        <Text style={[
          styles.dayButtonName,
          selectedDay === day.id && styles.dayButtonNameSelected
        ]}>
          {day.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Availability</Text>
          <Text style={styles.headerSubtitle}>
            Manage your working hours and availability
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Day Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Day</Text>
          <View style={styles.daysContainer}>
            {DAYS.map(renderDayButton)}
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set Time Slot</Text>
          
          <View style={styles.timeSelection}>
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setShowStartPicker(true)}
              >
                <LinearGradient
                  colors={['#F8FAFC', '#F1F5F9']}
                  style={styles.timeButtonGradient}
                >
                  <Ionicons name="play" size={20} color="#10B981" />
                  <Text style={styles.timeButtonText}>{formatTime(startTime)}</Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.timeInputContainer}>
              <Text style={styles.timeLabel}>End Time</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setShowEndPicker(true)}
              >
                <LinearGradient
                  colors={['#F8FAFC', '#F1F5F9']}
                  style={styles.timeButtonGradient}
                >
                  <Ionicons name="stop" size={20} color="#EF4444" />
                  <Text style={styles.timeButtonText}>{formatTime(endTime)}</Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={addAvailability}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Time Slot</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Current Availability */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Availability</Text>
            <Text style={styles.sectionSubtitle}>
              {availabilities.length} time slots configured
            </Text>
          </View>

          {availabilities.length > 0 ? (
            <FlatList
              data={availabilities}
              renderItem={renderAvailability}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color="#E2E8F0" />
              <Text style={styles.emptyTitle}>No availability set</Text>
              <Text style={styles.emptySubtitle}>
                Add your working hours to start receiving appointments
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* DateTime Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="spinner"
          onChange={(event, selectedTime) => {
            setShowStartPicker(false);
            if (selectedTime) setStartTime(selectedTime);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="spinner"
          onChange={(event, selectedTime) => {
            setShowEndPicker(false);
            if (selectedTime) setEndTime(selectedTime);
          }}
        />
      )}
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    minWidth: 60,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  dayButtonShort: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 2,
  },
  dayButtonShortSelected: {
    color: '#fff',
  },
  dayButtonName: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  dayButtonNameSelected: {
    color: '#E2E8F0',
  },
  timeSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  timeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  timeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  availabilityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  availabilityContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayIndicator: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  dayName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 4,
  },
  timeSeparator: {
    fontSize: 14,
    color: '#64748B',
    marginHorizontal: 8,
  },
  duration: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SetAvailabilityScreen;