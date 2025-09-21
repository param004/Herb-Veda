import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../lib/api.js';
import logo from '../assets/logo.png';
import { useToast } from '../context/ToastContext.jsx';
import { getEmailError } from '../utils/validation.js';

export default function ForgotPasswordPage() {
  const { showToast } = useToast?.() || { showToast: null };
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const emailErr = getEmailError(email);
    if (emailErr) return setError(emailErr);
    setLoading(true);
    try {
      const resp = await forgotPasswordApi(email);
      if (resp?.devResetUrl) setDevResetUrl(resp.devResetUrl);
      setSent(true);
      showToast && showToast('If your email exists, we sent a reset link.', { type: 'success' });
    } catch (err) {
      // Always shows success to avoid enumeration; but we can still show generic message
      setSent(true);
      showToast && showToast('If your email exists, we sent a reset link.', { type: 'success' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="brand">
        <img src={logo} alt="Herb & Veda" />
        <h1>Herb & Veda</h1>
      </div>
      <form className="card" onSubmit={onSubmit}>
        <h2>Forgot password</h2>
        <p className="sub">We'll email you a reset link.</p>
        {error && <div className="alert">{error}</div>}
        {!sent ? (
          <>
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
            <button className="primary" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <p className="hint">
              Remembered it? <Link to="/login" className="auth-link">Back to sign in</Link>
            </p>
          </>
        ) : (
          <>
            <div className="notice">If an account exists for that email, a reset link was sent. Check your inbox and spam folder.</div>
            {devResetUrl && (
              <div className="hint" style={{ marginTop: 10 }}>
                Developer note: open reset link directly: <a href={devResetUrl}>Reset Password</a>
              </div>
            )}
            <p className="hint">
              <Link to="/login" className="auth-link">Return to sign in</Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}
