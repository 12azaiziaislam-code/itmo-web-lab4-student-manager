<template>
  <div v-if="auth.isAuthenticated" class="container">
    <header class="app-header">
      <div>
        <h1>Student Management System</h1>
        <div class="user-badge">
          Logged in as: <strong>{{ auth.username }}</strong> ({{ auth.role }})
        </div>
        <nav class="nav-links">
          <RouterLink to="/">Students</RouterLink>
          <RouterLink to="/profile">Profile</RouterLink>
        </nav>
      </div>
      <button type="button" class="btn btn-danger" @click="handleLogout">Logout</button>
    </header>

    <RouterView />
  </div>

  <RouterView v-else />
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>
