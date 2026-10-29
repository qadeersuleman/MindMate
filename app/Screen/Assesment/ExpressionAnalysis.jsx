import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import Headers from '../../components/Assesment/Header';
import Title from '../../components/Assesment/Title';
import AppButton from '../../components/AppButton';
import Colors from '../../assets/colors';
import { submitAssessment } from '../../Services/api';
import { getSession } from '../../utils/session';

const ExpressionAnalysis = ({ route, navigation }) => {
  const [text, setText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const maxCharLimit = 250;

  // Get assessment data from previous screens
  const {  mood, sleep_quality, captured_image, image_format } = route.params;
  

  console.log("mood:", mood);
  console.log("sleep_quality:", sleep_quality);
  console.log("Image format:", image_format);
  console.log("Image data type:", typeof captured_image);
  console.log("Image data length:", captured_image?.length);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getSession();
      if (userData && userData.id) {
        setUserId(userData.id);
      }
    };
    fetchUserData();
  }, []);

  const handleTextChange = (input) => {
    setText(input);
    setCharCount(input.length);
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }

    // Prepare assessment data
    const assessmentData = {
      user: userId,
      mood,
      sleep_quality,
      expression_analysis: text,
    };

    // Add image data in correct format for backend
    if (image_format === 'base64' && captured_image) {
      // Send as base64 string - your backend should handle this
      assessmentData.captured_image = captured_image;
      console.log('Sending base64 image to backend');
    } else if (captured_image) {
      // If it's still file URI, we can't send it directly
      console.log('Cannot send file URI to backend, skipping image');
      assessmentData.captured_image = null;
    }

    console.log('Submitting assessment data:', {
      ...assessmentData,
      captured_image: assessmentData.captured_image ? `base64:${assessmentData.captured_image.length} chars` : 'null'
    });

    setIsLoading(true);

    try {
      await submitAssessment(assessmentData);
      navigation.navigate("SoundAnalysis", {
        mood,
        sleep_quality,
        captured_image,
        expression_text: text,
      });
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert("Submission Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // For displaying the image
  const imageSource = image_format === 'base64' 
    ? { uri: `data:image/jpeg;base64,${captured_image}` }
    : { uri: captured_image };

  return (
    <View style={styles.container}>
      <Headers onBack={() => navigation.goBack()} currentStep="4" />

      {/* Display Image */}
      <View style={styles.imageContainer}>
        {captured_image ? (
          <Image
            source={imageSource}
            style={styles.capturedImage}
            resizeMode="cover"
            onError={(error) => console.log("Image loading error:", error.nativeEvent.error)}
            onLoad={() => console.log("Image loaded successfully")}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No image available</Text>
          </View>
        )}
      </View>

      {/* Rest of your component remains the same */}
      <View style={styles.titleContainer}>
        <Title>Expression Analysis</Title>
        <Text style={styles.subtitle}>
          Freely write down anything that's on your mind.
        </Text>
        <Text style={styles.centeredText}>MindMate is here to listen...</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.textBox}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Start typing here..."
              placeholderTextColor={Colors.text.tertiary}
              onChangeText={handleTextChange}
              value={text}
              maxLength={maxCharLimit}
              autoFocus
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {charCount}/{maxCharLimit}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      ) : (
        <AppButton
          title="Continue"
          style={styles.appButton}
          onPress={handleSubmit}
          disabled={isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutrals.background,
    padding: 20,
    paddingTop: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  titleContainer: {
    marginTop: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 4,
  },
  centeredText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 14,
  },
  textBox: {
    flex: 1,
    backgroundColor: Colors.neutrals.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: Colors.ui.shadowDark,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
    minHeight: 300, // Give it a fixed minimum height
  },
  textInput: {
    color: Colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    minHeight: 200, // Minimum height for the input area
  },
  charCount: {
    color: Colors.text.tertiary,
    textAlign: 'right',
    fontSize: 12,
    marginTop: 10,
  },
  appButton: {
    marginBottom: 20,
    backgroundColor: Colors.brand.primary,
    borderRadius: 30,
  },
});

export default ExpressionAnalysis;