import React, { useState, useEffect } from 'react';
import { 
  JobRoleDefinition, 
  MultiRoleResult, 
  CareerRecommendation,
  AssessmentScoreBreakdown 
} from '../types';
import { api } from '../services/api';
import { 
  Sparkles, 
  Target, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  Trash2, 
  FileText, 
  FolderGit2, 
  Compass, 
  Layers, 
  Edit3,
  RefreshCw,
  Search
} from 'lucide-react';

interface Props {
  userId: string;
  currentTargetRole: string;
  onAnalysisCompleted: (roleId: string, assessment: AssessmentScoreBreakdown) => void;
  onNavigate: (tab: string) => void;
}

export const NewAnalysisPage: React.FC<Props> = ({
  userId,
  currentTargetRole,
  onAnalysisCompleted,
  onNavigate
}) => {
  // Wizard state
  const [step, setStep] = useState<number>(1); // 1: Role, 2: Upload/Evidence, 3: Review, 4: Results
  const [roles, setRoles] = useState<JobRoleDefinition[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('mle');
  
  // Multi-role comparison state
  const [isComparingRoles, setIsComparingRoles] = useState<boolean>(false);
  const [multiRoleResults, setMultiRoleResults] = useState<MultiRoleResult[]>([]);
  const [loadingMultiRole, setLoadingMultiRole] = useState<boolean>(false);

  // Role Discovery state
  const [discoveredRoles, setDiscoveredRoles] = useState<CareerRecommendation[]>([]);
  const [loadingDiscovery, setLoadingDiscovery] = useState<boolean>(false);
  const [showDiscovery, setShowDiscovery] = useState<boolean>(false);

  // Resume upload & extraction review state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<any[]>([]);
  const [extractedProjects, setExtractedProjects] = useState<any[]>([]);
  const [newSkillInput, setNewSkillInput] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState<string>('');

  // Analysis run state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    api.getRoles().then(r => {
      setRoles(r);
      if (r.length > 0 && !selectedRoleId) {
        setSelectedRoleId(r[0].id);
      }
    }).catch(console.error);
  }, []);

  // Multi-role comparison trigger
  const handleCompareRoles = async () => {
    setIsComparingRoles(true);
    setLoadingMultiRole(true);
    setShowDiscovery(false);
    try {
      const res = await api.evaluateMultipleRoles(userId);
      setMultiRoleResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMultiRole(false);
    }
  };

  // Discover suitable roles
  const handleDiscoverRoles = async () => {
    setShowDiscovery(true);
    setLoadingDiscovery(true);
    setIsComparingRoles(false);
    try {
      const res = await api.discoverCareers(userId);
      setDiscoveredRoles(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDiscovery(false);
    }
  };

  // Upload Resume and extract
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadFile(file);
    setUploading(true);
    try {
      const res = await api.uploadResume(file, userId);
      setResumeId(res.resume_id);
      setExtractedSkills(res.details?.skills || []);
      setExtractedProjects(res.details?.projects || []);
      setStep(3); // Proceed to extraction review screen
    } catch (err: any) {
      setAnalysisError(err.message || 'Error processing resume file.');
    } finally {
      setUploading(false);
    }
  };

  // Remove false positive skill during review
  const handleRemoveSkill = (index: number) => {
    setExtractedSkills(prev => prev.filter((_, i) => i !== index));
  };

  // Add missed skill
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    setExtractedSkills(prev => [
      ...prev,
      {
        name: newSkillInput.trim(),
        raw_term: newSkillInput.trim(),
        normalized_name: newSkillInput.trim(),
        page_number: 1,
        text_snippet: `Candidate added skill: ${newSkillInput.trim()}`
      }
    ]);
    setNewSkillInput('');
  };

  // Confirm extraction & Run Analysis
  const handleConfirmAndRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // 1. If resume review was edited, update on backend
      if (resumeId) {
        await api.updateResumeReview(resumeId, {
          extracted_skills: extractedSkills,
          extracted_projects: extractedProjects
        });
      }

      // 2. Connect GitHub repo if provided
      if (githubUrl.trim()) {
        await api.connectGitHub(userId, githubUrl.trim());
      }

      // 3. Run deterministic assessment for target role
      const assessmentRes = await api.runAssessment(userId, selectedRoleId);

      // 4. Generate grounded roadmap for this role
      await api.generateRoadmap(userId, assessmentRes.role_name);

      // 5. Notify parent & switch view
      onAnalysisCompleted(selectedRoleId, assessmentRes);
    } catch (err: any) {
      setAnalysisError(err.message || 'Analysis generation encountered an error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">New Career Analysis</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluate your evidence against target roles, review detected competencies, and generate an explainable readiness assessment.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className={`px-2.5 py-1 rounded-md ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            1. Target Role
          </div>
          <span className="text-slate-300">→</span>
          <div className={`px-2.5 py-1 rounded-md ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            2. Evidence
          </div>
          <span className="text-slate-300">→</span>
          <div className={`px-2.5 py-1 rounded-md ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            3. Review Claims
          </div>
        </div>
      </div>

      {analysisError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* STEP 1: Role Selection & Comparison */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Step 1: Select Your Target Role</h2>
                <p className="text-xs text-slate-500">Choose a career target to benchmark against or compare multiple targets.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCompareRoles}
                  className="btn-secondary text-xs"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Compare Roles</span>
                </button>
                <button
                  onClick={handleDiscoverRoles}
                  className="btn-secondary text-xs"
                >
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Discover Suitable Roles</span>
                </button>
              </div>
            </div>

            {/* Role Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {roles.map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-600 shadow-xs ring-1 ring-indigo-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{role.domain}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mt-1">{role.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{role.description}</p>
                    </div>

                    <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200/80">
                      <span>{role.competencies?.length || 6} Core Competency Rules</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="btn-primary text-xs"
              >
                <span>Continue to Evidence Input</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Multi-Role Comparison Section if active */}
          {isComparingRoles && (
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Multi-Role Readiness Comparison</h2>
              <p className="text-xs text-slate-500">Benchmarking your current verified evidence across multiple career trajectories.</p>

              {loadingMultiRole ? (
                <div className="py-8 text-center text-xs text-slate-400">Evaluating multi-role matrix...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {multiRoleResults.map((r) => (
                    <div 
                      key={r.role_id}
                      onClick={() => { setSelectedRoleId(r.role_id); setIsComparingRoles(false); }}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900">{r.role_name}</h4>
                        <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {r.overall_readiness_score}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Top Strengths: {r.top_strengths.join(', ') || 'Awaiting evidence'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Role Discovery Section if active */}
          {showDiscovery && (
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Discovered Career Opportunities</h2>
              <p className="text-xs text-slate-500">Roles that best match your demonstrated strengths based on semantic graph overlap.</p>

              {loadingDiscovery ? (
                <div className="py-8 text-center text-xs text-slate-400">Running career matching engine...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {discoveredRoles.map((rec) => (
                    <div 
                      key={rec.role_id}
                      onClick={() => { setSelectedRoleId(rec.role_id); setShowDiscovery(false); }}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900">{rec.role_name}</h4>
                        <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {Math.round(rec.match_percentage)}% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{rec.suitability_rationale}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Evidence Input (Resume Upload / Repository) */}
      {step === 2 && (
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 2: Provide Your Career Evidence</h2>
            <p className="text-xs text-slate-500">Upload your resume and optionally attach your GitHub repository to corroborate claims with code.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume File Upload Box */}
            <div className="p-6 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-all text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Upload Resume (PDF or DOCX)</div>
                <p className="text-xs text-slate-500 mt-0.5">ProofPath will parse text, identify claims, and prepare an editable review.</p>
              </div>
              <input
                type="file"
                id="resume-upload-input"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="resume-upload-input"
                className="btn-primary text-xs inline-flex cursor-pointer"
              >
                {uploading ? 'Extracting Claims...' : 'Select Resume File'}
              </label>
              {uploadFile && (
                <div className="text-xs text-emerald-700 font-semibold mt-2">
                  Selected: {uploadFile.name}
                </div>
              )}
            </div>

            {/* Optional GitHub Repository Box */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <FolderGit2 className="w-4 h-4 text-slate-800" />
                  <span>Connect GitHub Repository (Recommended)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Corroborates resume claims with actual commit history, tests, and deployment files to upgrade skills from Partially Supported to Strongly Supported.
                </p>
                <input
                  type="text"
                  placeholder="https://github.com/username/repo or username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-slate-400">
                  No public repo? You can still analyze using resume claims and take a technical viva later.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="btn-secondary text-xs"
            >
              Back to Role Selection
            </button>
            <button
              onClick={() => setStep(3)}
              className="btn-primary text-xs"
            >
              <span>Skip Upload & Review Current Evidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Extraction Review & Error Correction */}
      {step === 3 && (
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 3: Review & Correct Extracted Claims</h2>
              <p className="text-xs text-slate-500">
                Verify detected competencies before running analysis. Remove extraction errors or add unmentioned skills.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {extractedSkills.length} Claims Identified
            </span>
          </div>

          {/* Add Skill Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add missing skill or technology (e.g., PyTorch, Docker, SQL)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
              className="flex-1 p-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-600"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="btn-secondary text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Editable Skills Grid */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">Extracted Skills:</div>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((s, idx) => (
                <div 
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800"
                >
                  <span className="font-medium">{s.name || s.raw_term || s.normalized_name}</span>
                  {s.page_number && <span className="text-[10px] text-slate-400">p.{s.page_number}</span>}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                    title="Remove extraction"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Projects Preview */}
          {extractedProjects.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-700">Extracted Projects & Experience:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {extractedProjects.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-900">{p.title || 'Extracted Experience'}</div>
                    <div className="text-slate-600 text-[11px]">{p.claimed_impact}</div>
                    {p.technologies && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Tech: {p.technologies.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="btn-secondary text-xs"
            >
              Back to Evidence Input
            </button>
            <button
              onClick={handleConfirmAndRunAnalysis}
              disabled={isAnalyzing}
              className="btn-primary text-xs"
            >
              {isAnalyzing ? (
                <span>Scoring & Generating Roadmap...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm Claims & Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
