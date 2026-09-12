import { Router } from 'express';
import Alert from '../models/Alert';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.status) filter.status = req.query.status;

    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string)
      };
    }

    const [alerts, total] = await Promise.all([
      Alert.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Alert.countDocuments(filter)
    ]);

    res.json({
      alerts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const severityStats = await Alert.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    const typeStats = await Alert.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({ severityStats, typeStats });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('relatedLogIds');
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const alert = await Alert.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
