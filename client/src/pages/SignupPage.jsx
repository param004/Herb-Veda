import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { registerApi, requestRegisterOtpApi, verifyRegisterOtpApi } from '../lib/api.js';
import logo from '../assets/logo.png';
import { getEmailError, getPasswordError } from '../utils/validation.js';

export default function SignupPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpPhase, setOtpPhase] = useState(false);
  const [code, setCode] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!otpPhase) {
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields.');
        return;
      }
      const emailErr = getEmailError(email);
      if (emailErr) {
        setError(emailErr);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const pwdErr = getPasswordError(password);
      if (pwdErr) {
        setError(pwdErr);
        return;
      }
      setLoading(true);
      try {
        await requestRegisterOtpApi(name, email, password);
        setOtpPhase(true);
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to send OTP. Please try again.';
        if (msg === 'Email already in use.' || msg.includes('already')) {
          setError('This email is already registered. Please sign in or use a different email.');
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!code) {
        setError('Please enter the OTP sent to your email.');
        return;
      }
      setLoading(true);
      try {
        const { token, user } = await verifyRegisterOtpApi(email, code);
        setToken(token);
        setUser(user);
        navigate('/', { replace: true });
      } catch (err) {
        const msg = err?.response?.data?.message || 'OTP verification failed. Please try again.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="auth-container">
      <div className="brand">
        <img src={logo} alt="Herb & Veda" />
        <h1>Herb & Veda</h1>
      </div>
      <form className="card" onSubmit={onSubmit}>
        <h2>Create Account</h2>
        <p className="sub">Join Herb & Veda today</p>
        {error && <div className="alert">{error}</div>}
        {!otpPhase && (
          <>
            <label>
              Full Name
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                placeholder="you@herbveda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="link"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            <label>
              Confirm Password
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <button className="primary" type="submit" disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </>
        )}

        {otpPhase && (
          <>
            <label>
              Enter OTP
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                title="Enter the 6-digit code sent to your email"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
            </label>
            <button className="primary" type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Create Account'}
            </button>
          </>
        )}
        
        <p className="hint">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </form>
    </div>
  );
}