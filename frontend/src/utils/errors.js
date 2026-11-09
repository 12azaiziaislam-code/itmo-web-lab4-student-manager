import axios from 'axios';

function backendMessage(data) {
  if (data && typeof data === 'object') {
    return data.message || data.error || '';
  }
  return '';
}

export function getErrorMessage(err, fallback = 'Something went wrong') {
  if (axios.isCancel(err)) return '';

  if (!err?.response) {
    if (err?.code === 'ECONNABORTED') {
      return 'Server took too long to respond. Please try again.';
    }
    if (err?.request) {
      return 'Server is unavailable. Check that the backend is running and try again.';
    }
    return fallback;
  }

  const { status, data } = err.response;
  const msg = backendMessage(data);

  switch (status) {
    case 400:
      return msg || 'Invalid request data';
    case 401:
      return msg || 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission for this action (ADMIN role required).';
    case 404:
      return msg || 'Requested data was not found';
    case 409:
      return msg || 'Such record already exists';
    case 422:
      return msg ? `Validation error: ${msg}` : 'Validation error';
    case 502:
    case 503:
    case 504:
      return 'Server is unavailable. Please try again later.';
    default:
      if (status >= 500) return 'Internal server error. Please try again later.';
      return msg || fallback;
  }
}
