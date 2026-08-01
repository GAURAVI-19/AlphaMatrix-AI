import React from 'react';
import { BarChart3, TrendingUp, Cpu, PieChart, Download, Layers } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';

const riskTrendData = [
  { month: 'Jan', lowRisk: 42, medRisk: 18, highRisk: 6 },
  { month: 'Feb', lowRisk: 48, medRisk: 15, highRisk: 5 },
  { month: 'Mar', lowRisk: 55, medRisk: 22, highRisk: 8 },
  { month: 'Apr', lowRisk: 60, medRisk: 19, highRisk: 4 },
  { month: 'May', lowRisk: 64, medRisk: 14, highRisk: 3 },
  { month: 'Jun', lowRisk: 70, medRisk: 16, highRisk: 5 }
];

const modelAccuracyData = [
  { name: 'XGBoost', accuracy: 94.2, latency: 14 },
  { name: 'LightGBM', accuracy: 93.8, latency: 11 },
  { name: 'Random Forest', accuracy: 92.5, latency: 18 },
  { name: 'Neural Net', accuracy: 91.5, latency: 25 }
];

const Analytics = () => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-purple-400" />
            Enterprise Responsible AI Analytics & Performance Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comparative performance telemetry across XGBoost, Random Forest, LightGBM, and Deep Neural Networks.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md glow-purple cursor-pointer">
          <Download className="w-4 h-4" /> Export Analytics CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">TOTAL PREDICTIONS EVALUATED</span>
          <p className="text-2xl font-bold text-white">1,248</p>
          <p className="text-[10px] text-purple-400">+14% vs last quarter</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">MODEL PRECISION (ROC-AUC)</span>
          <p className="text-2xl font-bold text-purple-400">0.942</p>
          <p className="text-[10px] text-slate-500">XGBoost Primary Model</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">MEAN INFERENCE LATENCY</span>
          <p className="text-2xl font-bold text-violet-400">14 ms</p>
          <p className="text-[10px] text-slate-500">Real-time edge response</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">HUMAN INTERVENTION RATE</span>
          <p className="text-2xl font-bold text-amber-400">4.8%</p>
          <p className="text-[10px] text-slate-500">High Risk & Ethical Firewall triggers</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Domain Risk Distribution Curves (Monthly Trend)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '11px' }} />
                <Area type="monotone" dataKey="lowRisk" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Area type="monotone" dataKey="medRisk" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                <Area type="monotone" dataKey="highRisk" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" /> Model Accuracy Benchmarks
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelAccuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[85, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: '11px' }} />
                <Bar dataKey="accuracy" fill="#a855f7" radius={[6, 6, 0, 0]}>
                  {modelAccuracyData.map((_, index) => (
                    <Cell key={index} fill={index === 0 ? '#a855f7' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
