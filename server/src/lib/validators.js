// Stricter email validation per project requirement:
// - local part: alphanumeric with . _ % + - allowed; no consecutive dots; starts/ends alphanumeric; length 1-64
// - domain: at least two labels (e.g., example.com); no consecutive dots; each label 1-63 chars
//   labels must start/end alphanumeric; hyphens allowed inside; TLD letters only, length >= 2
// - second-level domain (label before TLD) must be >= 2 chars (disallows g.com)
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // Disallow uppercase anywhere in the email per requirement
  if (email !== email.toLowerCase()) return false;
  if (email.includes(' ')) return false;

  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;

  // local validation (letters, numbers, dot, underscore, hyphen; no + or %; no leading/trailing dot)
  if (local.length > 64) return false;
  if (local.includes('..')) return false;
  if (!/^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/.test(local)) return false;

  // domain validation
  if (domain.length > 253) return false;
  if (domain.includes('..')) return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1];
  const sld = labels[labels.length - 2];
  // TLD must be letters only, length >= 2
  if (!/^[a-z]{2,}$/.test(tld)) return false;
  // SLD must be at least 2 characters (disallow single-letter like g.com)
  if (!/^[a-z0-9-]{2,}$/.test(sld)) return false;
  // Each label must be 1-63 chars, start/end alphanumeric
  for (const label of labels) {
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) return false;
  }

  return true;
}

export function isStrongPassword(password) {
  if (!password || typeof password !== 'string') return false;
  // Minimum 8 characters per requirement
  return password.length >= 8;
}
