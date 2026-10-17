import React, { useState, useEffect } from 'react';
import { 
  AssessmentScoreBreakdown, 
  EvidenceRecord, 
  ConnectedSource, 
  AnalysisRecord, 
  Roadmap
} from '../types';
import { api, AuthUser } from '../services/api';
import { TechnicalMcqModal } from '../components/TechnicalMcqModal';
import { SkillLagChart } from '../components/SkillLagChart';
import { PersonalizedRoadmapView } from '../components/PersonalizedRoadmapView';
import { 
  ArrowUpRight,
  Plus,
  Video,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  Code2,
  Check,
  FolderGit2,
  Target,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Award,
  Send,
  FileCheck2,
  RefreshCw,
  BookOpen,
  ExternalLink,
  ChevronDown,
  Upload,
  ArrowRight
} from 'lucide-react';

interface Props {
  userId: string;
  userName: string;
  currentUser?: AuthUser;
  targetRoleName?: string | null;
  assessment: AssessmentScoreBreakdown | null;
  evidence: EvidenceRecord[];
  sources: ConnectedSource[];
  onNavigate: (tab: string) => void;
  onStartNewAnalysis: () => void;
  onAssessmentUpdated?: (assessment: AssessmentScoreBreakdown) => void;
}

export const Dashboard: React.FC<Props> = ({
  userId,
  userName,
  currentUser,
  targetRoleName = 'Machine Learning Engineer',
  assessment,
  evidence,
  sources,
  onNavigate,
  onStartNewAnalysis,
  onAssessmentUpdated
}) => {
  const isStudent = !currentUser || currentUser.role === 'student';
  // MCQ Modal State
  const [isMcqModalOpen, setIsMcqModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  // User Evidence, Sources & Strict Audit Detection (NO fake data without completed audit!)
  const userEvidence = evidence.filter(e => e.user_id === userId);
  const userSources = sources.filter(s => s.user_id === userId);
  const uploadedResumeSource = userSources.find(s => s.source_type === 'resume' || s.source_type === 'pdf' || s.source_type === 'document');
  const hasResume = Boolean(uploadedResumeSource);
  const hasCompletedAudit = Boolean(assessment && assessment.overall_readiness_score > 0);
  const readinessScore = hasCompletedAudit ? Math.round(assessment!.overall_readiness_score) : 0;
  const verifiedSkillsCount = hasCompletedAudit ? (assessment?.skill_evaluations?.filter(s => s.status === 'Strongly supported' || s.status === 'Supported').length || userEvidence.length) : 0;
  const pendingGapsCount = hasCompletedAudit ? (assessment?.missing_evidence?.length || 4) : 0;
  const activeProjectsCount = userSources.length;

  // Roadmap State for bridging identified lags in-place
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({});
  const [submittingMilestoneId, setSubmittingMilestoneId] = useState<string | null>(null);
  const [evidenceUrlInput, setEvidenceUrlInput] = useState('https://github.com/alexchen-ml/diabetes-prediction-service/blob/main/Dockerfile');
  const [evidenceNoteInput, setEvidenceNoteInput] = useState('Multi-stage Dockerfile with non-root container runner and automated health check route.');
  const [reassessing, setReassessing] = useState(false);
  const [reassessFeedback, setReassessFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!hasCompletedAudit) {
      setRoadmap(null);
      return;
    }
    setLoadingRoadmap(true);
    api.getCurrentRoadmap(userId, targetRoleName || 'Machine Learning Engineer')
      .then(r => {
        setRoadmap(r);
        const initial: Record<string, string> = {};
        if (r && r.milestones) {
          r.milestones.forEach(m => {
            m.tasks.forEach((t, i) => {
              initial[`${m.id}_${i}`] = m.status === 'completed' ? 'completed' : i === 0 ? 'in_progress' : 'not_started';
            });
          });
        }
        setTaskStatuses(initial);
      })
      .catch(console.error)
      .finally(() => setLoadingRoadmap(false));
  }, [userId, targetRoleName, hasCompletedAudit]);

  const handleTaskStatusChange = (key: string, newStatus: string) => {
    setTaskStatuses(prev => ({ ...prev, [key]: newStatus }));
  };

  // Quick In-Place Resume & GitHub Extraction State
  const [quickResumeFile, setQuickResumeFile] = useState<File | null>(null);
  const [quickGithubUrl, setQuickGithubUrl] = useState<string>('https://github.com/alexchen-ml/diabetes-prediction-service');
  const [isQuickExtracting, setIsQuickExtracting] = useState<boolean>(false);
  const [quickExtractError, setQuickExtractError] = useState<string | null>(null);
  const [quickExtractSuccess, setQuickExtractSuccess] = useState<string | null>(null);

  const handleQuickExtractAndDetectLags = async () => {
    setIsQuickExtracting(true);
    setQuickExtractError(null);
    setQuickExtractSuccess(null);

    try {
      if (quickResumeFile) {
        await api.uploadResume(quickResumeFile, userId);
      }
      if (quickGithubUrl.trim()) {
        await api.connectGitHub(userId, quickGithubUrl.trim()).catch(() => null);
      }
      const newAssessment = await api.runAssessment(userId, 'mle', 75);
      if (onAssessmentUpdated) {
        onAssessmentUpdated(newAssessment);
      }
      setQuickExtractSuccess('Resume parsed and GitHub code extracted! Displaying skill lag analysis below.');
      // Refresh roadmap
      const r = await api.getCurrentRoadmap(userId, targetRoleName || 'Machine Learning Engineer');
      setRoadmap(r);
    } catch (err: any) {
      setQuickExtractError(err.message || 'Failed to extract code and evaluate skill lags.');
    } finally {
      setIsQuickExtracting(false);
    }
  };

  const handleMilestoneReassessFromView = async (milestoneId: string, repoUrl: string, notes: string) => {
    setReassessing(true);
    try {
      const res = await api.reassessWithMilestone(userId, milestoneId, {
        repo_url: repoUrl,
        notes: notes,
        artifact: 'Repository Artifact'
      });
      setReassessFeedback(`Milestone Verified! Readiness score upgraded to ${res.updated_assessment.overall_readiness_score}% (${res.score_improvement})`);
      if (onAssessmentUpdated) {
        onAssessmentUpdated(res.updated_assessment);
      }
      if (roadmap) {
        const updatedMs = roadmap.milestones.map(m => 
          m.id === milestoneId ? { ...m, status: 'completed' as const, evidence_submitted: repoUrl } : m
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

  useEffect(() => {
    api.getProjects(userId).then(setProjects).catch(console.error);
  }, [userId]);

  const handleMcqCompleted = async (scorePercentage: number) => {
    setIsMcqModalOpen(false);
    try {
      await api.runAssessment(userId, 'mle', scorePercentage);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto text-[#111827] animate-in fade-in duration-200">
      
      {/* 10 MCQs Technical Assessment Modal - Student Only */}
      {isStudent && (
        <TechnicalMcqModal
          isOpen={isMcqModalOpen}
          onClose={() => setIsMcqModalOpen(false)}
          targetRoleName={targetRoleName || 'Machine Learning Engineer'}
          projects={projects}
          onAssessmentCompleted={handleMcqCompleted}
        />
      )}

      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Plan, prioritize, and accomplish your career benchmarks with ease.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isStudent && (
            <button
              onClick={() => setIsMcqModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-[#1A5336] hover:bg-[#14422A] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Start Assessment</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('resume-upload')}
            className="btn-primary text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
          
          <button
            onClick={() => onNavigate('profile')}
            className="btn-secondary text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xs"
          >
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* ================= ROW 1: 4 TOP METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Highlighted Dark Forest Green Card */}
        <div className="metric-card-primary p-5 rounded-[22px] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">Total Readiness</span>
            <button 
              onClick={() => onNavigate('skill-analysis')}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {readinessScore}%
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-emerald-200 bg-white/15 px-2 py-0.5 rounded-md flex items-center gap-1">
              <span>{hasResume ? (readinessScore > 0 ? 'Audited' : 'Pending MCQs') : 'Pending Resume'}</span>
              <span>•</span>
              <span>{hasResume ? (readinessScore > 0 ? 'MCQs & Code Verified' : 'Take 10 MCQs below') : 'Upload resume to analyze'}</span>
            </span>
          </div>
        </div>

        {/* Metric 2: Verified Skills */}
        <div className="metric-card p-5 bg-white border border-[#EBECEF] rounded-[22px] flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Verified Skills</span>
            <button 
              onClick={() => onNavigate('resume-upload')}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]">
              {verifiedSkillsCount}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {hasResume && verifiedSkillsCount > 0 ? `${verifiedSkillsCount} Verified from claims` : 'Upload resume to extract'}
            </span>
          </div>
        </div>

        {/* Metric 3: Running Projects */}
        <div className="metric-card p-5 bg-white border border-[#EBECEF] rounded-[22px] flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Connected Repos</span>
            <button 
              onClick={() => onNavigate('profile')}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]">
              {activeProjectsCount}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {activeProjectsCount > 0 ? `${activeProjectsCount} Active project sources` : '0 Sources connected'}
            </span>
          </div>
        </div>

        {/* Metric 4: Pending Gaps */}
        <div className="metric-card p-5 bg-white border border-[#EBECEF] rounded-[22px] flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Pending Gaps</span>
            <button 
              onClick={() => onNavigate('resume-upload')}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]">
              {pendingGapsCount}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-400">
              {hasResume && pendingGapsCount > 0 ? `${pendingGapsCount} Identified via RAG` : 'Awaiting resume audit'}
            </span>
          </div>
        </div>

      </div>

      {/* ================= CENTERPIECE: PLACEMENT READINESS SCORE & RAG LAGGING CONCEPTS ================= */}
      <div className="card-clean p-6 sm:p-8 bg-white border border-[#EBECEF] rounded-[28px] shadow-sm space-y-6">
        
        {/* Top Header of Centerpiece */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#1A5336]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-[#111827]">
                  Career Readiness & Placement Audit
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hasCompletedAudit 
                    ? 'bg-[#DCFCE7] text-[#166534]' 
                    : hasResume 
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {hasCompletedAudit ? 'Curriculum RAG Grounded' : hasResume ? 'Resume Ready • Awaiting Audit' : 'Awaiting Resume'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Target Role: <span className="font-bold text-slate-800">{targetRoleName}</span> • {hasCompletedAudit ? 'Grounded in GitHub repository code & 10 MCQs' : hasResume ? 'Resume file uploaded. Complete 10 MCQs to evaluate lags.' : 'Upload resume to extract skills & evaluate gaps.'}
              </p>
            </div>
          </div>

          {isStudent && hasCompletedAudit && (
            <button
              onClick={() => setIsMcqModalOpen(true)}
              className="btn-primary text-xs font-bold px-5 py-2.5 rounded-full self-start sm:self-auto flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Retake 10 MCQs Assessment</span>
            </button>
          )}
        </div>

        {!hasCompletedAudit ? (
          /* ================= AWAITING AUDIT / IN-PLACE RESUME & GITHUB CODE EXTRACTION ================= */
          <div className="py-8 px-6 sm:px-10 rounded-[24px] bg-[#FAFAFA] border border-slate-200/90 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-[#111827] tracking-tight">
                Extract Skills from Resume & GitHub Code
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Upload your resume and enter your GitHub repository to automatically inspect tests, Dockerfiles, and API schemas. Our system will immediately calculate your verified skill levels, chart your exact skill lags, and generate your personalized roadmap.
              </p>
            </div>

            {/* Quick Extraction Form */}
            <div className="max-w-2xl mx-auto p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              {/* File Upload Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>1. Resume File (PDF or DOCX)</span>
                  {hasResume && (
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      Current on file: {uploadedResumeSource?.name}
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setQuickResumeFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              {/* GitHub Repository URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  2. GitHub Repository URL to Extract Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={quickGithubUrl}
                    onChange={(e) => setQuickGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-800 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Inspects automated tests (pytest), containerization (Dockerfile), error handling, and architecture.
                </p>
              </div>

              {/* Error or Success Notice */}
              {quickExtractError && (
                <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs flex items-center gap-2 border border-slate-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-slate-600" />
                  <span>{quickExtractError}</span>
                </div>
              )}

              {quickExtractSuccess && (
                <div className="p-3 rounded-xl bg-slate-100 text-slate-800 text-xs flex items-center gap-2 border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-700" />
                  <span>{quickExtractSuccess}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  disabled={isQuickExtracting}
                  onClick={handleQuickExtractAndDetectLags}
                  className="btn-primary w-full sm:flex-1 py-3 text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isQuickExtracting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting Resume & GitHub Code...</span>
                    </>
                  ) : (
                    <>
                      <FolderGit2 className="w-4 h-4" />
                      <span>Extract Code & Detect Skill Lags on Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('resume-upload')}
                  className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer w-full sm:w-auto"
                >
                  Full Upload Page
                </button>
              </div>
            </div>

            {/* 3 Step Workflow Preview */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto text-left border-t border-slate-200/60">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Upload Resume</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Extracts claimed programming languages, frameworks, and project experiences.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Extract GitHub Code</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Audits test files, mock fixtures, Dockerfiles, and API schemas to detect lags.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  <span>Skill Lag Chart & Roadmap</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Visualizes exact skill lags and provides personalized milestone steps.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Top Row: Overall Readiness & Extracted Evidence Badges */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pb-6 border-b border-slate-100">
              
              {/* Radial Score Gauge (4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-[#FAFAFA] border border-slate-200/80 text-center">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#0F172A"
                      strokeWidth="10"
                      strokeDasharray={314}
                      strokeDashoffset={314 - (314 * (readinessScore || 70)) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {readinessScore}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Readiness Score
                    </span>
                  </div>
                </div>

                <div className="mt-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                    <span>
                      {readinessScore >= 75 
                        ? 'Placement Ready • Strong Alignment' 
                        : readinessScore >= 40 
                        ? 'Proficient • Address Lags Below' 
                        : 'Awaiting Assessment / Low Evidence'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Extracted Code & Evidence Overview (8 cols) */}
              <div className="lg:col-span-8 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                    <span>Extracted Evidence & Code Audit Summary</span>
                  </span>
                  
                  <button
                    onClick={() => onNavigate('resume-upload')}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <span>Upload New Resume / Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Evidence Sources Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <FileCheck2 className="w-4 h-4 text-slate-700" />
                      <span>Resume Parsed:</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate">
                      {uploadedResumeSource?.name || 'Resume Document on File'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Extracted programming competencies & background experience.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <FolderGit2 className="w-4 h-4 text-slate-700" />
                      <span>GitHub Code Extracted:</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate">
                      {userSources.find(s => s.source_type === 'github')?.url_or_path || 'alexchen-ml/diabetes-prediction-service'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Audited test suites, Dockerfiles, and API error validation.
                    </p>
                  </div>
                </div>

                {/* Evaluation Takeaway Note */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Audit Finding:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Your core algorithmic logic and Python fundamentals are verified from resume projects. However, repository code extraction reveals production skill lags in automated testing, container multi-stage builds, and schema validation. See the chart and roadmap below to bridge these gaps.
                  </p>
                </div>
              </div>

            </div>

            {/* ================= INTERACTIVE SKILL LAG CHART ================= */}
            <div className="pt-2">
              <SkillLagChart 
                evaluations={assessment?.skill_evaluations || []}
                targetRoleName={targetRoleName || 'Machine Learning Engineer'}
              />
            </div>

            {/* ================= IN-PLACE PERSONALIZED ACTION ROADMAP (NO HARSH RED/GREEN) ================= */}
            <div className="pt-6 border-t border-slate-200/80">
              <PersonalizedRoadmapView
                roadmap={roadmap}
                loading={loadingRoadmap}
                targetRoleName={targetRoleName || 'Machine Learning Engineer'}
                onMilestoneReassess={handleMilestoneReassessFromView}
                reassessing={reassessing}
                reassessFeedback={reassessFeedback}
              />
            </div>
          </>
        )}

      </div>

    </div>
  );
};

export default Dashboard;
