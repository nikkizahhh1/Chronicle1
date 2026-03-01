import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - configure this based on your deployed backend
// For local development with serverless offline, use your computer's IP:
// const API_BASE_URL = 'http://10.0.0.183:3000/dev';

// For deployed backend, use your AWS API Gateway URL:
// const API_BASE_URL = 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev';

// TEMPORARY: Empty URL to use mock data until backend is deployed
const API_BASE_URL = '';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // TEMPORARY: Skip backend calls if no API_BASE_URL is set
  if (!API_BASE_URL) {
    console.log('⚠️ No backend configured - using mock mode');
    return {
      success: false,
      error: 'Backend not configured yet. Deploy your backend first!',
    };
  }

  try {
    const token = await AsyncStorage.getItem('access_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'An error occurred',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: any) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: any) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE' }),
};
