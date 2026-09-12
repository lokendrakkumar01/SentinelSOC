import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SeverityBadge from '../components/common/SeverityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Crosshair, Network, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AlertDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const response = await api.get(`/alerts/${id}`);
        setAlert(response.data);
      } catch (error) {
        console.error('Failed to fetch alert', error);
        toast.error('Failed to load alert details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAlert();
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/alerts/${id}`, { status });
      setAlert({ ...alert, status });
      toast.success(`Alert marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const blockIp = async () => {
    const targetIp = alert.sourceIP || alert.sourceIp;
    try {
      await api.post(`/response/block-ip`, { ip: targetIp, reason: `Associated with alert ${id}` });
      toast.success(`IP ${targetIp} blocked successfully`);
    } catch (error) {
      toast.error('Failed to block IP');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!alert) return <div className="text-center text-gray-400 mt-10">Alert not found</div>;

  const sourceIpDisplay = alert.sourceIP || alert.sourceIp || 'N/A';
  const alertTime = alert.createdAt || alert.timestamp;
  const mitreTechniqueId = alert.mitreAttack?.techniqueId || alert.mitreTechniqueId;
  const mitreTechniqueName = alert.mitreAttack?.techniqueName || alert.mitreTechniqueName;
  const mitreUrl = alert.mitreAttack?.url || (mitreTechniqueId ? `https://attack.mitre.org/techniques/${mitreTechniqueId.replace('.', '/')}` : '#');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <SeverityBadge level={alert.severity} />
              <span className="text-xs font-mono text-gray-500">{alertTime ? new Date(alertTime).toLocaleString() : 'N/A'}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                alert.status === 'OPEN' ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 
                alert.status === 'INVESTIGATING' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/50' : 
                'bg-green-900/30 text-green-400 border border-green-800/50'
              }`}>
                {alert.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{alert.title || alert.type}</h1>
            <p className="text-gray-400 mt-2">{alert.description}</p>
            {alert.autoResponseTaken && (
              <p className="text-sm font-mono text-orange-400 mt-2 bg-orange-950/30 px-3 py-1 rounded border border-orange-800/40 inline-block">
                ⚡ Auto-Response: {alert.autoResponseTaken}
              </p>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <button onClick={() => updateStatus('INVESTIGATING')} className="px-4 py-2 bg-yellow-900/20 text-yellow-400 border border-yellow-700/50 rounded-lg hover:bg-yellow-900/40 text-sm font-medium transition-colors flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 mr-2" /> Investigate
            </button>
            <button onClick={() => updateStatus('RESOLVED')} className="px-4 py-2 bg-green-900/20 text-green-400 border border-green-700/50 rounded-lg hover:bg-green-900/40 text-sm font-medium transition-colors flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2" /> Resolve
            </button>
            <button onClick={blockIp} className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-700/50 rounded-lg hover:bg-red-900/40 text-sm font-medium transition-colors flex items-center justify-center">
              <Shield className="w-4 h-4 mr-2" /> Block IP
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-6 border-r border-b border-slate-800 md:border-b-0">
            <h3 className="text-sm font-mono text-gray-500 uppercase mb-4 flex items-center"><Network className="w-4 h-4 mr-2" /> Threat Origin</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Source IP</p>
                <p className="text-lg text-gray-200 font-mono bg-slate-950 p-2 rounded border border-slate-800">{sourceIpDisplay}</p>
              </div>
              {alert.username && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center"><User className="w-3 h-3 mr-1" /> Target Account</p>
                  <p className="text-gray-200 font-mono">{alert.username}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-sm font-mono text-gray-500 uppercase mb-4 flex items-center"><Crosshair className="w-4 h-4 mr-2" /> MITRE ATT&CK</h3>
            {mitreTechniqueId ? (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs font-mono rounded border border-blue-800/50">{mitreTechniqueId}</span>
                  <a href={mitreUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">View in MITRE ↗</a>
                </div>
                <p className="text-gray-300 font-medium">{mitreTechniqueName || 'Unknown Technique'}</p>
                <p className="text-sm text-gray-500 mt-2">Mapped from alert signature.</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No MITRE mapping available for this alert.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Placeholder for related logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Related Telemetry</h3>
        <div className="flex items-center justify-center h-32 border border-dashed border-slate-700 rounded-lg bg-slate-950/50">
          <p className="text-gray-500 font-mono text-sm">Fetching correlated events...</p>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailPage;
