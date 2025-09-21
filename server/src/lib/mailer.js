import nodemailer from 'nodemailer';

let transporter;

export function getTransporter() {
  if (transporter) return transporter;
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE
  } = process.env;
  // If Gmail creds are set without host/port, use Gmail service for simplicity
  if (!SMTP_HOST && SMTP_USER && SMTP_PASS) {
    console.log('[mailer] Using Gmail service with SMTP_USER environment variable:', SMTP_USER);
    const passNormalized = String(SMTP_PASS).replace(/\s+/g, '');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: SMTP_USER, pass: passNormalized },
    });
    return transporter;
  }
  console.log('[mailer] Using custom SMTP host:', SMTP_HOST, 'port:', SMTP_PORT, 'secure:', SMTP_SECURE);
  const passNormalized = SMTP_PASS ? String(SMTP_PASS).replace(/\s+/g, '') : undefined;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
    auth: SMTP_USER && passNormalized ? { user: SMTP_USER, pass: passNormalized } : undefined,
  });
  return transporter;
}

export async function sendOtpEmail(to, code) {
  const { SMTP_FROM, SMTP_USER } = process.env;
  const mail = {
    from: SMTP_FROM || SMTP_USER,
    to,
    subject: 'Your Herb & Veda OTP Code',
    text: `Your OTP code is ${code}. It will expire in 10 minutes. Do not share this code with anyone.`,
    html: `<p>Your OTP code is <b style="font-size:18px">${code}</b>.</p><p>It will expire in 10 minutes. Do not share this code with anyone.</p>`
  };
  const t = getTransporter();
  return t.sendMail(mail);
}

export async function verifySmtp() {
  const t = getTransporter();
  try {
    await t.verify();
    console.log('[mailer] SMTP verify: OK');
  } catch (err) {
    console.error('[mailer] SMTP verify failed:', err?.code || '', err?.message || err);
    throw err;
  }
}

export async function sendOrderInvoiceEmail({ to, adminBcc, subject, html, text, attachments }) {
  const { SMTP_FROM, SMTP_USER } = process.env;
  const t = getTransporter();
  const mail = {
    from: SMTP_FROM || SMTP_USER,
    to,
    bcc: adminBcc,
    subject,
    html,
    text,
    attachments
  };
  return t.sendMail(mail);
}

export async function sendGeneralEmail({ to, subject, html, text, replyTo }) {
  const { SMTP_FROM, SMTP_USER } = process.env;
  const t = getTransporter();
  const mail = {
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    html,
    text,
    replyTo,
  };
  return t.sendMail(mail);
}
