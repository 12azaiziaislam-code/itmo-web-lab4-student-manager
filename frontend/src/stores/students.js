import { defineStore } from 'pinia';
import studentService from '../services/studentService';

export function defaultFilters() {
  return {
    search: '',
    isuId: '',
    fullName: '',
    group: '',
    dormitoryNumber: '',
    room: '',
    accommodationFrom: '',
    accommodationTo: '',
    isInternational: '',
    notes: '',
    sortBy: 'isuId',
    order: 'asc',
    limit: 10,
    offset: 0
  };
}

let notificationTimer = null;

export const useStudentStore = defineStore('students', {
  state: () => ({
    students: [],
    total: 0,
    loading: false,
    error: null,
    notification: null,
    filters: defaultFilters()
  }),

  getters: {
    currentPage: (state) => Math.floor(state.filters.offset / state.filters.limit) + 1,
    totalPages: (state) => Math.max(1, Math.ceil(state.total / state.filters.limit))
  },

  actions: {
    notify(message, type = 'success') {
      this.notification = { message, type };
      clearTimeout(notificationTimer);
      notificationTimer = setTimeout(() => {
        this.notification = null;
      }, 4000);
    },

    clearNotification() {
      clearTimeout(notificationTimer);
      this.notification = null;
    },

    resetFilters() {
      this.filters = defaultFilters();
    },

    async createStudent(payload) {
      const created = await studentService.createStudent(payload);
      this.notify(`Student ${created.fullName} (${created.isuId}) was added`);
      return created;
    },

    async updateStudent(isuId, payload) {
      const updated = await studentService.updateStudent(isuId, payload);
      this.notify(`Student ${updated.fullName} (${isuId}) was updated`);
      return updated;
    },

    async deleteStudent(isuId) {
      await studentService.deleteStudent(isuId);
      this.notify(`Student ${isuId} was deleted`);
    }
  }
});

export default useStudentStore;
