import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ImageBackground,
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
import Screen from "../../components/Screen";

const { width, height } = Dimensions.get('window');

// Animated MessageBubble component with streaming support
const MessageBubble = ({ message, isUser, index, isStreaming = false }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    const delay = index * 100;
    
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(delay, withSpring(0, {
      damping: 15,
      stiffness: 100,
    }));
    scale.value = withDelay(delay, withSpring(1, {
      damping: 15,
      stiffness: 100,
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
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
        colors={isUser ? ['#6E8BFA', '#7B7BFF'] : ['#FFFFFF', '#F5F5F5']}
        style={[styles.messageBubble, isUser && styles.userMessageBubble]}
      >
        <Text style={isUser ? styles.userMessageText : styles.botMessageText}>
          {message}
          {isStreaming && <Text style={styles.streamingCursor}>▊</Text>}
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
    const interval = setInterval(animateDots, 900);

    return () => clearInterval(interval);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  return (
    <View style={styles.typingContainer}>
      <LinearGradient colors={['#FFFFFF', '#F5F5F5']} style={styles.typingBubble}>
        <View style={styles.typingContent}>
          <Text style={styles.typingText}>Mindmate is typing</Text>
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.typingDot, dot1Style]} />
            <Animated.View style={[styles.typingDot, dot2Style]} />
            <Animated.View style={[styles.typingDot, dot3Style]} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Main chat component - UPDATED for backend session management
const MentalHealthChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);
  const sendButtonScale = useSharedValue(1);

  // Initialize chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const isHealthy = await ChatService.healthCheck();
        setIsConnected(isHealthy);
        
        if (!hasInitialized && messages.length === 0) {
          setHasInitialized(true);
          
          setTimeout(() => {
            const welcomeMessage = {
              id: Date.now().toString(),
              text: "Welcome to Mindmate! 🌟 I'm your mental health companion. I'm here to help with mental health support, meditation guidance, relaxation techniques, and general wellness advice. How can I assist you today?",
              isUser: false
            };
            setMessages([welcomeMessage]);
          }, 1000);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setIsConnected(false);
        
        if (!hasInitialized && messages.length === 0) {
          setHasInitialized(true);
          const offlineMessage = {
            id: Date.now().toString(),
            text: "Welcome to Mindmate! 🌟 I'm here to help with mental health support.",
            isUser: false
          };
          setMessages([offlineMessage]);
        }
      }
    };

    initializeChat();
  }, [hasInitialized, messages.length]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
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
    }, 30); // Adjust typing speed (lower = faster)
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    animateSendButton();
    Keyboard.dismiss();

    const userMessage = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      isUser: true
    };
    
    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Create bot message placeholder for streaming
      const botMessageId = `bot-${Date.now()}`;
      const botMessage = {
        id: botMessageId,
        text: '', // Start with empty text
        isUser: false
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Send message to backend - session is managed automatically by backend
      const response = await ChatService.sendMessage(inputText.trim());
      
      setIsTyping(false);
      
      // Start streaming the actual response from backend
      if (response.crisis) {
        // Handle crisis response - show immediately with alert
        Alert.alert(
          "Important Message",
          "If you're in crisis, please reach out to someone you trust or call Umang Helpline at 0311-7786264",
          [{ text: "I Understand" }]
        );
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: response.reply }
            : msg
        ));
      } else {
        // Normal response - stream it character by character
        simulateStreamingResponse(botMessageId, response.response || response.reply);
      }
      
    } catch (error) {
      console.error('Send message error:', error);
      setIsTyping(false);
      
      const fallbackMessage = {
        id: `bot-${Date.now()}`,
        text: "I apologize, but I'm having trouble connecting right now. Please try again.",
        isUser: false
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const renderMessage = ({ item, index }) => (
    <MessageBubble 
      message={item.text} 
      isUser={item.isUser}
      index={index}
      isStreaming={item.id === streamingMessageId && isStreaming}
    />
  );

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' }}
          style={styles.backgroundImage}
          blurRadius={5}
        >
          <LinearGradient
            colors={['rgba(123, 123, 255, 0.8)', 'rgba(110, 139, 250, 0.8)']}
            style={styles.gradientOverlay}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.botAvatar}>
                  <Image source={require('../../assets/images/3.png')} style={styles.botImage} />
                </View>
                <View>
                  <Text style={styles.botName}>Mindmate AI</Text>
                  <Text style={styles.botStatus}>
                    {isConnected ? 'Online • Mental Health Support' : 'Connecting...'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={scrollToBottom}>
                <Ionicons name="arrow-down" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Messages List */}
            <View style={styles.messagesArea}>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                ListFooterComponent={isTyping ? <TypingIndicator /> : null}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>Starting conversation...</Text>
                  </View>
                }
                showsVerticalScrollIndicator={true}
                onContentSizeChange={() => {
                  if (messages.length > 0) {
                    setTimeout(() => {
                      flatListRef.current?.scrollToEnd({ animated: true });
                    }, 50);
                  }
                }}
                onLayout={() => {
                  if (messages.length > 0) {
                    setTimeout(() => {
                      flatListRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }
                }}
              />
            </View>

            {/* Input Container */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={textInputRef}
                style={[
                  styles.textInput,
                  (!isConnected || isStreaming) && styles.disabledInput
                ]}
                value={inputText}
                onChangeText={setInputText}
                placeholder={isConnected ? "Share your thoughts..." : "Connecting..."}
                placeholderTextColor="#999"
                multiline
                maxLength={500}
                editable={isConnected && !isStreaming}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              
              <Animated.View style={sendButtonStyle}>
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (inputText.trim() === '' || !isConnected || isStreaming) && styles.disabledButton
                  ]}
                  onPress={handleSend}
                  disabled={inputText.trim() === '' || !isConnected || isStreaming}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={inputText.trim() === '' || !isConnected || isStreaming ? '#CCC' : '#FFFFFF'}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  botImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  botName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  messagesArea: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 18,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
  },
  botMessageText: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 20,
  },
  streamingCursor: {
    color: '#6E8BFA',
    fontWeight: 'bold',
  },
  typingContainer: {
    marginVertical: 4,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  typingBubble: {
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    color: '#666',
    fontSize: 14,
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
    marginHorizontal: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 10,
    textAlignVertical: 'center',
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
    color: '#999',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6E8BFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
});

export default MentalHealthChat;