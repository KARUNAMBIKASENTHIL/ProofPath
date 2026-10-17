import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Target, 
  FolderGit2, 
  Compass, 
  Upload, 
  UserCheck, 
  CheckCircle2, 
  Code,
  Briefcase,
  Users2,
  AlertTriangle,
  Award
} from 'lucide-react';

interface Props {
  onOpenAuth: (mode: 'login' | 'register', role?: 'student' | 'placement_officer' | 'recruiter') => void;
}

export const LandingPage: React.FC<Props> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#111827] flex flex-col font-sans antialiased p-2 sm:p-5">
      <div className="w-full max-w-[1560px] mx-auto bg-white rounded-[24px] sm:rounded-[36px] shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-[#EBECEF] overflow-hidden flex flex-col min-h-[92vh]">
        {/* Top Navbar */}
        <nav className="h-20 border-b border-[#F0F1F3] bg-white px-6 sm:px-12 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#1A5336] shadow-xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                <path d="M9 21h6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-[#111827] tracking-tight">ProofPath</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                  Career Intelligence Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Two Core Portals: Recruiter & Placement Directorate • Student Candidate</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth('login', 'recruiter')}
              className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#1A5336]" />
              <span>Recruiter Sign In</span>
            </button>
            <button
              onClick={() => onOpenAuth('login', 'student')}
              className="btn-primary text-xs font-bold px-5 py-2.5 flex items-center gap-1.5"
            >
              <span>Student Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 sm:px-12 py-10 sm:py-16 max-w-6xl mx-auto text-center space-y-8 flex-1 flex flex-col justify-center">
          
          {/* Main Title & Subtitle */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[11px] font-bold text-[#166534]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evidence-Based Career Verification & Skill Gap Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight text-[#111827] leading-tight max-w-4xl mx-auto">
              Not Just Matching Words. <br />
              <span className="text-[#1A5336]">Grounded in Proof of Work.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Consolidates student resumes and GitHub repositories. Evaluates job readiness with explainable deterministic scoring, code questions, and personalized roadmaps.
            </p>
          </div>

          {/* TWO PRIMARY MODULE HERO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto text-left pt-2">
            
            {/* MODULE 1: RECRUITER & PLACEMENT MODULE */}
            <div 
              onClick={() => onOpenAuth('login', 'recruiter')}
              className="p-6 sm:p-8 rounded-[28px] bg-gradient-to-br from-[#123824] to-[#0A2316] text-white border border-[#1A5336] shadow-xl hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Module 1 • Recruiter
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                    Recruiter & Placement Portal
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Upload student resumes and benchmark against any required Job Description (JD).
                  </p>
                </div>

                <div className="space-y-2 pt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Upload resume (PDF/DOCX) & paste target Job Description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Proof-of-Work Verification (exposes unverified word matches)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pinpoints exact lagging skills & missing deliverables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Generate exportable Recruiter Audit & Evaluation Report</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                  <span>Sign In as Recruiter</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Demo: placement@proofpath.io
                </span>
              </div>
            </div>

            {/* MODULE 2: STUDENT CANDIDATE MODULE */}
            <div 
              onClick={() => onOpenAuth('login', 'student')}
              className="p-6 sm:p-8 rounded-[28px] bg-white border border-[#EBECEF] hover:border-[#1A5336] shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#1A5336]">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                    Module 2 • Student
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-[#111827] group-hover:text-[#1A5336] transition-colors">
                    Student Candidate Portal
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Direct access without separate logins. Analyzes GitHub code & generates personalized roadmaps.
                  </p>
                </div>

                <div className="space-y-2 pt-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1A5336] shrink-0" />
                    <span>Direct entry to Skill Analysis — no separate login needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1A5336] shrink-0" />
                    <span>Interactive GitHub-derived questions (Project Viva Defense)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1A5336] shrink-0" />
                    <span>Deterministic Job Readiness Score calculated from real code proof</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1A5336] shrink-0" />
                    <span>Personalized Roadmap generated from curated Markdown documents</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A5336] group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                  <span>Sign In as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Demo: alex.chen@proofpath.io
                </span>
              </div>
            </div>

          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onOpenAuth('register', 'recruiter')}
              className="btn-secondary text-xs py-3 px-6 font-bold"
            >
              <span>Register as Recruiter / Placement Officer</span>
            </button>
            <button
              onClick={() => onOpenAuth('register', 'student')}
              className="btn-primary text-xs py-3 px-6 font-bold shadow-md"
            >
              <span>Create Free Student Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* 3 Pillars Footer */}
        <footer className="px-6 sm:px-12 py-8 max-w-6xl mx-auto border-t border-slate-100 w-full text-center text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
            <span>Deterministic Scoring Formula: Score = 100 × (Σ w_i × c_i) / (Σ w_i)</span>
            <span>•</span>
            <span>RAG Document Grounding: CareerLens Knowledge Base</span>
            <span>•</span>
            <span>Zero Mocking in Production</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
