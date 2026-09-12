import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SeverityBadge from '../common/SeverityBadge';
import api from '../../api/axios';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

const AlertTable: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts?limit=50');
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'timestamp') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100" />;
    return sortDir === 'asc' ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search alerts..." 
            className="bg-slate-950 border border-slate-700 text-sm rounded-lg pl-9 pr-4 py-2 text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors w-64"
          />
        </div>
        <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/50 text-gray-400 font-mono text-xs uppercase border-b border-slate-800">
            <tr>
              {['Severity', 'Type', 'Source IP', 'User', 'MITRE ID', 'Status', 'Time'].map((col) => (
                <th 
                  key={col} 
                  className="px-4 py-3 cursor-pointer group hover:text-gray-200 transition-colors"
                  onClick={() => handleSort(col.toLowerCase().replace(' ', ''))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col}</span>
                    <SortIcon field={col.toLowerCase().replace(' ', '')} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 font-mono">Loading telemetry...</td></tr>
            ) : sortedAlerts.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 font-mono">No alerts found</td></tr>
            ) : (
              sortedAlerts.map((alert) => (
                <tr 
                  key={alert.id || alert._id} 
                  onClick={() => navigate(`/alerts/${alert.id || alert._id}`)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3"><SeverityBadge level={alert.severity} /></td>
                  <td className="px-4 py-3 text-gray-200 font-medium truncate max-w-[200px]">{alert.type}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono">{alert.sourceIP || alert.sourceIp || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-400">{alert.username || '-'}</td>
                  <td className="px-4 py-3">
                    {(alert.mitreAttack?.techniqueId || alert.mitreTechniqueId) ? (
                      <span className="text-xs bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
                        {alert.mitreAttack?.techniqueId || alert.mitreTechniqueId}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      alert.status === 'OPEN' ? 'text-red-400 bg-red-950/30 border border-red-800/40' : 
                      alert.status === 'INVESTIGATING' ? 'text-yellow-400 bg-yellow-950/30 border border-yellow-800/40' : 
                      'text-green-400 bg-green-950/30 border border-green-800/40'
                    }`}>
                      {alert.status || 'OPEN'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {new Date(alert.createdAt || alert.timestamp || Date.now()).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-slate-800 flex justify-end">
        <div className="flex space-x-1">
          <button className="px-3 py-1 text-sm bg-slate-800 text-gray-400 rounded hover:bg-slate-700 transition-colors" disabled>Prev</button>
          <button className="px-3 py-1 text-sm bg-slate-800 text-gray-400 rounded hover:bg-slate-700 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
};

export default AlertTable;
