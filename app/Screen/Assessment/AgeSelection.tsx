import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Animated as RNAnimated,
} from 'react-native';
import Animated, { 
  FadeInUp, 
  FadeInDown, 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../assets/colors';
import AppButton from '../../components/AppButton';
import Headers from '../../components/Assessment/Header';
import Title from '../../components/Assessment/Title';

const { width } = Dimensions.get('window');
const AGES = Array.from({ length: 83 }, (_, i) => (i + 18).toString()); // 18 to 100
const ITEM_HEIGHT = 64;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 320

const AgeSelection = ({ route, navigation }: any) => {
  const [selectedAge, setSelectedAge] = useState('25');
  const flatListRef = useRef<any>(null);
  const scrollY = useRef(new RNAnimated.Value(AGES.indexOf('25') * ITEM_HEIGHT)).current;
  const lastIndex = useRef(AGES.indexOf('25'));

  const { health_goal } = route.params || {};

  // Ultra-smooth native scroll listener
  const handleScroll = RNAnimated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const clampedIndex = Math.min(Math.max(index, 0), AGES.length - 1);
        if (clampedIndex !== lastIndex.current) {
          lastIndex.current = clampedIndex;
          setSelectedAge(AGES[clampedIndex]);
        }
      }
    }
  );

  const handleScrollEnd = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.min(Math.max(index, 0), AGES.length - 1);
    if (clampedIndex !== lastIndex.current) {
      lastIndex.current = clampedIndex;
      setSelectedAge(AGES[clampedIndex]);
    }
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  const currentAgeNum = parseInt(selectedAge, 10) || 25;

  const renderAgeItem = ({ item, index }: any) => {
    const inputRange = [
      (index - 2) * ITEM_HEIGHT,
      (index - 1) * ITEM_HEIGHT,
      index * ITEM_HEIGHT,
      (index + 1) * ITEM_HEIGHT,
      (index + 2) * ITEM_HEIGHT,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.72, 0.88, 1.18, 0.88, 0.72],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.2, 0.45, 1, 0.45, 0.2],
      extrapolate: 'clamp',
    });

    return (
      <RNAnimated.View
        style={[
          styles.ageItem,
          {
            height: ITEM_HEIGHT,
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.ageItemInner}
          onPress={() => scrollToIndex(index)}
          activeOpacity={0.7}
        >
          <Text style={styles.ageText}>{item}</Text>
          <Text style={styles.ageSubtext}>years</Text>
        </TouchableOpacity>
      </RNAnimated.View>
    );
  };

  return (
    <LinearGradient
      colors={[Colors.background.main, Colors.background.subtle]}
      style={styles.container}
    >
      <Headers 
        onBack={() => navigation.goBack()} 
        currentStep="2" 
        showProgress 
      />
      
      <Animated.View 
        entering={FadeInDown.duration(350)}
        style={styles.titleContainer}
      >
        <Title>How old are you?</Title>
      </Animated.View>

      {/* Modern Selected Age Display */}
      <View style={styles.ageIndicatorContainer}>
        <LinearGradient
          colors={Colors.gradients.primary}
          style={styles.indicatorGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.indicatorValue}>{selectedAge}</Text>
          <Text style={styles.indicatorUnit}>years old</Text>
        </LinearGradient>
      </View>

      {/* Wheel Picker Container */}
      <View style={styles.pickerWrapper}>
        <View style={styles.pickerContainer}>
          {/* Active Center Target Highlight */}
          <View style={styles.centerHighlight}>
            <LinearGradient
              colors={['rgba(90, 141, 238, 0.08)', 'rgba(123, 97, 255, 0.14)', 'rgba(90, 141, 238, 0.08)']}
              style={styles.centerHighlightGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <View style={styles.centerBorderTop} />
            <View style={styles.centerBorderBottom} />
          </View>
          
          {/* Subtle Top & Bottom Gradient Fades */}
          <LinearGradient
            colors={[Colors.background.main, 'transparent']}
            style={styles.scrollIndicatorTop}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', Colors.background.main]}
            style={styles.scrollIndicatorBottom}
            pointerEvents="none"
          />

          <RNAnimated.FlatList
            ref={flatListRef}
            data={AGES}
            renderItem={renderAgeItem}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            snapToAlignment="center"
            decelerationRate="fast"
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScrollEnd}
            onScrollEndDrag={handleScrollEnd}
            scrollEventThrottle={16}
            initialScrollIndex={AGES.indexOf('25')}
            getItemLayout={(data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            contentContainerStyle={styles.listContent}
            style={styles.list}
          />
        </View>
      </View>

      {/* Age Categories with Live Highlight */}
      <View style={styles.statsContainer}>
        <View style={[styles.statItem, currentAgeNum <= 25 && styles.statItemActive]}>
          <Ionicons 
            name="flash-outline" 
            size={18} 
            color={currentAgeNum <= 25 ? Colors.brand.primary : Colors.text.tertiary} 
          />
          <Text style={[styles.statValue, currentAgeNum <= 25 && styles.statValueActive]}>18-25</Text>
          <Text style={styles.statLabel}>Young Adult</Text>
        </View>
        
        <View style={[styles.statItem, currentAgeNum > 25 && currentAgeNum <= 45 && styles.statItemActive]}>
          <Ionicons 
            name="fitness-outline" 
            size={18} 
            color={currentAgeNum > 25 && currentAgeNum <= 45 ? Colors.brand.primary : Colors.text.tertiary} 
          />
          <Text style={[styles.statValue, currentAgeNum > 25 && currentAgeNum <= 45 && styles.statValueActive]}>26-45</Text>
          <Text style={styles.statLabel}>Prime Years</Text>
        </View>
        
        <View style={[styles.statItem, currentAgeNum > 45 && styles.statItemActive]}>
          <Ionicons 
            name="shield-checkmark-outline" 
            size={18} 
            color={currentAgeNum > 45 ? Colors.brand.primary : Colors.text.tertiary} 
          />
          <Text style={[styles.statValue, currentAgeNum > 45 && styles.statValueActive]}>46+</Text>
          <Text style={styles.statLabel}>Wisdom</Text>
        </View>
      </View>

      {/* Bottom Button */}
      <Animated.View 
        style={styles.buttonContainer}
        entering={FadeInUp.duration(350)}
      >
        <AppButton 
          onPress={() => navigation.navigate('Mood', { 
            health_goal: health_goal, 
            age: selectedAge 
          })} 
          title={`Continue with ${selectedAge} years`}
          gradient={Colors.gradients.primary}
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
  titleContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  ageIndicatorContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  indicatorGradient: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    gap: 6,
  },
  indicatorValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  indicatorUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: PICKER_HEIGHT + 20,
  },
  pickerContainer: {
    height: PICKER_HEIGHT,
    width: width * 0.78,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerHighlight: {
    position: 'absolute',
    top: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 16,
    zIndex: 0,
    justifyContent: 'center',
  },
  centerHighlightGradient: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,
  },
  centerBorderTop: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1.5,
    backgroundColor: Colors.brand.primary,
    opacity: 0.35,
    borderRadius: 1,
  },
  centerBorderBottom: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 1.5,
    backgroundColor: Colors.brand.primary,
    opacity: 0.35,
    borderRadius: 1,
  },
  scrollIndicatorTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    zIndex: 2,
  },
  scrollIndicatorBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    zIndex: 2,
  },
  list: {
    width: '100%',
    zIndex: 1,
  },
  listContent: {
    paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
  },
  ageItem: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageItemInner: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: '100%',
  },
  ageText: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  ageSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 8,
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    gap: 3,
  },
  statItemActive: {
    borderColor: Colors.brand.primary,
    backgroundColor: '#F5F8FF',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  statValueActive: {
    color: Colors.brand.primary,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 24,
  },
});

export default AgeSelection;
