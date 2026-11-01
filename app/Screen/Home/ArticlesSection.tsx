import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../assets/colors";
import { useArticles } from "../../hooks/useQueries";

const ArticlesSection = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();
  const { data: articles = [], isRefetching, refetch } = useArticles();

  const onRefresh = () => {
    refetch();
  };

  const handleArticlePress = (article: any) => {
    navigation.navigate("ArticleDetail", {
      article,
      onArticleUpdate: () => refetch(),
    });
  };

  return (
    <View style={styles.container}>
      {/* Popular Articles */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mindful Articles</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.seeAll}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.articlesScroll}
        contentContainerStyle={styles.articlesContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={216}
        snapToAlignment="start"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        {articles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.articleCard}
            onPress={() => handleArticlePress(article)}
          >
            {article.image && (
              <Image
                source={{ uri: article.image }}
                style={styles.articleImage}
              />
            )}
            <LinearGradient
              colors={["rgba(0,0,0,0.8)", "transparent"]}
              style={styles.articleGradient}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
            />
            <View style={styles.articleContent}>
              <Text style={styles.articleCategory}>{article.category}</Text>
              <Text style={styles.articleTitle} numberOfLines={2}>
                {article.title}
              </Text>
              <View style={styles.articleStats}>
                <View style={styles.statItem}>
                  <Ionicons
                    name="eye-outline"
                    size={12}
                    color={Colors.text.inverted}
                  />
                  <Text style={styles.articleStatText}>
                    {article.total_views || article.views_count || 0}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons
                    name={article.is_liked ? "heart" : "heart-outline"}
                    size={12}
                    color={Colors.text.inverted}
                  />
                  <Text style={styles.articleStatText}>
                    {article.total_likes}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.bookmarkButton}>
              <Ionicons
                name="bookmark-outline"
                size={16}
                color={Colors.text.inverted}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Indicator Dots */}
      <View style={styles.indicatorContainer}>
        {articles.map((_, index) => {
          const inputRange = [
            (index - 1) * 216,
            index * 216,
            (index + 1) * 216,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[styles.indicatorDot, { transform: [{ scale }], opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
};

// ... keep your existing styles the same

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutrals.background,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
  seeAll: {
    color: Colors.brand.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  articlesScroll: {
    marginBottom: 16,
  },
  articlesContent: {
    gap: 16,
    paddingRight: 16,
  },
  articleCard: {
    width: 200,
    height: 250,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.neutrals.surface,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  articleImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  articleGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  articleContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  articleCategory: {
    color: Colors.text.inverted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  articleTitle: {
    color: Colors.text.inverted,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
  },
  articleStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  articleStatText: {
    color: Colors.text.inverted,
    fontSize: 11,
    opacity: 0.9,
  },
  bookmarkButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.primary,
    marginHorizontal: 4,
  },
});

export default ArticlesSection;
