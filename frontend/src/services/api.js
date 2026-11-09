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

function sessionExpired() {
  const auth = useAuthStore();
  auth.logout();
  if (router.currentRoute.value.name !== 'login') {
    router.push({ name: 'login', query: { expired: '1' } });
  }
}

let refreshing = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const auth = useAuthStore();

    if (error.response?.status !== 401 || request.url.startsWith('/auth/')) {
      return Promise.reject(error);
    }

    if (request._retry || !auth.refreshToken) {
      sessionExpired();
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      if (!refreshing) {
        refreshing = auth.refresh().finally(() => (refreshing = null));
      }
      await refreshing;
      request.headers.Authorization = `Bearer ${auth.accessToken}`;
      return api(request);
    } catch (e) {
      sessionExpired();
      return Promise.reject(error);
    }
  }
);

export default api;
