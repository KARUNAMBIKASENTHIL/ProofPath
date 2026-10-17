export type EvidenceStatus =
  | 'Strongly supported'
  | 'Supported'
  | 'Partially supported'
  | 'Not yet verified'
  | 'Conflicting evidence'
  | 'Assessment unavailable';

export type SourceStatus =
  | 'Connected'
  | 'Uploaded'
  | 'Partially Accessible'
  | 'Failed'
  | 'User-Provided';

export interface ConnectedSource {
  id: string;
  user_id: string;
  source_type: string;
  name: string;
  url_or_path: string;
  status: SourceStatus;
  last_synced: string;
  metadata?: Record<string, any>;
  error_message?: string;
}

export interface EvidenceRecord {
  id: string;
  user_id: string;
  skill_name: string;
  normalized_skill: string;
  claimed_source: string;
  observed_evidence: string;
  file_path_or_url?: string;
  code_snippet?: string;
  project_id?: string;
  project_name?: string;
  status: EvidenceStatus;
  confidence: number;
  recency: string;
  rules_applied: string[];
  timestamp: string;
}

export interface SkillEvaluation {
  skill_id: string;
  name: string;
  category: string;
  importance_weight: number;
  status: EvidenceStatus;
  coverage_value: number;
  confidence: number;
  evidence_count: number;
  artifacts: Array<{
    source: string;
    observed: string;
    file_path?: string;
    code_snippet?: string;
  }>;
  evaluation_reason: string;
  notes?: string;
  evidence_summary?: string;
  expected_evidence_type?: string;
}

export interface CompetencyRequirement {
  skill_id: string;
  name: string;
  category: string;
  importance_weight: number;
  expected_evidence_type: string;
  description: string;
}

export interface JobRoleDefinition {
  id: string;
  name: string;
  domain: string;
  description: string;
  competencies: CompetencyRequirement[];
  recommended_prerequisites?: string[];
  version?: string;
}

export interface AssessmentScoreBreakdown {
  overall_readiness_score: number;
  demonstrated_coverage: number;
  evidence_completeness: number;
  assessment_confidence: number;
  methodology_version: string;
  role_id: string;
  role_name: string;
  skill_evaluations: SkillEvaluation[];
  positive_contributors: string[];
  missing_evidence: string[];
  formula_explanation: string;
  timestamp: string;
}

export interface ProofGraphNode {
  id: string;
  label: string;
  type: 'student' | 'skill' | 'project' | 'artifact' | 'finding' | 'role';
  status?: string;
  metadata?: Record<string, any>;
}

export interface ProofGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

export interface ProofGraphData {
  nodes: ProofGraphNode[];
  edges: ProofGraphEdge[];
}

export interface ProjectDepthAnalysis {
  id: string;
  user_id: string;
  title: string;
  repo_url?: string;
  problem_definition: string;
  architecture_overview: string;
  technologies_used: string[];
  implementation_depth_score: number;
  test_evidence: {
    has_tests: boolean;
    test_file_count: number;
    test_files: string[];
    assertions_detected: number;
    test_framework: string;
    evaluation_note: string;
  };
  error_handling_evidence: {
    try_catch_blocks: number;
    explicit_http_exceptions: number;
    schema_validations: number;
    has_robust_handling: boolean;
    summary: string;
  };
  documentation_quality: {
    has_readme: boolean;
    readme_characters: number;
    has_setup_instructions: boolean;
    has_architecture_notes: boolean;
    rating: string;
  };
  deployment_evidence: {
    has_deployment: boolean;
    has_dockerfile: boolean;
    has_docker_compose: boolean;
    has_ci_cd_workflow: boolean;
    cloud_configs: string[];
    readiness_summary: string;
  };
  commit_insights: {
    commit_count: number;
    branch_discipline: string;
    frequency: string;
  };
  demonstrated_competencies: string[];
  positive_highlights: string[];
  identified_gaps: string[];
  recommended_improvements: string[];
  is_sandbox_verified: boolean;
  created_at: string;
}

