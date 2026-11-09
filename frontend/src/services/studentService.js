import api from './api';

function cleanParams(params) {
  const result = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export const studentService = {
  async getStudents(params = {}, signal) {
    const response = await api.get('/students', { params: cleanParams(params), signal });
    const total = Number(response.headers['x-total-count']);
    return {
      items: response.data,
      total: Number.isNaN(total) ? response.data.length : total
    };
  },

  async getStudentByIsu(isuId, signal) {
    const response = await api.get(`/students/${isuId}`, { signal });
    return response.data;
  },

  async createStudent(studentData) {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  async updateStudent(isuId, studentData) {
    const response = await api.put(`/students/${isuId}`, studentData);
    return response.data;
  },

  async deleteStudent(isuId) {
    await api.delete(`/students/${isuId}`);
  }
};

export default studentService;
