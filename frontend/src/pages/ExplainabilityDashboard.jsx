import React, { useState } from 'react';
import { BrainCircuit, Activity, Sliders, Layers, FileText, CheckCircle2 } from 'lucide-react';
import PipelineDiagram from '../components/PipelineDiagram';
import ShapChart from '../components/ShapChart';

const ExplainabilityDashboard = () => {
  const [selectedLayer, setSelectedLayer] = useState(4);

  // Sample explainability dataset for enterprise demonstration
  const sampleFeatures = [
    { name: 'satisfactionScore', importance: -0.32, value: '3.2 / 10' },
    { name: 'performanceScore', importance: -0.18, value: '88%' },
    { name: 'attendance', importance: -0.12, value: '96%' },
    { name: 'projectsCompleted', importance: 0.15, value: '14 active projects' },
    { name: 'courseCount', importance: -0.08, value: '4 courses' },
    { name: 'skillCount', importance: -0.05, value: '7 skills' }
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-purple-400" />
            Explainable AI (XAI) Intelligence Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete transparency layer providing SHAP attributions, LIME local boundary rules, and natural language decision narratives.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 font-semibold">
          Methodology: SHAP + LIME Dual-Explainer
        </span>
      </div>

      {/* Interactive 8-Layer Architecture Pipeline Diagram */}
      <PipelineDiagram currentLayer={selectedLayer} />

      {/* SHAP & LIME Deep Dive Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Global & Local Feature Attributions (SHAP Vectors)
          </h3>
          <ShapChart features={sampleFeatures} predictionScore={68} />
        </div>

        <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Natural Language Decision Narrative
          </h3>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-purple-400 font-bold font-mono">
              <CheckCircle2 className="w-4 h-4" /> Narrative Synthesis Verified
            </div>

            <p className="leading-relaxed">
              The target decision vector was generated with a primary risk driver centered on low satisfaction scores combined with high project workloads (14 active projects).
            </p>

            <p className="leading-relaxed">
              High performance scores (88%) and solid attendance (96%) act as strong protective vectors, reducing overall attrition probability by 30%.
            </p>

            <div className="pt-2 border-t border-slate-800 font-mono text-[11px] text-slate-400">
              Model Interpretability Index: <span className="text-purple-400 font-bold">96.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityDashboard;
