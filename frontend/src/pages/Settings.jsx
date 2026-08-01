import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sliders, Plus, Search, ShieldAlert, CheckCircle, RefreshCw, Trash2, Power, Eye, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const Settings = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    type: 'THRESHOLD_VALIDATION',
    ruleType: 'CUSTOM_THRESHOLD',
    priority: 'MEDIUM',
    minConfidence: 80,
    maxRisk: 70,
    biasThreshold: 5,
    actionType: 'REQUIRE_APPROVAL',
    roleRequired: 'BRANCH_MANAGER',
    groups: 'TENURE'
  });

  const { addToast } = useToast();

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ethical-rules');
      setRules(res.data.data.rules || []);
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to retrieve ethical safety rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const targetStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.put(`/ethical-rules/${id}`, {
        status: targetStatus
      });
      addToast('success', `Safety rule is now ${targetStatus.toLowerCase()}`);
      fetchRules();
      if (selectedRule?._id === id) {
        setSelectedRule(prev => ({ ...prev, status: targetStatus }));
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to update rule status');
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      await api.delete(`/ethical-rules/${id}`);
      addToast('success', 'Rule deleted successfully');
      setSelectedRule(null);
      fetchRules();
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to delete safety rule');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newRule.name,
        description: newRule.description,
        type: newRule.type,
        ruleType: newRule.ruleType,
        priority: newRule.priority,
        groups: [newRule.groups],
        status: 'ACTIVE',
        thresholds: {
          minConfidence: parseFloat(newRule.minConfidence) / 100,
          maxRisk: parseFloat(newRule.maxRisk) / 100,
          biasThreshold: parseFloat(newRule.biasThreshold) / 100
        },
        actions: [{
          type: newRule.actionType,
          parameters: { roleRequired: newRule.roleRequired }
        }]
      };

      await api.post('/ethical-rules', payload);
      addToast('success', 'Ethical safety rule created successfully');
      setShowAddModal(false);
      setNewRule({
        name: '',
        description: '',
        type: 'THRESHOLD_VALIDATION',
        ruleType: 'CUSTOM_THRESHOLD',
        priority: 'MEDIUM',
        minConfidence: 80,
        maxRisk: 70,
        biasThreshold: 5,
        actionType: 'REQUIRE_APPROVAL',
        roleRequired: 'BRANCH_MANAGER',
        groups: 'TENURE'
      });
      fetchRules();
    } catch (err) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to create rule');
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
            <Sliders className="w-6 h-6 text-purple-400" />
            Ethical Guardrails Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Establish, configure, and monitor real-time AI prediction firewalls, bias checking ratios, and human override targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-purple-950/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Guardrail
          </button>
          <button
            onClick={fetchRules}
            className="p-2 border border-slate-800 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Guardrail Rules Table */}
        <div className="lg:col-span-2 glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardrail Policy</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rule Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evaluated / Violated</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60 font-sans">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-4 bg-slate-800/50 rounded-lg w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : rules.length > 0 ? (
                  rules.map((rule) => (
                    <tr
                      key={rule._id}
                      onClick={() => setSelectedRule(rule)}
                      className={`hover:bg-slate-800/10 cursor-pointer transition-colors ${
                        selectedRule?._id === rule._id ? 'bg-slate-800/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-white truncate max-w-[170px]">{rule.name}</p>
                        <p className="text-[9px] text-slate-500 font-mono truncate max-w-[200px]">{rule.description}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-purple-400 font-mono font-semibold">
                        {rule.type}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded border font-mono ${
                          rule.priority === 'HIGH' || rule.priority === 'CRITICAL'
                            ? 'bg-rose-950/40 text-rose-400 border-rose-900/60'
                            : 'bg-amber-950/40 text-amber-400 border-amber-900/60'
                        }`}>
                          {rule.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-300">
                        {rule.appliedCount || 0} / <span className="text-rose-400">{rule.violationCount || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleStatus(rule._id, rule.status)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            rule.status === 'ACTIVE'
                              ? 'bg-purple-950/40 border-purple-900/60 text-purple-400 hover:bg-purple-900/40'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                          }`}
                          title="Toggle Status"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule._id)}
                          className="p-1.5 bg-rose-950/40 border border-rose-900/60 rounded-lg text-rose-400 hover:bg-rose-900/40 transition-colors cursor-pointer"
                          title="Delete Guardrail"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500 font-mono text-[10px]">
                      NO ACTIVE ETHICAL SAFETY GUARDRAILS LOADED IN COMPLIANCE ENGINE
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedRule ? (
              <motion.div
                key={selectedRule._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden"
              >
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">{selectedRule.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Rule ID: {selectedRule._id}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-slate-300 leading-relaxed">{selectedRule.description}</p>

                  <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Rule Type:</span>
                      <span className="text-purple-300 font-mono font-bold">{selectedRule.ruleType}</span>
                    </div>
                    {selectedRule.thresholds && (
                      <>
                        {selectedRule.thresholds.maxRisk !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Risk Threshold:</span>
                            <span className="text-slate-200 font-mono">{selectedRule.thresholds.maxRisk * 100}%</span>
                          </div>
                        )}
                        {selectedRule.thresholds.minConfidence !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Min Confidence:</span>
                            <span className="text-slate-200 font-mono">{selectedRule.thresholds.minConfidence * 100}%</span>
                          </div>
                        )}
                        {selectedRule.thresholds.biasThreshold !== undefined && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Allowed Deviation:</span>
                            <span className="text-slate-200 font-mono">{selectedRule.thresholds.biasThreshold * 100}%</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Action Triggers:</span>
                      <span className="text-purple-400 font-mono">{selectedRule.actions?.[0]?.type || 'LOG'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Last Executed:</span>
                  <span>{selectedRule.lastApplied ? new Date(selectedRule.lastApplied).toLocaleTimeString() : 'Never'}</span>
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500 font-mono text-[10px]">
                SELECT A POLICY FROM THE DIRECTORY TO VIEW INTERACTIVE PARAMETER CRITERIA & ACTIONS
              </div>
            )}
          </AnimatePresence>
        </div>
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
              <h3 className="text-base font-extrabold text-white">Create New Ethical Guardrail</h3>
              <p className="text-[11px] text-slate-400 mt-1">Deploy new real-time validation policies to the decision engine.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Policy Name</label>
                  <input
                    type="text"
                    required
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={newRule.priority}
                    onChange={(e) => setNewRule({ ...newRule, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Describe target safety compliance policy..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Validation Category</label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="THRESHOLD_VALIDATION">THRESHOLD_VALIDATION</option>
                    <option value="BIAS_CHECK">BIAS_CHECK</option>
                    <option value="FAIRNESS_CHECK">FAIRNESS_CHECK</option>
                    <option value="SAFETY_CHECK">SAFETY_CHECK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rule Engine Type</label>
                  <select
                    value={newRule.ruleType}
                    onChange={(e) => setNewRule({ ...newRule, ruleType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="CUSTOM_THRESHOLD">CUSTOM_THRESHOLD</option>
                    <option value="DEMOGRAPHIC_PARITY">DEMOGRAPHIC_PARITY</option>
                    <option value="EQUAL_OPPORTUNITY">EQUAL_OPPORTUNITY</option>
                    <option value="PREDICTIVE_PARITY">PREDICTIVE_PARITY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Risk (%)</label>
                  <input
                    type="number"
                    value={newRule.maxRisk}
                    onChange={(e) => setNewRule({ ...newRule, maxRisk: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Min Confidence (%)</label>
                  <input
                    type="number"
                    value={newRule.minConfidence}
                    onChange={(e) => setNewRule({ ...newRule, minConfidence: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Allowed Bias (%)</label>
                  <input
                    type="number"
                    value={newRule.biasThreshold}
                    onChange={(e) => setNewRule({ ...newRule, biasThreshold: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Enforcement Action</label>
                  <select
                    value={newRule.actionType}
                    onChange={(e) => setNewRule({ ...newRule, actionType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="REQUIRE_APPROVAL">REQUIRE_APPROVAL</option>
                    <option value="BLOCK">BLOCK</option>
                    <option value="NOTIFY">NOTIFY</option>
                    <option value="LOG">LOG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role Required</label>
                  <select
                    value={newRule.roleRequired}
                    onChange={(e) => setNewRule({ ...newRule, roleRequired: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
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
                  Deploy Guardrail
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Settings;
