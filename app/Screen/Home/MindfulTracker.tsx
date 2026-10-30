import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from '@react-navigation/native';

const MindfulTracker = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wellness Dashboard</Text>
        <TouchableOpacity>
          <Ionicons name="stats-chart" size={24} color="#2D3748" />
        </TouchableOpacity>
      </View>

      {/* Mindful Hours */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Mindful Hours</Text>
            <Text style={styles.stat}>2.5h/8h</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { width: "31.25%" }]} />
              </View>
              <Text style={styles.progressText}>31% completed</Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
            style={{ opacity: 0.7 }}
          />
        </View>
      </LinearGradient>

      {/* Sleep Quality */}
      <LinearGradient
        colors={["#A78BFA", "#7E5BEF"]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="moon" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Sleep Quality</Text>
            <Text style={styles.stat}>Insomniac (~2h Avg)</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: "20%",
                      backgroundColor: "#C4B5FD",
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>Needs improvement</Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
            style={{ opacity: 0.7 }}
          />
        </View>
      </LinearGradient>

      {/* Mindful Journal */}
      <LinearGradient
        colors={["#48BB78", "#38A169"]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.cardContent} onPress={() => navigation.navigate("MindfulJournal")}>
          <View style={styles.iconContainer}>
            <Ionicons name="book" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Mindful Journal</Text>
            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>64 Day Streak</Text>
              <View style={styles.fireIcon}>
                <Ionicons name="flame" size={16} color="#FC8181" />
              </View>
            </View>
            <Text style={styles.subText}>Keep up the good work!</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
            style={{ opacity: 0.7 }}
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stress Level */}
      <LinearGradient
        colors={["#F687B3", "#ED64A6"]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.cardContent} onPress={() => navigation.navigate("stressLevel")}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="brain"
              size={24}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Stress Level</Text>
            <Text style={styles.stat}>Level 3 (Normal)</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    { width: "60%", backgroundColor: "#FBB6CE" },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>Moderate stress</Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
            style={{ opacity: 0.7 }}
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Mood Tracker */}
      <LinearGradient
        colors={["#68D391", "#48BB78"]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => navigation.navigate("MoodTracker")}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name="smile" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Mood Tracker</Text>
            <View style={styles.moodContainer}>
              <View style={styles.moodItem}>
                <View
                  style={[
                    styles.moodDot,
                    { backgroundColor: "#F56565" },
                  ]}
                />
                <Text style={styles.moodText}>Sad</Text>
              </View>
              <View style={styles.moodItem}>
                <View
                  style={[
                    styles.moodDot,
                    { backgroundColor: "#783463" },
                  ]}
                />
                <Text style={styles.moodText}>Happy</Text>
              </View>
              <View style={styles.moodItem}>
                <View
                  style={[
                    styles.moodDot,
                    { backgroundColor: "#68D391" },
                  ]}
                />
                <Text style={styles.moodText}>Neutral</Text>
              </View>
            </View>
            <Text style={styles.subText}>Today's mood: Happy</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
            style={{ opacity: 0.7 }}
          />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: "#2D3748",
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  stat: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBackground: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  progressText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  streakText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  fireIcon: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 2,
  },
  subText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 4,
  },
  moodItem: {
    alignItems: "center",
    flex: 1,
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  moodText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default MindfulTracker;