import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useSocket } from '../../hooks/useSocket';

const MitreMatrix: React.FC = () => {
  const [techniqueCounts, setTechniqueCounts] = useState<Record<string, number>>({});
  const { onAlert } = useSocket();

  const fetchAlertTechniques = async () => {
    try {
      const res = await api.get('/alerts?limit=100');
      const counts: Record<string, number> = {};
      for (const alert of (res.data.alerts || [])) {
        const id = alert.mitreAttack?.techniqueId || alert.mitreTechniqueId;
        if (id) {
          counts[id] = (counts[id] || 0) + 1;
        }
      }
      setTechniqueCounts(counts);
    } catch (err) {
      console.error('Error fetching MITRE counts:', err);
    }
  };

  useEffect(() => {
    fetchAlertTechniques();
    const interval = setInterval(fetchAlertTechniques, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    onAlert((alert) => {
      const id = alert.mitreAttack?.techniqueId || alert.mitreTechniqueId;
      if (id) {
        setTechniqueCounts(prev => ({
          ...prev,
          [id]: (prev[id] || 0) + 1
        }));
      }
    });
  }, [onAlert]);

  const tactics = [
    { 
      name: 'Initial Access', 
      techniques: [
        { id: 'T1078', name: 'Valid Accounts' },
        { id: 'T1078.004', name: 'Cloud Accounts' }
      ] 
    },
    { 
      name: 'Credential Access', 
      techniques: [
        { id: 'T1110', name: 'Brute Force' },
        { id: 'T1110.001', name: 'Password Spray' }
      ] 
    },
    { 
      name: 'Privilege Esc.', 
      techniques: [
        { id: 'T1548', name: 'Elevation Control' },
        { id: 'T1068', name: 'Exploitation' }
      ] 
    },
    { 
      name: 'Defense Evasion', 
      techniques: [
        { id: 'T1070', name: 'Indicator Removal' },
        { id: 'T1027', name: 'Obfuscated Files' }
      ] 
    },
    { 
      name: 'Lateral Mvmt.', 
      techniques: [
        { id: 'T1021', name: 'Remote Services' },
        { id: 'T1090', name: 'Proxy' }
      ] 
    },
  ];

  const getHeatColor = (count: number) => {
    if (!count || count === 0) return 'bg-slate-900 border-slate-800 text-slate-600';
    if (count < 3) return 'bg-cyan-900/30 border-cyan-700/60 text-cyan-400 font-bold';
    if (count < 10) return 'bg-yellow-900/30 border-yellow-700/60 text-yellow-400 font-bold';
    return 'bg-red-900/40 border-red-700/80 text-red-400 font-bold shadow-[0_0_8px_rgba(239,68,68,0.3)]';
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-2">
      <div className="min-w-max flex space-x-1">
        {tactics.map((tactic, i) => (
          <div key={i} className="flex flex-col space-y-1 w-24">
            <div className="h-8 flex items-center justify-center text-[10px] font-mono text-gray-400 text-center border-b border-slate-800 mb-1 leading-tight">
              {tactic.name}
            </div>
            {tactic.techniques.map((tech, j) => {
              const count = techniqueCounts[tech.id] || 0;
              return (
                <div 
                  key={j} 
                  title={`${tech.id} (${tech.name}) - ${count} detection(s)`}
                  className={`h-8 flex items-center justify-center text-[11px] font-mono rounded border cursor-help transition-all ${getHeatColor(count)}`}
                >
                  <span>{tech.id}</span>
                  {count > 0 && <span className="ml-1 text-[9px] opacity-80">({count})</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MitreMatrix;
