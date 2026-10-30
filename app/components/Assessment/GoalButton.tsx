import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome, Feather, Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export interface GoalButtonProps {
  text: string;
  icon: string;
  iconFamily?: string;
  color?: string;
  selected: boolean;
  onSelect: (text: string) => void;
}

const GoalButton: React.FC<GoalButtonProps> = ({
  text,
  icon,
  iconFamily,
  color = '#5A8DEE',
  selected,
  onSelect,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const IconComponent: any =
    iconFamily === 'FontAwesome' ? FontAwesome :
    iconFamily === 'Feather' ? Feather :
    iconFamily === 'Ionicons' ? Ionicons :
    MaterialIcons;

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onSelect(text);
    scale.value = withSpring(0.97, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.optionButton,
          selected ? styles.optionButtonSelected : styles.optionButtonUnselected,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.optionContent}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: selected ? 'rgba(90, 141, 238, 0.15)' : `${color}18`,
              },
            ]}
          >
            <IconComponent
              name={icon}
              size={20}
              color={selected ? '#5A8DEE' : color}
            />
          </View>

          <Text
            style={[
              styles.optionText,
              selected ? styles.optionTextSelected : styles.optionTextUnselected,
            ]}
          >
            {text}
          </Text>

          <View style={styles.indicatorContainer}>
            {selected ? (
              <Ionicons name="checkmark-circle" size={22} color="#5A8DEE" />
            ) : (
              <View style={styles.unselectedRing} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  optionButtonUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  optionButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#5A8DEE',
    shadowColor: '#5A8DEE',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 14,
    fontFamily: 'Inter-Medium',
  },
  optionTextUnselected: {
    color: '#1E293B',
  },
  optionTextSelected: {
    color: '#0F172A',
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
  indicatorContainer: {
    marginLeft: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
});

export default GoalButton;
