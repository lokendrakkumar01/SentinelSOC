import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Shield, ShieldAlert, CheckCircle, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const BlockedIPsPage: React.FC = () => {
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [newIp, setNewIp] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBlockedIPs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/response/blocked-ips');
      setBlockedIPs(res.data.ips || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load blocked IP registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedIPs();
  }, []);

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp) return;
    try {
      await api.post('/response/block-ip', { ip: newIp, reason: reason || 'Manual operator containment' });
      toast.success(`IP ${newIp} neutralized and blocked`);
      setNewIp('');
      setReason('');
      fetchBlockedIPs();
    } catch (err) {
      toast.error('Failed to block IP');
    }
  };

  const handleUnblock = async (ip: string) => {
    try {
      await api.post('/response/unblock-ip', { ip });
      toast.success(`IP ${ip} restored`);
      fetchBlockedIPs();
    } catch (err) {
      toast.error('Failed to unblock IP');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono tracking-wider flex items-center">
            <ShieldAlert className="w-7 h-7 text-orange-400 mr-3" />
            Automated Defense & Blocked Nodes
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Active perimeter firewall rules preventing malicious connection attempts.
          </p>
        </div>
        <button 
          onClick={fetchBlockedIPs}
          className="flex items-center space-x-2 px-3 py-2 bg-slate-900 border border-slate-800 text-gray-300 rounded-lg hover:bg-slate-800 text-sm font-mono transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Manual Block Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h2 className="text-sm font-mono text-gray-300 uppercase tracking-wider mb-4 flex items-center">
          <Plus className="w-4 h-4 mr-2 text-cyan-400" />
          Enforce Manual IP Containment
        </h2>
        <form onSubmit={handleBlock} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input 
              type="text" 
              placeholder="e.g. 185.220.101.34" 
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 text-sm rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <div>
            <input 
              type="text" 
              placeholder="Reason (e.g. Malicious port probe)" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-sm rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg text-sm transition-all font-mono shadow-[0_0_15px_rgba(234,88,12,0.2)]"
            >
              Add Firewall Block Rule
            </button>
          </div>
        </form>
      </div>

      {/* Active Rules List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <h2 className="text-sm font-mono text-gray-300 uppercase tracking-wider flex items-center">
            <Shield className="w-4 h-4 mr-2 text-red-400" />
            Active Containment Registry ({blockedIPs.length})
          </h2>
        </div>

        {blockedIPs.length === 0 ? (
          <div className="p-10 text-center text-gray-500 font-mono text-sm">
            No active IP blocks currently enforced.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {blockedIPs.map((ip) => (
              <div key={ip} className="p-4 flex justify-between items-center hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  <span className="font-mono text-red-400 font-semibold text-base">{ip}</span>
                  <span className="text-xs font-mono bg-red-950/50 text-red-300 border border-red-800/40 px-2 py-0.5 rounded">
                    BLOCKED
                  </span>
                </div>
                <button
                  onClick={() => handleUnblock(ip)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700 rounded text-xs font-mono transition-colors flex items-center space-x-1"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  <span>Unblock Node</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedIPsPage;
