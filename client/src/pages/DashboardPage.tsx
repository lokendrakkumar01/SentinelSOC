import React from 'react';
import StatsCards from '../components/dashboard/StatsCards';
import WorldMap from '../components/dashboard/WorldMap';
import SeverityChart from '../components/dashboard/SeverityChart';
import LiveFeed from '../components/dashboard/LiveFeed';
import TimelineView from '../components/dashboard/TimelineView';
import MitreMatrix from '../components/dashboard/MitreMatrix';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Row 1: Stats */}
      <StatsCards />
      
      {/* Row 2: Map & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-gray-100 font-mono tracking-wide">Global Threat Origin</h2>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <WorldMap />
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col h-[400px] overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-gray-100 font-mono tracking-wide">Threat Analysis</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="h-48">
              <SeverityChart />
            </div>
            <div>
              <h3 className="text-xs font-mono text-gray-400 mb-2 uppercase">MITRE ATT&CK Top Techniques</h3>
              <MitreMatrix />
            </div>
          </div>
        </div>
      </div>
      
      {/* Row 3: Live Feed & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-100 font-mono tracking-wide">Live Threat Feed</h2>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <span className="text-xs text-cyan-400 font-mono">STREAMING</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <LiveFeed />
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-gray-100 font-mono tracking-wide">Attack Timeline</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <TimelineView />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
