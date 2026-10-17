import React, { useState } from 'react';
import { ConnectedSource, EvidenceRecord } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { 
  Upload, 
  GitBranch, 
  Code2, 
  Globe, 
  Award, 
  FileText, 
  CheckCircle2, 
  ExternalLink,
  Search,
  Plus,
  X
} from 'lucide-react';
import { api } from '../services/api';

interface Props {
  userId: string;
  sources: ConnectedSource[];
  evidence: EvidenceRecord[];
  onUploadResume: (file: File) => Promise<any>;
  onSourceConnected: () => void;
}

export const EvidencePage: React.FC<Props> = ({ 
  userId, 
  sources, 
  evidence, 
  onUploadResume,
  onSourceConnected 
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Connect Source Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState('github');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const res = await onUploadResume(e.target.files[0]);
        setUploadSuccess(`Successfully extracted ${res.skills_identified || 8} skills from ${e.target.files[0].name}`);
        setTimeout(() => setUploadSuccess(null), 5000);
      } catch (err: any) {
        alert(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleConnectSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim() || !sourceUrl.trim()) return;
    setConnecting(true);
    try {
      await api.connectSource({
        user_id: userId,
        source_type: sourceType,
        name: sourceName,
        url_or_path: sourceUrl
      });
      setIsConnectModalOpen(false);
      setSourceName('');
      setSourceUrl('');
      onSourceConnected();
    } catch (err: any) {
      alert(err.message || "Failed to connect source");
    } finally {
      setConnecting(false);
    }
  };

  const filteredEvidence = evidence.filter(e => {
    const matchesSearch = e.skill_name.toLowerCase().includes(search.toLowerCase()) ||
                          e.observed_evidence.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Multi-Source Evidence Ingestion</h1>
          <p className="text-xs text-slate-400">
            Connect your real resumes, GitHub repositories, and project portfolios to generate verifiable evidence.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#1e2333] hover:bg-[#252c40] text-slate-200 border border-[#2d354c] text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Repository / Link</span>
          </button>

          <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Extracting Text & Provenance...' : 'Upload Resume (PDF/DOCX)'}</span>
            <input type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Connected Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((src) => {
          let Icon = FileText;
          if (src.source_type === 'github') Icon = GitBranch;
          if (src.source_type === 'leetcode') Icon = Code2;
          if (src.source_type === 'linkedin') Icon = Globe;
          if (src.source_type === 'certificate') Icon = Award;

          let statusBadgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
          if (src.status === 'Connected') statusBadgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
          if (src.status === 'Uploaded') statusBadgeClass = 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
          if (src.status === 'Partially Accessible') statusBadgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';

          return (
            <div key={src.id} className="p-4 rounded-xl bg-[#141721] border border-[#222634] space-y-2 hover:border-[#2f3549] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#1e2230] text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-white capitalize">{src.source_type}</span>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusBadgeClass}`}>
                  {src.status}
                </span>
              </div>
              <div className="font-mono text-xs text-slate-300 truncate">{src.name}</div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                <span>Last Synced: {src.last_synced || 'Today'}</span>
                {src.url_or_path.startsWith('http') && (
                  <a href={src.url_or_path} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                    <span>Inspect</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {sources.length === 0 && (
          <div className="md:col-span-3 p-8 rounded-2xl bg-[#141721] border border-dashed border-[#262c3e] text-center space-y-3">
            <Upload className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Sources Connected Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Upload your resume (PDF/DOCX) or link your GitHub repository above to start building your verified evidence portfolio.
            </p>
          </div>
        )}
      </div>

      {/* Verified Evidence Records Table */}
      <div className="p-5 rounded-2xl bg-[#141721] border border-[#222634] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222634]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Demonstrated Competency Records</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e2230] text-slate-400 font-medium">
              {filteredEvidence.length} Competencies
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search skills or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#181c28] border border-[#262c3e] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#181c28] border border-[#262c3e] text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Strongly supported">Strongly supported</option>
              <option value="Supported">Supported</option>
              <option value="Partially supported">Partially supported</option>
              <option value="Not yet verified">Not yet verified</option>
              <option value="Conflicting evidence">Conflicting evidence</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-[#181c28]/70 border-b border-[#222634]">
              <tr>
                <th className="py-3 px-4 font-semibold">Competency</th>
                <th className="py-3 px-4 font-semibold">Evidence Status</th>
                <th className="py-3 px-4 font-semibold">Source Provenance</th>
                <th className="py-3 px-4 font-semibold">Observable Implementation Finding</th>
                <th className="py-3 px-4 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2333]">
              {filteredEvidence.map((ev) => (
                <tr key={ev.id} className="hover:bg-[#181c28]/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                    {ev.skill_name}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <EvidenceBadge status={ev.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {ev.claimed_source}
                  </td>
                  <td className="py-3.5 px-4 max-w-md">
                    <p className="text-slate-300 line-clamp-2">{ev.observed_evidence}</p>
                    {ev.code_snippet && (
                      <pre className="mt-1.5 p-2 rounded bg-[#0c0e14] border border-[#202534] font-mono text-[10px] text-indigo-300 overflow-x-auto max-h-16">
                        {ev.code_snippet}
                      </pre>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-emerald-400">
                    {Math.round(ev.confidence * 100)}%
                  </td>
                </tr>
              ))}
              {filteredEvidence.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No matching evidence found. Upload a resume or connect a repository above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connect Source Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#141721] border border-[#262c3e] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#222634] pb-3">
              <h3 className="text-sm font-bold text-white">Connect Code Source / Portfolio</h3>
              <button 
                onClick={() => setIsConnectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConnectSource} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Source Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0c0e14] border border-[#262c3e] text-slate-200"
                >
                  <option value="github">GitHub Repository</option>
                  <option value="leetcode">LeetCode Profile</option>
                  <option value="portfolio">Personal Portfolio Website</option>
                  <option value="certificate">Online Credential</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Title / Repository Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. smart-inventory-system"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0c0e14] border border-[#262c3e] text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/myname/my-repo"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0c0e14] border border-[#262c3e] text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30"
                >
                  {connecting ? 'Connecting & Auditing...' : 'Connect & Audit Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
