// components/AnimatedGoalButton.js
import React, { memo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GoalButton from './GoalButton';

const AnimatedGoalButton = memo(({ goal, index, selectedGoal, onSelect }) => (
  <Animated.View entering={FadeInDown.duration(800).delay(100 * index).springify()}>
    <GoalButton
      text={goal.text}
      icon={goal.icon}
      iconFamily={goal.iconFamily || 'Feather'}
      color={goal.color}
      selected={selectedGoal === goal.text}
      onSelect={onSelect}
    />
  </Animated.View>
));

export default AnimatedGoalButton;