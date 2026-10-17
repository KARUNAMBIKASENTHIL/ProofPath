import React, { useState } from 'react';
import { 
  Check, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  FileCheck2, 
  FolderGit2, 
  ArrowRight, 
  ChevronDown, 
  Sparkles, 
  RefreshCw,
  Target,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Roadmap, RoadmapMilestone } from '../types';

interface PersonalizedRoadmapViewProps {
  roadmap: Roadmap | null;
  loading: boolean;
  targetRoleName: string;
  onMilestoneReassess: (milestoneId: string, repoUrl: string, notes: string) => Promise<void>;
  reassessing: boolean;
  reassessFeedback: string | null;
}

export const PersonalizedRoadmapView: React.FC<PersonalizedRoadmapViewProps> = ({
  roadmap,
  loading,
  targetRoleName,
  onMilestoneReassess,
  reassessing,
  reassessFeedback
}) => {
  const [taskStatuses, setTaskStatuses] = useState<Record<string, boolean>>({});
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('https://github.com/my-repo/blob/main/tests/test_api.py');
  const [evidenceNotes, setEvidenceNotes] = useState('Added automated unit tests with mock fixtures and passing test assertions.');

  const toggleTask = (taskKey: string) => {
    setTaskStatuses(prev => ({
      ...prev,
      [taskKey]: !prev[taskKey]
    }));
  };

  if (loading) {
    return (
      <div className="p-12 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-700" />
        <div className="text-sm font-semibold text-slate-800">
          Generating personalized action roadmap...
        </div>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Tailoring milestones directly to the skill lags detected from your resume and GitHub repository code.
        </p>
      </div>
    );
  }

  if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
        <Target className="w-6 h-6 mx-auto text-slate-400" />
        <div className="text-sm font-bold text-slate-800">Roadmap Ready to Generate</div>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload your resume and connect your GitHub repository above to generate action milestones targeting your exact skill lags.
        </p>
      </div>
    );
  }

  const completedCount = roadmap.milestones.filter(m => m.status === 'completed').length;
  const totalCount = roadmap.milestones.length;

  return (
    <div className="space-y-6">
      {/* Roadmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Personalized Action Steps
            </span>
            <span className="text-xs text-slate-400">
              {completedCount} of {totalCount} Milestones Completed
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Roadmap to Bridge Identified Skill Lags
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Directly targeted at the test coverage, containerization, and schema validation lags identified from your resume and repository code. Follow each step and submit your repository proof of work to upgrade your score.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Target className="w-4 h-4 text-slate-600" />
            <span>Target Role: {targetRoleName}</span>
          </span>
        </div>
      </div>

      {/* Reassessment Feedback Notice */}
      {reassessFeedback && (
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{reassessFeedback}</span>
          </div>
          <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
            Score Upgraded
          </span>
        </div>
      )}

      {/* Verified Strengths vs Target Gaps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Verified Strengths */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-slate-700" />
            <span>Verified Baseline Competencies</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            {roadmap.starting_point_summary || 'Your core programming foundations extracted from your resume & GitHub codebase are verified.'}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {roadmap.verified_strengths.map((skill, idx) => (
              <span key={idx} className="text-[11px] font-medium bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Competency Lags Addressed */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
            <Clock className="w-4 h-4 text-slate-600" />
            <span>Lags Resolved by This Roadmap</span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            Each milestone below resolves one specific gap discovered during your code audit.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {roadmap.not_yet_verified.map((gap, idx) => (
              <span key={idx} className="text-[11px] font-medium bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                • {gap}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Step-by-Step Milestones List */}
      <div className="space-y-4">
        {roadmap.milestones.map((milestone, mIdx) => {
          const isDone = milestone.status === 'completed';
          const isSubmitting = activeSubmissionId === milestone.id;

          return (
            <div
              key={milestone.id || mIdx}
              className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
                isDone 
                  ? 'bg-slate-50/70 border-slate-200' 
                  : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
              }`}
            >
              {/* Top Row: Step Title & Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                      Step {milestone.step_number || mIdx + 1}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{milestone.estimated_duration || '3-5 hours'}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                      Bridges Lag: {milestone.skill_gap}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900">
                    {milestone.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {milestone.why_this_matters}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
                    isDone 
                      ? 'bg-slate-200/80 text-slate-800' 
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-800" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <span>Action Required</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Checklist with Clickable Checkboxes */}
              <div className="space-y-2 pt-1 text-xs">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                  Action Checklist:
                </span>
                <div className="space-y-1.5">
                  {milestone.tasks.map((task, tIdx) => {
                    const taskKey = `${milestone.id}_${tIdx}`;
                    const isTaskChecked = taskStatuses[taskKey] ?? isDone;

                    return (
                      <div
                        key={tIdx}
                        onClick={() => toggleTask(taskKey)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer select-none ${
                          isTaskChecked 
                            ? 'bg-slate-50 border-slate-200 text-slate-500' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isTaskChecked 
                              ? 'bg-slate-900 border-slate-900 text-white' 
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isTaskChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={isTaskChecked ? 'line-through text-slate-400 font-normal' : 'font-medium'}>
                            {task}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 font-medium">
                          {isTaskChecked ? 'Done' : 'Click to toggle'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deliverable & Verification Criteria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Target Deliverable:
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{milestone.deliverable}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Verification Standard:
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{milestone.verification_criteria}</p>
                </div>
              </div>

              {/* Source Curriculum Grounding */}
              {milestone.source_files && milestone.source_files.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    Reference:
                  </span>
                  {milestone.source_files.map((file, fIdx) => (
                    <span key={fIdx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200">
                      {file}
                    </span>
                  ))}
                </div>
              )}

              {/* Proof of Work Submission Box */}
              <div className="pt-2 border-t border-slate-100">
                {isDone ? (
                  <div className="flex items-center justify-between text-xs text-slate-700 bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-slate-800 shrink-0" />
                      <span>Verified Artifact:</span>
                      <span className="font-mono text-[11px] text-slate-900 truncate max-w-xs sm:max-w-md">
                        {milestone.evidence_submitted || 'Evidence link recorded and verified'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-white text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                      Lag Resolved
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setActiveSubmissionId(isSubmitting ? null : milestone.id)}
                      className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4 text-slate-600" />
                      <span>{isSubmitting ? 'Cancel Artifact Submission' : 'Submit Repository Artifact to Verify Step'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSubmitting ? 'rotate-180' : ''}`} />
                    </button>

                    {isSubmitting && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-800">
                            GitHub Repository Artifact or PR Link
                          </label>
                          <input
                            type="text"
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                            placeholder="https://github.com/username/project/blob/main/tests/test_api.py"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-800">
                            Implementation Notes / Test Output
                          </label>
                          <input
                            type="text"
                            value={evidenceNotes}
                            onChange={(e) => setEvidenceNotes(e.target.value)}
                            placeholder="Implemented pytest suite with mock fixtures and passing test assertions."
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={reassessing || !evidenceUrl.trim()}
                          onClick={() => onMilestoneReassess(milestone.id, evidenceUrl, evidenceNotes)}
                          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {reassessing ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Reassessing Code & Upgrading Score...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Submit Proof & Reassess Readiness</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
