import React, { useState, useEffect, useRef } from 'react';
import { Bell, ShieldAlert, CheckCircle, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import SeverityBadge from '../common/SeverityBadge';

interface AlertNotification {
  _id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  sourceIP?: string;
  username?: string;
  createdAt: string;
  read?: boolean;
}

const Header: React.FC = () => {
  const { isConnected, onAlert } = useSocket();
  const [time, setTime] = useState(new Date());
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    const fetchRecentAlerts = async () => {
      try {
        const res = await api.get('/alerts?limit=8');
        const list = res.data.alerts || res.data || [];
        setNotifications(list);
        setUnreadCount(list.length);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    fetchRecentAlerts();
  }, []);

  // Live WebSocket alert listener
  useEffect(() => {
    onAlert((newAlert: AlertNotification) => {
      setNotifications(prev => [newAlert, ...prev.slice(0, 19)]);
      setUnreadCount(c => c + 1);
    });
  }, [onAlert]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  const handleAlertClick = (id: string) => {
    setIsOpen(false);
    navigate('/alerts');
  };

  const getTimeAgo = (dateStr: string) => {
    const delta = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (isNaN(delta) || delta < 60) return 'Just now';
    if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
    return `${Math.floor(delta / 3600)}h ago`;
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-20 relative">
      <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        Global Threat Operations
      </h1>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span className="font-mono">{time.toISOString().split('T')[0]}</span>
          <span className="font-mono font-medium text-gray-200">{time.toLocaleTimeString()}</span>
        </div>
        
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
          <span className="text-xs font-semibold tracking-wider text-gray-300">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
        
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800 focus:outline-none"
            aria-label="Security Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} className="text-cyan-400" />
                  <span className="font-semibold text-sm text-gray-100">Security Alerts</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs px-2 py-0.5 rounded-full font-mono font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead} 
                    className="text-xs text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle size={13} />
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    No recent security incidents detected.
                  </div>
                ) : (
                  notifications.map((alert) => (
                    <div 
                      key={alert._id}
                      onClick={() => handleAlertClick(alert._id)}
                      className="p-3 hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-3"
                    >
                      <div className="mt-0.5">
                        <SeverityBadge level={alert.severity} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-200 truncate">{alert.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 font-mono">
                          {alert.sourceIP && <span>IP: {alert.sourceIP}</span>}
                          {alert.username && <span>• {alert.username}</span>}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">
                        {getTimeAgo(alert.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 text-center">
                <button 
                  onClick={() => { setIsOpen(false); navigate('/alerts'); }}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 flex items-center justify-center gap-1.5 transition-colors"
                >
                  View All Incidents in Alert Center
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
