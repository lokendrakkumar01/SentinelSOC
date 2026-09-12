import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import SeverityBadge from '../common/SeverityBadge';
import api from '../../api/axios';

const LiveFeed: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const { onAlert } = useSocket();
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts?limit=30');
      if (res.data.alerts) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error('Error fetching live alerts:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    onAlert((newAlert) => {
      setAlerts((prev) => {
        const withoutDup = prev.filter(a => (a._id || a.id) !== (newAlert._id || newAlert.id));
        return [newAlert, ...withoutDup].slice(0, 50);
      });
    });
  }, [onAlert]);

  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'Just now';
    const parsed = new Date(timestamp).getTime();
    if (isNaN(parsed)) return 'Just now';
    const diff = Math.floor((Date.now() - parsed) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff/60)}h ago`;
  };

  return (
    <div className="h-full overflow-y-auto space-y-2 p-4 custom-scrollbar">
      {alerts.length === 0 ? (
        <div className="text-center text-gray-500 text-sm mt-10">Waiting for telemetry...</div>
      ) : (
        alerts.map((alert) => (
          <div 
            key={alert.id || alert._id} 
            onClick={() => navigate(`/alerts/${alert.id || alert._id}`)}
            className="bg-slate-950 border border-slate-800 rounded-lg p-3 hover:bg-slate-800 cursor-pointer transition-all transform hover:scale-[1.01] animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <SeverityBadge level={alert.severity} />
                <span className="text-xs text-gray-500 font-mono">{getTimeAgo(alert.createdAt || alert.timestamp)}</span>
              </div>
              {(alert.mitreAttack?.techniqueId || alert.mitreTechniqueId) && (
                <span className="text-[10px] text-cyan-500 font-mono bg-cyan-950 px-1.5 rounded border border-cyan-900">
                  {alert.mitreAttack?.techniqueId || alert.mitreTechniqueId}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-200 mb-1 truncate">{alert.title || alert.type}</p>
            <div className="flex justify-between text-xs text-gray-400 font-mono">
              <span className="truncate w-1/2">IP: {alert.sourceIP || alert.sourceIp || 'N/A'}</span>
              <span className="truncate w-1/2 text-right">User: {alert.username || 'N/A'}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LiveFeed;
