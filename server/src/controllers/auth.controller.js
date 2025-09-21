import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { sendGeneralEmail } from '../lib/mailer.js';
import { buildResetPasswordEmailHtml, buildResetPasswordText } from '../lib/emailTemplates.js';
import { isValidEmail, isStrongPassword } from '../lib/validators.js';

function signToken(user) {
  const payload = { sub: user._id.toString(), email: user.email, name: user.name };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function signResetToken(user) {
  const secret = process.env.RESET_PASSWORD_SECRET || (process.env.JWT_SECRET + ':reset');
  const ttlMinutes = Number(process.env.RESET_PASSWORD_TTL_MINUTES || 15);
  // Fingerprint ties token to current passwordHash so it becomes invalid after password changes
  const pwdFingerprint = (user.passwordHash || '').slice(-12);
  const payload = { sub: user._id.toString(), email: user.email, v: pwdFingerprint };
  return jwt.sign(payload, secret, { expiresIn: `${ttlMinutes}m` });
}

function verifyResetToken(token) {
  const secret = process.env.RESET_PASSWORD_SECRET || (process.env.JWT_SECRET + ':reset');
  return jwt.verify(token, secret);
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function register(req, res) {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
    if (!isStrongPassword(password)) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already in use.' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase(), name, passwordHash });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.sub; // From JWT token
    const { name, phone, address, city, state, pincode, dateOfBirth, gender } = req.body || {};

    // Find and update the user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(pincode && { pincode }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(gender && { gender }),
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid data provided', errors: err.errors });
    }
    res.status(500).json({ message: 'Server error' });
  }
}

// Request a password reset email. Always responds with 200 to avoid account enumeration.
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) {
      // Still respond 200 to avoid leaking which emails exist
      return res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
    }
    if (!isValidEmail(email)) {
      // Respond generic to avoid enumeration
      return res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[auth] forgotPassword: no user for', email);
      }
      return res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('[auth] forgotPassword: user found', user.email);
    }

    const token = signResetToken(user);
    const clientBase = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
    const url = `${clientBase.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

    try {
      console.log('[auth] sending reset email to', user.email);
      const sendResult = await sendGeneralEmail({
        to: user.email,
        subject: 'Reset your Herb & Veda password',
        html: buildResetPasswordEmailHtml({ name: user.name, url }),
        text: buildResetPasswordText({ name: user.name, url }),
      });
      console.log('[auth] reset email sent', { to: user.email, messageId: sendResult?.messageId || '(n/a)' });
    } catch (mailErr) {
      // Log but do not reveal to client
      console.error('[auth] forgotPassword mail error:', mailErr?.code || '', mailErr?.response?.toString?.() || mailErr?.message || mailErr);
    }

    const resp = { message: 'If an account exists for this email, a reset link has been sent.' };
    if (process.env.NODE_ENV !== 'production') {
      resp.devResetUrl = url; // convenience for local testing only
    }
    res.json(resp);
  } catch (err) {
    console.error('[auth] forgotPassword error:', err);
    // Still return 200 to avoid enumeration
    res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
  }
}

// Reset password using a token and a new password
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ message: 'Token and new password are required.' });
    if (!isStrongPassword(password)) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });

    let payload;
    try {
      payload = verifyResetToken(token);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const user = await User.findById(payload.sub);
    if (!user || user.email !== payload.email) {
      return res.status(400).json({ message: 'Invalid reset token.' });
    }

    // Ensure token ties to current password hash (so old tokens cannot be reused after a reset)
    const currentFp = (user.passwordHash || '').slice(-12);
    if (payload.v !== currentFp) {
      return res.status(400).json({ message: 'Reset token is no longer valid. Please request a new one.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    await user.save();

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('[auth] resetPassword error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
