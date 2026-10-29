// components/SuccessModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
  SafeAreaView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import Colors from '../assets/colors';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const SuccessModal = ({
  isVisible,
  onClose,
  message = 'Profile created successfully!',
  title = 'Great!',
  redirectTo,
  autoRedirectDuration = 5000, // 5 seconds wait
  showRedirectCountdown = true,
  animationSource,
  onRedirect,
  showConfetti = true,
  assessmentData = null, // Optional: pass assessment data to show progress
}) => {
  const [countdown, setCountdown] = useState(autoRedirectDuration / 1000);
  const [stepIndex, setStepIndex] = useState(0);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0))
  ).current;
  
  const lottieRef = useRef(null);
  const countdownRef = useRef(null);
  const stepIntervalRef = useRef(null);

  // Default animation - using a loading/progress animation instead of checkmark
  const defaultAnimation = require('../assets/json/Blue Checkmark.json');
  // If you have a loading/progress animation, use it instead:
  // const defaultAnimation = require('../assets/json/loading-animation.json');

  // Assessment steps configuration
  const assessmentSteps = [
    {
      title: 'Health Assessment',
      description: 'Analyzing your health goals and metrics',
      icon: '🩺',
    },
    {
      title: 'Mood Analysis',
      description: 'Processing your emotional state',
      icon: '😊',
    }
  ];

  // Generate confetti colors from your palette
  const confettiColors = [
    Colors.brand.primary,
    Colors.brand.secondary,
    Colors.brand.accent,
    Colors.status.success,
    Colors.accent.coral,
    Colors.accent.teal,
    Colors.features.meditation,
    Colors.features.journal,
  ];

  useEffect(() => {
    if (isVisible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset states
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
      progressAnim.setValue(0);
      stepAnim.setValue(0);
      particleAnims.forEach(anim => anim.setValue(0));
      setCountdown(autoRedirectDuration / 1000);
      setStepIndex(0);

      // Play lottie animation
      if (lottieRef.current) {
        lottieRef.current.play();
      }

      // Fade in backdrop
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Scale in modal with bounce
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Start progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: autoRedirectDuration,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      // Step animation (pulsing effect for active step)
      Animated.loop(
        Animated.sequence([
          Animated.timing(stepAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(stepAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animate individual confetti particles
      if (showConfetti) {
        particleAnims.forEach((anim, index) => {
          Animated.sequence([
            Animated.delay(index * 30),
            Animated.timing(anim, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
        });
      }

      // Cycle through assessment steps
      const stepDuration = autoRedirectDuration / assessmentSteps.length;
      stepIntervalRef.current = setInterval(() => {
        setStepIndex((prev) => (prev < assessmentSteps.length - 1 ? prev + 1 : prev));
      }, stepDuration);

      // Countdown for auto-redirect
      if (redirectTo && autoRedirectDuration > 0) {
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownRef.current);
              clearInterval(stepIntervalRef.current);
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
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
    };
  }, [isVisible]);

  const handleRedirect = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
    }
    // Call onClose first, then onRedirect if provided
    onClose();
    if (onRedirect) {
      onRedirect();
    }
  };

  const handleClose = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
    }
    
    // Haptic feedback for close
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Render confetti particles
  const renderConfetti = () => {
    if (!showConfetti) return null;

    return particleAnims.map((anim, index) => {
      const size = Math.random() * 12 + 8;
      const startX = Math.random() * width;
      const distance = Math.random() * 150 + 50;
      const rotation = Math.random() * 720;
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];

      const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -distance],
      });

      const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, (Math.random() * 80 - 40)],
      });

      const rotate = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', `${rotation}deg`],
      });

      const opacity = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 0],
      });

      return (
        <Animated.View
          key={`confetti-${index}`}
          style={[
            styles.confetti,
            {
              width: size,
              height: size,
              backgroundColor: color,
              left: startX,
              top: height / 2 - 100,
              transform: [{ translateY }, { translateX }, { rotate }],
              opacity,
              borderRadius: size / 4,
            },
          ]}
        />
      );
    });
  };

  // Render assessment steps
  const renderAssessmentSteps = () => {
    return (
      <View style={styles.stepsContainer}>
        {/* <Text style={styles.stepsTitle}>Preparing your assessment...</Text> */}
        <View style={styles.stepsList}>
          {assessmentSteps.map((step, index) => {
            const isCompleted = index < stepIndex;
            const isActive = index === stepIndex;
            const isPending = index > stepIndex;

            const scale = isActive
              ? stepAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                })
              : 1;

            const opacity = isActive ? stepAnim : 1;

            return (
              <Animated.View
                key={index}
                style={[
                  styles.stepItem,
                  {
                    transform: [{ scale }],
                    opacity,
                  },
                ]}
              >
                <View
                  style={[
                    styles.stepIconContainer,
                    isCompleted && styles.stepCompleted,
                    isActive && styles.stepActive,
                    isPending && styles.stepPending,
                  ]}
                >
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                  {isActive && (
                    <Animated.View
                      style={[
                        styles.activePulse,
                        {
                          transform: [{ scale: stepAnim }],
                          opacity: stepAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 0],
                          }),
                        },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isCompleted && styles.stepTitleCompleted,
                      isActive && styles.stepTitleActive,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
                {isCompleted && (
                  <View style={styles.checkmarkContainer}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>
      </View>
    );
  };

  // Separate function to render modal content
  const renderModalContent = () => {
    return (
      <Animated.View
        style={[
          styles.modalContent,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Progress circle indicator */}
        {redirectTo && (
          <View style={styles.progressCircleContainer}>
            <Svg width="60" height="60">
              <Circle
                cx="30"
                cy="30"
                r="28"
                stroke={Colors.background.subtle}
                strokeWidth="3"
                fill="transparent"
              />
              <Circle
                cx="30"
                cy="30"
                r="28"
                stroke={Colors.brand.primary}
                strokeWidth="3"
                fill="transparent"
                strokeDasharray="175.93"
                strokeDashoffset={progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [175.93, 0],
                })}
                strokeLinecap="round"
              />
            </Svg>
          </View>
        )}

        {/* Animated icon container with gradient */}
        <LinearGradient
          colors={Colors.gradients.calm}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <LottieView
            ref={lottieRef}
            source={animationSource || defaultAnimation}
            autoPlay={false}
            loop={false}
            style={styles.lottie}
            resizeMode="cover"
          />
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {/* <Text style={styles.message}>{message}</Text> */}
          <Text style={styles.subMessage}>
            Please wait while we prepare your personalized mental health assessment
          </Text>
        </View>

        {/* Assessment Steps */}
        {renderAssessmentSteps()}

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.loadingDot,
                  {
                    backgroundColor: Colors.brand.primary,
                    transform: [
                      {
                        scale: stepAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 1.3, 1],
                        }),
                      },
                    ],
                    opacity: stepAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 1, 0.3],
                    }),
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.loadingText}>Analyzing your data...</Text>
        </View>

        {/* Countdown timer */}
        {redirectTo && showRedirectCountdown && (
          <View style={styles.countdownContainer}>
            <LinearGradient
              colors={['transparent', Colors.background.subtle, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.countdownGradient}
            >
              <Text style={styles.countdownText}>
                Starting assessment in{' '}
                <Text style={styles.countdownNumber}>{countdown}</Text>s
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          {redirectTo ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, { color: Colors.text.secondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleRedirect}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={Colors.gradients.calm}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  Skip Wait
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.singleButton]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={Colors.gradients.calm}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Continue
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Decorative elements */}
        <View style={styles.decorativeElements}>
          {[1, 2, 3, 4].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.decorativeDot,
                {
                  backgroundColor: Colors.brand.primary,
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.2],
                  }),
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
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

        {/* Confetti particles */}
        {renderConfetti()}

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          {renderModalContent()}
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
    maxWidth: 400,
    backgroundColor: Colors.background.card,
    borderRadius: 32,
    padding: isSmallDevice ? 24 : 32,
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
    overflow: 'hidden',
  },
  progressCircleContainer: {
    position: 'absolute',
    top: -30,
    right: -30,
    zIndex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  lottie: {
    width: 80,
    height: 80,
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  message: {
    fontSize: isSmallDevice ? 16 : 17,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background.subtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.subtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.neutrals.border,
    position: 'relative',
  },
  stepIcon: {
    fontSize: 20,
  },
  stepCompleted: {
    backgroundColor: Colors.status.success + '20',
    borderColor: Colors.status.success,
  },
  stepActive: {
    backgroundColor: Colors.brand.primary + '20',
    borderColor: Colors.brand.primary,
  },
  stepPending: {
    backgroundColor: Colors.background.subtle,
    borderColor: Colors.neutrals.border,
  },
  activePulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  stepTitleCompleted: {
    color: Colors.status.success,
    textDecorationLine: 'line-through',
  },
  stepTitleActive: {
    color: Colors.brand.primary,
  },
  stepDescription: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: Colors.text.inverted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  countdownContainer: {
    marginBottom: 24,
  },
  countdownGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  countdownNumber: {
    color: Colors.brand.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
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
  singleButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    zIndex: 1,
  },
  primaryButtonText: {
    color: Colors.text.inverted,
  },
  confetti: {
    position: 'absolute',
    zIndex: 999,
  },
  decorativeElements: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    bottom: 16,
    paddingHorizontal: 16,
  },
  decorativeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SuccessModal;