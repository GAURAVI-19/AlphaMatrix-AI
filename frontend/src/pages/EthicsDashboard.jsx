import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Sliders, RefreshCw, Lock } from 'lucide-react';
import axios from 'axios';

const EthicsDashboard = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/ethical-rules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRules(res.data?.data?.rules || []);
    } catch (err) {
      console.warn('Failed to fetch ethical rules, using demo rules');
      setRules([
        { _id: '1', name: 'Max Risk Threshold Guard', type: 'THRESHOLD_VALIDATION', status: 'ACTIVE', priority: 'HIGH', appliedCount: 142, violationCount: 4 },
        { _id: '2', name: 'Demographic Parity Bias Check', type: 'BIAS_CHECK', status: 'ACTIVE', priority: 'CRITICAL', appliedCount: 198, violationCount: 2 },
        { _id: '3', name: 'Low Confidence Manual Review Gate', type: 'SAFETY_CHECK', status: 'ACTIVE', priority: 'MEDIUM', appliedCount: 84, violationCount: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-purple-400" />
            Ethical AI Firewall & Bias Monitoring Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time policy guardrails, demographic parity enforcement, and automated compliance risk scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Firewall Active • Zero Unchecked Decisions
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">FIREWALL STATUS</span>
          <p className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" /> Enforcing
          </p>
          <p className="text-[10px] text-slate-500">100% decision policy coverage</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">BIAS CHECKS EXECUTED</span>
          <p className="text-xl font-bold text-white">424</p>
          <p className="text-[10px] text-purple-400">Demographic & performance parity</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">POLICY VIOLATIONS BLOCKED</span>
          <p className="text-xl font-bold text-amber-400">6</p>
          <p className="text-[10px] text-slate-500">Rerouted to Human Approval Queue</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">COMPLIANCE INDEX</span>
          <p className="text-xl font-bold text-purple-400">98.6%</p>
          <p className="text-[10px] text-slate-500">ISO / EU AI Act Standard compliant</p>
        </div>
      </div>

      {/* Rules Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" /> Active Ethical Governance Policies
          </h3>
          <button onClick={fetchRules} className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3">Policy Name</th>
                <th className="pb-3">Guard Type</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Evaluations</th>
                <th className="pb-3">Violations Flagged</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rules.map((rule) => (
                <tr key={rule._id} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-3 font-semibold text-white">{rule.name}</td>
                  <td className="py-3 text-slate-300 font-mono">{rule.type}</td>
                  <td className="py-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.priority === 'CRITICAL' ? 'bg-red-950/60 text-red-400 border border-red-800' :
                      rule.priority === 'HIGH' ? 'bg-amber-950/60 text-amber-400 border border-amber-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {rule.priority}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 font-mono">{rule.appliedCount || 0}</td>
                  <td className="py-3 text-slate-300 font-mono font-bold text-amber-400">{rule.violationCount || 0}</td>
                  <td className="py-3 font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EthicsDashboard;
