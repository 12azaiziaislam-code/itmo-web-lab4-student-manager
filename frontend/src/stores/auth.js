import { defineStore } from 'pinia';
import axios from 'axios';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role'),
    profile: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isAdmin: (state) => state.role === 'ADMIN'
  },

  actions: {
    async login(credentials) {
      const { data } = await api.post('/auth/login', credentials);
      this.setSession(data);
    },

    async register(userData) {
      const { data } = await api.post('/auth/register', userData);
      this.setSession(data);
    },

    async refresh() {
      const { data } = await axios.post('/api/auth/refresh', {
        refreshToken: this.refreshToken
      });
      this.setSession(data);
    },

    async fetchProfile(signal) {
      const { data } = await api.get('/users/me', { signal });
      this.profile = data;
      this.role = data.role;
      localStorage.setItem('role', data.role);
    },

    setSession(data) {
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.username = data.username;
      this.role = data.role;

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
    },

    logout() {
      if (this.refreshToken) {
        axios.post('/api/auth/logout', { refreshToken: this.refreshToken }).catch(() => {});
      }
      this.accessToken = null;
      this.refreshToken = null;
      this.username = null;
      this.role = null;
      this.profile = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    }
  }
});
