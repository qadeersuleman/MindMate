import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  PanResponder,
  Easing,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../assets/colors';
import Headers from '../../components/Assesment/Header';
import Title from '../../components/Assesment/Title';
import AppButton from '../../components/AppButton';

const sleepLevels = [
  { label: 'Worst', hours: '3-4 hours', emoji: '😟', color: Colors.features.mood, description: 'Fragmented and light sleep' },
  { label: 'Fair', hours: '5 hours', emoji: '😐', color: Colors.accent.teal, description: 'Somewhat restful sleep' },
  { label: 'Good', hours: '6-7 hours', emoji: '🙂', color: Colors.features.journal, description: 'Mostly restful sleep' },
  { label: 'Excellent', hours: '7-9 hours', emoji: '😊', color: Colors.status.success, description: 'Restful and refreshing sleep' },
];

const TRACK_HEIGHT = 300;
const SEGMENT_HEIGHT = TRACK_HEIGHT / sleepLevels.length;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SleepQualitySlider({route, navigation }) {
  const middleIndex = Math.floor(sleepLevels.length / 2);
  const [selectedIndex, setSelectedIndex] = useState(middleIndex);
  const pan = useRef(new Animated.Value(selectedIndex * SEGMENT_HEIGHT)).current;
  
  const descriptionOpacity = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fillScaleY = useRef(new Animated.Value(selectedIndex / (sleepLevels.length - 1))).current;
  const isAnimating = useRef(false);

  // All Assesment Screens have same header and title
  const {mood } = route.params;

  useEffect(() => {
    // Initialize the selected card animation
    Animated.timing(descriptionOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateSelection = useCallback((index) => {
    if (isAnimating.current || index === selectedIndex) return;
    
    isAnimating.current = true;
    const newYValue = index * SEGMENT_HEIGHT;
    const scaleYValue = index / (sleepLevels.length - 1);

    Animated.parallel([
      Animated.timing(pan, {
        toValue: newYValue,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(fillScaleY, {
        toValue: scaleYValue,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setSelectedIndex(index);
      isAnimating.current = false;
    });
  }, [selectedIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (isAnimating.current) return;
        
        let totalY = gestureState.moveY - gestureState.y0 + selectedIndex * SEGMENT_HEIGHT;
        totalY = Math.max(0, Math.min(totalY, TRACK_HEIGHT));
        pan.setValue(totalY);

        const index = Math.round(totalY / SEGMENT_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, sleepLevels.length - 1));
        fillScaleY.setValue(clampedIndex / (sleepLevels.length - 1));
        setSelectedIndex(clampedIndex);
      },
      onPanResponderRelease: () => {
        if (isAnimating.current) return;
        
        const index = Math.round(pan.__getValue() / SEGMENT_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, sleepLevels.length - 1));
        animateSelection(clampedIndex);
      },
    })
  ).current;

  const handleSegmentPress = useCallback((index) => {
    if (!isAnimating.current) {
      animateSelection(index);
    }
  }, [animateSelection]);

  const handleTrackPress = useCallback((event) => {
    if (!isAnimating.current) {
      const locationY = event.nativeEvent.locationY;
      const index = Math.round(locationY / SEGMENT_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, sleepLevels.length - 1));
      animateSelection(clampedIndex);
    }
  }, [animateSelection]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.neutrals.background }]}>
      <Headers onBack={() => navigation.goBack()} currentStep="2" />   
        {/* In last just find sleep quality as worst fair good or excellent */}
          
      <Title>How would you rate your sleep quality?</Title>

      <Animated.View style={[styles.selectedCard, {
        backgroundColor: sleepLevels[selectedIndex].color + '20',
        borderColor: sleepLevels[selectedIndex].color,
        opacity: descriptionOpacity
      }]}>
        <Text style={styles.selectedEmoji}>{sleepLevels[selectedIndex].emoji}</Text>
        <Text style={[styles.selectedLabel, { color: Colors.text.primary }]}>{sleepLevels[selectedIndex].label}</Text>
        <Text style={[styles.selectedDescription, { color: Colors.text.secondary }]}>{sleepLevels[selectedIndex].description}</Text>
      </Animated.View>

      <View style={styles.sliderContainer}>
        <View style={styles.labels}>
          {sleepLevels.map((level, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.labelRow, { height: SEGMENT_HEIGHT }]}
              onPress={() => handleSegmentPress(index)}
              activeOpacity={0.7}
              delayPressIn={50}
            >
              <View>
                <Text style={[
                  styles.labelText, 
                  { color: Colors.text.secondary },
                  index === selectedIndex && { 
                    fontWeight: 'bold', 
                    color: level.color, 
                    fontSize: 18 
                  }
                ]}>
                  {level.label}
                </Text>
                <Text style={[
                  styles.hoursText, 
                  { color: Colors.text.tertiary },
                  index === selectedIndex && { color: level.color }
                ]}>
                  {level.hours}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.trackWrapper}>
          <TouchableOpacity 
            style={styles.trackContainer} 
            activeOpacity={1} 
            onPress={handleTrackPress}
          >
            <View style={[styles.trackShadow, { backgroundColor: Colors.ui.shadow }]}>
              <View style={[styles.track, { backgroundColor: Colors.neutrals.surfaceLow }]}>
                <Animated.View style={[styles.trackFill, {
                  backgroundColor: sleepLevels[selectedIndex].color,
                  transform: [{ scaleY: fillScaleY.interpolate({ 
                    inputRange: [0, 1], 
                    outputRange: [0.1, 1], 
                    extrapolate: 'clamp' 
                  }) }],
                }]} />
                {sleepLevels.map((_, index) => (
                  <View 
                    key={index} 
                    style={[styles.trackNotch, { 
                      bottom: (index * SEGMENT_HEIGHT) - 2,
                      backgroundColor: Colors.ui.border 
                    }]} 
                  />
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.emojis}>
          {sleepLevels.map((level, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.emojiRow, { height: SEGMENT_HEIGHT }]} 
              onPress={() => handleSegmentPress(index)}
              activeOpacity={0.7}
              delayPressIn={50}
            >
              <Animated.View style={[
                styles.emojiContainer, 
                { 
                  borderColor: Colors.ui.border,
                  backgroundColor: level.color + '20'
                },
                index === selectedIndex && { 
                  transform: [{ scale: scaleAnim }], 
                  borderColor: level.color,
                  backgroundColor: level.color + '40'
                }
              ]}>
                <Text style={[
                  styles.emoji, 
                  index === selectedIndex && { fontSize: 24 }
                ]}>
                  {level.emoji}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <AppButton onPress={() => navigation.navigate('CameraScreen', 
        {
          mood : mood,
          sleep_quality: sleepLevels[selectedIndex].label
        }
      )} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: -35
  },
  selectedCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectedEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  selectedLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginBottom: 20,
  },
  trackWrapper: {
    height: TRACK_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginHorizontal: 10,
  },
  labels: {
    flex: 1,
    marginRight: 10,
  },
  emojis: {
    marginLeft: 10,
    width: 50,
    alignItems: 'center',
  },
  labelRow: {
    justifyContent: 'center',
    paddingVertical: 10,
  },
  emojiRow: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  labelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 12,
    marginTop: 2,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  emoji: {
    fontSize: 20,
  },
  trackContainer: {
    height: TRACK_HEIGHT,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackShadow: {
    width: 16,
    height: TRACK_HEIGHT,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  track: {
    width: 12,
    height: TRACK_HEIGHT,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  trackFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    transformOrigin: 'bottom center',
  },
  trackNotch: {
    position: 'absolute',
    width: 16,
    height: 2,
    left: -2,
  },
});