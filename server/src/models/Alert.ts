import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
  type: 'BRUTE_FORCE' | 'BEHAVIORAL_ANOMALY' | 'IMPOSSIBLE_TRAVEL' | 'PRIVILEGE_ESCALATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  sourceIP?: string;
  username?: string;
  mitreAttack?: {
    tacticId?: string;
    tacticName?: string;
    techniqueId?: string;
    techniqueName?: string;
    url?: string;
  };
  relatedLogIds: mongoose.Types.ObjectId[];
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  autoResponseTaken?: string;
  createdAt: Date;
}

const AlertSchema: Schema = new Schema({
  type: { 
    type: String, 
    enum: ['BRUTE_FORCE', 'BEHAVIORAL_ANOMALY', 'IMPOSSIBLE_TRAVEL', 'PRIVILEGE_ESCALATION'], 
    required: true 
  },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  sourceIP: String,
  username: String,
  mitreAttack: {
    tacticId: String,
    tacticName: String,
    techniqueId: String,
    techniqueName: String,
    url: String
  },
  relatedLogIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Log' }],
  status: { type: String, enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'], default: 'OPEN' },
  autoResponseTaken: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
});

export default mongoose.model<IAlert>('Alert', AlertSchema);
