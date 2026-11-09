<template>
  <div class="pagination">
    <div>
      Rows per page:
      <select :value="limit" :disabled="disabled" @change="$emit('change-limit', Number($event.target.value))">
        <option v-for="n in [5, 10, 20, 50]" :key="n" :value="n">{{ n }}</option>
      </select>
      &nbsp; Total: {{ total }}
    </div>

    <div class="pagination-buttons">
      <button type="button" class="btn btn-secondary btn-sm" :disabled="page <= 1 || disabled" @click="$emit('change-page', page - 1)">
        Previous
      </button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button type="button" class="btn btn-secondary btn-sm" :disabled="page >= totalPages || disabled" @click="$emit('change-page', page + 1)">
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  total: { type: Number, default: 0 },
  limit: { type: Number, required: true },
  disabled: { type: Boolean, default: false }
});

defineEmits(['change-page', 'change-limit']);
</script>
