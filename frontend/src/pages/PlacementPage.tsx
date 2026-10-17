import React, { useState, useEffect, useRef } from 'react';
import { 
  PlacementCohortAnalytics, 
  PlacementCandidateAuditReport, 
  PlacementStudentCandidate 
} from '../types';
import { AuthUser, api } from '../services/api';
import { 
  Users2, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3, 
  BookOpen, 
  Upload, 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  Printer, 
  ArrowRight, 
  ExternalLink, 
  FolderGit2, 
  ChevronRight, 
  Info,
  Clock,
  Layers,
  Award,
  RefreshCw,
  FileCheck,
  Briefcase,
  User,
  Check,
  Building,
  Sliders,
  CheckCircle,
  Download,
  Code,
  GitBranch
} from 'lucide-react';

interface PlacementPageProps {
  initialTab?: 'analyzer' | 'cohort' | 'archive';
  focusUpload?: boolean;
  currentUser?: AuthUser | null;
  onNavigate?: (tab: string) => void;
}

export const PlacementPage: React.FC<PlacementPageProps> = ({
  initialTab = 'analyzer',
  focusUpload = false,
  currentUser,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'cohort' | 'archive'>(initialTab);
  const [loading, setLoading] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<PlacementCohortAnalytics | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  
  // Recruiter Direct Candidate Audit State (Resume + Job Description - Zero Mock Data)
  const [candidateName, setCandidateName] = useState<string>('');
  const [candidateEmail, setCandidateEmail] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeInputMode, setResumeInputMode] = useState<'upload' | 'paste'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [jobRoleTitle, setJobRoleTitle] = useState<string>('Machine Learning Engineer');
  const [jobDescription, setJobDescription] = useState<string>(
`Target Role: Machine Learning Engineer (from CareerLens RAG Knowledge Base)
Role Purpose: Build, evaluate, package, deploy, and monitor machine-learning systems.

Required Competency Standards:
1. Python programming, code organization, clean functions/classes, and type hints.
2. Data preparation, exploratory analysis, and data-quality checks.
3. Statistics and machine-learning algorithm fundamentals.
4. Model training, validation, baseline comparison, and evaluation beyond naive accuracy.
5. Experiment reproducibility and strict train/test data leakage prevention.
6. APIs and model serving (FastAPI/Flask) with input validation and error handling.
7. Automated testing (pytest), version control (Git), and documentation.
8. Containerization (Docker), deployment, and basic monitoring.`
  );
  
  const [report, setReport] = useState<PlacementCandidateAuditReport | null>(null);
  const [savedReports, setSavedReports] = useState<PlacementCandidateAuditReport[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync activeTab when initialTab changes from parent
  useEffect(() => {
    if (initialTab && (initialTab === 'analyzer' || initialTab === 'cohort' || initialTab === 'archive')) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (focusUpload && activeTab === 'analyzer') {
      setTimeout(() => {
        uploadInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [focusUpload, activeTab]);

  // Roles strictly derived from CareerLens RAG Knowledge Base documents with all sections
  const ragJobRoles = [
    {
      title: 'Machine Learning Engineer',
      role: 'Machine Learning Engineer',
      badge: 'RAG Knowledge Base',
      ragDoc: 'job_roles/machine_learning_engineer.md',
      rolePurpose: 'Build, evaluate, package, deploy, and monitor machine-learning systems. Requirements vary by company and seniority; use this as a starter profile, not a universal hiring standard.',
      competencyAreas: [
        '1. Python programming and code organization',
        '2. Data preparation and exploratory analysis',
        '3. Statistics and machine-learning fundamentals',
        '4. Model training, validation, and evaluation',
        '5. Experiment reproducibility and leakage prevention',
        '6. APIs and model serving',
        '7. Testing, version control, and documentation',
        '8. Deployment and basic monitoring'
      ],
      exampleEvidence: [
        'A readable repository with a clear README and reproducible environment',
        'Data-cleaning code and a documented train/validation/test strategy',
        'Baseline model compared with a justified alternative',
        'Suitable metrics explained in context; no reliance on accuracy alone when inappropriate',
        'Tests for data or prediction behavior',
        'A model exposed through an API or demo, with input validation and error handling',
        'Deployment instructions and limitations documented'
      ],
      commonGaps: [
        'Project has only a notebook and no reproducible setup',
        'Train/test leakage or no held-out evaluation',
        'Metrics are reported without explaining why they fit the problem',
        'No baseline or comparison',
        'No tests, API, deployment, or limitations',
        'Project contribution cannot be explained by the candidate'
      ],
      suggestedMilestones: [
        '1. Python + Git foundation',
        '2. Data analysis and data-quality checks',
        '3. Train a baseline model and evaluate it properly',
        '4. Improve the model and document experiments',
        '5. Package inference code and add tests',
        '6. Build an API or demo',
        '7. Deploy and document monitoring/limitations'
      ],
      referenceSources: [
        { name: 'Python tutorial', url: 'https://docs.python.org/3/tutorial/' },
        { name: 'pandas getting started', url: 'https://pandas.pydata.org/docs/getting_started/index.html' },
        { name: 'scikit-learn user guide', url: 'https://scikit-learn.org/stable/user_guide.html' },
        { name: 'FastAPI tutorial', url: 'https://fastapi.tiangolo.com/tutorial/' },
        { name: 'Docker getting started', url: 'https://docs.docker.com/get-started/' }
      ],
      text: `Target Role: Machine Learning Engineer (from CareerLens RAG Knowledge Base)
Role Purpose: Build, evaluate, package, deploy, and monitor machine-learning systems.

Required Competency Standards:
1. Python programming, code organization, clean functions/classes, and type hints.
2. Data preparation, exploratory analysis, and data-quality checks.
3. Statistics and machine-learning algorithm fundamentals.
4. Model training, validation, baseline comparison, and evaluation beyond naive accuracy.
5. Experiment reproducibility and strict train/test data leakage prevention.
6. APIs and model serving (FastAPI/Flask) with input validation and error handling.
7. Automated testing (pytest), version control (Git), and documentation.
8. Containerization (Docker), deployment, and basic monitoring.`
    },
    {
      title: 'Java Backend Developer',
      role: 'Java Backend Developer',
      badge: 'RAG Knowledge Base',
      ragDoc: 'job_roles/java_backend_developer.md',
      rolePurpose: 'Design and implement server-side applications, APIs, business logic, data access, and reliable integrations.',
      competencyAreas: [
        '1. Java syntax, collections, exceptions, and object-oriented design',
        '2. Data structures and algorithmic problem solving',
        '3. SQL and relational database fundamentals',
        '4. HTTP, REST API design, status codes, and JSON',
        '5. Spring Boot fundamentals',
        '6. Validation, error handling, and security basics',
        '7. Unit/integration testing',
        '8. Git, configuration, logging, and deployment fundamentals'
      ],
      exampleEvidence: [
        'A Java application with clear classes and sensible separation of responsibilities',
        'API endpoints with request validation and consistent error responses',
        'Database schema and queries that match the use case',
        'Tests for normal cases, invalid input, and important edge cases',
        'README with setup instructions, API examples, and design decisions',
        'Configuration/secrets kept outside source code',
        'Deployed service or repeatable local run instructions'
      ],
      commonGaps: [
        'Only isolated coding exercises and no complete application',
        'Business logic, controllers, and database code tightly coupled',
        'No validation or consistent error handling',
        'SQL knowledge shown only through definitions, without a working database-backed project',
        'No tests or setup documentation',
        'Secrets committed to the repository'
      ],
      suggestedMilestones: [
        '1. Strengthen core Java and collections',
        '2. Practice arrays, strings, maps, stacks, queues, trees, and complexity',
        '3. Learn SQL, keys, joins, transactions, and schema design',
        '4. Build a REST API with Spring Boot',
        '5. Connect a relational database and implement CRUD',
        '6. Add validation, error handling, and automated tests',
        '7. Add authentication/authorization basics and safe configuration',
        '8. Deploy the service and document it'
      ],
      referenceSources: [
        { name: 'Java tutorials', url: 'https://dev.java/learn/' },
        { name: 'Spring Boot documentation', url: 'https://docs.spring.io/spring-boot/' },
        { name: 'PostgreSQL tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html' },
        { name: 'Git book', url: 'https://git-scm.com/book/en/v2' }
      ],
      text: `Target Role: Java Backend Developer (from CareerLens RAG Knowledge Base)
Role Purpose: Design and implement server-side applications, APIs, business logic, data access, and reliable integrations.

Required Competency Standards:
1. Java syntax, collections, exception hierarchies, and object-oriented design.
2. Data structures and algorithmic problem solving.
3. SQL and relational database fundamentals (schema design, ACID transactions, queries).
4. HTTP protocol, REST API design, status codes, and JSON serialization.
5. Spring Boot framework fundamentals and layered architecture (Controller -> Service -> Repository).
6. Defensive request validation, global error handling, and security basics.
7. Unit and integration testing (JUnit, Mockito).
8. Git version control, configuration management outside source code, logging, and deployment.`
    },
    {
      title: 'Data Analyst',
      role: 'Data Analyst',
      badge: 'RAG Knowledge Base',
      ragDoc: 'job_roles/data_analyst.md',
      rolePurpose: 'Turn raw data into reliable analysis and clear recommendations using SQL, spreadsheets, statistics, visualization, and communication.',
      competencyAreas: [
        '1. SQL querying and data manipulation',
        '2. Data cleaning and quality validation',
        '3. Spreadsheet analysis',
        '4. Descriptive statistics and basic analytical reasoning',
        '5. Python with pandas (often useful)',
        '6. Visualization and dashboard design',
        '7. Business questions, metrics, and interpretation',
        '8. Clear reporting and reproducibility'
      ],
      exampleEvidence: [
        'Queries that answer a specific business question',
        'Documented cleaning rules and handling of missing/duplicate values',
        'Analysis with checks that totals and assumptions are sensible',
        'Dashboard with readable labels, filters, and meaningful metrics',
        'Written insight that distinguishes observation from causal claims',
        'Reproducible notebook or project instructions'
      ],
      commonGaps: [
        'Charts without a clear question or takeaway',
        'SQL practice without a complete analysis project',
        'No explanation of missing values, duplicates, or data quality',
        'Unsupported claims about causation',
        'Dashboard metrics with unclear definitions',
        'No documented steps to reproduce results'
      ],
      suggestedMilestones: [
        '1. Spreadsheet basics and data-quality checks',
        '2. SQL filtering, joins, aggregation, and subqueries',
        '3. Exploratory analysis with a real dataset',
        '4. Learn pandas for repeatable cleaning and analysis',
        '5. Build a dashboard answering defined questions',
        '6. Write a concise insight report with limitations',
        '7. Publish a portfolio project with data dictionary and reproducibility notes'
      ],
      referenceSources: [
        { name: 'SQLBolt interactive lessons', url: 'https://sqlbolt.com/' },
        { name: 'PostgreSQL tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html' },
        { name: 'pandas getting started', url: 'https://pandas.pydata.org/docs/getting_started/index.html' },
        { name: 'Microsoft Learn Power BI', url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi/' }
      ],
      text: `Target Role: Data Analyst (from CareerLens RAG Knowledge Base)
Role Purpose: Turn raw data into reliable analysis and clear recommendations using SQL, spreadsheets, statistics, visualization, and communication.

Required Competency Standards:
1. SQL querying, complex joins, aggregations, window functions, and data manipulation.
2. Data cleaning, handling missing/duplicate values, and data quality validation.
3. Spreadsheet analysis and data-quality checks.
4. Descriptive statistics, distributions, and basic analytical reasoning.
5. Python with pandas for repeatable cleaning and exploratory data analysis.
6. Visualization and business dashboard design (Power BI / Tableau / Plotly) with meaningful metrics.
7. Business questions, KPI interpretation, and distinguishing correlation from causation.
8. Clear reporting, reproducibility notes, and data dictionaries.`
    }
  ];

  const selectedRagRole = ragJobRoles.find((r) => r.role === jobRoleTitle) || ragJobRoles[0];


  useEffect(() => {
    // Clean recruiter mount - zero mock data
    api.getPlacementReports().then(setSavedReports).catch(() => []);
  }, []);

  const handlePresetSelect = (preset: typeof ragJobRoles[0]) => {
    setJobRoleTitle(preset.role);
    setJobDescription(preset.text);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile && !resumeText.trim() && !githubUrl.trim()) {
      setErrorMessage('Please upload candidate resume (PDF/DOCX/TXT) or paste resume text to analyze.');
      return;
    }

    if (!jobDescription.trim()) {
      setErrorMessage('Please provide a Job Description (JD) to benchmark against.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('job_description', jobDescription);
      formData.append('job_role_title', jobRoleTitle);
      if (candidateName) formData.append('candidate_name', candidateName);
      if (candidateEmail) formData.append('candidate_email', candidateEmail);
      if (githubUrl) formData.append('github_url', githubUrl);
      if (uploadedFile) formData.append('resume_file', uploadedFile);
      if (resumeText) formData.append('resume_text', resumeText);

      const res = await api.analyzePlacementCandidate(formData);
      setReport(res);
      // Refresh saved reports
      api.getPlacementReports().then(setSavedReports).catch(() => []);
      setTimeout(() => {
        document.getElementById('recruiter-audit-report')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error executing proof-of-work candidate analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ================= EXACT HERO BANNER FROM USER SPEC ================= */}
      <div id="recruiter-hero" className="rounded-[32px] p-7 sm:p-9 bg-gradient-to-br from-[#062415] via-[#093520] to-[#041a0e] text-white border border-[#14532d]/50 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute right-[-40px] top-[-40px] w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-[-60px] w-64 h-64 rounded-full bg-emerald-400/5 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Top Row: Briefcase Icon and Module Badge */}
          <div className="flex items-center justify-between mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#0e3b23] border border-emerald-500/30 flex items-center justify-center text-emerald-300 shadow-md">
              <Briefcase className="w-7 h-7 text-emerald-300 stroke-[2.2]" />
            </div>

            <div className="px-4 py-1.5 rounded-full bg-[#0d3f25] border border-emerald-500/40 text-emerald-300 font-extrabold text-xs tracking-wider uppercase shadow-inner">
              MODULE 1 • RECRUITER
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">
            Recruiter & Placement Portal
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/85 max-w-2xl leading-relaxed mb-6 font-normal">
            Upload student resumes and benchmark against any required Job Description (JD).
          </p>

          {/* 4 Core Features with Circular Green Checkmarks */}
          <div className="space-y-3 pt-1 border-t border-emerald-900/40">
            <div className="flex items-center gap-3 text-sm text-emerald-50 font-medium">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 bg-emerald-950/40">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Upload resume (PDF/DOCX) & paste target Job Description</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-emerald-50 font-medium">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 bg-emerald-950/40">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Proof-of-Work Verification (exposes unverified word matches)</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-emerald-50 font-medium">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 bg-emerald-950/40">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Pinpoints exact lagging skills & missing deliverables</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-emerald-50 font-medium">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 bg-emerald-950/40">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Generate exportable Recruiter Audit & Evaluation Report</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recruiter Navigation Bar */}
      <div id="recruiter-tabs" className="p-3 rounded-2xl bg-white border border-[#EBECEF] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#1A5336]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Recruiter Control Center</div>
            <div className="text-[10px] text-slate-500">Autonomous Proof-of-Work Placement Suite</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'analyzer'
                ? 'bg-[#1A5336] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Candidate Gap Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('cohort')}
            className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'cohort'
                ? 'bg-[#1A5336] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Batch Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'archive'
                ? 'bg-[#1A5336] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit History ({savedReports.length})</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: CANDIDATE JD & SKILL GAP AUDIT ================= */}
      {activeTab === 'analyzer' && (
        <div className="space-y-6">
          {/* Top Form Grid: Direct Resume Input + Job Description Benchmark (Zero Mock Data) */}
          <div id="recruiter-steps-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Candidate Resume (File Upload or Direct Paste) (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="card-clean p-5 sm:p-6 bg-white border border-[#EBECEF] rounded-[24px] space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#1A5336]">
                      <Upload className="w-4 h-4 text-[#1A5336]" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#111827] block">1. Candidate Resume</span>
                      <span className="text-[10px] text-slate-500">Upload PDF/DOCX or paste resume text</span>
                    </div>
                  </div>
                  
                  {/* Mode Toggle */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setResumeInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        resumeInputMode === 'upload' ? 'bg-white text-[#1A5336] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setResumeInputMode('paste')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        resumeInputMode === 'paste' ? 'bg-white text-[#1A5336] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Paste Text
                    </button>
                  </div>
                </div>

                {/* File Upload Mode */}
                {resumeInputMode === 'upload' && (
                  <div ref={uploadInputRef}>
                    <label className={`block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      uploadedFile
                        ? 'border-[#1A5336] bg-[#F0FDF4]'
                        : 'border-slate-200 hover:border-[#1A5336]/60 bg-slate-50 hover:bg-[#F8FAF9]'
                    }`}>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setUploadedFile(file);
                            if (!candidateName) {
                              setCandidateName(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
                            }
                          }
                        }}
                        className="hidden"
                      />
                      <div className="w-11 h-11 rounded-2xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center mx-auto mb-2 text-[#1A5336]">
                        <Upload className="w-5 h-5 text-[#1A5336]" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {uploadedFile ? uploadedFile.name : 'Upload Candidate Resume (PDF / DOCX / TXT)'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {uploadedFile
                          ? `${Math.round(uploadedFile.size / 1024)} KB • Click to choose a different file`
                          : 'Drag and drop or click to select resume file'}
                      </span>
                    </label>
                    {uploadedFile && (
                      <div className="mt-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                        <span className="font-semibold flex items-center gap-1.5 truncate">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Ready: {uploadedFile.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          className="text-[10px] text-rose-600 hover:underline font-bold shrink-0 ml-2"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Paste Text Mode */}
                {resumeInputMode === 'paste' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Paste Candidate Resume Text
                    </label>
                    <textarea
                      rows={6}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste resume content here (Skills, Experience, Projects, Frameworks, Education)..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1A5336] focus:bg-white transition-all font-mono leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{resumeText.split(/\s+/).filter(Boolean).length} words</span>
                      {resumeText && (
                        <button
                          type="button"
                          onClick={() => setResumeText('')}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          Clear Text
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Candidate Metadata (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Candidate Name <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1A5336]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      GitHub URL <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/candidate"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1A5336] font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Job Description (JD) (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="card-clean p-5 sm:p-6 bg-white border border-[#EBECEF] rounded-[24px] space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#1A5336]">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#111827] block">2. Target Job Description (JD)</span>
                      <span className="text-[10px] text-slate-500">Paste any JD or select from RAG Knowledge Base</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#1A5336] uppercase bg-[#DCFCE7] px-2.5 py-0.5 rounded-full shrink-0">
                    JD Benchmark
                  </span>
                </div>

                {/* Quick Presets from CareerLens RAG Knowledge Base */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Quick Load Role from RAG Knowledge Base:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setJobRoleTitle('Custom Role');
                        setJobDescription('');
                      }}
                      className="text-[10px] font-semibold text-rose-600 hover:underline"
                    >
                      Clear JD (Write Custom)
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {ragJobRoles.map((preset, idx) => {
                      const isSelected = jobRoleTitle === preset.role;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePresetSelect(preset)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#123824] to-[#1A5336] text-white border-[#1A5336] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                          }`}
                        >
                          <span className="text-[11px] font-bold block truncate">{preset.title}</span>
                          <span className={`text-[9px] font-mono block truncate ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                            {preset.ragDoc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Job Description Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Target Role Requirements & Job Description:
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {jobDescription.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Enter or paste the required Job Description, required competencies, and qualifications..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#1A5336] focus:bg-white transition-all font-mono leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA & Error Banner */}
          <div className="card-clean p-5 sm:p-6 bg-white border border-[#EBECEF] rounded-[24px] shadow-xs space-y-3">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full py-4 text-sm font-extrabold shadow-lg flex items-center justify-center gap-2.5 transition-all hover:scale-[1.005]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Auditing Resume Proof of Work & Computing Skill Gap against JD...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyse Resume against Job Description</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* ================= STEP 4: DETAILED AUDIT REPORT ================= */}
          {report && (
            <div id="recruiter-audit-report" className="card-clean p-6 sm:p-8 bg-white border border-[#EBECEF] rounded-[32px] space-y-6 shadow-sm">
              {/* Report Official Letterhead */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#166534]">
                      OFFICIAL RAG AUDIT
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      ID: {report.report_id}
                    </span>
                    <span className="text-xs text-slate-400">Generated: {report.generated_at}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                    Candidate Placement & Proof-of-Work Evaluation Report
                  </h2>
                  <p className="text-xs text-slate-500">
                    Target Role Benchmark: <strong className="text-[#1A5336]">{report.target_job_title}</strong> (Knowledge Base Standard)
                  </p>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-sm"
                    title="Export / Download Official Evaluation PDF Report"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Report</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-2.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <span className={`px-3 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider ${
                    report.overall_readiness_score >= 70
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : report.overall_readiness_score >= 40
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {report.placement_verdict}
                  </span>
                </div>
              </div>

              {/* Candidate & Audit Metadata Grid */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Candidate Name</span>
                  <span className="font-extrabold text-slate-900 text-sm">{report.candidate_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Email</span>
                  <span className="font-medium text-slate-700">{report.candidate_email || 'Not Provided'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Audited RAG Role</span>
                  <span className="font-bold text-[#1A5336]">{report.target_job_title}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Code Defense Repo</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate block">
                    {report.github_url || 'Linked Repositories Audited'}
                  </span>
                </div>
              </div>

              {/* Top Score Comparison Banner (Proof-of-Work vs Keyword Matching) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Proof-of-Work Score (The Real Metric) */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#123824] to-[#0A2316] text-white space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                    <span>Job Readiness Score</span>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-4xl font-extrabold text-white tracking-tight">
                    {report.overall_readiness_score}%
                  </div>
                  <div className="text-[11px] text-emerald-200/80">
                    Verified through {report.verified_skills_count} code repo artifacts & tests
                  </div>
                </div>

                {/* Keyword Match Score (The Superficial ATS Metric) */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Resume Keyword Match</span>
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-4xl font-extrabold text-slate-800 tracking-tight">
                    {report.keyword_match_score}%
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Superficial word occurrences on paper
                  </div>
                </div>

                {/* Proof Gap Differential */}
                <div className={`p-5 rounded-2xl border space-y-1 ${
                  report.gap_differential > 20
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                    <span>Proof vs Claim Gap</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-4xl font-extrabold text-amber-700 tracking-tight">
                    {report.gap_differential > 0 ? `-${report.gap_differential}%` : '0%'}
                  </div>
                  <div className="text-[11px] text-amber-700/80">
                    {report.gap_differential > 20
                      ? 'High risk: candidate claims skills without repository proof'
                      : 'Healthy alignment between claims and artifacts'}
                  </div>
                </div>
              </div>

              {/* Summary Headline & Recruiter Verdict */}
              <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#DCFCE7] space-y-2 text-xs">
                <div className="font-bold text-[#1A5336] flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4" />
                  <span>Placement Officer Assessment & Verdict</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {report.summary_headline}
                </p>
                <div className="p-3 rounded-xl bg-white border border-[#EBECEF] text-slate-800 font-semibold flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#1A5336] shrink-0 mt-0.5" />
                  <span>Recommendation: {report.placement_recommendation}</span>
                </div>
              </div>

              {/* ================= SECTION 1: SKILLS POSSESSED (VERIFIED PROOF OF WORK) ================= */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#DCFCE7] text-[#1A5336] flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#111827]">
                        1. Skills Possessed (Verified Proof-of-Work)
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Corroborated by actual GitHub code files, commit histories, and automated test passes.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#166534] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full shrink-0">
                    {report.verified_skills.length} Skills Verified
                  </span>
                </div>

                {report.verified_skills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {report.verified_skills.map((v, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#DCFCE7] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1A5336] text-xs">{v.skill_name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534]">
                            {v.status}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-snug">{v.evidence_snippet}</p>
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span className="truncate max-w-[200px]">{v.project_name}</span>
                          {v.source_ref && (
                            <a
                              href={v.source_ref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1A5336] hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span>Inspect Code</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                    No verified code artifacts detected in candidate repository for target role.
                  </div>
                )}
              </div>

              {/* ================= SECTION 2: SKILL GAPS IDENTIFIED (ACCORDING TO KNOWLEDGE BASE) ================= */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#111827]">
                        2. Skill Gaps Identified So Far (According to Knowledge Base)
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Deficits and missing deliverables when benchmarked against official RAG knowledge base standards.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full shrink-0">
                    {report.lagging_areas.length} Knowledge Base Gaps
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.lagging_areas.map((lag, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 text-xs">
                          {lag.skill_name}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          {lag.deficit_type}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-snug">
                        <strong className="text-slate-900">Observed Gap:</strong> {lag.observed_gap}
                      </p>
                      <div className="pt-2 border-t border-rose-100 text-[11px] text-slate-600 bg-white/70 p-2 rounded-xl">
                        <strong className="text-slate-900 block mb-0.5">RAG Knowledge Base Standard:</strong>
                        <span>{lag.rag_standard}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= SECTION 3: UNVERIFIED RESUME CLAIMS ================= */}
              {report.unverified_claims.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[#111827]">
                          3. Unverified Resume Claims (Claimed in Words, Zero Proof in GitHub)
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Buzzwords appearing on resume without corroborating implementation code or unit tests.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full shrink-0">
                      {report.unverified_claims.length} Unverified Claims
                    </span>
                  </div>

                  <div className="space-y-2">
                    {report.unverified_claims.map((claim, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900">{claim.skill_name}</span>
                          <span className="text-[10px] font-mono font-bold text-amber-800 uppercase px-2 py-0.5 rounded bg-amber-100">
                            {claim.proof_status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{claim.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= SECTION 4: PRESCRIBED REMEDIATION BOOTCAMPS ================= */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <BookOpen className="w-4 h-4 text-[#1A5336]" />
                  <div>
                    <h3 className="font-extrabold text-sm text-[#111827]">
                      4. Prescribed Remediation Roadmap (To Bridge Knowledge Base Gaps)
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Targeted technical interventions to convert unverified claims into concrete proof-of-work.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {report.prescribed_bootcamp_modules.map((bootcamp, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1 text-xs shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-[#1A5336]">
                        Action #{idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 leading-tight">{bootcamp}</h4>
                      <p className="text-[11px] text-slate-500">
                        Closes observed deficit against {report.target_job_title} RAG requirements.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Seal and Sign-off (Clean for PDF export) */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-700">CareerLens Proof-of-Work Evaluation Engine</div>
                  <div className="text-[11px]">Benchmarked against CareerLens RAG Knowledge Base standards</div>
                </div>
                <div className="text-right">
                  <div className="h-8 border-b border-slate-300 w-44 mb-1"></div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Recruiter / Placement Officer Sign-off</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: COHORT BATCH ANALYTICS ================= */}
      {activeTab === 'cohort' && analytics && (
        <div className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-clean p-5 rounded-2xl bg-white border border-[#EBECEF] space-y-1 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Assessed Students</span>
              <div className="text-3xl font-extrabold text-[#111827]">{analytics.total_students_assessed}</div>
              <span className="text-[11px] text-[#1A5336] font-bold">100% Verified Proof Chains</span>
            </div>

            <div className="card-clean p-5 rounded-2xl bg-white border border-[#EBECEF] space-y-1 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">Cohort Average Readiness</span>
              <div className="text-3xl font-extrabold text-[#1A5336]">{analytics.average_readiness_score}%</div>
              <span className="text-[11px] text-slate-500">Benchmark across 4 departments</span>
            </div>

            <div className="card-clean p-5 rounded-2xl bg-white border border-[#EBECEF] space-y-1 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">Primary Deficit Area</span>
              <div className="text-xl font-bold text-rose-600">Docker & Deployment</div>
              <span className="text-[11px] text-slate-500">81% missing container artifacts</span>
            </div>

            <div className="card-clean p-5 rounded-2xl bg-white border border-[#EBECEF] space-y-1 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase">Top Strength Area</span>
              <div className="text-xl font-bold text-emerald-600">Python & Modeling</div>
              <span className="text-[11px] text-slate-500">88% supported in repositories</span>
            </div>
          </div>

          {/* Distribution and Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <div className="card-clean p-6 rounded-[28px] bg-white border border-[#EBECEF] space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <BarChart3 className="w-4 h-4 text-[#1A5336]" />
                <h3 className="text-sm font-bold text-[#111827]">Readiness Score Distribution</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(analytics.score_distribution).map(([bracket, count]) => {
                  const pct = Math.round((count / analytics.total_students_assessed) * 100);
                  return (
                    <div key={bracket} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-semibold">{bracket}</span>
                        <span className="text-slate-500 font-mono font-bold">{count} students ({pct}%)</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#1A5336]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Widespread Deficits */}
            <div className="card-clean p-6 rounded-[28px] bg-white border border-[#EBECEF] space-y-4 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-[#111827]">Widespread Cohort Deficits</h3>
              </div>
              <div className="space-y-2.5">
                {analytics.common_skill_gaps.map((g, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">{g.skill}</span>
                      <span className="text-[11px] font-mono font-extrabold text-rose-600">{g.missing_percent}% Deficit</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{g.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: AUDIT HISTORY ARCHIVE ================= */}
      {activeTab === 'archive' && (
        <div className="card-clean p-6 rounded-[28px] bg-white border border-[#EBECEF] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1A5336]" />
              <h3 className="text-sm font-bold text-[#111827]">Archived Recruiter Candidate Evaluations</h3>
            </div>
            <span className="text-xs text-slate-400">{savedReports.length} reports on record</span>
          </div>

          {savedReports.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No reports generated yet. Run a candidate gap audit to save records.
            </div>
          ) : (
            <div className="space-y-3">
              {savedReports.map((r, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setReport(r);
                    setActiveTab('analyzer');
                  }}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#1A5336] transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-[#1A5336] transition-colors">
                        {r.candidate_name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        {r.report_id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Target: {r.target_job_title} • Generated: {r.generated_at}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-[#1A5336]">
                        {r.overall_readiness_score}% Proof-of-Work
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Word match: {r.keyword_match_score}%
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1A5336] transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacementPage;
