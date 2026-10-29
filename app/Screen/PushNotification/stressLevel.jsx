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
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../assets/colors';

const { width, height } = Dimensions.get('window');

const stressLevels = [
  { level: 1, label: 'Very Low', color: '#4CD964', emoji: '😊', description: 'Completely relaxed' },
  { level: 2, label: 'Low', color: '#5AC8FA', emoji: '🙂', description: 'Mostly calm' },
  { level: 3, label: 'Moderate', color: '#FFD54F', emoji: '😐', description: 'Some tension' },
  { level: 4, label: 'High', color: '#FFA726', emoji: '😟', description: 'Feeling stressed' },
  { level: 5, label: 'Very High', color: '#FF6B6B', emoji: '😰', description: 'Overwhelmed' },
  { level: 6, label: 'Extreme', color: '#FF3B30', emoji: '😵', description: 'Critical stress' },
];

const stressTriggers = [
  { id: 1, icon: '💼', label: 'Work', selected: false },
  { id: 2, icon: '👥', label: 'Relationships', selected: false },
  { id: 3, icon: '💰', label: 'Financial', selected: false },
  { id: 4, icon: '🏥', label: 'Health', selected: false },
  { id: 5, icon: '⏰', label: 'Time Pressure', selected: false },
  { id: 6, icon: '🏠', label: 'Family', selected: false },
  { id: 7, icon: '📚', label: 'Studies', selected: false },
  { id: 8, icon: '🌧️', label: 'Environment', selected: false },
];

const copingStrategies = [
  { id: 1, icon: '🧘‍♀️', label: 'Deep Breathing', duration: '5 min' },
  { id: 2, icon: '🚶‍♂️', label: 'Walk', duration: '10 min' },
  { id: 3, icon: '🎵', label: 'Music', duration: '15 min' },
  { id: 4, icon: '📖', label: 'Reading', duration: '20 min' },
  { id: 5, icon: '💭', label: 'Meditation', duration: '10 min' },
  { id: 6, icon: '✍️', label: 'Journaling', duration: '15 min' },
];

