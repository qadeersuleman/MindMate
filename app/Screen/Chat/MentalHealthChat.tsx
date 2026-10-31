import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ChatService } from '../../Services/api';
import Colors from '../../assets/colors';

const { width } = Dimensions.get('window');

// Animated MessageBubble component with modern styling
const MessageBubble = ({ message, isUser, index, isStreaming = false, time }: any) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    const delay = Math.min(index * 40, 200);
    opacity.value = withDelay(delay, withTiming(1, { duration: 250 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 120 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 16, stiffness: 120 }));
  }, []);

  const animatedStyle = useAnimatedStyle<any>(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
    };
  });

  return (
    <Animated.View style={[
      styles.messageContainer,
      isUser ? styles.userMessageContainer : styles.botMessageContainer,
      animatedStyle
    ]}>
      <LinearGradient
        colors={isUser ? (Colors.gradients.primary as any) : ['#FFFFFF', '#FFFFFF']}
        style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.botMessageBubble]}
      >
        <Text style={isUser ? styles.userMessageText : styles.botMessageText}>
          {message}
          {isStreaming && <Text style={styles.streamingCursor}> ▊</Text>}
        </Text>
        <Text style={isUser ? styles.userMessageTime : styles.botMessageTime}>
          {time || 'Just now'}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Animated TypingIndicator component
const TypingIndicator = () => {
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    const animateDots = () => {
      dot1Opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 })
      );
      dot2Opacity.value = withDelay(150, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 })
      ));
      dot3Opacity.value = withDelay(300, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 })
      ));
    };

    animateDots();
    const interval = setInterval(animateDots, 1000);
    return () => clearInterval(interval);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1Opacity.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2Opacity.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3Opacity.value }));

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <View style={styles.typingContent}>
          <Text style={styles.typingText}>Mindmate is typing</Text>
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.typingDot, dot1Style]} />
            <Animated.View style={[styles.typingDot, dot2Style]} />
            <Animated.View style={[styles.typingDot, dot3Style]} />
          </View>
        </View>
      </View>
    </View>
  );
};

