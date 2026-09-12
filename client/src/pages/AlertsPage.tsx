import React from 'react';
import AlertTable from '../components/alerts/AlertTable';

const AlertsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-mono tracking-wider">Threat Alert Center</h1>
        <p className="text-gray-400 text-sm mt-1">Comprehensive log of anomalous activities detected by SentinelSOC AI engine.</p>
      </div>
      <AlertTable />
    </div>
  );
};

export default AlertsPage;
