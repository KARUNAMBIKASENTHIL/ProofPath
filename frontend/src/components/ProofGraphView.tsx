import React, { useState } from 'react';
import { ProofGraphData, ProofGraphNode } from '../types';
import { EvidenceBadge } from './EvidenceBadge';
import { Network, Code, FileText, CheckCircle2, ChevronRight, X, ExternalLink, ShieldAlert } from 'lucide-react';

interface Props {
  data: ProofGraphData | null;
  loading?: boolean;
}

export const ProofGraphView: React.FC<Props> = ({ data, loading }) => {
  const [selectedNode, setSelectedNode] = useState<ProofGraphNode | null>(null);

  if (loading) {
    return (
      <div className="h-96 rounded-2xl bg-[#141721] border border-[#222634] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">Synthesizing ProofGraph relationship network...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.nodes.length) {
    return (
      <div className="h-80 rounded-2xl bg-[#141721] border border-[#222634] flex items-center justify-center text-slate-400 text-sm">
        No ProofGraph data found. Connect a source to map evidence relationships.
      </div>
    );
  }

  // Group nodes by type
  const skills = data.nodes.filter(n => n.type === 'skill');
  const projects = data.nodes.filter(n => n.type === 'project');
  const artifacts = data.nodes.filter(n => n.type === 'artifact');
  const findings = data.nodes.filter(n => n.type === 'finding');
  const role = data.nodes.find(n => n.type === 'role');

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-[#141721] border border-[#222634]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">ProofGraph Relationship Explorer</h3>
            <p className="text-xs text-slate-400">
              Click any node in the evidence chain to inspect source files, code snippets, and verification rules.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Trace: <span className="text-indigo-400 font-medium">Student → Skill → Project → Artifact → Finding → Target Role</span>
        </div>
      </div>

      {/* ProofGraph Visual Pipeline Matrix */}
      <div className="p-5 rounded-2xl bg-[#141721] border border-[#222634] overflow-x-auto">
        <div className="min-w-[900px] grid grid-cols-5 gap-4">
          {/* Column 1: Skills */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-[#222634] flex items-center gap-1.5">
              <span>1. Competency</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2230] text-slate-300">{skills.length}</span>
            </div>
            <div className="space-y-2">
              {skills.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedNode(s)}
                  className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                    selectedNode?.id === s.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-[#181c28] border-[#252b3d] text-slate-300 hover:border-indigo-500/50 hover:bg-[#1c2233]'
                  }`}
                >
                  <span className="truncate pr-2">{s.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Projects */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-[#222634] flex items-center gap-1.5">
              <span>2. Project Context</span>
            </div>
            <div className="space-y-2">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedNode(p)}
                  className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                    p.label.includes('No Project')
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                      : selectedNode?.id === p.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-[#181c28] border-[#252b3d] text-slate-300 hover:border-indigo-500/50 hover:bg-[#1c2233]'
                  }`}
                >
                  <span className="truncate pr-2">{p.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Artifacts */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-[#222634] flex items-center gap-1.5">
              <span>3. Evidence Artifact</span>
            </div>
            <div className="space-y-2">
              {artifacts.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setSelectedNode(a)}
                  className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                    a.label.includes('No Artifact')
                      ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                      : selectedNode?.id === a.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-[#181c28] border-[#252b3d] text-slate-300 hover:border-indigo-500/50 hover:bg-[#1c2233]'
                  }`}
                >
                  <span className="truncate pr-2 font-mono text-[11px]">{a.label}</span>
                  <Code className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Findings */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-[#222634] flex items-center gap-1.5">
              <span>4. Assessment Finding</span>
            </div>
            <div className="space-y-2">
              {findings.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedNode(f)}
                  className="p-2.5 rounded-xl bg-[#181c28] border border-[#252b3d] flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition-all"
                >
                  <EvidenceBadge status={f.label} size="sm" />
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 5: Target Role */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-[#222634] flex items-center gap-1.5">
              <span>5. Target Role</span>
            </div>
            <div className="h-full flex flex-col justify-center">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-[#181c28] to-[#141721] border border-indigo-500/30 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-indigo-400 mx-auto" />
                <div className="font-semibold text-white text-xs">{role?.label || 'Target Role'}</div>
                <div className="text-[10px] text-indigo-300/80">Evaluated against 8 role competencies</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Inspector Drawer */}
      {selectedNode && (
        <div className="p-5 rounded-2xl bg-[#181c28] border border-indigo-500/40 space-y-3 shadow-xl transition-all">
          <div className="flex items-center justify-between border-b border-[#262c3e] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold text-indigo-400 tracking-wider">
                Node Inspector ({selectedNode.type})
              </span>
              <span className="text-xs text-white font-medium">: {selectedNode.label}</span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#252b3d]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block mb-1">Status / Category:</span>
              <div className="text-slate-200">
                {selectedNode.status ? <EvidenceBadge status={selectedNode.status} /> : 'Standard Node'}
              </div>
            </div>

            {selectedNode.metadata?.confidence && (
              <div>
                <span className="text-slate-400 font-medium block mb-1">Verification Confidence:</span>
                <span className="text-emerald-400 font-semibold">{Math.round(selectedNode.metadata.confidence * 100)}%</span>
              </div>
            )}
          </div>

          {selectedNode.metadata?.url && (
            <div>
              <span className="text-slate-400 font-medium block mb-1">Source Repository URL:</span>
              <a 
                href={selectedNode.metadata.url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
              >
                <span>{selectedNode.metadata.url}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {selectedNode.metadata?.snippet && (
            <div>
              <span className="text-slate-400 font-medium block mb-1">Verified Code Snippet:</span>
              <pre className="p-3 rounded-lg bg-[#0c0e14] border border-[#222634] text-slate-300 font-mono text-[11px] overflow-x-auto">
                {selectedNode.metadata.snippet}
              </pre>
            </div>
          )}

          {selectedNode.metadata?.rules && (
            <div>
              <span className="text-slate-400 font-medium block mb-1">Audit Rules Triggered:</span>
              <div className="space-y-1">
                {selectedNode.metadata.rules.map((r: string, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-[#131620] border border-[#222736] text-[11px] text-slate-300 font-mono">
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
