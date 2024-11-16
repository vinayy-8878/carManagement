import { create } from 'zustand';
import api from '../lib/axios';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),

  signup: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { 
        email: email.trim(), 
        password: password.trim() 
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { 
        email: email.trim(), 
        password: password.trim() 
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      const decoded = jwtDecode<{ userId: string }>(token);
      if (!decoded.userId) {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
        return;
      }
      set({ isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false });
    }
  },
}));