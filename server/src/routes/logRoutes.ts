import { Router } from 'express';
import Log, { ILog } from '../models/Log';
import { geoIpService } from '../services/geoIpService';
import { autoResponseService } from '../services/autoResponseService';
import { StreamProducer } from '../queue/producer';
import { socketService } from '../services/socketService';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { timestamp, sourceIP, username, action, userAgent, rawMessage, metadata } = req.body;
    
    if (!timestamp || !sourceIP || !username || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let status: 'SUCCESS' | 'FAILURE' | 'BLOCKED' = req.body.status || 'SUCCESS';
    
    if (autoResponseService.isBlocked(sourceIP)) {
      status = 'BLOCKED';
    }

    const geoLocation = await geoIpService.getGeoLocation(sourceIP) || undefined;

    const log = new Log({
      timestamp: new Date(timestamp),
      sourceIP,
      username,
      action,
      status,
      userAgent,
      rawMessage,
      geoLocation,
      metadata
    });

    await log.save();

    // Push to Redis Stream for background processing
    await StreamProducer.publish('logs:incoming', {
      _id: log._id.toString(),
      timestamp: log.timestamp.toISOString(),
      sourceIP: log.sourceIP,
      username: log.username,
      action: log.action,
      status: log.status,
      geoLocation: JSON.stringify(log.geoLocation || {})
    });

    // Emit live event
    socketService.emitLog(log);

    res.status(201).json({ message: 'Log ingested successfully', id: log._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.sourceIP) filter.sourceIP = req.query.sourceIP;
    if (req.query.username) filter.username = req.query.username;
    if (req.query.action) filter.action = req.query.action;
    if (req.query.status) filter.status = req.query.status;
    
    if (req.query.startDate && req.query.endDate) {
      filter.timestamp = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string)
      };
    }

    const [logs, total] = await Promise.all([
      Log.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit),
      Log.countDocuments(filter)
    ]);

    res.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
