// components/AssessmentSuccessModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../assets/colors';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const AssessmentSuccessModal = ({
  isVisible,
  onClose,
  onRedirect,
  autoRedirectDuration = 3000, // 3 seconds
}) => {
  const [countdown, setCountdown] = useState(autoRedirectDuration / 1000);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const lottieRef = useRef(null);
  const countdownRef = useRef(null);

  // Success animation
  const defaultAnimation = require('../assets/json/Blue Checkmark.json');

  useEffect(() => {
    if (isVisible) {
      // Reset states
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
      setCountdown(autoRedirectDuration / 1000);

      // Play success animation
      if (lottieRef.current) {
        lottieRef.current.play();
      }

      // Fade in backdrop
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Scale in modal
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Countdown for auto-redirect
      if (autoRedirectDuration > 0) {
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownRef.current);
              handleRedirect();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [isVisible]);

  const handleRedirect = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    onClose();
    if (onRedirect) {
      onRedirect();
    }
  };

  const handleClose = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Backdrop with blur */}
        <BlurView
          intensity={80}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        >
          <Animated.View
            style={[
              styles.backdropOverlay,
              {
                opacity: fadeAnim,
              },
            ]}
          />
        </BlurView>

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Success icon */}
            <LinearGradient
              colors={Colors.gradients.success}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <LottieView
                ref={lottieRef}
                source={defaultAnimation}
                autoPlay={false}
                loop={false}
                style={styles.lottie}
                resizeMode="cover"
              />
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>Audio Analysis Complete!</Text>
              <Text style={styles.message}>
                Your voice patterns have been successfully analyzed and added to your assessment.
              </Text>
            </View>

            {/* Countdown timer */}
            <View style={styles.countdownContainer}>
              <LinearGradient
                colors={['transparent', Colors.background.subtle, 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.countdownGradient}
              >
                <Text style={styles.countdownText}>
                  Continuing in{' '}
                  <Text style={styles.countdownNumber}>{countdown}</Text>s
                </Text>
              </LinearGradient>
            </View>

            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, { color: Colors.text.secondary }]}>
                  Stay
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleRedirect}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={Colors.gradients.success}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  Continue Now
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.ui.overlay,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: Colors.background.card,
    borderRadius: 24,
    padding: isSmallDevice ? 20 : 24,
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.status.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  lottie: {
    width: 40,
    height: 40,
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: isSmallDevice ? 22 : 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: isSmallDevice ? 14 : 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  countdownContainer: {
    marginBottom: 20,
  },
  countdownGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  countdownNumber: {
    color: Colors.brand.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  secondaryButton: {
    backgroundColor: Colors.background.subtle,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
  },
  primaryButton: {
    position: 'relative',
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    zIndex: 1,
  },
  primaryButtonText: {
    color: Colors.text.inverted,
  },
});

export default AssessmentSuccessModal;