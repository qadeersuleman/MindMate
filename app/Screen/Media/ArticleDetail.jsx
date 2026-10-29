import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../assets/colors";
import {
  toggleArticleLike,
  trackArticleView,
  getArticleLikeStatus
} from "../../Services/api";

const { width } = Dimensions.get("window");

export default function ArticleDetail({ route, navigation }) {
  const { article } = route.params;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [viewCount, setViewCount] = useState(article.total_views || 0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Load initial like status and track view when component mounts
  useEffect(() => {
    const initializeArticleData = async () => {
      try {
        setLoadingInitial(true);
        
        // Track view first
        try {
          const viewResult = await trackArticleView(article.id);
          if (viewResult.success) {
            setViewCount(viewResult.total_views);
          }
        } catch (viewError) {
          console.log("View tracking error:", viewError.message);
        }

        // Then load like status
        try {
          const likeStatus = await getArticleLikeStatus(article.id);
          if (likeStatus.success) {
            setIsLiked(likeStatus.is_liked);
            setLikeCount(likeStatus.like_count);
            console.log('Initial like status loaded:', {
              is_liked: likeStatus.is_liked,
              like_count: likeStatus.like_count
            });
          }
        } catch (likeError) {
          console.log("Like status loading error:", likeError.message);
          // Fallback to article data if available
          if (article.is_liked !== undefined) {
            setIsLiked(article.is_liked);
          }
          if (article.total_likes !== undefined) {
            setLikeCount(article.total_likes);
          }
        }
      } catch (error) {
        console.log("Initialization error:", error.message);
      } finally {
        setLoadingInitial(false);
      }
    };

    initializeArticleData();
  }, [article.id]);

  useEffect(() => {
    // Staggered animations after data is loaded
    if (!loadingInitial) {
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
        }),
      ]).start();
    }
  }, [loadingInitial]);

  const handleLikeToggle = async () => {
    if (loadingLike || loadingInitial) return;
    
    console.log('Starting like toggle, current state:', { isLiked, likeCount });
    setLoadingLike(true);

    try {
      const response = await toggleArticleLike(article.id);
      
      console.log('API Response:', response);
      
      if (response.success) {
        setIsLiked(response.liked);
        setLikeCount(response.like_count);
        console.log('Updated state:', { liked: response.liked, count: response.like_count });
      } else {
        throw new Error(response.error || 'Like operation failed');
      }
    } catch (error) {
      console.log("Like toggle error:", error.message);
      if (error.message.includes("not logged in")) {
        // Show confirmation before navigating to login
        alert("Please login to like articles");
        navigation.navigate("Login");
      } else {
        alert("Failed to update like: " + error.message);
      }
    } finally {
      setLoadingLike(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSharePress = () => {
    // Implement share functionality
    alert("Share functionality coming soon!");
  };

  const handleCommentPress = () => {
    // Implement comment functionality
    alert("Comment functionality coming soon!");
  };

  const handleBookmarkPress = () => {
    // Implement bookmark functionality
    alert("Bookmark functionality coming soon!");
  };

  if (loadingInitial) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.neutrals.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>Loading Article...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>Article Detail</Text>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleBookmarkPress}
          >
            <Ionicons
              name="bookmark-outline"
              size={22}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Animated Tags */}
          <Animated.View
            style={[
              styles.tagsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <View style={styles.tags}>
              <View
                style={[
                  styles.tag,
                  { backgroundColor: Colors.features.mindfulness + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: Colors.features.mindfulness },
                  ]}
                >
                  Article
                </Text>
              </View>
              <View
                style={[
                  styles.tag,
                  { backgroundColor: Colors.features.meditation + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: Colors.features.meditation },
                  ]}
                >
                  Philosophy
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Animated Title */}
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            {article.title}
          </Animated.Text>

          {/* Animated Stats */}
          <Animated.View
            style={[
              styles.statsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Ionicons name="eye" size={16} color={Colors.accent.teal} />
                <Text style={styles.statText}>{viewCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={16} 
                  color={Colors.accent.coral} 
                />
                <Text style={styles.statText}>{likeCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons
                  name="chatbubble"
                  size={16}
                  color={Colors.accent.lavender}
                />
                <Text style={styles.statText}>23</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={16} color={Colors.text.tertiary} />
                <Text style={styles.statText}>5 min read</Text>
              </View>
            </View>
          </Animated.View>

          {/* Animated Content Sections */}
          <Animated.View
            style={[
              styles.contentSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: Colors.features.mindfulness + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.sectionIconText,
                    { color: Colors.features.mindfulness },
                  ]}
                >
                  🧘
                </Text>
              </View>
              <Text style={styles.sectionTitle}>Introduction</Text>
            </View>
            <Text style={styles.paragraph}>{article.content}</Text>
          </Animated.View>

          {/* Animated Image */}
          {article.image && (
            <Animated.View
              style={[
                styles.imageContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideUpAnim }],
                },
              ]}
            >
              <Image
                source={{ uri: article.image }}
                style={styles.articleImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />
            </Animated.View>
          )}

          {/* Additional Content Sections */}
          <Animated.View
            style={[
              styles.contentSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: Colors.features.journal + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.sectionIconText,
                    { color: Colors.features.journal },
                  ]}
                >
                  📖
                </Text>
              </View>
              <Text style={styles.sectionTitle}>Deep Dive</Text>
            </View>
            <Text style={styles.paragraph}>
              In this philosophical exploration, we delve into the various
              dimensions of life, seeking to unravel its deeper meaning and
              significance. From ancient Greek philosophers to modern
              existentialists, the quest continues.
            </Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.actionButtons,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.actionBtn, 
                styles.likeBtn,
                loadingLike && styles.disabledBtn
              ]}
              onPress={handleLikeToggle}
              disabled={loadingLike}
            >
              {loadingLike ? (
                <ActivityIndicator size="small" color={Colors.accent.coral} />
              ) : (
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={20}
                  color={Colors.accent.coral}
                />
              )}
              <Text
                style={[styles.actionBtnText, { color: Colors.accent.coral }]}
              >
                {likeCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.shareBtn]}
              onPress={handleSharePress}
            >
              <Ionicons
                name="share-social-outline"
                size={20}
                color={Colors.brand.primary}
              />
              <Text
                style={[styles.actionBtnText, { color: Colors.brand.primary }]}
              >
                Share
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.commentBtn]}
              onPress={handleCommentPress}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={Colors.accent.teal}
              />
              <Text
                style={[styles.actionBtnText, { color: Colors.accent.teal }]}
              >
                Comment
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.background,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.text.secondary,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
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
  tagsContainer: {
    marginVertical: 10,
  },
  tags: {
    flexDirection: "row",
  },
  tag: {
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
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    marginVertical: 15,
    letterSpacing: -0.5,
  },
  statsContainer: {
    marginVertical: 10,
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
    marginLeft: 4,
  },
  contentSection: {
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  paragraph: {
    color: Colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  imageContainer: {
    position: "relative",
    marginVertical: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  articleImage: {
    width: "100%",
    height: 200,
    borderRadius: 20,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 25,
    paddingHorizontal: 10,
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
    minWidth: 80,
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  actionBtnText: {
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 14,
  },
});