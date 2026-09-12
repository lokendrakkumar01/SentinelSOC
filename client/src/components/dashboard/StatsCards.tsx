import React from 'react';
import { Database, AlertTriangle, Zap, ShieldOff } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const StatsCards: React.FC = () => {
  const { stats, loading } = useDashboardStats();

  const cards = [
    {
      title: 'Total Logs',
      value: stats?.totalLogs || 0,
      icon: Database,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500',
      trend: '+12% /hr'
    },
    {
      title: 'Active Alerts',
      value: stats?.activeAlerts ?? stats?.totalAlerts ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500',
      trend: '+2 /hr'
    },
    {
      title: 'Critical Alerts',
      value: stats?.criticalAlerts ?? stats?.openAlerts?.CRITICAL ?? 0,
      icon: Zap,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500',
      pulse: ((stats?.criticalAlerts ?? stats?.openAlerts?.CRITICAL ?? 0) > 0),
      trend: '+0 /hr'
    },
    {
      title: 'Blocked IPs',
      value: stats?.blockedIPs ?? stats?.blockedIps ?? 0,
      icon: ShieldOff,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500',
      trend: '+1 /day'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className={`relative overflow-hidden bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-5 border-l-4 ${card.borderColor} ${card.pulse ? 'animate-pulse-red' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold text-white font-mono">
                {loading ? '...' : card.value.toLocaleString()}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-gray-500 font-mono bg-slate-950 px-2 py-1 rounded">{card.trend}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
