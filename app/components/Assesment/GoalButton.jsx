// components/GoalButton.js
import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const GoalButton = ({
  text,
  icon,
  iconFamily,
  color,
  selected,
  onSelect,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const IconComponent =
    iconFamily === 'FontAwesome' ? FontAwesome :
    iconFamily === 'Feather' ? Feather :
    MaterialIcons;

  const handlePress = () => {
    onSelect(text); // call parent handler
    scale.value = withSpring(0.95, { damping: 3 }, () => {
      scale.value = withSpring(1);
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        {
          backgroundColor: selected ? '#4568dc' : '#ffffff',
          borderColor: selected ? '#2743a6' : '#4568dc',
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.optionContent, animatedStyle]}>
        <View style={styles.iconContainer}>
          <IconComponent name={icon} size={20} color={selected ? '#fff' : color} />
        </View>
        <Text style={[styles.optionText, { color: selected ? '#fff' : '#111' }]}>
          {text}
        </Text>
        <View style={styles.radioContainer}>
          <MaterialIcons
            name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
            size={24}
            color={selected ? '#fff' : '#aaa'}
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionButton: {
    padding: 18,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 50,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    fontFamily: 'Inter-Medium',
  },
  radioContainer: {
    marginLeft: 10,
  },
});

export default GoalButton;
