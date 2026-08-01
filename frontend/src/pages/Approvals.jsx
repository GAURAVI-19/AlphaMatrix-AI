import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { GitPullRequest, Search, Check, X, RefreshCw, MessageSquare, AlertTriangle, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [processing, setProcessing] = useState(false);

  const { addToast } = useToast();

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/approvals?status=${statusFilter}`);
      setApprovals(res.data.data.approvals || []);
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to retrieve approvals queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter]);

  const handleAction = async (id, action) => {
    if (!commentText.trim() && action === 'REJECTED') {
      addToast('warning', 'Please provide a comment reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      await api.put(`/approvals/${id}`, {
        status: action,
        comment: commentText
      });
      addToast('success', `Request successfully ${action.toLowerCase()}`);
      setCommentText('');
      setSelectedApproval(null);
      fetchApprovals();
    } catch (err) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to submit approval choice');
    } finally {
      setProcessing(false);
    }
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
            <GitPullRequest className="w-6 h-6 text-purple-400" />
            Human-in-the-Loop Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit and authorize algorithmic prediction overrides, high attrition risk exceptions, and PIP mitigations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setSelectedApproval(null); }}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="PENDING">PENDING QUEUE</option>
            <option value="APPROVED">APPROVED ARCHIVE</option>
            <option value="REJECTED">REJECTED ARCHIVE</option>
          </select>
          <button
            onClick={fetchApprovals}
            className="p-2 border border-slate-800 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Approvals Table */}
        <div className="lg:col-span-2 glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Employee</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Request Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested By</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 font-sans">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-4 bg-slate-800/50 rounded-lg w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : approvals.length > 0 ? (
                  approvals.map((appr) => (
                    <tr
                      key={appr._id}
                      onClick={() => setSelectedApproval(appr)}
                      className={`hover:bg-slate-800/10 cursor-pointer transition-colors ${
                        selectedApproval?._id === appr._id ? 'bg-slate-800/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-white truncate max-w-[130px]">{appr.employee?.userId?.name || 'Jane Doe'}</p>
                        <p className="text-[9px] text-slate-500 font-mono tracking-wider">{appr.employee?.employeeId || 'EMP-000'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-200">{appr.type}</p>
                        <p className="text-[9px] text-slate-500 truncate max-w-[150px]">{appr.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded border font-mono ${
                          appr.riskLevel === 'HIGH' || appr.riskLevel === 'CRITICAL'
                            ? 'bg-rose-950/40 text-rose-400 border-rose-900/60'
                            : 'bg-amber-950/40 text-amber-400 border-amber-900/60'
                        }`}>
                          {appr.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        {appr.createdBy?.name || 'System Auto'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded border font-mono ${
                          appr.status === 'PENDING'
                            ? 'bg-amber-950/40 text-amber-400 border-amber-900/60'
                            : appr.status === 'APPROVED'
                            ? 'bg-purple-950/40 text-purple-400 border-purple-900/60'
                            : 'bg-rose-950/40 text-rose-400 border-rose-900/60'
                        }`}>
                          {appr.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-mono text-[10px]">
                      NO HUMAN-IN-THE-LOOP APPROVAL ENTRIES FOUND
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedApproval ? (
              <motion.div
                key={selectedApproval._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden"
              >
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Approval Overview</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {selectedApproval._id}</p>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 shrink-0">Reason:</span>
                    <span className="text-slate-200 text-right font-medium">{selectedApproval.description}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Due Date:</span>
                    <span className="text-slate-300 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      {new Date(selectedApproval.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Department:</span>
                    <span className="text-slate-300 font-medium">{selectedApproval.metadata?.department || 'N/A'}</span>
                  </div>
                </div>

                {/* Comments Timeline */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Thread Logs
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedApproval.comments && selectedApproval.comments.length > 0 ? (
                      selectedApproval.comments.map((c, i) => (
                        <div key={i} className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-lg text-[11px] leading-relaxed">
                          <div className="flex items-center justify-between mb-1 text-[9px] text-slate-500 font-mono">
                            <span className="font-bold flex items-center gap-1">
                              <User className="w-2.5 h-2.5" />
                              {c.author?.name || 'Staff User'}
                            </span>
                            <span>{new Date(c.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-300">{c.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[9px] text-slate-500 font-mono">No comments logged on this request.</p>
                    )}
                  </div>
                </div>

                {selectedApproval.status === 'PENDING' && (
                  <div className="space-y-3 pt-3 border-t border-slate-900">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Decision Comments / Rationale</label>
                      <textarea
                        rows={2}
                        placeholder="Log review audit notes here..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAction(selectedApproval._id, 'REJECTED')}
                        disabled={processing}
                        className="flex items-center justify-center gap-1.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 text-rose-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Reject Request
                      </button>
                      <button
                        onClick={() => handleAction(selectedApproval._id, 'APPROVED')}
                        disabled={processing}
                        className="flex items-center justify-center gap-1.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-950/20 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Request
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="glass-panel border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500 font-mono text-[10px]">
                SELECT A PENDING OR CLOSED DECISION POINT TO REVIEW AND PROCESS RATIONALE
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Approvals;
