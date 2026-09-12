import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useSocket } from './useSocket';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('stats-update', (newStats: any) => {
      setStats((prev: any) => ({ ...prev, ...newStats }));
    });
    
    return () => {
      socket.off('stats-update');
    };
  }, [socket]);

  return { stats, loading, refetch: fetchStats };
};
