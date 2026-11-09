<template>
  <div class="card">
    <h3>User Profile</h3>

    <p v-if="loading">Loading profile...</p>

    <div v-else-if="error">
      <div class="alert-error">{{ error }}</div>
      <button type="button" class="btn btn-secondary" @click="loadProfile">Try again</button>
    </div>

    <template v-else-if="auth.profile">
      <p><strong>ID:</strong> {{ auth.profile.id }}</p>
      <p><strong>Username:</strong> {{ auth.profile.username }}</p>
      <p><strong>Email:</strong> {{ auth.profile.email }}</p>
      <p><strong>Role:</strong> {{ auth.profile.role }}</p>
      <p>
        <strong>Access:</strong>
        {{ auth.isAdmin ? 'view, add, edit and delete students' : 'view students only' }}
      </p>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { getErrorMessage } from '../utils/errors';

const auth = useAuthStore();

const loading = ref(false);
const error = ref('');
let controller = null;

async function loadProfile() {
  controller?.abort();
  controller = new AbortController();
  loading.value = true;
  error.value = '';
  try {
    await auth.fetchProfile(controller.signal);
  } catch (err) {
    error.value = getErrorMessage(err, 'Could not load profile');
  } finally {
    loading.value = false;
  }
}

onMounted(loadProfile);
onUnmounted(() => controller?.abort());
</script>
