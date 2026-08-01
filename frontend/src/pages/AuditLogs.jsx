import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Search, Download, RefreshCw, ChevronLeft, ChevronRight, Eye, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `/audit-logs?page=${currentPage}&limit=10&sortBy=createdAt&sortOrder=-1`;
      if (moduleFilter) url += `&module=${moduleFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (searchUser) url += `&user=${searchUser}`;

      const res = await api.get(url);
      setLogs(res.data.data.logs || []);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, moduleFilter, statusFilter, startDate, endDate, searchUser]);

  const handleExportCSV = async () => {
    try {
      let url = '/audit-logs/export';
      const params = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `alphamatrix_audit_logs_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export audit logs:', err);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'SUCCESS') {
      return <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-950/40 text-purple-400 border border-purple-900/60 rounded-full font-mono">SUCCESS</span>;
    }
    return <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-950/40 text-rose-400 border border-rose-900/60 rounded-full font-mono">{status || 'FAILURE'}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            Security Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Read-only chronological trail containing detailed cryptographic request indexes, module modifications, and user records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-purple-950/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export to CSV
          </button>
          <button
            onClick={fetchLogs}
            className="p-2 border border-slate-800 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4 glass-card rounded-2xl border border-slate-800/80">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Module</label>
          <select
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="">ALL MODULES</option>
            <option value="AUTH">AUTH</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="BRANCH">BRANCH</option>
            <option value="PREDICTION">PREDICTION</option>
            <option value="APPROVAL">APPROVAL</option>
            <option value="LMS">LMS</option>
            <option value="PIP">PIP</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Action Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="">ALL STATUSES</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILURE">FAILURE</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">User ID</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search User ID..."
              value={searchUser}
              onChange={(e) => { setSearchUser(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-500/50"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table Panel */}
        <div className="lg:col-span-2 glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 font-sans">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-4 bg-slate-800/50 rounded-lg w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr
                      key={log._id}
                      onClick={() => setSelectedLog(log)}
                      className={`hover:bg-slate-800/10 cursor-pointer transition-colors ${
                        selectedLog?._id === log._id ? 'bg-slate-800/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-xs font-mono text-slate-300">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-white truncate max-w-[130px]">{log.user?.name || 'System'}</p>
                        <p className="text-[9px] text-slate-500 font-mono tracking-wider">{log.user?.role || 'AUTO'}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-purple-400 font-mono font-semibold">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300 font-mono">
                        {log.module}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-purple-400 inline-flex cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500 font-mono text-[10px]">
                      NO IMMUTABLE LOG RECORDS CAPTURED WITH THE GIVEN FILTER CRITERIA
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950/20 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono">
                PAGE {currentPage} OF {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                  className="p-2 border border-slate-800 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                  className="p-2 border border-slate-800 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar logs */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedLog ? (
              <motion.div
                key={selectedLog._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden"
              >
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Detailed Log Frame</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">UUID: {selectedLog._id}</p>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-2.5 text-xs font-sans">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Action:</span>
                    <span className="text-purple-400 font-mono font-bold">{selectedLog.action}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Endpoint/Resource:</span>
                    <span className="text-slate-200 font-mono text-[10px] text-right truncate max-w-[170px]">{selectedLog.resourcePath || '/api/v1'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Method:</span>
                    <span className="text-violet-400 font-mono text-[10px]">{selectedLog.method || 'GET'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">IP:</span>
                    <span className="text-slate-300 font-mono text-[10px]">{selectedLog.ipAddress || '127.0.0.1'}</span>
                  </div>
                </div>

                {/* Modified variables */}
                {selectedLog.changes && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Changeset payload</h4>
                    <pre className="p-3 bg-slate-950 text-[10px] text-slate-300 font-mono rounded-lg overflow-x-auto border border-slate-900 leading-normal max-h-40">
                      {JSON.stringify(selectedLog.changes, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="glass-panel border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500 font-mono text-[10px]">
                SELECT A SECURITY AUDIT LOG FROM THE TABLE VIEW TO RENDER CRYPTOGRAPHIC CHANGELOGS & REQUEST TRACES
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AuditLogs;
