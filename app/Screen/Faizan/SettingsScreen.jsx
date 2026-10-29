import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const defaultDeviceNames = [
  'Main Light', 'Red Light', 'Yellow Light', 'Blue Light',
  'Ceiling Fan', 'Bedroom Fan', 'Living Room Fan', 'Turbo Fan'
];
const defaultOnValues = ['1', '2', '3', '4', '5', '6', '7', '8'];
const defaultOffValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const SettingsScreen = ({ route, navigation }) => {
  // Get initial values from route params or use defaults
  const initialDeviceNames = route.params?.deviceNames || defaultDeviceNames;
  const initialOnValues = route.params?.onValues || defaultOnValues;
  const initialOffValues = route.params?.offValues || defaultOffValues;

  // State for all settings
  const [deviceNames, setDeviceNames] = useState(initialDeviceNames);
  const [onValues, setOnValues] = useState(initialOnValues);
  const [offValues, setOffValues] = useState(initialOffValues);

  const handleNameChange = (index, value) => {
    const newNames = [...deviceNames];
    newNames[index] = value;
    setDeviceNames(newNames);
  };

  const handleOnValueChange = (index, value) => {
    const newValues = [...onValues];
    newValues[index] = value;
    setOnValues(newValues);
  };

  const handleOffValueChange = (index, value) => {
    const newValues = [...offValues];
    newValues[index] = value;
    setOffValues(newValues);
  };

  const saveSettings = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Call the onSave callback passed from Home screen
    if (route.params?.onSave) {
      route.params.onSave({
        deviceNames,
        onValues,
        offValues
      });
    }
    
    navigation.goBack();
  };

  const resetToDefaults = () => {
    Haptics.selectionAsync();
    setDeviceNames([...defaultDeviceNames]);
    setOnValues([...defaultOnValues]);
    setOffValues([...defaultOffValues]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Device Settings</Text>
          <TouchableOpacity 
            onPress={saveSettings}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {deviceNames.map((name, index) => (
            <View key={`device-${index}`} style={styles.deviceCard}>
              <View style={styles.deviceHeader}>
                {index < 4 ? (
                  <Ionicons 
                    name="bulb-outline" 
                    size={28} 
                    color="#1976d2" 
                    style={styles.deviceIcon}
                  />
                ) : (
                  <MaterialCommunityIcons 
                    name="fan" 
                    size={28} 
                    color="#1976d2" 
                    style={styles.deviceIcon}
                  />
                )}
                <Text style={styles.deviceNumber}>Device {index + 1}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Device Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(text) => handleNameChange(index, text)}
                  placeholder="Enter device name"
                />
              </View>

              <View style={styles.valueRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>ON Value</Text>
                  <TextInput
                    style={styles.input}
                    value={onValues[index]}
                    onChangeText={(text) => handleOnValueChange(index, text)}
                    placeholder="ON value"
                    maxLength={2}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>OFF Value</Text>
                  <TextInput
                    style={styles.input}
                    value={offValues[index]}
                    onChangeText={(text) => handleOffValueChange(index, text)}
                    placeholder="OFF value"
                    maxLength={2}
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetToDefaults}
          >
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#1976d2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceIcon: {
    marginRight: 12,
  },
  deviceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resetButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: '#424242',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;