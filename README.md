# ProofPath — Evidence-Based Career Intelligence & Personalized Roadmap Platform

> **"Your skills. Your proof. Your next step."**

ProofPath is a full-stack career intelligence platform that consolidates student career evidence, evaluates job readiness using explainable deterministic scoring, tracks historical progress across interactive calendar snapshots, and generates personalized learning roadmaps grounded in Retrieval-Augmented Generation (RAG).

Unlike keyword-matching resume scanners or generic LLM chatbots, ProofPath audits tangible code repositories, verified commit patterns, deployment artifacts, automated test assertions, and confirmed resume claims.

---

## 1. System Architecture

```
                       ┌───────────────────────────────────────────┐
                       │           ProofPath Web Client            │
                       │   React 19 + TypeScript + Tailwind CSS    │
                       └─────────────────────┬─────────────────────┘
                                             │ HTTP / REST / JSON
                                             ▼
                       ┌───────────────────────────────────────────┐
                       │          ProofPath FastAPI Backend        │
                       │     Python 3.13 + Pydantic v2 Engine      │
                       └─────┬───────────────┬───────────────┬─────┘
                             │               │               │
        ┌────────────────────┴──┐     ┌──────┴──────┐   ┌────┴─────────────────┐
        ▼                       ▼     ▼             ▼   ▼                      ▼
┌───────────────┐       ┌─────────────┐     ┌───────────────┐       ┌──────────────────────┐
│ Deterministic │       │ RAG Engine  │     │ Evidence &    │       │ Dual Storage Layer   │
│ Scoring Engine│       │ (Chroma /   │     │ Extraction    │       │ • MongoDB Atlas      │
│ Score Formula │       │ MiniLM-L6)  │     │ (PyPDF/Regex) │       │ • Robust Local Store │
└───────────────┘       └─────────────┘     └───────────────┘       └──────────────────────┘
```

---

## 2. Core Modules & Navigation Pages

1. **Dashboard**
   - Latest job-readiness score and selected target role.
   - Previous score and change since previous comparable assessment.
   - Explainable score breakdown with documented formula rationales.
   - Number of skills supported by evidence, partially supported, and not yet verified.
   - Connected profile status and last sync time.
   - Active roadmap milestones and upcoming weekly tasks.
   - Activity consistency summary over a selectable time range.
   - Honest empty states for new user onboarding with step-by-step guidance.

2. **Unified Career Profile**
   - Consolidates Resume PDF/DOCX, GitHub repositories, commits, LeetCode profiles, and LinkedIn.
   - Connection statuses, last updated times, and access limitation disclosures.
   - Interactive Evidence Graph (ProofGraph) linking candidate claims to concrete artifacts.
   - Optional Project Viva module to prove conceptual mastery through interactive code questioning.

3. **New Analysis Workflow**
   - Target role selection from configurable catalog.
   - Multi-role comparison using the same career evidence simultaneously.
   - "Discover Suitable Roles" based on semantic graph overlap.
   - Resume upload or selection of previous versions.
   - **Pre-Analysis Claim Review Screen**: Edit, verify, or remove detected claims before scoring.

4. **Analysis History & Calendar**
   - Interactive monthly Calendar view highlighting dates of resume uploads, analyses, profile syncs, and milestone completions.
   - Clicking any date filters and reveals the saved events and records for that day.
   - Preserved historical analysis snapshots.
   - **Report Comparison Tool**: Side-by-side comparison between any two reports explaining:
     - What improved (+% readiness delta)
     - What stayed the same
     - What new evidence appeared
     - Which gaps remain
     - Which recommendations were completed
     - Scoring methodology notes

5. **Skill Gap Analysis**
   - Role requirements benchmarking against candidate evidence.
   - Categorized skills breakdown: Strongly Supported, Supported, Partially Supported, Not Yet Verified.
   - Ranked gaps by importance weights and prerequisite relationships.
   - Detailed rationales explaining why each gap matters and what evidence would bridge it.

6. **Learning Roadmap (RAG-Powered)**
   - Grounded in local Markdown knowledge base (`CareerLens_RAG_Knowledge_Base/`).
   - Starting-point summary, verified strengths, and pending competency gaps.
   - Ordered milestones with weekly actionable steps, expected deliverables, and completion criteria.
   - Task tracking across 5 states: *Not Started*, *In Progress*, *Completed*, *Evidence Submitted*, *Needs Review*.
   - Proof attachment & instant milestone reassessment.

7. **Activity & Longitudinal Progress**
   - Measures observable consistency using dated evidence over 30, 60, 90, 180, or 365 days.
   - Daily activity distribution heatmap.
   - Project maintenance and improvement patterns.
   - **Honest Limitations Disclosure**: Clearly distinguishes observed public activity from actual total activity; private work is never penalized.

8. **Settings & Connected Sources**
   - User profile settings (Name, Degree, Graduation Year).
   - Third-party platform authorization credentials (GitHub Personal Access Tokens, LeetCode, LinkedIn).
   - RAG Knowledge Base indexing status and manual re-index trigger.

9. **Placement Directorate (Role-Gated)**
   - Cohort readiness analytics, score distributions, and institutional training recommendations.

---

## 3. Explainable Deterministic Scoring Formula

ProofPath avoids opaque black-box LLM score predictions. The Job-Readiness Score is calculated deterministically:

$$\text{Readiness Score} = 100 \times \frac{\sum (\text{Importance Weight}_i \times \text{Evidence Coverage}_i)}{\sum \text{Applicable Weights}}$$

Where:
- **Strongly Supported (Coverage = 1.0)**: Corroborated by runnable repository code, multi-stage Dockerfiles, or passing unit test assertions.
- **Supported (Coverage = 0.8)**: Corroborated by verified project experience or viva evaluation.
- **Partially Supported (Coverage = 0.4)**: Corroborated by resume text claims without live repository verification.
- **Not Yet Verified (Coverage = 0.0)**: Missing primary source evidence.

---

## 4. Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API docs will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --port 5173
```
Access the application at `http://127.0.0.1:5173/`.

### 3. Demo Credentials
Reviewers can immediately test the pre-loaded student or placement director accounts with a single click:
- **Student Candidate Demo**: `alex.chen@proofpath.io` / `password123`
- **Placement Director Demo**: `placement@proofpath.io` / `placement123`

Or click **Create Account** to register a brand-new student account with 100% genuine evidence and 0 mock data.

---

## 5. Security & Privacy Principles
- API keys and tokens are stored in environment variables.
- Resume uploads are validated and processed in safe sandbox directories.
- Third-party integrations respect external API rate limits and authorized scopes.
- Private candidate records are protected with authenticated token ownership checks.
