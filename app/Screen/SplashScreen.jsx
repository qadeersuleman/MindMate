import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { AntDesign, Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const AISplashScreen = ({ navigation }) => {
  // Animation values
  const gradientScale = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoPosition = useRef(new Animated.Value(height * 0.4)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const gradientOpacity = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const brainWaveAnim = useRef(new Animated.Value(0)).current;
  
  const [progressText, setProgressText] = useState('Initializing AI');
  const [currentDot, setCurrentDot] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  // Particle positions
  const particles = Array(15).fill(0).map((_, i) => ({
    id: i,
    scale: new Animated.Value(0),
    opacity: new Animated.Value(0),
    x: Math.random() * width,
    y: Math.random() * height * 0.6,
    delay: Math.random() * 1000
  }));

  // Dot animation sequence
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setCurrentDot(prev => (prev + 1) % 4);
    }, 400);

    return () => clearInterval(dotInterval);
  }, []);

  // Main animation sequence
  useEffect(() => {
    // 1. Gradient background scale in
    Animated.parallel([
      Animated.timing(gradientScale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(gradientOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // 2. Brain wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(brainWaveAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(brainWaveAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      ])
    ).start();

    // 3. Particle animation
    particles.forEach(particle => {
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.parallel([
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0.6,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ]).start();
    });

    // 4. Logo animation sequence
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(logoPosition, {
          toValue: height * 0.25,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 5. Progress bar and dots animation
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(progressWidth, {
        toValue: width * 0.7,
        duration: 2500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // 6. Progress text updates
    const progressUpdates = [
      { time: 500, text: 'Loading AI modules' },
      { time: 1200, text: 'Analyzing patterns' },
      { time: 1900, text: 'Establishing connection' },
      { time: 2500, text: 'Ready to listen' },
    ];

    const startTime = Date.now();
    const updateInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const update = progressUpdates.find(u => elapsed <= u.time);
      if (update) setProgressText(update.text);
    }, 100);

    // 7. Final content fade in
    setTimeout(() => {
      setShowWelcome(true);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
      clearInterval(updateInterval);
    }, 3000);
  }, []);

  const dots = [0, 1, 2, 3].map(i => (
    <Animated.Text
      key={i}
      style={[
        styles.dot,
        {
          opacity: currentDot === i ? dotsOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1]
          }) : dotsOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.5]
          }),
          transform: [{
            scale: currentDot === i ? 
              dotsOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2]
              }) : 1
          }]
        }
      ]}
    >
      •
    </Animated.Text>
  ));

  const brainWaveInterpolation = brainWaveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg']
  });

  return (
    <View style={styles.container}>
      {/* Animated gradient background */}
      <Animated.View style={[
        styles.gradientContainer,
        {
          opacity: gradientOpacity,
          transform: [{
            scale: gradientScale.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1.2]
            })
          }]
        }
      ]}>
        <LinearGradient
          colors={['#1a2a6c', '#b21f1f', '#fdbb2d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Floating particles */}
      {particles.map(particle => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              transform: [{ scale: particle.scale }]
            }
          ]}
        />
      ))}

      {/* Brain wave animation */}
      <Animated.View style={[
        styles.brainWave,
        {
          transform: [
            { rotate: brainWaveInterpolation },
            { scale: brainWaveAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.05]
            })}
          ]
        }
      ]}>
        <LottieView
          source={require('../assets/json/Brain.json')}
          autoPlay
          loop
          style={styles.lottieBrain}
        />
      </Animated.View>

      {/* Logo with animations */}
      {/* <Animated.View style={[
        styles.logoContainer,
        {
          opacity: logoOpacity,
          transform: [
            { scale: logoScale },
            { translateY: logoPosition }
          ]
        }
      ]}>
        <LottieView
          source={require('../assets/json/Powerful Mind.json')}
          autoPlay
          loop
          style={styles.lottieLogo}
        />
      </Animated.View> */}

      {/* Progress section */}
      <View style={styles.progressContainer}>
        <Animated.Text style={[styles.progressText, { opacity: dotsOpacity }]}>
          {progressText}
          {dots}
        </Animated.Text>
        
        <View style={styles.progressBarBackground}>
          <Animated.View style={[
            styles.progressBar,
            { width: progressWidth }
          ]}>
            <LinearGradient
              colors={['#4A8AFF', '#9B4DFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBarFill}
            />
          </Animated.View>
        </View>
      </View>

      {/* Final content that fades in */}
      {showWelcome && (
        <Animated.View style={[styles.content, { opacity: contentOpacity, marginBlock : 10 }]}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>MindfulAI</Text>
          <Text style={styles.tagline}>Your compassionate mental health companion</Text>
          
          <TouchableOpacity 
            style={styles.enterButton}
            onPress={() => navigation.navigate('WelcomeScreen')}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Feather name="heart" size={20} color="white" />
              <Text style={styles.buttonText}>Begin Your Journey</Text>
              <AntDesign name="arrowright" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E23',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradientContainer: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
  },
  gradient: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  brainWave: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 0.6,
    top: height * 0.2,
  },
  lottieBrain: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 250,
    height: 250,
  },
  lottieLogo: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    position: 'absolute',
    bottom: height * 0.2,
    width: '80%',
    alignItems: 'center',
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 15,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  dot: {
    fontSize: 24,
    color: '#FFF',
    marginHorizontal: 2,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    bottom: height * 0.25,
    width: '100%',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 5,
  },
  appName: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '300',
    marginBottom: 30,
  },
  enterButton: {
    width: '70%',
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 80,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 10,
  },
});

export default AISplashScreen;