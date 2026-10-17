import uuid
from typing import Dict, Any, List
from app.models.schemas import (
    EvidenceRecord,
    EvidenceStatus,
    ConnectedSource,
    SourceType,
    SourceStatus,
    ProjectDepthAnalysis,
    GrowthSnapshot
)

def get_demo_student_alex_chen() -> Dict[str, Any]:
    """
    Demo Profile 1: Alex Chen - Machine Learning Engineer Aspirant.
    Initial state: Strong modeling and API, but critical deployment gap (No Docker/K8s).
    """
    user_id = "demo-alex-chen"
    
    sources = [
        ConnectedSource(
            id="src-1",
            user_id=user_id,
            source_type=SourceType.RESUME,
            name="Alex_Chen_ML_Resume_2026.pdf",
            url_or_path="uploads/Alex_Chen_ML_Resume_2026.pdf",
            status=SourceStatus.UPLOADED,
            last_synced="2026-05-10T10:00:00Z",
            metadata={"pages": 2, "extracted_skills_count": 8}
        ),
        ConnectedSource(
            id="src-2",
            user_id=user_id,
            source_type=SourceType.GITHUB,
            name="github.com/alexchen-ml (Authorized)",
            url_or_path="https://github.com/alexchen-ml",
            status=SourceStatus.CONNECTED,
            last_synced="2026-05-10T10:05:00Z",
            metadata={"repos_inspected": 2, "total_commits": 42}
        ),
        ConnectedSource(
            id="src-3",
            user_id=user_id,
            source_type=SourceType.LEETCODE,
            name="leetcode.com/alexchen_dev",
            url_or_path="https://leetcode.com/alexchen_dev",
            status=SourceStatus.CONNECTED,
            last_synced="2026-05-09T18:00:00Z",
            metadata={"problems_solved": 142, "medium": 88, "hard": 14}
        )
    ]

    project_depth = ProjectDepthAnalysis(
        id="proj-alex-1",
        user_id=user_id,
        title="Diabetes Risk Prediction Service",
        repo_url="https://github.com/alexchen-ml/diabetes-prediction-service",
        problem_definition="Predictive healthcare classifier identifying high-risk type-2 diabetes markers from diagnostic tabular data.",
        architecture_overview="Modular Service Layout: data preprocessing pipeline, scikit-learn model artifacts, FastAPI async REST router.",
        technologies_used=["Python", "scikit-learn", "FastAPI", "pandas", "pytest"],
        implementation_depth_score=68.5,
        test_evidence={
            "has_tests": True,
            "test_file_count": 2,
            "test_files": ["tests/test_api.py", "tests/test_pipeline.py"],
            "assertions_detected": 8,
            "test_framework": "pytest",
            "evaluation_note": "Verified 8 passing unit assertions covering null imputations and HTTP 422 boundary codes."
        },
        error_handling_evidence={
            "try_catch_blocks": 4,
            "explicit_http_exceptions": 3,
            "schema_validations": 2,
            "has_robust_handling": True,
            "summary": "Pydantic validation for glucose/BMI boundaries; returns structured error details."
        },
        documentation_quality={
            "has_readme": True,
            "readme_characters": 1840,
            "has_setup_instructions": True,
            "has_architecture_notes": True,
            "rating": "Comprehensive"
        },
        deployment_evidence={
            "has_deployment": False,
            "has_dockerfile": False,
            "has_docker_compose": False,
            "has_ci_cd_workflow": False,
            "cloud_configs": [],
            "readiness_summary": "NO DEPLOYMENT ARTIFACTS: Missing Dockerfile, container configs, and production CI/CD."
        },
        commit_insights={
            "commit_count": 34,
            "branch_discipline": "main + feature/api-routes",
            "frequency": "Consistent weekly contributions over 2 months"
        },
        demonstrated_competencies=["Python", "Machine Learning Algorithms & Training", "Model Evaluation & Leakage Prevention", "Model Serving & REST APIs", "Automated Testing & Code Quality"],
        positive_highlights=[
            "Scikit-learn model trained with rigorous 5-fold cross-validation and hyperparameter search.",
            "FastAPI async endpoint with typed Pydantic request/response contracts.",
            "Pytest test suite verifying preprocessing logic and status code responses."
        ],
        identified_gaps=[
            "CRITICAL GAP: No Dockerfile or containerization configuration present.",
            "No cloud deployment URL or live hosted demo verified.",
            "No automated CI/CD pipeline (e.g. GitHub Actions) to run tests automatically."
        ],
        recommended_improvements=[
            "Create a multi-stage Dockerfile packaging the FastAPI application and serialized pickle model.",
            "Add GitHub Actions workflow to run pytest automatically on every push.",
            "Expose a /health and /metrics endpoint to demonstrate production observability."
        ],
        is_sandbox_verified=True
    )

    project_depth_2 = ProjectDepthAnalysis(
        id="proj-alex-2",
        user_id=user_id,
        title="Medical Imaging CNN Diagnostic Pipeline",
        repo_url="https://github.com/alexchen-ml/medical-imaging-cnn",
        problem_definition="Deep learning vision pipeline classifying chest X-ray and CT scans for pulmonary abnormalities with Grad-CAM explainability.",
        architecture_overview="PyTorch Convolutional Architecture: ResNet-50 backbone, custom classification head, Grad-CAM visualization hook, FastAPI batch inference service with ONNX runtime.",
        technologies_used=["Python", "PyTorch", "TorchVision", "OpenCV", "FastAPI", "Docker", "pytest"],
        implementation_depth_score=78.0,
        test_evidence={
            "has_tests": True,
            "test_file_count": 3,
            "test_files": ["tests/test_model.py", "tests/test_preprocessing.py", "tests/test_api.py"],
            "assertions_detected": 14,
            "test_framework": "pytest",
            "evaluation_note": "Verified 14 assertions testing tensor dimension contracts, image normalization, and zero-division guardrails."
        },
        error_handling_evidence={
            "try_catch_blocks": 5,
            "explicit_http_exceptions": 4,
            "schema_validations": 3,
            "has_robust_handling": True,
            "summary": "Handles corrupted DICOM/JPEG files, GPU CUDA out-of-memory fallback to CPU, and invalid aspect ratios."
        },
        documentation_quality={
            "has_readme": True,
            "readme_characters": 2450,
            "has_setup_instructions": True,
            "has_architecture_notes": True,
            "rating": "Production-Grade"
        },
        deployment_evidence={
            "has_deployment": True,
            "has_dockerfile": True,
            "has_docker_compose": True,
            "has_ci_cd_workflow": True,
            "cloud_configs": ["Dockerfile", "docker-compose.yml"],
            "readiness_summary": "Dockerized container with multi-stage build; GitHub Actions workflow for automated test execution."
        },
        commit_insights={
            "commit_count": 52,
            "branch_discipline": "main + release/v1.0",
            "frequency": "Active weekly development"
        },
        demonstrated_competencies=["Python", "Deep Learning & Computer Vision", "PyTorch", "Containerization & Deployment", "Model Serving & REST APIs"],
        positive_highlights=[
            "Full PyTorch vision model with transfer learning and Grad-CAM visual heatmaps.",
            "Containerized with Docker multi-stage build and automated test runner.",
            "Pytest coverage of tensor shapes and input image sanitation."
        ],
        identified_gaps=[],
        recommended_improvements=["Integrate model quantization (INT8) for edge deployment latency optimization."],
        is_sandbox_verified=True
    )

    evidence_records = [
        EvidenceRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            skill_name="Python Programming",
            normalized_skill="python",
            claimed_source="Resume & GitHub Repo",
            observed_evidence="Idiomatic Python functions, list comprehensions, type hints, and PEP8 structure across 7 repository files.",
            file_path_or_url="https://github.com/alexchen-ml/diabetes-prediction-service/blob/main/app/main.py",
            code_snippet="from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel, Field\n\nclass PatientData(BaseModel):\n    glucose: float = Field(..., gt=0, lt=500)",
            project_id=project_depth.id,
            project_name=project_depth.title,
            status=EvidenceStatus.STRONGLY_SUPPORTED,
            confidence=0.98,
            rules_applied=["RULE_STRONG_SUPPORT: Demonstrated across multiple repository source files and unit tests."]
        ),
        EvidenceRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            skill_name="Machine Learning Algorithms & Training",
            normalized_skill="ml_modeling",
            claimed_source="GitHub Repository",
            observed_evidence="Trained Random Forest and Gradient Boosting classifiers; compared cross-validated ROC-AUC scores.",
            file_path_or_url="https://github.com/alexchen-ml/diabetes-prediction-service/blob/main/src/train_model.py",
            code_snippet="clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)\nscores = cross_val_score(clf, X_train, y_train, cv=5, scoring='roc_auc')",
            project_id=project_depth.id,
            project_name=project_depth.title,
            status=EvidenceStatus.STRONGLY_SUPPORTED,
            confidence=0.95,
            rules_applied=["RULE_STRONG_SUPPORT: Full training script with parameter tuning and cross-validation."]
        ),
        EvidenceRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            skill_name="Model Evaluation & Leakage Prevention",
            normalized_skill="model_evaluation",
            claimed_source="GitHub Repository",
            observed_evidence="StandardScaler fit strictly inside train fold; confusion matrix and ROC-AUC curves calculated on held-out test split.",
            file_path_or_url="https://github.com/alexchen-ml/diabetes-prediction-service/blob/main/src/evaluate.py",
            code_snippet="pipeline = Pipeline([('scaler', StandardScaler()), ('model', clf)])\npipeline.fit(X_train, y_train)",
            project_id=project_depth.id,
            project_name=project_depth.title,
            status=EvidenceStatus.SUPPORTED,
            confidence=0.90,
            rules_applied=["RULE_SUPPORTED: Observable leakage prevention via Scikit-Learn Pipeline."]
        ),
        EvidenceRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            skill_name="Model Serving & REST APIs",
            normalized_skill="api_development",
            claimed_source="GitHub Repository",
            observed_evidence="FastAPI asynchronous endpoints accepting POST /predict with loaded serialized pipeline.",
            file_path_or_url="https://github.com/alexchen-ml/diabetes-prediction-service/blob/main/app/routes/predict.py",
            code_snippet="@router.post('/predict', response_model=PredictionResponse)\nasync def predict_risk(data: PatientData):\n    risk = model.predict_proba([features])[0][1]",
            project_id=project_depth.id,
            project_name=project_depth.title,
            status=EvidenceStatus.SUPPORTED,
            confidence=0.88,
            rules_applied=["RULE_SUPPORTED: Functional REST API serving predictions."]
        ),
        EvidenceRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            skill_name="Automated Testing & Code Quality",
            normalized_skill="testing",
            claimed_source="GitHub Repository",
            observed_evidence="Pytest suite with 8 tests for data preprocessing and API error handling.",
            file_path_or_url="https://github.com/alexchen-ml/diabetes-prediction-service/blob/main/tests/test_api.py",
            code_snippet="def test_invalid_glucose_returns_422(client):\n    res = client.post('/predict', json={'glucose': -10})\n    assert res.status_code == 422",
            project_id=project_depth.id,
            project_name=project_depth.title,
            status=EvidenceStatus.SUPPORTED,
            confidence=0.85,
            rules_applied=["RULE_SUPPORTED: Pytest assertions testing boundary failure conditions."]
        ),
        EvidenceRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            skill_name="Containerization & Deployment",
            normalized_skill="deployment",
            claimed_source="Resume Claim Only",
            observed_evidence="Resume bullet mentions 'Docker and deployment', but zero Dockerfile, docker-compose.yml, or cloud config exists in connected repositories.",
            file_path_or_url=None,
            code_snippet=None,
            project_id=None,
            project_name=None,
            status=EvidenceStatus.NOT_YET_VERIFIED,
            confidence=0.15,
            rules_applied=["RULE_CLAIM_ONLY: Listed in resume skills, but 0 deployment artifacts found in inspected code."]
        ),
        EvidenceRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            skill_name="Data Wrangling & Pipeline Engineering",
            normalized_skill="data_processing",
            claimed_source="GitHub Repository",
            observed_evidence="Pandas dataframe handling, outlier removal, and median imputation for null values.",
            file_path_or_url="https://github.com/alexchen-ml/diabetes-prediction-service/blob/main/src/preprocess.py",
            code_snippet="df['glucose'] = df['glucose'].replace(0, np.nan).fillna(df['glucose'].median())",
            project_id=project_depth.id,
            project_name=project_depth.title,
            status=EvidenceStatus.SUPPORTED,
            confidence=0.85,
            rules_applied=["RULE_SUPPORTED: Data wrangling pipeline in pandas."]
        ),
        EvidenceRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            skill_name="Git Version Control & Documentation",
            normalized_skill="version_control_docs",
            claimed_source="GitHub Repository",
            observed_evidence="34 commits with descriptive messages; comprehensive README with setup commands.",
            file_path_or_url="https://github.com/alexchen-ml/diabetes-prediction-service/blob/main/README.md",
            code_snippet="# Setup: pip install -r requirements.txt && pytest",
            project_id=project_depth.id,
            project_name=project_depth.title,
            status=EvidenceStatus.SUPPORTED,
            confidence=0.90,
            rules_applied=["RULE_SUPPORTED: Documented setup instructions and git commit cadence."]
        )
    ]

    growth_history = [
        GrowthSnapshot(
            id="snap-1",
            user_id=user_id,
            date="2026-03-15",
            readiness_score=48.0,
            evidence_completeness=50.0,
            verified_skills_count=4,
            projects_analyzed=1,
            new_competencies=["Python Programming", "Machine Learning Algorithms & Training"],
            notes="Initial assessment after basic model training script upload."
        ),
        GrowthSnapshot(
            id="snap-2",
            user_id=user_id,
            date="2026-04-20",
            readiness_score=59.5,
            evidence_completeness=75.0,
            verified_skills_count=5,
            projects_analyzed=1,
            new_competencies=["Model Serving & REST APIs"],
            notes="Added FastAPI endpoint; verified API contract."
        ),
        GrowthSnapshot(
            id="snap-3",
            user_id=user_id,
            date="2026-05-10",
            readiness_score=68.4,
            evidence_completeness=87.5,
            verified_skills_count=7,
            projects_analyzed=1,
            new_competencies=["Automated Testing & Code Quality"],
            notes="Added Pytest regression suite; validated input boundary handling."
        )
    ]

    return {
        "user_id": user_id,
        "name": "Alex Chen",
        "email": "alex.chen@university.edu",
        "target_role": "Machine Learning Engineer",
        "target_role_id": "mle",
        "degree": "B.Tech Computer Science & Engineering",
        "graduation_year": 2026,
        "sources": sources,
        "projects": [project_depth, project_depth_2],
        "evidence_records": evidence_records,
        "growth_history": growth_history
    }
