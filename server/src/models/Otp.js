import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, lowercase: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    codeHash: { type: String, required: true },
    type: { type: String, enum: ['login', 'register', 'verifyEmail'], required: true },
    expiresAt: { type: Date, required: true },
    payload: { type: Object }, // for register: { name, passwordHash }
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// TTL index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model('Otp', otpSchema);
