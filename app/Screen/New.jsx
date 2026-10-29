import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Share,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { 
  Ionicons, 
  MaterialIcons, 
  FontAwesome5,
  AntDesign,
} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getSession } from '../utils/session';
import { ApiService } from '../Services/api';

const { width } = Dimensions.get('window');

// Animated Score Circle Component
const AnimatedScoreCircle = ({ score, size = 120, strokeWidth = 10, color = '#6E8BFA' }) => {
  const progress = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      progress.value = withSpring(score, {
        damping: 20,
        stiffness: 90,
      });
      scale.value = withSequence(
        withTiming(1.1, { duration: 300 }),
        withSpring(1, { damping: 15, stiffness: 100 })
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [score]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress.value / 100) * circumference;

  return (
    <Animated.View style={[animatedStyle, { width: size, height: size }]}>
      <View style={styles.scoreCircleContainer}>
        <View style={[styles.scoreCircleOuter, { width: size, height: size, borderRadius: size / 2 }]}>
          {/* Background circle */}
          <View style={[styles.scoreCircleBackground, { width: size, height: size, borderRadius: size / 2 }]} />
          
          {/* Progress circle */}
          <View style={styles.scoreCircleProgress}>
            <View style={[styles.scoreCircleProgressFill, {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [{ rotate: '-90deg' }],
            }]} />
          </View>
          
          {/* Inner content */}
          <View style={[styles.scoreCircleInner, { width: size - strokeWidth * 2, height: size - strokeWidth * 2, borderRadius: (size - strokeWidth * 2) / 2 }]}>
            <Text style={styles.scoreCircleText}>{Math.round(score)}</Text>
            <Text style={styles.scoreCircleLabel}>/100</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Progress Bar Component
const ProgressBar = ({ label, percentage, color, showValue = true }) => {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      widthAnim.value = withSpring(percentage, {
        damping: 20,
        stiffness: 90,
      });
    }, 400);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
  }));

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarHeader}>
        <Text style={styles.progressBarLabel}>{label}</Text>
        {showValue && (
          <Text style={styles.progressBarValue}>{Math.round(percentage)}%</Text>
        )}
      </View>
      <View style={styles.progressBarTrack}>
        <Animated.View 
          style={[
            styles.progressBarFill,
            { backgroundColor: color },
            animatedStyle
          ]} 
        />
      </View>
    </View>
  );
};

