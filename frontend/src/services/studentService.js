import api from './api';

export const studentService = {
  async getStudents(params = {}) {
    const cleanParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== '' && value !== null && value !== undefined) {
        cleanParams[key] = value;
      }
    }
    const response = await api.get('/students', { params: cleanParams });
    return response.data;
  },

  async searchStudents(filters = {}) {
    const response = await api.post('/students/search', filters);
    return response.data;
  },

  async getStudentByIsu(isuId) {
    const response = await api.get(`/students/${isuId}`);
    return response.data;
  },

  async createStudent(studentData) {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  async updateStudent(isuId, studentData) {
    const response = await api.patch(`/students/${isuId}`, studentData);
    return response.data;
  },

  async deleteStudent(isuId) {
    const response = await api.delete(`/students/${isuId}`);
    return response.data;
  }
};

export default studentService;
