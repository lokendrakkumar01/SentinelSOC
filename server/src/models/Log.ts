import mongoose, { Document, Schema } from 'mongoose';

export interface ILog extends Document {
  timestamp: Date;
  sourceIP: string;
  username: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'FILE_ACCESS' | 'PRIVILEGE_CHANGE' | 'LOGOUT' | 'API_ACCESS' | 'CONFIG_CHANGE';
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  userAgent?: string;
  rawMessage?: string;
  geoLocation?: {
    country?: string;
    countryCode?: string;
    city?: string;
    lat?: number;
    lon?: number;
    isp?: string;
  };
  metadata?: any;
}

const LogSchema: Schema = new Schema({
  timestamp: { type: Date, required: true, index: true },
  sourceIP: { type: String, required: true, index: true },
  username: { type: String, required: true, index: true },
  action: { 
    type: String, 
    enum: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'FILE_ACCESS', 'PRIVILEGE_CHANGE', 'LOGOUT', 'API_ACCESS', 'CONFIG_CHANGE'], 
    required: true 
  },
  status: { type: String, enum: ['SUCCESS', 'FAILURE', 'BLOCKED'], default: 'SUCCESS' },
  userAgent: String,
  rawMessage: String,
  geoLocation: {
    country: String,
    countryCode: String,
    city: String,
    lat: Number,
    lon: Number,
    isp: String
  },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

LogSchema.index({ username: 1, timestamp: -1 });
LogSchema.index({ sourceIP: 1, action: 1, timestamp: -1 });

export default mongoose.model<ILog>('Log', LogSchema);
