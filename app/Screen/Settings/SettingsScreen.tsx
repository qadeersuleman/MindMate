import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '../../assets/colors';
import { getSession, clearSession } from '../../utils/session';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [userData, setUserData] = useState<any>(null);
  const [morningReminder, setMorningReminder] = useState<boolean>(true);
  const [eveningCheckIn, setEveningCheckIn] = useState<boolean>(true);
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(true);
  const [soundEffects, setSoundEffects] = useState<boolean>(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const session = await getSession();
      setUserData(session);
    } catch (e) {
      console.log('Error loading user session in Settings:', e);
    }
  };

  const triggerHaptic = (type = Haptics.ImpactFeedbackStyle.Light) => {
    if (hapticFeedback) {
      try {
        Haptics.impactAsync(type);
      } catch (e) {}
    }
  };

  const handleDialHelpline = (phoneNumber: string, name: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      `Call ${name}`,
      `Would you like to place a call to ${phoneNumber}? You will be connected to compassionate, free, and confidential crisis support.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'default',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`).catch(() => {
              Alert.alert('Unable to place call', `Please dial ${phoneNumber} directly from your phone app.`);
            });
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Sign Out', 'Are you sure you want to log out of MindMate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearSession();
          } catch (e) {
            console.warn('Sign out session clear error:', e);
          } finally {
            if (navigation?.reset) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } else if (navigation?.navigate) {
              navigation.navigate('Login');
            }
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Wellness</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {userData?.profile_image ? (
              <Image source={{ uri: userData.profile_image }} style={styles.avatarImg} />
            ) : (
              <LinearGradient colors={['#5A8DEE', '#7B61FF']} style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={28} color="#FFFFFF" />
              </LinearGradient>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData?.full_name || 'MindMate Member'}</Text>
            <Text style={styles.profileEmail}>{userData?.email || 'Active Account'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile', { isFirstTimeSignup: false, isNewUser: false })}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={16} color="#5A8DEE" />
          </TouchableOpacity>
        </View>

        {/* Emergency Crisis Lifelines (Essential for Mental Health App Store Guidelines) */}
        <View style={styles.sectionCard}>
          <View style={styles.crisisHeader}>
            <View style={styles.crisisBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#DC2626" />
              <Text style={styles.crisisBadgeText}>24/7 Crisis Support</Text>
            </View>
            <Text style={styles.crisisSub}>Confidential • Free • Immediate help</Text>
          </View>

          {/* Pakistan Helpline: Umang */}
          <TouchableOpacity
            style={styles.helplineItem}
            activeOpacity={0.75}
            onPress={() => handleDialHelpline('03117786264', 'Umang Mental Health Helpline')}
          >
            <View style={[styles.helplineIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="call" size={18} color="#DC2626" />
            </View>
            <View style={styles.helplineDetails}>
              <Text style={styles.helplineTitle}>Umang Helpline (Pakistan)</Text>
              <Text style={styles.helplineNumber}>0311-7786264 (24/7 Support)</Text>
            </View>
            <Feather name="phone-call" size={18} color="#DC2626" />
          </TouchableOpacity>

          {/* Emergency Ambulance / Rescue: 1122 */}
          <TouchableOpacity
            style={styles.helplineItem}
            activeOpacity={0.75}
            onPress={() => handleDialHelpline('1122', 'Rescue Emergency 1122')}
          >
            <View style={[styles.helplineIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="medkit" size={18} color="#D97706" />
            </View>
            <View style={styles.helplineDetails}>
              <Text style={styles.helplineTitle}>Rescue & Medical Services</Text>
              <Text style={styles.helplineNumber}>1122 (National Emergency)</Text>
            </View>
            <Feather name="phone-call" size={18} color="#D97706" />
          </TouchableOpacity>

          {/* International Crisis Line: 988 */}
          <TouchableOpacity
            style={styles.helplineItem}
            activeOpacity={0.75}
            onPress={() => handleDialHelpline('988', '988 Suicide & Crisis Lifeline')}
          >
            <View style={[styles.helplineIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="globe-outline" size={18} color="#2563EB" />
            </View>
            <View style={styles.helplineDetails}>
              <Text style={styles.helplineTitle}>Global Crisis Lifeline</Text>
              <Text style={styles.helplineNumber}>Dial 988 / Text HOME to 741741</Text>
            </View>
            <Feather name="phone-call" size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Daily Habits & Reminder Preferences */}
        <Text style={styles.sectionLabel}>DAILY HABITS & NOTIFICATIONS</Text>
        <View style={styles.settingGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Morning Motivation (8:00 AM)</Text>
              <Text style={styles.settingDesc}>Gentle mindful breathing & positive intent</Text>
            </View>
            <Switch
              value={morningReminder}
              onValueChange={(val) => {
                triggerHaptic();
                setMorningReminder(val);
              }}
              trackColor={{ false: '#CBD5E1', true: '#5A8DEE' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Evening Gratitude Check-in (8:30 PM)</Text>
              <Text style={styles.settingDesc}>Reflect on today's emotions and release stress</Text>
            </View>
            <Switch
              value={eveningCheckIn}
              onValueChange={(val) => {
                triggerHaptic();
                setEveningCheckIn(val);
              }}
              trackColor={{ false: '#CBD5E1', true: '#5A8DEE' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Haptic Touch Feedback</Text>
              <Text style={styles.settingDesc}>Vibration responses for mindful grounding</Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={(val) => {
                triggerHaptic();
                setHapticFeedback(val);
              }}
              trackColor={{ false: '#CBD5E1', true: '#5A8DEE' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Medical & Regulatory Disclaimer (Required by Google Play) */}
        <Text style={styles.sectionLabel}>CLINICAL & SAFETY DISCLAIMER</Text>
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="information-circle-outline" size={18} color="#64748B" />
            <Text style={styles.disclaimerTitle}>Not a Medical Substitute</Text>
          </View>
          <Text style={styles.disclaimerText}>
            MindMate is a self-care and emotional well-being companion designed to build healthy daily habits and provide reflective AI conversation. It is not a licensed medical device and does not diagnose, treat, prevent, or cure psychiatric disorders or clinical medical conditions. If you are experiencing symptoms of clinical illness, please consult a licensed psychiatrist, psychologist, or healthcare provider.
          </Text>
        </View>

        {/* Privacy & Account */}
        <Text style={styles.sectionLabel}>PRIVACY & SECURITY</Text>
        <View style={styles.settingGroup}>
          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed-outline" size={20} color="#10B981" />
            <Text style={styles.privacyText}>Your personal logs & chats remain private to your device.</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Feather name="log-out" size={18} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version Info */}
        <View style={styles.footerWrap}>
          <Text style={styles.appVersion}>MindMate AI • Version 2.2.0 (Play Store Edition)</Text>
          <Text style={styles.appSub}>Empathetic mental health companion</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrap: {
    marginRight: 14,
  },
  avatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  crisisHeader: {
    marginBottom: 12,
  },
  crisisBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  crisisBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 4,
  },
  crisisSub: {
    fontSize: 12,
    color: '#64748B',
  },
  helplineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  helplineIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helplineDetails: {
    flex: 1,
  },
  helplineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  helplineNumber: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  settingGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  settingDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  disclaimerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 6,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  privacyText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 10,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  footerWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  appVersion: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  appSub: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
});
