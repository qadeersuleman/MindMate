import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import Colors from '../../assets/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Enhanced responsive scaling functions
const isSmallScreen = height < 700;
const isLargeScreen = height > 800;
const isTablet = width >= 768;

const scaleSize = (size) => {
  const baseWidth = 375;
  const scaleFactor = width / baseWidth;
  if (isSmallScreen) return Math.round(size * Math.min(scaleFactor, 1.2));
  if (isLargeScreen) return Math.round(size * Math.min(scaleFactor, 1.8));
  return Math.round(size * Math.min(scaleFactor, 1.5));
};

const scaleFont = (size) => {
  const scale = Math.min(width / 375, 1.5);
  const newSize = size * scale;
  let adjustedSize = Platform.OS === 'ios' ? Math.round(newSize) : Math.round(newSize - 1);
  
  if (isSmallScreen) adjustedSize = adjustedSize * 0.9;
  if (isLargeScreen) adjustedSize = adjustedSize * 1.1;
  if (isTablet) adjustedSize = adjustedSize * 1.2;
  
  return adjustedSize;
};

const wp = (percentage) => width * (percentage / 100);
const hp = (percentage) => height * (percentage / 100);

const responsivePadding = (base, small, large, tablet) => {
  if (isTablet && tablet !== undefined) return tablet;
  if (isSmallScreen) return small;
  if (isLargeScreen) return large;
  return base;
};

const responsiveMargin = (base, small, large, tablet) => {
  if (isTablet && tablet !== undefined) return tablet;
  if (isSmallScreen) return small;
  if (isLargeScreen) return large;
  return base;
};

// Updated notification data with your color palette
const notificationsData = [
  {
    id: '1',
    title: 'Message from Dr Sara Wilson',
    message: '05 Total Unread Messages',
    time: '2 hours ago',
    icon: 'chatbubble-ellipses-outline',
    iconType: 'ionicons',
    color: Colors.brand.primary,
    bgColor: '#EAF1FB',
    iconColor: Colors.brand.primary,
    showArrow: true,
    type: 'message',
    read: false
  },
  {
    id: '2',
    title: 'Journal Incomplete!',
    message: 'It\'s Reflection Time! 🌤',
    time: '3 hours ago',
    icon: 'book-outline',
    iconType: 'ionicons',
    color: Colors.features.journal,
    bgColor: '#EAF1FB',
    iconColor: Colors.features.journal,
    showBadge: true,
    badgeColor: Colors.status.warning,
    type: 'journal',
    read: false
  },
  {
    id: '3',
    title: 'Exercise Complete!',
    message: '22m Breathing Done',
    time: '5 hours ago',
    icon: 'fitness-outline',
    iconType: 'ionicons',
    color: Colors.status.success,
    bgColor: '#F0F9F4',
    iconColor: Colors.status.success,
    showArrow: true,
    type: 'exercise',
    read: false
  },
  {
    id: '4',
    title: 'Mental Health Data is Here',
    message: 'Your Monthly Mental Analysis is here',
    time: 'Yesterday',
    icon: 'analytics-outline',
    iconType: 'ionicons',
    color: Colors.features.meditation,
    bgColor: '#F3F1FF',
    iconColor: Colors.features.meditation,
    attachment: 'Shinomiya Data.pdf',
    attachmentColor: Colors.features.meditation,
    type: 'data',
    read: true
  },
  {
    id: '5',
    title: 'Mood Improved',
    message: 'Neutral → Happy',
    time: 'Yesterday',
    icon: 'happy-outline',
    iconType: 'ionicons',
    color: Colors.accent.coral,
    bgColor: '#FEF2F2',
    iconColor: Colors.accent.coral,
    type: 'mood',
    read: true
  },
  {
    id: '6',
    title: 'Weekly Summary Ready',
    message: 'View your weekly mental wellness report',
    time: '2 days ago',
    icon: 'stats-chart-outline',
    iconType: 'ionicons',
    color: Colors.accent.teal,
    bgColor: '#E6FFFA',
    iconColor: Colors.accent.teal,
    type: 'summary',
    read: true
  },
  {
    id: '7',
    title: 'Meditation Streak!',
    message: '7 days in a row! Keep it up!',
    time: '2 days ago',
    icon: 'heart-outline',
    iconType: 'ionicons',
    color: Colors.features.meditation,
    bgColor: '#F3F1FF',
    iconColor: Colors.features.meditation,
    type: 'streak',
    read: true
  },
  {
    id: '8',
    title: 'New Article Available',
    message: '5 Ways to Manage Anxiety Naturally',
    time: '3 days ago',
    icon: 'newspaper-outline',
    iconType: 'ionicons',
    color: Colors.accent.violet,
    bgColor: '#F8F5FF',
    iconColor: Colors.accent.violet,
    type: 'article',
    read: true
  }
];