export interface VivaQuestion {
  id: string;
  question_number: number;
  question: string;
  focus_area: string;
  code_reference?: string;
  expected_demonstration: string;
}

export interface VivaEvaluation {
  question_id: string;
  score: number;
  conceptual_soundness: string;
  reasoning_quality: string;
  implementation_consistency: string;
  feedback: string;
}

export interface VivaSession {
  id: string;
  user_id: string;
  project_id: string;
  project_name: string;
  questions: VivaQuestion[];
  answers: Array<{ question_id: string; student_answer: string }>;
  evaluations: VivaEvaluation[];
  overall_viva_score?: number;
  summary_findings?: string;
  status: 'in_progress' | 'completed';
}

export interface RoadmapMilestone {
  id: string;
  step_number: number;
  title: string;
  skill_gap: string;
  why_this_matters: string;
  tasks: string[];
  deliverable: string;
  verification_criteria: string;
  estimated_duration: string;
  source_files: string[];
  status: 'planned' | 'in_progress' | 'completed';
  evidence_submitted?: string;
  reassessed_at?: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  target_role: string;
  starting_point_summary: string;
  verified_strengths: string[];
  not_yet_verified: string[];
  milestones: RoadmapMilestone[];
  first_action: string;
  reassessment_checkpoint: string;
  created_at: string;
  updated_at: string;
}

export interface CareerRecommendation {
  role_id: string;
  role_name: string;
  match_percentage: number;
  suitability_rationale: string;
  demonstrated_competencies: string[];
  missing_competencies: string[];
  recommended_next_step: string;
  alternative_role_rationale?: string;
}

export interface SimulatorOption {
  id: string;
  title: string;
  action_type: string;
  targeted_competencies: string[];
  addresses_gap: string;
  expected_new_evidence: string;
  estimated_effort: string;
  simulated_score_delta: number;
  simulated_new_score: number;
  qualitative_explanation: string;
  comparison_benefit: string;
}

export interface GrowthSnapshot {
  id: string;
  user_id: string;
  date: string;
  readiness_score: number;
  evidence_completeness: number;
  verified_skills_count: number;
  projects_analyzed: number;
  new_competencies: string[];
  notes: string;
}

export interface PlacementCohortAnalytics {
  total_students_assessed: number;
  average_readiness_score: number;
  score_distribution: Record<string, number>;
  top_demonstrated_skills: Array<{ skill: string; demonstrated_percent: number; status: string }>;
  common_skill_gaps: Array<{ skill: string; missing_percent: number; impact: string }>;
  role_distribution: Array<{ role: string; student_count: number; avg_readiness: number }>;
  recommended_cohort_trainings: Array<{
    session_title: string;
    target_gap: string;
    recommended_timing: string;
    expected_cohort_score_boost: string;
    prerequisites: string;
  }>;
  cohort_learning_priorities: string[];
}

