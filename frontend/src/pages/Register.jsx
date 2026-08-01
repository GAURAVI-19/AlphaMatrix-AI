import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, Briefcase, Building, Eye, EyeOff, BrainCircuit, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [branch, setBranch] = useState('');
  const [branchesList, setBranchesList] = useState([]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch branch records from active backend on mount for clean select dropdown
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get('/branches');
        if (response.data?.success) {
          setBranchesList(response.data.data.branches || []);
        }
      } catch (err) {
        // Fallback static branches if offline/fail
        setBranchesList([
          { _id: '645a2789bc0032fdfa0123ef', name: 'Alpha HQ Node' },
          { _id: '645a2789bc0032fdfa0123f0', name: 'West Coast Hub' }
        ]);
      }
    };
    fetchBranches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !department || !position) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const payload = {
      name,
      email,
      password,
      phone,
      department,
      position,
      role,
      branch: branch || undefined
    };

    const result = await register(payload);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-950/20 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-950/20 rounded-full filter blur-[100px] animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg p-8 rounded-2xl glass-card relative z-10 shadow-glass border border-slate-800"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mb-3 shadow-lg glow-purple">
            <BrainCircuit className="w-5.5 h-5.5 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Register Corporate Node
          </h2>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest block uppercase mt-1">
            AlphaMatrix Algorithmic Vault
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-xs flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 font-mono">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 font-mono">
                Corporate Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@alphamatrix.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 font-mono">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 0199"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 font-mono">
                Verification Key *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 font-mono">
                Department Name *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Engineering / Sales"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 font-mono">
                Job Position Title *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Architect / Manager"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 font-mono">
                System Role Access
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="EMPLOYEE">Employee Node</option>
                  <option value="BRANCH_MANAGER">Branch Manager Node</option>
                  <option value="SUPER_ADMIN">Super Administrator Node</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 font-mono">
                Branch Association Node
              </label>
              <div className="relative">
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:border-purple-500 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Select Branch (Optional)</option>
                  {branchesList.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg glow-purple flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-white animate-spin"></div>
                <span>PROVISIONING CLOUD WORKSPACE...</span>
              </div>
            ) : (
              'Create System Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 font-sans border-t border-slate-800/60 pt-4">
          <span>Already registered? </span>
          <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
            Secure Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