// Score Card Component
const ScoreCard = ({ title, score, maxScore, color, icon, delay }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 400 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const percentage = (score / maxScore) * 100;

  return (
    <Animated.View style={[styles.scoreCard, animatedStyle]}>
      <View style={styles.scoreCardContent}>
        <View style={styles.scoreCardHeader}>
          <View style={[styles.scoreCardIcon, { backgroundColor: `${color}20` }]}>
            {icon}
          </View>
          <Text style={styles.scoreCardTitle}>{title}</Text>
        </View>
        
        <View style={styles.scoreCardBody}>
          <Text style={styles.scoreCardScore}>
            {score.toFixed(1)}<Text style={styles.scoreCardMax}>/{maxScore}</Text>
          </Text>
          
          <View style={styles.scoreCardProgress}>
            <View style={[styles.scoreCardProgressTrack, { backgroundColor: `${color}20` }]}>
              <View 
                style={[
                  styles.scoreCardProgressFill,
                  { 
                    width: `${percentage}%`,
                    backgroundColor: color,
                  }
                ]} 
              />
            </View>
            <Text style={[styles.scoreCardPercentage, { color }]}>
              {Math.round(percentage)}%
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Main Report Component
const MentalHealthReport = ({ onClose, scoreData: initialScoreData }) => {
  const [loading, setLoading] = useState(!initialScoreData);
  const [scoreData, setScoreData] = useState(initialScoreData);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserData();
    if (!initialScoreData) {
      fetchScoreData();
    }
  }, []);

  const loadUserData = async () => {
    const user = await getSession();
    if (user) {
      setUserName(user.full_name || user.email.split('@')[0]);
    }
  };

  const fetchScoreData = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/api/scores/latest/');
      
      if (response.success && response.data) {
        setScoreData(response.data);
      } else {
        Alert.alert('No Assessment', 'Please complete an assessment first.');
        onClose?.();
      }
    } catch (error) {
      console.error('Error fetching score:', error);
      Alert.alert('Error', 'Failed to load assessment report');
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const message = `My Mental Health Score: ${scoreData.overall_score}/100 - ${scoreData.overall_status.text}\n\nGenerated by Mindmate`;
      
      await Share.share({
        message,
        title: 'My Mindmate Assessment',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share report');
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose?.();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6E8BFA" />
        <Text style={styles.loadingText}>Loading your assessment...</Text>
      </View>
    );
  }

  if (!scoreData) {
    return null;
  }

  const categories = [
    {
      title: 'Basic Wellness',
      ...scoreData.category_scores.basic_wellness,
      color: '#10B981',
      icon: <FontAwesome5 name="heartbeat" size={20} color="#10B981" />,
    },
    {
      title: 'Emotional State',
      ...scoreData.category_scores.emotional_state,
      color: '#3B82F6',
      icon: <MaterialIcons name="emoji-emotions" size={20} color="#3B82F6" />,
    },
    {
      title: 'Physical Signs',
      ...scoreData.category_scores.physical_signs,
      color: '#8B5CF6',
      icon: <Ionicons name="body" size={20} color="#8B5CF6" />,
    },
    {
      title: 'Vocal Analysis',
      ...scoreData.category_scores.vocal_analysis,
      color: '#F59E0B',
      icon: <Ionicons name="mic" size={20} color="#F59E0B" />,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6E8BFA', '#7B7BFF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Assessment Report</Text>
            <Text style={styles.headerSubtitle}>
              {userName ? `For ${userName}` : ''} • {scoreData.created_at}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Score Section */}
        <View style={styles.overallSection}>
          <View style={styles.scoreCircleWrapper}>
            <AnimatedScoreCircle 
              score={scoreData.overall_score} 
              color={scoreData.overall_status.color}
            />
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: `${scoreData.overall_status.color}20` }]}>
              <Text style={[styles.statusText, { color: scoreData.overall_status.color }]}>
                {scoreData.overall_status.icon} {scoreData.overall_status.text}
              </Text>
            </View>
            <Text style={styles.statusDescription}>
              Based on your comprehensive assessment
            </Text>
          </View>
        </View>

        {/* Category Scores */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Health Dimensions</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <ScoreCard
                key={category.title}
                {...category}
                delay={index * 150 + 500}
              />
            ))}
          </View>
        </View>

        {/* Insights */}
        {scoreData.key_insights && scoreData.key_insights.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Key Insights</Text>
            <View style={styles.insightsList}>
              {scoreData.key_insights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <Ionicons name="bulb" size={20} color="#F59E0B" style={styles.insightIcon} />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationsList}>
            {scoreData.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={styles.recommendationNumber}>
                  <Text style={styles.recommendationNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextSteps}>
          <LinearGradient
            colors={['rgba(110, 139, 250, 0.1)', 'rgba(123, 123, 255, 0.05)']}
            style={styles.nextStepsCard}
          >
            <MaterialIcons name="next-week" size={24} color="#6E8BFA" />
            <Text style={styles.nextStepsTitle}>Next Assessment</Text>
            <Text style={styles.nextStepsText}>
              Your next assessment is recommended in 7 days. Track your progress regularly for best results.
            </Text>
            <TouchableOpacity style={styles.scheduleButton}>
              <Text style={styles.scheduleButtonText}>Schedule Reminder</Text>
              <Ionicons name="notifications" size={16} color="#6E8BFA" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Report generated by Mindmate AI • For informational purposes only
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  overallSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  scoreCircleWrapper: {
    marginBottom: 20,
  },
  scoreCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircleOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scoreCircleBackground: {
    position: 'absolute',
    backgroundColor: '#F3F4F6',
  },
  scoreCircleProgress: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  scoreCircleProgressFill: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  scoreCircleInner: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreCircleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scoreCircleLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: -4,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  categoriesGrid: {
    gap: 16,
  },
  scoreCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreCardContent: {
    flex: 1,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scoreCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  scoreCardBody: {
    flex: 1,
  },
  scoreCardScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  scoreCardMax: {
    fontSize: 14,
    color: '#6B7280',
  },
  scoreCardProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCardProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  scoreCardProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreCardPercentage: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBarLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  progressBarValue: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  insightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  recommendationsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  recommendationNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6E8BFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  recommendationNumberText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  nextSteps: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  nextStepsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  nextStepsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#6E8BFA',
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: '#6E8BFA',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MentalHealthReport;