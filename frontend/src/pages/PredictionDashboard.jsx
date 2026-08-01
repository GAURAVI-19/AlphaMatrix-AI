import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Cpu, Sparkles, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import axios from 'axios';
import DomainSelector from '../components/DomainSelector';
import PredictionForm from '../components/PredictionForm';
import ShapChart from '../components/ShapChart';
import RiskAlert from '../components/RiskAlert';
import DecisionCertificateModal from '../components/DecisionCertificateModal';

const PredictionDashboard = () => {
  const [activeDomain, setActiveDomain] = useState('HR');
  const [selectedModel, setSelectedModel] = useState('XGBOOST');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [predictionType, setPredictionType] = useState('ATTRITION');
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  // Slider inputs state
  const [params, setParams] = useState({
    performanceScore: 75,
    attendance: 95,
    productivity: 80,
    quality: 80,
    teamwork: 80,
    initiative: 80,
    satisfactionScore: 5,
    projectsCompleted: 5,
    skillCount: 3,
    certificationCount: 1,
    courseCount: 2
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/employees?limit=20', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data?.data?.employees || [];
      setEmployees(list);
      if (list.length > 0) {
        setSelectedEmployee(list[0]._id);
      }
    } catch (err) {
      console.warn('Failed to fetch employees list, using demo list', err);
      setEmployees([
        { _id: '64a9f001c2b3d4e5f6a7b8c9', userId: { name: 'Sarah Jenkins' }, department: 'Engineering' },
        { _id: '64a9f002c2b3d4e5f6a7b8ca', userId: { name: 'Michael Chen' }, department: 'Analytics' }
      ]);
      setSelectedEmployee('64a9f001c2b3d4e5f6a7b8c9');
    }
  };

  const handleGenerate = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/v1/predictions/generate',
        {
          employeeId: selectedEmployee,
          predictionType,
          domain: activeDomain,
          selectedModel,
          inputData: params
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPredictionResult(res.data?.data?.prediction);
    } catch (err) {
      console.error('Prediction generation error', err);
      // Fallback result for demo mode
      const simulatedScore = Math.round(Math.max(10, Math.min(95, 50 - (params.satisfactionScore - 5) * 8 - (params.performanceScore - 75) * 0.4)));
      setPredictionResult({
        _id: `PRED-${Date.now()}`,
        prediction: simulatedScore,
        confidence: 0.89,
        riskLevel: simulatedScore >= 70 ? 'HIGH' : simulatedScore >= 40 ? 'MEDIUM' : 'LOW',
        domain: activeDomain,
        selectedModel,
        certificateId: `AM-CERT-${Date.now()}`,
        explanation: {
          features: [
            { name: 'satisfactionScore', importance: -((params.satisfactionScore - 5) * 0.08), value: String(params.satisfactionScore) },
            { name: 'performanceScore', importance: -((params.performanceScore - 75) * 0.004), value: String(params.performanceScore) },
            { name: 'attendance', importance: -((params.attendance - 95) * 0.0075), value: String(params.attendance) }
          ],
          summary: `Unified exit gradient computed for domain ${activeDomain}. Key protective vector centered on performance metrics.`
        },
        ethicalCheck: { passed: simulatedScore < 75, biasDetected: simulatedScore >= 75 },
        approval: { status: 'PENDING' }
      });
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
            <Cpu className="w-7 h-7 text-purple-400" />
            AI Prediction & Parameter Tuning Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inference matrix with interactive sliders, dynamic heuristics fallback, and instant SHAP attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="XGBOOST">Model: XGBoost Ensemble</option>
            <option value="RANDOM_FOREST">Model: Random Forest</option>
            <option value="LIGHTGBM">Model: LightGBM Fast</option>
            <option value="NEURAL_NETWORK">Model: Deep Neural Net</option>
          </select>
        </div>
      </div>

      {/* Domain Switcher */}
      <DomainSelector activeDomain={activeDomain} onSelectDomain={setActiveDomain} />

      {/* Main Grid: Form Inputs vs Prediction Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
          <PredictionForm
            employees={employees}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            predictionType={predictionType}
            setPredictionType={setPredictionType}
            parameters={params}
            setParameters={setParams}
            onGenerate={handleGenerate}
            loading={loading}
          />
        </div>

        <div className="lg:col-span-6 space-y-6">
          {predictionResult ? (
            <div className="space-y-6">
              {/* Risk Alert Component */}
              <RiskAlert prediction={predictionResult} />

              {/* Explainability Chart Card */}
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Explainable AI Attributions (SHAP)
                  </h3>
                  <button
                    onClick={() => setShowCertModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono font-semibold hover:bg-purple-900/60 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" /> Decision Certificate
                  </button>
                </div>

                <ShapChart
                  features={predictionResult.explanation?.features || []}
                  predictionScore={predictionResult.prediction}
                />
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center space-y-4 flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
                <BrainCircuit className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">No Active Inference Generated</h3>
              <p className="text-xs text-slate-400 max-w-sm font-mono">
                Select an employee node or adjust parameter sliders on the left, then click "Generate Prediction Insight".
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decision Certificate Modal */}
      {predictionResult && (
        <DecisionCertificateModal
          isOpen={showCertModal}
          onClose={() => setShowCertModal(false)}
          prediction={predictionResult}
        />
      )}
    </div>
  );
};

export default PredictionDashboard;
