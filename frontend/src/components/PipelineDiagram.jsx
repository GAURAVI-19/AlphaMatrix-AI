import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Cpu, 
  Binary, 
  BrainCircuit, 
  Gauge, 
  ShieldAlert, 
  UserCheck, 
  FileCheck2,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const layers = [
  {
    id: 1,
    title: 'Layer 1: Data Collection',
    icon: Database,
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/40',
    lightColor: 'text-blue-400',
    summary: 'Parses multi-domain structured schemas across HR, Healthcare, Finance, and Enterprise IoT.',
    details: 'Supports real-time ingestion, input validation, and parameter state normalization.'
  },
  {
    id: 2,
    title: 'Layer 2: Data Processing',
    icon: Cpu,
    color: 'from-indigo-500 to-violet-600',
    borderColor: 'border-indigo-500/40',
    lightColor: 'text-indigo-400',
    summary: 'Feature engineering, missing value imputation, and z-score normalization vectorization.',
    details: 'Calculates dynamic baseline reference values and prepares feature matrix.'
  },
  {
    id: 3,
    title: 'Layer 3: Prediction Engine',
    icon: Binary,
    color: 'from-violet-500 to-purple-600',
    borderColor: 'border-violet-500/40',
    lightColor: 'text-purple-400',
    summary: 'Gradient boosting ensembles (XGBoost, Random Forest, LightGBM, Neural Networks).',
    details: 'Computes probability distributions bounded between 8% and 98% with fallback heuristics.'
  },
  {
    id: 4,
    title: 'Layer 4: Explainable AI',
    icon: BrainCircuit,
    color: 'from-purple-500 to-violet-600',
    borderColor: 'border-purple-500/40',
    lightColor: 'text-purple-400',
    summary: 'Generates SHAP (Waterfall, Force Plot, Bar) & LIME local linear boundary attributions.',
    details: 'Extracts signed positive (risk stimulating) and negative (protective) feature contributions.'
  },
  {
    id: 5,
    title: 'Layer 5: Confidence Engine',
    icon: Gauge,
    color: 'from-violet-500 to-indigo-600',
    borderColor: 'border-violet-500/40',
    lightColor: 'text-violet-400',
    summary: 'Determines model certainty %, statistical variance bounds, and epistemic risk score.',
    details: 'Triggers low confidence warnings if uncertainty exceeds pre-set system tolerance (< 60%).'
  },
  {
    id: 6,
    title: 'Layer 6: Ethical AI Firewall',
    icon: ShieldAlert,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/40',
    lightColor: 'text-amber-400',
    summary: 'Real-time policy enforcement, demographic parity audit, and bias risk checking.',
    details: 'Automatically flags high-risk outcomes (> 70%) for mandatory human review.'
  },
  {
    id: 7,
    title: 'Layer 7: Human In The Loop',
    icon: UserCheck,
    color: 'from-orange-500 to-rose-600',
    borderColor: 'border-orange-500/40',
    lightColor: 'text-orange-400',
    summary: 'Mandatory approval workflow for critical decisions, reviewer notes, and status queues.',
    details: 'Prevents automatic finalization when ethical or confidence thresholds are triggered.'
  },
  {
    id: 8,
    title: 'Layer 8: Audit Intelligence',
    icon: FileCheck2,
    color: 'from-rose-500 to-pink-600',
    borderColor: 'border-rose-500/40',
    lightColor: 'text-pink-400',
    summary: 'Immutable audit logs, version history, change tracking, and AI Decision Certificates.',
    details: 'Stores cryptographic hashes, timestamps, reviewer credentials, and compliance certificates.'
  }
];

const PipelineDiagram = ({ currentLayer = 4, predictionData = null }) => {
  const [selectedLayer, setSelectedLayer] = useState(layers[3]);

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            8-Layer Responsible AI Pipeline Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time interactive trace of decision data moving from Collection to Immutable Audit.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
          <span className="text-xs font-mono text-slate-300">Pipeline Active • All 8 Layers Operational</span>
        </div>
      </div>

      {/* Layer Flow Stepper Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isSelected = selectedLayer.id === layer.id;
          const isPassed = layer.id <= currentLayer;

          return (
            <motion.button
              key={layer.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedLayer(layer)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative overflow-hidden h-32 cursor-pointer ${
                isSelected 
                  ? `bg-gradient-to-b ${layer.color} text-white ${layer.borderColor} shadow-lg shadow-purple-500/10` 
                  : isPassed
                  ? 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-slate-600'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  L{layer.id}
                </span>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : layer.lightColor}`} />
              </div>

              <div>
                <p className={`text-xs font-semibold leading-tight line-clamp-2 ${
                  isSelected ? 'text-white' : 'text-slate-300'
                }`}>
                  {layer.title.split(': ')[1]}
                </p>
              </div>

              <div className="flex items-center text-[10px] opacity-80 mt-1 font-mono">
                {isPassed ? (
                  <span className="flex items-center text-purple-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Executed
                  </span>
                ) : (
                  <span className="text-slate-500">Standby</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Layer Info Inspector */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedLayer.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start gap-4"
        >
          <div className={`p-4 rounded-xl bg-gradient-to-br ${selectedLayer.color} text-white shrink-0`}>
            {React.createElement(selectedLayer.icon, { className: 'w-8 h-8' })}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                {selectedLayer.title}
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${selectedLayer.borderColor} ${selectedLayer.lightColor} bg-slate-950/60`}>
                  Responsible AI Spec
                </span>
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedLayer.summary}
            </p>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-purple-400" /> Operational Context:
              </span>
              <p>{selectedLayer.details}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PipelineDiagram;
