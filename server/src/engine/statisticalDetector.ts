import { ILog } from '../models/Log';
import { IAlert } from '../models/Alert';
import UserBaseline from '../models/UserBaseline';
import { MITRE_MAPPINGS } from './mitreMapping';
import { calculateZScore, calculateIncrementalStats } from '../utils/mathUtils';
import { logger } from '../utils/logger';

export class StatisticalDetector {
  async analyze(logEvent: ILog): Promise<Partial<IAlert> | null> {
    if (logEvent.action !== 'LOGIN_SUCCESS') return null;

    const { username, timestamp } = logEvent;
    
    // Extract hour of day
    const hour = new Date(timestamp).getHours();

    // Get or create baseline
    let baseline = await UserBaseline.findOne({ username });
    if (!baseline) {
      baseline = new UserBaseline({ username });
    }

    let alert: Partial<IAlert> | null = null;

    // We need at least 10 logins to start making statistical inferences
    if (baseline.loginCount >= 10) {
      const zScore = calculateZScore(hour, baseline.avgLoginHour, baseline.stdDevLoginHour);
      
      if (zScore > 2.5) {
        const severity = zScore > 3.5 ? 'HIGH' : 'MEDIUM';
        
        logger.warn(`Behavioral anomaly detected for user ${username}. Z-Score: ${zScore.toFixed(2)}`);
        
        alert = {
          type: 'BEHAVIORAL_ANOMALY',
          severity,
          title: `Unusual Login Time for ${username}`,
          description: `User logged in at ${hour}:00, which is unusual based on their historical pattern (Z-Score: ${zScore.toFixed(2)}).`,
          username: username,
          sourceIP: logEvent.sourceIP,
          mitreAttack: MITRE_MAPPINGS.BEHAVIORAL_ANOMALY,
          relatedLogIds: [logEvent._id as any]
        };
      }
    }

    // Update baseline
    const stats = calculateIncrementalStats(
      baseline.loginHourSum,
      baseline.loginHourSumSq,
      baseline.loginCount,
      hour
    );

    baseline.avgLoginHour = stats.newMean;
    baseline.stdDevLoginHour = stats.newStdDev;
    baseline.loginHourSum = stats.newSum;
    baseline.loginHourSumSq = stats.newSumSq;
    baseline.loginCount = stats.newCount;
    baseline.lastLoginAt = new Date(timestamp);
    baseline.lastLoginIP = logEvent.sourceIP;
    
    if (logEvent.geoLocation) {
      let geo: any = logEvent.geoLocation;
      if (typeof geo === 'string') {
        try { geo = JSON.parse(geo); } catch { geo = null; }
      }
      if (geo && typeof geo === 'object') {
        baseline.lastLoginGeo = {
          lat: typeof geo.lat === 'number' ? geo.lat : undefined,
          lon: typeof geo.lon === 'number' ? geo.lon : undefined,
          country: geo.country || '',
          city: geo.city || ''
        };
      }
    }
    
    baseline.updatedAt = new Date();
    await baseline.save();

    return alert;
  }
}
