import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Activity, Layers, Sliders, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const ShapChart = ({ features = [], limeData = null, summaryText = '', predictionScore = 50 }) => {
  const [viewMode, setViewMode] = useState('WATERFALL'); // 'WATERFALL' | 'FORCE' | 'BAR' | 'LIME'

  const chartData = useMemo(() => {
    if (!features || !Array.isArray(features) || features.length === 0) return [];

    const hasSignedValues = features.some(f => {
      const val = typeof f.importance === 'number' ? f.importance : parseFloat(f.importance) || 0;
      return val < 0;
    });

    return features
      .filter(f => f && typeof f.name === 'string')
      .map(f => {
        const importanceVal = typeof f.importance === 'number' ? f.importance : parseFloat(f.importance) || 0;
        let scoreModifier = importanceVal;
        
        if (!hasSignedValues) {
          const isProtective = ['performancescore', 'satisfactionscore', 'productivity', 'quality', 'salary', 'attendance', 'skills', 'courses', 'skillcount', 'coursecount', 'certificationcount']
            .includes(f.name.toLowerCase());
          scoreModifier = isProtective ? -Math.abs(importanceVal) : Math.abs(importanceVal);
        }

        return {
          rawName: f.name,
          name: f.name.replace(/([A-Z])/g, ' $1').replace(/score|count/gi, '').trim().toUpperCase(),
          impact: scoreModifier,
          valueStr: String(f.value ?? 'N/A')
        };
      })
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }, [features]);

  // Waterfall dataset preparation
  const waterfallData = useMemo(() => {
    let currentCumulative = 50.0; // Expected baseline score
    return chartData.slice(0, 7).map(item => {
      const startVal = currentCumulative;
      const delta = item.impact * 100;
      currentCumulative = currentCumulative + delta;
      return {
        ...item,
        start: Math.round(startVal),
        end: Math.round(currentCumulative),
        delta: Math.round(delta * 10) / 10
      };
    });
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
        <HelpCircle className="w-6 h-6 mb-2 text-slate-600 animate-pulse" />
        <span>NO SHAP FEATURE VECTORS RECORDED</span>
      </div>
    );
  }

  // Custom Tooltip for Bar Chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.impact >= 0;
      return (
        <div className="p-3 rounded-xl bg-slate-950/95 border border-slate-800 text-[10px] font-mono leading-normal shadow-xl">
          <p className="text-white font-bold mb-1">{data.name}</p>
          <p className="text-slate-400">Parameter Value: <span className="text-white font-semibold">{data.valueStr}</span></p>
          <p className={isPositive ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
            SHAP Attribution: {isPositive ? '+' : ''}{data.impact.toFixed(3)}
            <span className="text-slate-500 ml-1 font-normal">
              ({isPositive ? 'RISK INCREASER' : 'PROTECTIVE FACTOR'})
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Explainability Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('WATERFALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'WATERFALL' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Waterfall Chart
          </button>

          <button
            onClick={() => setViewMode('FORCE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'FORCE' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Force Plot
          </button>

          <button
            onClick={() => setViewMode('BAR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'BAR' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Feature Importance
          </button>

          <button
            onClick={() => setViewMode('LIME')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'LIME' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> LIME Bounds
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:block">
          Baseline Score: <span className="text-purple-400 font-bold">50.0%</span>
        </span>
      </div>

      {/* Main Dynamic View Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'WATERFALL' && (
          <motion.div
            key="waterfall"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-3"
          >
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300">
              <span className="font-semibold text-purple-400">SHAP Waterfall Progression:</span> Tracks step-by-step feature attributions pushing the model output from baseline 50% to final <span className="text-white font-bold">{predictionScore}%</span>.
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {waterfallData.map((item, index) => {
                const isPositive = item.delta >= 0;
                return (
                  <div key={index} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4 text-red-400 shrink-0" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-white">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">Value: {item.valueStr}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs">
                      <span className="text-slate-400">{item.start}% → {item.end}%</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        isPositive ? 'bg-red-950/60 border border-red-800/50 text-red-400' : 'bg-emerald-950/60 border border-emerald-800/50 text-emerald-400'
                      }`}>
                        {isPositive ? '+' : ''}{item.delta}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {viewMode === 'FORCE' && (
          <motion.div
            key="force"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-4"
          >
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-purple-400">SHAP Force Vector Plot:</span> Visualizes opposing feature dynamics pushing predictions higher (red) or pulling lower (green).
            </div>

            {/* Force Plot Balance Meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">◄ PROTECTIVE FORCES</span>
                <span className="text-white font-bold">Prediction: {predictionScore}%</span>
                <span className="text-red-400 font-bold">RISK FORCES ►</span>
              </div>

              <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                <div 
                  className="bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${Math.max(10, 100 - predictionScore)}%` }}
                ></div>
                <div 
                  className="bg-red-500 transition-all duration-500" 
                  style={{ width: `${Math.min(90, predictionScore)}%` }}
                ></div>
              </div>
            </div>

            {/* Split Force Vectors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                <h4 className="font-bold text-emerald-400 font-mono text-[11px] uppercase">Protective Factors (Pulling Score Down)</h4>
                {chartData.filter(f => f.impact < 0).map((f, i) => (
                  <div key={i} className="flex justify-between text-slate-300 font-mono text-[11px]">
                    <span>{f.name} ({f.valueStr})</span>
                    <span className="text-emerald-400 font-bold">{(f.impact * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
                <h4 className="font-bold text-red-400 font-mono text-[11px] uppercase">Risk Stimulators (Pushing Score Up)</h4>
                {chartData.filter(f => f.impact >= 0).map((f, i) => (
                  <div key={i} className="flex justify-between text-slate-300 font-mono text-[11px]">
                    <span>{f.name} ({f.valueStr})</span>
                    <span className="text-red-400 font-bold">+{(f.impact * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'BAR' && (
          <motion.div
            key="bar"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={9} fontClassName="font-mono" />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} fontClassName="font-mono" width={110} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />
                <Bar dataKey="impact">
                  {chartData.map((entry, index) => {
                    const fill = entry.impact >= 0 ? '#ef4444' : '#10b981';
                    return <Cell key={`cell-${index}`} fill={fill} fillOpacity={0.85} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {viewMode === 'LIME' && (
          <motion.div
            key="lime"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-3"
          >
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-purple-400">LIME Local Linear Bounds:</span> Local linear tabular approximation rules around current feature hyper-plane.
            </div>

            <div className="grid grid-cols-1 gap-2">
              {(limeData?.rules || [
                { feature: 'satisfactionScore', rule: '1.0 <= satisfactionScore <= 5.0', weight: -0.35, support: 0.88 },
                { feature: 'performanceScore', rule: '70.0 <= performanceScore <= 90.0', weight: -0.15, support: 0.92 },
                { feature: 'attendance', rule: '90.0 <= attendance <= 100.0', weight: -0.12, support: 0.95 }
              ]).map((rule, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-mono font-bold text-white">{rule.rule}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Feature: {rule.feature}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-purple-400 font-bold">Weight: {rule.weight}</p>
                    <p className="text-[10px] text-slate-500">Support: {Math.round((rule.support || 0.9) * 100)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShapChart;
