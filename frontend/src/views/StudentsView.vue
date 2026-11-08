<template>
  <div class="students-view">
    <div class="view-header">
      <div>
        <h2>Students Dashboard</h2>
        <p class="subtitle">Search, filter, and manage student dormitory dossiers</p>
      </div>
      <button
        v-if="authStore.isAdmin"
        class="btn-primary btn-add"
        @click="openAddModal"
      >
        + Add Student
      </button>
    </div>

    <div
      v-if="studentStore.notification"
      class="notification-banner"
      :class="studentStore.notification.type"
    >
      <span>{{ studentStore.notification.message }}</span>
      <button class="btn-dismiss" @click="studentStore.clearNotification">&times;</button>
    </div>

    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-item">
          <label>Full Name</label>
          <input
            type="text"
            v-model="filterState.fullName"
            placeholder="Search by name..."
            @input="onFilterInput"
          />
        </div>

        <div class="filter-item">
          <label>Group</label>
          <input
            type="text"
            v-model="filterState.group"
            placeholder="e.g. P3278"
            @input="onFilterInput"
          />
        </div>

        <div class="filter-item">
          <label>Dormitory #</label>
          <input
            type="number"
            v-model="filterState.dormitoryNumber"
            placeholder="Dormitory (1-99)"
            min="1"
            max="99"
            @input="onFilterInput"
          />
        </div>

        <div class="filter-item">
          <label>Room #</label>
          <input
            type="number"
            v-model="filterState.room"
            placeholder="Room (1-9999)"
            min="1"
            max="9999"
            @input="onFilterInput"
          />
        </div>

        <div class="filter-item">
          <label>ISU ID</label>
          <input
            type="text"
            v-model="filterState.isuId"
            placeholder="6-digit ID..."
            maxlength="6"
            @input="onFilterInput"
          />
        </div>
      </div>

      <div class="filter-actions">
        <span class="active-filters-count" v-if="hasActiveFilters">
          Filters active
        </span>
        <button class="btn-reset" @click="handleResetFilters">Reset Filters</button>
      </div>
    </div>

    <div class="table-container">
      <div v-if="studentStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading students data...</p>
      </div>

      <table v-else-if="studentStore.students.length > 0" class="student-table">
        <thead>
          <tr>
            <th @click="sortBy('isuId')" class="sortable">
              ISU ID
              <span class="sort-icon">{{ getSortIcon('isuId') }}</span>
            </th>
            <th @click="sortBy('fullName')" class="sortable">
              Full Name
              <span class="sort-icon">{{ getSortIcon('fullName') }}</span>
            </th>
            <th @click="sortBy('group')" class="sortable">
              Group
              <span class="sort-icon">{{ getSortIcon('group') }}</span>
            </th>
            <th @click="sortBy('dormitoryNumber')" class="sortable">
              Dorm #
              <span class="sort-icon">{{ getSortIcon('dormitoryNumber') }}</span>
            </th>
            <th @click="sortBy('room')" class="sortable">
              Room
              <span class="sort-icon">{{ getSortIcon('room') }}</span>
            </th>
            <th @click="sortBy('accommodationPeriod')" class="sortable">
              Accommodation Date
              <span class="sort-icon">{{ getSortIcon('accommodationPeriod') }}</span>
            </th>
            <th>International</th>
            <th>Notes</th>
            <th class="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="student in studentStore.students"
            :key="student.isuId"
            class="clickable-row"
            @click="openDossier(student)"
          >
            <td class="isu-cell">
              <strong>{{ student.isuId }}</strong>
            </td>
            <td class="name-cell">{{ student.fullName }}</td>
            <td>
              <span class="group-tag">{{ student.group }}</span>
            </td>
            <td>{{ student.dormitoryNumber }}</td>
            <td>{{ student.room }}</td>
            <td>{{ formatDate(student.accommodationPeriod) }}</td>
            <td>
              <span
                class="status-pill"
                :class="student.isInternational ? 'pill-international' : 'pill-local'"
              >
                {{ student.isInternational ? 'International' : 'Domestic' }}
              </span>
            </td>
            <td class="notes-cell" :title="student.notes || ''">
              {{ student.notes || '-' }}
            </td>
            <td class="actions-cell">
              <button
                class="btn-action btn-view"
                title="View Dossier"
                @click.stop="openDossier(student)"
              >
                View
              </button>
              <template v-if="authStore.isAdmin">
                <button
                  class="btn-action btn-edit"
                  title="Edit Student"
                  @click.stop="openEditModal(student)"
                >
                  Edit
                </button>
                <button
                  class="btn-action btn-delete"
                  title="Delete Student"
                  @click.stop="promptDelete(student)"
                >
                  Delete
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <p class="empty-title">No students found</p>
        <p class="empty-desc">Try adjusting your search criteria or resetting filters.</p>
        <button class="btn-secondary" @click="handleResetFilters">Clear Filters</button>
      </div>

      <div class="pagination-bar" v-if="studentStore.students.length > 0 || studentStore.currentPage > 1">
        <div class="limit-selector">
          <label>Rows per page:</label>
          <select :value="studentStore.filters.limit" @change="onLimitChange($event)">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div class="pagination-controls">
          <button
            class="btn-page"
            :disabled="studentStore.currentPage <= 1 || studentStore.loading"
            @click="studentStore.setPage(studentStore.currentPage - 1)"
          >
            &larr; Previous
          </button>
          <span class="page-indicator">Page {{ studentStore.currentPage }}</span>
          <button
            class="btn-page"
            :disabled="!studentStore.hasMore || studentStore.loading"
            @click="studentStore.setPage(studentStore.currentPage + 1)"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </div>

    <StudentDossierModal
      :is-open="isDossierOpen"
      :student="selectedDossier"
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
      :is-danger="true"
      @confirm="handleConfirmDelete"
      @cancel="isConfirmOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useStudentStore } from '../stores/students';
