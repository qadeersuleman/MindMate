import axios, { AxiosRequestConfig, Method } from 'axios';
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
      const userData = await getSession();
      if (userData && userData.id) {
        config.headers['X-User-ID'] = userData.id.toString();
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
export const makeRequest = async <T = any>(
  method: Method | string,
  endpoint: string,
  data: any = null,
  customHeaders: Record<string, string> = {}
): Promise<T> => {
  try {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    
    const config: AxiosRequestConfig = {
      method: method as Method,
      url: endpoint,
      headers: {
        Accept: 'application/json',
        ...customHeaders,
      },
    };

    if (data) {
      if (isFormData) {
        config.data = data;
      } else {
        config.headers = {
          ...config.headers,
          'Content-Type': 'application/json',
        };
        config.data = typeof data === 'string' ? data : JSON.stringify(data);
      }
    }

    const response = await api.request<T>(config);
    return response.data;
  } catch (error: any) {
    console.error(`API ${method} request error for ${endpoint}:`, error);
    
    if (error.response) {
      const errorMessage =
        error.response.data?.error || 
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
export const loginUser = async (loginData: Record<string, any>) => {
  return makeRequest('post', '/login/', loginData);
};

// Signup function
export const SignupUser = async (userData: Record<string, any>) => {
  return makeRequest('post', '/signup/', userData);
};

// Assessment API function
export const submitAssessment = async (assessmentData: Record<string, any>) => {
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

// Audio analysis API function
export const submitAudioAnalysis = async (audioData: FormData | any) => {
  if (typeof FormData !== 'undefined' && audioData instanceof FormData) {
    try {
      const userData = await getSession();
      const headers: Record<string, string> = {};
      
      if (userData && userData.id) {
        headers['X-User-ID'] = userData.id.toString();
      }
      
      const response = await api.post('/audio-analysis/', audioData, {
        headers: {
          Accept: 'application/json',
          ...headers,
        },
        transformRequest: (data) => data,
        timeout: 60000,
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
    } catch (error: any) {
      console.error('Audio analysis submission error:', error);
      
      if (error.response) {
        const errorMessage =
          error.response.data?.error || 
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
    return makeRequest('post', '/audio-analysis/', audioData);
  }
};

// User profile update API function
export const updateUserProfile = async (formData: FormData | any) => {
  try {
    const userData = await getSession();
    const headers: Record<string, string> = {};

    if (userData && userData.id) {
      headers['X-User-ID'] = userData.id.toString();
    }

    const response = await api.post('/editprofile/', formData, {
      headers: {
        Accept: 'application/json',
        ...headers,
      },
      transformRequest: (data) => data,
      timeout: 30000,
    });

    return response.data;
  } catch (error: any) {
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

// Chat API functions
export const ChatService = {
  async sendMessage(message: string) {
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
    } catch (error: any) {
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
      await makeRequest('get', '/health/');
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

// 📰 Article Likes API
export const toggleArticleLike = async (articleId: string | number) => {
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
export const trackArticleView = async (articleId: string | number) => {
  try {
    const userData = await getSession();
    const userId = userData?.id;

    return makeRequest('post', `/articles/${articleId}/view/`, {
      user_id: userId
    });
  } catch (error) {
    console.error('Track view error:', error);
    throw error;
  }
};

// Get article views count
export const getArticleViews = async (articleId: string | number) => {
  return makeRequest('get', `/articles/${articleId}/views/`);
};

// Get article like status
export const getArticleLikeStatus = async (articleId: string | number) => {
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

export const ApiService = {
  makeRequest,
  loginUser,
  SignupUser,
  submitAssessment,
  submitAudioAnalysis,
  updateUserProfile,
  getUserProfile,
  ChatService,
  getArticles,
  toggleArticleLike,
  trackArticleView,
  getArticleViews,
  getArticleLikeStatus,
};

export default api;

