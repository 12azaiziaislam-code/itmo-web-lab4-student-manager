import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import router from '../router';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

function goToLogin() {
  const current = router.currentRoute.value;
  if (current.name !== 'login') {
    router.push({ name: 'login', query: { redirect: current.fullPath, expired: '1' } });
  }
}

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const auth = useAuthStore();
    const isAuthRequest = original?.url?.startsWith('/auth/');

    if (error.response?.status !== 401 || isAuthRequest || !original) {
      return Promise.reject(error);
    }

    if (original._retry || !auth.refreshToken) {
      auth.logout();
      goToLogin();
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = auth.refresh().finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;
      original.headers.Authorization = `Bearer ${auth.accessToken}`;
      return api(original);
    } catch (refreshError) {
      auth.logout();
      goToLogin();
      return Promise.reject(error);
    }
  }
);

export default api;
