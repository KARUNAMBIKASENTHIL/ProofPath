import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  User, 
  Target, 
  LogOut, 
  FileText, 
  Upload,
  Search,
  Mail,
  Bell,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  Compass,
  Sparkles,
  Smartphone,
  BarChart3,
  Clock,
  Briefcase
} from 'lucide-react';
import { AuthUser } from '../services/api';

interface LayoutProps {
  currentUser: AuthUser;
  onLogout: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  targetRole?: string | null;
  onStartNewAnalysis?: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentUser,
  onLogout,
  currentTab,
  setCurrentTab,
  targetRole,
  onStartNewAnalysis,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isRecruiter = currentUser.role === 'placement_officer' || currentUser.role === 'recruiter';

  // Role-adaptive menu items matching the simplified unified workflow
  const menuNavItems = isRecruiter ? [
    { id: 'placement', label: 'Candidate JD Gap Audit', icon: Target, badge: 'Proof-of-Work' },
    { id: 'resume-upload', label: 'Upload Candidate Resume', icon: Upload, badge: 'Direct' },
    { id: 'cohort', label: 'Cohort Batch Analytics', icon: BarChart3 },
    { id: 'archive', label: 'Audit History & Reports', icon: Clock },
  ] : [
    { id: 'dashboard', label: 'Dashboard & Roadmap', icon: LayoutDashboard },
    { id: 'resume-upload', label: 'Upload Resume & Code', icon: Upload },
    { id: 'resume-builder', label: 'ATS Resume Builder', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7] p-2 sm:p-5 flex items-center justify-center font-sans antialiased text-[#111827]">
      {/* Donezo-Inspired Outer Master Frame */}
      <div className="w-full max-w-[1560px] bg-white rounded-[24px] sm:rounded-[36px] shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-[#EBECEF] overflow-hidden flex flex-col md:flex-row min-h-[92vh]">

        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="w-full md:w-64 shrink-0 bg-white border-r border-[#F0F1F3] p-5 sm:p-6 flex flex-col justify-between hidden md:flex">
          <div>
            {/* Brand Logo (Green Clover / Spiral icon + Brand Title) */}
            <div 
              onClick={() => setCurrentTab(isRecruiter ? 'placement' : 'dashboard')} 
              className="flex items-center gap-3 cursor-pointer select-none mb-8 px-1"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#1A5336] shadow-sm">
                <svg className="w-5 h-5 text-[#1A5336]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                  <path d="M9 21h6" />
                </svg>
              </div>
              <span className="font-extrabold text-xl text-[#111827] tracking-tight">
                ProofPath
              </span>
            </div>

            {/* Section: MENU */}
            <div className="space-y-1 mb-6">
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-2">
                MENU
              </div>
              {menuNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'text-[#111827] font-bold bg-[#F8FAF9]'
                        : 'text-slate-500 hover:text-[#111827] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#1A5336] rounded-r-full" />
                      )}
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#1A5336]' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isActive ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Logout Alone (General section removed) */}
            <div className="pt-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Bottom Promotional / Mobile App Banner (Dark Forest Green with wave art) */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-[#123824] to-[#0A2316] text-white relative overflow-hidden mt-6 shadow-sm">
            <div className="absolute right-[-10px] bottom-[-10px] w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-emerald-300">
                {isRecruiter ? <Briefcase className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-bold text-white tracking-tight">
                {isRecruiter ? 'Recruiter Suite' : 'ProofPath Mobile'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mb-3">
              {isRecruiter 
                ? 'Benchmark candidate resumes against industry job descriptions.' 
                : 'Track readiness benchmarks and code defense on the go.'}
            </p>
            <button
              onClick={() => setCurrentTab(isRecruiter ? 'placement' : 'resume-upload')}
              className="w-full py-1.5 px-3 rounded-full bg-[#1A5336] hover:bg-[#14422A] text-white text-[11px] font-bold border border-white/20 transition-all text-center block shadow-sm"
            >
              {isRecruiter ? 'Audit Candidate' : 'Get Started'}
            </button>
          </div>
        </aside>

        {/* ================= RIGHT MASTER CONTENT ================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]">

          {/* Top Bar Header */}
          <header className="h-20 px-5 sm:px-8 border-b border-[#F0F1F3] bg-white flex items-center justify-between gap-4 sticky top-0 z-30">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Left: Pill Search Bar */}
            <div className="relative flex-1 max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, projects, benchmarks..."
                className="w-full bg-[#F8F9FA] border border-[#EBECEF] rounded-full py-2.5 pl-10 pr-14 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1A5336] focus:bg-white transition-all shadow-xs"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white border border-[#E5E7EB] text-[10px] font-mono text-slate-400 font-semibold shadow-2xs">
                ⌘K
              </div>
            </div>

            {/* Right: Notification Icons & User Profile Card */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Mail / Message Icon */}
              <button 
                onClick={() => setCurrentTab('skill-analysis')}
                className="w-9 h-9 rounded-full bg-white border border-[#EBECEF] hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all shadow-2xs"
                title="Messages & Notifications"
              >
                <Mail className="w-4 h-4" />
              </button>

              {/* Bell Icon */}
              <button 
                onClick={() => setCurrentTab('dashboard')}
                className="w-9 h-9 rounded-full bg-white border border-[#EBECEF] hover:bg-slate-50 flex items-center justify-center text-slate-600 relative transition-all shadow-2xs"
                title="Activity updates"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 border-2 border-white" />
              </button>

              {/* User Avatar Chip */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-50 transition-all text-left"
                >
                  {/* Round Avatar matching Donezo circular avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1A5336] to-[#22C55E] p-0.5 shadow-xs shrink-0">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#1A5336] font-bold text-xs uppercase">
                      {currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}
                    </div>
                  </div>

                  <div className="hidden lg:block text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#111827] leading-tight">
                        {currentUser.full_name || 'User'}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                        isRecruiter ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isRecruiter ? 'Recruiter' : 'Student'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {currentUser.email || 'user@proofpath.io'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#E5E7EB] shadow-xl py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-xs text-slate-900">{currentUser.full_name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                    </div>
                    {!isRecruiter && (
                      <button
                        onClick={() => { setUserDropdownOpen(false); setCurrentTab('profile'); }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Profile</span>
                      </button>
                    )}
                    <button
                      onClick={() => { setUserDropdownOpen(false); setCurrentTab(isRecruiter ? 'placement' : 'resume-upload'); }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isRecruiter ? 'Candidate Audit' : 'Upload Resume'}</span>
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => { setUserDropdownOpen(false); onLogout(); }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
              <div className="w-72 bg-white h-full p-6 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#1A5336]">
                        <Compass className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-base text-slate-900">ProofPath</span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    {menuNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                            isActive ? 'bg-[#1A5336] text-white' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
              <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
            </div>
          )}

          {/* Page Main Content Area */}
          <main className="flex-1 p-5 sm:p-8 overflow-y-auto">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
};

export default Layout;
