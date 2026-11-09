<template>
  <div class="auth-fullscreen">
    <div class="auth-card">
      <h2>Create Account</h2>
      <div v-if="serverError" class="alert-error">{{ serverError }}</div>

      <form @submit.prevent="handleRegister" novalidate>
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" v-model="form.username" type="text" placeholder="Enter username" autocomplete="username" />
          <small class="error-msg">{{ errors.username }}</small>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" placeholder="name@itmo.ru" autocomplete="email" />
          <small class="error-msg">{{ errors.email }}</small>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="form.password" type="password" placeholder="At least 6 characters" autocomplete="new-password" />
          <small class="error-msg">{{ errors.password }}</small>
        </div>

        <div class="form-group">
          <label for="role">Role</label>
          <select id="role" v-model="form.role">
            <option value="USER">USER (Read-only)</option>
            <option value="ADMIN">ADMIN (Full Access)</option>
          </select>
        </div>

        <div class="auth-actions">
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Registering...' : 'Register' }}
          </button>
          <RouterLink to="/login" class="btn btn-link text-center">Already have an account? Sign In</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useSubmit } from '../composables/useSubmit';
import { getErrorMessage } from '../utils/errors';

const auth = useAuthStore();
const router = useRouter();

const form = ref({ username: '', email: '', password: '', role: 'USER' });
const errors = ref({});
const serverError = ref('');

function validate() {
  errors.value = {};
  const username = form.value.username.trim();
  if (username.length < 3 || username.length > 50) {
    errors.value.username = 'Username must be from 3 to 50 characters';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email.trim())) {
    errors.value.email = 'Enter a valid email';
  }
  if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters';
  }
  return Object.keys(errors.value).length === 0;
}

const { isSubmitting, submit } = useSubmit(async () => {
  serverError.value = '';
  try {
    await auth.register({
      username: form.value.username.trim(),
      email: form.value.email.trim(),
      password: form.value.password,
      role: form.value.role
    });
    router.push('/');
  } catch (err) {
    serverError.value = getErrorMessage(err, 'Registration failed');
  }
});

function handleRegister() {
  if (validate()) submit();
}
</script>
