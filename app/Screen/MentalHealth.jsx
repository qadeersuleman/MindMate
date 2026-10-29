// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import * as FaceDetector from 'expo-face-detector';
// import * as MediaLibrary from 'expo-media-library';
// import { LinearGradient } from 'expo-linear-gradient';

// const MentalHealthAnalyzer = () => {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
//   const [faces, setFaces] = useState([]);
//   const [image, setImage] = useState(null);
//   const [analysis, setAnalysis] = useState(null);
//   const [sessionData, setSessionData] = useState([]);
//   const cameraRef = useRef(null);

//   // Emotion to mental health mapping
//   const emotionHealthMap = {
//     happy: { score: 1, description: "Positive mood detected" },
//     sad: { score: -1, description: "Signs of sadness" },
//     angry: { score: -0.8, description: "Signs of frustration" },
//     fearful: { score: -0.7, description: "Signs of anxiety" },
//     surprised: { score: 0.3, description: "Engaged expression" },
//     neutral: { score: 0, description: "Neutral state" },
//     disgusted: { score: -0.5, description: "Negative reaction" }
//   };

//   if (!permission?.granted || !mediaPermission?.granted) {
//     return (
//       <View style={styles.permissionContainer}>
//         <Text style={styles.permissionText}>We need camera permissions to analyze your emotions</Text>
//         <TouchableOpacity style={styles.button} onPress={() => {
//           requestPermission();
//           requestMediaPermission();
//         }}>
//           <Text style={styles.buttonText}>Grant Permission</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const captureAndAnalyze = async () => {
//     if (cameraRef.current) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync();
//         setImage(photo.uri);
//         analyzeEmotions(photo.uri);
//       } catch (error) {
//         Alert.alert("Error", "Failed to capture image");
//       }
//     }
//   };

//   const analyzeEmotions = async (imageUri) => {
//     try {
//       const result = await FaceDetector.detectFacesAsync(imageUri, {
//         mode: FaceDetector.FaceDetectorMode.fast,
//         detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
//         runClassifications: FaceDetector.FaceDetectorClassifications.all,
//       });

//       if (result.faces.length > 0) {
//         const analyzedFaces = result.faces.map(face => {
//           const emotion = determineDominantEmotion(face);
//           return {
//             emotion,
//             healthData: emotionHealthMap[emotion],
//             confidence: calculateConfidence(face, emotion),
//             timestamp: new Date().toISOString()
//           };
//         });

//         setFaces(analyzedFaces);
//         updateSessionData(analyzedFaces);
//         generateMentalHealthAnalysis(analyzedFaces);
//       } else {
//         setFaces([]);
//         Alert.alert("No Face Detected", "Please position your face in the frame");
//       }
//     } catch (error) {
//       console.error("Analysis error:", error);
//     }
//   };

//   const determineDominantEmotion = (face) => {
//     // Advanced emotion detection algorithm
//     const emotionScores = {
//       happy: face.smilingProbability * 0.8,
//       sad: (1 - face.smilingProbability) * 
//            (face.leftEyeOpenProbability + face.rightEyeOpenProbability) * 0.6,
//       angry: ((1 - face.leftEyebrowHeight) + (1 - face.rightEyebrowHeight)) * 0.7,
//       fearful: ((1 - face.leftEyeOpenProbability) + 
//                (1 - face.rightEyeOpenProbability)) * 0.5,
//       surprised: (face.leftEyeOpenProbability + 
//                 face.rightEyeOpenProbability) * 0.9,
//       disgusted: ((1 - face.smilingProbability) * 0.5),
//       neutral: 0.3
//     };

//     return Object.entries(emotionScores).reduce(
//       (max, [emotion, score]) => score > max.score ? {emotion, score} : max,
//       {emotion: 'neutral', score: 0}
//     ).emotion;
//   };

//   const calculateConfidence = (face, emotion) => {
//     // Calculate confidence based on facial features
//     const baseConfidence = {
//       happy: face.smilingProbability,
//       sad: 1 - face.smilingProbability,
//       angry: 1 - ((face.leftEyebrowHeight + face.rightEyebrowHeight) / 2),
//       fearful: (1 - face.leftEyeOpenProbability) * (1 - face.rightEyeOpenProbability),
//       surprised: (face.leftEyeOpenProbability + face.rightEyeOpenProbability) / 2,
//       disgusted: (1 - face.smilingProbability) * 0.7,
//       neutral: 0.5
//     };

//     return Math.round(baseConfidence[emotion] * 100);
//   };

//   const updateSessionData = (newFaces) => {
//     setSessionData(prev => [...prev, ...newFaces]);
//   };

//   const generateMentalHealthAnalysis = (facesData) => {
//     if (facesData.length === 0) return;

//     // Calculate average mood score
//     const avgScore = facesData.reduce(
//       (sum, face) => sum + face.healthData.score, 0
//     ) / facesData.length;

//     // Determine dominant emotion
//     const emotionCount = facesData.reduce((count, face) => {
//       count[face.emotion] = (count[face.emotion] || 0) + 1;
//       return count;
//     }, {});

//     const dominantEmotion = Object.entries(emotionCount).reduce(
//       (max, [emotion, count]) => count > max.count ? {emotion, count} : max,
//       {emotion: 'neutral', count: 0}
//     ).emotion;

//     // Generate recommendations
//     const recommendations = generateRecommendations(avgScore, dominantEmotion);

//     setAnalysis({
//       moodScore: Math.round((avgScore + 1) * 50), // Convert to 0-100 scale
//       dominantEmotion,
//       description: emotionHealthMap[dominantEmotion].description,
//       recommendations,
//       timestamp: new Date().toISOString()
//     });
//   };

//   const generateRecommendations = (score, dominantEmotion) => {
//     const recommendations = [];
    
