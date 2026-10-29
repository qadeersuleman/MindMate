import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

// Third party libraries
import Animated, { FadeInUp } from 'react-native-reanimated';


// User defined components
import AnimatedGoalButton from "../../components/Assesment/AnimatedGoalButton";
import Colors from '../../assets/colors';
import Headers from '../../components/Assesment/Header'
import AppButton from '../../components/AppButton';
import Title from '../../components/Assesment/Title';


// Goals data
const GOALS = [
  {
    text: 'I wanna reduce stress',
    icon: 'heart',
    iconFamily: 'Feather', // Explicitly specify the family
    color: Colors.features.mood,
  },
  {
    text: 'I wanna try AI Therapy',
    icon: 'cpu',
    iconFamily: 'Feather',
    color: Colors.features.ai,
  },
  {
    text: 'I want to be healthy',
    icon: 'shield',
    iconFamily: 'Feather',
    color: Colors.features.meditation,
  },
  {
    text: 'I want to be better person',
    icon: 'smile', // Changed from 'smile-o' to 'smile'
    iconFamily: 'Feather', // Explicitly specify Feather
    color: Colors.features.journal,
  },
  {
    text: 'Just trying out the app',
    icon: 'compass',
    iconFamily: 'Feather',
    color: Colors.accent.teal,
  },
];

const HealthGoal = ({ navigation }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);

  return (
    <View style={[styles.container, { backgroundColor: Colors.neutrals.background }]}>
      <Headers onBack={() => navigation.goBack()} currentStep="1" />



      <Title style={styles.title}>What's your Health goal for today?</Title>

      <View style={styles.optionsContainer}>
        {GOALS.map((goal, index) => (
          <AnimatedGoalButton
            key={goal.text}
            goal={goal}
            index={index}
            selectedGoal={selectedGoal}
            onSelect={setSelectedGoal}
          />
        ))}
      </View>

      {selectedGoal ? (
        <AppButton onPress={() => navigation.navigate('AgeSelection', { health_goal: selectedGoal })} />
      ) : (
        <View style={styles.disabledButtonContainer}>
          <AppButton
            text="Continue" 
            onPress={() => {}}
            style={styles.continueButtonInactive}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingInline: 20,
  },
  optionsContainer: {
    marginBottom: 10,
  },
  continueButtonInactive: {
    backgroundColor: Colors.text.disabled,
  },
  disabledButtonContainer: {
    opacity: 0.7,
  },
});

export default HealthGoal;