// Simple, email-client-friendly HTML templates with inline CSS.
// Branding: light green background, dark green text, rounded cards.
// Emojis: only 🌿 and ⚕️ are used sparingly per request.

const colors = {
  bg: '#F3F8F5', // soft green background
  card: '#ffffff',
  text: '#1A3B2E', // dark green text
  subtext: '#3C5A47',
  accent: '#2E7D32', // accent green
  border: '#E6EFEA'
};

function baseWrapper({ title, subtitle, contentHtml }) {
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="x-ua-compatible" content="ie=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title || 'Herb & Veda')}</title>
    </head>
    <body style="margin:0;padding:0;background:${colors.bg};color:${colors.text};font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${colors.bg};padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:${colors.bg};">
              <tr>
                <td style="padding:0 20px 16px 20px;">
                  <div style="text-align:center;margin:0 auto 16px auto;">
                    <div style="font-size:26px; font-weight:700; color:${colors.text}; letter-spacing:0.3px;">🌿 Herb & Veda</div>
                    ${subtitle ? `<div style="font-size:13px;color:${colors.subtext};margin-top:6px;">⚕️ ${escapeHtml(subtitle)}</div>` : ''}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 20px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${colors.card};border-radius:14px;box-shadow:0 6px 24px rgba(16, 50, 34, 0.08);">
                    <tr>
                      <td style="padding:24px 24px 8px 24px;border-bottom:1px solid ${colors.border};">
                        <div style="font-size:18px;font-weight:700;color:${colors.text};">${escapeHtml(title || '')}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:18px 24px 24px 24px;color:${colors.text};">${contentHtml}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 20px 0 20px;">
                  <div style="text-align:center;color:${colors.subtext};font-size:12px;line-height:18px;">
                    © ${new Date().getFullYear()} Herb & Veda. All rights reserved.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildContactEmailHtml({ name, email, subject, message }) {
  const content = `
    <p style="margin:0 0 10px 0;color:${colors.subtext};font-size:14px;">You received a new message from your website contact form.</p>
    <div style="margin:18px 0 10px 0;">
      <div style="font-size:14px;color:${colors.subtext};margin:0 0 6px;">From</div>
      <div style="font-size:16px;font-weight:600;color:${colors.text};">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</div>
    </div>
    <div style="margin:14px 0 10px 0;">
      <div style="font-size:14px;color:${colors.subtext};margin:0 0 6px;">Subject</div>
      <div style="font-size:16px;color:${colors.text};">${escapeHtml(subject || 'New Contact Form Message')}</div>
    </div>
    <div style="margin:14px 0 10px 0;">
      <div style="font-size:14px;color:${colors.subtext};margin:0 0 6px;">Message</div>
      <div style="font-size:16px;color:${colors.text};white-space:pre-wrap;">${escapeHtml(message)}</div>
    </div>
  `;
  return baseWrapper({
    title: 'New Contact Message',
    subtitle: 'Customer inquiry',
    contentHtml: content
  });
}

export function buildInvoiceEmailHtml({ customerName, orderNumber }) {
  const content = `
    <p style="margin:0 0 10px 0;font-size:16px;">Hi ${escapeHtml(customerName || '')},</p>
    <p style="margin:0 0 14px 0;font-size:16px;">Thank you for your order <b>${escapeHtml(orderNumber)}</b>. Your invoice is attached as a PDF.</p>
    <p style="margin:0;font-size:14px;color:${colors.subtext};">If you have any questions, just reply to this email and our team will help.</p>
  `;
  return baseWrapper({
    title: 'Your Order Invoice',
    subtitle: 'Purchase confirmation',
    contentHtml: content
  });
}

// Optional: plain text builders (fallbacks)
export function buildContactText({ name, email, subject, message }) {
  return `New Contact Message\nFrom: ${name} <${email}>\nSubject: ${subject || 'New Contact Form Message'}\n\n${message}`;
}

export function buildInvoiceText({ customerName, orderNumber }) {
  return `Hi ${customerName || ''},\n\nThank you for your order ${orderNumber}. Your invoice is attached as a PDF.\n`;
}

export function buildResetPasswordEmailHtml({ name, url }) {
  const content = `
    <p style="margin:0 0 10px 0;font-size:16px;">Hi ${escapeHtml(name || 'there')},</p>
    <p style="margin:0 0 14px 0;font-size:16px;">We received a request to reset your Herb & Veda account password.</p>
    <p style="margin:0 0 14px 0;font-size:16px;">Click the button below to set a new password. This link will expire soon for your security.</p>
    <div style="margin:18px 0;">
      <a href="${escapeHtml(url)}" style="display:inline-block;background:${colors.accent};color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">Reset Password</a>
    </div>
    <p style="margin:0 0 6px 0;font-size:14px;color:${colors.subtext};">If the button doesn’t work, copy and paste this link into your browser:</p>
    <div style="font-size:12px;color:${colors.subtext};word-break:break-all;">${escapeHtml(url)}</div>
    <p style="margin:14px 0 0 0;font-size:14px;color:${colors.subtext};">If you didn’t request this, you can safely ignore this email.</p>
  `;
  return baseWrapper({ title: 'Reset your password', subtitle: 'Account security', contentHtml: content });
}

export function buildResetPasswordText({ name, url }) {
  return `Hi ${name || 'there'},\n\nWe received a request to reset your Herb & Veda account password.\nUse the link below to set a new password (it expires soon):\n${url}\n\nIf you didn’t request this, you can ignore this email.`;
}
