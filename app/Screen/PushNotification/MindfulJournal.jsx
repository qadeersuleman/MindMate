import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Easing,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const MindfulJournal = () => {
  // States
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showMoodAnalysis, setShowMoodAnalysis] = useState(false);
  const [aiInsights] = useState([
    "Your writing shows mindfulness. Keep exploring your inner thoughts.",
    "Regular journaling can reduce stress. Great job maintaining consistency!",
    "Try focusing on solution-oriented thoughts in tomorrow's entry."
  ]);
  const [entryHistory, setEntryHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState(null);
  
  // Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Mood options
  const moods = [
    { id: 1, emoji: '😢', label: 'Sad', color: '#6B73FF', intensity: 1 },
    { id: 2, emoji: '😔', label: 'Low', color: '#7B8CDE', intensity: 2 },
    { id: 3, emoji: '😐', label: 'Neutral', color: '#4ECDC4', intensity: 3 },
    { id: 4, emoji: '😊', label: 'Happy', color: '#FFD166', intensity: 4 },
    { id: 5, emoji: '😄', label: 'Excited', color: '#FF6B6B', intensity: 5 },
    { id: 6, emoji: '😌', label: 'Calm', color: '#96CEB4', intensity: 4 },
  ];

  // Quick actions
  const quickActions = [
    { 
      id: 'breathe', 
      icon: 'wind', 
      label: 'Breathe', 
      colors: ['#FFD166', '#FF6B6B'],
      action: () => {
        setActiveQuickAction('breathe');
        setShowBreathingModal(true);
      }
    },
    { 
      id: 'sleep', 
      icon: 'moon', 
      label: 'Sleep', 
      colors: ['#4ECDC4', '#96CEB4'],
      action: () => {
        setActiveQuickAction('sleep');
        Alert.alert(
          'Sleep Guide',
          'Try this: Lie down comfortably, close your eyes, and focus on relaxing each part of your body from head to toe.',
          [{ text: 'OK' }]
        );
      }
    },
    { 
      id: 'progress', 
      icon: 'trending-up', 
      label: 'Progress', 
      colors: ['#6B73FF', '#9D50EA'],
      action: () => {
        setActiveQuickAction('progress');
        Alert.alert(
          'Your Progress',
          `📊 Journal Stats:\n\n📝 Entries: ${entryHistory.length}\n📖 Words: ${entryHistory.reduce((acc, entry) => acc + (entry.wordCount || 0), 0)}\n🌟 Positive Days: ${entryHistory.filter(e => e.mood && moods.find(m => m.id === e.mood)?.intensity >= 4).length}`,
          [{ text: 'Continue' }]
        );
      }
    }
  ];

  // Prompts
  const prompts = [
    "What are you grateful for today?",
    "What's weighing on your mind?",
    "What would make today better?",
    "How are you really feeling?",
    "What made you smile today?"
  ];
  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);

  useEffect(() => {
    animateIn();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleSaveEntry = () => {
    if (!currentEntry.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Save entry
    const newEntry = {
      id: Date.now(),
      content: currentEntry,
      mood: selectedMood,
      timestamp: new Date().toISOString(),
      wordCount: currentEntry.split(/\s+/).filter(word => word.length > 0).length
    };

    setEntryHistory(prev => [newEntry, ...prev]);

    // Success alert
    Alert.alert(
      '✨ Entry Saved!',
      'Your reflection has been saved successfully.',
      [
        {
          text: 'Take a Breath',
          onPress: () => {
            setShowBreathingModal(true);
          }
        },
        {
          text: 'Continue',
          style: 'cancel',
          onPress: resetForm
        }
      ]
    );
  };

  const resetForm = () => {
    setCurrentEntry('');
    setSelectedMood(null);
    setIsTyping(false);
  };

  const refreshPrompt = () => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setCurrentPrompt(prompts[randomIndex]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Breathing Modal Component - Simplified version
  const BreathingModal = React.memo(() => {
    const [breathingPhase, setBreathingPhase] = useState('inhale');
    const breathAnim = useRef(new Animated.Value(1)).current;
    const animationRef = useRef(null);
    const timerRef = useRef(null);

    const breathingPhases = {
      inhale: { duration: 4000, text: 'Breathe In', color: '#4ECDC4', emoji: '🌬️' },
      hold: { duration: 4000, text: 'Hold', color: '#FFD166', emoji: '⏳' },
      exhale: { duration: 6000, text: 'Breathe Out', color: '#96CEB4', emoji: '😌' }
    };

    const startAnimation = useCallback(() => {
      const runPhase = (phase) => {
        setBreathingPhase(phase);
        const { duration, color } = breathingPhases[phase];
        
        const toValue = phase === 'inhale' ? 1.8 : phase === 'exhale' ? 1 : 1.4;
        
        Animated.timing(breathAnim, {
          toValue,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start();
        
        timerRef.current = setTimeout(() => {
          const nextPhase = 
            phase === 'inhale' ? 'hold' :
            phase === 'hold' ? 'exhale' : 'inhale';
          runPhase(nextPhase);
        }, duration);
      };
      
      runPhase('inhale');
    }, []);

    const stopAnimation = useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (animationRef.current) {
        breathAnim.stopAnimation();
      }
    }, []);

    useEffect(() => {
      if (showBreathingModal) {
        startAnimation();
      } else {
        stopAnimation();
        breathAnim.setValue(1);
        setBreathingPhase('inhale');
      }
      
      return () => {
        stopAnimation();
      };
    }, [showBreathingModal, startAnimation, stopAnimation]);

    const handleClose = () => {
      stopAnimation();
      setShowBreathingModal(false);
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBreathingModal}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#5E72EB', '#9D50EA']}
              style={styles.modalGradient}
            >
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={handleClose}
              >
                <AntDesign name="close" size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.breathingContainer}>
                <Animated.View 
                  style={[
                    styles.breathingCircle,
                    {
                      transform: [{ scale: breathAnim }]
                    }
                  ]}
                >
                  <View style={[
                    styles.breathingCircleInner,
                    { backgroundColor: breathingPhases[breathingPhase].color }
                  ]}>
                    <Text style={styles.breathingEmoji}>
                      {breathingPhases[breathingPhase].emoji}
                    </Text>
                  </View>
                </Animated.View>
                
                <Text style={styles.breathingPhaseText}>
                  {breathingPhases[breathingPhase].text}
                </Text>
                
                <Text style={styles.breathingInstruction}>
                  Follow the circle's rhythm
                </Text>
                
                <View style={styles.breathingGuide}>
                  <View style={styles.guideStep}>
                    <View style={[styles.guideDot, { backgroundColor: '#4ECDC4' }]} />
                    <Text style={styles.guideText}>Inhale (4s)</Text>
                  </View>
                  <View style={styles.guideStep}>
                    <View style={[styles.guideDot, { backgroundColor: '#FFD166' }]} />
                    <Text style={styles.guideText}>Hold (4s)</Text>
                  </View>
                  <View style={styles.guideStep}>
                    <View style={[styles.guideDot, { backgroundColor: '#96CEB4' }]} />
                    <Text style={styles.guideText}>Exhale (6s)</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.stopBreathingButton}
                  onPress={handleClose}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E53']}
                    style={styles.stopButtonGradient}
                  >
                    <Text style={styles.stopBreathingText}>Finish Session</Text>
                    <Feather name="check" size={18} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    );
  });

  // Mood Analysis Component
  const MoodAnalysis = () => {
    if (!showMoodAnalysis || !selectedMood) return null;
    
    const mood = moods.find(m => m.id === selectedMood);
    if (!mood) return null;
    
    return (
      <View style={styles.moodAnalysisOverlay}>
        <View style={styles.moodAnalysisCard}>
          <View style={[
            styles.moodAnalysisHeader,
            { backgroundColor: mood.color + '20' }
          ]}>
            <Text style={styles.moodAnalysisEmoji}>{mood.emoji}</Text>
            <View style={styles.moodAnalysisHeaderText}>
              <Text style={styles.moodAnalysisTitle}>Mood Analysis</Text>
              <Text style={[styles.moodAnalysisLabel, { color: mood.color }]}>
                {mood.label} • Energy: {mood.intensity}/5
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeAnalysisButton}
              onPress={() => setShowMoodAnalysis(false)}
            >
              <AntDesign name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.moodAnalysisText}>
            {mood.intensity <= 2 
              ? "It's okay to feel low. Consider gentle activities like a short walk, listening to music, or talking to a friend."
              : mood.intensity <= 4
              ? "Good energy balance! Great time for mindfulness, creative work, or connecting with others."
              : "High energy! Perfect for physical activity, learning something new, or tackling challenging tasks."}
          </Text>
          
          <View style={styles.moodTips}>
            <View style={styles.tip}>
              <Feather name="sun" size={16} color="#FFD166" />
              <Text style={styles.tipText}>Practice self-compassion</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="activity" size={16} color="#4ECDC4" />
              <Text style={styles.tipText}>Take mindful breaks</Text>
            </View>
            <View style={styles.tip}>
              <Feather name="heart" size={16} color="#FF6B6B" />
              <Text style={styles.tipText}>Acknowledge your feelings</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5E72EB" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <LinearGradient
          colors={['#5E72EB', '#9D50EA']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.date}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
              <Text style={styles.title}>Mindful Journal</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.headerIcon}
                onPress={() => selectedMood && setShowMoodAnalysis(true)}
              >
                <Feather name="activity" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerIcon}
                onPress={() => Alert.alert('Stats', `You have ${entryHistory.length} saved entries.`)}
              >
                <Feather name="bar-chart-2" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{entryHistory.length}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {entryHistory.reduce((acc, entry) => acc + (entry.wordCount || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {entryHistory.filter(e => e.mood && moods.find(m => m.id === e.mood)?.intensity >= 4).length}
              </Text>
              <Text style={styles.statLabel}>Positive</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* AI Prompt Card */}
          <Animated.View 
            style={[
              styles.card,
              styles.promptCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="lightbulb-on" size={22} color="#FFD166" />
              <Text style={styles.cardTitle}>Daily Prompt</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={refreshPrompt}
              >
                <Feather name="refresh-cw" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.promptText}>{currentPrompt}</Text>
          </Animated.View>

          {/* Mood Selector */}
          <Animated.View 
            style={[
              styles.card,
              styles.moodCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <Feather name="heart" size={20} color="#FF6B6B" />
              <Text style={styles.cardTitle}>Current Mood</Text>
            </View>
            
            <View style={styles.moodGrid}>
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodOption,
                    selectedMood === mood.id && {
                      backgroundColor: mood.color + '20',
                      borderColor: mood.color,
                    }
                  ]}
                  onPress={() => {
                    setSelectedMood(mood.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    selectedMood === mood.id && { color: mood.color, fontWeight: '700' }
                  ]}>
                    {mood.label}
                  </Text>
                  <View style={styles.intensityBar}>
                    {[...Array(5)].map((_, i) => (
                      <View 
                        key={i}
                        style={[
                          styles.intensitySegment,
                          i < mood.intensity && { backgroundColor: mood.color }
                        ]}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Journal Entry */}
          <Animated.View 
            style={[
              styles.card,
              styles.journalCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <Feather name="edit-3" size={20} color="#4ECDC4" />
              <Text style={styles.cardTitle}>Your Reflection</Text>
              <View style={styles.typingIndicator}>
                {isTyping && (
                  <>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </>
                )}
              </View>
            </View>
            
            <TextInput
              style={styles.journalInput}
              placeholder="Write freely... This is your safe space to express thoughts and feelings. 💭"
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={currentEntry}
              onChangeText={(text) => {
                setCurrentEntry(text);
                setIsTyping(text.length > 0);
              }}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
            />
            
            <View style={styles.journalFooter}>
              <View style={styles.wordCountContainer}>
                <Feather name="file-text" size={14} color="#64748B" />
                <Text style={styles.wordCount}>
                  {currentEntry.split(/\s+/).filter(word => word.length > 0).length} words
                </Text>
              </View>
              <View style={styles.privacyBadge}>
                <Feather name="lock" size={12} color="#10B981" />
                <Text style={styles.privacyText}>Private</Text>
              </View>
            </View>
          </Animated.View>

          {/* Save Button */}
          <Animated.View 
            style={[
              styles.saveButtonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={[
                styles.saveButton,
                !currentEntry.trim() && styles.saveButtonDisabled
              ]}
              onPress={handleSaveEntry}
              disabled={!currentEntry.trim()}
            >
              <LinearGradient
                colors={['#5E72EB', '#9D50EA']}
                style={styles.saveButtonGradient}
              >
                <Feather name="save" size={20} color="white" />
                <Text style={styles.saveButtonText}>Save Reflection</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.saveHint}>
              {currentEntry.length > 100 
                ? "✨ Great reflection! Taking time for yourself is important."
                : "💭 Write a bit more to unlock deeper insights"}
            </Text>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsTitle}>Quick Tools</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity 
                  key={action.id}
                  style={[
                    styles.quickAction,
                    activeQuickAction === action.id && styles.quickActionActive
                  ]}
                  onPress={action.action}
                >
                  <LinearGradient
                    colors={action.colors}
                    style={styles.quickActionGradient}
                  >
                    <Feather name={action.icon} size={22} color="white" />
                    <Text style={styles.quickActionText}>{action.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI Insights */}
          <View style={styles.aiInsightsContainer}>
            <View style={styles.aiHeader}>
              <FontAwesome5 name="robot" size={18} color="#4ECDC4" />
              <Text style={styles.aiTitle}>AI Insights</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.insightsScroll}
            >
              {aiInsights.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <BreathingModal />
      <MoodAnalysis />
    </SafeAreaView>
  );
};

// Styles remain the same as previous version
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    flex: 1,
  },
  date: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  // Cards
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 10,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  // Prompt Card
  promptCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD166',
  },
  promptText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  // Mood Card
  moodCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodOption: {
    width: (width - 56) / 3,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  intensityBar: {
    flexDirection: 'row',
    height: 4,
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  intensitySegment: {
    flex: 1,
    height: '100%',
    marginHorizontal: 1,
  },
  // Journal Card
  journalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ECDC4',
    marginLeft: 2,
  },
  journalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    minHeight: 180,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    lineHeight: 24,
    marginBottom: 12,
  },
  journalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordCount: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98110',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B98120',
  },
  privacyText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  // Save Button
  saveButtonContainer: {
    marginBottom: 20,
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#5E72EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  saveHint: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
  // Quick Actions
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionActive: {
    transform: [{ scale: 0.98 }],
  },
  quickActionGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  // AI Insights
  aiInsightsContainer: {
    marginBottom: 10,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 10,
  },
  insightsScroll: {
    flexDirection: 'row',
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 250,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  // Breathing Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingCircleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  breathingEmoji: {
    fontSize: 60,
  },
  breathingPhaseText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  breathingInstruction: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  breathingGuide: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 16,
    borderRadius: 12,
  },
  guideStep: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  guideDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  guideText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stopBreathingButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  stopButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  stopBreathingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
  // Mood Analysis
  moodAnalysisOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  moodAnalysisCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  moodAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingRight: 16,
  },
  moodAnalysisEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  moodAnalysisHeaderText: {
    flex: 1,
  },
  moodAnalysisTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  moodAnalysisLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeAnalysisButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  moodAnalysisText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    padding: 20,
    paddingTop: 0,
    paddingBottom: 16,
  },
  moodTips: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tip: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default MindfulJournal;