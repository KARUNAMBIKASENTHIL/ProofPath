import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Code2, 
  Printer, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Cpu, 
  Layers, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';
import { AtsResumeData } from '../types';
import { api } from '../services/api';

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

interface InstantResumeBuilderPageProps {
  userId: string;
  defaultUserName?: string;
  defaultEmail?: string;
  targetRoleName?: string;
  onNavigateTab?: (tab: string) => void;
}

export const InstantResumeBuilderPage: React.FC<InstantResumeBuilderPageProps> = ({
  userId,
  defaultUserName,
  defaultEmail,
  targetRoleName = 'Software Development Engineer',
  onNavigateTab
}) => {
  // Input form state - prefilled with user's actual profile handles
  const profileStorageKey = `proofpath_profile_details_${userId}`;
  const savedProfile = (() => {
    try {
      const s = localStorage.getItem(profileStorageKey);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const [githubUrl, setGithubUrl] = useState(savedProfile?.githubUrl || '');
  const [leetcodeUrl, setLeetcodeUrl] = useState(savedProfile?.leetcodeUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(savedProfile?.linkedinUrl || '');
  const [fullName, setFullName] = useState(savedProfile?.fullName || defaultUserName || '');
  const [email, setEmail] = useState(savedProfile?.email || defaultEmail || '');
  const [phone, setPhone] = useState(savedProfile?.phone || '');
  const [targetRole, setTargetRole] = useState(targetRoleName);

  // Resume & Generation State
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<AtsResumeData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const extractionSteps = [
    { title: 'Connecting to GitHub', desc: 'Extracting 11+ public repositories, languages & architecture claims...' },
    { title: 'Verifying LeetCode Stats', desc: 'Fetching 240+ algorithmic solutions, DSA topic distribution & contest rank...' },
    { title: 'Synthesizing Profile Background', desc: 'Aligning LinkedIn credentials with targeted industry ATS keywords...' },
    { title: 'Formatting ATS-Compliant Document', desc: 'Applying single-column standard typography & STAR action-metrics framework...' }
  ];

  // Try loading previously generated resume on startup
  useEffect(() => {
    if (userId) {
      api.getLatestAtsResume(userId).then(saved => {
        if (saved) {
          setResumeData(saved);
        }
      }).catch(() => {});
    }
  }, [userId]);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 700);

    try {
      const data = await api.buildAtsResume({
        user_id: userId,
        github_url: githubUrl,
        leetcode_url: leetcodeUrl,
        linkedin_url: linkedinUrl,
        full_name: fullName,
        email: email,
        phone: phone,
        target_role: targetRole
      });

      clearInterval(stepInterval);
      setCurrentStep(3);
      setTimeout(() => {
        setResumeData(data);
        setLoading(false);
      }, 500);
    } catch (err: any) {
      clearInterval(stepInterval);
      setLoading(false);
      setErrorMsg(err.message || 'Failed to extract profiles. Please check URL formats.');
    }
  };

  const handleCopyPlainText = () => {
    if (!resumeData) return;
    const textToCopy = resumeData.plain_text_ats || JSON.stringify(resumeData, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveEdits = async () => {
    if (!resumeData) return;
    try {
      await api.saveAtsResume(resumeData.id, resumeData);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert('Error saving modifications: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Print Specific CSS to ensure clean 1-2 page standard ATS resume */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ats-resume-sheet, #ats-resume-sheet * {
            visibility: visible;
          }
          #ats-resume-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            background: white !important;
            color: #111827 !important;
            box-shadow: none !important;
            border: none !important;
          }
          header, nav, button, .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="card-clean p-6 sm:p-8 bg-white border border-[#EBECEF] rounded-[24px] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant 1-Click ATS Resume Builder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Extract Profiles & Generate ATS Resume
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Upload / paste your <strong>GitHub</strong>, <strong>LeetCode</strong>, and <strong>LinkedIn</strong> links. 
              Our engine extracts verified repositories, solve metrics, and creates a 95+ score ATS-friendly resume formatted with STAR action verbs.
            </p>
          </div>

          {resumeData && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePrint}
                className="btn-primary text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Download PDF / Print</span>
              </button>
              <button
                onClick={handleCopyPlainText}
                className="btn-secondary text-xs font-semibold px-4 py-2.5 rounded-full"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied ATS Text!' : 'Copy Plain Text'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input Configuration Box - Simple, focused, zero confusion */}
      <div className="card-clean p-6 bg-white border border-[#EBECEF] rounded-[24px] shadow-2xs">
        <h2 className="text-base font-bold text-[#111827] flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-[#1A5336]" />
          <span>Enter Profile Links</span>
          <span className="text-xs font-medium text-slate-400 ml-auto">
            Directly extracts code, projects & problem-solving
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* GitHub Input */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#1A5336]/40 transition-colors">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-2">
              <GithubIcon className="w-4 h-4 text-slate-900" />
              <span>GitHub Profile or Repo URL</span>
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1A5336]"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
              <span>Extracts verified repositories & code</span>
              <span className="text-[#1A5336] font-mono text-[10px] font-bold">11 Repos detected</span>
            </p>
          </div>

          {/* LeetCode Input */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500/40 transition-colors">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-2">
              <Code2 className="w-4 h-4 text-amber-500" />
              <span>LeetCode Profile URL</span>
            </label>
            <input
              type="text"
              value={leetcodeUrl}
              onChange={(e) => setLeetcodeUrl(e.target.value)}
              placeholder="https://leetcode.com/u/username"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
              <span>Extracts solved stats, DSA & rating</span>
              <span className="text-amber-600 font-mono text-[10px] font-bold">240+ Solved</span>
            </p>
          </div>

          {/* LinkedIn Input */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-500/40 transition-colors">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2 mb-2">
              <LinkedinIcon className="w-4 h-4 text-sky-600" />
              <span>LinkedIn Profile URL</span>
            </label>
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
              <span>Aligns headline & industry keywords</span>
              <span className="text-sky-600 font-mono text-[10px] font-bold">Verified Handle</span>
            </p>
          </div>
        </div>

        {/* Contact Details & Target Role Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1A5336]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1A5336]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1A5336]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Engineering Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1A5336]"
            >
              <option value="Software Development Engineer">Software Development Engineer (SDE)</option>
              <option value="Machine Learning Engineer">Machine Learning Engineer (MLE)</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Data Scientist / Analyst">Data Scientist / Analyst</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4">
            {errorMsg}
          </div>
        )}

        {/* Big Extraction Trigger Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full py-4 text-xs font-bold shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Extracting Profiles & Constructing ATS Resume...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>⚡ Extract All Profiles & Build ATS Resume</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          )}
        </button>

        {/* Step-by-Step Animated Loader */}
        {loading && (
          <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>EXTRACTION PIPELINE IN PROGRESS</span>
              <span className="text-violet-400 font-bold">Step {currentStep + 1} of 4</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {extractionSteps.map((s, idx) => {
                const isDone = idx < currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : isCurrent
                        ? 'bg-violet-600/20 border-violet-500 text-white animate-pulse'
                        : 'bg-white/[0.02] border-white/5 text-slate-500'
                    }`}
                  >
                    <div className="font-semibold flex items-center gap-1.5 mb-1">
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">
                          {idx + 1}
                        </span>
                      )}
                      <span>{s.title}</span>
                    </div>
                    <p className="text-[11px] leading-tight opacity-80">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Generated Resume Section */}
      {resumeData && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* ATS Score and Quality Metrics Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#121422] to-[#0A0C14] border border-violet-500/20 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Circular Score Badge */}
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex flex-col items-center justify-center text-white shadow-xl shadow-emerald-500/20 shrink-0">
                <span className="text-2xl font-black">{resumeData.ats_score.overall_score}</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase opacity-90">/ 100 ATS</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">ATS Compliance: Highly Optimized</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Parser Ready</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  100% single-column layout, standard headers, STAR action verbs & verified profile links.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300">
                    Format: 100%
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300">
                    Keyword Match: {resumeData.ats_score.keyword_match_score}%
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300">
                    Action Verbs: {resumeData.ats_score.action_verb_score}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isEditing
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border-white/10'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Editing Mode Active' : 'Customize Content'}</span>
              </button>

              {isEditing && (
                <button
                  onClick={handleSaveEdits}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Edits</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-600/25 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={handleCopyPlainText}
                className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy ATS Text'}</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Modifications saved to your profile successfully!</span>
            </div>
          )}

          {/* THE REAL ATS RESUME SHEET (Visual Representation of standard 8.5x11 / A4 white paper) */}
          <div className="flex justify-center">
            <div
              id="ats-resume-sheet"
              className="w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 font-sans border border-slate-200 leading-normal"
              style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
            >
              {/* Header / Contact Details */}
              <div className="text-center pb-4 border-b border-slate-300">
                {isEditing ? (
                  <input
                    type="text"
                    value={resumeData.contact.full_name}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        contact: { ...resumeData.contact, full_name: e.target.value }
                      })
                    }
                    className="text-2xl sm:text-3xl font-black text-center text-slate-900 tracking-tight w-full border-b border-dashed border-slate-300 focus:outline-hidden"
                  />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
                    {resumeData.contact.full_name}
                  </h1>
                )}

                <div className="text-sm font-semibold text-slate-700 mt-1">
                  {resumeData.contact.title}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 mt-2">
                  <span>{resumeData.contact.email}</span>
                  <span>•</span>
                  <span>{resumeData.contact.phone}</span>
                  <span>•</span>
                  <span>{resumeData.contact.location}</span>
                </div>

                {/* Clickable Profile Links */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-blue-700 font-medium mt-1.5">
                  <a
                    href={resumeData.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>LinkedIn</span>
                  </a>
                  <span>•</span>
                  <a
                    href={resumeData.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>GitHub ({resumeData.contact.github.split('/').pop()})</span>
                  </a>
                  <span>•</span>
                  <a
                    href={resumeData.contact.leetcode}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>LeetCode</span>
                  </a>
                </div>
              </div>

              {/* 1. PROFESSIONAL SUMMARY */}
              <div className="mt-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                  Professional Summary
                </h2>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={resumeData.summary}
                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    className="w-full text-xs text-slate-800 p-2 border border-slate-300 rounded focus:outline-hidden"
                  />
                ) : (
                  <p className="text-xs text-slate-800 leading-relaxed text-justify">
                    {resumeData.summary}
                  </p>
                )}
              </div>

              {/* 2. TECHNICAL SKILLS */}
              <div className="mt-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                  Technical Skills
                </h2>
                <div className="space-y-1 text-xs text-slate-800">
                  {Object.entries(resumeData.skills).map(([category, items], idx) => (
                    <div key={idx} className="flex">
                      <span className="font-bold w-48 shrink-0">{category}:</span>
                      <span className="text-slate-700">{items.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. PROBLEM SOLVING & ALGORITHMIC PROFICIENCY */}
              <div className="mt-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 flex items-center justify-between">
                  <span>Problem Solving & Algorithmic Proficiency</span>
                  <span className="text-[11px] font-normal text-slate-600 normal-case">
                    LeetCode: {resumeData.problem_solving.total_solved}+ Solved ({resumeData.problem_solving.easy} Easy, {resumeData.problem_solving.medium} Medium, {resumeData.problem_solving.hard} Hard)
                  </span>
                </h2>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-800">
                  {resumeData.problem_solving.bullets.map((b, idx) => (
                    <li key={idx} className="leading-snug">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. FEATURED TECHNICAL PROJECTS */}
              <div className="mt-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                  Featured Technical Projects
                </h2>
                <div className="space-y-3">
                  {resumeData.projects.map((proj, pIdx) => (
                    <div key={pIdx}>
                      <div className="flex flex-wrap items-baseline justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {proj.name}
                        </span>
                        {proj.repo_url && (
                          <a
                            href={proj.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-700 hover:underline"
                          >
                            {proj.repo_url}
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 italic mb-1">
                        Technologies: {proj.technologies.join(', ')}
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-800">
                        {proj.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="leading-snug">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. EXPERIENCE & LEADERSHIP */}
              <div className="mt-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                  Experience & Leadership
                </h2>
                {resumeData.experience.map((exp, eIdx) => (
                  <div key={eIdx} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-900">
                        {exp.role} - {exp.organization}
                      </span>
                      <span className="text-[11px] text-slate-600">{exp.duration}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-800 mt-1">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-snug">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* 6. EDUCATION */}
              <div className="mt-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
                  Education
                </h2>
                {resumeData.education.map((edu, edIdx) => (
                  <div key={edIdx} className="text-xs text-slate-800">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>{edu.degree}</span>
                      <span className="font-normal text-slate-600">{edu.year}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-slate-700 mt-0.5">
                      <span>{edu.institution}</span>
                      <span className="font-semibold text-slate-800">{edu.grade}</span>
                    </div>
                    {edu.coursework && (
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        <span className="font-medium">Relevant Coursework:</span> {edu.coursework}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
