import axios from 'axios';

export function getErrorMessage(err, defaultText = 'Something went wrong') {
  if (axios.isCancel(err)) return '';

  if (!err.response) {
    return 'Cannot connect to server. Ensure backend is running.';
  }

  const status = err.response.status;
  const data = err.response.data || {};
  const text = data.message || data.error;

  if (status === 401) return text || 'Session expired. Please sign in again.';
  if (status === 403) return 'Access denied. ADMIN role is required.';
  if (status === 404) return text || 'Not found';
  if (status === 422) return 'Validation error: ' + (text || 'check the form');
  if (status === 502 || status === 503 || status === 504 || (status >= 500 && !text)) {
    return 'Server is unavailable. Try again later.';
  }
  if (status >= 500) return 'Internal server error. Try again later.';
  return text || defaultText;
}
