import React from 'react';
import SeverityBadge from '../common/SeverityBadge';

interface AlertCardProps {
  alert: any;
  onClick: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
  const getTimeAgo = (timestamp: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff/60)}h ago`;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:bg-slate-800/50 hover:border-slate-700 cursor-pointer transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <SeverityBadge level={alert.severity} />
          <span className={`text-xs px-2 py-0.5 rounded border ${
            alert.status === 'OPEN' ? 'bg-red-900/30 text-red-400 border-red-900/50' : 
            alert.status === 'INVESTIGATING' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50' : 
            'bg-green-900/30 text-green-400 border-green-900/50'
          }`}>
            {alert.status || 'OPEN'}
          </span>
        </div>
        <span className="text-xs text-gray-500 font-mono">{getTimeAgo(alert.timestamp)}</span>
      </div>
      
      <h3 className="text-sm font-semibold text-gray-200 mb-1">{alert.type}</h3>
      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{alert.description}</p>
      
      <div className="flex justify-between items-center text-xs">
        <div className="flex space-x-4">
          <span className="text-gray-500 font-mono">IP: <span className="text-gray-300">{alert.sourceIp}</span></span>
          {alert.username && <span className="text-gray-500 font-mono">USR: <span className="text-gray-300">{alert.username}</span></span>}
        </div>
        {alert.mitreTechniqueId && (
          <span className="bg-blue-900/30 text-blue-400 border border-blue-900/50 px-1.5 py-0.5 rounded font-mono">
            {alert.mitreTechniqueId}
          </span>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
