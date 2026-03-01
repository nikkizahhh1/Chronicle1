import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ApiResponse } from './api';

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  user_id: string;
  email: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  email: string;
  id_token: string;
  access_token: string;
  refresh_token: string;
}

export interface ConfirmEmailRequest {
  email: string;
  code: string;
}

export interface ConfirmEmailResponse {
  message: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface ResendCodeResponse {
  message: string;
}

export const authService = {
  /**
   * Sign up a new user
   * Note: User must verify email before logging in
   */
  signup: async (data: SignupRequest): Promise<ApiResponse<SignupResponse>> => {
    return api.post<SignupResponse>('/auth/signup', data);
  },

  /**
   * Log in an existing user
   * Returns tokens for authenticated requests
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<LoginResponse>('/auth/login', data);

    // Store tokens if login successful
    if (response.success && response.data) {
      await AsyncStorage.setItem('user_id', response.data.user_id);
      await AsyncStorage.setItem('email', response.data.email);
      await AsyncStorage.setItem('id_token', response.data.id_token);
      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
    }

    return response;
  },

  /**
   * Confirm email with verification code
   */
  confirmEmail: async (data: ConfirmEmailRequest): Promise<ApiResponse<ConfirmEmailResponse>> => {
    return api.post<ConfirmEmailResponse>('/auth/confirm', data);
  },

  /**
   * Resend verification code
   */
  resendCode: async (data: ResendCodeRequest): Promise<ApiResponse<ResendCodeResponse>> => {
    return api.post<ResendCodeResponse>('/auth/resend', data);
  },

  /**
   * Log out user (clear tokens)
   */
  logout: async () => {
    await AsyncStorage.removeItem('user_id');
    await AsyncStorage.removeItem('email');
    await AsyncStorage.removeItem('id_token');
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },

  /**
   * Get current user info from AsyncStorage
   */
  getCurrentUser: async () => {
    const user_id = await AsyncStorage.getItem('user_id');
    const email = await AsyncStorage.getItem('email');
    return { user_id, email };
  },
};
