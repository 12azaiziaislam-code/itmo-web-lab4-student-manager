<template>
  <div class="profile-card">
    <h2>User Profile</h2>
    <div class="info-row">
      <span>Username:</span>
      <strong>{{ auth.username }}</strong>
    </div>
    <div class="info-row">
      <span>Role:</span>
      <span class="badge" :class="auth.role">{{ auth.role }}</span>
    </div>
    <div class="info-row">
      <span>Access Token Status:</span>
      <span class="token-status">Active (Stored in LocalStorage)</span>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
const auth = useAuthStore();
</script>

<style scoped>
.profile-card {
  max-width: 500px;
  margin: 40px auto;
  padding: 28px;
  background-color: var(--surface-color);
  border-radius: 8px;
  border: 1px solid var(--border);
}
h2 { margin-bottom: 24px; }
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 700;
}
.badge.ADMIN { background-color: var(--primary); color: white; }
.badge.USER { background-color: var(--border); color: var(--text-main); }
.token-status { color: #10b981; font-weight: 500; }
</style>

