import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { connectMongo } from '../lib/mongo.js';
import { User } from '../models/User.js';

async function main() {
  await connectMongo();
  const email = 'demo@herbveda.com';
  const name = 'Herb & Veda Demo';
  const password = 'Passw0rd!';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Demo user already exists:', email);
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ email, name, passwordHash });
  console.log('Created demo user:', { email, password });
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
