import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowUpRight,
  Plus, 
  X, 
  Target,
  FolderGit2, 
  Check, 
  RefreshCw,
  Clock,
  ShieldCheck,
  FileCheck2,
  ChevronRight,
  BarChart3,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { api, AuthUser } from '../services/api';
import { AssessmentScoreBreakdown, JobRoleDefinition, ConnectedSource, EvidenceRecord } from '../types';
import { TechnicalMcqModal } from '../components/TechnicalMcqModal';

interface ResumeUploadPageProps {
  userId: string;
  userName: string;
  currentUser: AuthUser;
  targetRoleName: string;
  targetRoleId: string;
  assessment: AssessmentScoreBreakdown | null;
  sources: ConnectedSource[];
  evidence: EvidenceRecord[];
  onRoleChange: (roleId: string) => void;
  onAssessmentCompleted: (roleId: string, assessment: AssessmentScoreBreakdown) => void;
  onNavigateTab: (tab: string) => void;
  onRefreshData: () => void;
}

export const ResumeUploadPage: React.FC<ResumeUploadPageProps> = ({
  userId,
  userName,
  currentUser,
  targetRoleName,
  targetRoleId,
  assessment,
  sources,
  evidence,
  onRoleChange,
  onAssessmentCompleted,
  onNavigateTab,
  onRefreshData
}) => {
  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extracted Data State - NO HARDCODED FALLBACKS!
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [extractedProjects, setExtractedProjects] = useState<any[]>([]);
  const [extractedProfiles, setExtractedProfiles] = useState<{
    github?: string | null;
    github_repos?: string[];
    leetcode?: string | null;
    linkedin?: string | null;
  }>({});
  const [githubUrl, setGithubUrl] = useState('');
  const [hasExtracted, setHasExtracted] = useState(false);

  // 10 MCQs Modal State
  const [isMcqModalOpen, setIsMcqModalOpen] = useState(false);

  // Target Role State
  const [selectedRole, setSelectedRole] = useState<string>(targetRoleId || 'mle');
  const [customRoleInput, setCustomRoleInput] = useState<string>('');
  const [isScoring, setIsScoring] = useState(false);

  // Roles Definition
  const standardRoles = [
    { id: 'mle', name: 'Machine Learning Engineer', domain: 'Statistical Learning & Production Systems' },
    { id: 'java_backend', name: 'Java Backend Developer', domain: 'Enterprise Spring Boot & Microservices' },
    { id: 'fullstack', name: 'Full-Stack Developer', domain: 'Modern React, Node & Scalable Web' },
    { id: 'data_analyst', name: 'Data Analyst', domain: 'Data Warehousing, SQL & Visualization' },
    { id: 'devops', name: 'DevOps & Cloud Engineer', domain: 'CI/CD, Kubernetes & Infrastructure' },
    { id: 'python_backend', name: 'Python Backend Developer', domain: 'FastAPI, Async Architectures & DBs' },
  ];

  // Check if a resume was already uploaded previously strictly by this user
  const previousResumeSource = sources.find(s => (s.source_type === 'resume' || s.source_type === 'pdf') && s.user_id === userId);

  const [profileProjects, setProfileProjects] = useState<any[]>([]);

  useEffect(() => {
    api.getProjects(userId).then(projs => {
      setProfileProjects(projs);
      if (extractedProjects.length === 0 && projs.length > 0) {
        setExtractedProjects(projs);
      }
    }).catch(console.error);
  }, [userId]);

  // Load auto-extracted profiles from sources if already synced
  useEffect(() => {
    const userSources = sources.filter(s => s.user_id === userId);
    const ghSource = userSources.find(s => s.source_type === 'github');
    const lcSource = userSources.find(s => s.source_type === 'leetcode');
    const liSource = userSources.find(s => s.source_type === 'linkedin');

    if (ghSource || lcSource || liSource) {
      setExtractedProfiles(prev => ({
        ...prev,
        github: prev.github || ghSource?.url_or_path,
        github_repos: prev.github_repos || (ghSource?.metadata as any)?.repos || [],
        leetcode: prev.leetcode || lcSource?.url_or_path,
        linkedin: prev.linkedin || liSource?.url_or_path
      }));
      if (ghSource && !githubUrl) {
        setGithubUrl(ghSource.url_or_path);
      }
    }
  }, [sources, userId]);

  // ONLY load existing user evidence skills if strictly uploaded/created by THIS specific user
  useEffect(() => {
    if (evidence && evidence.length > 0 && extractedSkills.length === 0) {
      const userEvidence = evidence.filter(e => e.user_id === userId);
      if (userEvidence.length > 0) {
        const skillsFromEvidence = Array.from(new Set(userEvidence.map(e => e.skill_name || e.normalized_skill))).filter(Boolean);
        if (skillsFromEvidence.length > 0) {
          setExtractedSkills(skillsFromEvidence);
        }
      }
    }
  }, [evidence, userId]);

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorMsg('Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndExtract = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a resume file first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadProgress(15);

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => (prev < 80 ? prev + 15 : prev));
      }, 250);

      const res = await api.uploadResume(selectedFile, userId);
      clearInterval(progressTimer);
      setUploadProgress(100);

      setResumeId(res.resume_id);
      const skills = (res.details?.skills || []).map((s: any) => s.normalized_name || s.raw_term);
      const uniqueSkills = Array.from(new Set(skills)).filter(Boolean) as string[];
      setExtractedSkills(uniqueSkills);
      setExtractedProjects(res.details?.projects || []);

      if (res.details?.detected_links) {
        setExtractedProfiles(res.details.detected_links);
        if (res.details.detected_links.github) {
          setGithubUrl(res.details.detected_links.github);
        }
      }

      setHasExtracted(true);
      setSuccessMsg(`Resume successfully parsed! Extracted ${uniqueSkills.length} skills, ${res.details?.projects?.length || 0} projects, and linked online profiles.`);
      onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse resume. You can still add skills manually below.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isStudent = !currentUser || currentUser.role === 'student';

  // Trigger assessment flow: if student, take 10 MCQs; if recruiter, direct evaluate
  const handleStartAssessment = async () => {
    setErrorMsg(null);

    // If there is a selected file that hasn't been uploaded yet, upload and parse it first
    if (selectedFile && !hasExtracted) {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      setUploadProgress(20);

      try {
        const res = await api.uploadResume(selectedFile, userId);
        setUploadProgress(100);
        setResumeId(res.resume_id);
        const skills = (res.details?.skills || []).map((s: any) => s.normalized_name || s.raw_term);
        const uniqueSkills = Array.from(new Set(skills)).filter(Boolean) as string[];
        setExtractedSkills(uniqueSkills);
        setExtractedProjects(res.details?.projects || []);

        if (res.details?.detected_links) {
          setExtractedProfiles(res.details.detected_links);
          if (res.details.detected_links.github && !githubUrl) {
            setGithubUrl(res.details.detected_links.github);
          }
        }

        setHasExtracted(true);
        onRefreshData();
        setIsProcessing(false);

        // Student audit opens 10 Questions modal grounded in their GitHub projects
        if (isStudent) {
          setIsMcqModalOpen(true);
        } else {
          await handleDirectEvaluation();
        }
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMsg(err.message || 'Failed to parse resume.');
      }
      return;
    }

    if (!selectedFile && !previousResumeSource && extractedSkills.length === 0) {
      setErrorMsg('Please select or upload a resume file first.');
      fileInputRef.current?.click();
      return;
    }

    if (isStudent) {
      setIsMcqModalOpen(true);
    } else {
      await handleDirectEvaluation();
    }
  };

  const handleDirectEvaluation = async () => {
    setIsScoring(true);
    setErrorMsg(null);
    try {
      if (githubUrl.trim()) {
        await api.connectGitHub(userId, githubUrl.trim()).catch(() => null);
      }
      const roleIdToUse = customRoleInput.trim() ? 'mle' : selectedRole;
      onRoleChange(roleIdToUse);
      const newAssessment = await api.runAssessment(userId, roleIdToUse, 75);
      setIsScoring(false);
      onAssessmentCompleted(roleIdToUse, newAssessment);
      onNavigateTab('dashboard');
    } catch (err: any) {
      setIsScoring(false);
      setErrorMsg(err.message || 'Error evaluating resume and code repository.');
    }
  };

  // Called when 10 MCQs are submitted by student
  const handleMcqAssessmentCompleted = async (scorePercentage: number) => {
    setIsMcqModalOpen(false);
    setIsScoring(true);
    setErrorMsg(null);

    try {
      if (githubUrl.trim()) {
        await api.connectGitHub(userId, githubUrl.trim()).catch(() => null);
      }

      const roleIdToUse = customRoleInput.trim() ? 'mle' : selectedRole;
      onRoleChange(roleIdToUse);

      const newAssessment = await api.runAssessment(userId, roleIdToUse, scorePercentage);
      setIsScoring(false);
      onAssessmentCompleted(roleIdToUse, newAssessment);
      
      // Navigate to the center of the Dashboard to display score & RAG lags!
      onNavigateTab('dashboard');
    } catch (err: any) {
      setIsScoring(false);
      setErrorMsg(err.message || 'Error calculating readiness assessment.');
    }
  };

  // Accurate counts without any fake fallbacks!
  const hasAssessment = assessment && assessment.overall_readiness_score !== undefined;
  const readinessScore = hasAssessment ? Math.round(assessment.overall_readiness_score) : 0;
  const verifiedCount = extractedSkills.length;
  const projectsCount = extractedProjects.length;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto text-[#111827] animate-in fade-in duration-200">
      
      {/* 10 MCQs Modal - ONLY available in Student Login */}
      {isStudent && (
        <TechnicalMcqModal
          isOpen={isMcqModalOpen}
          onClose={() => setIsMcqModalOpen(false)}
          targetRoleName={targetRoleName}
          projects={extractedProjects.length > 0 ? extractedProjects : profileProjects}
          skills={extractedSkills}
          githubUrl={githubUrl}
          onAssessmentCompleted={handleMcqAssessmentCompleted}
        />
      )}

      {/* ================= DONEZO HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Upload & Analyze Your Resume
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Plan, prioritize, and accomplish your career benchmarks with ease.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Select Resume File</span>
          </button>
          
          <button
            onClick={() => onNavigateTab('profile')}
            className="btn-secondary text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xs"
          >
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* ================= ROW 1: 4 TOP METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Highlighted Forest Green Card */}
        <div className="metric-card-primary p-5 rounded-[22px] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">Overall Readiness</span>
            <button 
              onClick={() => onNavigateTab('skill-analysis')}
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
              <span>{readinessScore > 0 ? 'Verified' : 'Pending'}</span>
              <span>{readinessScore > 0 ? 'Active Assessment' : 'Take 10 MCQs below'}</span>
            </span>
          </div>
        </div>

        {/* Metric 2: Extracted Skills (Zero if no resume uploaded!) */}
        <div className="metric-card p-5 bg-white border border-[#EBECEF] rounded-[22px] flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Extracted Skills</span>
            <button 
              onClick={() => onNavigateTab('skill-analysis')}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]">
              {verifiedCount}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {verifiedCount > 0 ? `${verifiedCount} Skills extracted from resume` : '0 Upload resume to extract'}
            </span>
          </div>
        </div>

        {/* Metric 3: Project Claims (Zero if no projects found!) */}
        <div className="metric-card p-5 bg-white border border-[#EBECEF] rounded-[22px] flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Project Claims</span>
            <button 
              onClick={() => onNavigateTab('profile')}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]">
              {projectsCount}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {projectsCount > 0 ? `${projectsCount} Verified project claims` : '0 Claims on file'}
            </span>
          </div>
        </div>

        {/* Metric 4: Target Role */}
        <div className="metric-card p-5 bg-white border border-[#EBECEF] rounded-[22px] flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Target Role</span>
            <button 
              onClick={() => onNavigateTab('skill-analysis')}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2">
            <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111827] truncate">
              {targetRoleName?.split(' ')[0] || 'ML'} Eng
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-slate-400">
              Deterministic rubric
            </span>
          </div>
        </div>

      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================= MAIN TWO-COLUMN SECTION (DONEZO CARDS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Clean Drag & Drop Upload Card (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="card-clean p-6 sm:p-8 bg-white border border-[#EBECEF] rounded-[24px] shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1A5336]" />
                <h2 className="font-bold text-sm text-[#111827]">Select Document</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">PDF, DOCX, TXT up to 10MB</span>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[20px] p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#1A5336] bg-[#DCFCE7]/20 scale-[1.01]'
                  : 'border-slate-200 hover:border-[#1A5336]/60 bg-[#FAFAFA] hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center mx-auto text-[#1A5336] shadow-xs mb-4">
                <Upload className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-[#111827] text-base">
                  {selectedFile ? selectedFile.name : 'Click to Upload or Drag & Drop Resume'}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedFile 
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction` 
                    : 'Supported formats: PDF, DOCX, TXT'}
                </p>
              </div>
            </div>

            {/* Selected File Details Banner */}
            {selectedFile && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] text-[#1A5336] flex items-center justify-center font-bold">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#111827] truncate max-w-[260px] sm:max-w-xs">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready to extract
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setSuccessMsg(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Progress Bar during Processing */}
            {isProcessing && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1A5336]" />
                    <span>Extracting skills & project experiences...</span>
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-[#1A5336] transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Trigger Extract Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!selectedFile || isProcessing}
                onClick={handleUploadAndExtract}
                className="btn-primary w-full py-3.5 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting Document Competencies...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FileCheck2 className="w-4 h-4" />
                    <span>Parse & Extract Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Previous Resume on File Card (Only if this user actually uploaded one!) */}
          {previousResumeSource && (
            <div className="card-clean p-5 bg-white border border-[#EBECEF] rounded-[22px] flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#1A5336] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">
                    {previousResumeSource.name || 'Stored Resume Document'}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Synced: {previousResumeSource.last_synced || 'Recently'}</span>
                    <span>•</span>
                    <span className="text-[#1A5336] font-semibold">Active in Profile</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[#1A5336] hover:underline font-bold"
              >
                Replace File
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Target Role & Competencies (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Target Role Selector Card */}
          <div className="card-clean p-6 bg-white border border-[#EBECEF] rounded-[24px] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#1A5336]" />
                <h2 className="font-bold text-sm text-[#111827]">Target Career Role</h2>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">EVALUATION RUBRIC</span>
            </div>

            <p className="text-xs text-slate-500">
              Select your career goal to benchmark verified skills against industry expectations.
            </p>

            <div className="space-y-2">
              {standardRoles.map((role) => {
                const isSelected = selectedRole === role.id && !customRoleInput.trim();
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id);
                      setCustomRoleInput('');
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#F8FAF9] border-[#1A5336] shadow-xs'
                        : 'bg-white border-[#EBECEF] hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-[#111827]">{role.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{role.domain}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#1A5336] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Role Input */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-semibold text-slate-500">Or Enter Custom Job Role</label>
              <input
                type="text"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                placeholder="e.g. Distributed Systems Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1A5336] focus:bg-white"
              />
            </div>
          </div>

          {/* Auto-Extracted Profiles & Project Audit Card */}
          <div className="card-clean p-6 bg-white border border-[#EBECEF] rounded-[24px] shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4.5 h-4.5 text-[#1A5336]" />
                <h2 className="font-bold text-sm text-[#111827]">
                  {isStudent ? 'Auto-Extracted Profiles & Project Audit' : 'Candidate Profiles & Code Audit'}
                </h2>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                Zero Manual Input
              </span>
            </div>

            <p className="text-xs text-slate-500">
              {isStudent 
                ? 'GitHub, LeetCode, and LinkedIn profiles are automatically extracted from your resume. 10 technical audit questions are strictly formulated from your GitHub project codebases.' 
                : 'Engineering profiles and verified project codebases automatically parsed from resume for deterministic audit.'}
            </p>

            {/* Auto-Extracted Profiles Display */}
            <div className="space-y-3">
              {/* GitHub Profile */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      GH
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>GitHub Profile</span>
                        {(extractedProfiles.github || githubUrl) && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#DCFCE7] text-[#166534]">
                            ✓ Auto-Extracted
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono truncate max-w-[260px] sm:max-w-none">
                        {extractedProfiles.github || githubUrl || 'Upload resume to auto-extract profile'}
                      </div>
                    </div>
                  </div>
                  {(extractedProfiles.github || githubUrl) && (
                    <a 
                      href={extractedProfiles.github || githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#1A5336] hover:underline font-semibold flex items-center gap-1 shrink-0"
                    >
                      <span>View</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Verified Project Repositories */}
                {(extractedProfiles.github_repos && extractedProfiles.github_repos.length > 0) && (
                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Grounding Assessment Questions in Verified Repositories:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedProfiles.github_repos.map((repo, idx) => {
                        const name = repo.split('/').pop() || repo;
                        return (
                          <a
                            key={idx}
                            href={repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs hover:border-[#1A5336] hover:text-[#1A5336] transition-all flex items-center gap-1.5"
                          >
                            <FolderGit2 className="w-3 h-3 text-[#1A5336]" />
                            <span>{name}</span>
                            <ArrowUpRight className="w-2.5 h-2.5 text-slate-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* LeetCode & LinkedIn Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* LeetCode */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                      LC
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                        <span>LeetCode</span>
                        {extractedProfiles.leetcode && (
                          <span className="text-[8px] px-1 py-0.2 rounded-full font-bold bg-[#DCFCE7] text-[#166534]">
                            ✓ Auto
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-600 truncate max-w-[140px] font-mono">
                        {extractedProfiles.leetcode ? extractedProfiles.leetcode.replace('https://leetcode.com/u/', '').replace('https://leetcode.com/', '') : 'Extracted on upload'}
                      </div>
                    </div>
                  </div>
                  {extractedProfiles.leetcode && (
                    <a href={extractedProfiles.leetcode} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                      IN
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                        <span>LinkedIn</span>
                        {extractedProfiles.linkedin && (
                          <span className="text-[8px] px-1 py-0.2 rounded-full font-bold bg-[#DCFCE7] text-[#166534]">
                            ✓ Auto
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-600 truncate max-w-[140px] font-mono">
                        {extractedProfiles.linkedin ? extractedProfiles.linkedin.replace('https://www.linkedin.com/in/', '').replace('http://www.linkedin.com/in/', '') : 'Extracted on upload'}
                      </div>
                    </div>
                  </div>
                  {extractedProfiles.linkedin && (
                    <a href={extractedProfiles.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-2">
              {isStudent ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={isProcessing || isScoring}
                    onClick={handleStartAssessment}
                    className="btn-primary w-full py-3.5 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Parsing Resume & Inspecting Repository...</span>
                      </>
                    ) : isScoring ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing Code & Evaluating Skill Lags...</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        <span>Take 10 Questions (Grounded in Your GitHub Projects)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-500">
                    Questions adapt specifically to your project codebases (e.g. MedRoute, CampusBridge)
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isProcessing || isScoring}
                  onClick={handleStartAssessment}
                  className="btn-primary w-full py-3.5 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Candidate Resume...</span>
                    </div>
                  ) : isScoring ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Computing Readiness Benchmarks...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FileCheck2 className="w-4 h-4" />
                      <span>Evaluate Candidate Readiness</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Footer notes */}
      <div className="text-center pt-2 text-xs text-slate-400 flex items-center justify-center gap-4">
        <span>Deterministic Rule Evaluation</span>
        <span>•</span>
        <span>No Fake Claims</span>
        <span>•</span>
        <span>Grounded in Provided Artifacts & MCQs</span>
      </div>
    </div>
  );
};

export default ResumeUploadPage;
