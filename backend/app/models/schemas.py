from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class EvidenceStatus(str, Enum):
    STRONGLY_SUPPORTED = "Strongly supported"
    SUPPORTED = "Supported"
    PARTIALLY_SUPPORTED = "Partially supported"
    NOT_YET_VERIFIED = "Not yet verified"
    CONFLICTING_EVIDENCE = "Conflicting evidence"
    ASSESSMENT_UNAVAILABLE = "Assessment unavailable"

class SourceStatus(str, Enum):
    CONNECTED = "Connected"
    UPLOADED = "Uploaded"
    AUTO_EXTRACTED = "Auto-Extracted"
    CONNECTED_AUTO_EXTRACTED = "Connected (Auto-Extracted)"
    PARTIALLY_ACCESSIBLE = "Partially Accessible"
    FAILED = "Failed"
    USER_PROVIDED = "User-Provided"

class SourceType(str, Enum):
    RESUME = "resume"
    GITHUB = "github"
    LEETCODE = "leetcode"
    LINKEDIN = "linkedin"
    PORTFOLIO = "portfolio"
    BEHANCE = "behance"
    CERTIFICATE = "certificate"
    MANUAL_PROJECT = "manual_project"
    PLATFORM = "platform"
    OTHER = "other"

class UserRole(str, Enum):
    STUDENT = "student"
    PLACEMENT_OFFICER = "placement_officer"
    RECRUITER = "recruiter"
    ADMIN = "admin"

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class HistoricalEventType(str, Enum):
    RESUME_UPLOADED = "resume_uploaded"
    ANALYSIS_RUN = "analysis_run"
    PROFILE_SYNCED = "profile_synced"
    MILESTONE_COMPLETED = "milestone_completed"
    READINESS_REASSESSED = "readiness_reassessed"

class HistoricalEvent(BaseModel):
    id: str
    user_id: str
    event_type: HistoricalEventType
    title: str
    description: str
    date: str  # YYYY-MM-DD
    timestamp: str  # ISO string
    metadata: Dict[str, Any] = {}

class AnalysisRecord(BaseModel):
    id: str
    user_id: str
    timestamp: str
    date: str
    assessment_stage: str = "STAGE_A_INITIAL_RESUME"  # STAGE_A_INITIAL_RESUME | STAGE_B_EVIDENCE_ENHANCED
    stage_label: str = "Initial Resume-Based Assessment"
    resume_version: Optional[str] = None
    sources_available: List[str] = []
    target_role: str
    target_role_name: str
    overall_readiness_score: float
    initial_score: Optional[float] = None
    updated_score: Optional[float] = None
    previous_score: Optional[float] = None
    score_delta: Optional[float] = None
    delta_explanation: Optional[str] = None
    category_breakdown: Dict[str, float] = {}
    supported_skills_count: int
    partially_supported_count: int
    not_yet_verified_count: int
    conflicting_count: int = 0
    skill_evaluations: List[Dict[str, Any]] = []
    projects_referenced: List[str] = []
    consistency_summary: str = "Active observation window"
    observation_window: str = "Last 90 days"
    recommendations: List[str] = []
    roadmap_version: str = "v1.0"
    methodology_version: str = "v1.2.0-deterministic"

class ReportComparison(BaseModel):
    report_a_id: str
    report_b_id: str
    date_a: str
    date_b: str
    role_name: str
    score_a: float
    score_b: float
    score_diff: float
    what_improved: List[str]
    what_stayed_the_same: List[str]
    new_evidence_appeared: List[str]
    remaining_gaps: List[str]
    completed_recommendations: List[str]
    scoring_methodology_notes: str

class DailyActivity(BaseModel):
    date: str
    commit_count: int = 0
    submission_count: int = 0
    events_count: int = 0
    total_activities: int = 0

class ActivityConsistencySummary(BaseModel):
    user_id: str
    observation_period: str
    start_date: str
    end_date: str
    total_active_days: int
    total_observed_events: int
    consistency_percentage: float
    maintenance_pattern: str
    daily_breakdown: List[DailyActivity] = []
    limitations_disclosure: str

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: UserRole = UserRole.STUDENT
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    target_role: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    target_role: Optional[str] = None
    degree: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[int] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    degree: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[int] = None
    target_role: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None
    preferred_domains: List[str] = []
    created_at: Optional[str] = None

class ConnectedSource(BaseModel):
    id: str
    user_id: str
    source_type: str = "other"
    name: str
    url_or_path: str
    status: SourceStatus
    last_synced: str
    metadata: Dict[str, Any] = {}
    error_message: Optional[str] = None

