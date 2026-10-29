import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import Headers from "../../components/Assesment/Header";
import Title from "../../components/Assesment/Title";
import Colors from "../../assets/colors";

import { getSession, saveSession } from "../../utils/session";
import { submitAudioAnalysis } from "../../Services/api"; // Import API functions
import { API_BASE_URL } from "../../config/server";

const SoundAnalysis = ({ route, navigation }) => {
  // State management
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showRecordingsModal, setShowRecordingsModal] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Refs
  const lottieRef = useRef(null);

  // Directory for storing recordings in the app's document directory
  const recordingsDir = `${FileSystem.documentDirectory}recordings/`;

  // Backend API URL
  const API_URL = `${API_BASE_URL}audio-analysis/`;

  // Get assessment data from previous screens
  const { health_goal, age, weight, mood, sleep_quality } = route?.params || {};

  // Initialize audio permissions and create recordings directory
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setPermissionGranted(status === "granted");

        // Set up audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        // Create recordings directory if it doesn't exist
        const dirInfo = await FileSystem.getInfoAsync(recordingsDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(recordingsDir, {
            intermediates: true,
          });
        }

        // Load existing recordings
        await loadRecordings();
      } catch (error) {
        console.error("Initialization error:", error);
        Alert.alert("Error", "Failed to initialize audio system");
      }
    })();
  }, []);

  // Load existing recordings from storage
  const loadRecordings = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(recordingsDir);
      const audioFiles = files.filter((file) => file.endsWith(".m4a"));

      const recordingsList = await Promise.all(
        audioFiles.map(async (file) => {
          const fileInfo = await FileSystem.getInfoAsync(
            `${recordingsDir}${file}`,
          );
          return {
            id: file,
            uri: `${recordingsDir}${file}`,
            name: file,
            size: fileInfo.size,
            timestamp: new Date(fileInfo.modificationTime).toLocaleString(),
          };
        }),
      );

      setRecordings(recordingsList);
    } catch (error) {
      console.error("Error loading recordings:", error);
    }
  };

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [recording, sound]);

  const startRecording = async () => {
    try {
      if (!permissionGranted) {
        Alert.alert(
          "Permission required",
          "Please grant microphone access in settings",
        );
        return;
      }

      setIsRecording(true);
      if (lottieRef.current) {
        lottieRef.current.play();
      }

      // Create a new recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(newRecording);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert(
        "Recording Error",
        "Failed to start recording. Please try again.",
      );
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      if (lottieRef.current) {
        lottieRef.current.pause();
      }

      // Stop the recording
      await recording.stopAndUnloadAsync();

      // Get the URI of the recorded audio
      const uri = recording.getURI();

      // Generate a unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `recording-${timestamp}.m4a`;
      const newPath = `${recordingsDir}${filename}`;

      // Move the file to our recordings directory
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(newPath);

      if (fileInfo.exists) {
        // Add to recordings list
        const newRecording = {
          id: filename,
          uri: newPath,
          name: filename,
          size: fileInfo.size,
          timestamp: new Date().toLocaleString(),
        };

        setRecordings([...recordings, newRecording]);

        // Send to backend
        await sendToBackend(newPath);
      } else {
        Alert.alert("Error", "Recording file was not created successfully.");
        setIsProcessing(false);
      }

      setRecording(null);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Processing Error", "Failed to process recording.");
      setIsProcessing(false);
    }
  };

  const sendToBackend = async (recordingUri) => {
    try {
      setUploadProgress(0);

      // Get user data from AsyncStorage using the imported function
      const userData = await getSession();
      console.log("User data from session:", userData);

      if (!userData || !userData.id) {
        Alert.alert("Error", "User not logged in. Please login again.");
        navigation.navigate("Login");
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append("audio", {
        uri: recordingUri,
        type: "audio/m4a",
        name: recordingUri.split("/").pop(),
      });

      // Add user data from session
      formData.append("user_id", userData.id.toString());
      if (userData.username) formData.append("username", userData.username);
      if (userData.email) formData.append("email", userData.email);
      formData.append("timestamp", new Date().toISOString());

      console.log("Sending audio analysis data to backend");

      // Use the new submitAudioAnalysis function
      const result = await submitAudioAnalysis(formData);

      console.log("Server response:", result);

      // If successful, navigate to home screen
      if (result.success) {
        // Update session to mark assessment as completed
        const updatedUserData = {
          ...userData,
          hasCompletedAssessment: true,
        };

        // Save updated session with assessment completion flag
        await saveSession(updatedUserData);
        console.log("Updated session with hasCompletedAssessment: true");

        // Alert.alert('Success', 'Audio analysis completed successfully!');
        navigation.navigate("ResultsScreen", {
          scores: result.scores,
          analysis_id: result.analysis_id,
          message: result.message,
          success: result.success,
        });
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Failed to send recording:", error);
      Alert.alert(
        "Upload Error",
        error.message ||
          "Failed to send recording to server. Please try again.",
      );
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const playRecording = async (recordingUri, recordingId) => {
    try {
      // Stop any currently playing audio
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      setCurrentPlayingId(recordingId);
      setIsPlaying(true);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true },
      );

      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }
      });
    } catch (error) {
      console.error("Failed to play recording:", error);
      Alert.alert("Playback Error", "Failed to play recording.");
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  const deleteRecording = async (recordingId, recordingUri) => {
    try {
      // Delete the file
      await FileSystem.deleteAsync(recordingUri);

      // Update the recordings list
      const newRecordings = recordings.filter((rec) => rec.id !== recordingId);
      setRecordings(newRecordings);

      // If we're deleting the currently playing recording, stop playback
      if (currentPlayingId === recordingId) {
        await stopPlayback();
      }
    } catch (error) {
      console.error("Failed to delete recording:", error);
      Alert.alert("Error", "Failed to delete recording.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const discardRecording = () => {
    if (recording) {
      recording.stopAndUnloadAsync();
    }
    setShowVoiceModal(false);
  };

  return (
    <View style={styles.container}>
      <Headers onBack={() => navigation.goBack()} currentStep="5" />

      <View style={styles.titleContainer}>
        <Title>Voice Pattern Analysis</Title>
        <Text style={styles.subtitle}>
          Share your thoughts through voice recording
        </Text>
        <Text style={styles.centeredText}>
          Dr Freud.ai will analyze your voice patterns and emotions
        </Text>
      </View>

      <View style={styles.animationContainer}>
        <LottieView
          source={require("../../assets/json/wave.json")}
          autoPlay
          loop
          style={styles.mainAnimation}
        />
        <Text style={styles.animationCaption}>
          {isRecording
            ? "Listening carefully..."
            : "Ready to analyze your voice"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.recordButton}
        activeOpacity={0.8}
        onPress={() => setShowVoiceModal(true)}
      >
        <Ionicons name="mic" size={24} color={Colors.text.primary} />
        <Text style={styles.recordButtonText}>Start Voice Analysis</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={styles.viewRecordingsButton}
        activeOpacity={0.8}
        onPress={() => setShowRecordingsModal(true)}
      >
        <Ionicons name="list" size={24} color={Colors.brand.primary} />
        <Text style={styles.viewRecordingsButtonText}>
          View Saved Recordings ({recordings.length})
        </Text>
      </TouchableOpacity> */}

      {/* Voice Recording Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showVoiceModal}
        onRequestClose={() => {
          if (isRecording) {
            Alert.alert(
              "Recording in progress",
              "Are you sure you want to cancel?",
              [
                { text: "Continue Recording", style: "cancel" },
                {
                  text: "Discard",
                  onPress: discardRecording,
                },
              ],
            );
          } else {
            discardRecording();
          }
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Voice Analysis</Text>

            {!isRecording && !isProcessing && !uploadProgress ? (
              <>
                <LottieView
                  source={require("../../assets/json/loading animation.json")}
                  autoPlay
                  loop
                  style={styles.lottieMic}
                />
                <Text style={styles.modalText}>
                  {permissionGranted
                    ? "Press start to begin voice analysis"
                    : "Microphone access required"}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    !permissionGranted && styles.disabledButton,
                  ]}
                  onPress={startRecording}
                  disabled={!permissionGranted}
                >
                  <Ionicons name="mic" size={24} color="white" />
                  <Text style={styles.modalActionButtonText}>
                    {permissionGranted ? "Start Analysis" : "Permission Needed"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : isRecording ? (
              <>
                <LottieView
                  ref={lottieRef}
                  source={require("../../assets/json/sound waves.json")}
                  autoPlay
                  loop
                  style={styles.lottieSoundWave}
                />
                <Text style={styles.recordingText}>
                  Analyzing Voice Patterns...
                </Text>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.stopButton]}
                  onPress={stopRecording}
                >
                  <Ionicons name="square" size={24} color="white" />
                  <Text style={styles.modalActionButtonText}>
                    Complete Analysis
                  </Text>
                </TouchableOpacity>
              </>
            ) : isProcessing ? (
              <>
                <LottieView
                  source={require("../../assets/json/Enable mic.json")}
                  autoPlay
                  loop
                  style={styles.lottieProcessing}
                />
                <Text style={styles.modalText}>
                  {uploadProgress > 0
                    ? `Uploading to server... ${Math.round(
                        uploadProgress * 100,
                      )}%`
                    : "Processing your voice patterns..."}
                </Text>
                <ActivityIndicator size="large" color={Colors.brand.primary} />
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Recordings List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRecordingsModal}
        onRequestClose={() => setShowRecordingsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.recordingsModal]}>
            <Text style={styles.modalTitle}>Saved Recordings</Text>

            {recordings.length === 0 ? (
              <View style={styles.noRecordingsContainer}>
                <Ionicons
                  name="mic-off"
                  size={64}
                  color={Colors.text.tertiary}
                />
                <Text style={styles.noRecordingsText}>No recordings yet</Text>
              </View>
            ) : (
              <ScrollView style={styles.recordingsList}>
                {recordings.map((recording, index) => (
                  <View key={recording.id} style={styles.recordingItem}>
                    <View style={styles.recordingInfo}>
                      <Text style={styles.recordingName} numberOfLines={1}>
                        {recording.name}
                      </Text>
                      <Text style={styles.recordingDetails}>
                        {recording.timestamp} • {formatFileSize(recording.size)}
                      </Text>
                    </View>
                    <View style={styles.recordingActions}>
                      {currentPlayingId === recording.id && isPlaying ? (
                        <TouchableOpacity onPress={stopPlayback}>
                          <Ionicons
                            name="stop"
                            size={24}
                            color={Colors.accent.coral}
                          />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() =>
                            playRecording(recording.uri, recording.id)
                          }
                        >
                          <Ionicons
                            name="play"
                            size={24}
                            color={Colors.brand.primary}
                          />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => sendToBackend(recording.uri)}
                      >
                        <Ionicons
                          name="cloud-upload"
                          size={24}
                          color={Colors.brand.secondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          deleteRecording(recording.id, recording.uri)
                        }
                      >
                        <Ionicons
                          name="trash"
                          size={24}
                          color={Colors.accent.coral}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRecordingsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  titleContainer: {
    marginTop: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 4,
  },
  centeredText: {
    textAlign: "center",
    color: Colors.text.secondary,
    fontSize: 14,
  },
  animationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 30,
  },
  mainAnimation: {
    width: 300,
    height: 200,
  },
  animationCaption: {
    marginTop: 20,
    color: Colors.text.secondary,
    fontSize: 16,
    textAlign: "center",
  },
  recordButton: {
    flexDirection: "row",
    backgroundColor: Colors.brand.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: Colors.ui.shadow,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  recordButtonText: {
    color: "white",
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  viewRecordingsButton: {
    flexDirection: "row",
    backgroundColor: Colors.neutrals.surface,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  viewRecordingsButtonText: {
    color: Colors.brand.primary,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "80%",
  },
  recordingsModal: {
    width: "95%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.text.primary,
  },
  modalText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginVertical: 15,
    lineHeight: 24,
  },
  lottieMic: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  lottieSoundWave: {
    width: 280,
    height: 160,
    marginBottom: 20,
  },
  lottieProcessing: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  modalActionButton: {
    flexDirection: "row",
    backgroundColor: Colors.brand.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: Colors.text.tertiary,
  },
  modalActionButtonText: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  stopButton: {
    backgroundColor: Colors.accent.coral,
  },
  recordingText: {
    fontSize: 18,
    color: Colors.text.primary,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  transcriptTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  transcriptBox: {
    width: "100%",
    minHeight: 120,
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.secondary,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.neutrals.surface,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  applyButton: {
    backgroundColor: Colors.brand.primary,
    marginLeft: 15,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  noRecordingsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  noRecordingsText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.tertiary,
  },
  recordingsList: {
    width: "100%",
    marginBottom: 20,
  },
  recordingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 12,
    marginBottom: 10,
  },
  recordingInfo: {
    flex: 1,
    marginRight: 10,
  },
  recordingName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  recordingDetails: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  recordingActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: Colors.neutrals.surface,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
});

export default SoundAnalysis;
