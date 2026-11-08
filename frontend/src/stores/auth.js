import { defineStore } from 'pinia';
import axios from 'axios';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role')
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

    setSession(data) {
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken ?? this.refreshToken;
      this.username = data.username ?? this.username;
      this.role = data.role ?? this.role;

      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('username', this.username);
      localStorage.setItem('role', this.role);
    },

    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.username = null;
      this.role = null;
      localStorage.clear();
    }
  }
});

