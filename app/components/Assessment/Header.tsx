import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface HeadersProps {
  onBack: () => void;
  currentStep: string | number;
  showProgress?: boolean;
  color?: string;
}

const Headers: React.FC<HeadersProps> = React.memo(({ onBack, currentStep }) => {
  const stepNum = typeof currentStep === 'number' ? currentStep : parseInt(currentStep, 10) || 1;
  const totalSteps = 5;
  const progressPercent = Math.min((stepNum / totalSteps) * 100, 100);

  return (
    <View style={styles.headerWrapper}>
      <Animated.View style={styles.header} entering={FadeInLeft.duration(600)}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.assessmentText}>
            Assessment
          </Text>
        </View>

        <Animated.View
          style={styles.counterContainer}
          entering={FadeInRight.duration(600)}
        >
          <Text style={styles.counterText}>
            Step {currentStep} of 05
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Modern Sleek Step Progress Line */}
      <View style={styles.progressBarTrack}>
        <LinearGradient
          colors={['#5A8DEE', '#7B61FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  headerWrapper: {
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  assessmentText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#0F172A',
    fontFamily: 'Poppins-SemiBold',
  },
  counterContainer: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(90, 141, 238, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(90, 141, 238, 0.25)',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A8DEE',
    fontFamily: 'Inter-SemiBold',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#EEF2F6',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default Headers;
