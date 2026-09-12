import { ILog } from '../models/Log';
import { IAlert } from '../models/Alert';
import UserBaseline from '../models/UserBaseline';
import { MITRE_MAPPINGS } from './mitreMapping';
import { haversineDistance } from '../utils/mathUtils';
import { logger } from '../utils/logger';

export class ImpossibleTravelDetector {
  async analyze(logEvent: ILog): Promise<Partial<IAlert> | null> {
    if (logEvent.action !== 'LOGIN_SUCCESS') return null;
    
    const currentGeo = logEvent.geoLocation;
    if (!currentGeo || !currentGeo.lat || !currentGeo.lon) return null;

    const baseline = await UserBaseline.findOne({ username: logEvent.username });
    if (!baseline || !baseline.lastLoginGeo || !baseline.lastLoginGeo.lat || !baseline.lastLoginGeo.lon || !baseline.lastLoginAt) {
      return null;
    }

    const lastGeo = baseline.lastLoginGeo;
    const lastLoginTime = new Date(baseline.lastLoginAt).getTime();
    const currentTime = new Date(logEvent.timestamp).getTime();
    
    // Time difference in hours
    const timeDeltaHours = (currentTime - lastLoginTime) / (1000 * 60 * 60);
    
    if (timeDeltaHours <= 0) return null; // Avoid division by zero or negative time

    const distanceKm = haversineDistance(
      lastGeo.lat, lastGeo.lon,
      currentGeo.lat, currentGeo.lon
    );

    const speedKmh = distanceKm / timeDeltaHours;

    // Commercial airliner speed is ~900 km/h
    if (speedKmh > 900) {
      logger.error(`Impossible travel detected for ${logEvent.username}. Speed: ${speedKmh.toFixed(2)} km/h`);
      
      return {
        type: 'IMPOSSIBLE_TRAVEL',
        severity: 'CRITICAL',
        title: `Impossible Travel Detected for ${logEvent.username}`,
        description: `Login from ${currentGeo.city}, ${currentGeo.country} is ${distanceKm.toFixed(0)}km away from previous login location ${lastGeo.city}, ${lastGeo.country} just ${timeDeltaHours.toFixed(2)} hours ago. Required speed: ${speedKmh.toFixed(0)} km/h.`,
        username: logEvent.username,
        sourceIP: logEvent.sourceIP,
        mitreAttack: MITRE_MAPPINGS.IMPOSSIBLE_TRAVEL,
        relatedLogIds: [logEvent._id as any]
      };
    }

    return null;
  }
}
