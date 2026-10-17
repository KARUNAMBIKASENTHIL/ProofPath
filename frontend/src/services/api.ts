import {
  AssessmentScoreBreakdown,
  ConnectedSource,
  EvidenceRecord,
  ProofGraphData,
  ProjectDepthAnalysis,
  VivaSession,
  Roadmap,
  CareerRecommendation,
  SimulatorOption,
  GrowthSnapshot,
  PlacementCohortAnalytics,
  HistoricalEvent,
  AnalysisRecord,
  ReportComparison,
  ActivityConsistencySummary,
  MultiRoleResult,
  AtsResumeData,
  PlacementCandidateAuditReport,
  PlacementStudentCandidate
} from '../types';

const API_BASE = '/api';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'placement_officer' | 'recruiter' | 'admin';
  degree?: string;
  institution?: string;
  graduation_year?: number;
  target_role?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  summary?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('careerlens_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
    degree?: string;
    graduation_year?: number;
    target_role?: string;
  }): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed.');
    }
    const result: AuthResponse = await res.json();
    localStorage.setItem('careerlens_token', result.access_token);
    localStorage.setItem('careerlens_user', JSON.stringify(result.user));
    return result;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Invalid email or password.');
    }
    const result: AuthResponse = await res.json();
    localStorage.setItem('careerlens_token', result.access_token);
    localStorage.setItem('careerlens_user', JSON.stringify(result.user));
    return result;
  },

  getCurrentUser: async (): Promise<AuthUser | null> => {
    const token = localStorage.getItem('careerlens_token');
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        localStorage.removeItem('careerlens_token');
        localStorage.removeItem('careerlens_user');
        return null;
      }
      return res.json();
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('careerlens_token');
    localStorage.removeItem('careerlens_user');
  },

  getSavedUser: (): AuthUser | null => {
    const raw = localStorage.getItem('careerlens_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  updateUserProfile: async (userId: string, data: Partial<AuthUser>): Promise<AuthUser> => {
    let res = await fetch(`${API_BASE}/auth/profile/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to update user profile.');
      }
    }
    const updated: AuthUser = await res.json();
    const saved = api.getSavedUser();
    if (saved) {
      localStorage.setItem('careerlens_user', JSON.stringify({ ...saved, ...updated }));
    }
    return updated;
  },

  trackLogin: async (userId: string, actionLabel: string = 'Platform Login') => {
    try {
      await fetch(`${API_BASE}/activity/track-login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: userId, action_label: actionLabel }),
      });
    } catch {}
  },

  // Roles
  getRoles: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/roles`);
    return res.json();
  },

  // Assessment & Scoring
  getLatestAssessment: async (userId: string, roleId = 'mle'): Promise<AssessmentScoreBreakdown> => {
    const res = await fetch(`${API_BASE}/assessments/latest?user_id=${encodeURIComponent(userId)}&role_id=${roleId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to fetch assessment (${res.status})`);
    }
    return res.json();
  },

  runAssessment: async (userId: string, roleId = 'mle', vivaScore?: number): Promise<AssessmentScoreBreakdown> => {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, role_id: roleId, viva_score: vivaScore }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Failed to compute assessment (${res.status})`);
    }
    return res.json();
  },

  getEvidence: async (userId: string): Promise<EvidenceRecord[]> => {
    const res = await fetch(`${API_BASE}/assessments/evidence?user_id=${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  reassessWithMilestone: async (userId: string, milestoneId = 'ms-1', evidencePayload = {}) => {
    const res = await fetch(`${API_BASE}/assessments/reassess-with-milestone`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        user_id: userId,
        milestone_id: milestoneId,
        evidence_payload: evidencePayload
      }),
    });
    return res.json();
  },

  // Sources
  getSources: async (userId: string): Promise<ConnectedSource[]> => {
    const res = await fetch(`${API_BASE}/sources?user_id=${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  connectSource: async (data: { user_id: string; source_type: string; name: string; url_or_path: string; metadata?: any }) => {
    const res = await fetch(`${API_BASE}/sources/connect`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  connectGitHub: async (userId: string, repoUrl: string) => {
    return api.connectSource({
      user_id: userId,
      source_type: 'github',
      name: 'GitHub Repository',
      url_or_path: repoUrl,
      metadata: { repository: repoUrl }
    });
  },

  connectOtherSource: async (userId: string, sourceType: string, name: string, url: string) => {
    return api.connectSource({
      user_id: userId,
      source_type: sourceType,
      name: name,
      url_or_path: url
    });
  },

  // Resume Upload
  uploadResume: async (file: File, userId: string) => {
    const token = localStorage.getItem('careerlens_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      let errDetail = 'Resume upload and parsing failed.';
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errDetail;
      } catch {
        const text = await res.text().catch(() => '');
        errDetail = text || `Server error (${res.status})`;
      }
      throw new Error(errDetail);
    }
    return res.json();
  },

  // ProofGraph
  getProofGraph: async (userId: string, roleId = 'mle'): Promise<ProofGraphData> => {
    const res = await fetch(`${API_BASE}/proof-graph?user_id=${encodeURIComponent(userId)}&role_id=${roleId}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Project Depth Intelligence
  getProjects: async (userId: string): Promise<ProjectDepthAnalysis[]> => {
    const res = await fetch(`${API_BASE}/projects?user_id=${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  analyzeProject: async (data: { user_id: string; title: string; repo_url?: string; files: Record<string, string> }) => {
    const res = await fetch(`${API_BASE}/projects/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  createProject: async (data: {
    user_id: string;
    title: string;
    technologies_used: string[];
    problem_definition: string;
    architecture_overview?: string;
    repo_url?: string;
  }): Promise<ProjectDepthAnalysis> => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Technical Project Viva
  getVivaSessions: async (userId: string, projectId?: string): Promise<VivaSession[]> => {
    let url = `${API_BASE}/viva/sessions?user_id=${encodeURIComponent(userId)}`;
    if (projectId) url += `&project_id=${encodeURIComponent(projectId)}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  startVivaSession: async (userId: string, projectId?: string): Promise<VivaSession> => {
    const res = await fetch(`${API_BASE}/viva/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, project_id: projectId }),
    });
    return res.json();
  },

  submitVivaAnswer: async (sessionId: string, questionId: string, studentAnswer: string): Promise<VivaSession> => {
    const res = await fetch(`${API_BASE}/viva/sessions/${sessionId}/answer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question_id: questionId, student_answer: studentAnswer }),
    });
    return res.json();
  },

  // RAG Personalized Roadmaps
  getCurrentRoadmap: async (userId: string, targetRole = 'Machine Learning Engineer'): Promise<Roadmap> => {
    const res = await fetch(`${API_BASE}/roadmaps/current?user_id=${encodeURIComponent(userId)}&target_role=${encodeURIComponent(targetRole)}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  generateRoadmap: async (userId: string, targetRole = 'Machine Learning Engineer'): Promise<Roadmap> => {
    const res = await fetch(`${API_BASE}/roadmaps/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, target_role: targetRole }),
    });
    return res.json();
  },

  updateMilestone: async (roadmapId: string, milestoneId: string, status: string, evidenceSubmitted?: string) => {
    const res = await fetch(`${API_BASE}/roadmaps/${roadmapId}/milestones/${milestoneId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, evidence_submitted: evidenceSubmitted }),
    });
    return res.json();
  },

  // Career What-If Simulator
  getSimulatorOptions: async (userId: string, targetRoleId = 'mle', currentScore = 0.0): Promise<SimulatorOption[]> => {
    const res = await fetch(`${API_BASE}/simulator/compare`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, target_role_id: targetRoleId, current_score: currentScore }),
    });
    return res.json();
  },

  // Discover My Career
  discoverCareers: async (userId: string): Promise<CareerRecommendation[]> => {
    const res = await fetch(`${API_BASE}/career/discover`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId }),
    });
    return res.json();
  },

  // GrowthDNA Tracking
  getGrowthHistory: async (userId: string): Promise<GrowthSnapshot[]> => {
    const res = await fetch(`${API_BASE}/growth/history?user_id=${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Placement Team Intelligence
  getPlacementAnalytics: async (batchYear = 2026, roleFilter = 'all'): Promise<PlacementCohortAnalytics> => {
    const res = await fetch(`${API_BASE}/placement/analytics?batch_year=${batchYear}&role_filter=${roleFilter}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getPlacementStudents: async (): Promise<PlacementStudentCandidate[]> => {
    const res = await fetch(`${API_BASE}/placement/students`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  extractGithubCandidate: async (github_url: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/placement/extract-github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ github_url })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to extract candidate GitHub projects.');
    }
    return res.json();
  },

  analyzePlacementCandidate: async (formData: FormData): Promise<PlacementCandidateAuditReport> => {
    const token = localStorage.getItem('careerlens_token');
    const res = await fetch(`${API_BASE}/placement/analyze-candidate`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to analyze candidate against Job Description.');
    }
    return res.json();
  },

  getPlacementReports: async (): Promise<PlacementCandidateAuditReport[]> => {
    const res = await fetch(`${API_BASE}/placement/reports`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getPlacementReport: async (reportId: string): Promise<PlacementCandidateAuditReport> => {
    const res = await fetch(`${API_BASE}/placement/reports/${encodeURIComponent(reportId)}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Report not found');
    return res.json();
  },

  // History, Calendar & Comparison
  getHistoricalEvents: async (userId: string): Promise<HistoricalEvent[]> => {
    const res = await fetch(`${API_BASE}/history/events?user_id=${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getAnalysisReports: async (userId: string, roleId?: string): Promise<AnalysisRecord[]> => {
    const url = roleId 
      ? `${API_BASE}/history/reports?user_id=${encodeURIComponent(userId)}&role_id=${encodeURIComponent(roleId)}`
      : `${API_BASE}/history/reports?user_id=${encodeURIComponent(userId)}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  },

  getAnalysisReportById: async (reportId: string): Promise<AnalysisRecord> => {
    const res = await fetch(`${API_BASE}/history/reports/${encodeURIComponent(reportId)}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  compareReports: async (userId: string, reportIdA: string, reportIdB: string): Promise<ReportComparison> => {
    const res = await fetch(`${API_BASE}/history/compare`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, report_id_a: reportIdA, report_id_b: reportIdB })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Report comparison failed.');
    }
    return res.json();
  },

  // Activity Consistency Analysis
  getActivityConsistency: async (userId: string, rangeDays: number = 90): Promise<ActivityConsistencySummary> => {
    const res = await fetch(`${API_BASE}/activity/consistency?user_id=${encodeURIComponent(userId)}&range_days=${rangeDays}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Multi-Role Evaluation
  evaluateMultipleRoles: async (userId: string, roleIds?: string[]): Promise<MultiRoleResult[]> => {
    const res = await fetch(`${API_BASE}/assessments/multi-role`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, role_ids: roleIds })
    });
    return res.json();
  },

  // Resume extraction & review
  getUserResumes: async (userId: string) => {
    const res = await fetch(`${API_BASE}/resumes/user/${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getResumeDetails: async (resumeId: string) => {
    const res = await fetch(`${API_BASE}/resumes/${encodeURIComponent(resumeId)}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  updateResumeReview: async (resumeId: string, payload: any) => {
    const res = await fetch(`${API_BASE}/resumes/${encodeURIComponent(resumeId)}/review`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // MCP Tools
  getMCPTools: async () => {
    const res = await fetch(`${API_BASE}/mcp/tools`);
    return res.json();
  },

  callMCPTool: async (name: string, args: Record<string, any> = {}) => {
    const res = await fetch(`${API_BASE}/mcp/tools/call`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, arguments: args }),
    });
    return res.json();
  },

  // 1-Click Profile Extraction & ATS Resume Builder
  buildAtsResume: async (data: {
    user_id: string;
    github_url: string;
    leetcode_url: string;
    linkedin_url: string;
    full_name?: string;
    email?: string;
    phone?: string;
    target_role?: string;
  }): Promise<AtsResumeData> => {
    const res = await fetch(`${API_BASE}/resumes/instant-build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to extract profiles and build ATS resume.');
    }
    return res.json();
  },

  getLatestAtsResume: async (userId: string): Promise<AtsResumeData | null> => {
    const res = await fetch(`${API_BASE}/resumes/latest-ats/${userId}`);
    if (!res.ok) return null;
    return res.json();
  },

  saveAtsResume: async (resumeId: string, data: Partial<AtsResumeData>): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/resumes/save-ats/${resumeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save customized ATS resume.');
    return res.json();
  }
};

