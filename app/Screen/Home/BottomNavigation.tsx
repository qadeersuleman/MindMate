import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../../assets/colors";

const { width } = Dimensions.get("window");

export interface BottomNavigationProps {
  navigation: any;
  currentRoute?: 'Home' | 'Chat' | 'DoctorApp' | 'Reports' | 'ProfileScreen' | string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  navigation, 
  currentRoute = 'Home' 
}) => {
  const isHome = currentRoute === 'Home';
  const isChat = currentRoute === 'Chat';
  const isDoctors = currentRoute === 'DoctorApp';
  const isReports = currentRoute === 'Reports';
  const isProfile = currentRoute === 'ProfileScreen';

  return (
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNav}>
        {/* Home Tab */}
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, isHome && styles.activeIconContainer]}>
            <Ionicons 
              name={isHome ? "home" : "home-outline"} 
              size={22} 
              color={isHome ? Colors.brand.primary : Colors.text.tertiary} 
            />
          </View>
          <Text style={isHome ? styles.activeNavText : styles.navText}>Home</Text>
        </TouchableOpacity>
        
        {/* Chat Tab */}
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate("Chat")}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, isChat && styles.activeIconContainer]}>
            <Ionicons 
              name={isChat ? "chatbubble" : "chatbubble-outline"} 
              size={22} 
              color={isChat ? Colors.brand.primary : Colors.text.tertiary} 
            />
          </View>
          <Text style={isChat ? styles.activeNavText : styles.navText}>Chat</Text>
        </TouchableOpacity>
        
        {/* Central Doctors & Appointments Tab */}
        <TouchableOpacity 
          style={styles.centralNavItem} 
          onPress={() => navigation.navigate("DoctorApp")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isDoctors ? [Colors.brand.primaryDark, Colors.brand.secondary] : [Colors.brand.primary, Colors.brand.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.centralIconContainer}
          >
            <Ionicons name="medkit" size={24} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.centralNavText, isDoctors && { color: Colors.brand.primaryDark }]}>
            Doctors
          </Text>
        </TouchableOpacity>
        
        {/* Reports Tab */}
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate("Reports")}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, isReports && styles.activeIconContainer]}>
            <Ionicons 
              name={isReports ? "bar-chart" : "bar-chart-outline"} 
              size={22} 
              color={isReports ? Colors.brand.primary : Colors.text.tertiary} 
            />
          </View>
          <Text style={isReports ? styles.activeNavText : styles.navText}>Reports</Text>
        </TouchableOpacity>
        
        {/* Profile Tab */}
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate("ProfileScreen")}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, isProfile && styles.activeIconContainer]}>
            <Ionicons 
              name={isProfile ? "person" : "person-outline"} 
              size={22} 
              color={isProfile ? Colors.brand.primary : Colors.text.tertiary} 
            />
          </View>
          <Text style={isProfile ? styles.activeNavText : styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: Colors.brand.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    flex: 1,
  },
  centralNavItem: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    flex: 1,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconContainer: {
    backgroundColor: Colors.brand.primary + "18",
  },
  centralIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.brand.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  activeNavText: {
    color: Colors.brand.primary,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
    fontFamily: 'Inter-SemiBold',
  },
  navText: {
    color: Colors.text.tertiary,
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  centralNavText: {
    color: Colors.brand.primary,
    fontSize: 11,
    marginTop: 3,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
});

export default React.memo(BottomNavigation);
