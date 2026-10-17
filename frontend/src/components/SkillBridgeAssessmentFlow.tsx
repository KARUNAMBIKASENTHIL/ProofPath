import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  X, 
  Target,
  FolderGit2,
  Check,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { AssessmentScoreBreakdown, JobRoleDefinition } from '../types';

interface Props {
  userId: string;
  onAssessmentCompleted: (roleId: string, assessment: AssessmentScoreBreakdown) => void;
  onCancel?: () => void;
}

export const SkillBridgeAssessmentFlow: React.FC<Props> = ({
  userId,
  onAssessmentCompleted,
  onCancel
}) => {
  // Stepper: 1 = Skills Input, 2 = Review, 3 = Target Role
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [inputTab, setInputTab] = useState<'upload' | 'manual'>('upload');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extracted / Manually entered data
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [newSkillText, setNewSkillText] = useState('');
  const [extractedProjects, setExtractedProjects] = useState<any[]>([]);
  const [githubUrl, setGithubUrl] = useState('');
  const [resumeId, setResumeId] = useState<string | null>(null);

  // Target Role State
  const [roles, setRoles] = useState<JobRoleDefinition[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('mle');
  const [customRoleInput, setCustomRoleInput] = useState<string>('');
  const [isGeneratingInitial, setIsGeneratingInitial] = useState(false);

  // Load available roles on mount
  React.useEffect(() => {
    api.getRoles().then(r => {
      setRoles(r);
    }).catch(console.error);
  }, []);

  // Standard Suggested Roles per requirement
  const suggestedRoles = [
    { id: 'mle', name: 'Machine Learning Engineer', domain: 'AI/ML' },
    { id: 'java_backend', name: 'Java Backend Developer', domain: 'Enterprise Software' },
    { id: 'fullstack', name: 'Full-Stack Developer', domain: 'Web Engineering' },
    { id: 'data_analyst', name: 'Data Analyst', domain: 'Analytics & BI' },
    { id: 'ai_engineer', name: 'AI Engineer', domain: 'Artificial Intelligence & Neural Networks' },
    { id: 'devops', name: 'DevOps Engineer', domain: 'Cloud & Infrastructure' },
    { id: 'python_backend', name: 'Python Developer', domain: 'Systems & Backend' },
  ];

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExt) {
      setErrorMsg('Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit.');
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

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setUploadProgress(25);

    try {
      const timer = setInterval(() => {
        setUploadProgress(p => (p < 85 ? p + 20 : p));
      }, 200);

      const res = await api.uploadResume(selectedFile, userId);
      clearInterval(timer);
      setUploadProgress(100);

      setResumeId(res.resume_id);
      const skills = (res.details?.skills || []).map((s: any) => s.normalized_name || s.raw_term);
      setExtractedSkills(skills.length > 0 ? skills : ['Python', 'SQL', 'FastAPI', 'Machine Learning', 'Git']);
      setExtractedProjects(res.details?.projects || []);
      if (res.details?.detected_links?.github) {
        setGithubUrl(res.details.detected_links.github);
      }

      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(2); // Advance to Review
      }, 400);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Failed to parse resume file. You can enter your skills manually.');
    }
  };

  const handleManualProceed = () => {
    if (extractedSkills.length === 0) {
      setErrorMsg('Please add at least 2 technical skills.');
      return;
    }
    setErrorMsg(null);
    setCurrentStep(2);
  };

  const addSkill = () => {
    if (newSkillText.trim() && !extractedSkills.includes(newSkillText.trim())) {
      setExtractedSkills([...extractedSkills, newSkillText.trim()]);
      setNewSkillText('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setExtractedSkills(extractedSkills.filter(s => s !== skillToRemove));
  };

  // Immediate Initial Scoring trigger as soon as role is selected
  const handleConfirmRoleAndScore = async () => {
    setIsGeneratingInitial(true);
    setErrorMsg(null);

    try {
      // Connect GitHub if user entered or confirmed a URL
      if (githubUrl.trim()) {
        await api.connectGitHub(userId, githubUrl.trim()).catch(() => null);
      }

      const roleIdToUse = customRoleInput.trim() ? 'mle' : selectedRoleId;
      // Trigger deterministic scoring engine immediately
      const initialAssessment = await api.runAssessment(userId, roleIdToUse);
      
      setIsGeneratingInitial(false);
      onAssessmentCompleted(roleIdToUse, initialAssessment);
    } catch (err: any) {
      setIsGeneratingInitial(false);
      setErrorMsg(err.message || 'Error generating assessment.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-8 space-y-8 animate-in fade-in duration-200">
      {/* 3-Step Breadcrumb Stepper matching reference screenshot */}
      <div className="flex items-center justify-center gap-3 text-xs font-semibold">
        <div className={`flex items-center gap-1.5 transition-colors ${currentStep === 1 ? 'text-violet-400 font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 1 ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40' : 'bg-white/[0.06] text-slate-400'}`}>1</span>
          <span>Skills Input</span>
        </div>
        <span className="text-slate-600">→</span>
        <div className={`flex items-center gap-1.5 transition-colors ${currentStep === 2 ? 'text-violet-400 font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 2 ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40' : 'bg-white/[0.06] text-slate-400'}`}>2</span>
          <span>Review</span>
        </div>
        <span className="text-slate-600">→</span>
        <div className={`flex items-center gap-1.5 transition-colors ${currentStep === 3 ? 'text-violet-400 font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 3 ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40' : 'bg-white/[0.06] text-slate-400'}`}>3</span>
          <span>Target Role</span>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Bridge Your <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">Skill Gaps</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          {currentStep === 1 && "Analyze your current skills against industry standards or specific job descriptions to find exactly what you're missing."}
          {currentStep === 2 && "Review your extracted technical skills and project claims before generating your initial assessment."}
          {currentStep === 3 && "Select your target career path to immediately calculate your initial evidence-based readiness score."}
        </p>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* STEP 1: SKILLS INPUT (Upload CV or Enter Manually) */}
      {currentStep === 1 && (
        <div className="card-clean p-6 sm:p-8 space-y-6 max-w-2xl mx-auto border border-white/[0.08] shadow-2xl bg-[#12141F]">
          {/* Segmented Tab Pill */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#181B2B] border border-white/[0.06] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInputTab('upload')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                inputTab === 'upload'
                  ? 'bg-[#22263D] text-white shadow-xs border border-white/[0.08]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-violet-400" />
              <span>Upload CV / Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setInputTab('manual')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                inputTab === 'manual'
                  ? 'bg-[#22263D] text-white shadow-xs border border-white/[0.08]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-violet-400" />
              <span>Enter Skills Manually</span>
            </button>
          </div>

          {inputTab === 'upload' ? (
            <div className="space-y-5">
              {/* Dashed Drag and Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-violet-500 bg-violet-600/10'
                    : 'border-white/[0.12] hover:border-violet-500/50 bg-[#161828]/50 hover:bg-[#161828]'
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

                {/* Violet Circular Document Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-purple-600/20 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-300 shadow-lg shadow-violet-600/20 mb-4">
                  <FileText className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-white text-base">
                    Click to Upload or Drag & Drop
                  </h3>
                  <p className="text-xs text-slate-400">
                    PDF, DOCX, Images, or Text (Max 10MB)
                  </p>
                </div>
              </div>

              {/* Selected File Card */}
              {selectedFile && (
                <div className="p-4 rounded-xl bg-[#171A2B] border border-violet-500/30 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-xs text-white truncate max-w-[220px] sm:max-w-xs">
                        {selectedFile.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready to extract
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Progress Bar during Extraction */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Extracting profile & technical skills...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Primary Analyze Action Button */}
              <button
                type="button"
                disabled={!selectedFile || isProcessing}
                onClick={handleUploadAndAnalyze}
                className="btn-primary w-full py-3 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Document...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Analyze My Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          ) : (
            /* Manual Input Mode */
            <div className="space-y-5 text-xs">
              <div className="space-y-2">
                <label className="font-medium text-slate-300">Technical Skills (Press Enter or Add)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillText}
                    onChange={(e) => setNewSkillText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="e.g. Python, Docker, PyTorch, React, SQL"
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#181B2B] border border-white/[0.1] text-white focus:outline-none focus:border-violet-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {extractedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs"
                    >
                      <span>{skill}</span>
                      <button onClick={() => removeSkill(skill)} className="hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {extractedSkills.length === 0 && (
                    <span className="text-slate-500 italic text-[11px]">No skills added yet. Type your key competencies above.</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-300">GitHub Profile or Repository URL (Optional)</label>
                <div className="relative">
                  <FolderGit2 className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#181B2B] border border-white/[0.1] text-white focus:outline-none focus:border-violet-500 text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualProceed}
                className="btn-primary w-full py-3 text-xs font-semibold"
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Subtext Badges */}
          <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-slate-500">
            <span>Profile Parsing</span>
            <span>•</span>
            <span className="text-slate-400 font-medium">Deterministic Career Intelligence</span>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW EXTRACTED DETAILS */}
      {currentStep === 2 && (
        <div className="card-clean p-6 sm:p-8 space-y-6 max-w-2xl mx-auto border border-white/[0.08] shadow-2xl bg-[#12141F]">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="font-bold text-lg text-white">Review Extracted Competencies</h3>
              <p className="text-xs text-slate-400">Verify your detected skills. You can add or remove items before scoring.</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
              {extractedSkills.length} Skills Identified
            </span>
          </div>

          {/* Skills Tag Cloud */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-300">Extracted Technical Skills</label>
            <div className="flex flex-wrap gap-2 p-3.5 rounded-xl bg-[#171A2B] border border-white/[0.06] min-h-[90px]">
              {extractedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-200 text-xs font-medium"
                >
                  <span>{skill}</span>
                  <button onClick={() => removeSkill(skill)} className="hover:text-rose-400 text-slate-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Quick Add Skill */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillText}
                onChange={(e) => setNewSkillText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add missing skill (e.g. Kubernetes, Redis)"
                className="flex-1 px-3 py-2 rounded-lg bg-[#181B2B] border border-white/[0.1] text-white focus:outline-none focus:border-violet-500 text-xs"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-3.5 py-2 rounded-lg bg-[#22263D] hover:bg-violet-600 text-white text-xs font-medium transition-colors"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Connected GitHub / Projects */}
          <div className="space-y-2 text-xs">
            <label className="font-medium text-slate-300">GitHub Profile / Repository Link</label>
            <div className="relative">
              <FolderGit2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/alexchen/medical-imaging-cnn"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#181B2B] border border-white/[0.1] text-white focus:outline-none focus:border-violet-500 text-xs"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Connecting your repository allows ProofPath to audit your actual code files, unit tests, and architecture for deeper score upgrades.
            </p>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn-secondary text-xs"
            >
              Back to Upload
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn-primary text-xs font-semibold"
            >
              <span>Confirm & Choose Target Role</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TARGET ROLE SELECTION & IMMEDIATE INITIAL SCORING */}
      {currentStep === 3 && (
        <div className="card-clean p-6 sm:p-8 space-y-6 max-w-2xl mx-auto border border-white/[0.08] shadow-2xl bg-[#12141F]">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white">Select Your Target Career Role</h3>
            <p className="text-xs text-slate-400">
              Your initial assessment and readiness score will be calculated immediately against the industry rubric for this role.
            </p>
          </div>

          {/* Suggested Roles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suggestedRoles.map((role) => {
              const isSelected = selectedRoleId === role.id && !customRoleInput.trim();
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    setCustomRoleInput('');
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-violet-600/20 border-violet-500 shadow-md shadow-violet-600/20'
                      : 'bg-[#161828] border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{role.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{role.domain}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Role Input */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-medium text-slate-300">Or Enter Custom Job Role</label>
            <input
              type="text"
              value={customRoleInput}
              onChange={(e) => setCustomRoleInput(e.target.value)}
              placeholder="e.g. Distributed Systems Engineer"
              className="w-full px-3 py-2 rounded-lg bg-[#181B2B] border border-white/[0.1] text-white focus:outline-none focus:border-violet-500 text-xs"
            />
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-secondary text-xs"
            >
              Back to Review
            </button>
            <button
              type="button"
              disabled={isGeneratingInitial}
              onClick={handleConfirmRoleAndScore}
              className="btn-primary text-xs font-bold py-3 px-6 shadow-xl"
            >
              {isGeneratingInitial ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Initial Score...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-200" />
                  <span>Generate Initial Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
