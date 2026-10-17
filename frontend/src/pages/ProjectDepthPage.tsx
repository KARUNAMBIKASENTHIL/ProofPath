import React, { useState, useEffect } from 'react';
import { ProjectDepthAnalysis } from '../types';
import { 
  FolderGit2, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode2, 
  Terminal, 
  GitCommit, 
  Container, 
  ShieldAlert, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

interface Props {
  userId: string;
  onStartViva: (projectId: string) => void;
}

export const ProjectDepthPage: React.FC<Props> = ({ userId, onStartViva }) => {
  const [projects, setProjects] = useState<ProjectDepthAnalysis[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDepthAnalysis | null>(null);

  useEffect(() => {
    api.getProjects(userId).then(list => {
      setProjects(list);
      if (list.length > 0) setSelectedProject(list[0]);
    }).catch(console.error);
  }, [userId]);

  if (!selectedProject) {
    return (
      <div className="h-64 rounded-2xl bg-[#141721] border border-[#222634] flex items-center justify-center text-slate-400">
        Loading Project Depth Intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#141721] border border-[#222634] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white">{selectedProject.title}</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            {selectedProject.problem_definition}
          </p>
        </div>

        <button
          onClick={() => onStartViva(selectedProject.id)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          <span>Take Technical Viva on This Code</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Architecture & Rigor Dimension Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Testing */}
        <div className="p-4 rounded-xl bg-[#141721] border border-[#222634] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Automated Testing</span>
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {selectedProject.test_evidence.has_tests ? 'Present' : 'None'}
            </span>
            <span className="text-xs text-emerald-400">{selectedProject.test_evidence.test_framework}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {selectedProject.test_evidence.evaluation_note}
          </p>
        </div>

        {/* Error Handling */}
        <div className="p-4 rounded-xl bg-[#141721] border border-[#222634] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Defensive Engineering</span>
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {selectedProject.error_handling_evidence.try_catch_blocks} Blocks
            </span>
            <span className="text-xs text-indigo-400">Pydantic Schemas</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {selectedProject.error_handling_evidence.summary}
          </p>
        </div>

        {/* Documentation */}
        <div className="p-4 rounded-xl bg-[#141721] border border-[#222634] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Documentation Quality</span>
            <BookOpen className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {selectedProject.documentation_quality.rating}
            </span>
            <span className="text-xs text-slate-400">{selectedProject.documentation_quality.readme_characters} chars</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Comprehensive setup & architecture guides documented in README.md.
          </p>
        </div>

        {/* Deployment Readiness */}
        <div className={`p-4 rounded-xl border space-y-2 ${
          selectedProject.deployment_evidence.has_deployment
            ? 'bg-[#141721] border-emerald-500/30'
            : 'bg-amber-950/20 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Deployment Evidence</span>
            <Container className={`w-4 h-4 ${selectedProject.deployment_evidence.has_deployment ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${selectedProject.deployment_evidence.has_deployment ? 'text-emerald-300' : 'text-amber-300'}`}>
              {selectedProject.deployment_evidence.has_deployment ? 'Verified' : 'Missing Artifact'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            {selectedProject.deployment_evidence.readiness_summary}
          </p>
        </div>
      </div>

      {/* Positive Highlights and Recommended Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-[#141721] border border-[#222634] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222634]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Engineering Highlights</h2>
          </div>
          <div className="space-y-2">
            {selectedProject.positive_highlights.map((h, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#181c28] border border-[#232839] text-xs text-slate-300">
                ✓ {h}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141721] border border-[#222634] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#222634]">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Recommended Improvements (Highest ROI)</h2>
          </div>
          <div className="space-y-2">
            {selectedProject.recommended_improvements.map((imp, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#181c28] border border-amber-500/20 text-xs text-amber-200">
                → {imp}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
