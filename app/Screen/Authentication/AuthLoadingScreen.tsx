import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getSession } from '../../utils/session';

const AuthLoadingScreen = ({ navigation }) => {
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const user = await getSession();
      
      if (user) {
        // User is logged in, check their status
        if (!user.hasCompletedProfile) {
          navigation.replace('EditProfile');
        } else if (!user.hasCompletedAssessment) {
          navigation.replace('Mood'); // Start assessment flow
        } else {
          navigation.replace('Home');
        }
      } else {
        // No user session, navigate to welcome screen
        navigation.replace('WelcomeScreen');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      navigation.replace('WelcomeScreen');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default AuthLoadingScreen;