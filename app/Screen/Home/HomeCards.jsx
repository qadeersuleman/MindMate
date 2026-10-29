import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../assets/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HomeCards = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);
  
  // Updated data with the new color palette
  const metricsData = [
    {
      id: '1',
      title: 'Mental Well',
      value: '72',
      status: 'Balanced',
      trend: 'Stable',
      gradient: Colors.gradients?.primary || ['#6C63FF', '#4A3AFF']
    },
    {
      id: '2',
      title: 'Current Mood',
      value: 'Sad',
      status: 'Improving',
      trend: '+12% this week',
      gradient: Colors.gradients?.sunrise || ['#FF6B6B', '#FFA500']
    },
    {
      id: '3',
      title: 'AI Insights',
      value: '85',
      suggestion: 'Try meditation',
      trend: 'Optimal',
      gradient: [Colors.features?.ai || '#4ECDC4', Colors.accent?.coral || '#FF6B6B']
    },
    {
      id: '4',
      title: 'Stress Level',
      value: '45',
      status: 'Moderate',
      trend: 'Manageable',
      gradient: [Colors.features?.mood || '#45B7D1', Colors.accent?.coralLight || '#FFA5A5']
    },
    {
      id: '5',
      title: 'Mindfulness',
      value: '68',
      status: 'Consistent',
      trend: 'Growing',
      gradient: [Colors.features?.mindfulness || '#96CEB4', Colors.features?.meditation || '#4ECDC4']
    },
  ];

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / 172);
    setActiveIndex(index);
  };

  // Safe mood bar renderer
  const renderMoodBars = () => {
    try {
      const barHeights = [20, 40, 60, 80, 100];
      return barHeights.map((height, idx) => (
        <View 
          key={`mood-bar-${idx}`} 
          style={[
            styles.moodBar,
            { height: height / 2 }, // Convert percentage to actual pixels
            idx === 2 && styles.moodBarActive
          ]} 
        />
      ));
    } catch (error) {
      console.error('Error rendering mood bars:', error);
      return null;
    }
  };

  // Safe stress bars renderer
  const renderStressBars = () => {
    try {
      const barHeights = [10, 25, 40, 30, 20, 35, 25, 15];
      return barHeights.map((height, idx) => (
        <View 
          key={`stress-bar-${idx}`} 
          style={[
            styles.stressBar,
            { height: height }, // Use direct pixel values
            idx === 2 && styles.stressBarPeak
          ]} 
        />
      ));
    } catch (error) {
      console.error('Error rendering stress bars:', error);
      return null;
    }
  };

  // Safe progress dots renderer
  const renderProgressDots = (currentValue) => {
    try {
      const progressPoints = [0, 25, 50, 75, 100];
      return progressPoints.map((point, idx) => (
        <View 
          key={`progress-dot-${idx}`} 
          style={[
            styles.progressDot,
            parseInt(currentValue) >= point && styles.progressDotActive
          ]} 
        />
      ));
    } catch (error) {
      console.error('Error rendering progress dots:', error);
      return null;
    }
  };

  const renderMetricCard = (metric, index) => {
    if (!metric) return null;

    // First Card - Mental Wellness
    if (index === 0) {
      return (
        <LinearGradient
          key={metric.id}
          colors={metric.gradient}
          style={styles.metricCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Ionicons name="heart" size={18} color={Colors.text?.inverted || '#FFFFFF'} />
              <Text style={styles.cardTitle}>{metric.title}</Text>
            </View>
            <Ionicons name="information-circle-outline" size={18} color={Colors.text?.inverted || '#FFFFFF'} style={{ opacity: 0.7 }} />
          </View>
          
          <View style={styles.centralScoreContainer}>
            <Text style={styles.mainScore}>{metric.value}</Text>
            <Text style={styles.scoreLabel}>Wellness Score</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusPill, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
              <Text style={styles.statusText}>{metric.status}</Text>
            </View>
            <Text style={styles.trendText}>{metric.trend}</Text>
          </View>
        </LinearGradient>
      );
    } 
    // Second Card - Current Mood
    else if (index === 1) {
      return (
        <LinearGradient
          key={metric.id}
          colors={metric.gradient}
          style={styles.metricCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Ionicons name="happy" size={20} color={Colors.text?.inverted || '#FFFFFF'} />
              <Text style={styles.cardTitle}>{metric.title}</Text>
            </View>
            <Ionicons name="swap-vertical" size={18} color={Colors.text?.inverted || '#FFFFFF'} style={{ opacity: 0.7 }} />
          </View>
          
          <View style={styles.moodContainer}>
            <Text style={styles.moodValue}>{metric.value}</Text>
            <Ionicons name="cloudy" size={40} color={Colors.text?.inverted || '#FFFFFF'} style={styles.moodIcon} />
          </View>
          
          <View style={styles.moodAnalysis}>
            <View style={styles.moodBarContainer}>
              {renderMoodBars()}
            </View>
            
            <View style={styles.moodStats}>
              <View style={styles.moodStat}>
                <Text style={styles.moodStatValue}>+12%</Text>
                <Text style={styles.moodStatLabel}>This week</Text>
              </View>
              <View style={styles.moodStat}>
                <Text style={styles.moodStatValue}>3/7</Text>
                <Text style={styles.moodStatLabel}>Good days</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      );
    } 
    // Third Card - AI Insights
    else if (index === 2) {
      return (
        <LinearGradient
          key={metric.id}
          colors={metric.gradient}
          style={styles.metricCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Ionicons name="sparkles" size={20} color={Colors.text?.inverted || '#FFFFFF'} />
              <Text style={styles.cardTitle}>{metric.title}</Text>
            </View>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          </View>
          
          <View style={styles.aiScoreContainer}>
            <Text style={styles.aiScoreValue}>{metric.value}</Text>
            <Text style={styles.aiScoreLabel}>Recommendation Score</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, {width: `${parseInt(metric.value) || 0}%`}]} />
            </View>
            <View style={styles.progressDots}>
              {renderProgressDots(metric.value)}
            </View>
          </View>
          
          <View style={styles.suggestionBox}>
            <Ionicons name="bulb" size={16} color={Colors.text?.inverted || '#FFFFFF'} />
            <Text style={styles.suggestionText}>{metric.suggestion}</Text>
          </View>
        </LinearGradient>
      );
    } 
    // Fourth Card - Stress Level
    else if (index === 3) {
      return (
        <LinearGradient
          key={metric.id}
          colors={metric.gradient}
          style={styles.metricCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Ionicons name="pulse" size={20} color={Colors.text?.inverted || '#FFFFFF'} />
              <Text style={styles.cardTitle}>{metric.title}</Text>
            </View>
            <Ionicons name="warning" size={18} color={Colors.text?.inverted || '#FFFFFF'} style={{ opacity: 0.7 }} />
          </View>
          
          <View style={styles.stressContainer}>
            <Text style={styles.stressValue}>{metric.value}</Text>
            <Text style={styles.stressLabel}>Moderate Level</Text>
          </View>
          
          <View style={styles.stressVisualization}>
            <View style={styles.stressWave}>
              {renderStressBars()}
            </View>
          </View>
        </LinearGradient>
      );
    } 
    // Fifth Card - Mindfulness
    else if (index === 4) {
      return (
        <LinearGradient
          key={metric.id}
          colors={metric.gradient}
          style={styles.metricCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Ionicons name="leaf" size={20} color={Colors.text?.inverted || '#FFFFFF'} />
              <Text style={styles.cardTitle}>{metric.title}</Text>
            </View>
            <Ionicons name="trending-up" size={18} color={Colors.text?.inverted || '#FFFFFF'} style={{ opacity: 0.7 }} />
          </View>
          
          <View style={styles.mindfulnessMain}>
            <Text style={styles.mindfulnessValue}>{metric.value}%</Text>
            <View style={styles.circularProgressContainer}>
              <View style={styles.circularProgressBackground} />
              <View style={[styles.circularProgressFill, {transform: [{rotate: `${(parseInt(metric.value) || 0) * 3.6}deg`}]}]}>
                <View style={styles.circularProgressKnob} />
              </View>
              <Ionicons name="happy" size={24} color={Colors.text?.inverted || '#FFFFFF'} style={styles.circularIcon} />
            </View>
          </View>
          
          <View style={styles.mindfulnessStats}>
            <View style={styles.mindfulnessStat}>
              <Text style={styles.statNumber}>5m</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.mindfulnessStat}>
              <Text style={styles.statNumber}>35m</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.mindfulnessStat}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Begin Practice</Text>
            <Ionicons name="play" size={14} color={Colors.text?.inverted || '#FFFFFF'} />
          </TouchableOpacity>
        </LinearGradient>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mental Wellness Dashboard</Text>
        <TouchableOpacity>
          <Ionicons name="stats-chart" size={24} color={Colors.text?.primary || '#333333'} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={172}
        snapToAlignment="start"
      >
        {metricsData.map((metric, index) => renderMetricCard(metric, index))}
      </ScrollView>

      <View style={styles.indicatorContainer}>
        {metricsData.map((_, index) => (
          <View 
            key={`indicator-${index}`} 
            style={[
              styles.indicatorDot,
              index === activeIndex && styles.activeIndicatorDot
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: Colors.neutrals?.background || '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text?.primary || '#333333',
  },
  scrollContent: {
    paddingRight: 15,
  },
  metricCard: {
    width: 160,
    borderRadius: 20,
    padding: 15,
    marginRight: 12,
    shadowColor: Colors.ui?.shadowDark || '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // First Card Styles
  centralScoreContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  mainScore: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  statusText: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  trendText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  // Second Card Styles
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  moodValue: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  moodIcon: {
    opacity: 0.9,
  },
  moodAnalysis: {
    marginTop: 10,
  },
  moodBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 40,
    marginBottom: 10,
  },
  moodBar: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 3,
  },
  moodBarActive: {
    backgroundColor: Colors.text?.inverted || '#FFFFFF',
  },
  moodStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodStat: {
    alignItems: 'center',
  },
  moodStatValue: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  moodStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  // Third Card Styles
  aiBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiBadgeText: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  aiScoreContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  aiScoreValue: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  aiScoreLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.text?.inverted || '#FFFFFF',
    borderRadius: 3,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressDotActive: {
    backgroundColor: Colors.text?.inverted || '#FFFFFF',
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 10,
  },
  suggestionText: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  // Fourth Card Styles
  stressContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  stressValue: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  stressLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  stressVisualization: {
    height: 40,
    marginBottom: 15,
  },
  stressWave: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
  stressBar: {
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 2,
  },
  stressBarPeak: {
    backgroundColor: Colors.text?.inverted || '#FFFFFF',
  },
  // Fifth Card Styles
  mindfulnessMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  mindfulnessValue: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  circularProgressContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularProgressBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  circularProgressFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderTopColor: Colors.text?.inverted || '#FFFFFF',
    borderRightColor: Colors.text?.inverted || '#FFFFFF',
    borderWidth: 2,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  circularProgressKnob: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.text?.inverted || '#FFFFFF',
    top: -3,
    right: 12,
  },
  circularIcon: {
    position: 'absolute',
  },
  mindfulnessStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  mindfulnessStat: {
    alignItems: 'center',
  },
  statNumber: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  startButtonText: {
    color: Colors.text?.inverted || '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Indicator dots
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutrals?.border || '#E0E0E0',
    marginHorizontal: 4,
  },
  activeIndicatorDot: {
    backgroundColor: Colors.brand?.primary || '#6C63FF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default HomeCards;