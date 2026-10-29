import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";

import AITherapySection from "./AITherapySection";
import ArticlesSection from "./ArticlesSection";
import HomeCards from "../../Screen/Home/HomeCards";
import HomeProfile from "../../Screen/Home/HeaderProfile";
import MindfulTracker from "./MindfulTracker";
import Colors from "../../assets/colors";
import YoutubeSection from "./YoutubeSection";
import BottomNavigation from "./BottomNavigation";

const { width, height } = Dimensions.get("window");

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Status Bar - Shows battery, time, etc. */}
      <StatusBar 
        // barStyle="dark-content"
        // backgroundColor={Colors.background.card}
        // translucent={false}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Home Profile/Header Section */}
        <HomeProfile navigation={navigation} />
        
        {/* Home Cards Section */}
        <HomeCards />
        
        {/* Mindful Tracker Section */}
        <MindfulTracker />
        
        {/* AI Therapy Section */}
        <AITherapySection />
        
        {/* Articles Section */}
        <ArticlesSection />
        
        {/* YouTube Section */}
        <YoutubeSection />
        
        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation - Fixed at bottom */}
      <BottomNavigation navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Space for bottom navigation
  },
  bottomSpacing: {
    height: 20,
  },
});

export default Home;