import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { loginApi, requestLoginOtpApi, verifyLoginOtpApi } from '../lib/api.js';
import { getEmailError } from '../utils/validation.js';
import logo from '../assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const { clearCart } = useCart();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [code, setCode] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const emailErr = getEmailError(email);
    if (emailErr) return setError(emailErr);
    if (!otpMode && !password) return setError('Please enter your password.');
    if (otpMode && !otpRequested) return setError('Please request an OTP first.');
    if (otpMode && !code) return setError('Please enter the OTP sent to your email.');
    setLoading(true);
    try {
      const { token, user } = otpMode
        ? await verifyLoginOtpApi(email, code)
        : await loginApi(email, password);
      
      // Clear cart to prevent showing previous user's items
      clearCart();
      
      setToken(token);
      setUser(user);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
      let msg = 'Login failed. Please try again.';
      
      if (err?.response?.status === 401) {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (err?.response?.status === 400) {
        msg = err.response.data?.message || 'Invalid login data.';
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.code === 'NETWORK_ERROR' || !err?.response) {
        msg = 'Cannot connect to server. Please check your internet connection.';
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestOtp(e) {
    e.preventDefault();
    setError('');
    const emailErr = getEmailError(email);
    if (emailErr) return setError(emailErr);
    setOtpLoading(true);
    try {
      await requestLoginOtpApi(email);
      setOtpRequested(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(msg);
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="brand">
        <img src={logo} alt="Herb & Veda" />
        <h1>Herb & Veda</h1>
      </div>
      <form className="card" onSubmit={onSubmit}>
        <h2>Welcome back</h2>
        <p className="sub">Sign in to continue</p>
        {error && <div className="alert">{error}</div>}
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
        {!otpMode && (
          <label>
            Password
            <div className="password-field">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required={!otpMode}
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
        )}

        {otpMode && (
          <>
            <div className="otp-request">
              <button 
                className={`secondary ${otpLoading ? 'loading' : ''}`} 
                onClick={handleRequestOtp} 
                disabled={otpLoading || otpRequested}
              >
                {otpLoading && <span className="loading-spinner"></span>}
                {otpLoading ? 'Please Wait...' : otpRequested ? 'OTP Sent ✓' : 'Send OTP to Email'}
              </button>
              {otpLoading && (
                <p className="otp-loading-message">
                  Sending OTP to your email address...
                </p>
              )}
            </div>
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
                required={otpMode}
              />
            </label>
          </>
        )}

        <div className="auth-toggle">
          <label>
            <input type="checkbox" checked={otpMode} onChange={() => setOtpMode((s) => !s)} />
            Sign in with OTP instead of password
          </label>
        </div>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : otpMode ? 'Verify & Sign in' : 'Sign in'}
        </button>
        {!otpMode && (
          <p className="hint" style={{ marginTop: 8 }}>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </p>
        )}
        <p className="hint">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
