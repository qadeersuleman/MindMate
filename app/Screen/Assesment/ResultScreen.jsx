import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const MentalHealthResultsScreen = ({ route, navigation }) => {
  const { 
    scores: {
      total_score = 0,
      sleep_score = 0,
      mood_score = 0,
      text_score = 0,
      image_score = 0,
      audio_score = 0
    } = {},
    analysis_id,
    message
  } = route.params || {};

  // Animation values
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeCategory, setActiveCategory] = useState(null);

  // Score interpretation
  const getScoreColor = (score) => {
    if (score >= 80) return '#00C896'; // Mint
    if (score >= 60) return '#4A9EFF'; // Blue
    if (score >= 40) return '#FFB74D'; // Orange
    if (score >= 20) return '#FF8A80'; // Coral
    return '#FF5252'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Needs Care';
    return 'Critical';
  };

  const getMentalHealthTips = () => {
    if (total_score >= 80) return [
      "Keep up your healthy routines",
      "Practice mindfulness daily",
      "Maintain social connections"
    ];
    if (total_score >= 60) return [
      "Try gratitude journaling",
      "Get 7-8 hours sleep",
      "Take short mindful breaks"
    ];
    if (total_score >= 40) return [
      "Talk to someone you trust",
      "Go for daily walks",
      "Limit screen time before bed"
    ];
    return [
      "Seek professional support",
      "Reach out to helpline",
      "Practice deep breathing"
    ];
  };

  const getCategoryDetails = (category, score) => {
    const details = {
      sleep_score: {
        title: 'Sleep',
        icon: '💤',
        description: 'Rest quality',
        max: 10
      },
      mood_score: {
        title: 'Mood',
        icon: '😊',
        description: 'Emotional state',
        max: 10
      },
      text_score: {
        title: 'Text',
        icon: '📝',
        description: 'Language analysis',
        max: 25
      },
      image_score: {
        title: 'Visual',
        icon: '📸',
        description: 'Expression cues',
        max: 25
      },
      audio_score: {
        title: 'Voice',
        icon: '🎤',
        description: 'Tone analysis',
        max: 30
      }
    };
    return details[category] || {};
  };

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.parallel([
      Animated.timing(progressAnimation, {
        toValue: total_score / 100,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const categoryScores = [
    { key: 'sleep_score', score: sleep_score },
    { key: 'mood_score', score: mood_score },
    { key: 'text_score', score: text_score },
    { key: 'image_score', score: image_score },
    { key: 'audio_score', score: audio_score },
  ];

  const renderProgressCircle = () => {
    const size = width * 0.4;
    
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressCircle, { width: size, height: size }]}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={[styles.progressGradient, { width: size, height: size, borderRadius: size / 2 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.mainScore}>{total_score}</Text>
            <Text style={styles.scoreLabel}>Total</Text>
          </LinearGradient>
          
          {/* Outer ring */}
          <Animated.View style={[styles.outerRing, {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            borderColor: getScoreColor(total_score),
            opacity: progressAnimation,
          }]} />
        </View>
        
        <View style={styles.scoreInfo}>
          <Text style={[styles.scoreStatus, { color: getScoreColor(total_score) }]}>
            {getScoreLabel(total_score)}
          </Text>
          <Text style={styles.assessmentId}>ID: {analysis_id}</Text>
        </View>
      </View>
    );
  };

  const renderCategoryItem = (category, index) => {
    const details = getCategoryDetails(category.key, category.score);
    const percentage = (category.score / details.max) * 100;
    const isActive = activeCategory === category.key;
    
    return (
      <TouchableOpacity
        key={category.key}
        onPress={() => setActiveCategory(isActive ? null : category.key)}
        activeOpacity={0.7}
      >
        <Animated.View style={[
          styles.categoryItem,
          { 
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryIcon}>{details.icon}</Text>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>{details.title}</Text>
              <Text style={styles.categoryDescription}>{details.description}</Text>
            </View>
            <View style={styles.categoryScoreBox}>
              <Text style={styles.categoryScoreText}>{category.score}</Text>
              <Text style={styles.categoryScoreMax}>/{details.max}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainerSmall}>
            <View style={styles.progressBarBg}>
              <Animated.View style={[
                styles.progressBarFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: getScoreColor(percentage),
                }
              ]} />
            </View>
          </View>
          
          {isActive && (
            <Animated.View style={styles.categoryInsight}>
              <Text style={styles.insightText}>
                {percentage >= 70 ? 'Great!' : 
                 percentage >= 40 ? 'Room for improvement' : 
                 'Needs attention'}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#667EEA" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Feather name="share-2" size={20} color="#667EEA" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Message */}
        <View style={styles.successBox}>
          <View style={styles.successIcon}>
            <Feather name="check-circle" size={24} color="#00C896" />
          </View>
          <Text style={styles.successText}>Assessment Complete</Text>
        </View>

        {/* Main Score Display */}
        <View style={styles.scoreSection}>
          {renderProgressCircle()}
        </View>

        {/* Category Grid */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Breakdown</Text>
          <View style={styles.categoryGrid}>
            {categoryScores.map(renderCategoryItem)}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsHeader}>
            <MaterialCommunityIcons name="lightbulb" size={20} color="#FFB74D" />
            <Text style={styles.tipsTitle}>Quick Tips</Text>
          </View>
          
          <View style={styles.tipsGrid}>
            {getMentalHealthTips().map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Feather name="home" size={18} color="#fff" />
              <Text style={styles.btnText}>Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={styles.secondaryBtnText}>Save Report</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    fontFamily: 'Inter-SemiBold',
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
  },
  shareBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FFF4',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  successIcon: {
    marginRight: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22543D',
    fontFamily: 'Inter-Medium',
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainScore: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter-Bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  scoreInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  scoreStatus: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  assessmentId: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Inter-Regular',
  },
  categoriesSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  categoryGrid: {
    gap: 10,
  },
  categoryItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Inter-Regular',
  },
  categoryScoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  categoryScoreText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    fontFamily: 'Inter-Bold',
  },
  categoryScoreMax: {
    fontSize: 12,
    color: '#A0AEC0',
    fontFamily: 'Inter-Regular',
  },
  progressContainerSmall: {
    marginTop: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#EDF2F7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryInsight: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  insightText: {
    fontSize: 12,
    color: '#4A5568',
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  tipsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  tipsGrid: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    color: '#4A5568',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  actionSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#667EEA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#667EEA',
    fontFamily: 'Inter-SemiBold',
  },
});

export default MentalHealthResultsScreen;