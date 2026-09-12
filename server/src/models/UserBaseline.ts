import mongoose, { Document, Schema } from 'mongoose';

export interface IUserBaseline extends Document {
  username: string;
  avgLoginHour: number;
  stdDevLoginHour: number;
  loginHourSum: number;
  loginHourSumSq: number;
  loginCount: number;
  lastLoginIP?: string;
  lastLoginGeo?: {
    lat?: number;
    lon?: number;
    country?: string;
    city?: string;
  };
  lastLoginAt?: Date;
  updatedAt: Date;
}

const UserBaselineSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  avgLoginHour: { type: Number, default: 0 },
  stdDevLoginHour: { type: Number, default: 0 },
  loginHourSum: { type: Number, default: 0 },
  loginHourSumSq: { type: Number, default: 0 },
  loginCount: { type: Number, default: 0 },
  lastLoginIP: String,
  lastLoginGeo: { 
    lat: Number, 
    lon: Number, 
    country: String, 
    city: String 
  },
  lastLoginAt: Date,
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUserBaseline>('UserBaseline', UserBaselineSchema);
