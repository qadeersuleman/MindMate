import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AuthSuccessScreen = ({ navigation, route }) => {
  const { username } = route.params || {};
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation on load
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient
      colors={['#6a11cb', '#2575fc']} // Purple to blue gradient
      style={styles.container}
    >
      {/* Animated Checkmark */}
      <LottieView
        source={require('../../assets/json/Blue Checkmark.json')} // Download from LottieFiles
        autoPlay
        loop={false}
        style={styles.checkmark}
      />

      {/* Welcome Text */}
      <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Welcome{username ? `, ${username}` : ''}!</Text>
        <Text style={styles.subtitle}>You're all set to begin your journey</Text>
      </Animated.View>

      {/* Continue Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Editprofile',{username : username})}
      >
        <Text style={styles.buttonText}>Continue to App</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  checkmark: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  buttonText: {
    color: '#6a11cb',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AuthSuccessScreen;