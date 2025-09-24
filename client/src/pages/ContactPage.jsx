import { useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Navbar from '../components/Navbar.jsx';

export default function ContactPage() {
  const { showToast } = useToast?.() || { showToast: null };
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast && showToast('Please log in to send a message.', { type: 'error' });
      alert('Please log in to send a message.');
      return;
    }
    try {
      await api.post('/api/contact', { subject: formData.subject, message: formData.message }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast && showToast('Thank you! Your message has been sent.', { type: 'success' });
      setFormData({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact send error:', err?.response?.data || err?.message || err);
      showToast && showToast(err?.response?.data?.message || 'Failed to send message. Please try again.', { type: 'error' });
      alert(err?.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="main-layout">
      <Navbar />
      <div className="page-container">
        <header className="page-header">
          <h1>Contact Us</h1>
          <p>Get in touch with our Ayurvedic experts</p>
        </header>
        
        <div className="contact-content centered">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Send us a Message</h2>
            <button type="submit" className="primary contact-submit-btn" disabled={!user}>
              Send Message
            </button>
            <div className="form-row">
              <label>
                Name *
                <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={!user} />
              </label>
              <label>
                Email *
                <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled />
              </label>
            </div>
            <label>
              Subject
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help you?"
              />
            </label>
            <label>
              Message *
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                placeholder="Tell us about your needs or questions..."
                required
              ></textarea>
            </label>
          </form>
        </div>
      </div>
    </div>
  );
}