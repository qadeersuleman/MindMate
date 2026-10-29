import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Mental health notification templates
const MENTAL_HEALTH_NOTIFICATIONS = {
  morningMotivation: [
    {
      title: "🌅 Good Morning!",
      body: "Start your day with 3 deep breaths. You've got this! 💪",
    },
    {
      title: "☕ Morning Boost",
      body: "Remember to hydrate and take a moment for yourself today.",
    },
    {
      title: "🌟 Positive Start",
      body: "What's one thing you're grateful for today?",
    },
  ],
  mindfulnessReminder: [
    {
      title: "🧘 Mindfulness Break",
      body: "Take 2 minutes to focus on your breathing. Inhale peace, exhale stress.",
    },
    {
      title: "🌿 Present Moment",
      body: "Pause and notice 3 things around you. Stay grounded.",
    },
    {
      title: "💭 Thought Check",
      body: "How are you feeling right now? Acknowledge without judgment.",
    },
  ],
  selfCarePrompt: [
    {
      title: "💖 Self-Care Check",
      body: "Have you taken time for yourself today? Even 5 minutes counts!",
    },
    {
      title: "🛁 Nurture Yourself",
      body: "Remember: You can't pour from an empty cup. Take care of yourself first.",
    },
    {
      title: "🌻 Kindness Reminder",
      body: "Be as kind to yourself as you are to others. You deserve it.",
    },
  ],
  stressRelief: [
    {
      title: "🌬️ Stress Buster",
      body: "Try the 4-7-8 breathing technique: Inhale 4s, Hold 7s, Exhale 8s.",
    },
    {
      title: "🔄 Perspective Shift",
      body: "This moment will pass. You've overcome challenges before.",
    },
    {
      title: "🏃 Quick De-stress",
      body: "Stand up, stretch, and shake off the tension. You've got this!",
    },
  ],
  eveningReflection: [
    {
      title: "🌙 Evening Wind-down",
      body: "What went well today? Celebrate your small wins!",
    },
    {
      title: "✨ Reflection Time",
      body: "Journal one positive experience from today before bed.",
    },
    {
      title: "😴 Sleep Prep",
      body: "Turn off screens 30 min before bed for better sleep quality.",
    },
  ],
  emergencySupport: [
    {
      title: "🆘 Support Available",
      body: "Remember help is always available. You're not alone.",
    },
    {
      title: "🤝 Reach Out",
      body: "Talking helps. Consider reaching out to someone you trust.",
    },
    {
      title: "💪 You Matter",
      body: "Your feelings are valid. Take it one step at a time.",
    },
  ],
};

const NotificationTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted(status === 'granted');
  };

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionGranted(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Enable notifications for mental health reminders in Settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendNotification = async (category) => {
    if (!permissionGranted) {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications to receive mental health reminders.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: requestPermission }
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      const templates = MENTAL_HEALTH_NOTIFICATIONS[category];
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: randomTemplate.title,
          body: randomTemplate.body,
          sound: true,
          data: { type: 'mental_health', category },
        },
        trigger: null, // Send immediately
      });

      Alert.alert(
        '✅ Notification Sent!',
        'Check your notifications for mental health support.',
        [{ text: 'Got it' }]
      );
      
    } catch (error) {
      console.error('Notification error:', error);
      Alert.alert('Error', 'Failed to send notification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleDailyReminder = async () => {
    if (!permissionGranted) {
      requestPermission();
      return;
    }

    setIsLoading(true);
    try {
      // Clear existing notifications first
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule morning reminder (9 AM)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌞 Daily Mental Health Check",
          body: "How are you feeling today? Take a moment to check in with yourself.",
          sound: true,
          data: { type: 'daily_checkin' },
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });

      // Schedule afternoon break (3 PM)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌿 Afternoon Mindfulness",
          body: "Time for a quick mental break. Stretch and breathe deeply.",
          sound: true,
          data: { type: 'afternoon_break' },
        },
        trigger: {
          hour: 15,
          minute: 0,
          repeats: true,
        },
      });

      // Schedule evening reflection (8 PM)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✨ Evening Reflection",
          body: "What's one positive thing from today? Take a moment to reflect.",
          sound: true,
          data: { type: 'evening_reflection' },
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });

      Alert.alert(
        '✅ Daily Reminders Set!',
        'You\'ll receive mental health check-ins at 9 AM, 3 PM, and 8 PM daily.',
        [{ text: 'Great!' }]
      );
      
    } catch (error) {
      console.error('Scheduling error:', error);
      Alert.alert('Error', 'Failed to schedule reminders.');
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationButton = ({ 
    title, 
    subtitle, 
    icon, 
    iconFamily = 'Feather', 
    gradientColors, 
    onPress 
  }) => {
    const IconComponent = iconFamily === 'MaterialIcons' ? MaterialIcons :
                         iconFamily === 'FontAwesome5' ? FontAwesome5 :
                         iconFamily === 'Ionicons' ? Ionicons : Feather;

    return (
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onPress}
        disabled={isLoading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.buttonIconContainer}>
            <IconComponent name={icon} size={26} color="#fff" />
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>{title}</Text>
            <Text style={styles.buttonSubtitle}>{subtitle}</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Feather name="chevron-right" size={20} color="#fff" />
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <Feather name="bell" size={32} color="#fff" />
              <Text style={styles.headerTitle}>Mental Health Notifications</Text>
              <Text style={styles.headerSubtitle}>
                {permissionGranted 
                  ? 'Notifications enabled ✅' 
                  : 'Tap "Enable Notifications" below'}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Enable Notifications Section */}
        {!permissionGranted && (
          <View style={styles.permissionSection}>
            <View style={styles.permissionCard}>
              <MaterialIcons name="notification-important" size={40} color="#667EEA" />
              <Text style={styles.permissionTitle}>Enable Notifications</Text>
              <Text style={styles.permissionText}>
                Get helpful mental health reminders and support throughout your day
              </Text>
              <TouchableOpacity
                style={styles.enableButton}
                onPress={requestPermission}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#4CAF50', '#2E7D32']}
                  style={styles.enableGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Feather name="check-circle" size={20} color="#fff" />
                      <Text style={styles.enableButtonText}>Enable Notifications</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Daily Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Wellness Reminders</Text>
          <NotificationButton
            title="Set Daily Reminders"
            subtitle="Get 3 daily mental health check-ins"
            icon="clock"
            gradientColors={['#4FACFE', '#00F2FE']}
            onPress={scheduleDailyReminder}
          />
        </View>

        {/* Quick Test Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Mental Health Boost</Text>
          <Text style={styles.sectionDescription}>
            Tap to receive instant mental health support
          </Text>

          <NotificationButton
            title="Morning Motivation"
            subtitle="Start your day positively"
            icon="sunrise"
            gradientColors={['#FF9A9E', '#FAD0C4']}
            onPress={() => sendNotification('morningMotivation')}
          />

          <NotificationButton
            title="Mindfulness Reminder"
            subtitle="Take a mindful break"
            icon="wind"
            iconFamily="Feather"
            gradientColors={['#A1C4FD', '#C2E9FB']}
            onPress={() => sendNotification('mindfulnessReminder')}
          />

          <NotificationButton
            title="Self-Care Prompt"
            subtitle="Check in with yourself"
            icon="heart"
            gradientColors={['#FFECD2', '#FCB69F']}
            onPress={() => sendNotification('selfCarePrompt')}
          />

          <NotificationButton
            title="Stress Relief"
            subtitle="Quick de-stress techniques"
            icon="activity"
            gradientColors={['#FF9A9E', '#FECFEF']}
            onPress={() => sendNotification('stressRelief')}
          />

          <NotificationButton
            title="Evening Reflection"
            subtitle="Wind down positively"
            icon="moon"
            gradientColors={['#6A11CB', '#2575FC']}
            onPress={() => sendNotification('eveningReflection')}
          />

          <NotificationButton
            title="Support Reminder"
            subtitle="Remember help is available"
            icon="life-buoy"
            iconFamily="Feather"
            gradientColors={['#FF416C', '#FF4B2B']}
            onPress={() => sendNotification('emergencySupport')}
          />
        </View>

        {/* Instructions */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Feather name="info" size={24} color="#667EEA" />
            <Text style={styles.infoTitle}>How It Works</Text>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <View style={styles.infoBullet}>
                  <Text style={styles.infoBulletText}>1</Text>
                </View>
                <Text style={styles.infoText}>
                  Enable notifications for daily mental health support
                </Text>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.infoBullet}>
                  <Text style={styles.infoBulletText}>2</Text>
                </View>
                <Text style={styles.infoText}>
                  Tap any button to receive instant positive messages
                </Text>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.infoBullet}>
                  <Text style={styles.infoBulletText}>3</Text>
                </View>
                <Text style={styles.infoText}>
                  Set daily reminders for consistent mental wellness checks
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>
            {permissionGranted ? '✅ Ready to Support You' : '🔄 Setup Required'}
          </Text>
          <Text style={styles.statusText}>
            {permissionGranted 
              ? 'You\'ll receive mental health notifications. Take care! 💖'
              : 'Enable notifications to start receiving mental health support'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  headerGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  permissionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  enableButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  enableGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  notificationButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  buttonIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Inter-Regular',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoBulletText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  infoText: {
    fontSize: 14,
    color: '#4A5568',
    fontFamily: 'Inter-Regular',
    flex: 1,
    lineHeight: 20,
  },
  statusSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationTester;