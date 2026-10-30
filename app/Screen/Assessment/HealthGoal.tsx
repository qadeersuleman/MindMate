import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// User defined components
import AnimatedGoalButton from "../../components/Assessment/AnimatedGoalButton";
import Colors from '../../assets/colors';
import Headers from '../../components/Assessment/Header';
import Title from '../../components/Assessment/Title';

// Goals data
const GOALS = [
  {
    text: 'I wanna reduce stress',
    icon: 'heart',
    iconFamily: 'Feather',
    color: '#EF4444',
  },
  {
    text: 'I wanna try AI Therapy',
    icon: 'cpu',
    iconFamily: 'Feather',
    color: '#5A8DEE',
  },
  {
    text: 'I want to be healthy',
    icon: 'shield',
    iconFamily: 'Feather',
    color: '#10B981',
  },
  {
    text: 'I want to be better person',
    icon: 'smile',
    iconFamily: 'Feather',
    color: '#F59E0B',
  },
  {
    text: 'Just exploring MindMate',
    icon: 'compass',
    iconFamily: 'Feather',
    color: '#7B61FF',
  },
];

const HealthGoal: React.FC<any> = ({ navigation }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedGoal) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    navigation.navigate('AgeSelection', { health_goal: selectedGoal });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.innerContainer}>
        <Headers onBack={() => navigation.goBack()} currentStep="1" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Title subtitle="Choose your primary focus so we can adapt your daily care plan and exercises">
            What's your primary goal today?
          </Title>

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
        </ScrollView>

        {/* Bottom Action Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedGoal && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedGoal}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                selectedGoal
                  ? ['#5A8DEE', '#7B61FF']
                  : ['#CBD5E1', '#94A3B8']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Feather
                name="arrow-right"
                size={18}
                color="#FFFFFF"
                style={{ marginLeft: 8 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  optionsContainer: {
    marginTop: 6,
  },
  bottomContainer: {
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#F8FAFC',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#5A8DEE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  continueButtonDisabled: {
    shadowOpacity: 0.05,
    elevation: 1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.3,
  },
});

export default HealthGoal;
