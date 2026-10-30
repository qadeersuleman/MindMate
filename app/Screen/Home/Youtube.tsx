import React, { useEffect, useRef, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from 'react-native-webview';
import Colors from "../../assets/colors";

const { width } = Dimensions.get('window');

export default function VideoDetail({ route, navigation }) {
  const { video } = route.params;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [useWebView, setUseWebView] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const playerScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      })
    ]).start();

    // Auto-show player after a delay
    setTimeout(() => {
      setShowPlayer(true);
      setUseWebView(true); // Switch to WebView after initial render
      Animated.spring(playerScaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }, 500);
  }, []);

  const handlePlayPress = () => {
    if (!useWebView) {
      // If WebView isn't ready, open in YouTube app
      handleYouTubePress();
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBookmarkPress = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleYouTubePress = () => {
    Linking.openURL(`https://www.youtube.com/watch?v=${video.videoId}`);
  };

  // YouTube iframe HTML for WebView
  const youtubeHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            margin: 0; 
            background: #000; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
          }
          .container { 
            width: 100%; 
            height: 100%; 
          }
          iframe { 
            width: 100%; 
            height: 100%; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <iframe 
            src="https://www.youtube.com/embed/${video.videoId}?autoplay=${isPlaying ? 1 : 0}&controls=1&showinfo=0&rel=0" 
            frameborder="0" 
            allow="autoplay; encrypted-media" 
            allowfullscreen>
          </iframe>
        </div>
      </body>
    </html>
  `;

  const formatCount = (count) => {
    if (count.includes('K')) return count;
    const num = parseInt(count);
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return count;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={Colors.neutrals.background} 
      />
      
      <View style={styles.container}>
        {/* Animated Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Video Detail</Text>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleBookmarkPress}
          >
            <Ionicons 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={22} 
              color={isBookmarked ? Colors.accent.coral : Colors.text.primary} 
            />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* YouTube Player Section */}
          <Animated.View 
            style={[
              styles.playerContainer,
              {
                opacity: showPlayer ? fadeAnim : 0,
                transform: [
                  { translateY: slideUpAnim },
                  { scale: playerScaleAnim }
                ]
              }
            ]}
          >
            {useWebView ? (
              <WebView
                style={styles.webview}
                source={{ html: youtubeHTML }}
                allowsFullscreenVideo={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scrollEnabled={false}
              />
            ) : (
              // Fallback thumbnail before WebView loads
              <Image
                source={{ uri: video.thumbnail }}
                style={styles.thumbnail}
              />
            )}
            
            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <TouchableOpacity 
                style={styles.playOverlay}
                onPress={handlePlayPress}
                activeOpacity={0.8}
              >
                <Animated.View style={styles.playButton}>
                  <Ionicons name="play" size={40} color="#fff" />
                </Animated.View>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Alternative YouTube Button */}
          <TouchableOpacity 
            style={styles.youtubeButton}
            onPress={handleYouTubePress}
          >
            <Ionicons name="logo-youtube" size={20} color="#fff" />
            <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
          </TouchableOpacity>

          {/* Video Info Section */}
          <Animated.View 
            style={[
              styles.videoInfoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }]
              }
            ]}
          >
            {/* Tags */}
            <View style={styles.tagsContainer}>
              <View style={[styles.tag, { backgroundColor: Colors.features.mindfulness + '20' }]}>
                <Text style={[styles.tagText, { color: Colors.features.mindfulness }]}>
                  {video.category}
                </Text>
              </View>
              <View style={[styles.tag, { backgroundColor: '#FF000020' }]}>
                <Ionicons name="logo-youtube" size={12} color="#FF0000" />
                <Text style={[styles.tagText, { color: '#FF0000', marginLeft: 4 }]}>
                  YouTube
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>{video.title}</Text>

            {/* Video Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Ionicons name="eye" size={16} color={Colors.accent.teal} />
                  <Text style={styles.statText}>{formatCount(video.likes)} views</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={16} color={Colors.text.tertiary} />
                  <Text style={styles.statText}>{video.duration}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="calendar" size={16} color={Colors.accent.lavender} />
                  <Text style={styles.statText}>2 weeks ago</Text>
                </View>
              </View>
            </View>

            {/* Channel Info */}
            <View style={styles.channelCard}>
              <View style={styles.channelRow}>
                <Image
                  source={{ uri: `https://ui-avatars.com/api/?name=Mindful+Channel&background=667eea&color=fff` }}
                  style={styles.channelImage}
                />
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>Mindful Channel</Text>
                  <Text style={styles.subscriberCount}>245K subscribers</Text>
                </View>
                <TouchableOpacity style={styles.subscribeBtn} onPress={handleYouTubePress}>
                  <Text style={styles.subscribeText}>Subscribe</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Video Description */}
          <Animated.View 
            style={[
              styles.descriptionSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: Colors.features.journal + '20' }]}>
                <Text style={[styles.sectionIconText, { color: Colors.features.journal }]}>📝</Text>
              </View>
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.description}>
              This guided session helps you find inner peace and mindfulness through 
              carefully crafted exercises. Perfect for beginners and experienced practitioners alike.
            </Text>
            
            {/* Video Highlights */}
            <View style={styles.highlights}>
              <Text style={styles.highlightsTitle}>What you'll learn:</Text>
              <View style={styles.highlightItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.features.mindfulness} />
                <Text style={styles.highlightText}>Mindfulness breathing techniques</Text>
              </View>
              <View style={styles.highlightItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.features.mindfulness} />
                <Text style={styles.highlightText}>Stress reduction methods</Text>
              </View>
              <View style={styles.highlightItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.features.mindfulness} />
                <Text style={styles.highlightText}>Improved focus and concentration</Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View 
            style={[
              styles.actionButtons,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={[styles.actionBtn, styles.likeBtn, isLiked && styles.likedBtn]}
              onPress={handleLikePress}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={isLiked ? "#FF0000" : Colors.accent.coral} 
              />
              <Text style={[
                styles.actionBtnText, 
                { color: isLiked ? "#FF0000" : Colors.accent.coral }
              ]}>
                {isLiked ? "Liked" : "Like"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, styles.shareBtn]}
              onPress={handleYouTubePress}
            >
              <Ionicons name="logo-youtube" size={20} color="#FF0000" />
              <Text style={[styles.actionBtnText, { color: "#FF0000" }]}>YouTube</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionBtn, styles.downloadBtn]}>
              <Ionicons name="download-outline" size={20} color={Colors.accent.teal} />
              <Text style={[styles.actionBtnText, { color: Colors.accent.teal }]}>Save</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Related Videos */}
          <Animated.View 
            style={[
              styles.relatedSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: Colors.features.meditation + '20' }]}>
                <Text style={[styles.sectionIconText, { color: Colors.features.meditation }]}>🎬</Text>
              </View>
              <Text style={styles.sectionTitle}>Related Videos</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedScroll}>
              {[1, 2, 3].map((item) => (
                <TouchableOpacity key={item} style={styles.relatedCard}>
                  <Image
                    source={{ uri: video.thumbnail }}
                    style={styles.relatedThumbnail}
                  />
                  <Text style={styles.relatedTitle} numberOfLines={2}>
                    Related meditation video #{item}
                  </Text>
                  <Text style={styles.relatedChannel}>Mindful Channel</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </ScrollView>

        {/* Floating Play Button */}
        <Animated.View 
          style={[
            styles.floatingPlayButton,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.playFab, isPlaying && styles.playingFab]}
            onPress={handlePlayPress}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutrals.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutrals.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.neutrals.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.border,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  headerText: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  iconButton: {
    padding: 5,
  },
  playerContainer: {
    height: 220,
    marginBottom: 10,
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "#000",
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  youtubeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 3,
  },
  youtubeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  videoInfoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    marginBottom: 15,
  },
  statsContainer: {
    marginBottom: 20,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  statText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  channelCard: {
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  channelImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  channelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  channelName: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  subscriberCount: {
    color: Colors.text.secondary,
    fontSize: 13,
    marginTop: 2,
  },
  subscribeBtn: {
    backgroundColor: "#FF0000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionIconText: {
    fontSize: 16,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  description: {
    color: Colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  highlights: {
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
  },
  highlightsTitle: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  highlightText: {
    color: Colors.text.secondary,
    fontSize: 14,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: Colors.neutrals.surface,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  likedBtn: {
    backgroundColor: "#FF000010",
    borderColor: "#FF000030",
  },
  actionBtnText: {
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 14,
  },
  relatedSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  relatedScroll: {
    marginHorizontal: -20,
  },
  relatedCard: {
    width: 200,
    marginRight: 15,
  },
  relatedThumbnail: {
    width: 200,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  relatedTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  relatedChannel: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  floatingPlayButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
  },
  playFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playingFab: {
    backgroundColor: Colors.accent.teal,
  },
});