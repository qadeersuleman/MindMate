import axios from 'axios';
import { getSession } from '../utils/session';
import { API_BASE_URL, API_HOST } from '../config/server';

export { API_BASE_URL, API_HOST };

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add user ID if available
api.interceptors.request.use(
  async (config) => {
    try {
      // Get user data from AsyncStorage
      const userData = await getSession();
      if (userData && userData.id) {
        // Add user ID to all requests if available
        config.headers['X-User-ID'] = userData.id;
      }
    } catch (error) {
      console.error('Error getting session in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Smart request function that detects content type automatically
const makeRequest = async (method, endpoint, data = null, customHeaders = {}) => {
  try {
    const isFormData = data instanceof FormData;
    
    const config = {
      method,
      url: endpoint,
      headers: {
        'Accept': 'application/json',
        ...customHeaders,
      },
    };

    if (data) {
      // For FormData, let the browser set the content type with boundary
      if (isFormData) {
        config.data = data;
        // Don't set Content-Type header for FormData - let axios set it automatically with boundary
      } else {
        // For JSON data, set Content-Type and stringify
        config.headers['Content-Type'] = 'application/json';
        config.data = JSON.stringify(data);
      }
    }

    const response = await api.request(config);
    return response.data;
  } catch (error) {
    console.error(`API ${method} request error for ${endpoint}:`, error);
    
    if (error.response) {
      const errorMessage = error.response.data?.error || 
                          error.response.data?.message || 
                          error.response.data?.detail ||
                          `Server error occurred: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('No response received from server. Please check your connection.');
    } else {
      throw new Error('Request failed to be created');
    }
  }
};

// Authentication API functions
export const loginUser = async (loginData) => {
  return makeRequest('post', '/login/', loginData);
};

// Signup function - using the exact endpoint from your code
export const SignupUser = async (userData) => {
  return makeRequest('post', '/signup/', userData);
};

// Assessment API function (for your existing assessment data)
export const submitAssessment = async (assessmentData) => {
  console.log('Sending assessment data to backend:', {
    ...assessmentData,
    captured_image: assessmentData.captured_image 
      ? `base64:${assessmentData.captured_image.length} characters` 
      : 'null'
  });
  
  try {
    const response = await makeRequest('post', '/assessments/', assessmentData);
    console.log('Backend response:', response);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Audio analysis API function (for audio file uploads)
export const submitAudioAnalysis = async (audioData) => {
  // For FormData, we need to handle it differently to ensure proper file upload
  if (audioData instanceof FormData) {
    try {
      // Get session to add user ID to headers
      const userData = await getSession();
      const headers = {};
      
      if (userData && userData.id) {
        headers['X-User-ID'] = userData.id;
      }
      
      // Use axios directly for FormData to ensure proper handling
      const response = await api.post('/audio-analysis/', audioData, {
        headers: {
          'Accept': 'application/json',
          ...headers,
        },
        transformRequest: (data) => data,
        timeout: 60000, // Longer timeout for file uploads
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Audio analysis submission error:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.error || 
                            error.response.data?.message || 
                            error.response.data?.detail ||
                            `Server error occurred: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Analysis request timed out after 60 seconds.');
      } else if (error.request) {
        throw new Error(`Cannot reach server at ${api.defaults.baseURL}audio-analysis/. Please ensure backend is running at ${api.defaults.baseURL}`);
      } else {
        throw new Error(error.message || 'Request failed to be created');
      }
    }
  } else {
    // For regular JSON data, use the makeRequest function
    return makeRequest('post', '/audio-analysis/', audioData);
  }
};

// User profile update API function (for profile editing)
export const updateUserProfile = async (formData) => {
  try {
    // Get session to add user ID to headers
    const userData = await getSession();
    const headers = {};

    if (userData && userData.id) {
      headers['X-User-ID'] = userData.id;
    }

    const response = await api.post('/editprofile/', formData, {
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
      transformRequest: (data) => data,
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    console.error('Profile update error in API:', error);

    if (error.response) {
      const errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        error.response.data?.detail ||
        `Server error occurred: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error('Request failed to be created');
    }
  }
};

// User profile API functions
export const getUserProfile = async () => {
  return makeRequest('get', '/user/profile/');
};

// Chat API functions - ADDED TO YOUR EXISTING API
export const ChatService = {
  async sendMessage(message) {
    try {
      const response = await makeRequest('post', '/chats/', { message });
      
      if (response.success) {
        return {
          success: true,
          botResponse: response.response,
          userMessage: response.user_message
        };
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      return {
        success: false,
        error: error.message,
        botResponse: "I'm having trouble connecting right now. Please try again."
      };
    }
  },

  async healthCheck() {
    try {
      const response = await makeRequest('get', '/health/');
      return true;
    } catch (error) {
      return false;
    }
  }
};





// 📰 Articles API
export const getArticles = async () => {
  return makeRequest('get', '/articles/');
};


// 📰 Article Likes API - Single toggle function
// api.js - Make sure this is exactly how you're exporting
export const toggleArticleLike = async (articleId) => {
  const userData = await getSession();
  
  if (!userData || !userData.id) {
    throw new Error('User not logged in');
  }

  try {
    const response = await makeRequest('post', `/articles/${articleId}/like/`, {
      user_id: userData.id
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Like operation failed');
    }
    
    return response;
  } catch (error) {
    console.error('API Error in toggleArticleLike:', error);
    throw error;
  }
};




// 📰 Article Views API
export const trackArticleView = async (articleId) => {
  try {
    const userData = await getSession();
    const userId = userData?.id; // Can be undefined if user not logged in

    return makeRequest('post', `/articles/${articleId}/view/`, {
      user_id: userId
    });
  } catch (error) {
    console.error('Track view error:', error);
    throw error;
  }
};

// Get article views count
export const getArticleViews = async (articleId) => {
  return makeRequest('get', `/articles/${articleId}/views/`);
};




// Add this to your api.js if not already there
// Add this to your api.js file
export const getArticleLikeStatus = async (articleId) => {
  try {
    const userData = await getSession();
    
    if (!userData || !userData.id) {
      throw new Error('User not logged in');
    }

    const response = await makeRequest('get', `/articles/${articleId}/like-status/?user_id=${userData.id}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get like status');
    }
    
    return response;
  } catch (error) {
    console.error('API Error in getArticleLikeStatus:', error);
    throw error;
  }
};

// Doctors




export default api;


