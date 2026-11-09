<template>
  <template v-if="isOpen">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal">
      <h3>Student Dossier</h3>

      <p v-if="loading">Loading...</p>
      <div v-else-if="error" class="alert-error">{{ error }}</div>

      <template v-else-if="student">
        <p><strong>Full Name:</strong> {{ student.fullName }}</p>
        <p><strong>Group:</strong> {{ student.group }}</p>
        <p><strong>ISU Number:</strong> {{ student.isuId }}</p>
        <p><strong>Dormitory:</strong> {{ student.dormitoryNumber }}</p>
        <p><strong>Room Number:</strong> {{ student.room }}</p>
        <p><strong>Accommodation Period:</strong> {{ formatDate(student.accommodationPeriod) }}</p>
        <p><strong>Foreign Student:</strong> {{ student.isInternational ? 'Yes' : 'No' }}</p>
        <p><strong>Notes:</strong> {{ student.notes || '-' }}</p>
      </template>

      <div class="modal-buttons">
        <button v-if="isAdmin && student" type="button" class="btn btn-primary" @click="$emit('edit', student)">Edit</button>
        <button type="button" class="btn btn-secondary" @click="$emit('close')">Close</button>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import studentService from '../services/studentService';
import { fromRequest } from '../utils/rx';
import { getErrorMessage } from '../utils/errors';
import { formatDate } from '../utils/format';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  isuId: { type: String, default: null },
  isAdmin: { type: Boolean, default: false }
});

defineEmits(['close', 'edit']);

const student = ref(null);
const loading = ref(false);
const error = ref('');
let subscription = null;

watch(
  () => [props.isOpen, props.isuId],
  ([open, isuId]) => {
    subscription?.unsubscribe();
    student.value = null;
    error.value = '';
    loading.value = false;
    if (!open || !isuId) return;

    loading.value = true;
    subscription = fromRequest((signal) => studentService.getStudentByIsu(isuId, signal)).subscribe({
      next: (data) => {
        student.value = data;
        loading.value = false;
      },
      error: (err) => {
        error.value = err.response?.status === 404
          ? 'Student not found (maybe it was deleted)'
          : getErrorMessage(err, 'Could not load student');
        loading.value = false;
      }
    });
  }
);

onUnmounted(() => subscription?.unsubscribe());
</script>
