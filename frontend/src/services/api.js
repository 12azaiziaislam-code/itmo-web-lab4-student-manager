import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import router from '../router';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// Attach authorization header
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

// Silent token refresh on 401
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const auth = useAuthStore();
    const isAuthRequest = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && !original._retry && auth.refreshToken && !isAuthRequest) {
      original._retry = true;
      try {
        refreshPromise ??= auth.refresh().finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        original.headers.Authorization = `Bearer ${auth.accessToken}`;
        return api(original);
      } catch (refreshError) {
        auth.logout();
        if (router.currentRoute.value.name !== 'login') {
          router.push({ name: 'login' });
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

