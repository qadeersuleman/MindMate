// MentalHealthReports.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
  Easing
} from 'react-native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomNavigation from '../../Screen/Home/BottomNavigation'; // Import BottomNavigation
import Screen from '../../components/Screen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dummy data
const DUMMY_DAILY = [
  { time: '6 AM', score: 30 },
  { time: '9 AM', score: 45 },
  { time: '12 PM', score: 50 },
  { time: '3 PM', score: 40 },
  { time: '6 PM', score: 60 },
  { time: '9 PM', score: 55 },
];

const DUMMY_WEEKLY = [
  { day: 'Mon', score: 40 },
  { day: 'Tue', score: 48 },
  { day: 'Wed', score: 52 },
  { day: 'Thu', score: 38 },
  { day: 'Fri', score: 60 },
  { day: 'Sat', score: 65 },
  { day: 'Sun', score: 58 },
];

const DUMMY_MONTHLY = [
  { week: 'Wk 1', score: 45 },
  { week: 'Wk 2', score: 50 },
  { week: 'Wk 3', score: 55 },
  { week: 'Wk 4', score: 62 },
];

// Animated Tab Button
const TabButton = ({ title, value, isActive, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  return (
    <Animated.View style={{ 
      flex: 1, 
      transform: [{ scale: scaleAnim }]
    }}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          isActive && styles.activeTabButton
        ]}
        onPress={() => onPress(value)}
      >
        <Icon 
          name={getTabIcon(value)} 
          size={16} 
          color={isActive ? '#FFFFFF' : '#6B7280'} 
          style={styles.tabIcon}
        />
        <Text style={[
          styles.tabText,
          isActive && styles.activeTabText
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getTabIcon = (tab) => {
  switch(tab) {
    case 'daily': return 'today-outline';
    case 'weekly': return 'calendar-outline';
    case 'monthly': return 'stats-chart-outline';
    default: return 'calendar-outline';
  }
};

// Animated Bar Chart Component
const AnimatedBarChart = ({ data, activeTab }) => {
  const barAnimations = useRef(data.map(() => new Animated.Value(0))).current;
  const [selectedBar, setSelectedBar] = useState(null);

  useEffect(() => {
    const animations = data.map((item, index) =>
      Animated.timing(barAnimations[index], {
        toValue: item.score,
        duration: 1200,
        delay: index * 200,
        easing: Easing.out(Easing.elastic(1)),
        useNativeDriver: false,
      })
    );
    
    Animated.stagger(150, animations).start();
  }, [data]);

  const getBarColor = () => {
    switch (activeTab) {
      case 'daily': return '#7B61FF'; // Violet
      case 'weekly': return '#5A8DEE'; // Blue
      case 'monthly': return '#3DDAD7'; // Teal
      default: return '#7B61FF'; // Violet
    }
  };

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.chartBarContainer}
            onPress={() => setSelectedBar(selectedBar === index ? null : index)}
            activeOpacity={0.7}
          >
            <View style={styles.chartBarWrapper}>
              <Animated.View 
                style={[
                  styles.chartBar,
                  { 
                    height: barAnimations[index].interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '85%']
                    }),
                    backgroundColor: getBarColor(),
                    transform: [{
                      scale: selectedBar === index ? 1.1 : 1
                    }]
                  }
                ]} 
              />
              
              {selectedBar === index && (
                <View style={styles.barGlowEffect} />
              )}
            </View>
            
            <Text style={styles.chartLabel}>
              {activeTab === 'daily' ? item.time : 
               activeTab === 'weekly' ? item.day : item.week}
            </Text>
            <Text style={styles.chartValue}>{item.score}</Text>
            
            {selectedBar === index && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>{item.score} points</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function MentalHealthReports({ navigation }) {
  const [activeTab, setActiveTab] = useState('weekly');
  const contentAnim = useRef(new Animated.Value(0)).current;

  const data = {
    daily: DUMMY_DAILY,
    weekly: DUMMY_WEEKLY,
    monthly: DUMMY_MONTHLY,
  }[activeTab];

  const scores = data.map(d => d.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  useEffect(() => {
    contentAnim.setValue(0);
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 800,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const contentOpacity = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <Screen>
      <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Chart Section */}
        <Animated.View 
          style={[
            styles.mainContent,
            { opacity: contentOpacity }
          ]}
        >
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Mood Pattern
                </Text>
                <Text style={styles.chartSubtitle}>
                  Average: {avgScore} points • Tap bars for details
                </Text>
              </View>
              <Icon name="analytics-outline" size={32} color="#5A8DEE" />
            </View>

            <AnimatedBarChart data={data} activeTab={activeTab} />
          </View>

          {/* Tabs */}
          <View style={styles.tabSection}>
            <Text style={styles.tabSectionTitle}>Time Range</Text>
            <View style={styles.tabContainer}>
              {['daily', 'weekly', 'monthly'].map((tab, index) => (
                <TabButton
                  key={tab}
                  title={tab.charAt(0).toUpperCase() + tab.slice(1)}
                  value={tab}
                  isActive={activeTab === tab}
                  onPress={setActiveTab}
                  index={index}
                />
              ))}
            </View>
          </View>

          {/* Motivation Section */}
          <View style={styles.motivationSection}>
            <LottieView
              source={require('../../assets/json/Meditation.json')}
              autoPlay
              loop
              style={styles.motivationAnimation}
            />
            <View style={styles.motivationText}>
              <Text style={styles.motivationTitle}>Great Progress! 🎉</Text>
              <Text style={styles.motivationSubtitle}>
                Your mindfulness practice is paying off. Keep going!
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation navigation={navigation} />


    </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFF',
  },
  scrollView: {
    flex: 1,
    marginBottom: 80, // Add margin to prevent content from being hidden behind navigation
  },

  tabSection: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  tabSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAF1FB',
    borderRadius: 20,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  activeTabButton: {
    backgroundColor: '#5A8DEE',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  mainContent: {
    paddingBottom: 100,
  },
  chartSection: {
    marginHorizontal: 24,
    marginBottom: 30,
    marginTop : 30
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5A8DEE',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#4B5563',
  },
  chartContainer: {
    height: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    position: 'relative',
  },
  chartBarWrapper: {
    height: '85%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 28,
    position: 'relative',
  },
  chartBar: {
    width: 28,
    borderRadius: 14,
    minHeight: 20,
  },
  barGlowEffect: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5A8DEE30',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  chartLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  tooltip: {
    position: 'absolute',
    top: -40,
    backgroundColor: '#5A8DEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tooltipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  motivationSection: {
    marginHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF1FB',
    borderRadius: 25,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#5A8DEE',
  },
  motivationAnimation: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  motivationText: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  motivationSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 100, // Adjusted to be above the bottom navigation
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5A8DEE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});