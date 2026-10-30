import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  id: number | string;
  email: string;
  full_name?: string;
  username?: string;
  role?: string;
  profile_image?: string;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string;
  weight?: number | string;
  hasCompletedProfile?: boolean;
  hasCompletedAssessment?: boolean;
  [key: string]: any;
}

// Save complete user session
export const saveSession = async (userData: UserData): Promise<void> => {
  try {
    // Store the complete user object
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    
    // Also store individual fields for easy access
    if (userData.id !== undefined && userData.id !== null) {
      await AsyncStorage.setItem('userId', userData.id.toString());
    }
    if (userData.email) await AsyncStorage.setItem('userEmail', userData.email);
    await AsyncStorage.setItem('userFullName', userData.full_name || '');
    await AsyncStorage.setItem('userRole', userData.role || 'user');
    await AsyncStorage.setItem('profileImage', userData.profile_image || '');
    await AsyncStorage.setItem('phoneNumber', userData.phone_number || '');
    await AsyncStorage.setItem('gender', userData.gender || '');
    await AsyncStorage.setItem('dateOfBirth', userData.date_of_birth || '');
    await AsyncStorage.setItem('weight', userData.weight ? userData.weight.toString() : '');
    await AsyncStorage.setItem('hasCompletedProfile', userData.hasCompletedProfile ? 'true' : 'false');
    await AsyncStorage.setItem('hasCompletedAssessment', userData.hasCompletedAssessment ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
};

// Retrieve complete user session
export const getSession = async (): Promise<UserData | null> => {
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
export const clearSession = async (): Promise<boolean> => {
  try {
    console.log('Starting to clear session...');
    const keys = [
      'userData',
      'userId', 
      'userEmail',
      'userFullName',
      'userRole',
      'profileImage',
      'phoneNumber',
      'gender',
      'dateOfBirth',
      'weight',
      'hasCompletedProfile',
      'hasCompletedAssessment'
    ];
    
    await (AsyncStorage as any).multiRemove(keys);
    console.log('All session data cleared successfully');
    
    return true;
  } catch (error) {
    console.error('Error clearing session:', error);
    throw error;
  }
};

// Helper function to update specific user fields in session
export const updateSessionField = async (field: keyof UserData | string, value: any): Promise<UserData | null> => {
  try {
    const userData = await getSession();
    if (userData) {
      const updatedUser: UserData = {
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
export const updateSessionFields = async (updates: Partial<UserData>): Promise<UserData | null> => {
  try {
    const userData = await getSession();
    if (userData) {
      const updatedUser: UserData = {
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

export default {
  saveSession,
  getSession,
  clearSession,
  updateSessionField,
  updateSessionFields,
};
