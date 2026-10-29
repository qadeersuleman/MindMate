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

// Animated MessageBubble component (keep this same)
const MessageBubble = ({ message, isUser, index }) => {
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
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Animated TypingIndicator component (keep this same)
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

// Main chat component - UPDATED
const MentalHealthChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);
  const sendButtonScale = useSharedValue(1);

  // Remove individual keyboard height state and use KeyboardAvoidingView instead

  // Check backend connection and initialize conversation (keep same)
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

  // Send button animation (keep same)
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

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    animateSendButton();
    Keyboard.dismiss();

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const [result] = await Promise.all([
        ChatService.sendMessage(inputText.trim()),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      
      setIsTyping(false);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: result.botResponse,
        isUser: false
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      setIsTyping(false);
      
      const fallbackMessage = {
        id: (Date.now() + 1).toString(),
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

            {/* Input Container - FIXED */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={textInputRef}
                style={[
                  styles.textInput,
                  !isConnected && styles.disabledInput
                ]}
                value={inputText}
                onChangeText={setInputText}
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                placeholderTextColor="#999"
                multiline
                maxLength={500}
                editable={isConnected}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              
              <Animated.View style={sendButtonStyle}>
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (inputText.trim() === '' || !isConnected) && styles.disabledButton
                  ]}
                  onPress={handleSend}
                  disabled={inputText.trim() === '' || !isConnected}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={inputText.trim() === '' || !isConnected ? '#CCC' : '#FFFFFF'}
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
    backgroundColor: "transparent" // Changed from white to transparent
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
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 10 : 15, // Adjusted padding
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botAvatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  botName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botStatus: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  messagesArea: {
    flex: 1,
    paddingHorizontal: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    marginLeft: '15%',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    marginRight: '15%',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
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
  typingContainer: {
    alignSelf: 'flex-start',
    marginRight: '15%',
    marginBottom: 12,
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
    fontStyle: 'italic',
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginHorizontal: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 12,
    textAlignVertical: 'center',
  },
  disabledInput: {
    backgroundColor: '#E5E5E5',
    color: '#999',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6E8BFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  botImage: {
    width: 80,
    height: 70,
    borderRadius: 12,
    resizeMode: 'cover',
  },
});

export default MentalHealthChat;