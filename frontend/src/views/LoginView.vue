<template>
  <div class="auth-card">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="field">
        <label>Username</label>
        <input v-model="form.username" type="text" placeholder="Enter username" />
        <small class="error" v-if="errors.username">{{ errors.username }}</small>
      </div>

      <div class="field">
        <label>Password</label>
        <input v-model="form.password" type="password" placeholder="Enter password" />
        <small class="error" v-if="errors.password">{{ errors.password }}</small>
      </div>

      <p class="server-error" v-if="serverError">{{ serverError }}</p>

      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? 'Logging in...' : 'Sign In' }}
      </button>

      <p class="footer-text">
        Don't have an account? <RouterLink to="/register">Register here</RouterLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = ref({ username: '', password: '' });
const errors = ref({});
const serverError = ref('');
const isSubmitting = ref(false);

function validate() {
  errors.value = {};
  if (!form.value.username.trim()) errors.value.username = 'Username is required';
  if (!form.value.password) errors.value.password = 'Password is required';
  return Object.keys(errors.value).length === 0;
}

async function handleLogin() {
  if (isSubmitting.value || !validate()) return;

  isSubmitting.value = true;
  serverError.value = '';

  try {
    await auth.login(form.value);
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Invalid credentials or server error';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.auth-card {
  max-width: 400px;
  margin: 60px auto;
  padding: 32px;
  background-color: var(--surface-color);
  border-radius: 8px;
  border: 1px solid var(--border);
}
h2 { margin-bottom: 24px; text-align: center; }
.field { margin-bottom: 16px; }
label { display: block; margin-bottom: 6px; color: var(--text-muted); font-size: 0.9rem; }
input {
  width: 100%;
  padding: 10px 12px;
  background-color: var(--bg-color);
  border: 1px solid var(--border);
  color: var(--text-main);
  border-radius: 6px;
}
.btn-primary {
  width: 100%;
  background-color: var(--primary);
  color: white;
  padding: 10px;
  margin-top: 8px;
}
.error { color: var(--danger); font-size: 0.8rem; margin-top: 4px; display: block; }
.server-error { color: var(--danger); margin-bottom: 12px; text-align: center; }
.footer-text { margin-top: 16px; text-align: center; font-size: 0.9rem; color: var(--text-muted); }
</style>

