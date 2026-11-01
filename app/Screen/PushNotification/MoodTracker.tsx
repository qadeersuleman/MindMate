import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../assets/colors';

const { width } = Dimensions.get('window');

interface MoodOption {
  id: number;
  emoji: string;
  label: string;
  tag: string;
  color: string;
  pastelBg: string;
  gradient: [string, string];
}

const moodData: MoodOption[] = [
  { 
    id: 1, 
    emoji: '😫', 
    label: 'Awful', 
    tag: 'Very Low', 
    color: '#EF4444', 
    pastelBg: '#FEF2F2',
    gradient: ['#EF4444', '#F87171'] 
  },
  { 
    id: 2, 
    emoji: '😣', 
    label: 'Stressed', 
    tag: 'Tense & Heavy', 
    color: '#F97316', 
    pastelBg: '#FFF7ED',
    gradient: ['#F97316', '#FB923C'] 
  },
  { 
    id: 3, 
    emoji: '😐', 
    label: 'Neutral', 
    tag: 'Steady & Calm', 
    color: '#F59E0B', 
    pastelBg: '#FFFBEB',
    gradient: ['#F59E0B', '#FBBF24'] 
  },
  { 
    id: 4, 
    emoji: '🙂', 
    label: 'Good', 
    tag: 'Peaceful', 
    color: '#10B981', 
    pastelBg: '#ECFDF5',
    gradient: ['#10B981', '#34D399'] 
  },
  { 
    id: 5, 
    emoji: '😊', 
    label: 'Happy', 
    tag: 'Joyful & Light', 
    color: '#06B6D4', 
    pastelBg: '#ECFEFF',
    gradient: ['#06B6D4', '#38BDF8'] 
  },
  { 
    id: 6, 
    emoji: '🤩', 
    label: 'Awesome', 
    tag: 'High Energy', 
    color: '#8B5CF6', 
    pastelBg: '#F5F3FF',
    gradient: ['#8B5CF6', '#A78BFA'] 
  },
];

interface ActivityOption {
  id: number;
  icon: string;
  label: string;
  category: string;
}

const activitiesData: ActivityOption[] = [
  { id: 1, icon: 'fitness', label: 'Exercise', category: 'Health' },
  { id: 2, icon: 'leaf', label: 'Meditation', category: 'Wellness' },
  { id: 3, icon: 'briefcase', label: 'Work', category: 'Focus' },
  { id: 4, icon: 'people', label: 'Friends', category: 'Social' },
  { id: 5, icon: 'book', label: 'Reading', category: 'Personal' },
  { id: 6, icon: 'musical-notes', label: 'Music', category: 'Relax' },
  { id: 7, icon: 'sunny', label: 'Outdoors', category: 'Nature' },
  { id: 8, icon: 'restaurant', label: 'Good Food', category: 'Health' },
  { id: 9, icon: 'game-controller', label: 'Gaming', category: 'Leisure' },
  { id: 10, icon: 'bed', label: 'Sleep', category: 'Rest' },
  { id: 11, icon: 'cafe', label: 'Coffee Break', category: 'Relax' },
  { id: 12, icon: 'color-palette', label: 'Creative', category: 'Hobbies' },
];

const quickPrompts = [
  '✨ Grateful for today',
  '💪 Highly productive',
  '🌿 Peaceful & calm',
  '🌧️ Felt a bit tired',
  '🎯 Made great progress',
];

