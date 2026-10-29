import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import {
  Poppins_600SemiBold,
  Poppins_800ExtraBold,
  Poppins_500Medium,
} from "@expo-google-fonts/poppins";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { Colors } from "../../assets/colors";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const WelcomeScreen = ({ navigation }) => {
  // Refs
  const animationComplete = useRef(false);

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(height * 0.1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Load fonts
  const [fontsLoaded] = useFonts({
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-ExtraBold": Poppins_800ExtraBold,
    "Poppins-Medium": Poppins_500Medium,
    "Inter-Regular": Inter_400Regular,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    // Combined entrance animations
    Animated.parallel([
      // Floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),

      // Slide up animation
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),

      // Scale animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),

      // Content fade in
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 500,
        useNativeDriver: true,
      }),

      // Gradient animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(gradientAnim, {
            toValue: 1,
            duration: 15000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(gradientAnim, {
            toValue: 0,
            duration: 15000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start(() => {
      animationComplete.current = true;
    });

    return () => {
      // Clean up animations
      [
        floatAnim,
        fadeAnim,
        slideUpAnim,
        scaleAnim,
        gradientAnim,
        contentOpacity,
      ].forEach((anim) => anim.stopAnimation());
    };
  }, [fontsLoaded]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const buttonScale = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.02, 1],
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Animated Gradient Background */}
      <Animated.View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["#f9f9f9", "#e6f2ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Floating Particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Animated.View
          key={`particle-${i}`}
          style={[
            styles.particle,
            {
              left: Math.random() * width,
              top: Math.random() * height * 0.6,
              backgroundColor: "#4A8AFF",
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3 + Math.random() * 0.3],
              }),
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.random() * 40 - 20],
                  }),
                },
                {
                  scale: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1 + Math.random() * 0.5],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Logo with Floating Animation */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/images/mindmate_logo_512.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Text Content with Slide Up Animation */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: contentOpacity,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <Text style={[styles.heading, { fontFamily: "Poppins-SemiBold" }]}>
            WELCOME TO
          </Text>
          <Text style={[styles.title, { fontFamily: "Poppins-ExtraBold" }]}>
            MindMate
          </Text>
          <Text style={[styles.subtitle, { fontFamily: "Inter-Regular" }]}>
            Your AI-powered mental wellness companion.
            {"\n"}Personalized, private, and always available.
          </Text>
        </Animated.View>

        {/* Animated Button - Replaced AppButton with TouchableOpacity */}
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              transform: [{ scale: buttonScale }],
              opacity: contentOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Signup")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#4A8AFF", "#3B7AE3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Footer with Fade Animation */}
      <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
        <Text style={[styles.footerText, { fontFamily: "Inter-Regular" }]}>
          Already have an account?
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={[styles.footerLink, { fontFamily: "Poppins-Medium" }]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: isTablet ? 48 : 24,
    paddingTop: isTablet ? height * 0.05 : height * 0.1,
  },
  particle: {
    position: "absolute",
    width: isSmallDevice ? 6 : 8,
    height: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 3 : 4,
  },
  logoContainer: {
    marginBottom: isTablet ? height * 0.03 : height * 0.035,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: isTablet ? height * 0.06 : height * 0.08,
    width: "100%",
  },
  heading: {
    fontSize: isTablet ? 20 : isSmallDevice ? 14 : 16,
    color: "#666",
    letterSpacing: 2,
    marginBottom: isTablet ? 12 : 8,
  },
  title: {
    fontSize: isTablet ? 56 : isSmallDevice ? 36 : 42,
    color: Colors.brand.primary,
    marginBottom: isTablet ? 24 : 16,
    textShadowColor: "rgba(74, 138, 255, 0.2)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: isTablet ? 20 : isSmallDevice ? 14 : 16,
    color: "#666",
    textAlign: "center",
    lineHeight: isTablet ? 30 : 24,
    paddingHorizontal: width * 0.05,
  },
  buttonWrapper: {
    width: isTablet ? width * 0.5 : width * 0.8,
    maxWidth: 400,
    marginBottom: isTablet ? height * 0.08 : height * 0.05,
  },
  button: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#4A8AFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientButton: {
    height: isTablet ? 60 : 50,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: isTablet ? 18 : 16,
    fontFamily: "Poppins-Medium",
    color: "white",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: isTablet ? height * 0.06 : height * 0.05,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  footerText: {
    color: "#666",
    fontSize: isTablet ? 16 : isSmallDevice ? 12 : 14,
    marginRight: 5,
  },
  footerLink: {
    color: "#4A8AFF",
    fontSize: isTablet ? 16 : isSmallDevice ? 12 : 14,
    textDecorationLine: "underline",
  },
  logoWrapper: {
    width: isTablet ? 140 : 105,
    height: isTablet ? 140 : 105,
    borderRadius: isTablet ? 36 : 26,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: isTablet ? 36 : 26,
  }
});

export default WelcomeScreen;