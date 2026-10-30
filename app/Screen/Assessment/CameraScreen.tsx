import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../assets/colors';

const { width, height } = Dimensions.get("window");

export default function ModernCamera({ navigation, route }) {
  // Get assessment data from previous screens
  const { mood, sleep_quality } = route.params;

  // Permissions state
  const [cameraPermissions, requestCameraPermissions] = useCameraPermissions();

  // Camera state
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('back');
  const shutterAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef(null);

  // Handle permissions
  if (!cameraPermissions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  if (!cameraPermissions.granted) {
    return (
      <LinearGradient
        colors={[Colors.background.main, Colors.background.subtle]}
        style={styles.permissionContainer}
      >
        <View style={styles.permissionContent}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera" size={80} color={Colors.brand.primary} />
          </View>
          
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            Allow camera access to capture image for expression analysis
          </Text>
          
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestCameraPermissions}
          >
            <LinearGradient
              colors={Colors.gradients.calm}
              style={styles.permissionGradient}
            >
              <Text style={styles.permissionButtonText}>Allow Camera</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Toggle camera facing
  const toggleCameraFacing = () => {
    setCameraFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Capture image and navigate to ExpressionAnalysis
  // In your Camera component - modify the captureImage function
const captureImage = async () => {
  if (cameraRef.current && !isProcessing) {
    try {
      setIsProcessing(true);
      
      // Shutter animation
      Animated.sequence([
        Animated.timing(shutterAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shutterAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Capture photo WITH base64
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6, // Reduce quality for smaller file size
        base64: true, // This is crucial!
        exif: false,
      });

      console.log('Base64 image captured, length:', photo.base64?.length);

      // Navigate with base64 data
      navigation.navigate('ExpressionAnalysis', { 
        mood,
        sleep_quality,
        captured_image: photo.base64, // Send base64 string
        image_format: 'base64', // Mark as base64
      });
      
    } catch (error) {
      console.error("Error capturing image:", error);
      Alert.alert("Error", "Failed to capture image. Please try again.");
      setIsProcessing(false);
    }
  }
};



  return (
    <View style={styles.container}>
      {/* Animated Shutter Effect */}
      <Animated.View 
        style={[
          styles.shutterOverlay,
          {
            opacity: shutterAnim,
          }
        ]} 
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Capture Image</Text>
        <Text style={styles.headerSubtitle}>For expression analysis</Text>
      </View>

      {/* Camera Preview */}
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing={cameraFacing}
      />

      {/* Bottom Controls */}
      <View style={styles.footer}>
        {/* Camera Rotate Button - Only one on left */}
        <TouchableOpacity
          style={styles.rotateButton}
          onPress={toggleCameraFacing}
          disabled={isProcessing}
        >
          <Ionicons 
            name="camera-reverse" 
            size={28} 
            color={isProcessing ? Colors.text.tertiary : Colors.text.inverted} 
          />
        </TouchableOpacity>

        {/* Main Capture Button */}
        <TouchableOpacity
          style={[
            styles.captureButton,
            isProcessing && styles.captureButtonDisabled
          ]}
          onPress={captureImage}
          disabled={isProcessing}
        >
          <LinearGradient
            colors={Colors.gradients.calm}
            style={styles.captureButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={Colors.text.inverted} />
            ) : (
              <Ionicons name="camera" size={32} color={Colors.text.inverted} />
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Empty space to balance layout */}
        <View style={styles.placeholderButton} />
      </View>

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.main,
  },
  permissionContainer: {
    flex: 1,
  },
  permissionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  permissionIcon: {
    marginBottom: 30,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 15,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  permissionGradient: {
    padding: 18,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: Colors.text.inverted,
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text.inverted,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  camera: {
    flex: 1,
  },
  shutterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  rotateButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 50,
    height: 50,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 20,
  },
  processingText: {
    color: Colors.text.inverted,
    fontSize: 18,
    marginTop: 15,
    fontWeight: "600",
  },
});