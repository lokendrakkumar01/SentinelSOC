import React, { useState } from 'react';
import { X, Zap, ShieldAlert, Globe, Key, Play, Loader2, Terminal } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AttackSimulatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [running, setRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  if (!isOpen) return null;

  const appendLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-30), msg]);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runBruteForce = async () => {
    setRunning(true);
    setActiveScenario('brute-force');
    appendLog('💥 Initiating Tor Brute Force Attack (MITRE T1110)...');
    appendLog('Target: john.doe | Attacker IP: 185.220.101.34 (Tor Exit - Germany)');

    try {
      for (let i = 1; i <= 8; i++) {
        await api.post('/logs', {
          timestamp: new Date().toISOString(),
          sourceIP: '185.220.101.34',
          username: 'john.doe',
          action: 'LOGIN_FAILED',
          status: 'FAILURE',
          userAgent: 'python-requests/2.28.0 (Attack Lab)',
          rawMessage: `Failed authentication attempt #${i} for user john.doe from 185.220.101.34`,
          metadata: { attempt: i, vector: 'dictionary_attack' }
        });
        appendLog(`  → Sent LOGIN_FAILED #${i} from 185.220.101.34`);
        await sleep(250);
      }
      appendLog('🚨 Threshold reached (>=5 failed logins). CRITICAL Alert generated!');
      appendLog('🛡️ Auto-Containment: IP 185.220.101.34 automatically quarantined.');
      toast.success('Brute Force Attack simulated! Check Alerts & Blocked IPs.');
    } catch (err: any) {
      appendLog(`✗ Error: ${err.message || 'Simulation request failed'}`);
      toast.error('Simulation request failed');
    } finally {
      setRunning(false);
      setActiveScenario(null);
    }
  };

  const runImpossibleTravel = async () => {
    setRunning(true);
    setActiveScenario('travel');
    appendLog('✈️ Initiating Impossible Travel Anomaly (MITRE T1078.004)...');
    appendLog('User: alice.wang | Step 1: Login from Singapore (103.253.11.74)');

    try {
      await api.post('/logs', {
        timestamp: new Date().toISOString(),
        sourceIP: '103.253.11.74',
        username: 'alice.wang',
        action: 'LOGIN_SUCCESS',
        status: 'SUCCESS',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        rawMessage: 'User alice.wang authenticated from Singapore branch'
      });
      appendLog('  → Login 1: Singapore office successful');

      await sleep(1000);
      appendLog('Step 2: Immediate Login from Moscow, Russia (45.155.205.233)');

      await api.post('/logs', {
        timestamp: new Date().toISOString(),
        sourceIP: '45.155.205.233',
        username: 'alice.wang',
        action: 'LOGIN_SUCCESS',
        status: 'SUCCESS',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/115.0',
        rawMessage: 'User alice.wang authenticated from Moscow, Russia'
      });
      appendLog('  → Login 2: Moscow, Russia successful');
      appendLog('🚨 Geolocation anomaly detected! Speed > 5000 km/h. CRITICAL Alert generated.');
      toast.success('Impossible Travel anomaly simulated successfully!');
    } catch (err: any) {
      appendLog(`✗ Error: ${err.message || 'Simulation request failed'}`);
      toast.error('Simulation request failed');
    } finally {
      setRunning(false);
      setActiveScenario(null);
    }
  };

  const runPrivilegeEscalation = async () => {
    setRunning(true);
    setActiveScenario('priv-esc');
    appendLog('🔑 Initiating Privilege Escalation Attack (MITRE T1548)...');
    appendLog('User: carlos.ruiz | Action: Modifying Domain Admins membership');

    try {
      await api.post('/logs', {
        timestamp: new Date().toISOString(),
        sourceIP: '10.0.0.54',
        username: 'carlos.ruiz',
        action: 'PRIVILEGE_CHANGE',
        status: 'FAILURE',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        rawMessage: 'Unauthorized privilege elevation: Attempted to add account to Domain Admins group',
        metadata: { targetGroup: 'Domain Admins', result: 'ACCESS_DENIED' }
      });
      appendLog('  → Sent PRIVILEGE_CHANGE request (Denied)');
      appendLog('🚨 Security Incident Logged: Privilege Escalation flagged.');
      toast.success('Privilege Escalation simulated successfully!');
    } catch (err: any) {
      appendLog(`✗ Error: ${err.message || 'Simulation request failed'}`);
      toast.error('Simulation request failed');
    } finally {
      setRunning(false);
      setActiveScenario(null);
    }
  };

  const runAllScenarios = async () => {
    await runBruteForce();
    await sleep(800);
    await runImpossibleTravel();
    await sleep(800);
    await runPrivilegeEscalation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Zap size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Interactive Threat Simulation Lab
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-900/40 text-cyan-400 border border-cyan-700/50">
                  Demo Mode
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Trigger live attack vectors to test real-time detection, AI correlation, and auto-quarantine.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Attack Vector Cards */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1 */}
            <div className="bg-slate-950/70 border border-slate-800 hover:border-red-500/50 rounded-xl p-4 flex flex-col justify-between transition-all group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-lg bg-red-950/50 text-red-400 border border-red-800/40">
                    <ShieldAlert size={18} />
                  </span>
                  <span className="text-[10px] font-mono text-red-400 font-semibold">T1110</span>
                </div>
                <h3 className="font-bold text-sm text-gray-100 mb-1 group-hover:text-red-400 transition-colors">
                  Tor Brute Force
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  8 rapid failed authentications from a German Tor Exit Node targeting user accounts.
                </p>
              </div>
              <button
                onClick={runBruteForce}
                disabled={running}
                className="w-full py-2 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {activeScenario === 'brute-force' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                Launch Attack
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-950/70 border border-slate-800 hover:border-yellow-500/50 rounded-xl p-4 flex flex-col justify-between transition-all group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-lg bg-yellow-950/50 text-yellow-400 border border-yellow-800/40">
                    <Globe size={18} />
                  </span>
                  <span className="text-[10px] font-mono text-yellow-400 font-semibold">T1078.004</span>
                </div>
                <h3 className="font-bold text-sm text-gray-100 mb-1 group-hover:text-yellow-400 transition-colors">
                  Impossible Travel
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  Sub-second logins between Singapore and Russia with Haversine velocity &gt; 5,000 km/h.
                </p>
              </div>
              <button
                onClick={runImpossibleTravel}
                disabled={running}
                className="w-full py-2 px-3 rounded-lg bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-800/50 text-yellow-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {activeScenario === 'travel' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                Simulate Travel
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 flex flex-col justify-between transition-all group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-lg bg-cyan-950/50 text-cyan-400 border border-cyan-800/40">
                    <Key size={18} />
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold">T1548</span>
                </div>
                <h3 className="font-bold text-sm text-gray-100 mb-1 group-hover:text-cyan-400 transition-colors">
                  Privilege Escalation
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  Unauthorized security group permission change and administrative policy override.
                </p>
              </div>
              <button
                onClick={runPrivilegeEscalation}
                disabled={running}
                className="w-full py-2 px-3 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {activeScenario === 'priv-esc' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                Simulate Exploit
              </button>
            </div>
          </div>

          {/* Quick All-In-One Trigger */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-800/40 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-cyan-400" />
                Full Enterprise Threat Storm
              </h4>
              <p className="text-xs text-gray-400">
                Executes all 3 attack vectors sequentially to stress-test pipeline throughput and correlation.
              </p>
            </div>
            <button
              onClick={runAllScenarios}
              disabled={running}
              className="py-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              Run Full Attack Suite
            </button>
          </div>

          {/* Console / Terminal Output */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-xs text-gray-300">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80 mb-2 text-gray-400 text-[11px]">
              <Terminal size={14} className="text-cyan-400" />
              <span>Simulation Execution Console</span>
              {running && <span className="text-cyan-400 animate-pulse">● Streaming live telemetry</span>}
            </div>
            <div className="h-32 overflow-y-auto space-y-1 text-[11px]">
              {logs.length === 0 ? (
                <span className="text-gray-600 italic">Select an attack vector above to watch telemetry payloads inject in real time...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={log.includes('🚨') ? 'text-red-400 font-semibold' : log.includes('🛡️') ? 'text-cyan-400 font-semibold' : 'text-gray-300'}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-gray-400">
          <span>All telemetry is ingested live via <code>/api/logs</code> into MongoDB Atlas.</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 font-medium transition-colors"
          >
            Close Lab
          </button>
        </div>
      </div>
    </div>
  );
};
