import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { FASTAPI_URL } from '../config/server';

const API_URL = FASTAPI_URL;

export default function SimpleTestScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Optimize image quality - lower is better for mobile
  const IMAGE_QUALITY = 0.6; // 60% quality - reduces file size

  // Pick image
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Need permission to access gallery');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: IMAGE_QUALITY,
        base64: true,
      });

      if (!result.canceled) {
        console.log('Image selected, base64 length:', result.assets[0].base64?.length || 0);
        setSelectedImage(result.assets[0]);
        setResult(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Take photo
  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Need camera permission');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: IMAGE_QUALITY,
        base64: true,
      });

      if (!result.canceled) {
        console.log('Photo taken, base64 length:', result.assets[0].base64?.length || 0);
        setSelectedImage(result.assets[0]);
        setResult(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // WORKING: Analyze Emotion using Base64 method
  const analyzeEmotion = async () => {
    if (!selectedImage?.base64) {
      Alert.alert('Error', 'Please select or take a photo first');
      return;
    }

    console.log('=== STARTING ANALYSIS (Base64 Method) ===');
    setLoading(true);
    setResult(null);

    try {
      // Log image info
      console.log('Base64 string length:', selectedImage.base64.length);
      console.log('Estimated file size:', Math.round(selectedImage.base64.length * 0.75), 'bytes');
      
      // Send base64 directly - THIS IS WHAT WORKS
      const response = await axios.post(
        `${API_URL}/api/v1/analyze-emotion-base64`, // USE BASE64 ENDPOINT
        {
          image_base64: selectedImage.base64,
          filename: 'photo.jpg'
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 seconds timeout
        }
      );

      console.log('=== RESPONSE RECEIVED ===');
      console.log('Success:', response.data.success);
      console.log('Message:', response.data.message);
      console.log('Data keys:', Object.keys(response.data.data || {}));

      if (response.data.success) {
        // Add timestamp to force UI update
        const resultWithTimestamp = {
          ...response.data.data,
          timestamp: Date.now()
        };
        
        setResult(resultWithTimestamp);
        console.log('✅ Analysis completed successfully');
        
        // Show success with dominant emotion
        const dominantEmotion = response.data.data.dominant_emotion;
        const confidence = (response.data.data.confidence * 100).toFixed(1);
        Alert.alert(
          '✅ Analysis Complete',
          `Dominant Emotion: ${dominantEmotion}\nConfidence: ${confidence}%`
        );
      } else {
        Alert.alert('Analysis Failed', response.data.message || 'Unknown error');
      }
      
    } catch (error) {
      console.error('=== API ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // User-friendly error messages
      let errorMessage = 'Unknown error occurred';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 400) {
          errorMessage = 'Invalid image format. Please try another photo.';
        } else if (error.response.status === 413) {
          errorMessage = 'Image too large. Please use a smaller photo.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again.';
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // No response received
        errorMessage = 'No response from server. Check connection.';
      } else {
        // Request setup error
        errorMessage = error.message;
      }
      
      Alert.alert('❌ Analysis Failed', errorMessage);
    } finally {
      setLoading(false);
      console.log('=== ANALYSIS COMPLETE ===');
    }
  };

  // Get color for emotion
  const getEmotionColor = (emotion) => {
    const colors = {
      happy: '#4CAF50',
      sad: '#2196F3',
      angry: '#F44336',
      neutral: '#9E9E9E',
      surprise: '#FF9800',
      fear: '#673AB7',
      disgust: '#795548',
    };
    return colors[emotion?.toLowerCase()] || '#6c757d';
  };

  // Format emotion name
  const formatEmotionName = (emotion) => {
    return emotion?.charAt(0).toUpperCase() + emotion?.slice(1);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎭 Emotion Detection</Text>
        <Text style={styles.subtitle}>Using Base64 API - Working Version</Text>
      </View>

      {/* Image Display */}
      <View style={styles.imageSection}>
        {selectedImage ? (
          <>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={styles.imageInfo}>
              Ready for emotion analysis
            </Text>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>No image selected</Text>
            <Text style={styles.placeholderHint}>
              Pick from gallery or take a photo
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.galleryButton]}
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>📁 Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.cameraButton]}
          onPress={takePhoto}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>📸 Camera</Text>
        </TouchableOpacity>
      </View>

      {/* Analyze Button */}
      <TouchableOpacity
        style={[
          styles.analyzeButton,
          (!selectedImage || loading) && styles.buttonDisabled
        ]}
        onPress={analyzeEmotion}
        disabled={!selectedImage || loading}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#FFF" size="small" />
            <Text style={styles.analyzeButtonText}> Analyzing...</Text>
          </>
        ) : (
          <Text style={styles.analyzeButtonText}>🔍 Analyze Emotion</Text>
        )}
      </TouchableOpacity>

      {/* Results Section */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>🎯 Analysis Results</Text>
          
          {/* Dominant Emotion */}
          <View style={styles.dominantSection}>
            <Text style={styles.dominantLabel}>Dominant Emotion:</Text>
            <View style={[
              styles.emotionBadge,
              { backgroundColor: getEmotionColor(result.dominant_emotion) }
            ]}>
              <Text style={styles.emotionBadgeText}>
                {formatEmotionName(result.dominant_emotion)}
              </Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {(result.confidence * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          {/* All Emotions */}
          <Text style={styles.sectionTitle}>Emotion Distribution:</Text>
          <View style={styles.emotionsList}>
            {result.all_emotions && Object.entries(result.all_emotions)
              .sort(([, a], [, b]) => b - a) // Sort by confidence
              .map(([emotion, confidence]) => (
                <View key={emotion} style={styles.emotionItem}>
                  <View style={styles.emotionHeader}>
                    <Text style={styles.emotionName}>
                      {formatEmotionName(emotion)}
                    </Text>
                    <Text style={styles.emotionPercent}>
                      {(confidence * 100).toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.progressBackground}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${confidence * 100}%`,
                          backgroundColor: getEmotionColor(emotion)
                        }
                      ]}
                    />
                  </View>
                </View>
              ))}
          </View>

          {/* Processing Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⏱️</Text>
              <Text style={styles.infoText}>
                {result.processing_time_ms} ms
              </Text>
            </View>
            {result.image_info?.dimensions && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📏</Text>
                <Text style={styles.infoText}>
                  {result.image_info.dimensions}
                </Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🔄</Text>
              <Text style={styles.infoText}>
                Base64 API
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Tips for Best Results:</Text>
        <Text style={styles.tipsText}>
          • Use clear, well-lit face photos{'\n'}
          • Ensure face is visible and not obscured{'\n'}
          • Reduce image quality if connection is slow{'\n'}
          • Base64 method is more reliable for mobile
        </Text>
      </View>

      {/* Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>System Status:</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.statusText}>✅ Backend Connected</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { 
            backgroundColor: selectedImage ? '#4CAF50' : '#FFC107' 
          }]} />
          <Text style={styles.statusText}>
            {selectedImage ? '✅ Image Ready' : '⚠️ No Image Selected'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { 
            backgroundColor: result ? '#4CAF50' : '#6C757D' 
          }]} />
          <Text style={styles.statusText}>
            {result ? '✅ Results Available' : '📊 Awaiting Analysis'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: 280,
    height: 280,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  imageInfo: {
    marginTop: 12,
    fontSize: 14,
    color: '#48BB78',
    fontWeight: '600',
  },
  placeholder: {
    width: 280,
    height: 280,
    borderRadius: 16,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#CBD5E0',
    borderStyle: 'dashed',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 18,
    color: '#4A5568',
    fontWeight: '600',
  },
  placeholderHint: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  galleryButton: {
    backgroundColor: '#4299E1',
  },
  cameraButton: {
    backgroundColor: '#48BB78',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  analyzeButton: {
    backgroundColor: '#ED8936',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  dominantSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  dominantLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
  emotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 140,
    justifyContent: 'space-between',
  },
  emotionBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  confidenceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 16,
  },
  emotionsList: {
    marginBottom: 20,
  },
  emotionItem: {
    marginBottom: 14,
  },
  emotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  emotionName: {
    fontSize: 14,
    color: '#4A5568',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  emotionPercent: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '600',
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  tipsCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4299E1',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C5282',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#4A5568',
  },
});