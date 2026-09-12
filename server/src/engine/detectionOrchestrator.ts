import { ILog } from '../models/Log';
import Alert, { IAlert } from '../models/Alert';
import { BruteForceDetector } from './bruteForceDetector';
import { StatisticalDetector } from './statisticalDetector';
import { ImpossibleTravelDetector } from './impossibleTravel';
import { socketService } from '../services/socketService';
import { autoResponseService } from '../services/autoResponseService';
import { notificationService } from '../services/notificationService';
import { logger } from '../utils/logger';

export class DetectionOrchestrator {
  private bruteForceDetector: BruteForceDetector;
  private statisticalDetector: StatisticalDetector;
  private impossibleTravelDetector: ImpossibleTravelDetector;

  constructor() {
    this.bruteForceDetector = new BruteForceDetector();
    this.statisticalDetector = new StatisticalDetector();
    this.impossibleTravelDetector = new ImpossibleTravelDetector();
  }

  async analyze(logEvent: ILog): Promise<IAlert[]> {
    const promises = [
      this.bruteForceDetector.analyze(logEvent),
      this.statisticalDetector.analyze(logEvent),
      this.impossibleTravelDetector.analyze(logEvent)
    ];

    const results = await Promise.allSettled(promises);
    
    const createdAlerts: IAlert[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const alertData = result.value;
        
        try {
          // Handle auto-response
          if (alertData.severity === 'CRITICAL' && alertData.sourceIP) {
            await autoResponseService.blockIP(
              alertData.sourceIP, 
              `Auto-blocked due to CRITICAL alert: ${alertData.title}`
            );
            alertData.autoResponseTaken = `Blocked IP ${alertData.sourceIP}`;
          }

          const alert = new Alert(alertData);
          await alert.save();
          createdAlerts.push(alert);

          // Emit alert
          socketService.emitAlert(alert);

          // Notifications
          if (['HIGH', 'CRITICAL'].includes(alert.severity)) {
            await notificationService.notify(alert);
          }
          
        } catch (error) {
          logger.error('Failed to create or process alert:', error);
        }
      } else if (result.status === 'rejected') {
        logger.error('Detector failed during analysis:', result.reason);
      }
    }

    return createdAlerts;
  }
}

export const detectionOrchestrator = new DetectionOrchestrator();
