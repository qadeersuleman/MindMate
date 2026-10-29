// components/StepCounter.js
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { LightSpeedInRight } from 'react-native-reanimated';
import Colors from '../../assets/colors';

const AssessmentScreen = ({ currentStep, totalSteps = 14 }) => (
  <Animated.View
    style={[styles.counterContainer, { backgroundColor: Colors.accent.coralPastel }]}
    entering={LightSpeedInRight.duration(800)}
  >
    <Text style={[styles.counterText, { color: Colors.accent.coralDark }]}>
      {currentStep} of {totalSteps}
    </Text>
  </Animated.View>
);

// You can reuse the same styles from your Headers component
const styles = StyleSheet.create({
  counterContainer: {
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: Colors.accent.coralDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  counterText: {
    fontWeight: 'bold',
    fontFamily: 'Inter-SemiBold',
  },
});

export default AssessmentScreen;