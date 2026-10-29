import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Animated as RNAnimated,
  ScrollView
} from 'react-native';
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  ZoomIn,
  SlideInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  useAnimatedReaction,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Colors from '../../assets/colors';
import AppButton from '../../components/AppButton';
import Headers from '../../components/Assesment/Header';
import Title from '../../components/Assesment/Title';

const { width, height } = Dimensions.get('window');
const AGES = Array.from({ length: 83 }, (_, i) => (i + 18).toString());
const ITEM_HEIGHT = 70;
const SELECTED_ITEM_HEIGHT = 140;
const SELECTED_ITEM_WIDTH = width * 0.7;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const AgeSelection = ({ route, navigation }) => {
  const [selectedAge, setSelectedAge] = useState('25');
  const flatListRef = useRef(null);
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  
  // Reanimated shared values
  const animatedAge = useSharedValue(25);
  const scaleProgress = useSharedValue(0);

  const { health_goal } = route.params;

  // Enhanced scroll handler with Reanimated
  const handleScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const age = AGES[Math.min(Math.max(index, 0), AGES.length - 1)];
        setSelectedAge(age);
        animatedAge.value = parseInt(age);
      }
    }
  );

  useEffect(() => {
    // Animate in the scale progress
    scaleProgress.value = withSpring(1, {
      damping: 20,
      stiffness: 90
    });
  }, []);

  const scrollToIndex = (index) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const AgeIndicator = () => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { 
            scale: 1 + (animatedAge.value - 25) * 0.002 
          }
        ],
        opacity: 0.8 + (animatedAge.value - 25) * 0.008
      };
    });

    return (
      <Animated.View style={[styles.ageIndicator, animatedStyle]}>
        <LinearGradient
          colors={[Colors.brand.primary + '20', Colors.accent.violet + '10']}
          style={styles.indicatorGradient}
        >
          <Text style={styles.indicatorText}>
            {selectedAge} years
          </Text>
          <View style={styles.indicatorPulse} />
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderAgeItem = ({ item, index }) => {
    const inputRange = [
      (index - 2) * ITEM_HEIGHT,
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
      (index + 2) * ITEM_HEIGHT,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.6, 0.8, 1.2, 0.8, 0.6],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.3, 0.5, 1, 0.5, 0.3],
      extrapolate: 'clamp',
    });

    const rotateX = scrollY.interpolate({
      inputRange,
      outputRange: ['-70deg', '-35deg', '0deg', '35deg', '70deg'],
      extrapolate: 'clamp',
    });

    const translateY = scrollY.interpolate({
      inputRange,
      outputRange: [-10, -5, 0, -5, -10],
      extrapolate: 'clamp',
    });

    const isSelected = selectedAge === item;
    const ageNumber = parseInt(item);

    return (
      <RNAnimated.View
        style={[
          styles.ageItem,
          {
            height: isSelected ? SELECTED_ITEM_HEIGHT : ITEM_HEIGHT,
            transform: [{ scale }, { rotateX }, { translateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.ageItemInner,
            isSelected && styles.selectedAgeItem,
          ]}
          onPress={() => {
            setSelectedAge(item);
            scrollToIndex(index);
          }}
          activeOpacity={0.8}
        >
          {isSelected ? (
            <LinearGradient
              colors={Colors.gradients.calm}
              style={styles.gradientBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.selectedContent}>
                <View style={styles.ageBadge}>
                  <Text style={styles.selectedAgeText}>
                    {item}
                  </Text>
                  <View style={styles.ageUnit}>
                    <Text style={styles.ageUnitText}>years</Text>
                  </View>
                </View>
                <View style={styles.ageFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="heart" size={14} color={Colors.text.inverted} />
                    <Text style={styles.featureText}>Optimal</Text>
                  </View>
                  {ageNumber < 30 && (
                    <View style={styles.featureItem}>
                      <Ionicons name="flash" size={14} color={Colors.text.inverted} />
                      <Text style={styles.featureText}>Energy</Text>
                    </View>
                  )}
                  {ageNumber >= 30 && ageNumber < 50 && (
                    <View style={styles.featureItem}>
                      <Ionicons name="fitness" size={14} color={Colors.text.inverted} />
                      <Text style={styles.featureText}>Balance</Text>
                    </View>
                  )}
                  {ageNumber >= 50 && (
                    <View style={styles.featureItem}>
                      <Ionicons name="shield-checkmark" size={14} color={Colors.text.inverted} />
                      <Text style={styles.featureText}>Wisdom</Text>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.regularContent}>
              <Text style={[
                styles.ageText,
                ageNumber < 30 && styles.youngAge,
                ageNumber >= 30 && ageNumber < 50 && styles.midAge,
                ageNumber >= 50 && styles.seniorAge,
              ]}>
                {item}
              </Text>
              <View style={[
                styles.ageDot,
                ageNumber < 30 && { backgroundColor: Colors.features.mindfulness },
                ageNumber >= 30 && ageNumber < 50 && { backgroundColor: Colors.features.meditation },
                ageNumber >= 50 && { backgroundColor: Colors.features.therapy },
              ]} />
            </View>
          )}
        </TouchableOpacity>
      </RNAnimated.View>
    );
  };

  return (
    <LinearGradient
      colors={[Colors.background.main, Colors.background.subtle]}
      style={styles.container}
    >
      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={[styles.floatingCircle, styles.circle1]} />
        <View style={[styles.floatingCircle, styles.circle2]} />
        <View style={[styles.floatingCircle, styles.circle3]} />
      </View>

      <Headers 
        onBack={() => navigation.goBack()} 
        currentStep="2" 
        showProgress 
      />
      
      <Animated.View 
        entering={FadeInDown.duration(800).springify().damping(15)}
        style={styles.titleContainer}
      >
        <Title>How old are you?</Title>
        {/* <Text style={styles.subtitle}>
          Select your age to personalize your experience
        </Text> */}
      </Animated.View>

      {/* Age Indicator */}
      <AgeIndicator />

      <View style={styles.pickerWrapper}>
        <Animated.View 
          entering={ZoomIn.duration(1000).springify().damping(15)}
          style={styles.pickerContainer}
        >
          {/* Enhanced Center Highlight */}
          <LinearGradient
            colors={['transparent', Colors.brand.primary + '15', 'transparent']}
            style={styles.centerHighlight}
          />
          
          {/* Scroll Indicators */}
          <LinearGradient
            colors={[Colors.background.main, 'transparent']}
            style={styles.scrollIndicatorTop}
          />
          <LinearGradient
            colors={['transparent', Colors.background.main]}
            style={styles.scrollIndicatorBottom}
          />
          
          {/* Selection Frame */}
          <View style={styles.selectionFrame}>
            <View style={[styles.frameCorner, styles.cornerTopLeft]} />
            <View style={[styles.frameCorner, styles.cornerTopRight]} />
            <View style={[styles.frameCorner, styles.cornerBottomLeft]} />
            <View style={[styles.frameCorner, styles.cornerBottomRight]} />
          </View>

          <RNAnimated.FlatList
            ref={flatListRef}
            data={AGES}
            renderItem={renderAgeItem}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            initialScrollIndex={AGES.indexOf('25')}
            getItemLayout={(data, index) => (
              { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
            )}
            contentContainerStyle={styles.listContent}
            style={styles.list}
          />
        </Animated.View>
      </View>

      {/* Age Statistics */}
      <Animated.View 
        entering={SlideInUp.duration(800).springify()}
        style={styles.statsContainer}
      >
        <View style={styles.statItem}>
          <Ionicons name="heart-circle" size={24} color={Colors.status.success} />
          <Text style={styles.statValue}>18-25</Text>
          <Text style={styles.statLabel}>Young Adult</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="barbell" size={24} color={Colors.brand.primary} />
          <Text style={styles.statValue}>26-45</Text>
          <Text style={styles.statLabel}>Prime Years</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.accent.teal} />
          <Text style={styles.statValue}>46+</Text>
          <Text style={styles.statLabel}>Wisdom Stage</Text>
        </View>
      </Animated.View>

      <Animated.View 
        style={styles.buttonContainer}
        entering={FadeInUp.duration(1000).springify().damping(15)}
      >
        <AppButton 
          onPress={() => navigation.navigate('WeightSelection', { 
            health_goal: health_goal, 
            age: selectedAge 
          })} 
          title={`Continue with ${selectedAge} years`}
          gradient={Colors.gradients.calm}
          icon="chevron-forward"
        />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: Colors.brand.primary,
    top: '10%',
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: Colors.accent.violet,
    bottom: '20%',
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: Colors.accent.teal,
    top: '40%',
    left: '20%',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: -10,
    marginTop: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: -20,
    fontFamily: 'Inter-Regular',
  },
  ageIndicator: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: -10,
  },
  indicatorGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.brand.primary + '30',
  },
  indicatorText: {
    fontSize: 18,
    color: Colors.brand.primary,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  indicatorPulse: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.status.success,
  },
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: '55%',
  },
  pickerContainer: {
    height: PICKER_HEIGHT,
    width: SELECTED_ITEM_WIDTH + 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  centerHighlight: {
    position: 'absolute',
    height: SELECTED_ITEM_HEIGHT - 10,
    width: SELECTED_ITEM_WIDTH + 20,
    borderRadius: 25,
    zIndex: -1,
  },
  scrollIndicatorTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 2,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  scrollIndicatorBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 2,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  selectionFrame: {
    position: 'absolute',
    top: (PICKER_HEIGHT - SELECTED_ITEM_HEIGHT) / 2,
    left: (SELECTED_ITEM_WIDTH + 60 - SELECTED_ITEM_WIDTH - 40) / 2,
    width: SELECTED_ITEM_WIDTH + 40,
    height: SELECTED_ITEM_HEIGHT,
    zIndex: 1,
    pointerEvents: 'none',
  },
  frameCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Colors.brand.primary,
    borderWidth: 2,
    borderRadius: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  list: {
    width: '100%',
  },
  listContent: {
    paddingVertical: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
  },
  ageItem: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    perspective: 1000,
  },
  ageItemInner: {
    width: '75%',
    height: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.background.card,
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  selectedAgeItem: {
    width: SELECTED_ITEM_WIDTH,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,

  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  regularContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  selectedContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageBadge: {
    alignItems: 'center',
    marginBottom: 8,
  },
  ageText: {
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
    fontSize: 22,
    textAlign: 'center',
  },
  youngAge: {
    color: Colors.features.mindfulness,
  },
  midAge: {
    color: Colors.features.meditation,
  },
  seniorAge: {
    color: Colors.features.therapy,
  },
  selectedAgeText: {
    fontFamily: 'Inter-Bold',
    color: Colors.text.inverted,
    fontSize: 42,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ageUnit: {
    marginTop: -10,
  },
  ageUnitText: {
    fontFamily: 'Inter-Regular',
    color: Colors.text.inverted,
    fontSize: 14,
    opacity: 0.9,
  },
  ageFeatures: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    fontFamily: 'Inter-Medium',
    color: Colors.text.inverted,
    fontSize: 10,
  },
  ageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.text.primary,
    fontSize: 14,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    color: Colors.text.tertiary,
    fontSize: 12,
  },
  buttonContainer: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
});

export default AgeSelection;