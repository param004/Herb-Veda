import dotenv from 'dotenv';
import { generateInvoicePdfBuffer } from '../lib/invoice.js';
import { sendOrderInvoiceEmail, verifySmtp } from '../lib/mailer.js';

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });

async function main() {
  await verifySmtp();

  const sample = {
    orderNumber: 'HVTEST' + Date.now(),
    createdAt: new Date(),
    customerInfo: { name: 'Test User', email: process.env.SMTP_USER || process.env.ADMIN_EMAIL, phone: '9999999999', address: '123 Test Street', city: 'Pune', state: 'MH', pincode: '411001' },
    items: [
      { productId: 'P01', name: 'Ashwagandha', price: '249', quantity: 2 },
      { productId: 'P02', name: 'Shilajit', price: '349', quantity: 1 }
    ],
    subtotal: 249*2 + 349,
    deliveryCharge: 0,
    total: 249*2 + 349
  };

  const pdf = await generateInvoicePdfBuffer(sample);
  const to = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  const subject = `Test Invoice ${sample.orderNumber}`;
  await sendOrderInvoiceEmail({
    to,
    adminBcc: undefined,
    subject,
    html: `<p>Test email for invoice.</p>`,
    attachments: [{ filename: `${sample.orderNumber}.pdf`, content: pdf }]
  });
  console.log('[test] Sent test invoice email to', to);
}

main().catch((e) => {
  console.error('[test] Failed:', e.message || e);
  process.exit(1);
});
