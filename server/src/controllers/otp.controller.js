import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Otp } from '../models/Otp.js';
import { sendOtpEmail } from '../lib/mailer.js';
import jwt from 'jsonwebtoken';
import { isValidEmail, isStrongPassword } from '../lib/validators.js';

const OTP_TTL_MINUTES = 10;

function signToken(user) {
  const payload = { sub: user._id.toString(), email: user.email, name: user.name };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function generateNumericCode(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

function mapSmtpError(err) {
  const msg = (err && (err.response || err.message)) || 'Unknown mail error';
  // Nodemailer common codes
  if (err?.code === 'EAUTH') return 'Invalid SMTP credentials. Check SMTP_USER and SMTP_PASS.';
  if (err?.code === 'ECONNECTION' || /getaddrinfo|ENOTFOUND|ECONNREFUSED|ETIMEDOUT/i.test(msg)) {
    return 'Cannot connect to SMTP server. Check SMTP_HOST/PORT/SECURE and network.';
  }
  if (/Invalid login|Username and Password not accepted/i.test(msg)) {
    return 'SMTP rejected login. For Gmail, enable 2FA and use an App Password.';
  }
  return 'Email service error: ' + msg;
}

export async function requestLoginOtp(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = generateNumericCode(6);
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    const otpDoc = await Otp.create({ email: user.email, userId: user._id, codeHash, type: 'login', expiresAt });
    try {
      await sendOtpEmail(user.email, code);
    } catch (mailErr) {
      console.error('Send login OTP mail error:', mailErr);
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(500).json({ message: mapSmtpError(mailErr) });
    }

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('requestLoginOtp error:', err);
    res.status(500).json({ message: 'Server error while sending OTP' });
  }
}

export async function verifyLoginOtp(req, res) {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });

    const otp = await Otp.findOne({ email: email.toLowerCase(), type: 'login', consumed: false }).sort({ createdAt: -1 });
    if (!otp) return res.status(400).json({ message: 'No OTP found, please request again' });
    if (otp.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });

    const ok = await bcrypt.compare(code, otp.codeHash);
    if (!ok) {
      otp.attempts += 1;
      await otp.save();
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    otp.consumed = true;
    await otp.save();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('verifyLoginOtp error:', err);
    res.status(500).json({ message: 'Server error while verifying OTP' });
  }
}

export async function requestRegisterOtp(req, res) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (!isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
    if (!isStrongPassword(password)) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already in use.' });

    const code = generateNumericCode(6);
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    const passwordHash = await bcrypt.hash(password, 10);

    const otpDoc = await Otp.create({ email: email.toLowerCase(), codeHash, type: 'register', expiresAt, payload: { name, passwordHash } });
    try {
      await sendOtpEmail(email.toLowerCase(), code);
    } catch (mailErr) {
      console.error('Send register OTP mail error:', mailErr);
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(500).json({ message: mapSmtpError(mailErr) });
    }

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('requestRegisterOtp error:', err);
    res.status(500).json({ message: 'Server error while sending OTP' });
  }
}

export async function verifyRegisterOtp(req, res) {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
    const otp = await Otp.findOne({ email: email.toLowerCase(), type: 'register', consumed: false }).sort({ createdAt: -1 });
    if (!otp) return res.status(400).json({ message: 'No OTP found, please request again' });
    if (otp.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });

    const ok = await bcrypt.compare(code, otp.codeHash);
    if (!ok) {
      otp.attempts += 1;
      await otp.save();
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (!otp.payload?.name || !otp.payload?.passwordHash) {
      return res.status(400).json({ message: 'Registration OTP payload missing' });
    }

    otp.consumed = true;
    await otp.save();

    const user = await User.create({ email: email.toLowerCase(), name: otp.payload.name, passwordHash: otp.payload.passwordHash });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('verifyRegisterOtp error:', err);
    res.status(500).json({ message: 'Server error while verifying OTP' });
  }
}
