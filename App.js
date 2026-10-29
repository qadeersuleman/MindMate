import { StyleSheet, View, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthLoadingScreen from "./app/Screen/Authentication/AuthLoadingScreen";

// Screen Imports
import SplashScreen from "./app/Screen/SplashScreen";
import WelcomeScreen from "./app/Screen/WelcomeScreens/WelcomeScreen";
import Login from "./app/Screen/Authentication/Login";
import Signup from "./app/Screen/Authentication/Signup";
import ForgetPassword from "./app/Screen/Authentication/ForgetPassword";
import AuthSuccessScreen from "./app/Screen/Authentication/AuthSuccessScreen";
import EditProfile from "./app/Screen/Profile/EditProfile";

// Assessment Screens
import HealthGoal from "./app/Screen/Assesment/HealthGoal";
import AgeSelection from "./app/Screen/Assesment/AgeSelection";
import WeightSelection from "./app/Screen/Assesment/WeightSelection";
import MoodAssessment from "./app/Screen/Assesment/Mood";
import SleepQuality from "./app/Screen/Assesment/SleepQuality";
import SoundAnalysis from "./app/Screen/Assesment/SoundAnalysis";
import ExpressionAnalysis from "./app/Screen/Assesment/ExpressionAnalysis";
import CameraScreen from "./app/Screen/Assesment/CameraScreen";

// Main App Screens
import Home from "./app/Screen/Home/Home";
import SettingsScreen from "./app/Screen/Faizan/SettingsScreen";
import HomeCards from "./app/Screen/Home/HomeCards";
import ArticlesSection from "./app/Screen/Home/ArticlesSection";
import MentalHealthChat from "./app/Screen/Chat/MentalHealthChat";
import DataSender from "./app/Screen/Extra/DataSender";
import ArticleDetail from "./app/Screen/Media/ArticleDetail";
import Youtube from "./app/Screen/Home/Youtube";
import MoodTracker from "./app/Screen/PushNotification/MoodTracker";
import stressLevel from "./app/Screen/PushNotification/stressLevel";
import MindfulJournal from "./app/Screen/PushNotification/MindfulJournal";
import MentalHealthReports from "./app/Screen/Reports/MentalHealthReports";
import AppointmentDetailScreen from "./app/Screen/Doctor/AppointmentDetailScreen";
import BookAppointmentScreen from "./app/Screen/Doctor/BookAppointmentScreen";
import DoctorDashboardScreen from "./app/Screen/Doctor/DoctorDashboardScreen";
import DoctorRegisterScreen from "./app/Screen/Doctor/DoctorRegisterScreen";
import PatientDashboardScreen from "./app/Screen/Doctor/PatientDashboardScreen";
import SearchDoctorsScreen from "./app/Screen/Doctor/SearchDoctorsScreen";
import SetAvailabilityScreen from "./app/Screen/Doctor/SetAvailabilityScreen";
import AppNavigator from "./app/Screen/Doctor/AppNavigator";
// import AIChatbot from "./AIchatbot";
import DetectEmotion from "./app/Screen/DetectEmotion";
import ProfileScreen from "./app/Screen/Home/ProfileScreen";

import Toast from "react-native-toast-message";
import NotificationScreen from "./app/Screen/PushNotification/NotificationScreen";
import VideoScreen from "./app/Media/VideoScreen";
import BreathingCompletionScreen from "./app/Screen/BreathingCompletionScreen";
import FastApi from "./app/Screen/FastApi";
import ChatScreen from "./app/Screen/ChatScreen";
import Lanat from "./app/Screen/Push";
import ResultsScreen from "./app/Screen/Assesment/ResultScreen";
import MinimalDashboard from "./app/Screen/EmotionsData";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AuthLoading">
        <Stack.Screen
          name="AuthLoading"
          component={AuthLoadingScreen}
          options={{ headerShown: false }}
        />

        {/* Initial Screens */}
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

        {/* Authentication Screens */}
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

        {/* Profile Screen */}
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={{ headerShown: false }}
        />

        {/* Assessment Screens */}
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

        {/* Main App Screens */}
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

        {/* Chat Screens */}
        <Stack.Screen
          name="Chat"
          component={MentalHealthChat}
          options={{ headerShown: false }}
        />

        {/* Chat Screens */}
        <Stack.Screen
          name="DataSend"
          component={DataSender}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ArticleDetail"
          component={ArticleDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Youtube"
          component={Youtube}
          options={{ headerShown: false }}
        />
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
          name="Reports"
          component={MentalHealthReports}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorApp"
          component={AppNavigator}
          options={{ headerShown: false }}
        />




        {/* <Stack.Screen
          name="AIChatbot"
          component={AIChatbot}
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VideoScreen"
          component={VideoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BreathingCompletion"
          component={BreathingCompletionScreen}
          options={{ headerShown: false }}
        />

        
        <Stack.Screen
          name="PatientDashboard"
          component={PatientDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PushNotification"
          component={Lanat}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ImageEmotion"
          component={FastApi}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TextEmotion"
          component={DataSender}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResultsScreen"
          component={ResultsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmotionsData"
          component={MinimalDashboard}
          options={{ headerShown: false }}
        />
      
{/* 


        <Stack.Screen 
          name="Appointments" 
          component={Apna}
          options={{ title: 'My Appointments' }}
        />
        <Stack.Screen 
          name="VideoCallScreen" 
          component={SimpleVideoCall}
          options={{ title: 'Video Call', headerShown: false }}
        />
      

           */}
      </Stack.Navigator>
    </NavigationContainer>
      {/* <Lanat /> */}
      {/* <DataSender /> */}

      <Toast />
    </>

    // <CameraScreen />

    // <DetectEmotion />

    //  <AppNavigator userType="patient" />
    // <BookAppointmentScreen />  --ok
    // <DoctorDashboardScreen /> ---ok
    // <DoctorRegisterScreen />
    // <PatientDashboardScreen />
    // <SearchDoctorsScreen />
    // <SetAvailabilityScreen />
    // <AppointmentDetailScreen />
    // <Home />
    // <WelcomeScreen />
    // <HealthGoal />
    // <WeightSelection />
    // <AppNav />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
