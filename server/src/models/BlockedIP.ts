import mongoose, { Document, Schema } from 'mongoose';

export interface IBlockedIP extends Document {
  ip: string;
  reason?: string;
  alertId?: mongoose.Types.ObjectId;
  blockedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

const BlockedIPSchema: Schema = new Schema({
  ip: { type: String, required: true, unique: true },
  reason: String,
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' },
  blockedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
});

export default mongoose.model<IBlockedIP>('BlockedIP', BlockedIPSchema);
