// App.js
import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import Colors from '../assets/colors';

const { width, height } = Dimensions.get('window');

// Custom Icon Components
const SendIcon = ({ size = 24, color = Colors.text.inverted }) => (
  <Text style={{ fontSize: size, color }}>↑</Text>
);

const SmileIcon = ({ size = 24, color = Colors.text.secondary }) => (
  <Text style={{ fontSize: size, color }}>😊</Text>
);

const MicIcon = ({ size = 24, color = Colors.text.secondary }) => (
  <Text style={{ fontSize: size, color }}>🎤</Text>
);

const PaperclipIcon = ({ size = 24, color = Colors.text.secondary }) => (
  <Text style={{ fontSize: size, color }}>📎</Text>
);

const MoreVerticalIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Text style={{ fontSize: size, color }}>⋮</Text>
);

const ChevronLeftIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Text style={{ fontSize: size, color }}>←</Text>
);

const UserIcon = ({ size = 24, color = Colors.text.primary }) => (
  <Text style={{ fontSize: size, color }}>👤</Text>
);

const ClockIcon = ({ size = 24, color = Colors.text.tertiary }) => (
  <Text style={{ fontSize: size, color }}>🕒</Text>
);

const CheckIcon = ({ size = 12, color = Colors.text.tertiary }) => (
  <Text style={{ fontSize: size, color }}>✓</Text>
);

const DoubleCheckIcon = ({ size = 12, color = Colors.brand.primary }) => (
  <Text style={{ fontSize: size, color }}>✓✓</Text>
);

const SparklesIcon = ({ size = 16, color = Colors.brand.primary }) => (
  <Text style={{ fontSize: size, color }}>✨</Text>
);

