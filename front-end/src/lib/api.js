// API configuration and service functions for Django backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('exammaster_user') || '{}');
  return user.access_token || user.token;
};

// Ensure we have a valid API_BASE_URL
if (!API_BASE_URL) {
  console.warn('API_BASE_URL is not set. Using default: http://localhost:8000/api');
}

console.log('API Base URL:', API_BASE_URL);

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}, retry = true) => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    // If unauthorized and we can retry, try to refresh the token
    if (response.status === 401 && retry) {
      try {
        const user = JSON.parse(localStorage.getItem('exammaster_user') || '{}');
        if (user.refresh_token) {
          // Try to refresh the token
          await authAPI.refreshToken(user.refresh_token);
          // Retry the original request with the new token
          return makeRequest(url, options, false); // Don't retry again to avoid infinite loops
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, clear the user data and redirect to login
        localStorage.removeItem('exammaster_user');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || errorData.error || `HTTP ${response.status}`;
      console.error('API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    // For empty responses (like 204 No Content)
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Login user
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Login error:', data);
      // Handle Django's non_field_errors format
      const errorMessage = data.detail || 
                          data.error || 
                          (data.non_field_errors && data.non_field_errors[0]) ||
                          'Login failed. Please check your credentials and try again.';
      throw new Error(errorMessage);
    }

    // Store the user data and tokens
    const userData = {
      ...data.user,
      access_token: data.access,
      refresh_token: data.refresh
    };
    
    localStorage.setItem('exammaster_user', JSON.stringify(userData));
    return userData;
  },

  // Register user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        password_confirm: userData.password,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        role: userData.role || 'student',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Registration error:', data);
      // Handle Django's error formats
      let errorMessage = 'Registration failed. Please try again.';
      if (data.detail) {
        errorMessage = data.detail;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.non_field_errors && data.non_field_errors[0]) {
        errorMessage = data.non_field_errors[0];
      } else if (typeof data === 'object') {
        // Handle field-specific errors
        const firstError = Object.values(data).find(val => Array.isArray(val) && val.length > 0);
        if (firstError) {
          errorMessage = firstError[0];
        }
      }
      throw new Error(errorMessage);
    }

    // Automatically log in the user after successful registration
    if (data.user && data.access) {
      const userData = {
        ...data.user,
        access_token: data.access,
        refresh_token: data.refresh
      };
      
      localStorage.setItem('exammaster_user', JSON.stringify(userData));
      return userData;
    }
    
    return data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await makeRequest('/auth/profile/');
    // Update the stored user data with the latest profile
    const currentUser = JSON.parse(localStorage.getItem('exammaster_user') || '{}');
    const updatedUser = { ...currentUser, ...response };
    localStorage.setItem('exammaster_user', JSON.stringify(updatedUser));
    return response;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await makeRequest('/auth/profile/update/', {
      method: 'PUT',
      body: JSON.stringify({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
      }),
    });
    
    // Update the stored user data
    const currentUser = JSON.parse(localStorage.getItem('exammaster_user') || '{}');
    const updatedUser = { ...currentUser, ...response };
    localStorage.setItem('exammaster_user', JSON.stringify(updatedUser));
    
    return response;
  },

  // Logout user
  logout: async () => {
    try {
      const user = JSON.parse(localStorage.getItem('exammaster_user') || '{}');
      if (user.refresh_token) {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access_token}`,
          },
          body: JSON.stringify({ refresh: user.refresh_token }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with clearing local storage even if logout API fails
    } finally {
      // Clear user data from local storage
      localStorage.removeItem('exammaster_user');
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    
    // Update the stored tokens
    const currentUser = JSON.parse(localStorage.getItem('exammaster_user') || '{}');
    const updatedUser = {
      ...currentUser,
      access_token: data.access,
      refresh_token: data.refresh || currentUser.refresh_token,
    };
    
    localStorage.setItem('exammaster_user', JSON.stringify(updatedUser));
    
    return data;
  },

  requestPasswordReset: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/password-reset/request/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Password reset request failed');
    }

    return response.json();
  },

  confirmPasswordReset: async (email, resetCode, newPassword, confirmPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/password-reset/confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reset_code: resetCode,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Password reset failed');
    }

    return response.json();
  },
};

// Questions API
export const questionsAPI = {
  // Get all questions
  getQuestions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/questions/${queryString ? `?${queryString}` : ''}`);
  },

  // Get question by ID
  getQuestion: (id) => makeRequest(`/questions/${id}/`),

  // Create question
  createQuestion: (questionData) => makeRequest('/questions/', {
    method: 'POST',
    body: JSON.stringify(questionData),
  }),

  // Update question
  updateQuestion: (id, questionData) => makeRequest(`/questions/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(questionData),
  }),

  // Delete question
  deleteQuestion: (id) => makeRequest(`/questions/${id}/`, {
    method: 'DELETE',
  }),

  // Get subjects
  getSubjects: () => makeRequest('/questions/subjects/'),

  // Create subject
  createSubject: (subjectData) => makeRequest('/questions/subjects/', {
    method: 'POST',
    body: JSON.stringify(subjectData),
  }),
};

// Exams API
export const examsAPI = {
  // Get all exams (for teachers/admins)
  getExams: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/exams/${queryString ? `?${queryString}` : ''}`);
  },

  // Get available exams (for students)
  getAvailableExams: () => makeRequest('/exams/available/'),

  // Get exam by ID
  getExam: (id) => makeRequest(`/exams/${id}/`),

  // Get exam for taking (students)
  getExamForTaking: (id) => makeRequest(`/exams/take/${id}/`),

  // Create exam
  createExam: (examData) => makeRequest('/exams/', {
    method: 'POST',
    body: JSON.stringify(examData),
  }),

  // Update exam
  updateExam: (id, examData) => makeRequest(`/exams/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(examData),
  }),

  // Delete exam
  deleteExam: (id) => makeRequest(`/exams/${id}/`, {
    method: 'DELETE',
  }),

  // Publish exam
  publishExam: (id) => makeRequest(`/exams/${id}/publish/`, {
    method: 'POST',
  }),

  // Unpublish exam
  unpublishExam: (id) => makeRequest(`/exams/${id}/unpublish/`, {
    method: 'POST',
  }),
};

// Submissions API
export const submissionsAPI = {
  // Submit exam
  submitExam: (submissionData) => makeRequest('/submissions/submit/', {
    method: 'POST',
    body: JSON.stringify(submissionData),
  }),

  // Get student results
  getStudentResults: () => makeRequest('/submissions/my-results/'),

  // Get submission result
  getSubmissionResult: (id) => makeRequest(`/submissions/result/${id}/`),

  // Get all submissions (for teachers/admins)
  getSubmissions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/submissions/${queryString ? `?${queryString}` : ''}`);
  },
};

// Users API (for admins)
export const usersAPI = {
  // Get all users
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return makeRequest(`/auth/users/${queryString ? `?${queryString}` : ''}`);
  },

  // Get user by ID
  getUser: (id) => makeRequest(`/auth/users/${id}/`),

  // Create user
  createUser: (userData) => makeRequest('/auth/users/', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // Update user
  updateUser: (id, userData) => makeRequest(`/auth/users/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  // Delete user
  deleteUser: (id) => makeRequest(`/auth/users/${id}/`, {
    method: 'DELETE',
  }),
};

export default {
  authAPI,
  questionsAPI,
  examsAPI,
  submissionsAPI,
  usersAPI,
}; 