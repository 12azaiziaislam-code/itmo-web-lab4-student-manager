import api from './api';

export const studentService = {
  /**
   * Get filtered & sorted students list with pagination
   * @param {Object} params - { fullName, group, dormitoryNumber, room, isuId, sortBy, order, limit, offset }
   */
  async getStudents(params = {}) {
    // Filter out empty string or undefined values
    const cleanParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== '' && value !== null && value !== undefined) {
        cleanParams[key] = value;
      }
    }
    const response = await api.get('/students', { params: cleanParams });
    return response.data;
  },

  /**
   * Search students via POST body
   * @param {Object} filters
   */
  async searchStudents(filters = {}) {
    const response = await api.post('/students/search', filters);
    return response.data;
  },

  /**
   * Get single student dossier by ISU ID
   * @param {string} isuId
   */
  async getStudentByIsu(isuId) {
    const response = await api.get(`/students/${isuId}`);
    return response.data;
  },

  /**
   * Create a new student (ADMIN only)
   * @param {Object} studentData
   */
  async createStudent(studentData) {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  /**
   * Update student details (ADMIN only)
   * @param {string} isuId
   * @param {Object} studentData
   */
  async updateStudent(isuId, studentData) {
    const response = await api.patch(`/students/${isuId}`, studentData);
    return response.data;
  },

  /**
   * Delete student record (ADMIN only)
   * @param {string} isuId
   */
  async deleteStudent(isuId) {
    const response = await api.delete(`/students/${isuId}`);
    return response.data;
  }
};

export default studentService;

