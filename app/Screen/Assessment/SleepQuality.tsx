import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '../../assets/colors';
import Headers from '../../components/Assessment/Header';
import Title from '../../components/Assessment/Title';
import AppButton from '../../components/AppButton';

interface SleepLevel {
  id: string;
  label: string;
  hours: string;
  tag: string;
  emoji: string;
  color: string;
  pastelBg: string;
  description: string;
}

const sleepLevels: SleepLevel[] = [
  {
    id: 'excellent',
    label: 'Excellent',
    hours: '7-9 hrs',
    tag: 'Deep & Restful',
    emoji: '😊',
    color: '#10B981',
    pastelBg: '#ECFDF5',
    description: 'Restful and deeply refreshing sleep with energized wakefulness.',
  },
  {
    id: 'good',
    label: 'Good',
    hours: '6-7 hrs',
    tag: 'Mostly Restful',
    emoji: '🙂',
    color: '#06B6D4',
    pastelBg: '#ECFEFF',
    description: 'Sufficient sleep with consistent daytime alertness and focus.',
  },
  {
    id: 'fair',
    label: 'Fair',
    hours: '5 hrs',
    tag: 'Light Sleep',
    emoji: '😐',
    color: '#F59E0B',
    pastelBg: '#FFFBEB',
    description: 'Somewhat light or interrupted sleep throughout the night.',
  },
  {
    id: 'worst',
    label: 'Worst',
    hours: '3-4 hrs',
    tag: 'Fragmented',
    emoji: '😟',
    color: '#EF4444',
    pastelBg: '#FEF2F2',
    description: 'Fragmented, restless, or severely insufficient sleep.',
  },
];

const NUM_LEVELS = sleepLevels.length;
const ROW_HEIGHT = 68;
const TRACK_HEIGHT = ROW_HEIGHT * NUM_LEVELS; // 272
const THUMB_SIZE = 34;
const THUMB_OFFSET = (ROW_HEIGHT - THUMB_SIZE) / 2; // 17

const getThumbYForIndex = (index: number) => {
  return index * ROW_HEIGHT + THUMB_OFFSET;
};

const MIN_THUMB_Y = getThumbYForIndex(0); // 17
const MAX_THUMB_Y = getThumbYForIndex(NUM_LEVELS - 1); // 221
const TRACK_TOUCH_WIDTH = 80;

interface SleepQualityProps {
  route: any;
  navigation: any;
}

