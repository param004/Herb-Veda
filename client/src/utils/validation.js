// Simple client-side validators shared across auth pages
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  if (email !== email.toLowerCase()) return false;
  if (email.includes(' ')) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (local.length > 64 || local.includes('..')) return false;
  if (!/^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/.test(local)) return false;
  if (domain.length > 253 || domain.includes('..')) return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1];
  const sld = labels[labels.length - 2];
  if (!/^[a-z]{2,}$/.test(tld)) return false;
  if (!/^[a-z0-9-]{2,}$/.test(sld)) return false;
  for (const label of labels) {
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) return false;
  }
  return true;
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

export function getEmailError(email) {
  if (!email) return 'Email is required';
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  return '';
}

export function getPasswordError(password) {
  if (!password) return 'Password is required';
  if (!isValidPassword(password)) return 'Password must be at least 8 characters long';
  return '';
}
