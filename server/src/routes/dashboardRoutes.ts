import { Router } from 'express';
import Log from '../models/Log';
import Alert from '../models/Alert';
import BlockedIP from '../models/BlockedIP';
import { autoResponseService } from '../services/autoResponseService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      totalAlerts,
      recentAlerts,
      openAlertsBySeverity,
      alertsByType,
      alertsBySeverity,
      logsPerHour
    ] = await Promise.all([
      Log.countDocuments(),
      Alert.countDocuments(),
      Alert.find().sort({ createdAt: -1 }).limit(10),
      Alert.aggregate([
        { $match: { status: { $in: ['OPEN', 'INVESTIGATING'] } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Log.aggregate([
        { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
        { 
          $group: { 
            _id: { 
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' },
              hour: { $hour: '$timestamp' }
            }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
      ])
    ]);

    const openAlertsObj = openAlertsBySeverity.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    const activeAlertsCount = (Object.values(openAlertsObj) as number[]).reduce((a, b) => a + b, 0);
    const criticalAlertsCount = openAlertsObj['CRITICAL'] || 0;
    const blockedCount = await BlockedIP.countDocuments({ isActive: true });

    res.json({
      totalLogs,
      totalAlerts,
      activeAlerts: activeAlertsCount || totalAlerts,
      criticalAlerts: criticalAlertsCount,
      blockedIPs: blockedCount,
      blockedIps: blockedCount,
      openAlerts: openAlertsObj,
      recentAlerts,
      alertsByType,
      alertsBySeverity,
      severityBreakdown: alertsBySeverity,
      logsPerHour
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
