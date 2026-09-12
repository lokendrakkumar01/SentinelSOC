import { ILog } from '../models/Log';
import { IAlert } from '../models/Alert';
import { MITRE_MAPPINGS } from './mitreMapping';
import { logger } from '../utils/logger';

export class BruteForceDetector {
  private failedAttempts = new Map<string, { count: number, timestamps: number[] }>();
  private readonly WINDOW_MS = 60 * 1000;
  private readonly THRESHOLD = 5;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 120 * 1000);
  }

  async analyze(logEvent: ILog): Promise<Partial<IAlert> | null> {
    if (logEvent.action !== 'LOGIN_FAILED') return null;

    const ip = logEvent.sourceIP;
    const now = new Date(logEvent.timestamp).getTime();

    if (!this.failedAttempts.has(ip)) {
      this.failedAttempts.set(ip, { count: 0, timestamps: [] });
    }

    const data = this.failedAttempts.get(ip)!;
    data.timestamps.push(now);
    
    // Filter timestamps within window
    data.timestamps = data.timestamps.filter(t => now - t <= this.WINDOW_MS);
    data.count = data.timestamps.length;

    if (data.count >= this.THRESHOLD) {
      const severity = data.count >= 10 ? 'CRITICAL' : 'HIGH';
      
      logger.warn(`Brute force detected from ${ip}. Count: ${data.count}`);
      
      return {
        type: 'BRUTE_FORCE',
        severity,
        title: `Possible Brute Force Attack from ${ip}`,
        description: `Detected ${data.count} failed login attempts from ${ip} within 60 seconds.`,
        sourceIP: ip,
        username: logEvent.username, // Might be varying, but we take the last one
        mitreAttack: MITRE_MAPPINGS.BRUTE_FORCE,
        relatedLogIds: [logEvent._id as any]
      };
    }

    return null;
  }

  private cleanup() {
    const now = Date.now();
    for (const [ip, data] of this.failedAttempts.entries()) {
      data.timestamps = data.timestamps.filter(t => now - t <= this.WINDOW_MS);
      if (data.timestamps.length === 0) {
        this.failedAttempts.delete(ip);
      }
    }
  }

  stop() {
    clearInterval(this.cleanupInterval);
  }
}
