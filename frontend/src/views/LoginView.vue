<template>
  <div class="auth-fullscreen">
    <div class="auth-card">
      <h2>Sign In</h2>
      <div v-if="route.query.expired" class="alert-error">Session expired. Please sign in again.</div>
      <div v-if="serverError" class="alert-error">{{ serverError }}</div>

      <form @submit.prevent="handleLogin" novalidate>
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" v-model="form.username" type="text" placeholder="Enter username" autocomplete="username" />
          <small class="error-msg">{{ errors.username }}</small>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="form.password" type="password" placeholder="At least 6 characters" autocomplete="current-password" />
          <small class="error-msg">{{ errors.password }}</small>
        </div>

        <div class="auth-actions">
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Logging in...' : 'Login' }}
          </button>
          <RouterLink to="/register" class="btn btn-link text-center">Need an account? Register</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useSubmit } from '../composables/useSubmit';
import { getErrorMessage } from '../utils/errors';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = ref({ username: '', password: '' });
const errors = ref({});
const serverError = ref('');

function validate() {
  errors.value = {};
  if (!form.value.username.trim()) errors.value.username = 'Username is required';
  if (!form.value.password) errors.value.password = 'Password is required';
  return Object.keys(errors.value).length === 0;
}

const { isSubmitting, submit } = useSubmit(async () => {
  serverError.value = '';
  try {
    await auth.login({ username: form.value.username.trim(), password: form.value.password });
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    router.push(redirect.startsWith('/') ? redirect : '/');
  } catch (err) {
    serverError.value = getErrorMessage(err, 'Invalid credentials');
  }
});

function handleLogin() {
  if (validate()) submit();
}
</script>