export interface HistoricalEvent {
  id: string;
  user_id: string;
  event_type: 'resume_uploaded' | 'analysis_run' | 'profile_synced' | 'milestone_completed' | 'readiness_reassessed';
  title: string;
  description: string;
  date: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AnalysisRecord {
  id: string;
  user_id: string;
  timestamp: string;
  date: string;
  resume_version?: string;
  sources_available: string[];
  target_role: string;
  target_role_name: string;
  stage_label?: string;
  initial_score?: number | null;
  updated_score?: number | null;
  overall_readiness_score: number;
  previous_score?: number | null;
  score_delta?: number | null;
  category_breakdown: Record<string, number>;
  supported_skills_count: number;
  partially_supported_count: number;
  not_yet_verified_count: number;
  conflicting_count?: number;
  skill_evaluations: any[];
  projects_referenced: string[];
  consistency_summary: string;
  observation_window: string;
  recommendations: string[];
  roadmap_version: string;
  methodology_version: string;
}

export interface ReportComparison {
  report_a_id: string;
  report_b_id: string;
  date_a: string;
  date_b: string;
  role_name: string;
  score_a: number;
  score_b: number;
  score_diff: number;
  what_improved: string[];
  what_stayed_the_same: string[];
  new_evidence_appeared: string[];
  remaining_gaps: string[];
  completed_recommendations: string[];
  scoring_methodology_notes: string;
}

export interface DailyActivity {
  date: string;
  commit_count: number;
  submission_count: number;
  events_count: number;
  total_activities: number;
}

export interface ActivityConsistencySummary {
  user_id: string;
  observation_period: string;
  start_date: string;
  end_date: string;
  total_active_days: number;
  total_observed_events: number;
  consistency_percentage: number;
  maintenance_pattern: string;
  daily_breakdown: DailyActivity[];
  limitations_disclosure: string;
}

export interface MultiRoleResult {
  role_id: string;
  role_name: string;
  domain: string;
  overall_readiness_score: number;
  demonstrated_coverage: number;
  evidence_completeness: number;
  supported_skills_count: number;
  top_strengths: string[];
  key_gaps: string[];
}

export interface AtsResumeData {
  id: string;
  user_id: string;
  target_role: string;
  created_at: string;
  contact: {
    full_name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    github: string;
    leetcode: string;
    linkedin: string;
  };
  summary: string;
  skills: Record<string, string[]>;
  problem_solving: {
    platform: string;
    username: string;
    profile_url: string;
    total_solved: number;
    easy: number;
    medium: number;
    hard: number;
    ranking: number;
    acceptance_rate: string;
    bullets: string[];
  };
  projects: Array<{
    name: string;
    repo_name?: string;
    repo_url?: string;
    technologies: string[];
    bullets: string[];
  }>;
  experience: Array<{
    role: string;
    organization: string;
    duration: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    grade: string;
    coursework?: string;
  }>;
  ats_score: {
    overall_score: number;
    format_score: number;
    keyword_match_score: number;
    action_verb_score: number;
    metrics_density_score: number;
    strengths: string[];
    ats_checks: Array<{
      name: string;
      status: string;
      detail: string;
    }>;
  };
  plain_text_ats?: string;
  extracted_profiles?: {
    github?: { url: string; repos_found: number; top_languages: string[] };
    leetcode?: { url: string; solved: number; rank: number };
    linkedin?: { url: string };
  };
}

export interface VerifiedSkillProof {
  skill_name: string;
  status: string;
  evidence_snippet: string;
  source_ref: string;
  project_name: string;
  rag_standard: string;
}

export interface UnverifiedClaim {
  skill_name: string;
  resume_claim: string;
  proof_status: string;
  explanation: string;
  severity: string;
}

export interface LaggingArea {
  skill_name: string;
  deficit_type: string;
  severity: string;
  observed_gap: string;
  rag_standard: string;
}

export interface PlacementCandidateAuditReport {
  report_id: string;
  candidate_id?: string;
  candidate_name: string;
  candidate_email?: string;
  target_job_title: string;
  github_url?: string;
  job_description: string;
  overall_readiness_score: number;
  keyword_match_score: number;
  gap_differential: number;
  summary_headline: string;
  placement_verdict: string;
  placement_recommendation: string;
  total_jd_competencies: number;
  verified_skills_count: number;
  lagging_skills_count: number;
  verified_skills: VerifiedSkillProof[];
  unverified_claims: UnverifiedClaim[];
  lagging_areas: LaggingArea[];
  prescribed_bootcamp_modules: string[];
  generated_at: string;
}

export interface PlacementStudentCandidate {
  id: string;
  full_name: string;
  email: string;
  target_role: string;
  degree: string;
  github_url?: string;
  has_resume: boolean;
  resume_filename?: string;
  verified_skills: string[];
  known_gaps: string[];
}


