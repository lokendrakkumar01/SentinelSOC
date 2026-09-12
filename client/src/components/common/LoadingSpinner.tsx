import React from 'react';
import { Shield } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-12">
      <div className="relative">
        <Shield className="w-12 h-12 text-cyan-900 absolute opacity-30" />
        <Shield className="w-12 h-12 text-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
        <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-cyan-400/80 font-mono text-sm tracking-widest animate-pulse">ANALYZING...</p>
    </div>
  );
};

export default LoadingSpinner;