import { useStudentSearch } from '../composables/useStudentSearch';
import StudentModal from '../components/StudentModal.vue';
import StudentDossierModal from '../components/StudentDossierModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';

const authStore = useAuthStore();
const studentStore = useStudentStore();
const { emitSearch } = useStudentSearch();

const filterState = reactive({
  fullName: '',
  group: '',
  dormitoryNumber: '',
  room: '',
  isuId: ''
});

const isModalOpen = ref(false);
const editingStudent = ref(null);
const isConfirmOpen = ref(false);
const studentToDelete = ref(null);
const isDossierOpen = ref(false);
const selectedDossier = ref(null);

const confirmMessage = computed(() => {
  if (!studentToDelete.value) return '';
  return `Are you sure you want to delete student ${studentToDelete.value.fullName} (ISU: ${studentToDelete.value.isuId})? This action cannot be undone.`;
});

const hasActiveFilters = computed(() => {
  return Object.values(filterState).some((val) => val !== '' && val !== null);
});

onMounted(() => {
  studentStore.fetchStudents();
});

function onFilterInput() {
  studentStore.filters.offset = 0;
  emitSearch({
    ...studentStore.filters,
    fullName: filterState.fullName,
    group: filterState.group,
    dormitoryNumber: filterState.dormitoryNumber,
    room: filterState.room,
    isuId: filterState.isuId,
    offset: 0
  });
}

function handleResetFilters() {
  filterState.fullName = '';
  filterState.group = '';
  filterState.dormitoryNumber = '';
  filterState.room = '';
  filterState.isuId = '';
  studentStore.resetFilters();
}

function sortBy(column) {
  studentStore.setSorting(column);
}

function getSortIcon(column) {
  if (studentStore.filters.sortBy !== column) return '↕';
  return studentStore.filters.order === 'asc' ? '↑' : '↓';
}

