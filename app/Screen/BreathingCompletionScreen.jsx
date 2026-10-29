import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  SafeAreaView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const BreathingCompletionScreen = ({ navigation, route }) => {
  const { duration = 22, exerciseType = 'breathing' } = route.params || {};
  const insets = useSafeAreaInsets();
  
  // Get current month
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  
  // State for confetti
  const [confetti, setConfetti] = useState([]);
  
  // Stats data - two stats per row
  const [stats, setStats] = useState([
    { id: 1, label: 'Mindful Score', value: '88', icon: 'brain', color: '#8B5CF6' },
    { id: 2, label: 'Stress Level', value: 'Low', icon: 'trending-down', color: '#10B981' },
    { id: 3, label: 'Focus Score', value: '92', icon: 'target', color: '#3B82F6' },
    { id: 4, label: 'Day Streak', value: '7', icon: 'calendar', color: '#F59E0B' }
  ]);

  // Calculate responsive sizes
  const isSmallScreen = height < 700;
  const isLargeScreen = height > 800;
  
  const responsiveFont = (base, small, large) => {
    if (isSmallScreen) return small;
    if (isLargeScreen) return large;
    return base;
  };

  const responsivePadding = (base, small, large) => {
    if (isSmallScreen) return small;
    if (isLargeScreen) return large;
    return base;
  };

  const responsiveMargin = (base, small, large) => {
    if (isSmallScreen) return small;
    if (isLargeScreen) return large;
    return base;
  };

  // Calculate card width for two cards per row
  const cardGap = responsiveFont(12, 8, 16);
  const cardWidth = (width - responsivePadding(20, 16, 24) * 2 - cardGap) / 2;

  // Start animations on mount
  useEffect(() => {
    // Status bar remains visible with default style
    StatusBar.setBarStyle('light-content');
    
    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Main entrance animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    // Progress fill animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1200,
      delay: 300,
      useNativeDriver: false,
      easing: Easing.bezier(0.2, 0.8, 0.4, 1)
    }).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin)
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin)
        })
      ])
    ).start();

    // Floating animation for elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin)
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin)
        })
      ])
    ).start();

    // Generate confetti
    generateConfetti();
  }, []);

  const generateConfetti = () => {
    const confettiArray = [];
    const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EC4899'];
    
    for (let i = 0; i < 30; i++) {
      confettiArray.push({
        id: i,
        left: Math.random() * width,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * responsiveFont(10, 6, 12) + 5,
        duration: Math.random() * 2000 + 1000,
        delay: Math.random() * 1000
      });
    }
    setConfetti(confettiArray);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Home');
  };

  const handleSchedule = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to schedule screen
    alert('Schedule screen would open here');
  };

  const translateY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -responsiveFont(10, 6, 12)]
  });

  // Render icon based on name
  const renderIcon = (iconName, color, size) => {
    const iconSize = responsiveFont(size, size - 2, size + 2);
    
    switch (iconName) {
      case 'brain':
        return <Ionicons name="brain" size={iconSize} color={color} />;
      case 'trending-down':
        return <Ionicons name="trending-down" size={iconSize} color={color} />;
      case 'target':
        return <Feather name="target" size={iconSize} color={color} />;
      case 'calendar':
        return <Feather name="calendar" size={iconSize} color={color} />;
      default:
        return <Ionicons name="stats-chart" size={iconSize} color={color} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated Confetti */}
      <View style={styles.confettiContainer}>
        {confetti.map((piece) => (
          <Animated.View
            key={piece.id}
            style={[
              styles.confetti,
              {
                left: piece.left,
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size,
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -height]
                    })
                  },
                  {
                    rotate: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '720deg']
                    })
                  }
                ]
              }
            ]}
          />
        ))}
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: responsivePadding(20, 16, 24) }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={[
          styles.header,
          {
            paddingHorizontal: responsivePadding(20, 16, 24),
            paddingBottom: responsivePadding(20, 16, 24),
            paddingTop: insets.top
          }
        ]}>
          <TouchableOpacity 
            style={[
              styles.backButton,
              {
                width: responsiveFont(40, 36, 44),
                height: responsiveFont(40, 36, 44)
              }
            ]}
            onPress={() => navigation.goBack()}
          >
            <Feather 
              name="x" 
              size={responsiveFont(24, 20, 28)} 
              color="#94A3B8" 
            />
          </TouchableOpacity>
          <Text style={[
            styles.headerTitle,
            { fontSize: responsiveFont(18, 16, 20) }
          ]}>
            Session Complete
          </Text>
          <View style={[
            styles.headerPlaceholder,
            { width: responsiveFont(40, 36, 44) }
          ]} />
        </View>

        {/* Main Celebration Card */}
        <Animated.View 
          style={[
            styles.celebrationCard,
            {
              marginHorizontal: responsivePadding(20, 16, 24),
              marginBottom: responsiveMargin(30, 20, 36),
              borderRadius: responsiveFont(32, 24, 40),
              padding: responsivePadding(30, 20, 36),
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: responsiveFont(32, 24, 40) }
            ]}
          />
          
          {/* Floating Icons */}
          <Animated.View 
            style={[
              styles.floatingIcon,
              {
                top: responsiveFont(30, 20, 40),
                right: responsiveFont(30, 20, 40),
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <MaterialCommunityIcons 
              name="brain" 
              size={responsiveFont(32, 24, 40)} 
              color="rgba(255,255,255,0.3)" 
            />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.floatingIcon,
              {
                bottom: responsiveFont(30, 20, 40),
                left: responsiveFont(30, 20, 40),
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <Ionicons 
              name="leaf" 
              size={responsiveFont(28, 20, 36)} 
              color="rgba(255,255,255,0.3)" 
            />
          </Animated.View>

          {/* Main Content */}
          <View style={styles.cardContent}>
            {/* Achievement Badge */}
            <Animated.View 
              style={[
                styles.badgeContainer,
                {
                  marginBottom: responsiveMargin(20, 16, 24),
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <View style={[
                styles.badge,
                {
                  width: responsiveFont(80, 64, 96),
                  height: responsiveFont(80, 64, 96),
                  borderRadius: responsiveFont(40, 32, 48)
                }
              ]}>
                <Feather 
                  name="check" 
                  size={responsiveFont(42, 32, 52)} 
                  color="#8B5CF6" 
                />
              </View>
              <View style={[
                styles.badgeGlow,
                {
                  width: responsiveFont(100, 80, 120),
                  height: responsiveFont(100, 80, 120),
                  borderRadius: responsiveFont(50, 40, 60),
                  top: -responsiveFont(10, 8, 12),
                  left: -responsiveFont(10, 8, 12)
                }
              ]} />
            </Animated.View>

            {/* Title */}
            <Text style={[
              styles.cardTitle,
              { 
                fontSize: responsiveFont(28, 22, 34),
                marginBottom: responsiveMargin(10, 8, 12)
              }
            ]}>
              Amazing Focus!
            </Text>
            
            {/* Duration with month */}
            <View style={[
              styles.durationContainer,
              { marginBottom: responsiveMargin(5, 4, 6) }
            ]}>
              <Text style={[
                styles.durationNumber,
                { fontSize: responsiveFont(64, 48, 72) }
              ]}>
                {duration}
              </Text>
              <Text style={[
                styles.durationText,
                { fontSize: responsiveFont(20, 16, 24) }
              ]}>
                minutes
              </Text>
            </View>
            
            <Text style={[
              styles.cardSubtitle,
              { 
                fontSize: responsiveFont(16, 14, 18),
                marginBottom: responsiveMargin(25, 20, 30)
              }
            ]}>
              of mindful breathing in {currentMonth}
            </Text>
            
            {/* Progress Circle */}
            <View style={[
              styles.progressContainer,
              { marginBottom: responsiveMargin(8, 6, 10) }
            ]}>
              <View style={[
                styles.progressBackground,
                {
                  height: responsiveFont(8, 6, 10),
                  borderRadius: responsiveFont(4, 3, 5)
                }
              ]}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      height: responsiveFont(8, 6, 10),
                      borderRadius: responsiveFont(4, 3, 5),
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]}
                />
              </View>
              <Text style={[
                styles.progressText,
                { fontSize: responsiveFont(14, 12, 16) }
              ]}>
                100% Complete
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats Grid - Two cards per row */}
        <View style={[
          styles.statsGrid,
          {
            marginHorizontal: responsivePadding(20, 16, 24),
            marginBottom: responsiveMargin(25, 20, 30),
          }
        ]}>
          {stats.map((stat, index) => (
            <View 
              key={stat.id}
              style={[
                styles.statCard,
                {
                  width: cardWidth,
                  marginRight: (index % 2 === 0) ? cardGap : 0,
                  marginBottom: cardGap,
                  padding: responsivePadding(16, 14, 18),
                  borderRadius: responsiveFont(20, 16, 24),
                }
              ]}
            >
              <View style={[
                styles.statIcon,
                { 
                  backgroundColor: `${stat.color}20`, // 20 is for 12% opacity
                  width: responsiveFont(50, 40, 60),
                  height: responsiveFont(50, 40, 60),
                  borderRadius: responsiveFont(25, 20, 30),
                  marginBottom: responsiveMargin(12, 10, 14)
                }
              ]}>
                {renderIcon(stat.icon, stat.color, 24)}
              </View>
              <Text style={[
                styles.statValue,
                { fontSize: responsiveFont(24, 20, 28) }
              ]}>
                {stat.value}
              </Text>
              <Text style={[
                styles.statLabel,
                { fontSize: responsiveFont(14, 12, 16) }
              ]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* AI Insight */}
        <Animated.View 
          style={[
            styles.insightCard,
            {
              marginHorizontal: responsivePadding(20, 16, 24),
              borderRadius: responsiveFont(24, 20, 28),
              padding: responsivePadding(24, 20, 28),
              marginBottom: responsiveMargin(25, 20, 30),
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          <View style={[
            styles.insightHeader,
            { marginBottom: responsiveMargin(16, 14, 18) }
          ]}>
            <View style={[
              styles.aiAvatar,
              {
                width: responsiveFont(40, 36, 44),
                height: responsiveFont(40, 36, 44),
                borderRadius: responsiveFont(20, 18, 22),
                marginRight: responsiveMargin(12, 10, 14)
              }
            ]}>
              <MaterialCommunityIcons 
                name="robot-happy" 
                size={responsiveFont(24, 20, 28)} 
                color="#8B5CF6" 
              />
            </View>
            <Text style={[
              styles.insightTitle,
              { fontSize: responsiveFont(18, 16, 20) }
            ]}>
              AI Insight
            </Text>
          </View>
          <Text style={[
            styles.insightText,
            { 
              fontSize: responsiveFont(15, 14, 16),
              lineHeight: responsiveFont(22, 20, 24),
              marginBottom: responsiveMargin(16, 14, 18)
            }
          ]}>
            Your {duration}-minute session shows excellent consistency in breath control. 
            Heart rate variability improved by 18%, indicating enhanced parasympathetic response.
          </Text>
          <View style={[
            styles.tipContainer,
            {
              padding: responsivePadding(12, 10, 14),
              borderRadius: responsiveFont(12, 10, 14)
            }
          ]}>
            <Feather 
              name="lightbulb" 
              size={responsiveFont(18, 16, 20)} 
              color="#F59E0B" 
            />
            <Text style={[
              styles.tipText,
              { 
                fontSize: responsiveFont(14, 13, 15),
                marginLeft: responsiveMargin(8, 6, 10)
              }
            ]}>
              Try evening sessions for better sleep quality
            </Text>
          </View>
        </Animated.View>

        {/* Ready for More Section */}
        <View style={[
          styles.nextSessionCard,
          {
            marginHorizontal: responsivePadding(20, 16, 24),
            borderRadius: responsiveFont(24, 20, 28),
            padding: responsivePadding(24, 20, 28),
            marginBottom: responsiveMargin(25, 20, 30)
          }
        ]}>
          <Text style={[
            styles.nextSessionTitle,
            { 
              fontSize: responsiveFont(20, 18, 22),
              marginBottom: responsiveMargin(8, 6, 10)
            }
          ]}>
            Ready for more?
          </Text>
          <Text style={[
            styles.nextSessionText,
            { 
              fontSize: responsiveFont(15, 14, 16),
              marginBottom: responsiveMargin(20, 16, 24)
            }
          ]}>
            Try a 10-minute gratitude meditation next
          </Text>
          <TouchableOpacity 
            style={[
              styles.nextSessionButton,
              {
                paddingHorizontal: responsivePadding(24, 20, 28),
                paddingVertical: responsivePadding(12, 10, 14),
                borderRadius: responsiveFont(12, 10, 14)
              }
            ]}
            onPress={handleSchedule}
          >
            <Text style={[
              styles.nextSessionButtonText,
              { fontSize: responsiveFont(14, 13, 15) }
            ]}>
              Schedule Session
            </Text>
          </TouchableOpacity>
        </View>

        {/* Single Continue Button */}
        <TouchableOpacity 
          style={[
            styles.continueButton,
            {
              marginHorizontal: responsivePadding(20, 16, 24),
              paddingVertical: responsivePadding(18, 16, 20),
              borderRadius: responsiveFont(16, 14, 18),
              marginBottom: responsiveMargin(40, 30, 50)
            }
          ]}
          onPress={handleContinue}
        >
          <Text style={[
            styles.continueButtonText,
            { fontSize: responsiveFont(16, 15, 18) }
          ]}>
            Continue to Dashboard
          </Text>
          <Feather 
            name="arrow-right" 
            size={responsiveFont(20, 18, 22)} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontWeight: '600',
    color: '#F1F5F9',
    letterSpacing: 0.5,
  },
  headerPlaceholder: {},
  celebrationCard: {
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  floatingIcon: {
    position: 'absolute',
  },
  cardContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  badgeContainer: {
    position: 'relative',
  },
  badge: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  badgeGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardTitle: {
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  durationNumber: {
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  durationText: {
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 8,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressBackground: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  insightCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontWeight: '600',
    color: '#F1F5F9',
  },
  insightText: {
    color: '#CBD5E1',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  tipText: {
    color: '#F59E0B',
    flex: 1,
  },
  nextSessionCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  nextSessionTitle: {
    fontWeight: '700',
    color: '#F1F5F9',
  },
  nextSessionText: {
    color: '#CBD5E1',
    textAlign: 'center',
  },
  nextSessionButton: {
    backgroundColor: '#8B5CF6',
  },
  nextSessionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
});

export default BreathingCompletionScreen;