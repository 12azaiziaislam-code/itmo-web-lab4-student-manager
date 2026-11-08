<template>
  <div class="modal-backdrop" v-if="isOpen" @click.self="$emit('cancel')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="btn-close" @click="$emit('cancel')">&times;</button>
      </div>

      <div class="modal-body">
        <p>{{ message }}</p>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" @click="$emit('cancel')">
          Cancel
        </button>
        <button
          type="button"
          :class="isDanger ? 'btn-danger' : 'btn-primary'"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  isDanger: {
    type: Boolean,
    default: true
  }
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}
.modal-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border);
  border-radius: 10px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.modal-header h3 {
  font-size: 1.1rem;
  color: var(--text-main);
}
.btn-close {
  background: transparent;
  font-size: 1.4rem;
  color: var(--text-muted);
  padding: 0 4px;
}
.btn-close:hover {
  color: var(--text-main);
}
.modal-body {
  padding: 20px;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}
.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--border);
  color: var(--text-main);
}
.btn-secondary:hover {
  background-color: var(--border);
}
.btn-danger {
  background-color: var(--danger);
  color: white;
}
.btn-danger:hover {
  opacity: 0.9;
}
.btn-primary {
  background-color: var(--primary);
  color: white;
}
.btn-primary:hover {
  background-color: var(--primary-hover);
}
</style>

