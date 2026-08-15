import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Activity, Search, ShieldCheck, Clock, Monitor } from 'lucide-react';

export const VerificationLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/logs', {
        params: { search: search || undefined, limit: 50 },
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch verification logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-400" /> Verification Audit Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time audit trail recording every certificate scan, IP address, and validity check.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold self-start sm:self-auto">
          {total} Total Audit Scans Logged
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Filter logs by recipient or cert code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        {loading ? (
          <div className="py-12 flex justify-center text-blue-400">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Activity className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-400">No verification activity logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Verification Time</th>
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Recipient & Event</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">User Agent</th>
                  <th className="py-3 px-4 text-right">Status Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {new Date(log.verifiedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      {log.certificate?.certCode || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">
                        {log.certificate?.recipientName || 'Public Query'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {log.certificate?.event?.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {log.userAgent || 'Browser'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                        {log.statusChecked}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