// Main chat component
const MentalHealthChat = ({ route, navigation }: any) => {
  const doctorName = route?.params?.doctorName;
  const appointmentId = route?.params?.appointmentId;
  const chatTitle = doctorName || 'Mindmate AI';

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  
  const flatListRef = useRef<any>(null);
  const textInputRef = useRef<any>(null);
  const sendButtonScale = useSharedValue(1);

  const formatCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Initialize chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const isHealthy = await ChatService.healthCheck();
        setIsConnected(isHealthy);
        
        if (!hasInitialized && messages.length === 0) {
          setHasInitialized(true);
          
          setTimeout(() => {
            const welcomeText = doctorName 
              ? `Hello! This is Dr. ${doctorName}. How can I assist you with your mental health journey today?`
              : "Welcome to Mindmate! 🌟 I'm your AI mental health companion. How can I support you today?";

            const welcomeMessage = {
              id: Date.now().toString(),
              text: welcomeText,
              isUser: false,
              time: formatCurrentTime()
            };
            setMessages([welcomeMessage]);
          }, 600);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setIsConnected(false);
        
        if (!hasInitialized && messages.length === 0) {
          setHasInitialized(true);
          const offlineMessage = {
            id: Date.now().toString(),
            text: "Welcome to Mindmate! 🌟 I'm here to support your mental wellbeing.",
            isUser: false,
            time: formatCurrentTime()
          };
          setMessages([offlineMessage]);
        }
      }
    };

    initializeChat();
  }, [hasInitialized, messages.length, doctorName]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Send button animation
  const sendButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: sendButtonScale.value }],
    };
  });

  const animateSendButton = () => {
    sendButtonScale.value = withSequence(
      withSpring(0.9),
      withSpring(1)
    );
  };

  // Simulate streaming effect for bot response
  const simulateStreamingResponse = (messageId, responseText) => {
    setIsStreaming(true);
    setStreamingMessageId(messageId);
    
    let currentText = '';
    let index = 0;

    const streamInterval = setInterval(() => {
      if (index < responseText.length) {
        currentText += responseText[index];
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, text: currentText } : msg
        ));
        index++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
        setStreamingMessageId(null);
      }
    }, 25);
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    animateSendButton();
    Keyboard.dismiss();

    const currentMsgText = inputText.trim();
    const userMessage = {
      id: `user-${Date.now()}`,
      text: currentMsgText,
      isUser: true,
      time: formatCurrentTime()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const botMessageId = `bot-${Date.now()}`;
      const botMessage = {
        id: botMessageId,
        text: '',
        isUser: false,
        time: formatCurrentTime()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      const response = await ChatService.sendMessage(currentMsgText);
      setIsTyping(false);
      
      const resp: any = response;
      if (resp?.crisis) {
        Alert.alert(
          "Support Helpline",
          "If you are feeling overwhelmed or in crisis, please call the mental health helpline at 0311-7786264.",
          [{ text: "Understood" }]
        );
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: resp.reply || "Please reach out to support helpline." }
            : msg
        ));
      } else {
        simulateStreamingResponse(botMessageId, resp?.response || resp?.reply || "I hear you. Let's work through this together.");
      }
    } catch (error) {
      console.error('Send message error:', error);
      setIsTyping(false);
      
      const fallbackMessage = {
        id: `bot-${Date.now()}`,
        text: "I'm having a little trouble connecting right now, but I'm here. Please try sending your message again.",
        isUser: false,
        time: formatCurrentTime()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const renderMessage = ({ item, index }: any) => (
    <MessageBubble 
      message={item.text} 
      isUser={item.isUser}
      index={index}
      isStreaming={item.id === streamingMessageId && isStreaming}
      time={item.time}
    />
  );

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const chatSubtitle = doctorName 
    ? 'Specialist Consultation • Online' 
    : (isConnected ? 'Online • Mental Wellbeing' : 'Connecting...');

  return (
    <View style={styles.screen}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.primary}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack?.()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.botAvatar}>
              {doctorName ? (
                <Ionicons name="person" size={18} color={Colors.brand.primary} />
              ) : (
                <Image source={require('../../assets/images/3.png')} style={styles.botImage} />
              )}
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.botName} numberOfLines={1}>{chatTitle}</Text>
              <Text style={styles.botStatus} numberOfLines={1}>{chatSubtitle}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionIconBtn}
              onPress={() => navigation?.navigate?.('VideoCall', { doctorName: chatTitle, appointmentId })}
            >
              <Ionicons name="videocam-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionIconBtn}
              onPress={scrollToBottom}
            >
              <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Messages List Area */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.messagesArea}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            ListFooterComponent={isTyping ? <TypingIndicator /> : null}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 50);
              }
            }}
          />
        </View>

        {/* Modern Bottom Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="happy-outline" size={20} color="#94A3B8" style={styles.inputLeftIcon} />
            <TextInput
              ref={textInputRef}
              style={[
                styles.textInput,
                (!isConnected && messages.length === 0) && styles.disabledInput
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder={isStreaming ? "Generating answer..." : "Share your thoughts..."}
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={500}
              editable={!isStreaming}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
          </View>
          
          <Animated.View style={sendButtonStyle}>
            <TouchableOpacity
              style={[
                styles.sendButton,
                (inputText.trim() === '' || isStreaming) && styles.disabledButton
              ]}
              onPress={handleSend}
              disabled={inputText.trim() === '' || isStreaming}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={inputText.trim() === '' || isStreaming ? ['#CBD5E1', '#94A3B8'] : Colors.gradients.primary}
                style={styles.sendButtonGradient}
              >
                <Ionicons
                  name="send"
                  size={16}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7FAFF',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 48 : 36,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  botAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  botImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTextContainer: {
    flex: 1,
  },
  botName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  botStatus: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 14,
    paddingBottom: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '82%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  botMessageBubble: {
    borderBottomLeftRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  botMessageText: {
    color: '#1F2937',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  userMessageTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  botMessageTime: {
    fontSize: 10,
    color: '#9CA3AF',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  streamingCursor: {
    color: Colors.brand.primary,
    fontWeight: 'bold',
  },
  typingContainer: {
    marginVertical: 4,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  typingBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    color: '#6B7280',
    fontSize: 13,
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.brand.primary,
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 10,
  },
  inputLeftIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: '#1F2937',
    maxHeight: 90,
  },
  disabledInput: {
    color: '#94A3B8',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default MentalHealthChat;
