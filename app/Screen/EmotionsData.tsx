import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const MinimalDashboard = ({ navigation }) => {
  
  const buttons = [
    {
      id: 1,
      title: 'Text Emotion',
      subtitle: 'Write how you feel',
      icon: 'edit-3',
      colors: ['#667EEA', '#764BA2'],
      screen: 'TextEmotion',
    },
    {
      id: 2,
      title: 'Image Emotion',
      subtitle: 'Take a selfie',
      icon: 'camera',
      colors: ['#F093FB', '#F5576C'],
      screen: 'ImageEmotion',
    },
    {
      id: 3,
      title: 'Notifications',
      subtitle: 'Set reminders',
      icon: 'bell',
      colors: ['#4FACFE', '#00F2FE'],
      screen: 'PushNotification',
    },
  ];

  const handlePress = (screen) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.minimalContainer}>
      <View style={styles.minimalHeader}>
        <Text style={styles.minimalTitle}>Mental Health</Text>
        <Text style={styles.minimalSubtitle}>Choose assessment type</Text>
      </View>
      
      <View style={styles.minimalButtons}>
        {buttons.map((button) => (
          <TouchableOpacity
            key={button.id}
            style={styles.minimalButton}
            activeOpacity={0.9}
            onPress={() => handlePress(button.screen)}
          >
            <LinearGradient
              colors={button.colors}
              style={styles.minimalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.minimalIconContainer}>
                <Feather name={button.icon} size={32} color="#fff" />
              </View>
              <View style={styles.minimalTextContainer}>
                <Text style={styles.minimalButtonTitle}>{button.title}</Text>
                <Text style={styles.minimalButtonSubtitle}>{button.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  minimalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  minimalHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  minimalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  minimalSubtitle: {
    fontSize: 16,
    color: '#718096',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  minimalButtons: {
    gap: 16,
  },
  minimalButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  minimalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  minimalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  minimalTextContainer: {
    flex: 1,
  },
  minimalButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  minimalButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Inter-Regular',
  },
});

export default MinimalDashboard;