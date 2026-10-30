import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";

// Type definitions
import { RootStackParamList } from "./app/types/navigation";

// Auth Screens
import AuthLoadingScreen from "./app/Screen/Authentication/AuthLoadingScreen";
import SplashScreen from "./app/Screen/SplashScreen";
import WelcomeScreen from "./app/Screen/Welcome/WelcomeScreen";
import Login from "./app/Screen/Authentication/Login";
import Signup from "./app/Screen/Authentication/Signup";
import ForgetPassword from "./app/Screen/Authentication/ForgetPassword";
import AuthSuccessScreen from "./app/Screen/Authentication/AuthSuccessScreen";

// Profile Screen
import EditProfile from "./app/Screen/Profile/EditProfile";

// Assessment Screens
import HealthGoal from "./app/Screen/Assessment/HealthGoal";
import AgeSelection from "./app/Screen/Assessment/AgeSelection";
import WeightSelection from "./app/Screen/Assessment/WeightSelection";
import MoodAssessment from "./app/Screen/Assessment/Mood";
import SleepQuality from "./app/Screen/Assessment/SleepQuality";
import SoundAnalysis from "./app/Screen/Assessment/SoundAnalysis";
import ExpressionAnalysis from "./app/Screen/Assessment/ExpressionAnalysis";
import CameraScreen from "./app/Screen/Assessment/CameraScreen";
import ResultsScreen from "./app/Screen/Assessment/ResultScreen";

// Main & Home Screens
import Home from "./app/Screen/Home/Home";
import SettingsScreen from "./app/Screen/Settings/SettingsScreen";
import ProfileScreen from "./app/Screen/Home/ProfileScreen";
import Youtube from "./app/Screen/Home/Youtube";

// Chat Screen
import MentalHealthChat from "./app/Screen/Chat/MentalHealthChat";

// Media & Content
import ArticleDetail from "./app/Screen/Media/ArticleDetail";
import VideoScreen from "./app/Screen/Media/VideoScreen";

// Push & Notifications
import MoodTracker from "./app/Screen/PushNotification/MoodTracker";
import stressLevel from "./app/Screen/PushNotification/stressLevel";
import MindfulJournal from "./app/Screen/PushNotification/MindfulJournal";
import NotificationScreen from "./app/Screen/PushNotification/NotificationScreen";
import PushNotificationScreen from "./app/Screen/PushNotification/PushNotificationScreen";

// Reports & Analysis
import MentalHealthReports from "./app/Screen/Reports/MentalHealthReports";
import MinimalDashboard from "./app/Screen/EmotionsData";
import ImageEmotionScreen from "./app/Screen/Analysis/ImageEmotionScreen";
import TextEmotionScreen from "./app/Screen/Analysis/TextEmotionScreen";
import BreathingCompletionScreen from "./app/Screen/BreathingCompletionScreen";

// Doctor Consultation
import AppNavigator from "./app/Screen/Doctor/AppNavigator";
import PatientDashboardScreen from "./app/Screen/Doctor/PatientDashboardScreen";

const Stack = createNativeStackNavigator<any>();

export default function App(): React.JSX.Element {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator id="root" initialRouteName="AuthLoading">
          {/* Initial / Auth Loading */}
          <Stack.Screen
            name="AuthLoading"
            component={AuthLoadingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="WelcomeScreen"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />

          {/* Authentication */}
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={Signup}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgetPassword"
            component={ForgetPassword}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AuthSuccess"
            component={AuthSuccessScreen}
            options={{ headerShown: false }}
          />

          {/* Profile */}
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={{ headerShown: false }}
          />

          {/* Assessment Flow */}
          <Stack.Screen
            name="HealthGoal"
            component={HealthGoal}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AgeSelection"
            component={AgeSelection}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="WeightSelection"
            component={WeightSelection}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Mood"
            component={MoodAssessment}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SleepQuality"
            component={SleepQuality}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SoundAnalysis"
            component={SoundAnalysis}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ExpressionAnalysis"
            component={ExpressionAnalysis}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CameraScreen"
            component={CameraScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ResultsScreen"
            component={ResultsScreen}
            options={{ headerShown: false }}
          />

          {/* Main App */}
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />

          {/* AI Therapy & Chat */}
          <Stack.Screen
            name="Chat"
            component={MentalHealthChat}
            options={{ headerShown: false }}
          />

          {/* Media & Resources */}
          <Stack.Screen
            name="ArticleDetail"
            component={ArticleDetail}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VideoScreen"
            component={VideoScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Youtube"
            component={Youtube}
            options={{ headerShown: false }}
          />

          {/* Notifications & Tracking */}
          <Stack.Screen
            name="MoodTracker"
            component={MoodTracker}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="stressLevel"
            component={stressLevel}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MindfulJournal"
            component={MindfulJournal}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PushNotification"
            component={PushNotificationScreen}
            options={{ headerShown: false }}
          />

          {/* Reports & Emotion Analysis */}
          <Stack.Screen
            name="Reports"
            component={MentalHealthReports}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EmotionsData"
            component={MinimalDashboard}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ImageEmotion"
            component={ImageEmotionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TextEmotion"
            component={TextEmotionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DataSend"
            component={TextEmotionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BreathingCompletion"
            component={BreathingCompletionScreen}
            options={{ headerShown: false }}
          />

          {/* Doctor Portal */}
          <Stack.Screen
            name="DoctorApp"
            component={AppNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PatientDashboard"
            component={PatientDashboardScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
