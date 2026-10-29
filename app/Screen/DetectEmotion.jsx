import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system';
import Slider from "@react-native-community/slider";

const screenHeight = Dimensions.get("window").height;

const Button = ({ icon, onPress, color = "white", size = 30, style, disabled = false }) => (
  <TouchableOpacity onPress={onPress} style={style} disabled={disabled}>
    <Text style={{ color: disabled ? "gray" : color, fontSize: size }}>{icon}</Text>
  </TouchableOpacity>
);

export default function CameraApp() {
  // Permissions state - only camera permissions needed now
  const [cameraPermissions, requestCameraPermissions] = useCameraPermissions();

  // Camera settings state
  const [cameraSettings, setCameraSettings] = useState({
    zoom: 0,
    facing: "front",
    flash: "on",
    animateShutter: false,
    enableTorch: false,
  });

  // Image state
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);

  // Handle permissions
  if (!cameraPermissions) {
    return <View />;
  }

  if (!cameraPermissions.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need camera permission to take photos
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestCameraPermissions}
        >
          <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
        <Text style={styles.noteText}>
          Note: Photos will be stored in app storage only
        </Text>
      </View>
    );
  }

  // Toggle camera properties
  const toggleSetting = (setting, option1, option2) => {
    setCameraSettings((prev) => ({
      ...prev,
      [setting]: prev[setting] === option1 ? option2 : option1,
    }));
  };

  // Zoom controls
  const adjustZoom = (direction) => {
    setCameraSettings((prev) => ({
      ...prev,
      zoom: Math.min(Math.max(prev.zoom + direction * 0.1, 0), 1),
    }));
  };

  // Capture image
  const captureImage = async () => {
    if (cameraRef.current) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync();
        setImage(photo.uri);
        
        // Optional: Save to app's document directory
        const fileName = `photo_${Date.now()}.jpg`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.moveAsync({
          from: photo.uri,
          to: newPath,
        });
        
        // Use the new path
        setImage(newPath);
      } catch (error) {
        console.error("Error capturing image:", error);
        Alert.alert("Error", "Failed to capture image");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Render camera view
  if (!image) {
    return (
      <View style={styles.container}>
        {/* Top controls */}
        <View style={styles.topControls}>
          <Button
            icon={cameraSettings.flash === "on" ? "⚡️" : "⚡️❌"}
            onPress={() => toggleSetting("flash", "on", "off")}
          />
          <Button
            icon="📸"
            color={cameraSettings.animateShutter ? "white" : "gray"}
            onPress={() => toggleSetting("animateShutter", true, false)}
          />
          <Button
            icon={cameraSettings.enableTorch ? "🔦" : "🔦❌"}
            onPress={() => toggleSetting("enableTorch", true, false)}
          />
        </View>

        {/* Camera view */}
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          zoom={cameraSettings.zoom}
          facing={cameraSettings.facing}
          flash={cameraSettings.flash}
          animateShutter={cameraSettings.animateShutter}
          enableTorch={cameraSettings.enableTorch}
        />

        {/* Zoom controls */}
        <View style={styles.zoomControls}>
          <Button icon="🔍-" onPress={() => adjustZoom(-1)} size={25} />
          <Slider
            style={styles.zoomSlider}
            minimumValue={0}
            maximumValue={1}
            value={cameraSettings.zoom}
            onValueChange={(value) =>
              setCameraSettings((prev) => ({ ...prev, zoom: value }))
            }
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
          <Button icon="🔍+" onPress={() => adjustZoom(1)} size={25} />
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailText}>No previous photos</Text>
          </View>
          <Button 
            icon="📷" 
            size={60} 
            onPress={captureImage} 
            disabled={isProcessing}
          />
          <Button
            icon="🔄"
            size={40}
            onPress={() => toggleSetting("facing", "front", "back")}
          />
        </View>
        
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <Text style={styles.processingText}>Capturing...</Text>
          </View>
        )}
      </View>
    );
  }

  // Render captured image preview
  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.preview} />
      
      {/* Image info */}
      <View style={styles.imageInfo}>
        <Text style={styles.infoText}>Photo captured successfully!</Text>
        <Text style={styles.infoSubtext}>
          Photo saved to app storage{'\n'}
          (Media library access not available in Expo Go)
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <Button
          icon="↩️"
          size={40}
          onPress={() => {
            setImage(null);
          }}
        />
        <Button
          icon="💾"
          size={40}
          onPress={() => Alert.alert(
            "Info", 
            "In Expo Go, photos are stored in app storage only. To save to gallery, create a development build."
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "skyblue",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
  },
  noteText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    fontStyle: "italic",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    margin: 20,
    overflow: "hidden",
  },
  zoomControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  zoomSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  thumbnailPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailText: {
    color: "white",
    fontSize: 8,
    textAlign: "center",
  },
  preview: {
    flex: 1,
    resizeMode: "contain",
    backgroundColor: "black",
  },
  imageInfo: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  infoText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  infoSubtext: {
    color: "lightgray",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  processingText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});