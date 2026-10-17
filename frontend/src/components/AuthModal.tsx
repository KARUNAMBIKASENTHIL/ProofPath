import React, { useState } from 'react';
import { api, AuthUser } from '../services/api';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  AlertCircle, 
  ArrowRight, 
  UserCheck,
  X,
  Briefcase,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register';
  initialRole?: 'student' | 'placement_officer' | 'recruiter';
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  initialRole = 'student'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'student' | 'recruiter'>(
    initialRole === 'student' ? 'student' : 'recruiter'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [degree, setDegree] = useState('');
  const [gradYear, setGradYear] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        
        const res = await api.register({
          email,
          password,
          full_name: fullName,
          role: selectedRole === 'recruiter' ? 'placement_officer' : 'student',
          degree: degree.trim() || undefined,
          graduation_year: gradYear ? parseInt(gradYear, 10) : undefined,
          target_role: selectedRole === 'recruiter' ? 'Talent Acquisition & Placement' : undefined
        });
        onAuthSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(demoEmail, demoPass);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-[32px] bg-white border border-[#EBECEF] shadow-2xl space-y-5 my-auto text-[#111827] relative animate-in fade-in duration-200">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center mx-auto text-[#1A5336] shadow-xs">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
              <path d="M9 21h6" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
              {mode === 'login' ? 'Sign In to ProofPath' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your portal below: Recruiter / Placement Officer or Student Candidate.
            </p>
          </div>
        </div>

        {/* 1. Portal Selector (Student vs Recruiter) */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => { setSelectedRole('recruiter'); setError(null); }}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'recruiter'
                ? 'bg-white text-[#1A5336] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Recruiter / Placement</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedRole('student'); setError(null); }}
            className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              selectedRole === 'student'
                ? 'bg-white text-[#1A5336] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student Candidate</span>
          </button>
        </div>

        {/* 2. Fast 1-Click Demo Access Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Instant 1-Click Demo Login
          </div>

          {selectedRole === 'recruiter' ? (
            <button
              type="button"
              onClick={() => handleDemoLogin('placement@proofpath.io', 'placement123')}
              className="w-full p-2.5 rounded-xl bg-white border border-[#1A5336]/40 hover:border-[#1A5336] hover:bg-[#F8FAF9] text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#1A5336] font-bold text-xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-[#1A5336]">
                    Recruiter Demo (Prof. Sarah Jenkins)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Upload resumes & analyze candidate gaps against JDs
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#DCFCE7] text-[#166534]">
                1-Click Login →
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleDemoLogin('alex.chen@proofpath.io', 'password123')}
              className="w-full p-2.5 rounded-xl bg-white border border-[#1A5336]/40 hover:border-[#1A5336] hover:bg-[#F8FAF9] text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#1A5336] font-bold text-xs">
                  A
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-[#1A5336]">
                    Student Demo (Alex Chen - ML Candidate)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Direct GitHub Viva Questions & RAG Learning Roadmap
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#DCFCE7] text-[#166534]">
                1-Click Login →
              </span>
            </button>
          )}
        </div>

        {/* Mode Selector Tabs (Sign In vs Register) */}
        <div className="grid grid-cols-2 p-1 rounded-full bg-slate-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2 rounded-full transition-all ${
              mode === 'login'
                ? 'bg-[#1A5336] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2 rounded-full transition-all ${
              mode === 'register'
                ? 'bg-[#1A5336] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={selectedRole === 'recruiter' ? 'e.g. Marcus Vance (Recruiter)' : 'e.g. Alex Chen'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#1A5336] focus:bg-white text-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'recruiter' ? 'recruiter@company.com' : 'student@university.edu'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#1A5336] focus:bg-white text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#1A5336] focus:bg-white text-xs"
              />
            </div>
          </div>

          {mode === 'register' && selectedRole === 'student' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Degree / Major</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech CS"
                    className="w-full pl-8 pr-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#1A5336] focus:bg-white text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Grad Year</label>
                <input
                  type="number"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  placeholder="2026"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#1A5336] focus:bg-white text-xs"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-xs font-bold mt-2 shadow-md flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {mode === 'login' 
                    ? `Sign In as ${selectedRole === 'recruiter' ? 'Recruiter' : 'Student'}` 
                    : `Create ${selectedRole === 'recruiter' ? 'Recruiter' : 'Student'} Account`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
