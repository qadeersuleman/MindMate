import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
  SafeAreaView,
  Animated,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { Video } from 'expo-av';
import { 
  Ionicons
} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { height, width } = Dimensions.get('window');

// Video data with descriptions and stats
const VIDEOS = [
  {
    id: '1',
    title: 'Morning Calmness',
    description: 'Start your day with peaceful breathing exercises',
    uri: require('../assets/Videos/video1.mp4'),
    likes: '2.4k',
    shares: '420',
    duration: '2:45',
    creator: 'Mindful Moments',
    category: 'Meditation',
  },
  {
    id: '2',
    title: 'Ocean Waves Meditation',
    description: 'Let the sound of waves calm your mind',
    uri: require('../assets/Videos/video2.mp4'),
    likes: '3.1k',
    shares: '589',
    duration: '4:20',
    creator: 'Calm Waters',
    category: 'Nature',
  },
  {
    id: '3',
    title: 'City Lights Reflection',
    description: 'Find peace in urban tranquility',
    uri: require('../assets/Videos/video3.mp4'),
    likes: '1.8k',
    shares: '312',
    duration: '3:15',
    creator: 'Urban Zen',
    category: 'Mindfulness',
  },
];

export default function ReelsAutoPlay({ navigation }) {
  const videoRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState([]);
  const [saved, setSaved] = useState([]);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Auto play only visible video
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === activeIndex) {
        video.playAsync();
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }).start();
      } else {
        video.pauseAsync();
        video.setPositionAsync(0);
      }
    });
  }, [activeIndex]);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
      setIsPaused(false);
      progressAnim.setValue(0);
    }
  }).current;

  const viewConfig = useRef({
    viewAreaCoveragePercentThreshold: 90,
  }).current;

  const togglePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const video = videoRefs.current[activeIndex];
    if (!video) return;

    if (isPaused) {
      await video.playAsync();
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();
    } else {
      await video.pauseAsync();
      progressAnim.stopAnimation();
    }
    setIsPaused(!isPaused);
  };

  const handleLike = (videoId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSave = (videoId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaved(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleShare = async (video) => {
    try {
      await Share.share({
        message: `Check out this calming video: ${video.title}\n${video.description}`,
        title: video.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the video');
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  const renderItem = ({ item, index }) => {
    const isLiked = liked.includes(item.id);
    const isSaved = saved.includes(item.id);
    const progressBarWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.videoContainer}>
        <Video
          ref={(ref) => (videoRefs.current[index] = ref)}
          source={item.uri}
          style={styles.video}
          resizeMode="cover"
          isLooping={true}
          shouldPlay={index === activeIndex && !isPaused}
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              progressAnim.setValue(0);
            }
          }}
        />

        {/* Top Gradient Only */}
        <View style={styles.topGradient} />

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { width: progressBarWidth }
            ]} 
          />
        </View>

        {/* Top Bar */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Video Info Overlay */}
        <View style={styles.videoInfoContainer}>
          <Text style={styles.videoTitle}>{item.title}</Text>
          <Text style={styles.videoDescription}>{item.description}</Text>
          
          <View style={styles.creatorContainer}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.avatarText}>{item.creator.charAt(0)}</Text>
            </View>
            <Text style={styles.creatorName}>{item.creator}</Text>
          </View>
        </View>

        {/* Play/Pause Button */}
        {isPaused && index === activeIndex && (
          <Animated.View style={[styles.playButton, { opacity: fadeAnim }]}>
            <TouchableOpacity onPress={togglePlayPause}>
              <View style={styles.playButtonCircle}>
                <Ionicons name="play" size={40} color="white" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Animated.FlatList
        data={VIDEOS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        decelerationRate="fast"
        snapToInterval={height}
        snapToAlignment="start"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    width,
    height,
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  progressBarContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 50,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF3040',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfoContainer: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
  },
  videoTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  videoDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  creatorName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButtonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});