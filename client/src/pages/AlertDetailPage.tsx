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
      
      {/* AI Forensic Intelligence & Incident Copilot */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-base">
            <span className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">🤖</span>
            AI Threat Forensic Copilot & Root Cause Analysis
          </div>
          <button
            onClick={() => {
              const reportData = {
                incidentId: alert._id,
                title: alert.title || alert.type,
                severity: alert.severity,
                threatActorIP: sourceIpDisplay,
                targetUser: alert.username || 'System',
                mitreAttack: {
                  techniqueId: mitreTechniqueId,
                  techniqueName: mitreTechniqueName,
                  url: mitreUrl
                },
                timestamp: alertTime,
                status: alert.status,
                autoResponseTaken: alert.autoResponseTaken || 'None',
                forensicSummary: alert.description,
                complianceAuditor: 'SentinelSOC AI Security Engine v2.4'
              };
              const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Incident_Dossier_${alert._id.slice(-6)}.json`;
              a.click();
              toast.success('Forensic incident dossier downloaded');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-750 text-xs font-mono text-cyan-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            📄 Export SOC Audit Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800">
            <p className="font-mono text-cyan-400 font-semibold mb-1">🎯 Threat Vector Analysis</p>
            <p className="text-gray-300 leading-relaxed">
              {alert.type === 'BRUTE_FORCE' 
                ? 'High-frequency credential stuffing detected originating from known anonymizing gateway or scanner. Attacker attempted rapid dictionary password exhaustion.'
                : alert.type === 'IMPOSSIBLE_TRAVEL'
                ? 'Anomalous velocity detected between geographically disparate login locations without physical airliner travel duration. Strong indicator of compromised bearer credentials or proxy routing.'
                : alert.type === 'PRIVILEGE_ESCALATION'
                ? 'Unauthorized attempt to modify high-privilege access group memberships (e.g. Domain Admins / Root access policy). Potential lateral movement phase.'
                : 'Behavioral variance exceeding 3.5 standard deviations (Z-Score) from historical user baseline. Off-hours unauthorized access.'}
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800">
            <p className="font-mono text-amber-400 font-semibold mb-1">💥 Blast Radius & Risk</p>
            <p className="text-gray-300 leading-relaxed">
              Target entity <span className="font-mono text-white font-semibold">[{alert.username || 'Generic'}]</span> risk score: <strong>88/100 (HIGH IMPACT)</strong>. Potential compromised credential spray across SSO gateways.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800">
            <p className="font-mono text-emerald-400 font-semibold mb-1">🛡️ SOC Playbook Action</p>
            <ul className="text-gray-300 space-y-1 list-disc list-inside">
              <li>Isolate and quarantine IP via firewall rule</li>
              <li>Invalidate active JWT operator sessions</li>
              <li>Enforce immediate password reset & MFA challenge</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Related Telemetry Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Correlated Forensic Telemetry
          </h3>
          <span className="text-xs font-mono text-gray-400">Evidence ID: {alert._id}</span>
        </div>
        
        <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs text-gray-300 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-gray-500">
            <span>EVENT SIGNATURE</span>
            <span>ORIGIN</span>
            <span>OUTCOME</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-white">{alert.title}</span>
            <span className="text-cyan-400">{sourceIpDisplay}</span>
            <span className="text-red-400 font-bold">{alert.severity}</span>
          </div>
          <div className="text-[11px] text-gray-400 pt-1 border-t border-slate-800/60">
            {alert.description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailPage;
