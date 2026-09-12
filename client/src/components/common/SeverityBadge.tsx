import React from 'react';

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Props {
  level: Severity | string;
}

const SeverityBadge: React.FC<Props> = ({ level }) => {
  const getStyles = () => {
    switch (level.toUpperCase()) {
      case 'LOW':
        return 'bg-blue-900/50 text-blue-400 border-blue-700/50';
      case 'MEDIUM':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700/50';
      case 'HIGH':
        return 'bg-orange-900/50 text-orange-400 border-orange-700/50';
      case 'CRITICAL':
        return 'bg-red-900/50 text-red-400 border-red-700/50 animate-pulse-red';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-600';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      {level.toUpperCase()}
    </span>
  );
};

export default SeverityBadge;
