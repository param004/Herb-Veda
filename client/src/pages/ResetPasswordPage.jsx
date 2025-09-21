import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../lib/api.js';
import logo from '../assets/logo.png';
import { useToast } from '../context/ToastContext.jsx';
import { getPasswordError } from '../utils/validation.js';

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function ResetPasswordPage() {
  const { showToast } = useToast?.() || { showToast: null };
  const navigate = useNavigate();
  const query = useQuery();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = query.get('token') || '';
    setToken(t);
  }, [query]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
  if (!token) return setError('Invalid or missing reset link.');
  const pwdErr = getPasswordError(password);
  if (pwdErr) return setError(pwdErr);
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const { message } = await resetPasswordApi(token, password);
      setDone(true);
      showToast && showToast(message || 'Password reset successful. Please sign in.', { type: 'success' });
      // Optionally redirect after short delay
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Reset failed. The link may be expired.';
      setError(msg);
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
        <h2>Set a new password</h2>
        <p className="sub">Enter a strong password and keep it safe.</p>
        {error && <div className="alert">{error}</div>}
        {!done && (
          <>
            <label>
              New password
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>
            <label>
              Confirm password
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={6}
                required
              />
            </label>
            <button className="primary" type="submit" disabled={loading || !token}>
              {loading ? 'Saving…' : 'Reset password'}
            </button>
            <p className="hint">
              Back to <Link to="/login" className="auth-link">sign in</Link>
            </p>
          </>
        )}
        {done && (
          <>
            <div className="notice">Your password has been reset. Redirecting to sign in…</div>
          </>
        )}
      </form>
    </div>
  );
}
