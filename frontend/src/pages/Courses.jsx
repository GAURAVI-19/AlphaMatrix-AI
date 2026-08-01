import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, Search, Book, Clock, GraduationCap, Award, RefreshCw, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const { addToast } = useToast();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let url = `/courses?search=${search}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      const res = await api.get(url);
      setCourses(res.data.data.courses || []);
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to retrieve course curriculum');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [categoryFilter, search]);

  const handleEnroll = async (id) => {
    try {
      await api.post(`/courses/${id}/enroll`);
      addToast('success', 'Enrolled in course successfully');
      fetchCourses();
    } catch (err) {
      console.error(err);
      addToast('error', err.response?.data?.message || 'Failed to enroll in course');
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
            <BookOpen className="w-6 h-6 text-purple-400" />
            Continuous Learning LMS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build enterprise capabilities. Assign, verify, and complete AI governance, safety compliance, and professional modules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500/50 cursor-pointer"
          >
            <option value="">ALL CATEGORIES</option>
            <option value="COMPLIANCE">COMPLIANCE</option>
            <option value="TECHNICAL">TECHNICAL</option>
            <option value="SECURITY">SECURITY</option>
            <option value="LEADERSHIP">LEADERSHIP</option>
          </select>
          <button
            onClick={fetchCourses}
            className="p-2 border border-slate-800 hover:bg-slate-800/40 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-500/50"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 bg-slate-800/20 rounded-2xl border border-slate-800/40 animate-pulse"></div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div key={course._id} className="p-5 glass-card border border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-violet-950/40 text-violet-400 border border-violet-900/60 rounded-lg font-mono tracking-wider uppercase">{course.category}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{course.provider}</span>
                  </div>

                  <h2 className="text-sm font-extrabold text-white line-clamp-1">{course.title}</h2>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{course.description}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-300 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>{course.duration} hrs</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <Calendar className="w-3 h-3 text-violet-400 shrink-0" />
                      <span>Starts {new Date(course.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> {course.enrolledStudents?.length || 0} enrolled
                  </span>
                  <button
                    onClick={() => handleEnroll(course._id)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Self Enroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center glass-card border border-slate-800 rounded-2xl text-slate-500 font-mono text-[10px]">
            NO ACTIVE COURSES DISCOVERED WITH CRITERIA
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Courses;
