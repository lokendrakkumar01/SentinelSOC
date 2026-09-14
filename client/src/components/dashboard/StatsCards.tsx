import React from 'react';
import { Database, AlertTriangle, Zap, ShieldOff, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const StatsCards: React.FC = () => {
  const { stats, loading } = useDashboardStats();
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Total Logs',
      value: stats?.totalLogs || 0,
      icon: Database,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500',
      trend: '+12% /hr',
      link: '/alerts'
    },
    {
      title: 'Active Alerts',
      value: stats?.activeAlerts ?? stats?.totalAlerts ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-500',
      trend: '+2 /hr',
      link: '/alerts'
    },
    {
      title: 'Critical Alerts',
      value: stats?.criticalAlerts ?? stats?.openAlerts?.CRITICAL ?? 0,
      icon: Zap,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-500',
      pulse: ((stats?.criticalAlerts ?? stats?.openAlerts?.CRITICAL ?? 0) > 0),
      trend: '+0 /hr',
      link: '/alerts'
    },
    {
      title: 'Blocked IPs',
      value: stats?.blockedIPs ?? stats?.blockedIps ?? 0,
      icon: ShieldOff,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500',
      trend: '+1 /day',
      link: '/blocked'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          onClick={() => navigate(card.link)}
          className={`relative overflow-hidden bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-5 border-l-4 ${card.borderColor} ${card.pulse ? 'animate-pulse-red' : ''} cursor-pointer hover:border-slate-700 hover:bg-slate-850 hover:shadow-cyan-950/20 transition-all duration-200 group`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-1 flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                {card.title}
                <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <h3 className="text-3xl font-bold text-white font-mono">
                {loading ? '...' : card.value.toLocaleString()}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor} group-hover:scale-110 transition-transform`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono bg-slate-950 px-2 py-1 rounded">{card.trend}</span>
            <span className="text-[11px] text-cyan-500/80 font-mono opacity-0 group-hover:opacity-100 transition-opacity">View details →</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
