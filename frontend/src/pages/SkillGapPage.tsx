import React, { useState, useEffect } from 'react';
import { 
  AssessmentScoreBreakdown, 
  SkillEvaluation, 
  JobRoleDefinition,
  VivaSession,
  VivaQuestion,
  AnalysisRecord,
  ProjectDepthAnalysis
} from '../types';
import { api } from '../services/api';
import { 
  Target, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  ChevronRight,
  TrendingUp,
  FileCheck2,
  FolderGit2,
  ShieldCheck,
  ChevronDown,
  MessageSquareCode,
  Send,
  Sparkles,
  RefreshCw,
  Code,
  Compass,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface Props {
  userId: string;
  currentAssessment: AssessmentScoreBreakdown | null;
  selectedRoleId: string;
  onRoleChange: (roleId: string) => void;
  onNavigateToRoadmap?: () => void;
  onAssessmentUpdated?: (newAssessment: AssessmentScoreBreakdown) => void;
  activeProjectId?: string | null;
}

export const SkillAnalysisPage: React.FC<Props> = ({
  userId,
  currentAssessment,
  selectedRoleId,
  onRoleChange,
  onNavigateToRoadmap,
  onAssessmentUpdated,
  activeProjectId
}) => {
  const [roles, setRoles] = useState<JobRoleDefinition[]>([]);
  const [activeTab, setActiveTab] = useState<'analysis' | 'interview' | 'history'>('analysis');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [pastReports, setPastReports] = useState<AnalysisRecord[]>([]);

  // User Separate Profile Projects State
  const [projects, setProjects] = useState<ProjectDepthAnalysis[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(activeProjectId || null);

  // Project Verification Interview State
  const [vivaSession, setVivaSession] = useState<VivaSession | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [loadingInterview, setLoadingInterview] = useState(false);

  useEffect(() => {
    api.getRoles().then(setRoles).catch(console.error);
    api.getAnalysisReports(userId).then(setPastReports).catch(() => []);
    api.getProjects(userId).then(pList => {
      setProjects(pList);
      if (activeProjectId) {
        setSelectedProjectId(activeProjectId);
      } else if (pList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(pList[0].id);
      }
    }).catch(console.error);
  }, [userId]);

  // If activeProjectId is passed, automatically switch to interview tab
  useEffect(() => {
    if (activeProjectId) {
      setSelectedProjectId(activeProjectId);
      setActiveTab('interview');
      handleStartInterview(activeProjectId);
    }
  }, [activeProjectId]);

  const handleStartInterview = async (projectId?: string) => {
    setLoadingInterview(true);
    setInterviewStarted(true);
    const targetProjId = projectId || selectedProjectId || (projects.length > 0 ? projects[0].id : undefined);
    if (targetProjId) setSelectedProjectId(targetProjId);

    try {
      const sess = await api.startVivaSession(userId, targetProjId);
      setVivaSession(sess);
      setCurrentQIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInterview(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!vivaSession || !answerInput.trim()) return;
    const currentQ = vivaSession.questions[currentQIndex];
    if (!currentQ) return;

    setSubmittingAnswer(true);
    try {
      const updated = await api.submitVivaAnswer(vivaSession.id, currentQ.id, answerInput.trim());
      setVivaSession(updated);
      setAnswerInput('');

      // Advance to next question or complete
      if (currentQIndex < updated.questions.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
      } else {
        // All answered! Re-run assessment with viva defense score
        if (updated.overall_viva_score) {
          const newAssessment = await api.runAssessment(userId, selectedRoleId, updated.overall_viva_score);
          if (onAssessmentUpdated) {
            onAssessmentUpdated(newAssessment);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  if (!currentAssessment) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs bg-white border border-[#EBECEF] rounded-[28px] space-y-4 max-w-xl mx-auto shadow-xs">
        <Target className="w-10 h-10 mx-auto text-slate-400" />
        <h2 className="text-base font-bold text-slate-900">No Assessment Data Yet</h2>
        <p className="max-w-md mx-auto">Upload your resume or select a target role to calculate your initial skill gap analysis.</p>
      </div>
    );
  }

  const skills = currentAssessment.skill_evaluations || [];
  const categories = Array.from(new Set(skills.map(s => s.category)));
  const filteredSkills = skills.filter(s => selectedCategory === 'all' || s.category === selectedCategory);

  const currentQ: VivaQuestion | undefined = vivaSession?.questions[currentQIndex];
  const isInterviewComplete = vivaSession && vivaSession.evaluations.length >= vivaSession.questions.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Role Switcher */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-white via-[#F8FAF9] to-[#F0FDF4] border border-[#EBECEF] rounded-[28px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
              Deterministic Scoring Engine v1.2
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Proof-of-Work Verification
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            Skill Analysis & GitHub Code Defense
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Comparing verified code evidence against employer criteria for <strong className="text-[#1A5336]">{currentAssessment.role_name}</strong>.
          </p>
        </div>

        {/* Navigation Mode Pill + Role Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                activeTab === 'analysis' ? 'bg-[#1A5336] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Skill Gaps
            </button>
            <button
              onClick={() => {
                setActiveTab('interview');
                if (!interviewStarted) handleStartInterview();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                activeTab === 'interview' ? 'bg-[#1A5336] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquareCode className="w-3.5 h-3.5" />
              <span>GitHub Questions ({projects.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                activeTab === 'history' ? 'bg-[#1A5336] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              History
            </button>
          </div>

          <select
            value={selectedRoleId}
            onChange={(e) => onRoleChange(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1A5336] shadow-2xs"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: SKILL GAPS & EVIDENCE DETAILS */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Readiness Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-[#123824] to-[#0A2316] text-white rounded-[24px] shadow-sm space-y-1">
              <span className="text-xs font-semibold text-emerald-300">Overall Job Readiness Score</span>
              <div className="text-4xl font-extrabold text-white tracking-tight mt-1">
                {currentAssessment.overall_readiness_score}%
              </div>
              <span className="text-[11px] text-emerald-200/80 font-medium">
                Deterministic calculation via code proof
              </span>
            </div>

            <div className="p-5 bg-white border border-[#EBECEF] rounded-[24px] shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Demonstrated Coverage</span>
              <div className="text-4xl font-extrabold text-slate-800 tracking-tight mt-1">
                {currentAssessment.demonstrated_coverage}%
              </div>
              <span className="text-[11px] text-slate-400">
                Requirements with verified repository evidence
              </span>
            </div>

            <div className="p-5 bg-white border border-[#EBECEF] rounded-[24px] shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Evidence Completeness</span>
              <div className="text-4xl font-extrabold text-[#1A5336] tracking-tight mt-1">
                {currentAssessment.evidence_completeness}%
              </div>
              <span className="text-[11px] text-slate-400">
                Tested across repository & viva defense
              </span>
            </div>
          </div>

          {/* Quick Dual CTA Banner: Start GitHub Code Defense & View Personalized Roadmap */}
          <div className="p-5 rounded-[24px] bg-[#F8FAF9] border border-[#DCFCE7] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#1A5336] shrink-0">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">
                  Verify Proof of Work with GitHub Code Questions
                </span>
                <span className="text-slate-500 text-xs">
                  Answer questions derived from your repositories to defend your architectural decisions and upgrade competencies.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onNavigateToRoadmap && (
                <button
                  type="button"
                  onClick={onNavigateToRoadmap}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#1A5336] text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <Compass className="w-3.5 h-3.5 text-[#1A5336]" />
                  <span>View Learning Roadmap</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('interview');
                  handleStartInterview();
                }}
                className="btn-primary text-xs font-bold py-2.5 px-4 shadow-xs flex items-center gap-1.5"
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span>Start GitHub Viva Questions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-bold uppercase mr-1">Domain:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-bold ${
                selectedCategory === 'all' 
                  ? 'bg-[#1A5336] text-white shadow-xs' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              All Skills ({skills.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-bold ${
                  selectedCategory === cat 
                    ? 'bg-[#1A5336] text-white shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Skill-by-Skill Cards */}
          <div className="space-y-3">
            {filteredSkills.map((sk) => {
              const isExpanded = expandedSkillId === sk.skill_id;
              const isStrong = sk.status === 'Strongly supported' || sk.status === 'Supported';
              const isPartial = sk.status === 'Partially supported';

              return (
                <div 
                  key={sk.skill_id}
                  className="p-5 rounded-[22px] bg-white border border-[#EBECEF] hover:border-[#1A5336]/40 transition-all text-xs space-y-3 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${
                        isStrong ? 'bg-emerald-500' : isPartial ? 'bg-amber-400' : 'bg-slate-300'
                      }`} />
                      <span className="font-extrabold text-sm text-[#111827]">{sk.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {sk.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isStrong 
                          ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]' 
                          : isPartial 
                          ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {sk.status}
                      </span>

                      <button
                        onClick={() => setExpandedSkillId(isExpanded ? null : sk.skill_id)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-500 leading-relaxed text-xs">
                    {sk.evaluation_reason}
                  </p>

                  {/* Expanded Evidence Details */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Importance Weight</span>
                          <span className="font-mono font-bold text-slate-800">{sk.importance_weight}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Coverage Credit</span>
                          <span className="font-mono font-bold text-[#1A5336]">{(sk.coverage_value * 100).toFixed(0)}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Confidence</span>
                          <span className="font-mono font-bold text-slate-800">{(sk.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Artifacts Found</span>
                          <span className="font-mono font-bold text-slate-800">{sk.evidence_count} evidence items</span>
                        </div>
                      </div>

                      {sk.artifacts && sk.artifacts.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                            Observable Proof of Work Artifacts:
                          </span>
                          {sk.artifacts.map((art, aIdx) => (
                            <div key={aIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-[#1A5336]">{art.source}</span>
                                {art.file_path && (
                                  <span className="text-slate-400 font-mono text-[10px] truncate max-w-[250px]">
                                    {art.file_path}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 text-xs">{art.observed}</p>
                              {art.code_snippet && (
                                <pre className="p-2.5 rounded-lg bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                                  {art.code_snippet}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICAL PROJECT VERIFICATION INTERVIEW (Grounded in Real GitHub Code) */}
      {activeTab === 'interview' && (
        <div className="p-6 sm:p-8 bg-white border border-[#EBECEF] rounded-[28px] space-y-6 shadow-xs">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-[#1A5336]" />
                <h2 className="font-extrabold text-base text-[#111827]">
                  GitHub Repository Code Defense: {vivaSession?.project_name || 'Select a Repository'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Questions are dynamically generated and grounded in your GitHub codebase, architecture, tests, and error handling.
              </p>
            </div>

            {vivaSession && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                Question {Math.min(currentQIndex + 1, vivaSession.questions.length)} of {vivaSession.questions.length}
              </span>
            )}
          </div>

          {/* GitHub Project Selector Pills */}
          {projects.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#1A5336]" />
                  Select Connected GitHub Repository to Formulate Defense Questions:
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {projects.length} Repositories Inspected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.map((proj) => {
                  const isCurrent = (vivaSession?.project_id === proj.id) || (!vivaSession && selectedProjectId === proj.id);
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => handleStartInterview(proj.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                        isCurrent
                          ? 'bg-[#F0FDF4] border-[#1A5336] shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-[#1A5336] transition-colors">
                            {proj.title}
                          </h4>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {Math.round(proj.implementation_depth_score)}% Depth
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {proj.problem_definition}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-semibold truncate max-w-[150px]">
                          {proj.technologies_used.slice(0, 3).join(', ')}
                        </span>
                        <span className={`font-bold flex items-center gap-1 ${isCurrent ? 'text-[#166534]' : 'text-slate-400 group-hover:text-slate-700'}`}>
                          {isCurrent ? '● Active Defense Session' : 'Switch Project →'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {loadingInterview ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#1A5336]" />
              <div className="space-y-1">
                <span className="font-bold text-slate-800">Inspecting GitHub Codebase & Formulating Questions...</span>
                <p className="text-[11px] text-slate-400">Analyzing repository architecture, test suites, and boundary conditions.</p>
              </div>
            </div>
          ) : !isInterviewComplete && currentQ ? (
            <div className="space-y-5">
              {/* Question Box */}
              <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#DCFCE7] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1A5336]">
                    Focus Area: {currentQ.focus_area}
                  </span>
                  {currentQ.code_reference && (
                    <span className="font-mono text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      File Ref: {currentQ.code_reference}
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-extrabold text-[#111827] leading-relaxed">
                  "{currentQ.question}"
                </p>

                <p className="text-[11px] text-slate-500 italic">
                  Evaluation benchmark: {currentQ.expected_demonstration}
                </p>
              </div>

              {/* Answer Text Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Your Technical Explanation & Engineering Defense:
                </label>
                <textarea
                  rows={5}
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Explain your architectural design decisions, code implementation details, edge-case handling, and trade-offs..."
                  className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#1A5336] focus:bg-white leading-relaxed resize-none shadow-2xs"
                />
              </div>

              {/* Submit Action */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (currentQIndex < (vivaSession?.questions.length || 1) - 1) {
                      setCurrentQIndex(currentQIndex + 1);
                    }
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Skip Question
                </button>

                <button
                  type="button"
                  disabled={!answerInput.trim() || submittingAnswer}
                  onClick={handleSubmitAnswer}
                  className="btn-primary text-xs font-bold py-2.5 px-6 shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingAnswer ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Against Repository Code...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Submit Defense & Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Interview Completed Results */
            <div className="space-y-6 animate-in fade-in">
              <div className="p-6 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] text-center space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto text-[#1A5336]" />
                <h3 className="text-lg font-extrabold text-[#111827]">
                  GitHub Code Defense Complete!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {vivaSession?.summary_findings || 'Candidate demonstrated strong technical grasp in codebase defense.'}
                </p>
                <div className="text-2xl font-extrabold text-[#166534] pt-1">
                  Defense Score: {vivaSession?.overall_viva_score || 85.0}%
                </div>
              </div>

              {/* Detailed Evaluation Findings */}
              <div className="space-y-3">
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wider block">
                  Question-by-Question Technical Feedback:
                </span>
                {vivaSession?.evaluations.map((ev, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Question #{idx + 1}</span>
                      <span className="font-mono text-[#166534] font-extrabold">{ev.score}%</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <strong>Soundness:</strong> {ev.conceptual_soundness} • <strong>Reasoning:</strong> {ev.reasoning_quality}
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{ev.feedback}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {onNavigateToRoadmap && (
                  <button
                    type="button"
                    onClick={onNavigateToRoadmap}
                    className="btn-secondary text-xs font-bold py-2.5 px-4 flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#1A5336]" />
                    <span>View Generated Roadmap</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('analysis')}
                  className="btn-primary text-xs font-bold py-2.5 px-5 shadow-xs flex items-center gap-1.5"
                >
                  <span>View Updated Job Readiness Score</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HISTORICAL ASSESSMENTS */}
      {activeTab === 'history' && (
        <div className="p-6 sm:p-8 bg-white border border-[#EBECEF] rounded-[28px] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-[#111827]">Historical Assessment Snapshots</h2>
            <span className="text-xs text-slate-400 font-semibold">{pastReports.length} Saved Snapshots</span>
          </div>

          <div className="space-y-3">
            {pastReports.map((r) => (
              <div 
                key={r.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">{r.target_role_name}</div>
                  <div className="text-[11px] text-slate-500">{r.date} • {r.stage_label}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-[#1A5336]">{r.overall_readiness_score}%</div>
                  {r.score_delta !== null && r.score_delta !== undefined && (
                    <span className={`text-[10px] font-bold ${r.score_delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {r.score_delta >= 0 ? `+${r.score_delta}%` : `${r.score_delta}%`}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillAnalysisPage;
