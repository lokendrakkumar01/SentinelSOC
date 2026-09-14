import { logger } from '../utils/logger';

interface GeoLocation {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  lat: number | null;
  lon: number | null;
  timezone: string;
  isp: string;
}

class GeoIpService {
  private cache = new Map<string, { data: GeoLocation, expires: number }>();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour
  private readonly MAX_CACHE_SIZE = 1000;

  isPrivateIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return ip === '::1' || ip === '127.0.0.1'; // simple check, handle IPv6 loopback

    const p1 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[1], 10);

    return (
      p1 === 10 ||
      (p1 === 172 && p2 >= 16 && p2 <= 31) ||
      p1 === 192 && p2 === 168 ||
      p1 === 127 ||
      p1 === 169 && p2 === 254
    );
  }

  async getGeoLocation(ip: string): Promise<GeoLocation | null> {
    if (this.isPrivateIP(ip)) {
      return { ip, country: 'Internal', countryCode: 'INT', city: 'Local Network', lat: null, lon: null, timezone: 'UTC', isp: 'Internal' };
    }

    const cached = this.cache.get(ip);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      // 1. ip-api.com
      const res = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await res.json();
      
      if (data.status === 'success') {
        const geo: GeoLocation = {
          ip,
          country: data.country,
          countryCode: data.countryCode,
          city: data.city,
          lat: data.lat,
          lon: data.lon,
          timezone: data.timezone,
          isp: data.isp
        };
        this.setCache(ip, geo);
        return geo;
      }
    } catch (err) {
      logger.warn('GeoIP fetch failed (ip-api.com):', err);
    }
    
    return null;
  }

  private setCache(ip: string, data: GeoLocation) {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(ip, { data, expires: Date.now() + this.CACHE_TTL });
  }
}

export const geoIpService = new GeoIpService();
