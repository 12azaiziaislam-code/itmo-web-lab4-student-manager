<template>
  <template v-if="isOpen">
    <div class="modal-overlay" @click="!busy && $emit('cancel')"></div>
    <div class="modal">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="modal-buttons">
        <button type="button" :class="['btn', isDanger ? 'btn-danger' : 'btn-primary']" :disabled="busy" @click="$emit('confirm')">
          {{ busy ? 'Please wait...' : confirmText }}
        </button>
        <button type="button" class="btn btn-secondary" :disabled="busy" @click="$emit('cancel')">Cancel</button>
      </div>
    </div>
  </template>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: 'Are you sure?' },
  confirmText: { type: String, default: 'OK' },
  isDanger: { type: Boolean, default: true },
  busy: { type: Boolean, default: false }
});

defineEmits(['confirm', 'cancel']);
</script>
