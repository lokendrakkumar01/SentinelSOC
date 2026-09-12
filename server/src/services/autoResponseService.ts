import BlockedIP from '../models/BlockedIP';
import { socketService } from './socketService';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

class AutoResponseService {
  private blockedIPs: Set<string> = new Set();

  async loadBlockedIPs() {
    try {
      const ips = await BlockedIP.find({ isActive: true });
      ips.forEach(b => this.blockedIPs.add(b.ip));
      logger.info(`Loaded ${this.blockedIPs.size} blocked IPs into memory.`);
    } catch (error) {
      logger.error('Failed to load blocked IPs:', error);
    }
  }

  async blockIP(ip: string, reason: string, alertId?: mongoose.Types.ObjectId) {
    if (this.blockedIPs.has(ip)) return;

    try {
      this.blockedIPs.add(ip);
      
      const newBlock = new BlockedIP({
        ip,
        reason,
        alertId,
        isActive: true
      });
      
      await newBlock.save();
      
      socketService.emitIPBlocked({ ip, reason, timestamp: new Date() });
      logger.info(`Blocked IP: ${ip} for reason: ${reason}`);
      
    } catch (error) {
      logger.error(`Failed to block IP ${ip}:`, error);
      // Remove from set if DB save failed
      this.blockedIPs.delete(ip);
    }
  }

  async unblockIP(ip: string) {
    try {
      await BlockedIP.updateMany({ ip, isActive: true }, { isActive: false });
      this.blockedIPs.delete(ip);
      logger.info(`Unblocked IP: ${ip}`);
    } catch (error) {
      logger.error(`Failed to unblock IP ${ip}:`, error);
    }
  }

  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }
}

export const autoResponseService = new AutoResponseService();