export default function MoodTracker({ navigation }: { navigation: any }) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(moodData[3]); // Default: Good
  const [selectedActivities, setSelectedActivities] = useState<number[]>([1, 4]);
  const [noteText, setNoteText] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Animated values
  const stepAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const emojiPopAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0.33)).current;

  const triggerHaptic = useCallback((type: 'light' | 'selection' | 'success' = 'selection') => {
    try {
      if (type === 'selection') Haptics.selectionAsync();
      else if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }
  }, []);

  const animateToStep = (newStep: number) => {
    triggerHaptic('light');
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: newStep > currentStep ? -30 : 30,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(stepAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(newStep);
      slideAnim.setValue(newStep > currentStep ? 30 : -30);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(stepAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(progressAnim, {
          toValue: newStep === 1 ? 0.33 : newStep === 2 ? 0.66 : 1,
          friction: 6,
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
    triggerHaptic('selection');

    // Emoji pop animation
    emojiPopAnim.setValue(0.7);
    Animated.spring(emojiPopAnim, {
      toValue: 1,
      friction: 4,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  const handleActivityToggle = (id: number) => {
    triggerHaptic('selection');
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddPrompt = (prompt: string) => {
    triggerHaptic('light');
    setNoteText((prev) => (prev ? `${prev} • ${prompt}` : prompt));
  };

  const handleSaveEntry = async () => {
    triggerHaptic('success');
    const entry = {
      date: new Date().toISOString(),
      mood: selectedMood,
      activities: selectedActivities.map((id) => activitiesData.find((a) => a.id === id)?.label),
      note: noteText,
    };

    try {
      await AsyncStorage.setItem('last_mood_entry', JSON.stringify(entry));
    } catch (e) {
      console.warn('Failed to save mood log:', e);
    }

    setIsCompleted(true);
  };

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors.neutrals.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* Modern Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (currentStep > 1 && !isCompleted) {
              animateToStep(currentStep - 1);
            } else {
              navigation.goBack();
            }
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Daily Mood Check-in</Text>
          <Text style={styles.headerSubtitle}>{todayFormatted}</Text>
        </View>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            {isCompleted ? 'Done' : `${currentStep}/3`}
          </Text>
        </View>
      </View>

      {/* Progress Bar Line */}
      {!isCompleted && (
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isCompleted ? (
            /* Celebration / Completed Screen */
            <View style={styles.completionContainer}>
              <View style={[styles.celebrationCircle, { backgroundColor: selectedMood?.pastelBg }]}>
                <Animated.Text
                  style={[
                    styles.celebrationEmoji,
                    { transform: [{ scale: emojiPopAnim }] },
                  ]}
                >
                  {selectedMood?.emoji}
                </Animated.Text>
              </View>

              <Text style={styles.celebrationTitle}>Mood Logged Successfully!</Text>
              <Text style={styles.celebrationSubtitle}>
                You felt <Text style={{ fontWeight: '700', color: selectedMood?.color }}>{selectedMood?.label}</Text> today.
                Reflecting daily builds emotional resilience.
              </Text>

              {/* Summary Card */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Emotional State</Text>
                  <View style={[styles.moodTag, { backgroundColor: selectedMood?.pastelBg }]}>
                    <Text style={[styles.moodTagText, { color: selectedMood?.color }]}>
                      {selectedMood?.emoji} {selectedMood?.label} ({selectedMood?.tag})
                    </Text>
                  </View>
                </View>

                {selectedActivities.length > 0 && (
                  <View style={styles.summaryActivitiesRow}>
                    <Text style={styles.summaryLabel}>Key Activities</Text>
                    <View style={styles.summaryTagsWrap}>
                      {selectedActivities.map((id) => {
                        const act = activitiesData.find((a) => a.id === id);
                        return act ? (
                          <View key={id} style={styles.summaryActivityPill}>
                            <Ionicons name={act.icon as any} size={12} color={Colors.brand.primary} />
                            <Text style={styles.summaryActivityText}>{act.label}</Text>
                          </View>
                        ) : null;
                      })}
                    </View>
                  </View>
                )}

                {noteText.trim() ? (
                  <View style={styles.summaryNoteSection}>
                    <Text style={styles.summaryLabel}>Reflection</Text>
                    <Text style={styles.summaryNoteText}>"{noteText}"</Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={Colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.gradientButtonText}>Done & Return Home</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            /* Active Step Content with Smooth Fade/Slide */
            <Animated.View
              style={[
                styles.stepAnimatedBox,
                {
                  opacity: stepAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              {/* STEP 1: Mood Selection */}
              {currentStep === 1 && (
                <View>
                  <View style={styles.stepHeadingBox}>
                    <Text style={styles.stepTitle}>How are you feeling right now?</Text>
                    <Text style={styles.stepSubtitle}>
                      Tap the vibe that best reflects your emotional energy today.
                    </Text>
                  </View>

                  <View style={styles.moodGrid}>
                    {moodData.map((mood) => {
                      const isSelected = selectedMood?.id === mood.id;
                      return (
                        <TouchableOpacity
                          key={mood.id}
                          style={[
                            styles.moodCard,
                            {
                              backgroundColor: mood.pastelBg,
                              borderColor: isSelected ? mood.color : 'transparent',
                            },
                            isSelected && styles.moodCardSelected,
                          ]}
                          onPress={() => handleMoodSelect(mood)}
                          activeOpacity={0.75}
                        >
                          {isSelected && (
                            <View style={[styles.selectedCheckBadge, { backgroundColor: mood.color }]}>
                              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                            </View>
                          )}
                          <Text style={styles.moodCardEmoji}>{mood.emoji}</Text>
                          <Text style={[styles.moodCardLabel, { color: Colors.text.primary }]}>
                            {mood.label}
                          </Text>
                          <Text style={[styles.moodCardTag, { color: mood.color }]}>
                            {mood.tag}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => animateToStep(2)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={Colors.gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.gradientButtonText}>Next: Select Activities</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 2: Activities Selection */}
              {currentStep === 2 && (
                <View>
                  <View style={styles.stepHeadingBox}>
                    <Text style={styles.stepTitle}>What's shaping your day?</Text>
                    <Text style={styles.stepSubtitle}>
                      Choose all the activities and factors that influenced your mood.
                    </Text>
                  </View>

                  <View style={styles.activitiesGrid}>
                    {activitiesData.map((act) => {
                      const isSelected = selectedActivities.includes(act.id);
                      return (
                        <TouchableOpacity
                          key={act.id}
                          style={[
                            styles.activityChip,
                            isSelected && styles.activityChipSelected,
                          ]}
                          onPress={() => handleActivityToggle(act.id)}
                          activeOpacity={0.75}
                        >
                          <View
                            style={[
                              styles.activityIconCircle,
                              {
                                backgroundColor: isSelected
                                  ? Colors.brand.primary
                                  : Colors.background.subtle,
                              },
                            ]}
                          >
                            <Ionicons
                              name={act.icon as any}
                              size={16}
                              color={isSelected ? '#FFFFFF' : Colors.brand.primary}
                            />
                          </View>
                          <Text
                            style={[
                              styles.activityLabelText,
                              isSelected && styles.activityLabelTextSelected,
                            ]}
                          >
                            {act.label}
                          </Text>
                          {isSelected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color={Colors.brand.primary}
                              style={{ marginLeft: 4 }}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.stepActionRow}>
                    <TouchableOpacity
                      style={styles.secondaryStepButton}
                      onPress={() => animateToStep(1)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="arrow-back" size={18} color={Colors.text.secondary} />
                      <Text style={styles.secondaryStepButtonText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.primaryActionButton, { flex: 1, marginLeft: 12 }]}
                      onPress={() => animateToStep(3)}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={Colors.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                      >
                        <Text style={styles.gradientButtonText}>Next: Add Note</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 3: Notes & Personal Reflection */}
              {currentStep === 3 && (
                <View>
                  <View style={styles.stepHeadingBox}>
                    <Text style={styles.stepTitle}>Reflections & Personal Notes</Text>
                    <Text style={styles.stepSubtitle}>
                      Share what went well or what's occupying your thoughts.
                    </Text>
                  </View>

                  {/* Quick Prompts */}
                  <Text style={styles.sectionMiniHeader}>Quick Prompts (Tap to add)</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.promptsContainer}
                  >
                    {quickPrompts.map((prompt, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.promptChip}
                        onPress={() => handleAddPrompt(prompt)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.promptChipText}>{prompt}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Modern TextInput Area */}
                  <View style={styles.textAreaContainer}>
                    <TextInput
                      style={styles.textAreaInput}
                      placeholder="Write your thoughts, daily gratitude, or what made a difference..."
                      placeholderTextColor={Colors.text.tertiary}
                      value={noteText}
                      onChangeText={setNoteText}
                      multiline
                      maxLength={400}
                      textAlignVertical="top"
                    />
                    <View style={styles.textAreaFooter}>
                      <Text style={styles.charCountText}>
                        {noteText.length}/400 characters
                      </Text>
                      {noteText.length > 0 && (
                        <TouchableOpacity onPress={() => setNoteText('')}>
                          <Text style={styles.clearNoteText}>Clear</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Save Button */}
                  <View style={styles.stepActionRow}>
                    <TouchableOpacity
                      style={styles.secondaryStepButton}
                      onPress={() => animateToStep(2)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="arrow-back" size={18} color={Colors.text.secondary} />
                      <Text style={styles.secondaryStepButtonText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.primaryActionButton, { flex: 1, marginLeft: 12 }]}
                      onPress={handleSaveEntry}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={Colors.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.gradientButtonText}>Save Mood Entry</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.neutrals.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.ui.border,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary + '18',
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter-SemiBold',
    color: Colors.brand.primary,
  },
  progressBarWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.brand.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  stepAnimatedBox: {
    width: '100%',
  },
  stepHeadingBox: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodCard: {
    width: (width - 52) / 2,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
    shadowColor: Colors.brand.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  moodCardSelected: {
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCardEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  moodCardLabel: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  moodCardTag: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 6,
  },
  activityChipSelected: {
    borderColor: Colors.brand.primary,
    backgroundColor: Colors.brand.primary + '10',
  },
  activityIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  activityLabelText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
  activityLabelTextSelected: {
    fontWeight: '700',
    color: Colors.brand.primary,
  },
  sectionMiniHeader: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: Colors.text.tertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptsContainer: {
    paddingBottom: 14,
    gap: 8,
  },
  promptChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutrals.surface,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    marginRight: 8,
  },
  promptChipText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  textAreaContainer: {
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    marginBottom: 24,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  textAreaInput: {
    minHeight: 120,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.text.primary,
    lineHeight: 22,
  },
  textAreaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  charCountText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: Colors.text.tertiary,
  },
  clearNoteText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: Colors.status.error,
  },
  stepActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.neutrals.surface,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  secondaryStepButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: Colors.text.secondary,
    marginLeft: 6,
  },
  primaryActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.brand.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  gradientButtonText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginRight: 6,
  },
  completionContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  celebrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: Colors.brand.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  celebrationEmoji: {
    fontSize: 50,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    marginBottom: 28,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: Colors.text.tertiary,
  },
  moodTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  moodTagText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter-SemiBold',
  },
  summaryActivitiesRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  summaryActivityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: Colors.background.subtle,
    gap: 4,
  },
  summaryActivityText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: Colors.text.primary,
  },
  summaryNoteSection: {
    paddingTop: 12,
  },
  summaryNoteText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.text.primary,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 20,
  },
});
