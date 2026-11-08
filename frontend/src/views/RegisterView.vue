<template>
  <div class="auth-card">
    <h2>Create Account</h2>
    <form @submit.prevent="handleRegister">
      <div class="field">
        <label>Username</label>
        <input v-model="form.username" type="text" placeholder="Username" />
        <small class="error" v-if="errors.username">{{ errors.username }}</small>
      </div>

      <div class="field">
        <label>Email</label>
        <input v-model="form.email" type="email" placeholder="Email" />
        <small class="error" v-if="errors.email">{{ errors.email }}</small>
      </div>

      <div class="field">
        <label>Password</label>
        <input v-model="form.password" type="password" placeholder="Password (min 6 chars)" />
        <small class="error" v-if="errors.password">{{ errors.password }}</small>
      </div>

      <div class="field">
        <label>Role</label>
        <select v-model="form.role">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <p class="server-error" v-if="serverError">{{ serverError }}</p>

      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? 'Registering...' : 'Register' }}
      </button>

      <p class="footer-text">
        Already registered? <RouterLink to="/login">Login here</RouterLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const form = ref({ username: '', email: '', password: '', role: 'USER' });
const errors = ref({});
const serverError = ref('');
const isSubmitting = ref(false);

function validate() {
  errors.value = {};
  if (!form.value.username.trim() || form.value.username.trim().length < 3) {
    errors.value.username = 'Username must be at least 3 characters';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) errors.value.email = 'Valid email is required';
  if (form.value.password.length < 6) errors.value.password = 'Password must be at least 6 characters';
  return Object.keys(errors.value).length === 0;
}

async function handleRegister() {
  if (isSubmitting.value || !validate()) return;

  isSubmitting.value = true;
  serverError.value = '';

  try {
    await auth.register(form.value);
    router.push('/');
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Registration failed';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.auth-card {
  max-width: 400px;
  margin: 40px auto;
  padding: 32px;
  background-color: var(--surface-color);
  border-radius: 8px;
  border: 1px solid var(--border);
}
h2 { margin-bottom: 24px; text-align: center; }
.field { margin-bottom: 16px; }
label { display: block; margin-bottom: 6px; color: var(--text-muted); font-size: 0.9rem; }
input, select {
  width: 100%;
  padding: 10px 12px;
  background-color: var(--bg-color);
  border: 1px solid var(--border);
  color: var(--text-main);
  border-radius: 6px;
}
option {
  background-color: var(--surface-color);
  color: var(--text-main);
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

