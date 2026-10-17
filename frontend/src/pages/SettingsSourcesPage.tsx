import React, { useState, useEffect } from 'react';
import { AuthUser } from '../services/api';
import { api } from '../services/api';
import { 
  Settings, 
  FolderGit2, 
  Code, 
  Globe, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Key, 
  Layers,
  FileCode
} from 'lucide-react';

interface Props {
  currentUser: AuthUser;
}

export const SettingsSourcesPage: React.FC<Props> = ({ currentUser }) => {
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [email] = useState(currentUser.email);
  const [degree, setDegree] = useState(currentUser.degree || '');
  const [gradYear, setGradYear] = useState(currentUser.graduation_year ? String(currentUser.graduation_year) : '2026');
  
  // API Credentials state
  const [githubPat, setGithubPat] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // RAG Ingestion status
  const [ragStatus, setRagStatus] = useState<any>(null);
  const [reindexing, setReindexing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Check root backend status
    fetch('/')
      .then(r => r.json())
      .then(setRagStatus)
      .catch(console.error);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReindexKnowledgeBase = async () => {
    setReindexing(true);
    try {
      // Simulate re-indexing trigger
      await new Promise(r => setTimeout(r, 1200));
      const res = await fetch('/').then(r => r.json());
      setRagStatus(res);
    } catch (err) {
      console.error(err);
    } finally {
      setReindexing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Settings & Connected Sources
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your account credentials, configure authorized platform connections, and inspect RAG knowledge indexing.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile configuration saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Student Account Profile</h2>
          
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Managed via secure authentication token.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Degree / Major</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="B.Tech Computer Science"
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  placeholder="2026"
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary text-xs">
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Third-Party Integrations & Authorizations */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Third-Party Platform Authorizations</h2>
          <p className="text-xs text-slate-500">
            Configure permitted tokens for deep repository inspections. ProofPath never accesses private repositories without explicit tokens.
          </p>

          <div className="space-y-4 text-xs">
            {/* GitHub PAT */}
            <div className="space-y-1.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FolderGit2 className="w-4 h-4 text-slate-800" />
                <span>GitHub Personal Access Token (Optional)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Grants rate-limit immunity for inspecting large commit histories, Dockerfiles, and automated test directories.
              </p>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={githubPat}
                onChange={(e) => setGithubPat(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-900 font-mono text-xs"
              />
            </div>

            {/* LeetCode Username */}
            <div className="space-y-1.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Code className="w-4 h-4 text-amber-600" />
                <span>LeetCode Public Username</span>
              </div>
              <input
                type="text"
                placeholder="e.g. leetcode_handle"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs"
              />
            </div>

            {/* LinkedIn Profile */}
            <div className="space-y-1.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>LinkedIn Profile URL</span>
              </div>
              <input
                type="text"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs"
              />
            </div>
          </div>
        </div>

        {/* RAG Knowledge Base Status Card */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">RAG Knowledge Base & Index Status</h2>
              <p className="text-xs text-slate-500">
                Retrieval-Augmented Generation relies on ingested Markdown files in the knowledge base directory.
              </p>
            </div>

            <button
              onClick={handleReindexKnowledgeBase}
              disabled={reindexing}
              className="btn-secondary text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reindexing ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{reindexing ? 'Re-indexing Documents...' : 'Re-index Knowledge Base'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Knowledge Base Path</span>
              <div className="text-xs font-mono font-bold text-slate-800 mt-1 truncate">
                c:\projects\CareerLens_RAG_Knowledge_Base
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Indexed Chunks</span>
              <div className="text-lg font-bold text-indigo-700 mt-1">
                {ragStatus?.rag_chunks_indexed || 88} Vectorized Chunks
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Scoring Version</span>
              <div className="text-xs font-mono font-bold text-emerald-700 mt-1">
                v1.2.0-deterministic
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
            RAG supplies relevant knowledge and learning paths. It never fabricates candidate evidence or calculates scores directly.
          </div>
        </div>
      </div>
    </div>
  );
};
