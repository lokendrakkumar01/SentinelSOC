import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../../api/axios';
import { useSocket } from '../../hooks/useSocket';

ChartJS.register(ArcElement, Tooltip, Legend);

const SeverityChart: React.FC = () => {
  const [data, setData] = useState({ LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 });
  const { onAlert } = useSocket();

  useEffect(() => {
    api.get('/dashboard/stats').then(res => {
      const breakdown = res.data.alertsBySeverity || res.data.severityBreakdown || [];
      if (Array.isArray(breakdown)) {
        setData({
          LOW: breakdown.find((b: any) => b._id === 'LOW')?.count || 0,
          MEDIUM: breakdown.find((b: any) => b._id === 'MEDIUM')?.count || 0,
          HIGH: breakdown.find((b: any) => b._id === 'HIGH')?.count || 0,
          CRITICAL: breakdown.find((b: any) => b._id === 'CRITICAL')?.count || 0,
        });
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    onAlert((newAlert) => {
      setData(prev => ({
        ...prev,
        [newAlert.severity]: (prev[newAlert.severity as keyof typeof prev] || 0) + 1
      }));
    });
  }, [onAlert]);

  const chartData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: [data.LOW, data.MEDIUM, data.HIGH, data.CRITICAL],
        backgroundColor: [
          '#3b82f6',
          '#eab308',
          '#f97316',
          '#ef4444',
        ],
        borderColor: '#0f172a',
        borderWidth: 2,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#9ca3af',
          font: { family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }
        }
      }
    },
    cutout: '70%',
  };

  return (
    <div className="w-full h-full flex justify-center items-center relative">
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-[100px]">
        <div className="text-center">
          <span className="text-2xl font-bold text-white font-mono">{data.LOW + data.MEDIUM + data.HIGH + data.CRITICAL}</span>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total</p>
        </div>
      </div>
    </div>
  );
};

export default SeverityChart;
