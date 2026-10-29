import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../assets/colors';

const { width, height } = Dimensions.get('window');

const moodData = [
  { id: 1, emoji: '😢', label: 'Awful', color: '#FF6B6B', gradient: ['#FF6B6B', '#FF8E8E'] },
  { id: 2, emoji: '😞', label: 'Bad', color: '#FFA726', gradient: ['#FFA726', '#FFB74D'] },
  { id: 3, emoji: '😐', label: 'Okay', color: '#FFD54F', gradient: ['#FFD54F', '#FFE082'] },
  { id: 4, emoji: '😊', label: 'Good', color: '#4CD964', gradient: ['#4CD964', '#5FE38E'] },
  { id: 5, emoji: '😄', label: 'Great', color: '#5AC8FA', gradient: ['#5AC8FA', '#7BD4FF'] },
  { id: 6, emoji: '🤩', label: 'Amazing', color: '#AF52DE', gradient: ['#AF52DE', '#C585F3'] },
];

const activities = [
  { id: 1, icon: '🏃‍♂️', label: 'Exercise', selected: false },
  { id: 2, icon: '📖', label: 'Reading', selected: false },
  { id: 3, icon: '🎵', label: 'Music', selected: false },
  { id: 4, icon: '🧘‍♀️', label: 'Meditation', selected: false },
  { id: 5, icon: '👥', label: 'Social', selected: false },
  { id: 6, icon: '🎮', label: 'Gaming', selected: false },
  { id: 7, icon: '🍳', label: 'Cooking', selected: false },
  { id: 8, icon: '🌳', label: 'Nature', selected: false },
];

export default function MoodTracker({ navigation }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [note, setNote] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const moodScaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  useEffect(() => {
    animateProgress();
  }, [currentStep]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(moodScaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateProgress = () => {
    Animated.timing(progressAnim, {
      toValue: (currentStep - 1) / 2,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    Animated.sequence([
      Animated.timing(moodScaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(moodScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto-advance after mood selection
    setTimeout(() => setCurrentStep(2), 500);
  };

  const handleActivityToggle = (activity) => {
    setSelectedActivities(prev => {
      if (prev.includes(activity.id)) {
        return prev.filter(id => id !== activity.id);
      } else {
        return [...prev, activity.id];
      }
    });
  };

  const handleSaveMood = () => {
    // Save logic here
    setCurrentStep(3);
    
    // Celebration animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0%', '50%', '100%'],
  });

  const renderStep1 = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }
      ]}
    >
      <Text style={styles.stepTitle}>How are you feeling today?</Text>
      <Text style={styles.stepSubtitle}>Select your current mood</Text>
      
      <View style={styles.moodGrid}>
        {moodData.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            onPress={() => handleMoodSelect(mood)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.moodItem,
                selectedMood?.id === mood.id && styles.moodItemSelected,
                {
                  transform: [
                    { scale: selectedMood?.id === mood.id ? moodScaleAnim : 1 }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={mood.gradient}
                style={styles.moodGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        { opacity: currentStep >= 2 ? 1 : 0, transform: [{ translateY: currentStep >= 2 ? 0 : 20 }] }
      ]}
    >
      <Text style={styles.stepTitle}>What have you been doing?</Text>
      <Text style={styles.stepSubtitle}>Select activities that influenced your mood</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.activitiesContainer}
      >
        {activities.map((activity) => (
          <TouchableOpacity
            key={activity.id}
            onPress={() => handleActivityToggle(activity)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedActivities.includes(activity.id) ? ['#667eea', '#764ba2'] : ['#f8f9fa', '#e9ecef']}
              style={[
                styles.activityItem,
                selectedActivities.includes(activity.id) && styles.activityItemSelected
              ]}
            >
              <Text style={[
                styles.activityIcon,
                { color: selectedActivities.includes(activity.id) ? '#fff' : Colors.text.secondary }
              ]}>
                {activity.icon}
              </Text>
              <Text style={[
                styles.activityLabel,
                { color: selectedActivities.includes(activity.id) ? '#fff' : Colors.text.primary }
              ]}>
                {activity.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.nextButton}
        onPress={() => setCurrentStep(3)}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        { opacity: currentStep >= 3 ? 1 : 0, transform: [{ translateY: currentStep >= 3 ? 0 : 20 }] }
      ]}
    >
      <Text style={styles.stepTitle}>Add a note</Text>
      <Text style={styles.stepSubtitle}>Share what's on your mind (optional)</Text>
      
      <View style={styles.noteContainer}>
        <Text style={styles.notePlaceholder}>Write about your day...</Text>
      </View>

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSaveMood}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.saveGradient}
        >
          <Ionicons name="checkmark" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Save Mood Entry</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCompletion = () => (
    <Animated.View 
      style={[
        styles.completionContainer,
        { opacity: currentStep === 3 ? fadeAnim : 0, transform: [{ scale: scaleAnim }] }
      ]}
    >
      <LinearGradient
        colors={selectedMood?.gradient || ['#667eea', '#764ba2']}
        style={styles.completionCircle}
      >
        <Text style={styles.completionEmoji}>{selectedMood?.emoji}</Text>
      </LinearGradient>
      <Text style={styles.completionTitle}>Mood Recorded!</Text>
      <Text style={styles.completionSubtitle}>Your {selectedMood?.label.toLowerCase()} mood has been saved</Text>
      
      <TouchableOpacity 
        style={styles.doneButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutrals.background} />
      
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={styles.container}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mood Tracker</Text>
          <TouchableOpacity style={styles.statsButton}>
            <Ionicons name="stats-chart" size={20} color={Colors.brand.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of 3</Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {currentStep < 3 ? (
            <>
              {renderStep1()}
              {renderStep2()}
              {renderStep3()}
            </>
          ) : (
            renderCompletion()
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutrals.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statsButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: Colors.brand.primary + '10',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.neutrals.border,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.brand.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -5,
  },
  moodItem: {
    width: (width - 60) / 3,
    margin: 5,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moodItemSelected: {
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  moodGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  activitiesContainer: {
    paddingVertical: 10,
  },
  activityItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItemSelected: {
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  activityIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  noteContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    minHeight: 120,
    marginVertical: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  notePlaceholder: {
    color: Colors.text.tertiary,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  completionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  completionCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  completionEmoji: {
    fontSize: 48,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  doneButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});