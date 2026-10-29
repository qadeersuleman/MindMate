import AsyncStorage from '@react-native-async-storage/async-storage';

// Save complete user session
// Save complete user session
export const saveSession = async (userData) => {
  try {
    // Store the complete user object
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    
    // Also store individual fields for easy access
    await AsyncStorage.setItem('userId', userData.id.toString());
    await AsyncStorage.setItem('userEmail', userData.email);
    await AsyncStorage.setItem('userFullName', userData.full_name || '');
    await AsyncStorage.setItem('userRole', userData.role || 'user'); // Add this line
    await AsyncStorage.setItem('profileImage', userData.profile_image || '');
    await AsyncStorage.setItem('phoneNumber', userData.phone_number || '');
    await AsyncStorage.setItem('gender', userData.gender || '');
    await AsyncStorage.setItem('dateOfBirth', userData.date_of_birth || '');
    await AsyncStorage.setItem('weight', userData.weight ? userData.weight.toString() : '');
    await AsyncStorage.setItem('hasCompletedProfile', 
      userData.hasCompletedProfile ? 'true' : 'false');
    await AsyncStorage.setItem('hasCompletedAssessment', 
      userData.hasCompletedAssessment ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
};

// Retrieve complete user session
export const getSession = async () => {
  try {
    const userDataString = await AsyncStorage.getItem('userData');
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Clear all user session data
export const clearSession = async () => {
  try {
    console.log('Starting to clear session...');
    const keys = [
      'userData',
      'userId', 
      'userEmail',
      'userFullName',
      'userRole', // Add this line
      'profileImage',
      'phoneNumber',
      'gender',
      'dateOfBirth',
      'weight',
      'hasCompletedProfile',
      'hasCompletedAssessment'
    ];
    
    await AsyncStorage.multiRemove(keys);
    console.log('All session data cleared successfully');
    
    return true;
  } catch (error) {
    console.error('Error clearing session:', error);
    throw error;
  }
};

// Helper function to update specific user fields in session
export const updateSessionField = async (field, value) => {
  try {
    const userData = await getSession();
    if (userData) {
      const updatedUser = {
        ...userData,
        [field]: value
      };
      await saveSession(updatedUser);
      return updatedUser;
    }
    return null;
  } catch (error) {
    console.error("Error updating session field", error);
    return null;
  }
};

// Helper function to update multiple user fields in session
export const updateSessionFields = async (updates) => {
  try {
    const userData = await getSession();
    if (userData) {
      const updatedUser = {
        ...userData,
        ...updates
      };
      await saveSession(updatedUser);
      return updatedUser;
    }
    return null;
  } catch (error) {
    console.error("Error updating session fields", error);
    return null;
  }
};