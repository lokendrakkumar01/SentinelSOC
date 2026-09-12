import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api/axios';

const TimelineView: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const { onAlert, onLog } = useSocket();

  useEffect(() => {
    Promise.all([
      api.get('/alerts?limit=10'),
    ]).then(([alertsRes]) => {
      const merged = [...(alertsRes.data.alerts || [])].sort((a, b) => {
        const timeB = new Date(b.createdAt || b.timestamp).getTime();
        const timeA = new Date(a.createdAt || a.timestamp).getTime();
        return timeB - timeA;
      }).slice(0, 20);
      setEvents(merged);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const handleNewEvent = (event: any) => {
      setEvents(prev => {
        const updated = [event, ...prev].sort((a, b) => {
          const timeB = new Date(b.createdAt || b.timestamp).getTime();
          const timeA = new Date(a.createdAt || a.timestamp).getTime();
          return timeB - timeA;
        });
        return updated.slice(0, 20);
      });
    };
    onAlert(handleNewEvent);
  }, [onAlert]);

  const getColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative border-l border-slate-700 ml-3 space-y-6">
      {events.map((event, idx) => (
        <div key={event.id || event._id || idx} className="relative pl-6 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full ${getColor(event.severity)} shadow-[0_0_5px_currentColor]`}></div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-medium text-gray-200">{event.title || event.type || 'Event Activity'}</span>
              <span className="text-xs text-gray-500 font-mono">{new Date(event.createdAt || event.timestamp || Date.now()).toLocaleTimeString()}</span>
            </div>
            <p className="text-xs text-gray-400 mb-2 truncate">{event.description || 'System recorded an event.'}</p>
            <div className="flex space-x-3 text-[10px] text-gray-500 font-mono">
              <span>{event.sourceIP || event.sourceIp || 'Internal'}</span>
              {event.username && <span>| {event.username}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineView;
