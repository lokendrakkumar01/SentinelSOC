import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const Header: React.FC = () => {
  const { isConnected } = useSocket();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10 hidden md:flex">
      <h1 className="text-xl font-semibold text-gray-100">Global Threat Operations</h1>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span className="font-mono">{time.toISOString().split('T')[0]}</span>
          <span className="font-mono font-medium text-gray-200">{time.toLocaleTimeString()}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
          <span className="text-xs font-medium text-gray-400">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>
        
        <button className="relative p-2 text-gray-400 hover:text-white focus:outline-none">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(34,211,238,0.8)]"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
