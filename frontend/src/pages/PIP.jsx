import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Award, Plus, Search, ChevronRight, CheckCircle, AlertCircle, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const PIP = () => {
  const [pips, setPips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPIP, setNewPIP] = useState({
    employeeId: '',
    reason: '',
    startDate: '',
    endDate: '',
    goals: [{ title: '', targetValue: 100, description: '' }]
  });

  const { addToast } = useToast();

  const fetchPIPs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pips');
      setPips(res.data.data.pips || []);
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to retrieve Performance Improvement Plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees?limit=100');
      setEmployees(res.data.data.employees || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPIPs();
    fetchEmployees();
  }, []);

  const handleAddGoalField = () => {
    setNewPIP({
      ...newPIP,
      goals: [...newPIP.goals, { title: '', targetValue: 100, description: '' }]
    });
  };

  const handleGoalChange = (index, field, value) => {
    const updatedGoals = [...newPIP.goals];
    updatedGoals[index][field] = value;
    setNewPIP({ ...newPIP, goals: updatedGoals });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPIP.employeeId) {
      addToast('warning', 'Please select an employee');
      return;
    }
    try {
      await api.post('/pips', {
        employee: newPIP.employeeId,
        reason: newPIP.reason,
        startDate: newPIP.startDate,
        endDate: newPIP.endDate,
        goals: newPIP.goals
      });
      addToast('success', 'PIP Plan created successfully');
      setShowAddModal(false);
      setNewPIP({
        employeeId: '',
        reason: '',
        startDate: '',
        endDate: '',
        goals: [{ title: '', targetValue: 100, description: '' }]
      });
      fetchPIPs();
    } catch (err) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to establish PIP record');
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
            <Award className="w-6 h-6 text-purple-400" />
            Performance Improvement Plans (PIP)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Design coaching frameworks. Establish target parameters, and log progress milestones to help staff return to nominal levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-purple-950/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Initiate PIP Plan
          </button>
          <button
            onClick={fetchPIPs}
            className="p-2 border border-slate-800 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-800/20 rounded-2xl border border-slate-800/40 animate-pulse"></div>
            ))}
          </div>
        ) : pips.length > 0 ? (
          <div className="space-y-4">
            {pips.map((pip) => (
              <div key={pip._id} className="p-5 glass-panel border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between gap-4 shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border font-mono ${
                      pip.status === 'COMPLETED'
                        ? 'bg-purple-950/40 text-purple-400 border-purple-900/60'
                        : pip.status === 'IN_PROGRESS'
                        ? 'bg-violet-950/40 text-violet-400 border-violet-900/60'
                        : 'bg-amber-950/40 text-amber-400 border-amber-900/60'
                    }`}>
                      {pip.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Plan ID: {pip._id}</span>
                  </div>

                  <div>
                    <h2 className="text-sm font-extrabold text-white">{pip.employee?.userId?.name || 'Jane Smith'}</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5 italic">" {pip.reason} "</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-[10px] text-slate-300 font-mono pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>Start: {new Date(pip.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-violet-400" />
                      <span>Target: {new Date(pip.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-end shrink-0 min-w-[150px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress percentage</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-purple-500 h-full rounded-full transition-all duration-350" style={{ width: `${pip.progress || 0}%` }}></div>
                    </div>
                    <span className="text-sm font-black text-white font-mono">{pip.progress || 0}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center glass-card border border-slate-800 rounded-2xl text-slate-500 font-mono text-[10px]">
            NO ACTIVE PERFORMANCE IMPROVEMENT PLANS IN PROGRESS
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div>
              <h3 className="text-base font-extrabold text-white">Create Performance Improvement Plan</h3>
              <p className="text-[11px] text-slate-400 mt-1">Specify clear action steps, milestones, and timeline goals.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Employee</label>
                <select
                  required
                  value={newPIP.employeeId}
                  onChange={(e) => setNewPIP({ ...newPIP, employeeId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.userId?.name} ({emp.employeeId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reason / Focus Areas</label>
                <textarea
                  required
                  rows={2}
                  value={newPIP.reason}
                  onChange={(e) => setNewPIP({ ...newPIP, reason: e.target.value })}
                  placeholder="Describe focus improvements..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newPIP.startDate}
                    onChange={(e) => setNewPIP({ ...newPIP, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newPIP.endDate}
                    onChange={(e) => setNewPIP({ ...newPIP, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coaching Goals & Milestones</h4>
                  <button
                    type="button"
                    onClick={handleAddGoalField}
                    className="text-[10px] font-bold text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    + Add Goal
                  </button>
                </div>
                {newPIP.goals.map((goal, index) => (
                  <div key={index} className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl space-y-2.5">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Goal Title</label>
                        <input
                          type="text"
                          required
                          value={goal.title}
                          onChange={(e) => handleGoalChange(index, 'title', e.target.value)}
                          placeholder="e.g. Code Review Quality"
                          className="w-full bg-slate-950 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Value (%)</label>
                        <input
                          type="number"
                          required
                          value={goal.targetValue}
                          onChange={(e) => handleGoalChange(index, 'targetValue', parseInt(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Metric Description</label>
                      <input
                        type="text"
                        required
                        value={goal.description}
                        onChange={(e) => handleGoalChange(index, 'description', e.target.value)}
                        placeholder="Define exactly how progress is audited..."
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Establish PIP
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default PIP;
