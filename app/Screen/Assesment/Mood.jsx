import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Headers from "../../components/Assesment/Header";
import Colors from "../../assets/colors";


import Screen from "../../components/Screen";
import Title from "../../components/Assesment/Title";
import AppButton from "../../components/AppButton";

const moods = [
  {
    id: "1",
    label: "Sad",
    emoji: "😔",
    color: Colors.accent.violet,
    bgColor: Colors.accent.violet + "20",
    gradient: [Colors.accent.violet, Colors.brand.primary],
  },
  {
    id: "2",
    label: "Neutral",
    emoji: "😐",
    color: Colors.features.journal,
    bgColor: Colors.features.journal + "20",
    gradient: [Colors.features.journal, Colors.status.success],
  },
  {
    id: "3",
    label: "Happy",
    emoji: "😊",
    color: Colors.status.success,
    bgColor: Colors.status.success + "20",
    gradient: [Colors.status.success, Colors.accent.coral],
  },
  {
    id: "4",
    label: "Excited",
    emoji: "🤩",
    color: Colors.accent.coral,
    bgColor: Colors.accent.coral + "20",
    gradient: [Colors.accent.coral, Colors.status.warning],
  },
  {
    id: "5",
    label: "Relaxed",
    emoji: "😌",
    color: Colors.brand.accent,
    bgColor: Colors.brand.accent + "20",
    gradient: [Colors.brand.accent, Colors.features.meditation],
  },
  {
    id: "6",
    label: "Stressed",
    emoji: "😫",
    color: Colors.status.error,
    bgColor: Colors.status.error + "20",
    gradient: [Colors.status.error, Colors.accent.coral],
  },
]

const { width, height } = Dimensions.get("window");
const EMOJI_SIZE = width * 0.3;
const OPTION_SIZE = width * 0.16;
const ITEM_SPACING = 12;

