import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifySmtp, sendOtpEmail } from '../lib/mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  try {
    console.log('[test] Verifying SMTP connection to', process.env.SMTP_HOST || 'gmail', 'as', process.env.SMTP_USER);
    await verifySmtp();
    console.log('[test] SMTP verify: OK');
    // Optional: send a test OTP to yourself
    const to = process.env.SMTP_USER;
    await sendOtpEmail(to, '123456');
    console.log('[test] Test email sent to', to);
    process.exit(0);
  } catch (err) {
    console.error('[test] SMTP verify FAILED:', err && (err.response || err.message || err));
    if (err && err.code) console.error('[test] code:', err.code);
    process.exit(1);
  }
}

main();
