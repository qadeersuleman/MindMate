import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  withDelay,
} from "react-native-reanimated";
import Colors from "../../assets/colors"; // Import your colors file

import { getSession } from "../../utils/session";

// Mock session function for testing

const HeaderProfile = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animation values using Reanimated
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(-50);
  const scaleAnim = useSharedValue(0.8);
  const notificationPulse = useSharedValue(1);
  const profileScale = useSharedValue(0.9);

  // Get current date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const sessionData = await getSession();
        setUserData(sessionData);

        // Start animations after data is loaded
        fadeAnim.value = withTiming(1, { duration: 800 });
        slideAnim.value = withSpring(0, { damping: 10, stiffness: 100 });
        scaleAnim.value = withSpring(1, { damping: 10, stiffness: 100 });
        profileScale.value = withSpring(1, { damping: 10, stiffness: 100 });

        // Notification badge pulse animation
        notificationPulse.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 500 }),
            withTiming(1, { duration: 500 })
          ),
          -1, // Infinite repetition
          true
        );
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const dateStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateX: slideAnim.value }],
    };
  });

  const notificationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: notificationPulse.value }],
    };
  });

  const badgeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const profileStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: profileScale.value }],
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });

  const searchStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: Colors.brand.primary }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Header with date and notification */}
      <View style={styles.headerRow}>
        <Animated.View style={[styles.dateContainer, dateStyle]}>
          <MaterialIcons
            name="date-range"
            size={20}
            color={Colors.text.inverted}
          />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </Animated.View>

        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate("Notifications")} >
          <Animated.View
            style={[styles.notificationContainer, notificationStyle]}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.text.inverted}
            />
            <Animated.View style={[styles.badge, badgeStyle]}>
              <Text style={styles.badgeText}>7</Text>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <Animated.View style={[styles.profileContainer, profileStyle]}>
      
        <Animated.Image
          source={{
            uri:
              userData?.profile_image ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
          }}
          style={[styles.profileImage, imageStyle]}
        />
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>
            Hi, {userData?.full_name || "Guest"}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingTop: 5,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Ionicons name="star" size={20} color="gold" />
              <Text style={{ color: Colors.text.inverted, fontSize: 14 }}>
                Free
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Ionicons name="pulse" size={20} color={"#34c759"} />
              <Text style={{ color: Colors.text.inverted, fontSize: 14 }}>
                80%
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Ionicons name="happy" size={20} color={"gold"} />
              <Text style={{ color: Colors.text.inverted, fontSize: 14 }}>
                Neutral
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View style={[styles.searchContainer, searchStyle]}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.text.tertiary}
          style={styles.searchIcon}
        />
        <Text style={styles.searchText}>Search anything...</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.brand.primary,
    paddingTop: 15,
    padding: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    color: Colors.text.inverted,
  },
  notificationContainer: {
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 20,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.status.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.brand.primary,
  },
  badgeText: {
    color: Colors.text.inverted,
    fontSize: 12,
    fontWeight: "bold",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  profileTextContainer: {
    flex: 1,
  },
  greetingText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginBottom: 4,
  },
  profileName: {
    color: Colors.text.inverted,
    fontSize: 25,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutrals.white,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    shadowColor: Colors.ui.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchText: {
    color: Colors.text.tertiary,
    fontSize: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: Colors.text.inverted,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HeaderProfile;
