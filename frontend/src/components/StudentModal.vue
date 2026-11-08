<template>
  <div class="modal-backdrop" v-if="isOpen" @click.self="handleClose">
    <div class="modal-card">
      <div class="modal-header">
        <h3>{{ isEditMode ? 'Edit Student' : 'Add New Student' }}</h3>
        <button class="btn-close" @click="handleClose">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-grid">
          <!-- ISU ID -->
          <div class="form-group">
            <label for="isuId">ISU ID <span class="required">*</span></label>
            <input
              id="isuId"
              v-model="form.isuId"
              type="text"
              maxlength="6"
              placeholder="e.g. 470449"
              :disabled="isEditMode"
              :class="{ 'has-error': errors.isuId }"
            />
            <small class="error-msg" v-if="errors.isuId">{{ errors.isuId }}</small>
            <small class="hint-msg" v-else-if="!isEditMode">Exactly 6 digits</small>
          </div>

          <!-- Full Name -->
          <div class="form-group">
            <label for="fullName">Full Name <span class="required">*</span></label>
            <input
              id="fullName"
              v-model="form.fullName"
              type="text"
              maxlength="50"
              placeholder="Student Full Name"
              :class="{ 'has-error': errors.fullName }"
            />
            <small class="error-msg" v-if="errors.fullName">{{ errors.fullName }}</small>
          </div>

          <!-- Student Group -->
          <div class="form-group">
            <label for="group">Group <span class="required">*</span></label>
            <input
              id="group"
              v-model="form.group"
              type="text"
              maxlength="5"
              placeholder="e.g. P3278"
              :class="{ 'has-error': errors.group }"
            />
            <small class="error-msg" v-if="errors.group">{{ errors.group }}</small>
            <small class="hint-msg" v-else>Format: Letter + 4 digits (e.g. P3278)</small>
          </div>

          <!-- Dormitory Number -->
          <div class="form-group">
            <label for="dormitoryNumber">Dormitory # <span class="required">*</span></label>
            <input
              id="dormitoryNumber"
              v-model.number="form.dormitoryNumber"
              type="number"
              min="1"
              max="99"
              placeholder="1 - 99"
              :class="{ 'has-error': errors.dormitoryNumber }"
            />
            <small class="error-msg" v-if="errors.dormitoryNumber">{{ errors.dormitoryNumber }}</small>
          </div>

          <!-- Room Number -->
          <div class="form-group">
            <label for="room">Room <span class="required">*</span></label>
            <input
              id="room"
              v-model.number="form.room"
              type="number"
              min="1"
              max="9999"
              placeholder="1 - 9999"
              :class="{ 'has-error': errors.room }"
            />
            <small class="error-msg" v-if="errors.room">{{ errors.room }}</small>
          </div>

          <!-- Accommodation Period -->
          <div class="form-group">
            <label for="accommodationPeriod">Accommodation Date <span class="required">*</span></label>
            <input
              id="accommodationPeriod"
              v-model="form.accommodationPeriod"
              type="date"
              :class="{ 'has-error': errors.accommodationPeriod }"
            />
            <small class="error-msg" v-if="errors.accommodationPeriod">{{ errors.accommodationPeriod }}</small>
          </div>
        </div>

        <!-- International Student Checkbox -->
        <div class="form-checkbox">
          <label>
            <input v-model="form.isInternational" type="checkbox" />
            <span>International Student</span>
          </label>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label for="notes">Notes (optional)</label>
          <textarea
            id="notes"
            v-model="form.notes"
            maxlength="150"
            rows="3"
            placeholder="Additional information or requests (max 150 chars)"
            :class="{ 'has-error': errors.notes }"
          ></textarea>
          <div class="char-count">{{ form.notes?.length || 0 }} / 150</div>
          <small class="error-msg" v-if="errors.notes">{{ errors.notes }}</small>
        </div>

        <p class="server-error" v-if="serverError">{{ serverError }}</p>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="handleClose" :disabled="isSubmitting">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Student' : 'Create Student') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStudentStore } from '../stores/students';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  student: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);
const studentStore = useStudentStore();

const isEditMode = computed(() => !!props.student);
const isSubmitting = ref(false);
const serverError = ref('');
const errors = ref({});

const form = ref({
  isuId: '',
  fullName: '',
  group: '',
  dormitoryNumber: null,
  room: null,
  accommodationPeriod: '',
  isInternational: false,
  notes: ''
});

