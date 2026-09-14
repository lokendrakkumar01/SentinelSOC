import React, { useState, useEffect } from 'react';
import { Terminal, Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Shield, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface LogEntry {
  _id: string;
  timestamp: string;
  sourceIP: string;
  username: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  userAgent?: string;
  rawMessage?: string;
  geoLocation?: {
    country?: string;
    city?: string;
  };
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 25 };
      if (actionFilter) params.action = actionFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) {
        if (searchQuery.includes('.')) {
          params.sourceIP = searchQuery.trim();
        } else {
          params.username = searchQuery.trim();
        }
      }
      const res = await api.get('/logs', { params });
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN_SUCCESS':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">LOGIN_SUCCESS</span>;
      case 'LOGIN_FAILED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-950/60 text-red-400 border border-red-800/50 font-semibold">LOGIN_FAILED</span>;
      case 'PRIVILEGE_CHANGE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-950/60 text-purple-400 border border-purple-800/50 font-bold">PRIVILEGE_CHANGE</span>;
      case 'FILE_ACCESS':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-950/60 text-blue-400 border border-blue-800/50">FILE_ACCESS</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-gray-300 border border-slate-700">{action}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
            <CheckCircle2 size={13} /> SUCCESS
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-orange-400">
            <Shield size={13} /> BLOCKED
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-red-400">
            <XCircle size={13} /> FAILURE
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Terminal className="text-cyan-400" size={26} />
            Telemetry Logs Explorer
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time audit telemetry ingested from endpoints, perimeter firewalls, and authentication servers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
            {total.toLocaleString()} Total Ingested Events
          </span>
          <button
            onClick={() => fetchLogs()}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-gray-400 hover:text-white transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-cyan-400' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search by IP (e.g. 185.220.101.34) or username (e.g. john.doe)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="">All Event Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="PRIVILEGE_CHANGE">PRIVILEGE_CHANGE</option>
            <option value="FILE_ACCESS">FILE_ACCESS</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="API_ACCESS">API_ACCESS</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILURE">FAILURE</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-950/80 text-gray-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Source IP</th>
                <th className="px-4 py-3">Geo Location</th>
                <th className="px-4 py-3">Telemetry Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No telemetry logs found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const locationString = log.geoLocation?.country
                    ? `${log.geoLocation.city || ''}${log.geoLocation.city ? ', ' : ''}${log.geoLocation.country}`
                    : 'Internal Network';

                  return (
                    <tr key={log._id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-4 py-2.5 text-gray-200 font-semibold whitespace-nowrap">
                        {log.username}
                      </td>
                      <td className="px-4 py-2.5 text-cyan-400 whitespace-nowrap">
                        {log.sourceIP}
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">
                        {locationString}
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 truncate max-w-xs font-sans text-xs">
                        {log.rawMessage || log.userAgent || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-gray-400">
          <span>
            Showing Page <strong className="text-gray-200">{page}</strong> of <strong className="text-gray-200">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-gray-300 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-gray-300 flex items-center gap-1 transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsPage;