export default function StressTracker({ navigation }) {
  const [stressLevel, setStressLevel] = useState(3);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sliderAnim = useRef(new Animated.Value(stressLevel)).current;

  // Pan responder for slider
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newLevel = Math.max(1, Math.min(6, 
          Math.round((gestureState.moveX - 40) / ((width - 80) / 6))
        ));
        setStressLevel(newLevel);
        Animated.spring(sliderAnim, {
          toValue: newLevel,
          friction: 5,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    startAnimations();
  }, []);

  useEffect(() => {
    animateProgress();
    if (currentStep === 3) {
      startPulseAnimation();
    }
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
    ]).start();
  };

  const animateProgress = () => {
    Animated.timing(progressAnim, {
      toValue: (currentStep - 1) / 2,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleStressSelect = (level) => {
    setStressLevel(level);
    Animated.spring(sliderAnim, {
      toValue: level,
      friction: 5,
      useNativeDriver: true,
    }).start();
    
    // Pulse feedback
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTriggerToggle = (trigger) => {
    setSelectedTriggers(prev => {
      if (prev.includes(trigger.id)) {
        return prev.filter(id => id !== trigger.id);
      } else {
        return [...prev, trigger.id];
      }
    });
  };

  const handleSaveStress = () => {
    setShowRecommendations(true);
    setCurrentStep(4);
  };

  const getStressColor = () => {
    return stressLevels.find(level => level.level === stressLevel)?.color || Colors.brand.primary;
  };

  const getStressDescription = () => {
    return stressLevels.find(level => level.level === stressLevel)?.description || '';
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: ['0%', '33%', '66%', '100%'],
  });

  const sliderPosition = sliderAnim.interpolate({
    inputRange: [1, 6],
    outputRange: [0, width - 120],
  });

  const renderStep1 = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }
      ]}
    >
      <Text style={styles.stepTitle}>How stressed are you feeling?</Text>
      <Text style={styles.stepSubtitle}>Slide to select your current stress level</Text>
      
      {/* Stress Level Indicator */}
      <Animated.View 
        style={[
          styles.stressIndicator,
          { 
            backgroundColor: getStressColor() + '20',
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <Text style={[styles.stressLevelText, { color: getStressColor() }]}>
          Level {stressLevel}
        </Text>
        <Text style={styles.stressDescription}>{getStressDescription()}</Text>
      </Animated.View>

      {/* Stress Scale */}
      <View style={styles.scaleContainer} {...panResponder.panHandlers}>
        <View style={styles.scaleTrack}>
          <LinearGradient
            colors={['#4CD964', '#FFD54F', '#FF6B6B']}
            style={styles.scaleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Animated.View 
            style={[
              styles.sliderThumb,
              { 
                backgroundColor: getStressColor(),
                left: sliderPosition
              }
            ]}
          >
            <Text style={styles.sliderEmoji}>
              {stressLevels.find(level => level.level === stressLevel)?.emoji}
            </Text>
          </Animated.View>
        </View>
        
        <View style={styles.scaleLabels}>
          {stressLevels.map(level => (
            <TouchableOpacity
              key={level.level}
              onPress={() => handleStressSelect(level.level)}
              style={styles.scaleLabel}
            >
              <Text style={[
                styles.scaleLabelText,
                stressLevel === level.level && { color: level.color, fontWeight: '700' }
              ]}>
                {level.level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.nextButton, { backgroundColor: getStressColor() }]}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        { opacity: currentStep >= 2 ? 1 : 0, transform: [{ translateY: currentStep >= 2 ? 0 : 20 }] }
      ]}
    >
      <Text style={styles.stepTitle}>What's causing your stress?</Text>
      <Text style={styles.stepSubtitle}>Select relevant triggers (optional)</Text>
      
      <View style={styles.triggersGrid}>
        {stressTriggers.map(trigger => (
          <TouchableOpacity
            key={trigger.id}
            onPress={() => handleTriggerToggle(trigger)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selectedTriggers.includes(trigger.id) ? [getStressColor(), getStressColor() + 'CC'] : ['#f8f9fa', '#e9ecef']}
              style={[
                styles.triggerItem,
                selectedTriggers.includes(trigger.id) && styles.triggerItemSelected
              ]}
            >
              <Text style={[
                styles.triggerIcon,
                { color: selectedTriggers.includes(trigger.id) ? '#fff' : Colors.text.secondary }
              ]}>
                {trigger.icon}
              </Text>
              <Text style={[
                styles.triggerLabel,
                { color: selectedTriggers.includes(trigger.id) ? '#fff' : Colors.text.primary }
              ]}>
                {trigger.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.nextButton, { backgroundColor: getStressColor() }]}
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
      <Text style={styles.stepTitle}>How are you coping?</Text>
      <Text style={styles.stepSubtitle}>Share your current coping methods</Text>
      
      <View style={styles.copingContainer}>
        <Text style={styles.copingPlaceholder}>
          What helps you manage stress right now?{'\n'}
          (e.g., "Taking deep breaths", "Going for a walk")
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: getStressColor() }]}
        onPress={handleSaveStress}
      >
        <Ionicons name="checkmark" size={24} color="#fff" />
        <Text style={styles.saveButtonText}>Save Stress Entry</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderRecommendations = () => (
    <Animated.View 
      style={[
        styles.recommendationsContainer,
        { opacity: showRecommendations ? fadeAnim : 0, transform: [{ scale: scaleAnim }] }
      ]}
    >
      <LinearGradient
        colors={[getStressColor(), getStressColor() + 'CC']}
        style={styles.resultHeader}
      >
        <Text style={styles.resultEmoji}>
          {stressLevels.find(level => level.level === stressLevel)?.emoji}
        </Text>
        <Text style={styles.resultTitle}>Stress Level: {stressLevel}/6</Text>
        <Text style={styles.resultSubtitle}>{getStressDescription()}</Text>
      </LinearGradient>

      <View style={styles.recommendationsContent}>
        <Text style={styles.sectionTitle}>Recommended Strategies</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.strategiesScroll}
        >
          {copingStrategies.map(strategy => (
            <View key={strategy.id} style={styles.strategyCard}>
              <Text style={styles.strategyIcon}>{strategy.icon}</Text>
              <Text style={styles.strategyLabel}>{strategy.label}</Text>
              <Text style={styles.strategyDuration}>{strategy.duration}</Text>
              <TouchableOpacity style={[styles.startButton, { backgroundColor: getStressColor() }]}>
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Stress Insights</Text>
          <View style={styles.insightItem}>
            <Ionicons name="trending-up" size={20} color={getStressColor()} />
            <Text style={styles.insightText}>
              {stressLevel >= 4 ? 'High stress detected' : 'Moderate stress level'}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="time" size={20} color={getStressColor()} />
            <Text style={styles.insightText}>
              Recommended break: {stressLevel >= 4 ? '15-20 minutes' : '5-10 minutes'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.doneButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.doneButtonText}>Finish</Text>
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
          <Text style={styles.headerTitle}>Stress Level</Text>
          <TouchableOpacity style={styles.historyButton}>
            <Ionicons name="calendar" size={20} color={Colors.brand.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Bar */}
        {!showRecommendations && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[
                  styles.progressFill,
                  { 
                    width: progressWidth,
                    backgroundColor: getStressColor()
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>Step {currentStep} of 3</Text>
          </View>
        )}

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {!showRecommendations ? (
            <>
              {renderStep1()}
              {renderStep2()}
              {renderStep3()}
            </>
          ) : (
            renderRecommendations()
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
  historyButton: {
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
  stressIndicator: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  stressLevelText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 5,
  },
  stressDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  scaleContainer: {
    marginBottom: 40,
  },
  scaleTrack: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  scaleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: -16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sliderEmoji: {
    fontSize: 18,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  scaleLabel: {
    padding: 5,
  },
  scaleLabelText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  triggersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -5,
    marginBottom: 30,
  },
  triggerItem: {
    width: (width - 60) / 2,
    margin: 5,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  triggerItemSelected: {
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  triggerIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  triggerLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  copingContainer: {
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
  copingPlaceholder: {
    color: Colors.text.tertiary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
    shadowColor: Colors.ui.shadowDark,
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    alignSelf: 'center',
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  recommendationsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  resultHeader: {
    padding: 30,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  resultSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  recommendationsContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  strategiesScroll: {
    marginBottom: 25,
  },
  strategyCard: {
    width: 160,
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  strategyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  strategyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  strategyDuration: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 10,
  },
  startButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  insightsContainer: {
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 15,
    padding: 15,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 10,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: Colors.brand.primary,
    margin: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});