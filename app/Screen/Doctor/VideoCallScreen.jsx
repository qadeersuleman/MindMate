import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  Vibration
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const VideoCallScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { appointmentId, doctorName = 'Dr. Sarah Wilson' } = route.params;
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // State
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Pulse animation for connecting state
  useEffect(() => {
    if (callStatus === 'connecting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [callStatus]);

  // Simulate call connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallStatus('connected');
      pulseAnim.stopAnimation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const startButtonAnimation = () => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleMute = () => {
    startButtonAnimation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    startButtonAnimation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVideoOn(!isVideoOn);
  };

  const toggleSpeaker = () => {
    startButtonAnimation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSpeakerOn(!isSpeakerOn);
  };

  const endCall = () => {
    startButtonAnimation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCallStatus('ended');
    
    // Show call ended screen for 2 seconds then navigate back
    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderConnectingState = () => (
    <View style={styles.centeredContainer}>
      <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {doctorName.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
      </Animated.View>
      
      <Text style={styles.connectingText}>Connecting to {doctorName}</Text>
      <Text style={styles.connectingSubtext}>Please wait...</Text>
      
      <LottieView
        source={require('../../assets/json/Video Call.json')}
        autoPlay
        loop
        style={styles.connectingAnimation}
      />
    </View>
  );

  const renderConnectedState = () => (
    <>
      {/* Remote Video Stream */}
      <View style={styles.remoteVideo}>
        {isVideoOn ? (
          <View style={styles.videoContainer}>
            {/* Simulated video stream */}
            <Video
              source={require('../../assets/images/doctor.mp4')}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
            />
            <View style={styles.videoOverlay} />
          </View>
        ) : (
          <View style={styles.videoOffContainer}>
            <View style={styles.videoOffAvatar}>
              <Text style={styles.videoOffAvatarText}>
                {doctorName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <Text style={styles.videoOffText}>{doctorName}</Text>
            <Text style={styles.videoOffSubtext}>Video is turned off</Text>
          </View>
        )}
      </View>

      {/* Local Video Preview */}
      <Animated.View 
        style={[
          styles.localVideo,
          { transform: [{ scale: isVideoOn ? 1 : 0 }] }
        ]}
      >
        {isVideoOn && (
          <View style={styles.localVideoContainer}>
            <View style={styles.localVideoPlaceholder}>
              <Text style={styles.localVideoText}>You</Text>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Call Info */}
      <View style={styles.callInfo}>
        <Text style={styles.doctorName}>{doctorName}</Text>
        <Text style={styles.callDuration}>{formatTime(callDuration)}</Text>
        <Text style={styles.callStatus}>Connected</Text>
      </View>
    </>
  );

  const renderEndedState = () => (
    <View style={styles.centeredContainer}>
      <LottieView
        source={require('../../assets/json/order fail.json')}
        autoPlay
        loop={false}
        style={styles.endedAnimation}
      />
      <Text style={styles.endedText}>Call Ended</Text>
      <Text style={styles.endedSubtext}>
        Duration: {formatTime(callDuration)}
      </Text>
    </View>
  );

  const renderCallControls = () => (
    <Animated.View 
      style={[
        styles.controlsContainer,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.controlsRow}>
        {/* Mute Button */}
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity 
            style={[
              styles.controlButton,
              isMuted && styles.controlButtonActive
            ]}
            onPress={toggleMute}
          >
            <View style={styles.controlIcon}>
              {isMuted ? (
                <Text style={styles.controlIconText}>🎤</Text>
              ) : (
                <Text style={styles.controlIconText}>🎤</Text>
              )}
            </View>
            <Text style={styles.controlText}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Video Button */}
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity 
            style={[
              styles.controlButton,
              !isVideoOn && styles.controlButtonActive
            ]}
            onPress={toggleVideo}
          >
            <View style={styles.controlIcon}>
              {isVideoOn ? (
                <Text style={styles.controlIconText}>📹</Text>
              ) : (
                <Text style={styles.controlIconText}>📹</Text>
              )}
            </View>
            <Text style={styles.controlText}>
              {isVideoOn ? 'Video Off' : 'Video On'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Speaker Button */}
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity 
            style={[
              styles.controlButton,
              isSpeakerOn && styles.controlButtonActive
            ]}
            onPress={toggleSpeaker}
          >
            <View style={styles.controlIcon}>
              <Text style={styles.controlIconText}>🔊</Text>
            </View>
            <Text style={styles.controlText}>
              {isSpeakerOn ? 'Speaker' : 'Phone'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* End Call Button */}
      <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
        <TouchableOpacity 
          style={styles.endCallButton}
          onPress={endCall}
        >
          <View style={styles.endCallIcon}>
            <Text style={styles.endCallIconText}>📞</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {callStatus === 'connecting' && renderConnectingState()}
      {callStatus === 'connected' && renderConnectedState()}
      {callStatus === 'ended' && renderEndedState()}
      
      {callStatus === 'connected' && renderCallControls()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  connectingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  connectingSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 30,
  },
  connectingAnimation: {
    width: 200,
    height: 200,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  videoOffContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  videoOffAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  videoOffAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  videoOffText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  videoOffSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  localVideoContainer: {
    flex: 1,
  },
  localVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  localVideoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  callInfo: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 12,
  },
  doctorName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  callDuration: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 3,
  },
  callStatus: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  controlButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  controlIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlIconText: {
    fontSize: 20,
  },
  controlText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  endCallButton: {
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  endCallIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  endCallIconText: {
    fontSize: 24,
  },
  endedAnimation: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  endedText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  endedSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
});

export default VideoCallScreen;