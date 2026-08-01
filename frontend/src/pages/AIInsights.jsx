import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PredictionForm from '../components/PredictionForm';
import ShapChart from '../components/ShapChart';
import RiskAlert from '../components/RiskAlert';
import PipelineDiagram from '../components/PipelineDiagram';
import DomainSelector from '../components/DomainSelector';
import DecisionCertificateModal from '../components/DecisionCertificateModal';
import { 
  Sparkles, 
  BrainCircuit, 
  HelpCircle, 
  TrendingUp, 
  Activity, 
  ShieldAlert,
  Download,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { downloadPDFReport } from '../services/reportGenerator';

const AIInsights = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [predictionType, setPredictionType] = useState('ATTRITION');
  const [activeDomain, setActiveDomain] = useState('HR');
  const [predictionResult, setPredictionResult] = useState(null);
  const [isCertOpen, setIsCertOpen] = useState(false);
  
  // Interactive prediction parameter states
  const [performanceScore, setPerformanceScore] = useState(75);
  const [attendance, setAttendance] = useState(95);
  const [productivity, setProductivity] = useState(80);
  const [quality, setQuality] = useState(80);
  const [teamwork, setTeamwork] = useState(80);
  const [initiative, setInitiative] = useState(80);
  const [satisfactionScore, setSatisfactionScore] = useState(5);
  const [projectsCompleted, setProjectsCompleted] = useState(5);
  const [skillCount, setSkillCount] = useState(3);
  const [certificationCount, setCertificationCount] = useState(1);
  const [courseCount, setCourseCount] = useState(2);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch employees list on page mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setInitialLoading(true);
        setError('');
        const res = await api.get('/employees', { params: { page: 1, limit: 100 } });
        if (res.data?.success) {
          setEmployees(res.data.data.employees || []);
        }
      } catch (err) {
        setError('Failed to fetch employee directories. Please verify the backend status.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleEmployeeChange = (empId) => {
    setSelectedEmployee(empId);
    if (!empId) {
      setPerformanceScore(75);
      setAttendance(95);
      setProductivity(80);
      setQuality(80);
      setTeamwork(80);
      setInitiative(80);
      setSatisfactionScore(5);
      setProjectsCompleted(5);
      setSkillCount(3);
      setCertificationCount(1);
      setCourseCount(2);
      setPredictionResult(null);
      return;
    }
    const emp = employees.find(e => e._id === empId);
    if (emp) {
      setPerformanceScore(emp.performance?.currentScore ?? 75);
      setAttendance(emp.performance?.attendance ?? 95);
      setProductivity(emp.performance?.productivity ?? 80);
      setQuality(emp.performance?.quality ?? 80);
      setTeamwork(emp.performance?.teamwork ?? 80);
      setInitiative(emp.performance?.initiative ?? 80);
      setSatisfactionScore(emp.satisfactionScore ?? 5);
      setProjectsCompleted(emp.metrics?.projectsCompleted ?? 5);
      setSkillCount(emp.skills?.length ?? 3);
      setCertificationCount(emp.certifications?.length ?? 1);
      setCourseCount(emp.courses?.length ?? 2);
    }
  };

  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setError('Please select an active employee node before launching inference gradients.');
      return;
    }

    // Client-side validations
    if (performanceScore < 0 || performanceScore > 100 ||
        attendance < 0 || attendance > 100 ||
        productivity < 0 || productivity > 100 ||
        quality < 0 || quality > 100 ||
        teamwork < 0 || teamwork > 100 ||
        initiative < 0 || initiative > 100) {
      setError('Quantitative performance indicators must fall between 0% and 100%.');
      return;
    }

    if (satisfactionScore < 1 || satisfactionScore > 10) {
      setError('Behavioral satisfaction index must fall between 1 and 10.');
      return;
    }

    if (projectsCompleted < 0 || skillCount < 0 || certificationCount < 0 || courseCount < 0) {
      setError('Operational metric counts cannot be negative values.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setPredictionResult(null);

      const response = await api.post('/predictions/generate', {
        employeeId: selectedEmployee,
        predictionType,
        domain: activeDomain,
        inputData: {
          performanceScore,
          attendance,
          productivity,
          quality,
          teamwork,
          initiative,
          satisfactionScore,
          projectsCompleted,
          skillCount,
          certificationCount,
          courseCount
        }
      });

      if (response.data?.success) {
        setPredictionResult(response.data.data.prediction);
        showToast('Inference gradients computed successfully. SHAP exit vectors and ethical firewalls updated!', 'success');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate prediction gradients.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-900/40 rounded-2xl border border-slate-800/80"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-[360px] bg-slate-900/40 rounded-2xl border border-slate-800/80"></div>
          <div className="md:col-span-2 h-[360px] bg-slate-900/40 rounded-2xl border border-slate-800/80"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic welcome header */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            Explainable AI Insights (SHAP) <BrainCircuit className="w-5 h-5 text-purple-400" />
          </h1>
          <p className="text-xs text-slate-400">
            Real-time neural exit analysis, relative feature gradients, and ethical AI firewalls.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/30 border border-purple-900/40 text-[10px] font-semibold text-purple-300 font-mono">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>FIREWALL STATE: STRICT PRODUCIBILITY</span>
        </div>
      </div>

      {/* Domain Target Selector */}
      <DomainSelector activeDomain={activeDomain} onSelectDomain={setActiveDomain} />

      {/* 8-Layer Pipeline Visualizer */}
      <PipelineDiagram currentLayer={predictionResult ? 6 : 4} predictionData={predictionResult} />

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Parameters Select form */}
        <div className="space-y-6">
          <PredictionForm
            employees={employees}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={handleEmployeeChange}
            predictionType={predictionType}
            setPredictionType={setPredictionType}
            onSubmit={handlePredictSubmit}
            isSubmitting={loading}
            params={{
              performanceScore,
              attendance,
              productivity,
              quality,
              teamwork,
              initiative,
              satisfactionScore,
              projectsCompleted,
              skillCount,
              certificationCount,
              courseCount
            }}
            setParams={{
              setPerformanceScore,
              setAttendance,
              setProductivity,
              setQuality,
              setTeamwork,
              setInitiative,
              setSatisfactionScore,
              setProjectsCompleted,
              setSkillCount,
              setCertificationCount,
              setCourseCount
            }}
          />
        </div>

        {/* Right Side: SHAP Values Force Chart and Ethical Firewalls */}
        <div className="md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 animate-pulse"
              >
                {/* Risk and metrics highlight skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between h-[110px]">
                    <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                    <div className="h-8 bg-slate-800 rounded w-1/2 mt-2"></div>
                  </div>
                  <div className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between h-[110px]">
                    <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                    <div className="h-8 bg-slate-800 rounded w-1/2 mt-2"></div>
                  </div>
                </div>

                {/* AI Assessment Summary skeleton */}
                <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2 h-[80px] flex flex-col justify-center">
                  <div className="h-3 bg-slate-800 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-800 rounded w-3/4 mt-1"></div>
                </div>

                {/* Force Chart explainability Card skeleton */}
                <div className="p-6 rounded-2xl glass-card border border-slate-800 h-[380px] space-y-4">
                  <div className="flex justify-between border-b border-slate-800 pb-3">
                    <div className="space-y-2 w-1/3">
                      <div className="h-4 bg-slate-800 rounded"></div>
                      <div className="h-2.5 bg-slate-800 rounded w-3/4"></div>
                    </div>
                    <div className="h-8 bg-slate-800 rounded w-28"></div>
                  </div>
                  <div className="h-[260px] bg-slate-900/20 rounded-xl flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-slate-700 border-t-purple-400 rounded-full animate-spin"></div>
                  </div>
                </div>
              </motion.div>
            ) : predictionResult ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Risk and metrics highlight banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Risk Score Widget */}
                  <div className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between h-[110px]">
                    <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                      PREDICTED ATTRITION RISK
                    </span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className={`text-4xl font-extrabold tracking-tight ${
                        predictionResult.prediction >= 70 
                          ? 'text-red-500' 
                          : predictionResult.prediction >= 40 
                            ? 'text-yellow-500' 
                            : 'text-purple-400'
                      }`}>
                        {predictionResult.prediction}%
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                        {predictionResult.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  {/* Confidence Rating Widget */}
                  <div className="p-5 rounded-2xl glass-card border border-slate-800 flex flex-col justify-between h-[110px]">
                    <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                      ESTIMATION CONFIDENCE
                    </span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-4xl font-extrabold text-white tracking-tight">
                        {Math.round(predictionResult.confidence * 100)}%
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                        Stochastic match
                      </span>
                    </div>
                  </div>

                </div>

                {/* AI Assessment Summary (SMART INSIGHTS) */}
                <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-2 text-purple-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI-Generated Smart Summary</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {predictionResult.prediction >= 70 ? (
                      <>
                        Employee <span className="text-white font-bold">{employees.find(e => e._id === selectedEmployee)?.userId?.name || 'Subject'}</span> shows a critical exit gradient (<span className="text-red-400 font-bold">{predictionResult.prediction}%</span>). The primary exit drivers consist of low satisfaction index (<span className="text-red-400 font-semibold">{satisfactionScore}/10</span>) and attendance deviations (<span className="text-red-400 font-semibold">{attendance}%</span>). Immediate talent retention workflow assignment is highly recommended.
                      </>
                    ) : predictionResult.prediction >= 40 ? (
                      <>
                        Employee <span className="text-white font-bold">{employees.find(e => e._id === selectedEmployee)?.userId?.name || 'Subject'}</span> presents a moderate risk vector (<span className="text-yellow-400 font-bold">{predictionResult.prediction}%</span>). Minor protective friction is detected in satisfaction indices (<span className="text-yellow-400 font-semibold">{satisfactionScore}/10</span>) or attendance records (<span className="text-yellow-400 font-semibold">{attendance}%</span>). Active branch mentoring should be assigned.
                      </>
                    ) : (
                      <>
                        Employee <span className="text-white font-bold">{employees.find(e => e._id === selectedEmployee)?.userId?.name || 'Subject'}</span> exhibits an exceptionally stable profile with low exit probability (<span className="text-purple-400 font-bold">{predictionResult.prediction}%</span>). Maintained high baseline performance rating (<span className="text-purple-400 font-semibold">{performanceScore}%</span>) and productivity indexes represent powerful protective vectors.
                      </>
                    )}
                  </p>
                </div>

                {/* Force Chart explainability Card */}
                <div className="p-6 rounded-2xl glass-card border border-slate-800 shadow-glass">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-6 gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        Relative SHAP Feature Contributions
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-0.5">
                        Exit Driver Forces (Red = Drives Risk Up, Green = Protective Factors)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCertOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white active:scale-95 text-xs font-bold transition-all duration-200 shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0 glow-purple"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>AI Decision Certificate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPDFReport(predictionResult, employees.find(e => e._id === selectedEmployee))}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white active:scale-95 text-slate-300 text-xs font-bold transition-all duration-200 shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF Report</span>
                      </button>
                    </div>
                  </div>

                  <div className="h-[280px]">
                    <ShapChart features={predictionResult.explanation?.features} />
                  </div>
                </div>

                {/* Risk and Bias Firewalls Alert */}
                <RiskAlert
                  score={predictionResult.prediction}
                  confidence={predictionResult.confidence}
                  riskLevel={predictionResult.riskLevel}
                  ethicalCheck={predictionResult.ethicalCheck}
                />

                {/* Decision Certificate Modal */}
                <DecisionCertificateModal
                  isOpen={isCertOpen}
                  onClose={() => setIsCertOpen(false)}
                  prediction={{
                    ...predictionResult,
                    employee: employees.find(e => e._id === selectedEmployee)
                  }}
                />

              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 rounded-2xl glass-card border border-slate-800 border-dashed text-center text-slate-500 text-xs font-mono h-[380px] flex flex-col items-center justify-center gap-2.5"
              >
                <HelpCircle className="w-10 h-10 text-slate-600 animate-pulse" />
                <span>SELECT AN OPERATIONAL NODE AND TRIGGER INFERENCE GRADIENTS</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default AIInsights;
