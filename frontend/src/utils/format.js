export function formatDate(value) {
  if (!value) return '-';
  const parts = String(value).split('-');
  if (parts.length !== 3) return value;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}
