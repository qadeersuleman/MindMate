import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getSession, clearSession } from "../../utils/session";
import Colors from "../../assets/colors";
import Screen from "../../components/Screen";
import BottomNavigation from "./BottomNavigation";

const { width } = Dimensions.get("window");

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simple animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    startAnimations();
  }, []);

  const loadUserData = async () => {
    try {
      const session = await getSession();
      console.log("User session:", session); // Debug log
      setUserData(session);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setIsLoading(false);
    }
  };

  const startAnimations = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: performLogout },
    ]);
  };

  const performLogout = async () => {
    try {
      await clearSession();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <Screen>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <LinearGradient
              colors={Colors.gradients.calm}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  {userData?.profile_image ? (
                    <Image
                      source={{ uri: userData.profile_image }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={32} color={Colors.text.inverted} />
                    </View>
                  )}
                  <View style={styles.onlineDot} />
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {userData?.full_name || "User Name"}
                  </Text>
                  <Text style={styles.userEmail}>
                    {userData?.email || "user@example.com"}
                  </Text>
                  <View style={styles.memberBadge}>
                    <Text style={styles.memberText}>Premium Member</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.status.success + '20' }]}>
                <Ionicons name="fitness" size={24} color={Colors.status.success} />
              </View>
              <Text style={styles.statValue}>{userData?.weight || "N/A"}</Text>
              <Text style={styles.statLabel}>Weight</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.accent.coral + '20' }]}>
                <Ionicons name="heart" size={24} color={Colors.accent.coral} />
              </View>
              <Text style={styles.statValue}>
                {userData?.date_of_birth ? 
                  new Date().getFullYear() - new Date(userData.date_of_birth).getFullYear() 
                  : "N/A"
                }
              </Text>
              <Text style={styles.statLabel}>Age</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.brand.primary + '20' }]}>
                <Ionicons name="trending-up" size={24} color={Colors.brand.primary} />
              </View>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>

          {/* Personal Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <InfoRow 
              icon="person-outline" 
              label="Full Name" 
              value={userData?.full_name || "Not set"} 
            />
            <InfoRow 
              icon="person" 
              label="Gender" 
              value={userData?.gender || "Not set"} 
            />
            <InfoRow 
              icon="calendar-outline" 
              label="Birth Date" 
              value={userData?.date_of_birth ? 
                new Date(userData.date_of_birth).toLocaleDateString() : "Not set"
              } 
            />
            <InfoRow 
              icon="call-outline" 
              label="Phone" 
              value={userData?.phone_number || "Not set"} 
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <LinearGradient
                colors={Colors.gradients.calm}
                style={styles.buttonGradient}
              >
                <Ionicons name="create-outline" size={20} color={Colors.text.inverted} />
                <Text style={styles.buttonText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <LinearGradient
                colors={[Colors.status.error, Colors.accent.coralDark]}
                style={styles.buttonGradient}
              >
                <Ionicons name="log-out-outline" size={20} color={Colors.text.inverted} />
                <Text style={styles.buttonText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNavigation navigation={navigation} />
      </Animated.View>
    </Screen>
  );
}

// Simple Info Row Component
const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <Ionicons name={icon} size={20} color={Colors.brand.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.main,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSection: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  headerGradient: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.text.inverted,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.text.inverted,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.status.success,
    borderWidth: 2,
    borderColor: Colors.text.inverted,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.inverted,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.text.inverted,
    opacity: 0.9,
    marginBottom: 8,
  },
  memberBadge: {
    backgroundColor: Colors.text.inverted + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  memberText: {
    fontSize: 12,
    color: Colors.text.inverted,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  infoCard: {
    backgroundColor: Colors.background.card,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.text.inverted,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});

