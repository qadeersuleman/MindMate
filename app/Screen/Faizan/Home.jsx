import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const defaultDeviceNames = [
  'Main Light', 'Red Light', 'Yellow Light', 'Blue Light',
  'Ceiling Fan', 'Bedroom Fan', 'Living Room Fan', 'Turbo Fan'
];
const defaultOnValues = ['1', '2', '3', '4', '5', '6', '7', '8'];
const defaultOffValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const Home = ({ navigation, route }) => {
  const [toggles, setToggles] = useState(Array(8).fill(false));
  const buttonAnimations = Array(8).fill().map(() => new Animated.Value(0));

  // Get settings from route params or use defaults
  const deviceNames = route.params?.deviceNames || defaultDeviceNames;
  const onValues = route.params?.onValues || defaultOnValues;
  const offValues = route.params?.offValues || defaultOffValues;

  const toggleSwitch = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newToggles = [...toggles];
    newToggles[index] = !newToggles[index];
    setToggles(newToggles);

    buttonAnimations[index].setValue(0);
    Animated.timing(buttonAnimations[index], {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true
    }).start();

    // Log the current command being sent
    const command = newToggles[index] ? onValues[index] : offValues[index];
    console.log(`Sending command: ${command} for ${deviceNames[index]}`);
  };

  const getButtonAnimationStyle = (index) => {
    const scale = buttonAnimations[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.05, 1]
    });

    return {
      transform: [{ scale }]
    };
  };

  const getIconComponent = (index, isOn) => {
    const size = 32;
    const inactiveColor = '#757575';
    
    if (index < 4) {
      const colors = ['#adacacff', '#ff3b30', '#ffcc00', '#007aff'];
      return (
        <Ionicons 
          name={isOn ? 'bulb' : 'bulb-outline'} 
          size={size} 
          color={isOn ? colors[index] : inactiveColor} 
        />
      );
    } else {
      const speeds = ['fan', 'fan-speed-1', 'fan-speed-2', 'fan-speed-3'];
      return (
        <MaterialCommunityIcons 
          name={isOn ? speeds[index-4] : 'fan-off'} 
          size={size} 
          color={isOn ? '#34c759' : inactiveColor} 
        />
      );
    }
  };

  const goToSettings = () => {
    Haptics.selectionAsync();
    navigation.navigate('Settings', { 
      deviceNames,
      onValues,
      offValues,
      onSave: (settings) => {
        navigation.setParams({
          deviceNames: settings.deviceNames,
          onValues: settings.onValues,
          offValues: settings.offValues
        });
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>Smart Controls</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={goToSettings}
          >
            <Ionicons name="settings-sharp" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.buttonsContainer}>
          {toggles.map((isOn, index) => (
            <Animated.View 
              style={[
                styles.buttonBox, 
                getButtonAnimationStyle(index),
              ]} 
              key={`device-${index}`}
            >
              {getIconComponent(index, isOn)}
              <Text style={styles.buttonText}>
                {deviceNames[index]}
              </Text>
              <Switch
                value={isOn}
                onValueChange={() => toggleSwitch(index)}
                thumbColor={isOn ? '#1976d2' : '#f5f5f5'}
                trackColor={{ false: '#bdbdbd', true: '#90caf9' }}
              />
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976d2',
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buttonBox: {
    width: width > 500 ? '23%' : '48%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: width > 500 ? '2%' : '4%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
    textAlign: 'center',
  },
});

export default Home;