//     if (score < -0.5) {
//       recommendations.push(
//         "Consider talking to a mental health professional",
//         "Try relaxation techniques like deep breathing",
//         "Engage in activities you normally enjoy"
//       );
//     } else if (score < 0) {
//       recommendations.push(
//         "Practice mindfulness meditation",
//         "Connect with friends or family",
//         "Get some physical exercise"
//       );
//     } else if (score < 0.5) {
//       recommendations.push(
//         "Maintain your current positive habits",
//         "Consider journaling your thoughts",
//         "Get adequate sleep"
//       );
//     } else {
//       recommendations.push(
//         "Your mood appears positive - maintain these habits!",
//         "Consider helping others to boost your mood further"
//       );
//     }

//     // Emotion-specific recommendations
//     if (dominantEmotion === 'sad') {
//       recommendations.push("Try listening to uplifting music");
//     } else if (dominantEmotion === 'angry') {
//       recommendations.push("Practice counting to 10 before reacting");
//     } else if (dominantEmotion === 'fearful') {
//       recommendations.push("Try grounding techniques: name 5 things you can see");
//     }

//     return recommendations;
//   };

//   const saveSessionData = async () => {
//     try {
//       const asset = await MediaLibrary.createAssetAsync(image);
//       const analysisData = {
//         image: asset.uri,
//         analysis,
//         faces,
//         timestamp: new Date().toISOString()
//       };
      
//       // Here you would typically send to your backend
//       console.log("Session data:", analysisData);
//       Alert.alert("Analysis Saved", "Your mental health analysis has been recorded");
      
//       // Reset for next session
//       setImage(null);
//       setFaces([]);
//       setAnalysis(null);
//     } catch (error) {
//       Alert.alert("Error", "Failed to save analysis");
//     }
//   };

//   return (
//     <LinearGradient colors={['#e6f7ff', '#ffffff']} style={styles.container}>
//       {!image ? (
//         <>
//           <CameraView 
//             style={styles.camera}
//             ref={cameraRef}
//             facing="front"
//           />
          
//           <View style={styles.controls}>
//             <TouchableOpacity style={styles.captureButton} onPress={captureAndAnalyze}>
//               <View style={styles.captureButtonInner} />
//             </TouchableOpacity>
//           </View>
          
//           <Text style={styles.instruction}>
//             Center your face and press the button to analyze your mood
//           </Text>
//         </>
//       ) : (
//         <>
//           <Image source={{ uri: image }} style={styles.preview} />
          
//           {analysis && (
//             <View style={styles.analysisContainer}>
//               <Text style={styles.analysisHeader}>Your Mood Analysis</Text>
              
//               <View style={styles.scoreContainer}>
//                 <Text style={styles.scoreText}>{analysis.moodScore}</Text>
//                 <Text style={styles.scoreLabel}>Mood Score</Text>
//                 <View style={[
//                   styles.scoreBar, 
//                   { width: `${analysis.moodScore}%` }
//                 ]}/>
//               </View>
              
//               <Text style={styles.emotionText}>
//                 Dominant Emotion: {faces[0]?.emotion} ({faces[0]?.confidence}% confidence)
//               </Text>
              
//               <Text style={styles.descriptionText}>
//                 {analysis.description}
//               </Text>
              
//               <View style={styles.recommendationsContainer}>
//                 <Text style={styles.recommendationsHeader}>Suggestions:</Text>
//                 {analysis.recommendations.map((item, index) => (
//                   <Text key={index} style={styles.recommendationItem}>
//                     • {item}
//                   </Text>
//                 ))}
//               </View>
//             </View>
//           )}
          
//           <View style={styles.actionButtons}>
//             <TouchableOpacity 
//               style={[styles.actionButton, { backgroundColor: '#ff4444' }]}
//               onPress={() => setImage(null)}
//             >
//               <Text style={styles.actionButtonText}>Retake</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={[styles.actionButton, { backgroundColor: '#00C851' }]}
//               onPress={saveSessionData}
//             >
//               <Text style={styles.actionButtonText}>Save Analysis</Text>
//             </TouchableOpacity>
//           </View>
//         </>
//       )}
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   permissionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   permissionText: {
//     fontSize: 18,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: '#2196F3',
//     padding: 15,
//     borderRadius: 10,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//   },
//   camera: {
//     flex: 1,
//     top:10,
//     borderRadius: 20,
//     overflow: 'hidden',
//     marginBottom: 20,
//   },
//   controls: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: 'white',
//     borderWidth: 5,
//     borderColor: '#f0f0f0',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   captureButtonInner: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#2196F3',
//   },
//   instruction: {
//     textAlign: 'center',
//     color: '#666',
//     fontSize: 16,
//     marginBottom: 20,
//   },
//   preview: {
//     flex: 1,
//     top : 10,
//     borderRadius: 20,
//     marginBottom: 10,
//   },
//   analysisContainer: {
//     top : 10,
//     backgroundColor: 'white',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   analysisHeader: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: '#333',
//     textAlign: 'center',
//   },
//   scoreContainer: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   scoreText: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#2196F3',
//   },
//   scoreLabel: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 5,
//   },
//   scoreBar: {
//     height: 10,
//     backgroundColor: '#2196F3',
//     borderRadius: 5,
//   },
//   emotionText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#444',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   descriptionText: {
//     fontSize: 16,
//     color: '#555',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   recommendationsContainer: {
//     // marginTop: 10,
//   },
//   recommendationsHeader: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//   },
//   recommendationItem: {
//     fontSize: 15,
//     color: '#555',
//     marginBottom: 8,
//     lineHeight: 22,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   actionButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 10,
//     marginHorizontal: 5,
//     alignItems: 'center',
//   },
//   actionButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default MentalHealthAnalyzer;



