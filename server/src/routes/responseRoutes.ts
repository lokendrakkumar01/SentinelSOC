import { Router } from 'express';
import { autoResponseService } from '../services/autoResponseService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

const checkAdmin = (req: AuthRequest, res: any, next: any) => {
  if (!req.user || !['admin', 'analyst'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Operator privileges required' });
  }
  next();
};

router.post('/block-ip', authMiddleware, checkAdmin, async (req, res) => {
  const { ip, reason } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP required' });
  
  await autoResponseService.blockIP(ip, reason || 'Manual block via API');
  res.json({ message: `IP ${ip} blocked successfully` });
});

router.post('/unblock-ip', authMiddleware, checkAdmin, async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP required' });
  
  await autoResponseService.unblockIP(ip);
  res.json({ message: `IP ${ip} unblocked successfully` });
});

router.get('/blocked-ips', authMiddleware, (req, res) => {
  res.json({ ips: autoResponseService.getBlockedIPs() });
});

export default router;
