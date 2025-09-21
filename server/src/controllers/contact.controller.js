import { sendGeneralEmail } from '../lib/mailer.js';
import { buildContactEmailHtml, buildContactText } from '../lib/emailTemplates.js';

export async function sendContactMessage(req, res) {
  try {
    const { subject, message } = req.body || {};
    const email = req.user?.email;
    const name = req.user?.name || 'Customer';
    console.log('[contact] incoming (auth):', { name, email, hasMessage: !!message, subject });
    if (!email || !message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const admin = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (!admin) {
      return res.status(500).json({ message: 'Admin email not configured on server.' });
    }

  const safeSubject = subject && String(subject).trim() ? subject.trim() : 'New Contact Form Message';

    const html = buildContactEmailHtml({ name, email, subject: safeSubject, message });

    const sendResult = await sendGeneralEmail({
      to: admin,
      subject: `[Contact] ${safeSubject}`,
  html,
  text: buildContactText({ name, email, subject: safeSubject, message }),
      replyTo: email,
    });
    console.log('[contact] email sent:', { to: admin, messageId: sendResult?.messageId || '(n/a)' });

    res.json({ message: 'Message sent successfully. We will get back to you soon.' });
  } catch (err) {
    console.error('[contact] sendContactMessage error:', err?.code || '', err?.response?.toString?.() || err?.message || err);
    const devDetail = process.env.NODE_ENV !== 'production' ? (err?.message || 'unknown error') : undefined;
    res.status(500).json({ message: 'Failed to send message. Please try again later.', detail: devDetail });
  }
}
