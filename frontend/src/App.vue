<template>
  <div class="layout">
    <header class="navbar" v-if="auth.isAuthenticated">
      <div class="brand">ITMO Student Manager</div>
      <nav class="links">
        <RouterLink to="/">Students</RouterLink>
        <RouterLink to="/profile">Profile</RouterLink>
      </nav>
      <div class="user-meta">
        <span>{{ auth.username }} (<strong>{{ auth.role }}</strong>)</span>
        <button class="btn-logout" @click="handleLogout">Logout</button>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: var(--surface-color);
  border-bottom: 1px solid var(--border);
}
.brand {
  font-weight: 700;
  font-size: 1.1rem;
}
.links a {
  margin-right: 16px;
  color: var(--text-muted);
}
.links a.router-link-active {
  color: var(--primary);
  font-weight: 600;
}
.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-logout {
  background-color: var(--border);
  color: var(--text-main);
}
.main-content {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>

