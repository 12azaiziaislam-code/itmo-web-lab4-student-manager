<template>
  <template v-if="isOpen">
    <div class="modal">
      <h3>{{ isEditMode ? 'Edit Student' : 'Add Student' }}</h3>
      <div v-if="serverError" class="alert-error">{{ serverError }}</div>

      <form @submit.prevent="handleSubmit" novalidate>
        <div class="form-group">
          <label for="fullName">Full Name *</label>
          <input id="fullName" v-model="form.fullName" type="text" maxlength="50" />
          <small v-if="errors.fullName" class="error-msg">{{ errors.fullName }}</small>
        </div>

        <div class="form-group">
          <label for="group">Group *</label>
          <input id="group" v-model="form.group" type="text" maxlength="5" />
          <small v-if="errors.group" class="error-msg">{{ errors.group }}</small>
        </div>

        <div class="form-group">
          <label for="isuId">ISU ID (6 digits) *</label>
          <input id="isuId" v-model="form.isuId" type="text" maxlength="6" :readonly="isEditMode" />
          <small v-if="errors.isuId" class="error-msg">{{ errors.isuId }}</small>
        </div>

        <div class="form-group">
          <label for="dormitoryNumber">Dormitory Number (1-99) *</label>
          <input id="dormitoryNumber" v-model.number="form.dormitoryNumber" type="number" min="1" max="99" />
          <small v-if="errors.dormitoryNumber" class="error-msg">{{ errors.dormitoryNumber }}</small>
        </div>

        <div class="form-group">
          <label for="room">Room Number (1-9999) *</label>
          <input id="room" v-model.number="form.room" type="number" min="1" max="9999" />
          <small v-if="errors.room" class="error-msg">{{ errors.room }}</small>
        </div>

        <div class="form-group">
          <label for="accommodationPeriod">Accommodation Period *</label>
          <input id="accommodationPeriod" v-model="form.accommodationPeriod" type="date" min="2020-01-01" max="2035-12-31" />
          <small v-if="errors.accommodationPeriod" class="error-msg">{{ errors.accommodationPeriod }}</small>
        </div>

        <div class="form-group checkbox-group">
          <label for="isInternational">
            <input id="isInternational" v-model="form.isInternational" type="checkbox" />
            <span>International Student</span>
          </label>
        </div>

        <div class="form-group">
          <label for="notes">Notes (Max 150 characters)</label>
          <textarea id="notes" v-model="form.notes" rows="3" maxlength="150"></textarea>
          <small v-if="errors.notes" class="error-msg">{{ errors.notes }}</small>
        </div>

        <div class="modal-buttons">
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" class="btn btn-secondary" :disabled="isSubmitting" @click="handleClose">Cancel</button>
        </div>
      </form>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStudentStore } from '../stores/students';
import { useSubmit } from '../composables/useSubmit';
import { getErrorMessage } from '../utils/errors';

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
const serverError = ref('');
const errors = ref({});
const form = ref(emptyForm());

function emptyForm() {
  return {
    isuId: '',
    fullName: '',
    group: '',
    dormitoryNumber: null,
    room: null,
    accommodationPeriod: '',
    isInternational: false,
    notes: ''
  };
}

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;
    errors.value = {};
    serverError.value = '';
    const s = props.student;
    form.value = s
      ? {
          isuId: s.isuId || '',
          fullName: s.fullName || '',
          group: s.group || '',
          dormitoryNumber: s.dormitoryNumber ?? null,
          room: s.room ?? null,
          accommodationPeriod: s.accommodationPeriod || '',
          isInternational: Boolean(s.isInternational),
          notes: s.notes || ''
        }
      : emptyForm();
  },
  { immediate: true }
);

function isEmpty(value) {
  return value === null || value === '' || value === undefined || Number.isNaN(value);
}

function validate() {
  const f = form.value;
  const e = {};

  if (!isEditMode.value && !/^\d{6}$/.test(f.isuId.trim())) {
    e.isuId = 'ISU ID must be exactly 6 digits';
  }

  if (!f.fullName.trim()) {
    e.fullName = 'Full name is required';
  } else if (!/^[A-Za-zА-Яа-яЁё\s-]+$/.test(f.fullName.trim())) {
    e.fullName = 'Only letters, spaces and hyphens';
  }

  if (!/^[A-Z]\d{4}$/.test(f.group.trim().toUpperCase())) {
    e.group = 'Group must look like P3278';
  }

  if (isEmpty(f.dormitoryNumber)) {
    e.dormitoryNumber = 'Dormitory number is required';
  } else if (!Number.isInteger(f.dormitoryNumber) || f.dormitoryNumber < 1 || f.dormitoryNumber > 99) {
    e.dormitoryNumber = 'Dormitory must be a whole number from 1 to 99';
  }

  if (isEmpty(f.room)) {
    e.room = 'Room number is required';
  } else if (!Number.isInteger(f.room) || f.room < 1 || f.room > 9999) {
    e.room = 'Room must be a whole number from 1 to 9999';
  }

  if (!f.accommodationPeriod) {
    e.accommodationPeriod = 'Accommodation date is required';
  } else if (f.accommodationPeriod < '2020-01-01' || f.accommodationPeriod > '2035-12-31') {
    e.accommodationPeriod = 'Date must be between 2020 and 2035';
  }

  if (f.notes && f.notes.length > 150) {
    e.notes = 'Notes can be max 150 characters';
  }

  errors.value = e;
  return Object.keys(e).length === 0;
}

const { isSubmitting, submit } = useSubmit(async () => {
  serverError.value = '';
  const f = form.value;
  const payload = {
    isuId: f.isuId.trim(),
    fullName: f.fullName.trim(),
    group: f.group.trim().toUpperCase(),
    dormitoryNumber: f.dormitoryNumber,
    room: f.room,
    accommodationPeriod: f.accommodationPeriod,
    isInternational: f.isInternational,
    notes: f.notes.trim() || null
  };

  try {
    if (isEditMode.value) {
      await studentStore.updateStudent(props.student.isuId, payload);
    } else {
      await studentStore.createStudent(payload);
    }
    emit('saved');
  } catch (err) {
    serverError.value = getErrorMessage(err, 'Could not save student');
  }
});

function handleSubmit() {
  if (validate()) submit();
}

function handleClose() {
  if (!isSubmitting.value) emit('close');
}
</script>
