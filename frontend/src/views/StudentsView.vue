<template>
  <div>
    <StudentFilters
      :initial="studentStore.filters"
      @search="search"
      @reset="resetFilters"
    />

    <div
      v-if="studentStore.notification"
      :class="studentStore.notification.type === 'error' ? 'alert-error' : 'alert-success'"
    >
      {{ studentStore.notification.message }}
    </div>

    <div v-if="studentStore.error" class="alert-error">
      {{ studentStore.error }}
      <button type="button" class="btn btn-link" @click="reload">Retry</button>
    </div>

    <button v-if="authStore.isAdmin" type="button" class="btn btn-success" style="margin-bottom: 15px" @click="openAddModal">
      + Add Student
    </button>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" class="sortable" @click="sortBy(col.key)">
              {{ col.title }} {{ sortIcon(col.key) }}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="studentStore.loading && studentStore.students.length === 0">
            <td :colspan="columns.length + 1" class="text-center">Loading data...</td>
          </tr>
          <tr v-else-if="studentStore.error && studentStore.students.length === 0">
            <td :colspan="columns.length + 1" class="text-center" style="color: red">Failed to load data</td>
          </tr>
          <tr v-else-if="studentStore.students.length === 0">
            <td :colspan="columns.length + 1" class="text-center">No students found</td>
          </tr>
          <template v-else>
          <tr
            v-for="student in studentStore.students"
            :key="student.isuId"
            class="clickable"
            :style="{ opacity: studentStore.loading ? 0.5 : 1 }"
            @click="openDossier(student)"
          >
            <td>{{ student.fullName }}</td>
            <td>{{ student.group }}</td>
            <td>{{ student.isuId }}</td>
            <td>{{ student.dormitoryNumber }}</td>
            <td>{{ student.room }}</td>
            <td>{{ formatDate(student.accommodationPeriod) }}</td>
            <td class="actions-cell">
              <button type="button" class="btn btn-secondary" @click.stop="openDossier(student)">View</button>
              <template v-if="authStore.isAdmin">
                <button type="button" class="btn btn-primary" @click.stop="openEditModal(student)">Edit</button>
                <button type="button" class="btn btn-danger" @click.stop="promptDelete(student)">Delete</button>
              </template>
            </td>
          </tr>
          </template>
        </tbody>
      </table>
    </div>

    <TablePagination
      v-if="studentStore.total > 0"
      :page="studentStore.currentPage"
      :total-pages="studentStore.totalPages"
      :total="studentStore.total"
      :limit="studentStore.filters.limit"
      :disabled="studentStore.loading"
      @change-page="goToPage"
      @change-limit="setLimit"
    />

    <StudentDossierModal
      :is-open="isDossierOpen"
      :isu-id="selectedIsu"
      :is-admin="authStore.isAdmin"
      @close="isDossierOpen = false"
      @edit="handleEditFromDossier"
    />

    <StudentModal
      :is-open="isModalOpen"
      :student="editingStudent"
      @close="isModalOpen = false"
      @saved="onStudentSaved"
    />

    <ConfirmModal
      :is-open="isConfirmOpen"
      title="Delete Student"
      :message="confirmMessage"
      confirm-text="Delete"
      :busy="isDeleting"
      @confirm="confirmDelete"
      @cancel="isConfirmOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useStudentStore } from '../stores/students';
import { useStudentList } from '../composables/useStudentList';
import { useSubmit } from '../composables/useSubmit';
import { getErrorMessage } from '../utils/errors';
import { formatDate } from '../utils/format';
import StudentFilters from '../components/StudentFilters.vue';
import TablePagination from '../components/TablePagination.vue';
import StudentModal from '../components/StudentModal.vue';
import StudentDossierModal from '../components/StudentDossierModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

const authStore = useAuthStore();
const studentStore = useStudentStore();
const { search, reload, sortBy, goToPage, setLimit, resetFilters } = useStudentList();

const columns = [
  { key: 'fullName', title: 'Full Name' },
  { key: 'group', title: 'Group' },
  { key: 'isuId', title: 'ISU Number' },
  { key: 'dormitoryNumber', title: 'Dormitory' },
  { key: 'room', title: 'Room' },
  { key: 'accommodationPeriod', title: 'Accommodation' }
];

const isModalOpen = ref(false);
const editingStudent = ref(null);
const isConfirmOpen = ref(false);
const studentToDelete = ref(null);
const isDossierOpen = ref(false);
const selectedIsu = ref(null);

const confirmMessage = computed(() => {
  if (!studentToDelete.value) return '';
  const s = studentToDelete.value;
  return `Delete student ${s.fullName} (${s.isuId})?`;
});

function sortIcon(column) {
  if (studentStore.filters.sortBy !== column) return '';
  return studentStore.filters.order === 'asc' ? '▲' : '▼';
}

function openDossier(student) {
  selectedIsu.value = student.isuId;
  isDossierOpen.value = true;
}

function handleEditFromDossier(student) {
  isDossierOpen.value = false;
  openEditModal(student);
}

function openAddModal() {
  editingStudent.value = null;
  isModalOpen.value = true;
}

function openEditModal(student) {
  editingStudent.value = { ...student };
  isModalOpen.value = true;
}

function onStudentSaved() {
  isModalOpen.value = false;
  reload();
}

function promptDelete(student) {
  studentToDelete.value = student;
  isConfirmOpen.value = true;
}

const { isSubmitting: isDeleting, submit: confirmDelete } = useSubmit(async () => {
  const student = studentToDelete.value;
  if (!student) return;
  try {
    await studentStore.deleteStudent(student.isuId);
  } catch (err) {
    studentStore.notify(getErrorMessage(err, 'Could not delete student'), 'error');
  } finally {
    isConfirmOpen.value = false;
    studentToDelete.value = null;
    reload();
  }
});
</script>
