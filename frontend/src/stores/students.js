import { defineStore } from 'pinia';
import studentService from '../services/studentService';

export const useStudentStore = defineStore('students', {
  state: () => ({
    students: [],
    loading: false,
    error: null,
    notification: null, // { type: 'success' | 'error', message: string }
    filters: {
      fullName: '',
      group: '',
      dormitoryNumber: '',
      room: '',
      isuId: '',
      sortBy: 'isuId',
      order: 'asc',
      limit: 10,
      offset: 0
    }
  }),

  getters: {
    currentPage: (state) => Math.floor(state.filters.offset / state.filters.limit) + 1,
    hasMore: (state) => state.students.length >= state.filters.limit
  },

  actions: {
    setNotification(message, type = 'success', timeout = 4000) {
      this.notification = { message, type };
      if (timeout > 0) {
        setTimeout(() => {
          if (this.notification?.message === message) {
            this.notification = null;
          }
        }, timeout);
      }
    },

    clearNotification() {
      this.notification = null;
    },

    async fetchStudents(overrideParams = {}) {
      this.loading = true;
      this.error = null;
      try {
        this.filters = { ...this.filters, ...overrideParams };
        const data = await studentService.getStudents(this.filters);
        this.students = data;
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || err.response?.data?.error || 'Failed to load students';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    setFilter(key, value) {
      this.filters[key] = value;
      this.filters.offset = 0; // reset pagination on filter change
    },

    setSorting(field) {
      if (this.filters.sortBy === field) {
        this.filters.order = this.filters.order === 'asc' ? 'desc' : 'asc';
      } else {
        this.filters.sortBy = field;
        this.filters.order = 'asc';
      }
      this.filters.offset = 0;
      this.fetchStudents();
    },

    setPage(page) {
      if (page < 1) return;
      this.filters.offset = (page - 1) * this.filters.limit;
      this.fetchStudents();
    },

    setLimit(limit) {
      this.filters.limit = Number(limit);
      this.filters.offset = 0;
      this.fetchStudents();
    },

    resetFilters() {
      this.filters = {
        fullName: '',
        group: '',
        dormitoryNumber: '',
        room: '',
        isuId: '',
        sortBy: 'isuId',
        order: 'asc',
        limit: 10,
        offset: 0
      };
      return this.fetchStudents();
    },

    async createStudent(payload) {
      this.loading = true;
      this.error = null;
      try {
        const newStudent = await studentService.createStudent(payload);
        this.setNotification(`Student ${newStudent.fullName} (${newStudent.isuId}) created successfully!`);
        await this.fetchStudents();
        return newStudent;
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create student';
        this.error = msg;
        this.setNotification(msg, 'error');
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateStudent(isuId, payload) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await studentService.updateStudent(isuId, payload);
        this.setNotification(`Student ${updated.fullName} (${isuId}) updated successfully!`);
        await this.fetchStudents();
        return updated;
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to update student';
        this.error = msg;
        this.setNotification(msg, 'error');
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteStudent(isuId) {
      this.loading = true;
      this.error = null;
      try {
        await studentService.deleteStudent(isuId);
        this.setNotification(`Student ${isuId} deleted successfully!`);
        await this.fetchStudents();
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete student';
        this.error = msg;
        this.setNotification(msg, 'error');
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});

export default useStudentStore;

