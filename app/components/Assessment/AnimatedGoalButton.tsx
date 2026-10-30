import React, { memo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GoalButton from './GoalButton';

export interface GoalItem {
  text: string;
  icon: string;
  iconFamily?: string;
  color?: string;
}

export interface AnimatedGoalButtonProps {
  goal: GoalItem;
  index: number;
  selectedGoal: string | null;
  onSelect: (text: string) => void;
}

const AnimatedGoalButton: React.FC<AnimatedGoalButtonProps> = memo(({ goal, index, selectedGoal, onSelect }) => (
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
