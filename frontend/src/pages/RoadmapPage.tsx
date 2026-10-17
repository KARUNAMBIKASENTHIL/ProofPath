import React, { useState, useEffect } from 'react';
import { Roadmap, RoadmapMilestone } from '../types';
import { 
  Compass, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Send,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  Layers,
  Code,
  BookOpen,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

interface Props {
  userId: string;
  targetRole: string;
  onEvidenceSubmittedAndReassessed: () => void;
  reassessed: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const RoadmapPage: React.FC<Props> = ({ 
  userId,
  targetRole,
  onEvidenceSubmittedAndReassessed,
  reassessed,
  onNavigateTab
}) => {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [submittingMilestoneId, setSubmittingMilestoneId] = useState<string | null>(null);
  const [evidenceUrlInput, setEvidenceUrlInput] = useState('https://github.com/alexchen-ml/diabetes-prediction-service/blob/main/Dockerfile');
  const [evidenceNoteInput, setEvidenceNoteInput] = useState('Multi-stage Dockerfile with non-root container runner and automated health check route.');
  const [reassessing, setReassessing] = useState(false);
  const [reassessFeedback, setReassessFeedback] = useState<string | null>(null);

  // Status map for tasks
  const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getCurrentRoadmap(userId, targetRole).then(r => {
      setRoadmap(r);
      const initial: Record<string, string> = {};
      r.milestones.forEach(m => {
        m.tasks.forEach((t, i) => {
          initial[`${m.id}_${i}`] = m.status === 'completed' ? 'completed' : i === 0 ? 'in_progress' : 'not_started';
        });
      });
      setTaskStatuses(initial);
    }).catch(console.error);
  }, [userId, targetRole]);

  if (!roadmap) {
    return (
      <div className="card-clean p-12 text-center text-slate-400 text-xs bg-white border border-[#EBECEF] rounded-[28px] space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1A5336]" />
        <div>Generating personalized evidence-grounded roadmap from CareerLens Knowledge Base...</div>
      </div>
    );
  }

  const handleTaskStatusChange = (key: string, newStatus: string) => {
    setTaskStatuses(prev => ({ ...prev, [key]: newStatus }));
  };

  const handleTriggerReassessment = async (milestoneId: string) => {
    setReassessing(true);
    try {
      const res = await api.reassessWithMilestone(userId, milestoneId, {
        repo_url: evidenceUrlInput,
        notes: evidenceNoteInput,
        artifact: 'Dockerfile'
      });
      setReassessFeedback(`Milestone Verified! Readiness score upgraded to ${res.updated_assessment.overall_readiness_score}% (${res.score_improvement})`);
      onEvidenceSubmittedAndReassessed();
      
      if (roadmap) {
        const updatedMs = roadmap.milestones.map(m => 
          m.id === milestoneId ? { ...m, status: 'completed' as const, evidence_submitted: evidenceUrlInput } : m
        );
        setRoadmap({ ...roadmap, milestones: updatedMs });
      }
      setSubmittingMilestoneId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setReassessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-white via-[#F8FAF9] to-[#F0FDF4] border border-[#EBECEF] rounded-[28px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
              RAG-Grounded Curriculum
            </span>
            <span className="text-xs text-slate-400 font-mono">
              CareerLens Knowledge Base v2.0
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            Personalized Learning Roadmap: {roadmap.target_role}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Tailored learning path addressing your specific skill gaps with official documentation, practice exercises, and verifiable milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('skill-analysis')}
              className="px-4 py-2 rounded-xl bg-white border border-[#EBECEF] hover:border-[#1A5336] text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>Back to Skill Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {reassessFeedback && (
        <div className="p-4 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#1A5336] shrink-0" />
            <span>{reassessFeedback}</span>
          </div>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold text-[#166534] shadow-2xs">
            Score Upgraded
          </span>
        </div>
      )}

      {/* Starting Point & Verified Strengths Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-5 sm:p-6 bg-white border border-[#EBECEF] rounded-[24px] space-y-2 shadow-xs">
          <div className="font-bold text-[#111827] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verified Baseline Strengths</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-xs">
            {roadmap.starting_point_summary}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {roadmap.verified_strengths.map((str, idx) => (
              <span key={idx} className="text-[11px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] px-2.5 py-0.5 rounded-lg">
                ✓ {str}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-white border border-[#EBECEF] rounded-[24px] space-y-2 shadow-xs">
          <div className="font-bold text-[#111827] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Target Competency Gaps</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-xs">
            Milestones are structured sequentially to eliminate missing evidence dependencies before building production artifacts.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {roadmap.not_yet_verified.map((gap, idx) => (
              <span key={idx} className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                Pending: {gap}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ordered Actionable Milestones List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-base font-extrabold text-[#111827]">
            Actionable Milestones Grounded in Curated Documents
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {roadmap.milestones.length} Strategic Steps
          </span>
        </div>
        
        {roadmap.milestones.map((milestone) => {
          const isDone = milestone.status === 'completed';
          const isSubmitting = submittingMilestoneId === milestone.id;

          return (
            <div 
              key={milestone.id}
              className={`p-6 rounded-[24px] border transition-all space-y-4 shadow-xs ${
                isDone 
                  ? 'bg-[#F8FAF9] border-[#DCFCE7]' 
                  : 'bg-white border-[#EBECEF]'
              }`}
            >
              {/* Milestone Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                      Step {milestone.step_number} • {milestone.estimated_duration}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Addresses: {milestone.skill_gap}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#111827]">{milestone.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{milestone.why_this_matters}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    isDone 
                      ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {isDone ? 'Completed' : 'Planned'}
                  </span>
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-2 pt-1 text-xs">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                  Action Checklist:
                </span>
                <div className="space-y-1.5">
                  {milestone.tasks.map((task, tIdx) => {
                    const taskKey = `${milestone.id}_${tIdx}`;
                    const currentStatus = taskStatuses[taskKey] || (isDone ? 'completed' : 'not_started');
                    
                    return (
                      <div 
                        key={tIdx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-bold ${
                            currentStatus === 'completed' 
                              ? 'bg-[#1A5336] border-[#1A5336] text-white' 
                              : 'border-slate-300 text-slate-400'
                          }`}>
                            {currentStatus === 'completed' ? '✓' : tIdx + 1}
                          </span>
                          <span className={currentStatus === 'completed' ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-medium'}>
                            {task}
                          </span>
                        </div>

                        <select
                          value={currentStatus}
                          onChange={(e) => handleTaskStatusChange(taskKey, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] text-slate-700 font-bold focus:outline-none focus:border-[#1A5336]"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deliverable & Verification Criteria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#1A5336]">Target Deliverable:</span>
                  <p className="text-slate-600">{milestone.deliverable}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-700">Verification Criteria:</span>
                  <p className="text-slate-600">{milestone.verification_criteria}</p>
                </div>
              </div>

              {/* Source Documents References */}
              {milestone.source_files && milestone.source_files.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <BookOpen className="w-3.5 h-3.5 text-[#1A5336]" />
                  <span className="font-semibold text-slate-600">Grounded in Documents:</span>
                  {milestone.source_files.map((file, fIdx) => (
                    <span key={fIdx} className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {file}
                    </span>
                  ))}
                </div>
              )}

              {/* Evidence Submission / Instant Reassessment Action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-500">
                  {isDone ? (
                    <span className="text-[#166534] font-bold">✓ Verified Artifact: {milestone.evidence_submitted || 'Evidence validated in repository'}</span>
                  ) : (
                    <span>Provide a link to your code repository file to trigger instant reassessment</span>
                  )}
                </div>

                {!isDone && (
                  <button
                    onClick={() => setSubmittingMilestoneId(isSubmitting ? null : milestone.id)}
                    className="btn-primary text-xs py-2 px-4 font-bold ml-auto shadow-xs"
                  >
                    <span>{isSubmitting ? 'Cancel' : 'Submit Evidence Link'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Expanded Submission Form */}
              {isSubmitting && (
                <div className="p-4 rounded-2xl bg-white border border-[#1A5336] space-y-3 shadow-md text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">GitHub File / PR Link</label>
                    <input
                      type="text"
                      value={evidenceUrlInput}
                      onChange={(e) => setEvidenceUrlInput(e.target.value)}
                      placeholder="https://github.com/my-project/blob/main/Dockerfile"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#1A5336]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Implementation Summary</label>
                    <input
                      type="text"
                      value={evidenceNoteInput}
                      onChange={(e) => setEvidenceNoteInput(e.target.value)}
                      placeholder="Summary of changes and verified test passes"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#1A5336]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSubmittingMilestoneId(null)}
                      className="btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={reassessing || !evidenceUrlInput.trim()}
                      onClick={() => handleTriggerReassessment(milestone.id)}
                      className="btn-primary text-xs font-bold"
                    >
                      {reassessing ? (
                        <div className="flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying & Re-scoring...</span>
                        </div>
                      ) : (
                        <span>Verify & Upgrade Readiness Score</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapPage;
