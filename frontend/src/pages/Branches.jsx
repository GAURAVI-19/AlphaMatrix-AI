import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Network, Plus, Search, MapPin, Users, Mail, Phone, Edit, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    code: '',
    city: '',
    state: '',
    country: 'India',
    address: '',
    pincode: '',
    email: '',
    phone: '',
    website: ''
  });

  const { addToast } = useToast();

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/branches?search=${search}`);
      setBranches(res.data.data.branches || []);
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to load branch list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newBranch.name,
        code: newBranch.code,
        location: {
          city: newBranch.city,
          state: newBranch.state,
          country: newBranch.country,
          address: newBranch.address,
          pincode: newBranch.pincode
        },
        contact: {
          email: newBranch.email,
          phone: newBranch.phone,
          website: newBranch.website
        }
      };

      await api.post('/branches', payload);
      addToast('success', 'Branch created successfully');
      setShowAddModal(false);
      setNewBranch({
        name: '',
        code: '',
        city: '',
        state: '',
        country: 'India',
        address: '',
        pincode: '',
        email: '',
        phone: '',
        website: ''
      });
      fetchBranches();
    } catch (err) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to create branch');
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
            <Network className="w-6 h-6 text-purple-400" />
            Branch Nodes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure, manage, and monitor corporate office locations, active workforce numbers, and target revenue parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-purple-950/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Branch Node
          </button>
          <button
            onClick={fetchBranches}
            className="p-2 border border-slate-800 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Branch Nodes</p>
          <p className="text-2xl font-black text-white mt-1">{branches.length}</p>
          <p className="text-[9px] text-purple-400 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Fully operational & synchronized
          </p>
        </div>
        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Staff Count</p>
          <p className="text-2xl font-black text-white mt-1">
            {branches.reduce((acc, b) => acc + (b.employees?.length || 0), 0)}
          </p>
          <p className="text-[9px] text-slate-400 mt-1">Across all global regional units</p>
        </div>
        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Highest Revenue Node</p>
          <p className="text-2xl font-black text-purple-400 mt-1">HQ Node</p>
          <p className="text-[9px] text-slate-400 mt-1">New York, NY</p>
        </div>
        <div className="p-5 glass-card rounded-2xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active System Load</p>
          <p className="text-2xl font-black text-violet-400 mt-1">Nominal</p>
          <p className="text-[9px] text-slate-400 mt-1">99.98% Gateway Uptime</p>
        </div>
      </div>

      {/* Filter and Cards */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search branch name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-500/50"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-800/20 rounded-2xl border border-slate-800/40 animate-pulse"></div>
            ))}
          </div>
        ) : branches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branches.map((branch) => (
              <div key={branch._id} className="p-5 glass-card border border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-slate-700/80 transition-colors shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-[9px] font-black bg-purple-950/40 text-purple-400 border border-purple-900/60 rounded-lg font-mono uppercase tracking-wider">{branch.code}</span>
                      <h2 className="text-base font-extrabold text-white mt-1.5">{branch.name}</h2>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{branch.location?.address ? `${branch.location.address}, ` : ''}{branch.location?.city}, {branch.location?.state} ({branch.location?.country})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span>{branch.employees?.length || 0} Registered Employees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{branch.contact?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">Manager: {branch.manager?.name || 'Unassigned'}</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-purple-950 text-purple-400 border border-purple-900/60">{branch.status || 'ACTIVE'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center glass-card border border-slate-800 rounded-2xl text-slate-500 font-mono text-[10px]">
            NO REGIONAL BRANCH NODES DISCOVERED WITH CRITERIA
          </div>
        )}
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
              <h3 className="text-base font-extrabold text-white">Create New Branch Node</h3>
              <p className="text-[11px] text-slate-400 mt-1">Populate organizational branch properties for dynamic employee indexing.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Branch Name</label>
                  <input
                    type="text"
                    required
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Branch Code (e.g. BR-HQ)</label>
                  <input
                    type="text"
                    required
                    value={newBranch.code}
                    onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newBranch.city}
                    onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newBranch.state}
                    onChange={(e) => setNewBranch({ ...newBranch, state: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={newBranch.pincode}
                    onChange={(e) => setNewBranch({ ...newBranch, pincode: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newBranch.email}
                    onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
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
                  Create Node
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Branches;
