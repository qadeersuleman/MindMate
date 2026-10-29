// components/Headers.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { LightSpeedInLeft, LightSpeedInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../assets/colors';

const Headers = React.memo(({ onBack, currentStep }) => (
  <Animated.View style={styles.header} entering={LightSpeedInLeft.duration(800)}>
    <View style={styles.headerLeft}>
      <TouchableOpacity
        style={[styles.backButton, { borderColor: Colors.brand.primary }]}
        onPress={onBack}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.brand.primary} />
      </TouchableOpacity>
      <Text style={[styles.assessmentText, { color: Colors.brand.primary }]}>
        Assessment
      </Text>
    </View>
    <Animated.View
      style={[styles.counterContainer, { backgroundColor: Colors.accent.coralPastel }]}
      entering={LightSpeedInRight.duration(800)}
    >
      <Text style={[styles.counterText, { color: Colors.accent.coralDark }]}>
        {currentStep} of 05
      </Text>
    </Animated.View>
  </Animated.View>
));

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 50,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.3,
  },
  assessmentText: {
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
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

export default Headers;