function onLimitChange(event) {
  studentStore.setLimit(event.target.value);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function openDossier(student) {
  selectedDossier.value = student;
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
}

function promptDelete(student) {
  studentToDelete.value = student;
  isConfirmOpen.value = true;
}

async function handleConfirmDelete() {
  if (!studentToDelete.value || studentStore.loading) return;
  const isu = studentToDelete.value.isuId;
  isConfirmOpen.value = false;
  studentToDelete.value = null;
  await studentStore.deleteStudent(isu);
}
</script>

<style scoped>
.students-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.view-header h2 {
  font-size: 1.6rem;
  color: var(--text-main);
}
.subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 4px;
}
.btn-add {
  font-size: 0.95rem;
  padding: 10px 18px;
  background-color: var(--primary);
  color: white;
}
.btn-add:hover {
  background-color: var(--primary-hover);
}

.notification-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
}
.notification-banner.success {
  background-color: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  color: #34d399;
}
.notification-banner.error {
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid #ef4444;
  color: #f87171;
}
.btn-dismiss {
  background: transparent;
  font-size: 1.2rem;
  color: inherit;
  padding: 0 4px;
}

.filter-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 18px 20px;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px;
}
.filter-item label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 5px;
}
.filter-item input {
  width: 100%;
  padding: 8px 10px;
  background-color: var(--bg-color);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-main);
  font-size: 0.9rem;
  outline: none;
}
.filter-item input:focus {
  border-color: var(--primary);
}
.filter-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.active-filters-count {
  font-size: 0.8rem;
  color: #38bdf8;
}
.btn-reset {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.85rem;
  padding: 6px 12px;
}
.btn-reset:hover {
  color: var(--text-main);
  background-color: var(--border);
}

.table-container {
  background-color: var(--surface-color);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.student-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}
.student-table th {
  background-color: rgba(0, 0, 0, 0.2);
  color: var(--text-muted);
  font-weight: 600;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  user-select: none;
}
.student-table th.sortable {
  cursor: pointer;
}
.student-table th.sortable:hover {
  color: var(--text-main);
}
.sort-icon {
  margin-left: 4px;
  font-size: 0.8rem;
}
.student-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text-main);
}
.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s;
}
.clickable-row:hover {
  background-color: rgba(255, 255, 255, 0.04);
}
.isu-cell {
  font-family: monospace;
  font-size: 0.95rem;
  color: #38bdf8;
}
.name-cell {
  font-weight: 500;
}
.group-tag {
  background-color: var(--border);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-pill {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 9999px;
  font-weight: 600;
}
.pill-international {
  background-color: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.4);
}
.pill-local {
  background-color: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.3);
}
.notes-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-muted);
}
.actions-header {
  text-align: right;
  padding-right: 20px;
}
.actions-cell {
  text-align: right;
  white-space: nowrap;
}
.btn-action {
  font-size: 0.8rem;
  padding: 5px 10px;
  margin-left: 6px;
  border-radius: 4px;
}
.btn-view {
  background-color: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
}
.btn-view:hover {
  background-color: #38bdf8;
  color: #0f172a;
}
.btn-edit {
  background-color: rgba(59, 130, 246, 0.15);
  border: 1px solid var(--primary);
  color: #60a5fa;
}
.btn-edit:hover {
  background-color: var(--primary);
  color: white;
}
.btn-delete {
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid var(--danger);
  color: #f87171;
}
.btn-delete:hover {
  background-color: var(--danger);
  color: white;
}

.loading-state, .empty-state {
  padding: 48px 24px;
  text-align: center;
  color: var(--text-muted);
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 6px;
}
.empty-desc {
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background-color: rgba(0, 0, 0, 0.15);
  border-top: 1px solid var(--border);
  font-size: 0.85rem;
}
.limit-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
}
.limit-selector select {
  background-color: var(--bg-color);
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 4px 8px;
  border-radius: 4px;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-indicator {
  color: var(--text-main);
  font-weight: 500;
}
.btn-page {
  background-color: var(--surface-color);
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 6px 12px;
}
.btn-page:hover:not(:disabled) {
  background-color: var(--border);
}
</style>
