import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bell, Shield, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Blocked IPs', path: '/blocked', icon: Shield },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <ShieldAlert className="w-8 h-8 text-cyan-400 mr-2" />
          <span className="text-xl font-bold text-white tracking-wider">SentinelSOC</span>
        </div>
        
        <nav className="p-4 space-y-2 mt-4 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-800/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                    : 'text-gray-400 hover:bg-slate-800 hover:text-gray-200'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full border-t border-slate-800 p-4">
          <div className="flex items-center mb-4 text-sm text-gray-400">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-white font-medium truncate">{user?.name || 'Analyst'}</p>
              <p className="text-xs truncate">{user?.email || 'analyst@soc.local'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-400 rounded-lg hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
