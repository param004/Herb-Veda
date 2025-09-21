import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Ensure .env is loaded from server root even if cwd is src/
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectMongo } from './lib/mongo.js';
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import contactRoutes from './routes/contact.routes.js';
import otpRoutes from './routes/otp.routes.js';

const app = express();

app.use(cors({
  // If CLIENT_URL is provided (comma-separated), restrict to those; otherwise reflect request origin
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true,
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ ok: true, name: 'Herb & Veda Ayurvedic Company API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/contact', contactRoutes);


const PORT = process.env.PORT || 5000;

connectMongo()
  .then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