// Separate component for NotificationItem
const NotificationItem: React.FC<any> = React.memo(({ 
  notification, 
  index, 
  onPress 
}: any) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 400,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [index, animatedValue]);

  const getTimeColor = (timeText) => {
    if (timeText.includes('hour') || timeText.includes('minute')) {
      return Colors.accent.coral;
    }
    return Colors.text.tertiary;
  };

  const renderIcon = () => {
    const { icon, iconType, iconColor } = notification;
    const iconSize = scaleSize(22);
    
    if (iconType === 'ionicons') {
      return <Ionicons name={icon} size={iconSize} color={iconColor} />;
    } else if (iconType === 'material') {
      return <MaterialIcons name={icon} size={iconSize} color={iconColor} />;
    } else {
      return <Feather name={icon} size={iconSize} color={iconColor} />;
    }
  };

  const itemStyle = {
    opacity: animatedValue,
    transform: [
      { 
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [scaleSize(30), 0]
        })
      }
    ]
  };

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  return (
    <Animated.View style={[styles.notificationItem, itemStyle]}>
      <TouchableOpacity
        style={[
          styles.notificationCard,
          { 
            backgroundColor: isPressed ? Colors.background.subtle : Colors.background.card,
            borderLeftColor: notification.color,
            opacity: notification.read ? 0.8 : 1,
            borderLeftWidth: responsivePadding(4, 3, 5, 6),
            padding: responsivePadding(16, 12, 20, 20),
            borderRadius: responsivePadding(16, 12, 20, 24),
          }
        ]}
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(notification)}
      >
        {/* Left Icon */}
        <View style={[styles.iconContainer, { marginRight: responsivePadding(12, 10, 14, 16) }]}>
          <View style={[
            styles.iconWrapper, 
            { 
              backgroundColor: `${notification.color}15`,
              width: scaleSize(isTablet ? 56 : 44),
              height: scaleSize(isTablet ? 56 : 44),
              borderRadius: responsivePadding(12, 10, 14, 16)
            }
          ]}>
            {renderIcon()}
          </View>
        </View>

        {/* Notification Content */}
        <View style={[styles.contentContainer, { flex: 1 }]}>
          <View style={styles.titleRow}>
            <Text style={[
              styles.title, 
              { 
                fontSize: scaleFont(isTablet ? 18 : 16),
                marginRight: scaleSize(8)
              }
            ]} 
            numberOfLines={1}>
              {notification.title}
            </Text>
            {notification.showBadge && (
              <View style={[
                styles.badge, 
                { 
                  backgroundColor: notification.badgeColor,
                  width: scaleSize(isTablet ? 24 : 20),
                  height: scaleSize(isTablet ? 24 : 20),
                  borderRadius: scaleSize(isTablet ? 12 : 10)
                }
              ]}>
                <Text style={[
                  styles.badgeText, 
                  { fontSize: scaleFont(isTablet ? 12 : 10) }
                ]}>
                  !
                </Text>
              </View>
            )}
          </View>
          
          <Text style={[
            styles.message, 
            { 
              fontSize: scaleFont(isTablet ? 16 : 14),
              lineHeight: scaleSize(isTablet ? 24 : 20),
              marginBottom: responsiveMargin(8, 6, 10, 12)
            }
          ]} 
          numberOfLines={2}>
            {notification.message}
          </Text>
          
          {notification.attachment && (
            <View style={[
              styles.attachmentContainer, 
              { 
                backgroundColor: `${notification.attachmentColor}10`,
                paddingHorizontal: responsivePadding(8, 6, 10, 12),
                paddingVertical: responsivePadding(6, 5, 7, 8),
                borderRadius: responsivePadding(8, 6, 10, 12),
                marginBottom: responsiveMargin(8, 6, 10, 12)
              }
            ]}>
              <Ionicons 
                name="document-text-outline" 
                size={scaleSize(isTablet ? 18 : 16)} 
                color={notification.attachmentColor} 
              />
              <Text style={[
                styles.attachmentText, 
                { 
                  color: notification.attachmentColor,
                  fontSize: scaleFont(isTablet ? 14 : 13),
                  marginLeft: scaleSize(6)
                }
              ]} 
              numberOfLines={1}>
                {notification.attachment}
              </Text>
            </View>
          )}

          <View style={styles.footerRow}>
            <Text style={[
              styles.time, 
              { 
                color: getTimeColor(notification.time),
                fontSize: scaleFont(isTablet ? 14 : 12)
              }
            ]}>
              {notification.time}
            </Text>
            {notification.showArrow && (
              <Ionicons 
                name="chevron-forward" 
                size={scaleSize(isTablet ? 20 : 18)} 
                color={notification.color} 
              />
            )}
          </View>
        </View>

        {/* Unread indicator */}
        {!notification.read && (
          <View style={[
            styles.unreadDot, 
            { 
              backgroundColor: notification.color,
              width: scaleSize(isTablet ? 10 : 8),
              height: scaleSize(isTablet ? 10 : 8),
              borderRadius: scaleSize(isTablet ? 5 : 4),
              top: responsivePadding(16, 12, 20, 20),
              right: responsivePadding(16, 12, 20, 20)
            }
          ]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(notificationsData);
  const [unreadCount, setUnreadCount] = useState(notifications.filter(n => !n.read).length);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Status bar remains visible with light content
    StatusBar.setBarStyle('light-content');
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleNotificationPress = (notification) => {
    // Mark as read
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    
    // Update unread count
    const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
    setUnreadCount(newUnreadCount);

    // Navigate based on notification type
    switch(notification.type) {
      case "chat":
        navigation.navigate('Chat');
        break;
      case 'journal':
        navigation.navigate('MindfulJournal');
        break;
      case 'message':
        navigation.navigate('Chat');
        break;
      case 'exercise':
        navigation.navigate('BreathingCompletion', { duration: 22, exerciseType: 'breathing' });
        break;
      case 'streak':
        navigation.navigate('VideoScreen');
        break;
      case 'summary':
        navigation.navigate('Reports');
        break;
      case 'data':
        navigation.navigate('EmotionsData');
        break
      default:
        Alert.alert(
          notification.title,
          `${notification.message}\n\nThis will redirect to the ${notification.type} section in the app.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open', style: 'default' }
          ]
        );
        break;
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            const animations = notifications.map((_, index) => {
              return new Promise((resolve) => {
                setTimeout(() => {
                  setNotifications(prev => {
                    const newNotifications = [...prev];
                    newNotifications.splice(0, 1);
                    return newNotifications;
                  });
                  resolve(null);
                }, index * 50);
              });
            });

            Promise.all(animations).then(() => {
              setTimeout(() => {
                setNotifications([]);
                setUnreadCount(0);
              }, 100);
            });
          }
        }
      ]
    );
  };

  const handleMarkAllRead = () => {
    const markedAsRead = notifications.map(n => ({ ...n, read: true }));
    setNotifications(markedAsRead);
    setUnreadCount(0);
  };

  // Calculate header padding based on safe area insets
  const headerPaddingTop = Math.max(insets.top, responsivePadding(16, 12, 20, 24));

  return (
    <SafeAreaView style={styles.container}>
      {/* Status bar remains visible */}
      <StatusBar 
        barStyle="light-content"
        {...(Platform.OS === 'android' ? { translucent: true } : {})}
      />
      
      {/* Header */}
      <View style={[
        styles.header,
        { 
          paddingTop: headerPaddingTop,
          paddingHorizontal: responsivePadding(20, 16, 24, 32),
          paddingBottom: responsivePadding(16, 12, 20, 24)
        }
      ]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={[
              styles.backButton,
              {
                width: scaleSize(isTablet ? 44 : 40),
                height: scaleSize(isTablet ? 44 : 40),
                borderRadius: scaleSize(isTablet ? 22 : 20)
              }
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons 
              name="arrow-back" 
              size={scaleSize(isTablet ? 26 : 24)} 
              color={Colors.text.inverted} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerCenter}>
          <Text style={[
            styles.headerTitle,
            { 
              fontSize: scaleFont(isTablet ? 22 : 18),
              marginRight: scaleSize(isTablet ? 12 : 8)
            }
          ]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View style={[
              styles.unreadCountBadge,
              {
                width: scaleSize(isTablet ? 28 : 24),
                height: scaleSize(isTablet ? 28 : 24),
                borderRadius: scaleSize(isTablet ? 14 : 12)
              }
            ]}>
              <Text style={[
                styles.unreadCountText,
                { fontSize: scaleFont(isTablet ? 13 : 12) }
              ]}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[
              styles.headerButton,
              {
                width: scaleSize(isTablet ? 44 : 40),
                height: scaleSize(isTablet ? 44 : 40),
                borderRadius: scaleSize(isTablet ? 22 : 20)
              }
            ]}
            onPress={handleMarkAllRead}
          >
            <Ionicons 
              name="checkmark-done-outline" 
              size={scaleSize(isTablet ? 24 : 22)} 
              color={Colors.text.inverted} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[
        styles.actionButtons,
        {
          paddingHorizontal: responsivePadding(20, 16, 24, 32),
          paddingVertical: responsivePadding(12, 10, 14, 16),
          gap: scaleSize(isTablet ? 16 : 12)
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.actionButton,
            {
              paddingVertical: responsivePadding(12, 10, 14, 16),
              borderRadius: responsivePadding(12, 10, 14, 16),
              gap: scaleSize(isTablet ? 8 : 6)
            }
          ]}
          onPress={handleMarkAllRead}
        >
          <Ionicons 
            name="checkmark-done-outline" 
            size={scaleSize(isTablet ? 20 : 18)} 
            color={Colors.brand.primary} 
          />
          <Text style={[
            styles.actionButtonText,
            { fontSize: scaleFont(isTablet ? 16 : 14) }
          ]}>
            Mark All Read
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton,
            styles.clearButton,
            {
              paddingVertical: responsivePadding(12, 10, 14, 16),
              borderRadius: responsivePadding(12, 10, 14, 16),
              gap: scaleSize(isTablet ? 8 : 6)
            }
          ]}
          onPress={handleClearAll}
        >
          <Ionicons 
            name="trash-outline" 
            size={scaleSize(isTablet ? 20 : 18)} 
            color={Colors.status.error} 
          />
          <Text style={[
            styles.actionButtonText,
            { 
              color: Colors.status.error,
              fontSize: scaleFont(isTablet ? 16 : 14)
            }
          ]}>
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView 
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.notificationsListContent,
          {
            paddingHorizontal: responsivePadding(20, 16, 24, 32),
            paddingTop: responsivePadding(16, 12, 20, 24),
            paddingBottom: responsivePadding(40, 30, 50, 60)
          },
          notifications.length === 0 && styles.emptyListContent
        ]}
      >
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            index={index}
            onPress={handleNotificationPress}
          />
        ))}

        {notifications.length === 0 && (
          <View style={[
            styles.emptyState,
            { paddingVertical: hp(15) }
          ]}>
            <Ionicons 
              name="notifications-off-outline" 
              size={scaleSize(isTablet ? 80 : 64)} 
              color={Colors.ui.shadow} 
            />
            <Text style={[
              styles.emptyStateTitle,
              { fontSize: scaleFont(isTablet ? 24 : 20) }
            ]}>
              No Notifications
            </Text>
            <Text style={[
              styles.emptyStateText,
              { 
                fontSize: scaleFont(isTablet ? 16 : 14),
                paddingHorizontal: wp(10)
              }
            ]}>
              You're all caught up!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.brand.primary,
  },
  headerLeft: {
    width: '15%',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    color: Colors.text.inverted,
  },
  unreadCountBadge: {
    backgroundColor: Colors.accent.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCountText: {
    color: Colors.text.inverted,
    fontWeight: '600',
  },
  headerRight: {
    width: '15%',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.subtle,
  },
  clearButton: {
    backgroundColor: Colors.background.subtle,
  },
  actionButtonText: {
    fontWeight: '600',
    color: Colors.brand.primary,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsListContent: {},
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  notificationItem: {
    marginBottom: hp(1.5),
  },
  notificationCard: {
    flexDirection: 'row',
    width: '100%',
    position: 'relative',
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {},
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.text.inverted,
    fontWeight: 'bold',
  },
  message: {
    color: Colors.text.secondary,
    lineHeight: undefined, // Set dynamically
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentText: {
    fontWeight: '500',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontWeight: '500',
  },
  unreadDot: {
    position: 'absolute',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  emptyStateText: {
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});

export default NotificationScreen;