watch(
  () => props.student,
  (newVal) => {
    if (newVal) {
      form.value = {
        isuId: newVal.isuId || '',
        fullName: newVal.fullName || '',
        group: newVal.group || '',
        dormitoryNumber: newVal.dormitoryNumber ?? null,
        room: newVal.room ?? null,
        accommodationPeriod: newVal.accommodationPeriod || '',
        isInternational: Boolean(newVal.isInternational),
        notes: newVal.notes || ''
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  form.value = {
    isuId: '',
    fullName: '',
    group: '',
    dormitoryNumber: null,
    room: null,
    accommodationPeriod: new Date().toISOString().split('T')[0],
    isInternational: false,
    notes: ''
  };
  errors.value = {};
  serverError.value = '';
}

function validate() {
  errors.value = {};

  if (!isEditMode.value) {
    if (!form.value.isuId || !/^\d{6}$/.test(form.value.isuId.trim())) {
      errors.value.isuId = 'ISU ID must be exactly 6 digits';
    }
  }

  if (!form.value.fullName || !form.value.fullName.trim()) {
    errors.value.fullName = 'Full Name is required';
  } else if (form.value.fullName.trim().length > 50) {
    errors.value.fullName = 'Max 50 characters allowed';
  }

  if (!form.value.group || !/^[A-Z]\d{4}$/.test(form.value.group.trim().toUpperCase())) {
    errors.value.group = 'Group must match format like P3278';
  }

  if (form.value.dormitoryNumber === null || form.value.dormitoryNumber === '' || isNaN(form.value.dormitoryNumber)) {
    errors.value.dormitoryNumber = 'Dormitory number is required';
  } else if (form.value.dormitoryNumber < 1 || form.value.dormitoryNumber > 99) {
    errors.value.dormitoryNumber = 'Dormitory must be between 1 and 99';
  }

  if (form.value.room === null || form.value.room === '' || isNaN(form.value.room)) {
    errors.value.room = 'Room number is required';
  } else if (form.value.room < 1 || form.value.room > 9999) {
    errors.value.room = 'Room must be between 1 and 9999';
  }

  if (!form.value.accommodationPeriod) {
    errors.value.accommodationPeriod = 'Accommodation period date is required';
  }

  if (form.value.notes && form.value.notes.length > 150) {
    errors.value.notes = 'Notes cannot exceed 150 characters';
  }

  return Object.keys(errors.value).length === 0;
}

async function handleSubmit() {
  if (isSubmitting.value || !validate()) return;

  isSubmitting.value = true;
  serverError.value = '';

  const payload = {
    isuId: form.value.isuId.trim(),
    fullName: form.value.fullName.trim(),
    group: form.value.group.trim().toUpperCase(),
    dormitoryNumber: Number(form.value.dormitoryNumber),
    room: Number(form.value.room),
    accommodationPeriod: form.value.accommodationPeriod,
    isInternational: Boolean(form.value.isInternational),
    notes: form.value.notes ? form.value.notes.trim() : null
  };

  try {
    if (isEditMode.value) {
      await studentStore.updateStudent(props.student.isuId, payload);
    } else {
      await studentStore.createStudent(payload);
    }
    emit('saved');
    handleClose();
  } catch (err) {
    serverError.value = err.response?.data?.message || 'Error occurred while saving student';
  } finally {
    isSubmitting.value = false;
  }
}

function handleClose() {
  resetForm();
  emit('close');
}
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
  max-width: 580px;
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
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
}
.modal-header h3 {
  font-size: 1.2rem;
  color: var(--text-main);
}
.btn-close {
  background: transparent;
  font-size: 1.5rem;
  color: var(--text-muted);
  padding: 0 6px;
  line-height: 1;
}
.btn-close:hover {
  color: var(--text-main);
}
.modal-form {
  padding: 24px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
@media (max-width: 560px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
.form-group {
  margin-bottom: 14px;
}
label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}
.required {
  color: var(--danger);
}
input, textarea {
  width: 100%;
  padding: 9px 12px;
  background-color: var(--bg-color);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-main);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}
input:focus, textarea:focus {
  border-color: var(--primary);
}
input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: rgba(255, 255, 255, 0.05);
}
input.has-error, textarea.has-error {
  border-color: var(--danger);
}
.error-msg {
  color: var(--danger);
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
}
.hint-msg {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-top: 3px;
  display: block;
}
.form-checkbox {
  margin: 8px 0 16px;
}
.form-checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-main);
  cursor: pointer;
}
.form-checkbox input {
  width: auto;
}
.char-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: right;
  margin-top: 2px;
}
.server-error {
  color: var(--danger);
  margin-bottom: 12px;
  text-align: center;
  font-size: 0.9rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.btn-primary {
  background-color: var(--primary);
  color: white;
}
.btn-primary:hover {
  background-color: var(--primary-hover);
}
.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--border);
  color: var(--text-main);
}
.btn-secondary:hover {
  background-color: var(--border);
}
</style>

