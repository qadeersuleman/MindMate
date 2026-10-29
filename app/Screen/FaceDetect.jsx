
import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
const FaceDetect = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  if (!permission?.granted) {
    return <View />;
  }
  const handleFacesDetected = ({ faces }) => {
    console.log("Detected faces:", faces);
  };
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        facing="front"
        style={StyleSheet.absoluteFillObject}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
      <>
       
      </>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default FaceDetect;
