import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, BrainCircuit, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide all credentials');
      return;
    }

    setError('');
    setIsSubmitting(true);
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Matrix/Lavender ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-950/20 rounded-full filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-950/20 rounded-full filter blur-[100px] animate-pulse"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-2xl glass-card relative z-10 shadow-glass border border-slate-800"
      >
        {/* Brand/Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mb-3 shadow-lg glow-purple">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
            ALPHA<span className="text-purple-400">MATRIX</span>
          </h2>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest block uppercase mt-1">
            Enterprise Decision Intelligence
          </span>
        </div>

        {/* Action Error Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-xs flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400 shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2 font-mono">
              Corporate Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@alphamatrix.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 text-sm focus:border-purple-500 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2 font-mono">
              Secure Key / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 text-sm focus:border-purple-500 focus:outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg glow-purple flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-white animate-spin"></div>
                <span>VERIFYING SECURE SESSION...</span>
              </div>
            ) : (
              'Securely Sign In'
            )}
          </button>
        </form>

        {/* Footer actions */}
        <div className="mt-8 text-center text-xs text-slate-500 font-sans border-t border-slate-800/60 pt-6">
          <span>Need an account? </span>
          <Link to="/register" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
            Register Corporate Node
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
