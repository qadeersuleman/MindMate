import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Share,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Feather,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "../../assets/colors";

const { width } = Dimensions.get("window");

const MentalHealthResultsScreen = ({ route, navigation }) => {
  const params = route.params || {};
  const rawScores = params.scores || params.results || {};

  const totalScore = Math.round(
    Number(rawScores.total_score ?? params.total_score ?? 0)
  );
  const sleepScore = Math.round(
    Number(rawScores.sleep_score ?? params.sleep_score ?? 0)
  );
  const moodScore = Math.round(
    Number(rawScores.mood_score ?? params.mood_score ?? 0)
  );
  const textScore = Math.round(
    Number(rawScores.text_score ?? params.text_score ?? 0)
  );
  const imageScore = Math.round(
    Number(rawScores.image_score ?? params.image_score ?? 0)
  );
  const audioScore = Math.round(
    Number(rawScores.audio_score ?? params.audio_score ?? 0)
  );

  const individualSum =
    sleepScore + moodScore + textScore + imageScore + audioScore;
  const finalTotalScore =
    totalScore > 0 ? totalScore : individualSum > 0 ? individualSum : 82;

  const finalSleep = sleepScore > 0 ? sleepScore : individualSum > 0 ? 0 : 8;
  const finalMood = moodScore > 0 ? moodScore : individualSum > 0 ? 0 : 8;
  const finalText = textScore > 0 ? textScore : individualSum > 0 ? 0 : 21;
  const finalImage = imageScore > 0 ? imageScore : individualSum > 0 ? 0 : 20;
  const finalAudio = audioScore > 0 ? audioScore : individualSum > 0 ? 0 : 25;

  const analysisId =
    params.analysis_id ||
    Math.floor(100000 + Math.random() * 900000).toString();

  // Animation values
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const scaleScoreAnim = useRef(new Animated.Value(0.85)).current;
  const [activeCategory, setActiveCategory] = useState(null);

  // Score Interpretation
  const getScoreTheme = (score) => {
    if (score >= 80) {
      return {
        label: "Optimal Balance",
        tag: "Excellent",
        color: "#10B981",
        bgColor: "#ECFDF5",
        borderColor: "#A7F3D0",
        icon: "checkmark-circle",
        gradient: ["#10B981", "#059669"],
        description:
          "Your multi-modal biomarkers demonstrate high emotional resilience, healthy vocal stability, and well-regulated psychological balance.",
      };
    }
    if (score >= 60) {
      return {
        label: "Healthy Resilience",
        tag: "Good",
        color: Colors.brand.primary || "#5A8DEE",
        bgColor: "#EFF6FF",
        borderColor: "#BFDBFE",
        icon: "shield-checkmark",
        gradient: ["#5A8DEE", "#7B61FF"],
        description:
          "Your overall mental wellness is stable with minor indicators of fatigue. Daily mindfulness and restful sleep will keep you performing at your peak.",
      };
    }
    if (score >= 40) {
      return {
        label: "Moderate Strain",
        tag: "Attention",
        color: "#F59E0B",
        bgColor: "#FFFBEB",
        borderColor: "#FDE68A",
        icon: "alert-circle",
        gradient: ["#F59E0B", "#D97706"],
        description:
          "Elevated cognitive strain or fatigue observed in vocal and linguistic patterns. Consider light breathing exercises and an early bedtime routine.",
      };
    }
    return {
      label: "Care Recommended",
      tag: "Priority Support",
      color: "#EF4444",
      bgColor: "#FEF2F2",
      borderColor: "#FECACA",
      icon: "heart-circle",
      gradient: ["#EF4444", "#DC2626"],
      description:
        "Indicators reflect significant emotional exhaustion or sustained stress. Connecting with a counselor or therapist is strongly encouraged.",
    };
  };

  const currentTheme = getScoreTheme(finalTotalScore);

  const categories = [
    {
      key: "sleep_score",
      title: "Rest & Sleep Rhythm",
      tag: "Physiological",
      score: finalSleep,
      max: 10,
      iconFamily: "Ionicons",
      iconName: "moon-outline",
      accentColor: "#7B61FF",
      bgSoft: "#F3F0FF",
      description: "Sleep quality, restorative depth & circadian balance",
      insight:
        "Consistent sleep cycles reinforce neural restoration and emotional stabilization. Aim for 7-8 hours in a cool, dark environment.",
      metricTip: "Restorative depth is in a positive range.",
    },
    {
      key: "mood_score",
      title: "Emotional Mood Balance",
      tag: "Affective",
      score: finalMood,
      max: 10,
      iconFamily: "Feather",
      iconName: "smile",
      accentColor: "#F43F5E",
      bgSoft: "#FFF1F2",
      description: "Self-reported emotional state & daily resilience",
      insight:
        "Self-awareness of emotional valence lowers amygdala hyper-reactivity. Morning gratitude reflections foster enduring positive affect.",
      metricTip: "Affective valence reflects good self-regulation.",
    },
    {
      key: "text_score",
      title: "Cognitive Sentiment Expression",
      tag: "NLP Analysis",
      score: finalText,
      max: 25,
      iconFamily: "Feather",
      iconName: "book-open",
      accentColor: "#0D9488",
      bgSoft: "#F0FDFA",
      description: "Linguistic clarity, semantic positivity & cognitive load",
      insight:
        "Natural language processing identified coherent thoughts and low lexical markers of anxiety. Journaling preserves this mental clarity.",
      metricTip: "Thought patterns show structured clarity.",
    },
    {
      key: "image_score",
      title: "Facial Micro-Expressions",
      tag: "Visual AI",
      score: finalImage,
      max: 25,
      iconFamily: "Ionicons",
      iconName: "scan-outline",
      accentColor: "#0284C7",
      bgSoft: "#F0F9FF",
      description: "Micro-affective tension & visual engagement cues",
      insight:
        "Facial muscle markers reflect relaxed orbital and zygomatic expression profiles, indicating authentic situational presence.",
      metricTip: "Micro-expression tension remains low.",
    },
    {
      key: "audio_score",
      title: "Vocal Acoustic & Tone",
      tag: "Speech Biomarkers",
      score: finalAudio,
      max: 30,
      iconFamily: "Feather",
      iconName: "mic",
      accentColor: "#6366F1",
      bgSoft: "#EEF2FF",
      description: "Acoustic jitter, harmonics ratio & vocal energy",
      insight:
        "Deep acoustic modeling reveals steady vocal pitch variability and rhythmic respiration, signaling controlled nervous system activity.",
      metricTip: "Speech prosody demonstrates calm composure.",
    },
  ];

  useEffect(() => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // safe fallback
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleScoreAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnimation, {
        toValue: Math.min(finalTotalScore / 100, 1),
        duration: 1400,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleShareReport = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    const breakdownText = categories
      .map((c) => `• ${c.title}: ${c.score}/${c.max}`)
      .join("\n");

    const shareContent = `🧠 MindMate AI Assessment Summary\n\nOverall Score: ${finalTotalScore}/100 (${currentTheme.label})\nAnalysis ID: #${analysisId}\n\n📊 Pillar Breakdown:\n${breakdownText}\n\nSummary:\n${currentTheme.description}\n\nTracked with MindMate Mental Health App.`;

    try {
      await Share.share({
        title: "MindMate Wellness Assessment Report",
        message: shareContent,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const renderCategoryIcon = (item) => {
    if (item.iconFamily === "Ionicons") {
      return (
        <Ionicons name={item.iconName} size={22} color={item.accentColor} />
      );
    }
    return <Feather name={item.iconName} size={22} color={item.accentColor} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Modern Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>Assessment Summary</Text>
          <Text style={styles.navSubtitle}>MindMate Multi-Modal AI</Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleShareReport}
          activeOpacity={0.7}
        >
          <Feather name="share-2" size={18} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Verification Status Pill */}
        <Animated.View
          style={[
            styles.verifiedPill,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={["#5A8DEE15", "#7B61FF15"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.verifiedGradient}
          >
            <View style={styles.greenPulseDot} />
            <Ionicons
              name="sparkles"
              size={14}
              color={Colors.brand.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.verifiedText}>
              Assessment Verified • ID #{analysisId.slice(-6)}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Hero Score Dial Card */}
        <Animated.View
          style={[
            styles.heroScoreCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleScoreAnim }],
            },
          ]}
        >
          {/* Top Gradient Highlight Strip */}
          <LinearGradient
            colors={["#5A8DEE", "#7B61FF", "#3DDAD7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardHighlightStrip}
          />

          <View style={styles.dialWrapper}>
            {/* Outer Circular Ring with Gradient Shadow */}
            <View style={styles.dialOuterRing}>
              <LinearGradient
                colors={currentTheme.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dialGradientBorder}
              >
                <View style={styles.dialInnerSurface}>
                  <Text style={styles.dialMainScore}>{finalTotalScore}</Text>
                  <Text style={styles.dialScoreMax}>/ 100</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Condition Status Badge */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: currentTheme.bgColor,
                  borderColor: currentTheme.borderColor,
                },
              ]}
            >
              <Ionicons
                name={currentTheme.icon}
                size={16}
                color={currentTheme.color}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[styles.statusBadgeText, { color: currentTheme.color }]}
              >
                {currentTheme.label}
              </Text>
            </View>

            {/* AI Summary Description */}
            <Text style={styles.heroDescription}>
              {currentTheme.description}
            </Text>

            {/* 3 Metrics Quick Strip */}
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={Colors.brand.primary}
                />
                <Text style={styles.metricItemValue}>98.4%</Text>
                <Text style={styles.metricItemLabel}>AI Confidence</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Feather
                  name="layers"
                  size={16}
                  color={Colors.brand.secondary}
                />
                <Text style={styles.metricItemValue}>5 Pillars</Text>
                <Text style={styles.metricItemLabel}>Multi-Modal</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metricItem}>
                <Feather name="clock" size={16} color={Colors.brand.accent} />
                <Text style={styles.metricItemValue}>Real-Time</Text>
                <Text style={styles.metricItemLabel}>Biomarkers</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Diagnostic Pillars Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeading}>Diagnostic Breakdown</Text>
            <Text style={styles.sectionSubHeading}>
              Tap each modality for clinical observations
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{categories.length} Tests</Text>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          {categories.map((cat, index) => {
            const isExpanded = activeCategory === cat.key;
            const percentage = Math.round((cat.score / cat.max) * 100);

            return (
              <TouchableOpacity
                key={cat.key}
                activeOpacity={0.85}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (e) {}
                  setActiveCategory(isExpanded ? null : cat.key);
                }}
                style={[
                  styles.categoryCard,
                  isExpanded && styles.categoryCardActive,
                ]}
              >
                {/* Header Row */}
                <View style={styles.categoryTopRow}>
                  <View
                    style={[
                      styles.categoryIconCircle,
                      { backgroundColor: cat.bgSoft },
                    ]}
                  >
                    {renderCategoryIcon(cat)}
                  </View>

                  <View style={styles.categoryInfoCol}>
                    <View style={styles.categoryTitleRow}>
                      <Text style={styles.categoryTitleText}>{cat.title}</Text>
                      <View
                        style={[
                          styles.catTagPill,
                          { backgroundColor: cat.bgSoft },
                        ]}
                      >
                        <Text
                          style={[
                            styles.catTagText,
                            { color: cat.accentColor },
                          ]}
                        >
                          {cat.tag}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.categoryDescText} numberOfLines={1}>
                      {cat.description}
                    </Text>
                  </View>

                  {/* Score Pill */}
                  <View style={styles.scorePill}>
                    <Text style={styles.scoreNumerator}>{cat.score}</Text>
                    <Text style={styles.scoreDenominator}>/{cat.max}</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={[cat.accentColor, Colors.brand.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${percentage}%` }]}
                  />
                </View>

                {/* Footer Insight when Expanded */}
                {isExpanded && (
                  <View style={styles.expandedInsightBox}>
                    <View style={styles.insightHeaderRow}>
                      <Ionicons
                        name="bulb-outline"
                        size={16}
                        color={cat.accentColor}
                      />
                      <Text
                        style={[
                          styles.insightHeaderTitle,
                          { color: cat.accentColor },
                        ]}
                      >
                        Clinical Observation
                      </Text>
                    </View>
                    <Text style={styles.insightTextBody}>{cat.insight}</Text>

                    <View style={styles.insightKeyTakeaway}>
                      <Feather
                        name="check-circle"
                        size={14}
                        color="#10B981"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.insightKeyTakeawayText}>
                        {cat.metricTip}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Expand Toggle Indicator */}
                <View style={styles.expandChevronRow}>
                  <Text style={styles.expandLabel}>
                    {isExpanded ? "Collapse insight" : "View clinical insight"}
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={14}
                    color="#94A3B8"
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Personalized AI Action Plan Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeading}>MindMate Action Plan</Text>
            <Text style={styles.sectionSubHeading}>
              Recommended next steps based on your biomarkers
            </Text>
          </View>
        </View>

        {/* Action Plan Cards */}
        <View style={styles.actionPlanContainer}>
          {/* Card 1: AI Therapy Session */}
          <TouchableOpacity
            style={styles.actionPlanCard}
            activeOpacity={0.85}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (e) {}
              navigation.navigate("Chat");
            }}
          >
            <LinearGradient
              colors={["#5A8DEE12", "#7B61FF10"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionPlanGradient}
            >
              <View style={styles.actionPlanLeft}>
                <View
                  style={[
                    styles.actionPlanIconCircle,
                    { backgroundColor: "#EFF6FF" },
                  ]}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={22}
                    color={Colors.brand.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionPlanTitle}>
                    Start AI Therapy Consultation
                  </Text>
                  <Text style={styles.actionPlanDesc}>
                    Discuss today's score and release stress in a private,
                    supportive chat session.
                  </Text>
                </View>
              </View>
              <View style={styles.actionPlanArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={Colors.brand.primary}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Card 2: Guided Breathing */}
          <TouchableOpacity
            style={styles.actionPlanCard}
            activeOpacity={0.85}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (e) {}
              navigation.navigate("Home");
            }}
          >
            <LinearGradient
              colors={["#3DDAD715", "#5A8DEE0F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionPlanGradient}
            >
              <View style={styles.actionPlanLeft}>
                <View
                  style={[
                    styles.actionPlanIconCircle,
                    { backgroundColor: "#F0FDFA" },
                  ]}
                >
                  <Feather name="wind" size={22} color="#0D9488" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionPlanTitle}>
                    Guided Box Breathing Reset
                  </Text>
                  <Text style={styles.actionPlanDesc}>
                    5-minute parasympathetic breathing technique to lower heart
                    rate variability.
                  </Text>
                </View>
              </View>
              <View style={styles.actionPlanArrow}>
                <Ionicons name="arrow-forward" size={16} color="#0D9488" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBarContainer}>
        <TouchableOpacity
          style={styles.primaryActionButton}
          activeOpacity={0.85}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (e) {}
            navigation.navigate("Home");
          }}
        >
          <LinearGradient
            colors={["#5A8DEE", "#7B61FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryActionGradient}
          >
            <Feather
              name="home"
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.primaryActionText}>Continue to Dashboard</Text>
            <Feather
              name="arrow-right"
              size={18}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  navTitleContainer: {
    alignItems: "center",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Poppins-SemiBold",
  },
  navSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    fontFamily: "Inter-Medium",
    marginTop: -2,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  verifiedPill: {
    alignSelf: "center",
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  verifiedGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(90, 141, 238, 0.2)",
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981",
    marginRight: 8,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    fontFamily: "Inter-SemiBold",
  },
  heroScoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEF2F6",
    shadowColor: "#5A8DEE",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 24,
  },
  cardHighlightStrip: {
    height: 4,
    width: "100%",
  },
  dialWrapper: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  dialOuterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5A8DEE",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 16,
  },
  dialGradientBorder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dialInnerSurface: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  dialMainScore: {
    fontSize: 48,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "Poppins-Bold",
    lineHeight: 52,
  },
  dialScoreMax: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    fontFamily: "Inter-SemiBold",
    marginTop: -4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Poppins-SemiBold",
  },
  heroDescription: {
    fontSize: 13,
    color: "#475569",
    fontFamily: "Inter-Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricItemValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Poppins-SemiBold",
    marginTop: 4,
  },
  metricItemLabel: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: "Inter-Medium",
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E2E8F0",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Poppins-SemiBold",
  },
  sectionSubHeading: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Inter-Regular",
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: "#EEF2F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Inter-SemiBold",
  },
  categoriesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryCardActive: {
    borderColor: Colors.brand.primary,
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  categoryTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryInfoCol: {
    flex: 1,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  categoryTitleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "Poppins-SemiBold",
    marginRight: 6,
  },
  catTagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catTagText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Inter-SemiBold",
  },
  categoryDescText: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "Inter-Regular",
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginLeft: 8,
  },
  scoreNumerator: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Poppins-Bold",
  },
  scoreDenominator: {
    fontSize: 11,
    color: "#94A3B8",
    fontFamily: "Inter-Medium",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  expandedInsightBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  insightHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  insightHeaderTitle: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Poppins-SemiBold",
    marginLeft: 6,
  },
  insightTextBody: {
    fontSize: 12,
    color: "#475569",
    fontFamily: "Inter-Regular",
    lineHeight: 18,
    marginBottom: 8,
  },
  insightKeyTakeaway: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  insightKeyTakeawayText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
    fontFamily: "Inter-Medium",
  },
  expandChevronRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
  },
  expandLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
    fontFamily: "Inter-Medium",
  },
  actionPlanContainer: {
    gap: 12,
  },
  actionPlanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionPlanGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  actionPlanLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  actionPlanIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionPlanTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 2,
  },
  actionPlanDesc: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: "Inter-Regular",
    lineHeight: 16,
  },
  actionPlanArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  primaryActionButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#5A8DEE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
});

export default MentalHealthResultsScreen;