const ThinkingIcon = ({ size = 24, color = Colors.text.secondary }) => (
  <Text style={{ fontSize: size, color }}>💭</Text>
);

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hi there! 👋 I'm Serenity, your AI mental health companion. How are you feeling today?",
      sender: 'bot',
      time: '10:00 AM',
      status: 'read',
      type: 'text',
      animation: new Animated.Value(0)
    },
    {
      id: '2',
      text: "Hi! I've been feeling a bit anxious about work lately.",
      sender: 'user',
      time: '10:02 AM',
      status: 'read',
      type: 'text',
      animation: new Animated.Value(0)
    },
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([
    "Feeling anxious",
    "Need meditation",
    "Journal prompts",
    "Breathing exercise"
  ]);
  
  const flatListRef = useRef();
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const inputFocusAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate initial messages
    messages.forEach((message, index) => {
      setTimeout(() => {
        Animated.spring(message.animation, {
          toValue: 1,
          tension: 20,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, index * 200);
    });
    
    // Start wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const autoReplies = [
    "I understand. Let's practice a quick breathing exercise together.",
    "Would you like to try a 5-minute guided meditation?",
    "It's completely normal to feel this way. Let's work through it together.",
    "How about we write down what's bothering you in your journal?",
    "Remember to be kind to yourself. You're doing the best you can.",
    "Let's focus on the present moment. What's one thing you're grateful for right now?",
    "Would you like me to suggest some calming techniques?",
    "Sometimes talking helps. I'm here to listen whenever you need."
  ];

  const getRandomReply = () => {
    return autoReplies[Math.floor(Math.random() * autoReplies.length)];
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: 'text',
      animation: new Animated.Value(0)
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Animate message entry
    Animated.spring(newMessage.animation, {
      toValue: 1,
      tension: 20,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Show typing indicator
    setTimeout(() => {
      setIsTyping(true);
      Animated.timing(typingAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Auto-reply after 1-2 seconds
      setTimeout(() => {
        setIsTyping(false);
        Animated.timing(typingAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
        
        const botReply = {
          id: (Date.now() + 1).toString(),
          text: getRandomReply(),
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          type: 'text',
          animation: new Animated.Value(0)
        };
        
        setMessages(prev => [...prev, botReply]);
        
        // Animate bot message
        setTimeout(() => {
          Animated.spring(botReply.animation, {
            toValue: 1,
            tension: 20,
            friction: 8,
            useNativeDriver: true,
          }).start();
          
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, Math.random() * 1000 + 1000);
    }, 500);
  };

  const handleQuickReply = (reply) => {
    setInputText(reply);
    // Focus animation
    Animated.sequence([
      Animated.timing(inputFocusAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(inputFocusAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.sender === 'user';
    
    const translateY = item.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0]
    });

    const opacity = item.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          {
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        {!isUser && (
          <View style={styles.botAvatar}>
            <SparklesIcon size={16} />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText
          ]}>
            {item.text}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>{item.time}</Text>
            
            {isUser && (
              <View style={styles.messageStatus}>
                {item.status === 'sent' && <CheckIcon />}
                {item.status === 'read' && <DoubleCheckIcon />}
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const typingIndicatorOpacity = typingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const waveTranslateY = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8]
  });

  const inputScale = inputFocusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02]
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.main} />
      
      {/* Header */}
      <Animated.View style={[styles.header, {
        backgroundColor: Colors.background.card,
        shadowOpacity: inputFocusAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.1, 0.2]
        })
      }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <ChevronLeftIcon />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Animated.View style={[styles.headerAvatar, {
              transform: [{ translateY: waveTranslateY }]
            }]}>
              <View style={styles.avatarIcon}>
                <Text style={styles.sparklesEmoji}>✨</Text>
              </View>
            </Animated.View>
            
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Dr, Sarah Wilson</Text>
              <Text style={styles.headerSubtitle}>
                {isTyping ? 'Typing...' : 'Online • Ready to help'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.moreButton}>
            <MoreVerticalIcon />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Typing Indicator */}
        <Animated.View style={[styles.typingIndicator, { opacity: typingIndicatorOpacity }]}>
          <View style={styles.typingBubble}>
            <View style={styles.typingContent}>
              <ThinkingIcon size={20} />
              <View style={styles.typingDots}>
                <Animated.View style={[styles.typingDot]} />
                <Animated.View style={[styles.typingDot, styles.typingDot2]} />
                <Animated.View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Quick Replies */}
      <View style={styles.quickRepliesContainer}>
        <FlatList
          horizontal
          data={quickReplies}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quickReply}
              onPress={() => handleQuickReply(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickReplyText}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRepliesList}
        />
      </View>

      {/* Input Area */}
      <Animated.View style={[styles.inputContainer, {
        transform: [{ scale: inputScale }],
        backgroundColor: Colors.background.card,
      }]}>
        <TouchableOpacity style={styles.inputActionButton}>
          <PaperclipIcon />
        </TouchableOpacity>
        
        <Animated.View style={[styles.inputWrapper, {
          borderColor: inputFocusAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [Colors.neutrals.border, Colors.brand.primary]
          })
        }]}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Share your thoughts..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            maxLength={500}
            onFocus={() => {
              Animated.spring(inputFocusAnimation, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
              }).start();
            }}
            onBlur={() => {
              Animated.spring(inputFocusAnimation, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
              }).start();
            }}
          />
          
          <TouchableOpacity style={styles.emojiButton}>
            <SmileIcon />
          </TouchableOpacity>
        </Animated.View>
        
        <TouchableOpacity
          style={[styles.sendButton, !inputText && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText}
          activeOpacity={0.8}
        >
          <SendIcon />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerAvatar: {
    marginRight: 12,
  },
  avatarIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent.teal + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent.teal,
  },
  sparklesEmoji: {
    fontSize: 20,
  },
  headerText: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    maxWidth: '80%',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  botBubble: {
    backgroundColor: Colors.background.card,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.brand.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botMessageText: {
    color: Colors.text.primary,
  },
  userMessageText: {
    color: Colors.text.inverted,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  messageStatus: {
    marginLeft: 4,
    flexDirection: 'row',
  },
  typingIndicator: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  typingBubble: {
    backgroundColor: Colors.background.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.text.secondary,
    marginHorizontal: 1,
    opacity: 0.6,
  },
  typingDot2: {
    opacity: 0.8,
  },
  typingDot3: {
    opacity: 1,
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.card,
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.border,
  },
  quickRepliesList: {
    paddingHorizontal: 4,
  },
  quickReply: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background.subtle,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.neutrals.border,
  },
  quickReplyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.border,
    backgroundColor: Colors.background.card,
    shadowColor: Colors.ui.shadowDark,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 5,
  },
  inputActionButton: {
    padding: 8,
    marginRight: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.subtle,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    maxHeight: 100,
    paddingVertical: 12,
  },
  emojiButton: {
    padding: 8,
    marginLeft: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.text.tertiary,
    shadowOpacity: 0.1,
  },
});

export default ChatScreen;