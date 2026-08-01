import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  UserPlus, 
  ArrowUpDown,
  Building,
  Activity,
  Briefcase,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeList = () => {
  const { user } = useAuth();
  
  // Grid tracking states
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Sorting specs
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals operations
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Form states for creating a new employee
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    branch: '',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0],
    employeeId: ''
  });

  // Form states for updating an employee
  const [updateData, setUpdateData] = useState({
    department: '',
    position: '',
    salary: '',
    status: 'ACTIVE'
  });

  // Fetch lists on filters change
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/employees', {
        params: {
          page,
          limit: 8,
          search: debouncedSearch,
          sortBy,
          sortOrder
        }
      });

      if (response.data?.success) {
        setEmployees(response.data.data.employees || []);
        setTotalPages(response.data.data.pagination.pages || 1);
      }
    } catch (err) {
      setError('Failed to fetch employee records. Please ensure your backend is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, debouncedSearch, sortBy, sortOrder]);

  // Fetch branch nodes for forms select
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches');
        if (res.data?.success) {
          setBranches(res.data.data.branches || []);
        }
      } catch (err) {
        // Fallback
        setBranches([
          { _id: '645a2789bc0032fdfa0123ef', name: 'Alpha HQ Node' },
          { _id: '645a2789bc0032fdfa0123f0', name: 'West Coast Hub' }
        ]);
      }
    };
    fetchBranches();
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await api.post('/employees', formData);
      if (res.data?.success) {
        setIsCreateOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          department: '',
          position: '',
          branch: '',
          salary: '',
          joinDate: new Date().toISOString().split('T')[0],
          employeeId: ''
        });
        fetchEmployees();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee record');
    }
  };

  const handleEditClick = (emp) => {
    setEditingEmployee(emp);
    setUpdateData({
      department: emp.department || '',
      position: emp.position || '',
      salary: emp.salary || '',
      status: emp.status || 'ACTIVE'
    });
    setIsEditOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await api.put(`/employees/${editingEmployee._id}`, updateData);
      if (res.data?.success) {
        setIsEditOpen(false);
        setEditingEmployee(null);
        fetchEmployees();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee details');
    }
  };

  const handleDeleteClick = async (empId) => {
    if (!window.confirm('Are you absolutely sure you want to soft-delete this employee node?')) return;
    try {
      setError('');
      const res = await api.delete(`/employees/${empId}`);
      if (res.data?.success) {
        fetchEmployees();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove employee record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            Talent Resource Matrix
          </h1>
          <p className="text-xs text-slate-400">
            CRUD operations, server-side paginations, and role-restricted security hooks.
          </p>
        </div>

        {/* Create action button for administrative roles only */}
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'BRANCH_MANAGER') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-lg glow-purple shrink-0 gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Provision New Employee
          </button>
        )}
      </div>

      {/* Grid filters & Search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl bg-slate-900/30 border border-slate-800/80">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Employee ID, Department, or Position..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-600 text-xs focus:border-purple-500 focus:outline-none transition-all duration-200"
          />
        </div>
        
        {/* Active diagnostic trace feedback */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <span>QUERY BOUNCE BLOCK active</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 text-xs flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Reusable glass table */}
      <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono tracking-wider uppercase">
                <th className="px-6 py-4 font-semibold">Employee ID</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Position</th>
                <th className="px-6 py-4 font-semibold cursor-pointer select-none hover:text-white transition-colors" onClick={() => handleSort('salary')}>
                  <span className="flex items-center gap-1.5">
                    Salary <ArrowUpDown className="w-3.5 h-3.5" />
                  </span>
                </th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-800 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-slate-800 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-12"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-800 rounded w-10 ml-auto"></div></td>
                  </tr>
                ))
              ) : employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-purple-400">{emp.employeeId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{emp.userId?.name || 'Jane Doe'}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.userId?.email || 'jane@matrix.com'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{emp.department}</td>
                    <td className="px-6 py-4">{emp.position}</td>
                    <td className="px-6 py-4 font-mono">₹{emp.salary?.toLocaleString('en-IN') || '0'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                        emp.status === 'ACTIVE' 
                          ? 'bg-purple-950/40 text-purple-400 border border-purple-800/40' 
                          : 'bg-red-950/40 text-red-400 border border-red-800/40'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Dynamic action buttons scoped strictly by access checks */}
                      {(user?.role === 'SUPER_ADMIN' || user?.role === 'BRANCH_MANAGER') ? (
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            onClick={() => handleEditClick(emp)}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(emp._id)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Node"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">READ ONLY</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 font-mono text-[10px]">
                    NO DYNAMIC EMPLOYEE RECORDS FOUND MAPPED TO FILTERS
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Paginations control block */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/20">
            <span className="text-[10px] font-mono text-slate-500">
              PAGE {page} OF {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800/40 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800/40 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE DIALOG MODAL LAYOUT */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl glass-panel border border-slate-800 p-6 relative z-10 shadow-glass"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-400" /> Provision New Employee Node
                </h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Employee ID</label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      placeholder="e.g. EMP-1092"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Department *</label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Position *</label>
                    <input
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Salary (₹/mo) *</label>
                    <input
                      type="number"
                      required
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Branch Node *</label>
                    <select
                      required
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Branch</option>
                      {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg glow-purple mt-4 cursor-pointer"
                >
                  Create Corporate Node
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPDATE DIALOG MODAL LAYOUT */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsEditOpen(false); setEditingEmployee(null); }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl glass-panel border border-slate-800 p-6 relative z-10 shadow-glass"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-purple-400" /> Update Employee Details
                </h3>
                <button onClick={() => { setIsEditOpen(false); setEditingEmployee(null); }} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Department</label>
                  <input
                    type="text"
                    value={updateData.department}
                    onChange={(e) => setUpdateData({...updateData, department: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Position</label>
                  <input
                    type="text"
                    value={updateData.position}
                    onChange={(e) => setUpdateData({...updateData, position: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Salary (₹/mo)</label>
                  <input
                    type="number"
                    value={updateData.salary}
                    onChange={(e) => setUpdateData({...updateData, salary: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase mb-1.5">Node status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE Node</option>
                    <option value="SUSPENDED">SUSPENDED Node</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg glow-purple mt-4 cursor-pointer"
                >
                  Confirm Details Commit
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeList;
