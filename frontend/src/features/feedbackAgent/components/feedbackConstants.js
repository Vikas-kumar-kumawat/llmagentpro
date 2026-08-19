export function formatPhoneNumber(val) {
  if (!val) return '';
  const raw = val.trim();
  if (!raw) return '';
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (!cleaned) return raw;
  if (cleaned.startsWith('+')) return cleaned;
  const noZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  return `+91${noZero}`;
}

export const DEFAULT_FEEDBACKS = [];