const MoodSelector = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(moods[3]); // Start with Neutral
  const [scrollIndex, setScrollIndex] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(height * 0.1)).current;
  const scrollViewRef = useRef(null);
  
  const optionScale = moods.reduce((acc, mood) => {
    acc[mood.id] = useRef(new Animated.Value(1)).current;
    return acc;
  }, {});

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleMoodChange = (mood) => {
    // Animate the selected mood
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(optionScale[mood.id], {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(optionScale[mood.id], {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(optionScale[mood.id], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setSelectedMood(mood);
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (OPTION_SIZE + ITEM_SPACING * 2));
    setScrollIndex(index);
    
    // Show/hide arrows based on scroll position
    setShowLeftArrow(contentOffsetX > 0);
    setShowRightArrow(contentOffsetX < event.nativeEvent.contentSize.width - event.nativeEvent.layoutMeasurement.width - 10);
  };

  const scrollToIndex = (index) => {
    const offset = index * (OPTION_SIZE + ITEM_SPACING * 2);
    scrollViewRef.current?.scrollToOffset({ offset, animated: true });
  };

  const scrollLeft = () => {
    const newIndex = Math.max(0, scrollIndex - 1);
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    const newIndex = Math.min(moods.length - 1, scrollIndex + 1);
    scrollToIndex(newIndex);
  };

  const renderMoodOption = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleMoodChange(item)}
      activeOpacity={0.7}
      style={[
        styles.emojiOptionWrapper,
        { marginLeft: index === 0 ? ITEM_SPACING : 0 },
      ]}
    >
      <Animated.View
        style={[
          styles.emojiOption,
          {
            backgroundColor: item.bgColor,
            borderColor: selectedMood.id === item.id ? item.color : 'transparent',
            transform: [{ scale: optionScale[item.id] }],
          },
        ]}
      >
        <Text style={[styles.optionEmoji, { color: item.color }]}>
          {item.emoji}
        </Text>
        {selectedMood.id === item.id && (
          <View style={styles.selectionContainer}>
            <View
              style={[styles.selectionIndicator, { backgroundColor: item.color }]}
            />
            <Text style={[styles.moodLabel, { color: item.color }]}>
              {item.label}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );

  const navigateToSleepQuality = () => {
    navigation.navigate("SleepQuality", {
      mood: selectedMood.label,
      moodEmoji: selectedMood.emoji,
      moodColor: selectedMood.color,
    });
  };

  return (
    <Screen>
       <LinearGradient
      colors={[Colors.background.main, Colors.background.subtle]}
      style={styles.container}
    >
      <Headers
        onBack={() => navigation.goBack()}
        currentStep="1"
        color={Colors.text.primary}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <View style={styles.titleContainer}>
          <Title style={styles.title}>How whould you describe your mood?</Title>
          
        </View>

        {/* Selected Mood Display */}
        <Animated.View
          style={[styles.selectedMoodContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <LinearGradient
            colors={selectedMood.gradient}
            style={styles.emojiBackground}
            start={[0, 0]}
            end={[1, 1]}
          >
            <Text style={[styles.emoji, { fontSize: EMOJI_SIZE * 0.5 }]}>
              {selectedMood.emoji}
            </Text>
          </LinearGradient>
          
          <View style={styles.moodDescription}>
            <Text style={styles.feelingText}>I feel</Text>
            <Text style={[styles.selectedMoodLabel, { color: selectedMood.color }]}>
              {selectedMood.label}
            </Text>
          </View>
        </Animated.View>

        {/* Mood Selection Slider */}
        <View style={styles.sliderContainer}>
          {/* Left Scroll Arrow */}
          {showLeftArrow && (
            <TouchableOpacity
              style={[styles.scrollArrow, styles.leftArrow]}
              onPress={scrollLeft}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}

          {/* Mood Options */}
          <View style={styles.optionsWrapper}>
            <FlatList
              ref={scrollViewRef}
              data={moods}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderMoodOption}
              contentContainerStyle={styles.optionsContainer}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={OPTION_SIZE + ITEM_SPACING * 2}
              snapToAlignment="center"
            />
            
            {/* Scroll Indicator Dots */}
            <View style={styles.dotsContainer}>
              {moods.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        scrollIndex === index ? selectedMood.color : Colors.neutrals.border,
                      width: scrollIndex === index ? 24 : 8,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Right Scroll Arrow */}
          {showRightArrow && (
            <TouchableOpacity
              style={[styles.scrollArrow, styles.rightArrow]}
              onPress={scrollRight}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <AppButton
            onPress={navigateToSleepQuality}
            text="Continue"
            icon="moon-outline"
          />
        </View>
      </Animated.View>
    </LinearGradient>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    marginTop: -70
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: -40,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    fontFamily: Platform.select({ ios: "System", android: "Roboto" }),
  },
  selectedMoodContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  emojiBackground: {
    width: EMOJI_SIZE,
    height: EMOJI_SIZE,
    borderRadius: EMOJI_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  moodDescription: {
    alignItems: "center",
    marginTop: 20,
  },
  feelingText: {
    fontSize: 18,
    color: Colors.text.secondary,
    fontFamily: Platform.select({ ios: "System", android: "Roboto" }),
  },
  selectedMoodLabel: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 8,
    fontFamily: Platform.select({ ios: "System", android: "Roboto" }),
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  optionsWrapper: {
    flex: 1,
    alignItems: "center",
  },
  optionsContainer: {
    paddingVertical: 10,
  },
  emojiOptionWrapper: {
    marginRight: ITEM_SPACING,
    alignItems: "center",
  },
  emojiOption: {
    width: OPTION_SIZE,
    height: OPTION_SIZE,
    borderRadius: OPTION_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionEmoji: {
    fontSize: OPTION_SIZE * 0.5,
  },
  selectionContainer: {
    position: "absolute",
    bottom: -40,
    alignItems: "center",
  },
  selectionIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: Platform.select({ ios: "System", android: "Roboto" }),
  },
  scrollArrow: {
    position: "absolute",
    top: OPTION_SIZE / 2 - 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transitionProperty: 'width',
    transitionDuration: '300ms',
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: Platform.OS === "ios" ? 20 : 80,
  },
});

export default MoodSelector; 