class EvidenceRecord(BaseModel):
    id: str
    user_id: str
    skill_name: str
    normalized_skill: str
    claimed_source: str
    observed_evidence: str
    file_path_or_url: Optional[str] = None
    code_snippet: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    status: EvidenceStatus
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    recency: str = "Current"
    rules_applied: List[str] = []
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ProjectDepthAnalysis(BaseModel):
    id: str
    user_id: str
    title: str
    repo_url: Optional[str] = None
    problem_definition: str
    architecture_overview: str
    technologies_used: List[str]
    implementation_depth_score: float = Field(ge=0.0, le=100.0)
    test_evidence: Dict[str, Any]
    error_handling_evidence: Dict[str, Any]
    documentation_quality: Dict[str, Any]
    deployment_evidence: Dict[str, Any]
    commit_insights: Dict[str, Any]
    demonstrated_competencies: List[str]
    positive_highlights: List[str]
    identified_gaps: List[str]
    recommended_improvements: List[str]
    is_sandbox_verified: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class ProofGraphNode(BaseModel):
    id: str
    label: str
    type: str  # student | skill | project | artifact | finding | role
    status: Optional[str] = None
    metadata: Dict[str, Any] = {}

class ProofGraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship: str  # claims | implements | evidenced_by | evaluated_as | qualifies_for

class ProofGraphData(BaseModel):
    nodes: List[ProofGraphNode]
    edges: List[ProofGraphEdge]

class CompetencyRequirement(BaseModel):
    skill_id: str
    name: str
    category: str
    importance_weight: float  # e.g. 0.9, 0.8
    expected_evidence_type: str
    description: str

class JobRoleDefinition(BaseModel):
    id: str
    name: str
    domain: str
    description: str
    competencies: List[CompetencyRequirement]
    recommended_prerequisites: List[str] = []
    version: str = "1.0"

class AssessmentScoreBreakdown(BaseModel):
    overall_readiness_score: float
    demonstrated_coverage: float
    evidence_completeness: float
    assessment_confidence: float
    methodology_version: str = "v1.2.0-deterministic"
    role_id: str
    role_name: str
    skill_evaluations: List[Dict[str, Any]]
    positive_contributors: List[str]
    missing_evidence: List[str]
    formula_explanation: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class VivaQuestion(BaseModel):
    id: str
    question_number: int
    question: str
    focus_area: str
    code_reference: Optional[str] = None
    expected_demonstration: str

class VivaAnswerSubmit(BaseModel):
    question_id: str
    student_answer: str

class VivaEvaluation(BaseModel):
    question_id: str
    score: float
    conceptual_soundness: str
    reasoning_quality: str
    implementation_consistency: str
    feedback: str

class VivaSession(BaseModel):
    id: str
    user_id: str
    project_id: str
    project_name: str
    questions: List[VivaQuestion]
    answers: List[Dict[str, str]] = []
    evaluations: List[VivaEvaluation] = []
    overall_viva_score: Optional[float] = None
    summary_findings: Optional[str] = None
    status: str = "in_progress"  # in_progress | completed
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class RoadmapMilestone(BaseModel):
    id: str
    step_number: int
    title: str
    skill_gap: str
    why_this_matters: str
    tasks: List[str]
    deliverable: str
    verification_criteria: str
    estimated_duration: str
    source_files: List[str] = []
    status: str = "planned"  # planned | in_progress | completed
    evidence_submitted: Optional[str] = None
    reassessed_at: Optional[str] = None

class Roadmap(BaseModel):
    id: str
    user_id: str
    target_role: str
    starting_point_summary: str
    verified_strengths: List[str]
    not_yet_verified: List[str]
    milestones: List[RoadmapMilestone]
    first_action: str
    reassessment_checkpoint: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class CareerRecommendation(BaseModel):
    role_id: str
    role_name: str
    match_percentage: float
    suitability_rationale: str
    demonstrated_competencies: List[str]
    missing_competencies: List[str]
    recommended_next_step: str
    alternative_role_rationale: Optional[str] = None

class SimulatorOption(BaseModel):
    id: str
    title: str
    action_type: str
    targeted_competencies: List[str]
    addresses_gap: str
    expected_new_evidence: str
    estimated_effort: str
    simulated_score_delta: float
    simulated_new_score: float
    qualitative_explanation: str
    comparison_benefit: str

class GrowthSnapshot(BaseModel):
    id: str
    user_id: str
    date: str
    readiness_score: float
    evidence_completeness: float
    verified_skills_count: int
    projects_analyzed: int
    new_competencies: List[str]
    notes: str

class PlacementCohortAnalytics(BaseModel):
    total_students_assessed: int
    average_readiness_score: float
    score_distribution: Dict[str, int]
    top_demonstrated_skills: List[Dict[str, Any]]
    common_skill_gaps: List[Dict[str, Any]]
    role_distribution: List[Dict[str, Any]]
    recommended_cohort_trainings: List[Dict[str, Any]]
    cohort_learning_priorities: List[str]
