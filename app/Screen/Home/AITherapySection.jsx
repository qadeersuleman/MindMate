import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../assets/colors';

const AITherapySection = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <FontAwesome5 name="robot" size={20} color={Colors.brand.primary} />
          </View>
          <Text style={styles.headerTitle}>AI Therapy Assistant</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Stats Card */}
      <LinearGradient
        colors={[Colors.brand.primary, Colors.accent.teal]}
        style={styles.statsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statsContent}>
          <View style={styles.statsTextContainer}>
            <Text style={styles.statsNumber}>2,541</Text>
            <Text style={styles.statsLabel}>Conversations</Text>
            
            <View style={styles.usageContainer}>
              <MaterialIcons name="data-usage" size={16} color={Colors.text.inverted} />
              <Text style={styles.usageText}>83 sessions left this month</Text>
            </View>
            
            <TouchableOpacity style={styles.proButton}>
              <MaterialIcons name="star" size={14} color={Colors.accent.coral} />
              <Text style={styles.proButtonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.robotContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1628015081036-0747ec8f077a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
              }}
              style={styles.robotImage}
            />
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.newChatButton}>
            <Ionicons name="add" size={24} color={Colors.text.inverted} />
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="flash" size={20} color={Colors.brand.primary} />
            <Text style={styles.quickActionText}>Quick Help</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Features Grid
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Therapy Features</Text>
        
        <View style={styles.featuresGrid}>
          <TouchableOpacity style={styles.featureCard}>
            <LinearGradient
              colors={[Colors.features.mindfulness, Colors.features.meditation]}
              style={styles.featureIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color={Colors.text.inverted} />
            </LinearGradient>
            <Text style={styles.featureTitle}>Chat Therapy</Text>
            <Text style={styles.featureDescription}>24/7 AI support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <LinearGradient
              colors={[Colors.features.journal, Colors.status.success]}
              style={styles.featureIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="book" size={24} color={Colors.text.inverted} />
            </LinearGradient>
            <Text style={styles.featureTitle}>Mood Journal</Text>
            <Text style={styles.featureDescription}>Track emotions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <LinearGradient
              colors={[Colors.accent.coral, Colors.features.mood]}
              style={styles.featureIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="analytics" size={24} color={Colors.text.inverted} />
            </LinearGradient>
            <Text style={styles.featureTitle}>Progress</Text>
            <Text style={styles.featureDescription}>View insights</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <LinearGradient
              colors={[Colors.accent.teal, Colors.brand.primary]}
              style={styles.featureIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="people" size={24} color={Colors.text.inverted} />
            </LinearGradient>
            <Text style={styles.featureTitle}>Community</Text>
            <Text style={styles.featureDescription}>Connect others</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Recent Sessions */}
      {/* <View style={styles.sessionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sessionList}>
          <View style={styles.sessionItem}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionDate}>Today, 10:30 AM</Text>
              <Text style={styles.sessionTopic}>Anxiety Management</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
          </View>

          <View style={styles.sessionItem}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionDate}>Yesterday, 3:15 PM</Text>
              <Text style={styles.sessionTopic}>Sleep Issues</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
          </View>

          <View style={styles.sessionItem}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionDate}>Oct 12, 9:00 AM</Text>
              <Text style={styles.sessionTopic}>Stress Relief</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
          </View>
        </View>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutrals.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand.primaryPastel,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutrals.surfaceLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTextContainer: {
    flex: 1,
  },
  statsNumber: {
    color: Colors.text.inverted,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 12,
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  usageText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 8,
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  proButtonText: {
    color: Colors.text.inverted,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  robotContainer: {
    alignItems: 'center',
  },
  robotImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.status.success,
    marginRight: 6,
  },
  statusText: {
    color: Colors.text.inverted,
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  newChatButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  newChatText: {
    color: Colors.text.inverted,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.text.inverted,
    padding: 16,
    borderRadius: 16,
  },
  quickActionText: {
    color: Colors.brand.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: Colors.neutrals.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  sessionsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    color: Colors.brand.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  sessionList: {
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.divider,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  sessionTopic: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AITherapySection;