export default function SleepQualitySlider({ route, navigation }: SleepQualityProps) {
  // Default to index 1 ('Good')
  const defaultIndex = 1;
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  const thumbY = useRef(new Animated.Value(getThumbYForIndex(defaultIndex))).current;
  const emojiScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const startThumbYRef = useRef(getThumbYForIndex(defaultIndex));
  const currentThumbYRef = useRef(getThumbYForIndex(defaultIndex));
  const activeIndexRef = useRef(defaultIndex);

  const { mood } = route?.params || {};

  const triggerHaptic = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
  }, []);

  const bounceEmoji = useCallback(() => {
    emojiScale.setValue(0.7);
    Animated.spring(emojiScale, {
      toValue: 1,
      friction: 4,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [emojiScale]);

  const snapToIndex = useCallback((targetIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(NUM_LEVELS - 1, targetIndex));
    const targetY = getThumbYForIndex(clampedIndex);

    currentThumbYRef.current = targetY;
    activeIndexRef.current = clampedIndex;
    setSelectedIndex(clampedIndex);
    triggerHaptic();
    bounceEmoji();

    Animated.spring(thumbY, {
      toValue: targetY,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [thumbY, triggerHaptic, bounceEmoji]);

  // Handle bidirectional dragging via PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touchY = evt.nativeEvent.locationY;
        const targetThumbY = Math.max(MIN_THUMB_Y, Math.min(MAX_THUMB_Y, touchY - THUMB_SIZE / 2));
        const distFromCurrent = Math.abs(currentThumbYRef.current - targetThumbY);

        if (distFromCurrent > 35) {
          // If tapped away from thumb, immediately jump towards touched notch
          currentThumbYRef.current = targetThumbY;
          thumbY.setValue(targetThumbY);
          const newIndex = Math.max(
            0,
            Math.min(NUM_LEVELS - 1, Math.round((targetThumbY - MIN_THUMB_Y) / ROW_HEIGHT))
          );
          if (newIndex !== activeIndexRef.current) {
            activeIndexRef.current = newIndex;
            setSelectedIndex(newIndex);
            triggerHaptic();
          }
        }
        startThumbYRef.current = currentThumbYRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        // Continuous smooth drag up or down
        const nextY = Math.max(MIN_THUMB_Y, Math.min(MAX_THUMB_Y, startThumbYRef.current + gestureState.dy));
        currentThumbYRef.current = nextY;
        thumbY.setValue(nextY);

        const nearestIndex = Math.max(
          0,
          Math.min(NUM_LEVELS - 1, Math.round((nextY - MIN_THUMB_Y) / ROW_HEIGHT))
        );
        if (nearestIndex !== activeIndexRef.current) {
          activeIndexRef.current = nearestIndex;
          setSelectedIndex(nearestIndex);
          triggerHaptic();
        }
      },
      onPanResponderRelease: () => {
        const finalIndex = Math.max(
          0,
          Math.min(NUM_LEVELS - 1, Math.round((currentThumbYRef.current - MIN_THUMB_Y) / ROW_HEIGHT))
        );
        snapToIndex(finalIndex);
      },
      onPanResponderTerminate: () => {
        const finalIndex = Math.max(
          0,
          Math.min(NUM_LEVELS - 1, Math.round((currentThumbYRef.current - MIN_THUMB_Y) / ROW_HEIGHT))
        );
        snapToIndex(finalIndex);
      },
    })
  ).current;

  // The fill bar translates down as thumb moves down (less fill), and rises as thumb moves up (more fill)
  const fillTranslateY = thumbY.interpolate({
    inputRange: [MIN_THUMB_Y, MAX_THUMB_Y],
    outputRange: [0, MAX_THUMB_Y],
    extrapolate: 'clamp',
  });

  const currentLevel = sleepLevels[selectedIndex];

  const handleContinue = () => {
    navigation.navigate('ExpressionAnalysis', {
      ...(route?.params || {}),
      mood,
      sleep_quality: currentLevel.label,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.neutrals.background }]}>
      <Headers onBack={() => navigation.goBack()} currentStep="3" />

      <View style={styles.content}>
        <Title subtitle="Drag the slider or tap a level to rate your sleep">
          How would you rate your sleep quality?
        </Title>

        {/* Selected Summary Card */}
        <Animated.View
          style={[
            styles.selectedCard,
            {
              backgroundColor: currentLevel.pastelBg,
              borderColor: currentLevel.color + '45',
              opacity: cardOpacity,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Animated.Text
              style={[
                styles.selectedEmoji,
                {
                  transform: [{ scale: emojiScale }],
                },
              ]}
            >
              {currentLevel.emoji}
            </Animated.Text>
            <View style={styles.cardInfo}>
              <View style={styles.cardTitleRow}>
                <Text style={[styles.selectedLabel, { color: Colors.text.primary }]}>
                  {currentLevel.label}
                </Text>
                <View style={[styles.cardTagPill, { backgroundColor: currentLevel.color + '22' }]}>
                  <Text style={[styles.cardTagText, { color: currentLevel.color }]}>
                    {currentLevel.hours}
                  </Text>
                </View>
              </View>
              <Text style={[styles.selectedDescription, { color: Colors.text.secondary }]}>
                {currentLevel.description}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Interactive Slider Area */}
        <View style={styles.sliderContainer}>
          {/* Left Column: Labels & Hours */}
          <View style={styles.labelsColumn}>
            {sleepLevels.map((level, index) => {
              const isSelected = index === selectedIndex;
              return (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.labelRow, { height: ROW_HEIGHT }]}
                  onPress={() => snapToIndex(index)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.labelText,
                      { color: isSelected ? level.color : Colors.text.primary },
                      isSelected && styles.labelTextSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                  <View
                    style={[
                      styles.hoursPill,
                      {
                        backgroundColor: isSelected ? level.color + '20' : Colors.background.subtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.hoursText,
                        { color: isSelected ? level.color : Colors.text.tertiary },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {level.hours}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Middle Column: Interactive Vertical Slider Track */}
          <View style={styles.trackColumn}>
            <View style={styles.trackTouchWrapper} {...panResponder.panHandlers}>
              {/* Visual Track Outer Bar */}
              <View style={styles.trackBackground}>
                <Animated.View
                  style={[
                    styles.trackFill,
                    {
                      backgroundColor: currentLevel.color,
                      transform: [{ translateY: fillTranslateY }],
                    },
                  ]}
                />
              </View>

              {/* Notch Dots along the Track */}
              {sleepLevels.map((lvl, index) => {
                const notchY = getThumbYForIndex(index) + THUMB_SIZE / 2 - 2;
                const isFilled = index >= selectedIndex;
                return (
                  <View
                    key={lvl.id}
                    pointerEvents="none"
                    style={[
                      styles.trackNotch,
                      {
                        top: notchY,
                        backgroundColor: isFilled ? '#FFFFFF' : '#CBD5E1',
                      },
                    ]}
                  />
                );
              })}

              {/* Draggable Thumb Knob */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.thumb,
                  {
                    borderColor: currentLevel.color,
                    shadowColor: currentLevel.color,
                    transform: [{ translateY: thumbY }],
                  },
                ]}
              >
                <View style={[styles.thumbInnerGrip, { backgroundColor: currentLevel.color }]} />
              </Animated.View>
            </View>
          </View>

          {/* Right Column: Emojis */}
          <View style={styles.emojisColumn}>
            {sleepLevels.map((level, index) => {
              const isSelected = index === selectedIndex;
              return (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.emojiRow, { height: ROW_HEIGHT }]}
                  onPress={() => snapToIndex(index)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.emojiContainer,
                      {
                        borderColor: isSelected ? level.color : 'transparent',
                        backgroundColor: isSelected ? level.color + '22' : Colors.background.card,
                      },
                      isSelected && styles.emojiContainerSelected,
                    ]}
                  >
                    <Text style={[styles.emoji, isSelected && styles.emojiSelected]}>
                      {level.emoji}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bottom Continue Action */}
        <View style={styles.bottomActionContainer}>
          <AppButton title="Continue" onPress={handleContinue} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 12 : 20,
  },
  selectedCard: {
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1.5,
    shadowColor: Colors.brand.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedEmoji: {
    fontSize: 42,
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  selectedLabel: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  cardTagPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cardTagText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter-SemiBold',
  },
  selectedDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter-Regular',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TRACK_HEIGHT,
    marginVertical: 12,
  },
  labelsColumn: {
    flex: 1,
    height: TRACK_HEIGHT,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  labelRow: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  labelTextSelected: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  hoursPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  hoursText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  trackColumn: {
    width: TRACK_TOUCH_WIDTH,
    height: TRACK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackTouchWrapper: {
    width: TRACK_TOUCH_WIDTH,
    height: TRACK_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBackground: {
    width: 14,
    height: TRACK_HEIGHT,
    borderRadius: 7,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  trackFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    borderRadius: 7,
  },
  trackNotch: {
    position: 'absolute',
    left: (TRACK_TOUCH_WIDTH - 6) / 2,
    width: 6,
    height: 4,
    borderRadius: 2,
    zIndex: 5,
  },
  thumb: {
    position: 'absolute',
    left: (TRACK_TOUCH_WIDTH - THUMB_SIZE) / 2,
    top: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  thumbInnerGrip: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emojisColumn: {
    width: 60,
    height: TRACK_HEIGHT,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 8,
  },
  emojiRow: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  emojiContainerSelected: {
    borderWidth: 2,
    transform: [{ scale: 1.1 }],
    shadowColor: Colors.brand.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 22,
  },
  emojiSelected: {
    fontSize: 24,
  },
  bottomActionContainer: {
    marginTop: 'auto',
    paddingBottom: 8,
  },
});
